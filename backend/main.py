from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware

import numpy as np
from jose import jwt, JWTError, JWSError

from database import users_collection
from auth import hash_password, verify_password, create_access_token, SECRET_KEY
from models import RegisterRequest, LoginRequest, SwipeRequest
from recommender import update_embedding, recommend, EMB_DIM, record_swipe

app = FastAPI()

# ---------- CORS SETUP ----------
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --------------------------------

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# ---------- AUTH DEPENDENCY ----------
def get_current_user(token: str = Depends(oauth2_scheme)):
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user = users_collection.find_one({"user_id": payload["sub"]})
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
        return user
    except (JWTError, JWSError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
# ------------------------------------

@app.post("/signup")
def signup(req: RegisterRequest):
    if users_collection.find_one({"user_id": req.user_id}):
        raise HTTPException(400, "User exists")

    users_collection.insert_one({
        "user_id": req.user_id,
        "email": req.email,
        "password": hash_password(req.password),
        "embedding": np.zeros(EMB_DIM).tolist(),
        "swiped_movie_ids": []   # IMPORTANT
    })
    return {"status": "created"}

@app.post("/login")
def login(req: LoginRequest):
    user = users_collection.find_one({"user_id": req.user_id})
    if not user or not verify_password(req.password, user["password"]):
        raise HTTPException(401, "Invalid login")

    token = create_access_token({"sub": req.user_id})
    return {"access_token": token}

@app.post("/swipe")
def swipe(req: SwipeRequest, user=Depends(get_current_user)):
    new_vec = update_embedding(
        np.array(user["embedding"]),
        req.movie_id,
        req.action
    )

    users_collection.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"embedding": new_vec.tolist()}}
    )

    record_swipe(user["user_id"], req.movie_id)
    return {"status": "updated"}

@app.get("/recommendations")
def recommendations(
    n: int = 3,
    user=Depends(get_current_user)
):
    recs = recommend(user["user_id"], top_n=n)
    return recs.to_dict(orient="records")

@app.post("/logout")
def logout():
    return {"status": "logged out"}

@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "Movie Recommender API is running 🚀"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)

