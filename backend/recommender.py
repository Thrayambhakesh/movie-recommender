# recommender.py
import os
import requests
from dotenv import load_dotenv

import pickle
import numpy as np
import pandas as pd
from database import users_collection

# ---------------------------------
# LOAD EMBEDDINGS & METADATA
# ---------------------------------
with open("hybrid_item_embeddings.pkl", "rb") as f:
    ITEM_EMB = pickle.load(f)

load_dotenv()
TMDB_API_KEY = os.getenv("TMDB_API_KEY")
TMDB_IMG_BASE = "https://image.tmdb.org/t/p/w780"

_tmdb_image_cache = {}

def get_movie_image(tmdb_id: int):
    """
    Fetch backdrop image from TMDB (cached)
    """
    if tmdb_id in _tmdb_image_cache:
        return _tmdb_image_cache[tmdb_id]

    url = f"https://api.themoviedb.org/3/movie/{tmdb_id}/images"
    params = {
        "api_key": TMDB_API_KEY,
        "include_image_language": "en,null"
    }

    try:
        res = requests.get(url, params=params, timeout=4)
        res.raise_for_status()
        data = res.json()

        path = None
        if data.get("backdrops"):
            path = data["backdrops"][0]["file_path"]
        elif data.get("posters"):
            path = data["posters"][0]["file_path"]

        image_url = f"{TMDB_IMG_BASE}{path}" if path else None
        _tmdb_image_cache[tmdb_id] = image_url
        return image_url

    except Exception:
        return None



# Normalize item embeddings once
for k in ITEM_EMB:
    norm = np.linalg.norm(ITEM_EMB[k])
    if norm > 0:
        ITEM_EMB[k] = ITEM_EMB[k] / norm

# SERVING FILE (post-training)
movies = pd.read_csv("movie_metadata.csv")
movies["tmdb_id"] = movies["tmdb_id"].astype(int)

# Embedding dimension
EMB_DIM = len(next(iter(ITEM_EMB.values())))

# ---------------------------------
# UPDATE USER EMBEDDING AFTER SWIPE
# ---------------------------------
def update_embedding(user_vec, movie_id, action, lr=0.05):
    """
    Update user embedding based on swipe action
    """

    movie_vec = ITEM_EMB.get(int(movie_id))
    if movie_vec is None:
        return user_vec

    weight = {
        "right": 1.0,
        "down": 0.3,
        "left": -1.0
    }.get(action, 0.0)

    return (1 - lr) * user_vec + lr * weight * movie_vec

# ---------------------------------
# RECOMMEND TOP-N MOVIES
# ---------------------------------
def recommend(user_id, top_n):
    """
    Generate recommendations with:
    - Popularity fallback for cold start
    - Diversity-aware re-ranking
    """

    user = users_collection.find_one({"user_id": user_id})
    if not user:
        return pd.DataFrame()

    user_vec = np.array(user["embedding"])
    swiped_ids = set(user.get("swiped_movie_ids", []))

    
    if np.linalg.norm(user_vec) > 0:
        user_vec = user_vec / np.linalg.norm(user_vec)

    # ---------------------------------
    # COLD START → POPULARITY FALLBACK
    # ---------------------------------
    if np.linalg.norm(user_vec) == 0:
        fallback = (
        movies[~movies["tmdb_id"].isin(swiped_ids)]
        .sort_values("avg_rating", ascending=False)
        .head(top_n)
        .copy()
    )

        fallback["image_url"] = fallback["tmdb_id"].apply(get_movie_image)

        mark_as_recommended(user_id, fallback["tmdb_id"].tolist())
        return fallback


    # ---------------------------------
    # COMPUTE SIMILARITIES
    # ---------------------------------
    candidate_scores = []
    movie_ids = []
    embs = []

    for mid, emb in ITEM_EMB.items():
        if mid not in swiped_ids:
            movie_ids.append(mid)
            embs.append(emb)

    embs = np.array(embs)
    scores = embs @ user_vec  # dot product = cosine (after normalization)

    candidate_scores = list(zip(movie_ids, scores))
    # Sort by relevance first
    candidate_scores.sort(key=lambda x: x[1], reverse=True)
    candidate_scores = candidate_scores[:300]  # or 500

    # ---------------------------------
    # DIVERSITY PENALTY (MMR-style)
    # ---------------------------------
    selected = []
    selected_ids = []

    LAMBDA = 0.75  # relevance vs diversity tradeoff

    while len(selected_ids) < top_n and candidate_scores:
        best_score = -np.inf
        best_item = None

        for mid, relevance in candidate_scores[:50]:
            if mid in selected_ids:
                continue

            if not selected_ids:
                diversity_penalty = 0.0
            else:
                sims = [
                    np.dot(ITEM_EMB[mid], ITEM_EMB[sid])
                    for sid in selected_ids
                ]
                diversity_penalty = max(sims)

            mmr_score = LAMBDA * relevance - (1 - LAMBDA) * diversity_penalty

            if mmr_score > best_score:
                best_score = mmr_score
                best_item = mid

        if best_item is None:
            break

        selected_ids.append(best_item)
        candidate_scores = [
            (mid, score) for mid, score in candidate_scores if mid != best_item
        ]

    result = movies[movies["tmdb_id"].isin(selected_ids)]

    if result.empty:
        fallback = (
            movies[~movies["tmdb_id"].isin(swiped_ids)]
            .sort_values("avg_rating", ascending=False)
            .head(top_n)
            
        )

        # Mark fallback recommendations as seen
        mark_as_recommended(user_id, fallback["tmdb_id"].tolist())
        fallback = fallback.copy()
        fallback["image_url"] = fallback["tmdb_id"].apply(get_movie_image)
        return fallback


    #  IMPORTANT: immediately block recommended movies
    mark_as_recommended(user_id, selected_ids)

    result = result.copy()
    result["image_url"] = result["tmdb_id"].apply(get_movie_image)
    return result


def mark_as_recommended(user_id, movie_ids):
    """
    Mark recommended movies as swiped immediately
    to prevent re-recommendation.
    """
    if not movie_ids:
        return

    users_collection.update_one(
        {"user_id": user_id},
        {
            "$addToSet": {
                "swiped_movie_ids": {
                    "$each": [int(mid) for mid in movie_ids]
                }
            }
        }
    )

# ---------------------------------
# RECORD USER SWIPE
# ---------------------------------
def record_swipe(user_id, movie_id):
    """
    Store swiped movie to avoid re-recommending
    """

    users_collection.update_one(
        {"user_id": user_id},
        {"$push": {"swiped_movie_ids": int(movie_id)}}
    )
