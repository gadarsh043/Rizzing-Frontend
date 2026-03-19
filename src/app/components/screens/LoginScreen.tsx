import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Sparkles, Zap, Heart, MessageCircle } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "../../../lib/firebase";

const floatingFeatures = [
  { icon: Sparkles, label: "AI-Powered Lines", color: "#a78bfa" },
  { icon: Zap, label: "Instant Rizz", color: "#f472b6" },
  { icon: Heart, label: "Real Connections", color: "#fb923c" },
  { icon: MessageCircle, label: "Smart Replies", color: "#34d399" },
];

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useApp();
  const [loading, setLoading] = useState(false);

  // If user is already signed in, skip login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        navigate("/app/home", { replace: true });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      setIsAuthenticated(true);
      navigate("/app/home");
    } catch(err) {
      console.error("Auth error", err);
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-start justify-center overflow-hidden"
      style={{ background: "#050510" }}
    >
      {/* Full-screen mobile view */}
      <div className="relative w-full max-w-[430px] min-h-screen flex flex-col overflow-hidden">
        {/* Animated background orbs */}
        <div
          className="orb w-80 h-80 -top-20 -right-20 opacity-30"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }}
        />
        <div
          className="orb w-96 h-96 top-1/3 -left-32 opacity-20"
          style={{ background: "radial-gradient(circle, #db2777, transparent)" }}
        />
        <div
          className="orb w-64 h-64 bottom-32 right-0 opacity-20"
          style={{ background: "radial-gradient(circle, #0891b2, transparent)" }}
        />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Content */}
        <div className="relative flex flex-col flex-1 px-6 pt-16 pb-12">
          {/* Logo / Brand */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col items-center mt-8 mb-10"
          >
            {/* Logo mark */}
            <div className="relative mb-5">
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)",
                  boxShadow: "0 0 60px rgba(139,92,246,0.6), 0 0 100px rgba(236,72,153,0.3)",
                }}
              >
                <span className="text-4xl">💬</span>
              </div>
              {/* Orbiting sparkle */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-3"
              >
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
                  style={{
                    background: "linear-gradient(135deg, #a78bfa, #f472b6)",
                    boxShadow: "0 0 8px rgba(167,139,250,0.8)",
                  }}
                />
              </motion.div>
            </div>

            {/* App name */}
            <h1
              className="text-5xl mb-2"
              style={{
                fontWeight: 800,
                background: "linear-gradient(135deg, #c4b5fd 0%, #f0abfc 40%, #fb7185 80%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-1px",
              }}
            >
              Rizzing
            </h1>

            <p
              className="text-sm text-center max-w-[260px] leading-relaxed"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              Your AI wingman for crafting perfect opening lines and clever replies
            </p>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="grid grid-cols-2 gap-3 mb-12"
          >
            {floatingFeatures.map((feat, i) => (
              <motion.div
                key={feat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="glass-card rounded-2xl p-4 flex items-center gap-3"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: `${feat.color}20`,
                    border: `1px solid ${feat.color}40`,
                  }}
                >
                  <feat.icon size={16} style={{ color: feat.color }} />
                </div>
                <span
                  className="text-xs leading-tight"
                  style={{ color: "rgba(255,255,255,0.7)", fontWeight: 500 }}
                >
                  {feat.label}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col items-center gap-2 mb-10"
          >
            <div className="flex -space-x-2">
              {["#f472b6", "#a78bfa", "#34d399", "#fb923c", "#60a5fa"].map((c, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs"
                  style={{
                    background: `linear-gradient(135deg, ${c}40, ${c}20)`,
                    borderColor: c,
                    color: c,
                    fontWeight: 700,
                  }}
                >
                  {["S", "A", "M", "J", "K"][i]}
                </div>
              ))}
            </div>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              <span style={{ color: "#a78bfa", fontWeight: 600 }}>Many </span>
              people are rizzing up their dating game today
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col gap-3"
          >
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="relative w-full rounded-2xl py-4 px-6 flex items-center justify-center gap-3 overflow-hidden transition-all duration-300 active:scale-95"
              style={{
                background: "rgba(255,255,255,0.95)",
                boxShadow: "0 8px 32px rgba(255,255,255,0.1)",
              }}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 rounded-full border-2 border-purple-600 border-t-transparent"
                />
              ) : (
                <>
                  {/* Google G */}
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span style={{ color: "#1a1a2e", fontWeight: 600, fontSize: 16 }}>
                    Continue with Google
                  </span>
                </>
              )}
            </button>

            <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
              By continuing, you agree to our Terms & Privacy Policy
            </p>
          </motion.div>
        </div>

        {/* Bottom tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="relative px-6 pb-8 text-center"
        >
          <p className="text-xs italic" style={{ color: "rgba(255,255,255,0.2)" }}>
            "Your first message shouldn't take 20 minutes to write 😅"
          </p>
        </motion.div>
      </div>
    </div>
  );
};