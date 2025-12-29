import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { SwipeCards } from "./components/ui/SwipeCards.jsx";

export default function MovieApp() {
  const [deck, setDeck] = useState([]);        // cards on screen (max 3)
  const [buffer, setBuffer] = useState([]);    // prefetched unseen cards
  const [isLoading, setIsLoading] = useState(false);

  const swipedIdsRef = useRef(new Set());
  const fetchInProgressRef = useRef(false);
  const firstBatchDoneRef = useRef(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const forceLogout = useCallback(() => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  }, [navigate]);

  const fetchRecommendations = useCallback(async () => {
  if (!token || fetchInProgressRef.current) return;

  fetchInProgressRef.current = true;
  setIsLoading(true);

  try {
    const res = await axios.get(
  "http://127.0.0.1:8000/recommendations",
  {
    params: { n: deck.length === 0 && buffer.length === 0 ? 6 : 3 },
    headers: { Authorization: `Bearer ${token}` }
  }
);


    const formatted = res.data
      .filter(m => !swipedIdsRef.current.has(m.tmdb_id))
      .map(movie => ({
        uid: `${movie.tmdb_id}-${Date.now()}-${Math.random()}`,
        id: movie.tmdb_id,
        name: movie.title,
        year: movie.year,
        rating: movie.avg_rating,
        overview: movie.overview || "",
        image: movie.image_url,
        genres: movie.genres
          ? movie.genres.split(",").map(g => g.trim())
          : [],
      }));

    setBuffer(prev => {
  //  FIRST FETCH → TAKE 6
  if (!firstBatchDoneRef.current) {
    firstBatchDoneRef.current = true;
    return [...formatted.slice(0, 6)];
  }

  //  AFTER THAT → TAKE ONLY WHAT IS NEEDED (MAX 3)
  const remainingSlots = 3 - prev.length;
  return remainingSlots > 0
    ? [...prev, ...formatted.slice(0, remainingSlots)]
    : prev;
});

  } catch (err) {
    if (err.response?.status === 401) {
      forceLogout();
    } else {
      console.error("Fetch failed", err);
    }
  } finally {
    fetchInProgressRef.current = false;
    setIsLoading(false);
  }
}, [token, forceLogout]);


  // Initial load
  useEffect(() => {
    if (!token) {
      forceLogout();
      return;
    }
    fetchRecommendations();
  }, [fetchRecommendations, token, forceLogout]);

  // Load next deck when current deck is empty
  useEffect(() => {
  // Promote buffer → deck
  if (deck.length === 0 && buffer.length >= 3) {
    setDeck(buffer.slice(0, 3));
    setBuffer(buffer.slice(3));
    return;
  }

  // Keep buffer filled
  if (buffer.length < 3 && !fetchInProgressRef.current) {
    fetchRecommendations();
  }
}, [deck.length, buffer.length, fetchRecommendations]);

  const handleSwipe = async (movieId, action) => {
    swipedIdsRef.current.add(movieId);
    setDeck(prev => prev.filter(c => c.id !== movieId));

    try {
      await axios.post(
        "http://127.0.0.1:8000/swipe",
        { movie_id: movieId, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Swipe failed", err);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <button
        onClick={forceLogout}
        className="
          absolute top-4 right-4 z-50
          px-2 py-1
          text-[11px] font-medium
          text-white/70
          border border-white/20
          rounded-md
          backdrop-blur-sm
          hover:text-white
          hover:border-white/40
          hover:bg-white/5
          transition-all duration-200
        "
      >
        Logout
      </button>
      {/* Swipe Instruction */}
<div
  className="
    absolute top-4 left-1/2 -translate-x-1/2 z-40
    px-4 py-1.5
    text-xs sm:text-sm font-medium
    text-blue-100
    pointer-events-none
    select-none
  "
>
  Swipe to find movies you’ll love
</div>

      <SwipeCards
        data={deck}
        onSwipe={handleSwipe}
        isLoading={isLoading}
      />
    </div>
  );
}
