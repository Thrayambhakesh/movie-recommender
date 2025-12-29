import SignupForm from "../auth/SignupForm.jsx";
import { motion, useScroll, useTransform } from "framer-motion";
import bgImage from "../assets/SignupPhoto.avif";

export default function SignupPage() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 300], [0, -50]);
  const textY = useTransform(scrollY, [0, 300], [0, -30]);

  return (
    <div className="relative min-h-screen overflow-hidden text-white bg-black">

      {/* ───────── BACKGROUND IMAGE ───────── */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${bgImage})`,
        }}
      />

      {/* ───────── FLOATING IDENTITY WORDS ───────── */}
      {["Genres", "Preferences", "Taste", "Identity"].map((word, i) => (
        <motion.span
          key={word}
          className="absolute text-white/10 text-xl sm:text-3xl font-medium select-none"
          style={{
            top: `${20 + i * 14}%`,
            left: `${i % 2 === 0 ? 65 : 8}%`,
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

      {/* ───────── SIGNUP FORM (MIDDLE RIGHT) ───────── */}
      <motion.div
        style={{ y: heroY }}
        className="
          absolute top-1/2 right-4 sm:right-12
          -translate-y-1/2
          scale-[0.92] sm:scale-100
        "
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.9 }}
      >
        <SignupForm />
      </motion.div>

      {/* ───────── STORY / CONTEXT (MIDDLE LEFT) ───────── */}
      <motion.div
        style={{ y: textY }}
        className="
          absolute top-1/2 left-4 sm:left-12
          -translate-y-1/2
          max-w-xs sm:max-w-xl
        "
      >
        <motion.p
          className="text-sm sm:text-base text-white/85"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          This is where your taste begins to take shape.
        </motion.p>

        <motion.p
          className="mt-2 text-sm sm:text-base text-white/75"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          Every swipe, skip, and like adds another layer to your profile.
        </motion.p>

        <motion.p
          className="mt-4 italic text-xs sm:text-sm text-white/60"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          Sign up once — CineFind evolves with you.
        </motion.p>
      </motion.div>
    </div>
  );
}
