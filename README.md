# 🎬 CineFind — Real-Time Hybrid Movie Recommendation System

CineFind is a **real-time, swipe-based movie recommendation system** built by a cinephile for cinephiles.  
It combines **content-based filtering** with collaborative learning concepts to dynamically adapt to a user’s evolving taste.

Unlike static recommender systems, CineFind **updates user embeddings live** based on swipe feedback — learning *within the same session*.

---

## 🚀 Features

- 🔀 **Hybrid Recommendation Engine**
  - Content-based similarity using movie embeddings
  - Real-time user preference learning via swipe feedback
- 🧠 **Live User Embedding Updates**
  - Right / Left / Neutral swipes update the user vector instantly
- 🎥 **Swipe-Based UI**
  - Tinder-style interactions for intuitive discovery
- 🔐 **Authentication & Sessions**
  - Secure signup/login with session handling
- 🌐 **TMDB API Integration**
  - Dynamic movie metadata and high-quality images
- 📊 **Cold-Start Handling**
  - Popularity-based fallback for new users

---

## 🧠 Recommendation Logic (High Level)

1. Each movie has a normalized embedding vector.
2. Each user maintains a preference embedding.
3. On swipe:
   - Right → positive weight
   - Left → negative weight
   - Down → weak positive signal
4. User embedding is updated using an online learning rule.
5. Recommendations are generated using cosine similarity.
6. Diversity-aware re-ranking prevents overly similar suggestions.

This allows the system to **learn continuously without retraining models**.

---

## 🛠 Tech Stack

### Backend
- **Python**
- **FastAPI**
- **MongoDB**
- NumPy, Pandas, Scikit-learn
- JWT Authentication
- TMDB API

### Frontend
- **React**
- **Framer Motion**
- Gesture-based swipe animations

---

## 📂 Project Structure

movie-recommender/
│
├── backend/
│ ├── main.py
│ ├── recommender.py
│ ├── database.py
│ ├── auth/
│ ├── hybrid_item_embeddings.pkl
│ └── movie_metadata.csv
│
├── frontend/
│ ├── src/
│ └── public/
│
└── README.md

### Backend
bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

### Frontend
cd frontend
npm install
npm start

🎥 Demo
A full demo video showcasing real-time recommendations and swipe learning is available on LinkedIn.

💡 Motivation
Most recommendation systems feel opaque and static.
CineFind was built to explore interactive ML systems where users actively shape the model through natural actions.
