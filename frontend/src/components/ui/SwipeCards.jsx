import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

/* ---------------------------------------
   Loading Screen Component
--------------------------------------- */
const messages = [
  "Scanning genres…",
  "Reading reviews…",
  "Understanding your taste…",
  "Matching moods and vibes…",
  "Curating your watchlist…",
  "Almost there…",
];

function LoadingScreen() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const intervals = [3000, 3000, 3000, 3000, 3000, 3000];
    let timeout;
    let i = 0;

    const run = () => {
      timeout = setTimeout(() => {
        i = Math.min(i + 1, messages.length - 1);
        setIndex(i);
        run();
      }, intervals[i] || 2000);
    };

    run();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white shadow-[0_0_14px_rgba(255,255,255,0.4)]" />
        <div className="text-center transition-opacity duration-300">
          <p className="text-sm font-semibold text-white">
            Loading personalised movies for you!
          </p>
          <p className="mt-1 text-xs text-white/70">
            {messages[index]}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------
   Swipe Cards Wrapper
--------------------------------------- */
export function SwipeCards({ data, onSwipe, isLoading }) {
  if ((!Array.isArray(data) || data.length === 0) && isLoading) {
    return <LoadingScreen />;
  }

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-white/60">
        No recommendations found
      </div>
    );
  }

  return (
    <div className="grid h-full w-full place-items-center overflow-hidden relative">
      {data.map((card) => (
        <SwipeCard
          key={card.uid}
          card={card}
          cards={data}
          onSwipe={onSwipe}
        />
      ))}
    </div>
  );
}

/* ---------------------------------------
   Individual Card
--------------------------------------- */
function SwipeCard({ card, cards, onSwipe }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const index = cards.findIndex(c => c.uid === card.uid);
  const topIndex = cards.length - 1;
  const isFront = index === topIndex;

  /* Rotation */
  const rotateRaw = useTransform(x, [-150, 150], [-18, 18]);
  const rotate = useTransform(() => {
    const stackIndex = topIndex - index;
    const offset =
      stackIndex === 0 ? 0 : stackIndex % 2 === 0 ? -6 : 6;

    return `${rotateRaw.get() + offset}deg`;
  });

  /* Glow Opacity */
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-150, -50], [1, 0]);
  const watchOpacity = useTransform(y, [50, 150], [0, 1]);

  /* Scale */
  const scale = useTransform(
    [x, y],
    ([lx, ly]) => (Math.abs(lx) > 100 || ly > 100 ? 1.04 : 1)
  );

  const playSound = () => {
    const audio = new Audio("/swipe.mp3");
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  const handleDragEnd = (_, info) => {
    const offsetX = x.get();
    const offsetY = y.get();
    const velocityX = info.velocity.x;
    const velocityY = info.velocity.y;

    const DIST = 120;
    const VELOCITY = 800;

    if (offsetX > DIST || velocityX > VELOCITY) {
      playSound();
      onSwipe(card.id, "right");
      return;
    }

    if (offsetX < -DIST || velocityX < -VELOCITY) {
      playSound();
      onSwipe(card.id, "left");
      return;
    }

    if (offsetY > DIST || velocityY > VELOCITY) {
      playSound();
      onSwipe(card.id, "down");
      return;
    }

    animate(x, 0, { type: "spring", stiffness: 300, damping: 25 });
    animate(y, 0, { type: "spring", stiffness: 300, damping: 25 });
  };

  return (
    <motion.div
      className="
        absolute origin-bottom rounded-xl overflow-hidden
        flex flex-col justify-between shadow-xl
        w-[65vw] sm:w-[18rem] max-w-[22rem]
        h-[60vh] sm:h-[24rem] max-h-[32rem]
      "
      style={{
        x,
        y,
        rotate,
        scale,
        zIndex: index,
        pointerEvents: isFront ? "auto" : "none",
      }}
      animate={{
        scale: isFront ? 1 : 0.97,
        y: isFront ? 0 : 14,
      }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      drag={isFront}
      dragElastic={0.15}
      dragConstraints={{ left: -200, right: 200, top: 0, bottom: 200 }}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 1.06 }}
    >
      {/* Background image */}
<div
  className="absolute inset-0 bg-cover bg-center"
  style={{
    backgroundImage: card.image
      ? `url(${card.image})`
      : "linear-gradient(135deg, #1f2937, #111827)",
  }}
/>

{/* Dark gradient overlay */}
<div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
      {/* Glow layers unchanged */}
      <motion.div style={{ opacity: likeOpacity }} className="pointer-events-none absolute inset-0 rounded-xl shadow-[0_0_40px_10px_rgba(34,197,94,0.6)]" />
      <motion.div style={{ opacity: nopeOpacity }} className="pointer-events-none absolute inset-0 rounded-xl shadow-[0_0_40px_10px_rgba(239,68,68,0.6)]" />
      <motion.div style={{ opacity: watchOpacity }} className="pointer-events-none absolute inset-0 rounded-xl shadow-[0_0_40px_10px_rgba(59,130,246,0.6)]" />

      {/* Content unchanged */}
      <div className="relative z-10 p-4 text-white">
        <h2 className="text-sm font-semibold text-white">

          {card.name} ({card.year})
        </h2>

<p className="mt-1 text-xs text-white/80">

          ⭐ {Math.round(card.rating * 10) / 10}
        </p>

<p className="mt-2 text-xs text-white/70 line-clamp-6 leading-snug">

          {card.overview}
        </p>

        <div className="mt-3 flex flex-wrap gap-1">
          {card.genres?.slice(0, 3).map((g) => (
            <span key={g} className="text-[10px] bg-white/15 text-white px-2 py-0.5 rounded-full backdrop-blur">
              {g}
            </span>
          ))}
        </div>
      </div>
      
      {/* Swipe instructions */}
{isFront && (
  <motion.div
    className="
      absolute -bottom-0 left-1/2 -translate-x-1/2
      px-3 py-1 rounded-full
      text-[10px] font-medium
      bg-black/60 text-white
      backdrop-blur-md
      shadow-md
      select-none
    "
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >     
    ← Dislike · ↓ Watched · → Like 
  </motion.div>
)}


    </motion.div>
  );
}
