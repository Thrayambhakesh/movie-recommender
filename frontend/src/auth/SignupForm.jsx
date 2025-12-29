import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

export default function SignupForm() {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!strongPasswordRegex.test(password)) {
      setError(
        "Password should be of 8 characters, must include uppercase, lowercase, number & special character."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post("http://127.0.0.1:8000/signup", {
        user_id: userId,
        email,
        password,
      });

      setSuccess("User created! Logging you in…");

      const loginRes = await axios.post("http://127.0.0.1:8000/login", {
        user_id: userId,
        password,
      });

      localStorage.setItem("token", loginRes.data.access_token);

      setTimeout(() => {
        navigate("/recommendations");
      }, 1000);
    } catch (err) {
      console.error(err);
      setError("Failed to signup. User may already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* 🔹 Smaller card */
    <div className="w-[15rem] sm:w-[16rem] text-white text-sm">
      <h2 className="mb-3 text-base font-semibold">Sign Up</h2>

      <form className="flex flex-col gap-1.5" onSubmit={handleSubmit}>
        <input
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
          className="rounded bg-black/40 px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-white/40"
        />

        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          {loading ? "Creating..." : "Sign Up"}
        </button>
      </form>

      {success && (
        <p className="mt-2 text-[11px] text-green-400">{success}</p>
      )}
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
