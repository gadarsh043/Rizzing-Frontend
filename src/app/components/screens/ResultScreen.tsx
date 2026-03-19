import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Copy, Check, RefreshCw, MessageCircle, Sparkles, ChevronRight, ThumbsUp, ThumbsDown } from "lucide-react";
import { useApp } from "../../context/AppContext";

const tones = [
  { id: "Witty", emoji: "😏", color: "#a78bfa" },
  { id: "Cheesy", emoji: "🧀", color: "#fbbf24" },
  { id: "Direct", emoji: "🎯", color: "#34d399" },
  { id: "Playful", emoji: "😄", color: "#60a5fa" },
  { id: "Mysterious", emoji: "🌙", color: "#f472b6" },
  { id: "Bold", emoji: "🔥", color: "#fb923c" },
];


export const ResultScreen: React.FC = () => {
  const navigate = useNavigate();
  const { selectedTone, setSelectedTone, uploadedImages, generatedRizz, ocrText, conversations, setConversations } = useApp();
  const [copied, setCopied] = useState(false);
  const [currentLine, setCurrentLine] = useState(generatedRizz || "");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [rating, setRating] = useState<"up" | "down" | null>(null);
  const [showToast, setShowToast] = useState(false);
  const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:5001';

  const fetchLineForTone = async (tone: string) => {
    if (!ocrText) return; // No OCR text = no personalization possible
    setIsRegenerating(true);
    setRating(null);
    try {
      const res = await fetch(`${apiUrl}/generate-line`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ocrText, tone }),
      });
      const data = await res.json();
      if (data.line) setCurrentLine(data.line);
    } catch (err) {
      console.error('Failed to generate tone line:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleToneChange = (tone: string) => {
    setSelectedTone(tone);
    fetchLineForTone(tone);
  };

  const handleRegenerate = () => {
    fetchLineForTone(selectedTone);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentLine).catch(() => {});
    setCopied(true);
    setShowToast(true);
    setTimeout(() => {
      setCopied(false);
      setShowToast(false);
    }, 2000);
  };

  const profileImg = uploadedImages[0]?.url || "https://images.unsplash.com/photo-1701884691134-5eb2211ba6fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400";

  return (
    <div className="relative min-h-full flex flex-col px-5 pt-14 pb-6 screen-enter">
      {/* Background orbs */}
      <div
        className="orb w-72 h-72 -top-10 left-1/2 -translate-x-1/2 opacity-25"
        style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }}
      />

      {/* Header */}
      <div className="relative mb-8">
        <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          Your wingman says...
        </p>
        <h1
          className="text-2xl"
          style={{ fontWeight: 700, color: "white", letterSpacing: "-0.5px" }}
        >
          Here's your{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #a78bfa, #f472b6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Rizz ✨
          </span>
        </h1>
      </div>

      {/* Profile context strip */}
      {uploadedImages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6 px-4 py-3 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex -space-x-2">
            {uploadedImages.slice(0, 3).map((img, i) => (
              <img
                key={img.id}
                src={img.url}
                className="w-9 h-9 rounded-xl object-cover border-2"
                style={{ borderColor: "#050510" }}
              />
            ))}
          </div>
          <div>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>
              Based on {uploadedImages.length} screenshot{uploadedImages.length > 1 ? "s" : ""}
            </p>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
              AI analyzed photos + bio
            </p>
          </div>
          <button
            onClick={() => navigate("/app/home")}
            className="ml-auto text-xs flex items-center gap-1 transition-all active:scale-95"
            style={{ color: "#a78bfa" }}
          >
            Edit <ChevronRight size={12} />
          </button>
        </motion.div>
      )}

      {/* Tone Selector */}
      <div className="mb-5">
        <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
          TONE
        </p>
        <div className="flex gap-2 flex-wrap">
          {tones.map((tone) => (
            <motion.button
              key={tone.id}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleToneChange(tone.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all duration-200"
              style={
                selectedTone === tone.id
                  ? {
                      background: `${tone.color}25`,
                      border: `1px solid ${tone.color}60`,
                      color: tone.color,
                      fontWeight: 600,
                      boxShadow: `0 0 16px ${tone.color}30`,
                    }
                  : {
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.4)",
                    }
              }
            >
              <span>{tone.emoji}</span>
              <span>{tone.id}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Rizz Card */}
      <AnimatePresence mode="wait">
        {isRegenerating ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-3xl p-6 mb-5"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              minHeight: 180,
            }}
          >
            <div className="space-y-3">
              <div className="shimmer h-4 rounded-full w-full" />
              <div className="shimmer h-4 rounded-full w-4/5" />
              <div className="shimmer h-4 rounded-full w-3/5" />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={currentLine}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative rounded-3xl p-6 mb-5 overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(219,39,119,0.08) 100%)",
              border: "1px solid rgba(139,92,246,0.25)",
              boxShadow:
                "0 0 40px rgba(139,92,246,0.15), 0 0 80px rgba(236,72,153,0.08)",
            }}
          >
            {/* Subtle shimmer background */}
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(167,139,250,0.15) 0%, transparent 70%)",
              }}
            />

            {/* Quote mark */}
            <div
              className="text-6xl leading-none mb-2 -mt-2 -ml-1 opacity-20"
              style={{ color: "#a78bfa", fontFamily: "Georgia, serif" }}
            >
              "
            </div>

            <p
              className="relative text-base leading-relaxed mb-4"
              style={{ color: "rgba(255,255,255,0.9)", fontWeight: 400, lineHeight: 1.7 }}
            >
              {currentLine}
            </p>

            {/* Tone badge */}
            <div className="flex items-center justify-between">
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                style={{
                  background: "rgba(167,139,250,0.12)",
                  border: "1px solid rgba(167,139,250,0.2)",
                  color: "#a78bfa",
                  fontWeight: 500,
                }}
              >
                <Sparkles size={11} />
                {tones.find((t) => t.id === selectedTone)?.emoji} {selectedTone} tone
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRating("up")}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90"
                  style={{
                    background:
                      rating === "up"
                        ? "rgba(52,211,153,0.2)"
                        : "rgba(255,255,255,0.05)",
                    border:
                      rating === "up"
                        ? "1px solid rgba(52,211,153,0.4)"
                        : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <ThumbsUp
                    size={13}
                    style={{ color: rating === "up" ? "#34d399" : "rgba(255,255,255,0.3)" }}
                  />
                </button>
                <button
                  onClick={() => setRating("down")}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90"
                  style={{
                    background:
                      rating === "down"
                        ? "rgba(248,113,113,0.2)"
                        : "rgba(255,255,255,0.05)",
                    border:
                      rating === "down"
                        ? "1px solid rgba(248,113,113,0.4)"
                        : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <ThumbsDown
                    size={13}
                    style={{ color: rating === "down" ? "#f87171" : "rgba(255,255,255,0.3)" }}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl transition-all duration-300"
          style={
            copied
              ? {
                  background: "rgba(52,211,153,0.15)",
                  border: "1px solid rgba(52,211,153,0.4)",
                  boxShadow: "0 0 20px rgba(52,211,153,0.2)",
                }
              : {
                  background: "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)",
                  boxShadow: "0 8px 24px rgba(124,58,237,0.4)",
                }
          }
        >
          {copied ? (
            <>
              <Check size={18} style={{ color: "#34d399" }} />
              <span style={{ color: "#34d399", fontWeight: 600 }}>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={18} style={{ color: "white" }} />
              <span style={{ color: "white", fontWeight: 600 }}>Copy Line</span>
            </>
          )}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="w-14 flex items-center justify-center rounded-2xl transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <motion.div
            animate={isRegenerating ? { rotate: 360 } : { rotate: 0 }}
            transition={
              isRegenerating
                ? { duration: 0.8, repeat: Infinity, ease: "linear" }
                : {}
            }
          >
            <RefreshCw size={18} style={{ color: "rgba(255,255,255,0.5)" }} />
          </motion.div>
        </motion.button>
      </div>

      {/* Go to Chat */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          const newId = `convo-${Date.now()}`;
          const newConvo = {
            id: newId,
            person: {
              name: "Your Match",
              age: 24,
              photo: profileImg,
              bio: "",
              interests: ["Photography", "Travel", "Coffee"],
              isOnline: true,
              lastSeen: "Just now",
              matchPercent: 98,
            },
            messages: currentLine ? [{
              id: `msg-${Date.now()}`,
              text: currentLine,
              isUser: true,
              time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
            }] : [],
            unreadCount: 0,
          };
          setConversations([newConvo, ...conversations]);
          navigate(`/app/chat/${newId}`);
        }}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl transition-all duration-200"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <MessageCircle size={16} style={{ color: "rgba(255,255,255,0.4)" }} />
        <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
          Continue in Chat
        </span>
        <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
      </motion.button>

      {/* Copied toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl flex items-center gap-2 z-50"
            style={{
              background: "rgba(52,211,153,0.15)",
              border: "1px solid rgba(52,211,153,0.3)",
              backdropFilter: "blur(20px)",
            }}
          >
            <Check size={14} style={{ color: "#34d399" }} />
            <span className="text-sm" style={{ color: "#34d399", fontWeight: 500 }}>
              Opening line copied to clipboard!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};