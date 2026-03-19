import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Search, Zap, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router";
import { useApp, Conversation } from "../../context/AppContext";

export const ChatListScreen: React.FC = () => {
  const { conversations, profileData, updateConversations } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filtered = conversations.filter((c) =>
    c.person.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  const handleDelete = (id: string) => {
    updateConversations((prev) => prev.filter((c) => c.id !== id));
    setDeleteConfirmId(null);
  };

  return (
    <div className="relative flex flex-col h-full overflow-hidden screen-enter" style={{ background: "#050510" }}>
      {/* Background orb */}
      <div
        className="orb w-64 h-64 top-0 right-0 opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }}
      />

      {/* Header */}
      <div
        className="relative shrink-0 px-5 pt-14 pb-4"
        style={{
          background: "rgba(5,5,16,0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              Your matches
            </p>
            <h1 className="text-2xl" style={{ fontWeight: 700, color: "white", letterSpacing: "-0.5px" }}>
              Chats{" "}
              {totalUnread > 0 && (
                <span
                  className="text-sm px-2 py-0.5 rounded-full ml-1 align-middle"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #db2777)",
                    color: "white",
                    fontWeight: 700,
                  }}
                >
                  {totalUnread}
                </span>
              )}
            </h1>
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs"
            style={{
              background: "rgba(167,139,250,0.1)",
              border: "1px solid rgba(167,139,250,0.2)",
              color: "#a78bfa",
            }}
          >
            <Sparkles size={12} />
            <span style={{ fontWeight: 600 }}>Rizz Ready</span>
          </div>
        </div>

        {/* Search bar */}
        <div
          className="flex items-center gap-2 rounded-2xl px-4 py-3"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <Search size={15} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "rgba(255,255,255,0.8)" }}
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 px-8 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <Search size={22} style={{ color: "rgba(255,255,255,0.2)" }} />
            </div>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
              No chats found
            </p>
          </div>
        ) : (
          <div className="py-2">
            <AnimatePresence>
              {filtered.map((convo, i) => (
                <ConvoRow
                  key={convo.id}
                  convo={convo}
                  index={i}
                  hasProfile={!!profileData.name}
                  isDeletePending={deleteConfirmId === convo.id}
                  onPress={() => {
                    if (deleteConfirmId) { setDeleteConfirmId(null); return; }
                    navigate(`/app/chat/${convo.id}`);
                  }}
                  onLongPress={() => setDeleteConfirmId(convo.id)}
                  onCancelDelete={() => setDeleteConfirmId(null)}
                  onConfirmDelete={() => handleDelete(convo.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

const ConvoRow: React.FC<{
  convo: Conversation;
  index: number;
  hasProfile: boolean;
  isDeletePending: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}> = ({ convo, index, hasProfile, isDeletePending, onPress, onLongPress, onCancelDelete, onConfirmDelete }) => {
  const lastMsg = convo.messages[convo.messages.length - 1];
  const { person, unreadCount } = convo;
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => onLongPress(), 500);
  };
  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      transition={{ delay: index * 0.04 }}
      className="relative overflow-hidden"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
    >
      {/* Delete reveal (slides in from right when pending) */}
      <AnimatePresence>
        {isDeletePending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-end gap-3 px-5 z-10"
            style={{ background: "rgba(5,5,16,0.97)", backdropFilter: "blur(8px)" }}
          >
            <p className="text-xs flex-1 pl-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              Remove <span style={{ color: "white", fontWeight: 600 }}>{person.name}</span> from your chats?
            </p>
            <button
              onClick={onCancelDelete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all active:scale-95"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              <X size={12} /> Keep
            </button>
            <button
              onClick={onConfirmDelete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all active:scale-95"
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171",
                fontWeight: 600,
              }}
            >
              <Trash2 size={12} /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Row content */}
      <button
        onClick={onPress}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        className="w-full px-5 py-3.5 flex items-center gap-4 text-left transition-all active:scale-[0.98]"
      >
        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            className="w-14 h-14 rounded-2xl overflow-hidden"
            style={{
              border: unreadCount > 0
                ? "2px solid rgba(167,139,250,0.5)"
                : "2px solid rgba(255,255,255,0.07)",
            }}
          >
            <img src={person.photo} alt={person.name} className="w-full h-full object-cover" />
          </div>
          {/* Online dot */}
          {person.isOnline && (
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2"
              style={{ background: "#34d399", borderColor: "#050510" }}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-2">
              <span
                className="text-sm"
                style={{ color: "white", fontWeight: unreadCount > 0 ? 700 : 500 }}
              >
                {person.name}, {person.age}
              </span>
              {/* Match % badge - only shown when user has a profile */}
              {hasProfile && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "rgba(52,211,153,0.12)",
                    color: "#34d399",
                    fontWeight: 600,
                  }}
                >
                  {person.matchPercent}%
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                {lastMsg?.time}
              </span>
              {unreadCount > 0 && (
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #db2777)",
                    color: "white",
                    fontWeight: 700,
                    minWidth: 20,
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </div>
          </div>

          {/* Last message */}
          <p
            className="text-xs truncate"
            style={{
              color: unreadCount > 0 ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.35)",
              fontWeight: unreadCount > 0 ? 500 : 400,
            }}
          >
            {lastMsg?.isUser ? "You: " : ""}
            {lastMsg?.text}
          </p>

          {/* Interests preview */}
          <div className="flex gap-1.5 mt-1.5 overflow-hidden">
            {person.interests.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full shrink-0"
                style={{
                  background: "rgba(167,139,250,0.08)",
                  border: "1px solid rgba(167,139,250,0.15)",
                  color: "rgba(167,139,250,0.7)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Rizz icon / delete hint */}
        <div
          className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
          style={{
            background: "rgba(124,58,237,0.12)",
            border: "1px solid rgba(124,58,237,0.2)",
          }}
        >
          <Zap size={14} style={{ color: "#a78bfa" }} />
        </div>
      </button>
    </motion.div>
  );
};
