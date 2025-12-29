import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://127.0.0.1:8000/login", {
        user_id: userId,
        password,
      });
      localStorage.setItem("token", res.data.access_token);
      navigate("/recommendations");
    } catch (err) {
      console.error(err);
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* 🔹 Same size & style as signup */
    <div className="w-[15rem] sm:w-[16rem] text-white text-sm">
      <h2 className="mb-3 text-base font-semibold">Login</h2>

      <form className="flex flex-col gap-1.5" onSubmit={handleSubmit}>
        <input
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
          className="rounded bg-black/40 px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-white/40"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="rounded bg-black/40 px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-white/40"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded bg-white/10 py-1.5 text-xs hover:bg-white/20 transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {error && (
        <p className="mt-2 text-[11px] text-red-400">{error}</p>
      )}

      <button
        className="mt-3 text-[11px] underline opacity-70 hover:opacity-100"
        onClick={() => navigate("/")}
        disabled={loading}
      >
        Back
      </button>
    </div>
  );
}
