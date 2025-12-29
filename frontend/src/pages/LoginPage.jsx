import LoginForm from "../auth/LoginForm.jsx";
import { motion, useScroll, useTransform } from "framer-motion";
import bgImage from "../assets/LoginPhoto.avif";
export default function LoginPage() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 300], [0, -50]);
  const textY = useTransform(scrollY, [0, 300], [0, -30]);

  return (
    <div className="relative min-h-screen overflow-hidden text-white bg-black">

      {/* ───────── BACKGROUND IMAGE (UPDATED) ───────── */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            `url(${bgImage})`,
        }}
      />
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_35%,rgba(0,0,0,0.85))]" />
      {/* Film grain */}
      <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* ───────── FLOATING SIGNAL WORDS ───────── */}
      {["History", "Taste", "Patterns", "Preferences"].map((word, i) => (
        <motion.span
          key={word}
          className="absolute text-white/10 text-xl sm:text-3xl font-medium select-none"
          style={{
            top: `${22 + i * 14}%`,
            left: `${i % 2 === 0 ? 8 : 70}%`,
          }}
          animate={{ y: [0, -14, 0] }}
          transition={{
            duration: 6 + i,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {word}
        </motion.span>
      ))}

      {/* ───────── LOGIN FORM (TOP RIGHT) ───────── */}
      <motion.div
        style={{ y: heroY }}
        className="absolute top-4 right-4 sm:top-10 sm:right-12 scale-[0.92] sm:scale-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <LoginForm />
      </motion.div>

      {/* ───────── STORY / EXPLANATION (BOTTOM LEFT) ───────── */}
      <motion.div
        style={{ y: textY }}
        className="absolute bottom-6 left-4 sm:bottom-12 sm:left-12 max-w-xs sm:max-w-xl"
      >
        <motion.p
          className="text-sm sm:text-base text-white/85"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Every interaction you make becomes a signal.
        </motion.p>

        <motion.p
          className="mt-2 text-sm sm:text-base text-white/75"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          Likes, skips, genres, and watch patterns quietly shape what comes next!!
        </motion.p>

        <motion.p
          className="mt-4 italic text-xs sm:text-sm text-white/60"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          Login — and let the Algorithm do the thinking.
        </motion.p>
      </motion.div>
    </div>
  );
}
