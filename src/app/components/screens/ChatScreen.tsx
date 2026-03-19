import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Send,
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  Zap,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { useParams, useNavigate } from "react-router";
import { useApp } from "../../context/AppContext";

/* ─── Types ──────────────────────────────────────────────── */
interface WingmanMessage {
  id: string;
  side: "her" | "suggested";
  text: string;
  time: string;
  copied?: boolean;
}

/* ─── AI reply pools keyed loosely to topic keywords ─────── */
const REPLY_POOLS: string[][] = [
  [
    "Okay that is genuinely the most intriguing thing I've read today. Tell me everything 👀",
    "I love that — most people would never say that out loud. I appreciate you 😄",
    "Wait, this needs a follow-up. How did that even start?",
  ],
  [
    "That's such a good vibe honestly. We clearly have similar taste in what matters 🙌",
    "Okay I wasn't expecting that answer and now I'm even more curious about you",
    "Low-key that's exactly what I'd say too — we might be the same person 😅",
  ],
  [
    "Zion in spring is on another level. Have you done the Narrows yet? It's absolutely insane",
    "That trail is *elite* taste. Do you prefer sunrise starts or evening golden hour?",
    "Blue Ridge is stunning. The overlook on the Appalachian connector actually made me stop breathing for a second",
  ],
  [
    "Photography + vinyl is genuinely the most aesthetic lifestyle combo. Do you develop your own film?",
    "I literally just started a vinyl collection — what was your first record?",
    "Street or travel photography? Either way I need to see your work 📷",
  ],
  [
    "Okay farmers market discourse is my love language. Heirloom tomatoes or bust 🍅",
    "A fado singer who performs only at 3am in unmarked locations is the most cinematic thing ever",
    "45 countries and you picked Georgia the country — immediately elevated you in my ranking 🍷",
  ],
  [
    "That's honestly kind of iconic ngl. I'd never have the confidence but I respect it so much 😂",
    "Okay you just described my dream weekend. Can I come?",
    "This is either the best idea or the worst and I genuinely cannot tell — let's do it",
  ],
];

function pickReply(input: string): string {
  const lower = input.toLowerCase();
  let pool = REPLY_POOLS[Math.floor(Math.random() * REPLY_POOLS.length)];

  if (/hik|trail|zion|mountain|ridge/.test(lower))   pool = REPLY_POOLS[2];
  else if (/photo|vinyl|record|music/.test(lower))    pool = REPLY_POOLS[3];
  else if (/food|bak|market|chef|cook/.test(lower))   pool = REPLY_POOLS[4];
  else if (/travel|country|trip|abroad/.test(lower))  pool = REPLY_POOLS[4];

  return pool[Math.floor(Math.random() * pool.length)];
}

function now() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/* ─── Component ─────────────────────────────────────────── */
export const ChatScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { conversations, setConversations } = useApp();

  const convo = conversations.find((c) => c.id === id);

  /* local wingman timeline */
  const [timeline, setTimeline] = useState<WingmanMessage[]>([]);
  const [inputText, setInputText]     = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId]       = useState<string | null>(null);
  const [showHint, setShowHint]       = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLTextAreaElement>(null);

  /* pre-populate from stored convo messages (only on first mount) */
  useEffect(() => {
    if (!convo) return;
    const initial: WingmanMessage[] = convo.messages.map((m) => ({
      id: m.id,
      side: m.isUser ? "suggested" : "her",
      text: m.text,
      time: m.time,
    }));
    setTimeline(initial);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [timeline, isGenerating]);

  /* mark unread → 0 on open */
  useEffect(() => {
    if (convo && convo.unreadCount > 0) {
      setConversations(
        conversations.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
      );
    }
  }, []);

  if (!convo) {
    return (
      <div className="flex items-center justify-center h-full" style={{ background: "#050510" }}>
        <p style={{ color: "rgba(255,255,255,0.3)" }}>Conversation not found</p>
      </div>
    );
  }

  const { person } = convo;

  /* ── Handle generate ─────────────────────────────────── */
  const handleGenerate = async () => {
    const text = inputText.trim();
    if (!text || isGenerating) return;

    setShowHint(false);

    // Add HER message to timeline
    const herMsg: WingmanMessage = {
      id: `her-${Date.now()}`,
      side: "her",
      text,
      time: now(),
    };
    setTimeline((prev) => [...prev, herMsg]);
    setInputText("");
    setIsGenerating(true);

    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL || "http://localhost:3000"}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      
      const suggestedMsg: WingmanMessage = {
        id: `sug-${Date.now()}`,
        side: "suggested",
        text: data.reply || "Failed to generate reply",
        time: now(),
      };
      setTimeline((prev) => [...prev, suggestedMsg]);
    } catch(err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  /* ── Copy handler ────────────────────────────────────── */
  const handleCopy = async (msg: WingmanMessage) => {
    await navigator.clipboard.writeText(msg.text).catch(() => {});
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div
      className="relative flex flex-col h-full overflow-hidden screen-enter"
      style={{ background: "#050510" }}
    >
      {/* ── Ambient orbs ─────────────────────────────────── */}
      <div
        className="orb w-56 h-56 -top-16 -right-16 opacity-[0.07] pointer-events-none"
        style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }}
      />
      <div
        className="orb w-48 h-48 bottom-40 -left-20 opacity-[0.05] pointer-events-none"
        style={{ background: "radial-gradient(circle, #db2777, transparent)" }}
      />

      {/* ── Header ───────────────────────────────────────── */}
      <div
        className="relative shrink-0 px-4 pt-14 pb-3"
        style={{
          background: "rgba(5,5,16,0.96)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-3">
          {/* Back */}
          <button
            onClick={() => navigate("/app/chat")}
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-90"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <ArrowLeft size={17} style={{ color: "rgba(255,255,255,0.6)" }} />
          </button>

          {/* Avatar */}
          <div className="relative shrink-0">
            <img
              src={person.photo}
              alt={person.name}
              className="w-10 h-10 rounded-2xl object-cover"
              style={{ border: "2px solid rgba(167,139,250,0.25)" }}
            />
            {person.isOnline && (
              <div
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                style={{ background: "#34d399", borderColor: "#050510" }}
              />
            )}
          </div>

          {/* Name / status */}
          <div className="flex-1 min-w-0">
            <p className="text-sm" style={{ color: "white", fontWeight: 700 }}>
              {person.name}, {person.age}
            </p>
            <p
              className="text-[11px]"
              style={{ color: person.isOnline ? "#34d399" : "rgba(255,255,255,0.3)" }}
            >
              {person.isOnline ? "Online now" : `Last seen ${person.lastSeen}`}
            </p>
          </div>

          {/* Match badge */}
          <div
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] shrink-0"
            style={{
              background: "rgba(52,211,153,0.1)",
              border: "1px solid rgba(52,211,153,0.2)",
              color: "#34d399",
              fontWeight: 700,
            }}
          >
            <Zap size={11} />
            {person.matchPercent}%
          </div>
        </div>

        {/* Wingman mode label */}
        <div
          className="mt-2.5 flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(219,39,119,0.08))",
            border: "1px solid rgba(139,92,246,0.2)",
          }}
        >
          <Sparkles size={12} style={{ color: "#a78bfa", flexShrink: 0 }} />
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>
            <span style={{ color: "#c4b5fd", fontWeight: 700 }}>Wingman Mode</span>
            {" — type what "}
            <span style={{ color: "#f9a8d4", fontWeight: 600 }}>{person.name}</span>
            {" says below and get a perfect reply"}
          </p>
        </div>
      </div>

      {/* ── Chat Timeline ─────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-2"
        style={{ paddingBottom: 8 }}
      >
        {/* Empty state hint */}
        <AnimatePresence>
          {showHint && timeline.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center pt-8 pb-4 px-6 text-center gap-3"
            >
              <div
                className="w-16 h-16 rounded-3xl flex items-center justify-center mb-1"
                style={{
                  background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(219,39,119,0.1))",
                  border: "1px solid rgba(139,92,246,0.2)",
                }}
              >
                <Sparkles size={26} style={{ color: "#a78bfa" }} />
              </div>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>
                Your Wingman is ready
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.3)" }}>
                Type what{" "}
                <span style={{ color: "#f9a8d4" }}>{person.name}</span> just sent you
                in the box below and tap{" "}
                <span style={{ color: "#a78bfa" }}>Generate Reply</span> — your AI wingman
                will craft the perfect response.
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <div
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px]"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}
                >
                  <div className="w-2 h-2 rounded-sm" style={{ background: "rgba(255,255,255,0.25)" }} />
                  Her messages ← Left
                </div>
                <ChevronRight size={10} style={{ color: "rgba(255,255,255,0.2)" }} />
                <div
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px]"
                  style={{
                    background: "rgba(124,58,237,0.15)",
                    border: "1px solid rgba(124,58,237,0.2)",
                    color: "#c4b5fd",
                  }}
                >
                  <Sparkles size={9} />
                  Replies → Right
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message bubbles */}
        {timeline.length > 0 && (
          <div className="flex justify-center mb-3">
            <span
              className="text-[11px] px-3 py-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.28)" }}
            >
              Today
            </span>
          </div>
        )}

        {timeline.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 280, delay: i === timeline.length - 1 ? 0 : 0 }}
            className={`flex ${msg.side === "suggested" ? "justify-end" : "justify-start"}`}
          >
            {/* ── HER bubble (left / grey) ─── */}
            {msg.side === "her" && (
              <div className="max-w-[76%]">
                {/* Name label above first HER message in sequence */}
                <p
                  className="text-[10px] mb-1 ml-1"
                  style={{ color: "rgba(255,255,255,0.3)", fontWeight: 600 }}
                >
                  {person.name}
                </p>
                <div
                  onClick={() => setInputText(msg.text)}
                  title="Tap to target this message for a reply"
                  className="px-4 py-3 rounded-[20px] rounded-tl-[4px] cursor-pointer hover:opacity-80 transition-opacity active:scale-[0.98]"
                  style={{
                    background: "rgba(255,255,255,0.09)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.09)",
                  }}
                >
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.88)" }}>
                    {msg.text}
                  </p>
                  <p className="text-[10px] mt-1.5" style={{ color: "rgba(255,255,255,0.28)" }}>
                    {msg.time}
                  </p>
                </div>
              </div>
            )}

            {/* ── SUGGESTED bubble (right / glowing purple) ─── */}
            {msg.side === "suggested" && (
              <div className="max-w-[76%]">
                <p
                  className="text-[10px] mb-1 mr-1 text-right"
                  style={{ color: "rgba(167,139,250,0.6)", fontWeight: 600 }}
                >
                  ✦ Suggested reply
                </p>
                <div
                  className="relative px-4 py-3 rounded-[20px] rounded-tr-[4px]"
                  style={{
                    background: "linear-gradient(135deg, #6d28d9 0%, #be185d 100%)",
                    boxShadow:
                      "0 4px 24px rgba(109,40,217,0.5), 0 2px 8px rgba(190,24,93,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                  }}
                >
                  <p className="text-sm leading-relaxed pr-7" style={{ color: "white" }}>
                    {msg.text}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                      {msg.time}
                    </p>
                    <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>✓✓</span>
                  </div>

                  {/* ── COPY button (inside bubble) ─── */}
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => handleCopy(msg)}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{
                      background:
                        copiedId === msg.id
                          ? "rgba(52,211,153,0.25)"
                          : "rgba(255,255,255,0.15)",
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                    title="Copy reply"
                  >
                    <AnimatePresence mode="wait">
                      {copiedId === msg.id ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: "spring", damping: 14 }}
                        >
                          <Check size={13} style={{ color: "#34d399" }} />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="copy"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                        >
                          <Copy size={13} style={{ color: "rgba(255,255,255,0.75)" }} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>

                {/* "Copied!" toast */}
                <AnimatePresence>
                  {copiedId === msg.id && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-[10px] text-right mt-1 mr-1"
                      style={{ color: "#34d399", fontWeight: 600 }}
                    >
                      Copied to clipboard ✓
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        ))}

        {/* Generating indicator */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex justify-end"
            >
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-[20px] rounded-tr-[4px]"
                style={{
                  background: "linear-gradient(135deg, rgba(109,40,217,0.4), rgba(190,24,93,0.3))",
                  border: "1px solid rgba(139,92,246,0.3)",
                  boxShadow: "0 4px 20px rgba(109,40,217,0.25)",
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw size={13} style={{ color: "#c4b5fd" }} />
                </motion.div>
                <span className="text-xs" style={{ color: "#c4b5fd", fontWeight: 600 }}>
                  Crafting your rizz…
                </span>
                <div className="flex gap-1 ml-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
                      className="w-1 h-1 rounded-full"
                      style={{ background: "#c4b5fd" }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Section ─────────────────────────────────── */}
      <div
        className="shrink-0 pb-28 pt-3 px-4"
        style={{
          background: "rgba(5,5,16,0.97)",
          backdropFilter: "blur(24px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Label */}
        <div className="flex items-center gap-1.5 mb-2 px-1">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "linear-gradient(135deg, #a78bfa, #f472b6)" }}
          />
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>
            What did{" "}
            <span style={{ color: "#f9a8d4" }}>{person.name}</span> say?
          </p>
        </div>

        <div className="flex items-end gap-3">
          {/* Text input */}
          <div
            className="flex-1 rounded-2xl px-4 py-3 transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.09)",
            }}
            onFocus={(e) => {
              (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(139,92,246,0.5)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 3px rgba(139,92,246,0.1)";
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(255,255,255,0.09)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }}
          >
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Paste or type her message…`}
              rows={1}
              className="w-full bg-transparent text-sm outline-none resize-none"
              style={{
                color: "rgba(255,255,255,0.85)",
                maxHeight: 96,
                lineHeight: "1.5",
              }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 96) + "px";
              }}
            />
          </div>

          {/* Generate button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleGenerate}
            disabled={!inputText.trim() || isGenerating}
            className="shrink-0 rounded-2xl px-4 flex flex-col items-center justify-center gap-0.5 transition-all"
            style={{
              height: 52,
              minWidth: 80,
              ...(inputText.trim() && !isGenerating
                ? {
                    background: "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)",
                    boxShadow: "0 4px 20px rgba(124,58,237,0.5), 0 2px 8px rgba(219,39,119,0.3)",
                  }
                : {
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }),
            }}
          >
            {isGenerating ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw size={18} style={{ color: "rgba(255,255,255,0.6)" }} />
              </motion.div>
            ) : (
              <>
                <Sparkles
                  size={17}
                  style={{
                    color: inputText.trim() ? "white" : "rgba(255,255,255,0.25)",
                    filter: inputText.trim() ? "drop-shadow(0 0 6px rgba(255,255,255,0.4))" : "none",
                  }}
                />
                <span
                  className="text-[10px]"
                  style={{
                    color: inputText.trim() ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.25)",
                    fontWeight: 700,
                    letterSpacing: "-0.2px",
                  }}
                >
                  Rizz
                </span>
              </>
            )}
          </motion.button>
        </div>

        {/* Hint text */}
        <p className="text-[10px] text-center mt-2" style={{ color: "rgba(255,255,255,0.18)" }}>
          Press Enter or tap Rizz · Tap{" "}
          <Copy size={9} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
          inside a reply to copy it
        </p>
      </div>
    </div>
  );
};
