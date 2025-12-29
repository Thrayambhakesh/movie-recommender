import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

export default function WelcomePage() {
  const navigate = useNavigate();

  /* ───────── INTRO LOADER ───────── */
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1600);
    return () => clearTimeout(timer);
  }, []);

  /* ───────── TYPING EFFECT ───────── */
  const fullText =
    "Discover movies tailored to your taste - powered by a live AI model that evolves with your likes, skips, and watch history!";
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    if (loading) return;

    let i = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i + 1));
      i++;
      if (i === fullText.length) clearInterval(interval);
    }, 28);

    return () => clearInterval(interval);
  }, [loading]);

  /* ───────── PARALLAX ───────── */
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 300], [0, -60]);
  const wordsY = useTransform(scrollY, [0, 300], [0, -120]);
  const bottomY = useTransform(scrollY, [0, 300], [0, -40]);

  return (
    <div className="relative min-h-screen overflow-hidden text-white bg-black">

      {/* ───────── INTRO CINEMATIC ───────── */}
      {loading && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 1.2, duration: 0.4 }}
        >
          <motion.h1
            className="text-xl tracking-widest text-white/80"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            Hollywood presents
          </motion.h1>
        </motion.div>
      )}

      {/* ───────── BACKGROUND ───────── */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-900 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(255,255,255,0.07),transparent_45%)]" />
      <div className="absolute inset-0 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* ───────── FLOATING GENRES ───────── */}
      {["Drama", "Thriller", "Sci-Fi", "Romance", "Mystery", "Action"].map(
        (word, i) => (
          <motion.span
            key={word}
            className="absolute text-white/10 text-xl sm:text-3xl font-medium select-none"
            style={{y: wordsY,
              top: `${18 + i * 12}%`,
              left: `${i % 2 === 0 ? 6 : 72}%`,
            }}
            animate={{ y: [0, -16, 0] }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {word}
          </motion.span>
        )
      )}

      {/* ───────── HERO ───────── */}
      <motion.div
        style={{ y: heroY }}
        className="relative z-10 flex flex-col justify-center min-h-screen px-6 sm:px-14"
      >
        <motion.h1
          className="text-4xl sm:text-6xl font-semibold tracking-tight"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.9 }}
        >
          Cine<span className="italic font-light">Find</span>
        </motion.h1>

        <p className="mt-4 max-w-lg text-sm sm:text-base text-white/75 min-h-[3rem]">
          {typedText}
        </p>

        <motion.div
          className="mt-8 flex gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <motion.button
            onClick={() => navigate("/signup")}
            className="px-2.5 py-1 rounded-md bg-white text-black text-[10px] font-medium"
            whileHover={{
              scale: 1.08,
              boxShadow: "0 0 18px rgba(255,255,255,0.35)",
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
          >
            Start Discovering
          </motion.button>

          <motion.button
            onClick={() => navigate("/login")}
            className="px-2.5 py-1 rounded-md border border-white/40 text-[10px]"
            whileHover={{
              scale: 1.06,
              backgroundColor: "rgba(255,255,255,0.06)",
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
          >
            I already have an account
          </motion.button>
        </motion.div>
      </motion.div>

      {/* ───────── BOTTOM STORY ───────── */}
      <motion.div
        style={{ y: bottomY }}
        className="absolute bottom-6 left-6 sm:left-14 max-w-md text-[10px] sm:text-[11px] text-white/70"
      >
        Ever scrolled endlessly, unsure what to watch on a movie night?
        <br />
        <span className="italic text-white/80">
          CineFind learns your taste and decides for you!
        </span>

        <div className="mt-2 italic text-blue-400 text-[10px]">
          “A recommendation engine built for cinephiles, by a cinephile.”
        </div>
      </motion.div>
    </div>
  );
}
