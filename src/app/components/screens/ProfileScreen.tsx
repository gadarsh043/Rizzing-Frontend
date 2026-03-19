import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  User,
  Briefcase,
  Edit3,
  Plus,
  X,
  Check,
  Camera,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Tag,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

const interestOptions = [
  "Hiking",
  "Photography",
  "Cooking",
  "Vinyl Records",
  "Travel",
  "Coffee",
  "Yoga",
  "Reading",
  "Live Music",
  "Foodie",
  "Rock Climbing",
  "Surfing",
  "Art",
  "Film",
  "Gaming",
  "Fitness",
  "Skiing",
  "Dogs",
];

const improvedBios: string[] = [
  "Equal parts mountain trail and city coffee shop — I'm the person who plans spontaneous road trips but always knows the best local spots. Designer by day, vinyl collector by night, and perpetually planning my next adventure. Looking for someone who's just as excited about a 6am hike as a late-night record store dive.",
  "I design experiences at Spotify and chase experiences everywhere else — from 14ers to hidden vinyl shops to farmers markets at 7am. My love languages are homemade pasta and 'I saw this and thought of you' playlists. Would love to find someone who makes ordinary Tuesdays feel like adventures.",
  "Adventure-seeker with a soft spot for a great dinner party. I believe the best conversations happen on trail summits, across vinyl-stacked coffee tables, and somewhere mid-road-trip. If you can recommend a hiking trail AND a good natural wine, we might be soulmates.",
];

const improvedAnswers: Record<number, string[]> = {
  0: [
    "I've been to 30 countries. I beatbox terribly but passionately. I've personally reviewed 200+ coffee shops (okay that one's true too).",
    "I hiked Kilimanjaro on a whim. I have a vintage Polaroid for every trip. I've never actually finished a Netflix series (the lie is one of those).",
  ],
  1: [
    "Quality time doing something neither of us has tried before — bonus points if it involves a map and no cell service.",
    "Showing up with your favorite snack without being asked. And playlists. A really good, thoughtful playlist.",
  ],
  2: [
    "Build a life where Monday mornings feel like a choice, not a sentence. Starting with that converted-van coffee shop.",
    "Visit every National Park. Open that tiny bookshop/vinyl bar hybrid I've been sketching plans for since 2019.",
  ],
};

export const ProfileScreen: React.FC = () => {
  const { profileData, setProfileData } = useApp();
  const [improvingField, setImprovingField] = useState<string | null>(null);
  const [expandedPrompt, setExpandedPrompt] = useState<number | null>(0);
  const [newInterest, setNewInterest] = useState("");
  const [showInterestPicker, setShowInterestPicker] = useState(false);
  const [savedFields, setSavedFields] = useState<Set<string>>(new Set());

  const handleAIImprove = async (field: string, promptIndex?: number) => {
    setImprovingField(field);

    if (field === "bio") {
      try {
        const res = await fetch(`${(import.meta as any).env.VITE_API_URL || "http://localhost:3000"}/optimize-bio`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profileData)
        });
        const data = await res.json();
        if (data.optimizedBio) {
          setProfileData({ ...profileData, bio: data.optimizedBio });
        }
      } catch(err) {
        console.error(err);
      }
    } else if (field.startsWith("prompt") && promptIndex !== undefined) {
      setTimeout(() => {
        const answers = improvedAnswers[promptIndex];
        if (answers) {
          const improved = answers[Math.floor(Math.random() * answers.length)];
          const newPrompts = [...profileData.prompts];
          newPrompts[promptIndex] = { ...newPrompts[promptIndex], answer: improved };
          setProfileData({ ...profileData, prompts: newPrompts });
        }
        setImprovingField(null);
        setSavedFields((prev) => new Set([...prev, field]));
        setTimeout(() => {
          setSavedFields((prev) => {
            const next = new Set(prev);
            next.delete(field);
            return next;
          });
        }, 2000);
      }, 1200);
      return; 
    }

    setImprovingField(null);
    setSavedFields((prev) => new Set([...prev, field]));
    setTimeout(() => {
      setSavedFields((prev) => {
        const next = new Set(prev);
        next.delete(field);
        return next;
      });
    }, 2000);
  };

  const removeInterest = (tag: string) => {
    setProfileData({
      ...profileData,
      interests: profileData.interests.filter((i) => i !== tag),
    });
  };

  const addInterest = (tag: string) => {
    if (!profileData.interests.includes(tag)) {
      setProfileData({
        ...profileData,
        interests: [...profileData.interests, tag],
      });
    }
    setShowInterestPicker(false);
  };

  return (
    <div className="relative min-h-full flex flex-col px-5 pt-14 pb-6 screen-enter">
      {/* Background orb */}
      <div
        className="orb w-72 h-72 top-0 right-0 opacity-15"
        style={{ background: "radial-gradient(circle, #0891b2, transparent)" }}
      />

      {/* Header */}
      <div className="relative mb-6">
        <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          Manage your
        </p>
        <h1
          className="text-2xl"
          style={{ fontWeight: 700, color: "white", letterSpacing: "-0.5px" }}
        >
          Dating{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #67e8f9, #a78bfa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Profile
          </span>
        </h1>
      </div>

      {/* Avatar Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-7 p-4 rounded-3xl"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="relative">
          <div
            className="w-18 h-18 rounded-3xl overflow-hidden flex items-center justify-center"
            style={{
              width: 72,
              height: 72,
              background: "linear-gradient(135deg, #7c3aed20, #db277720)",
              border: "2px solid rgba(167,139,250,0.3)",
            }}
          >
            <User size={32} style={{ color: "rgba(167,139,250,0.6)" }} />
          </div>
          <button
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #db2777)",
              boxShadow: "0 2px 8px rgba(124,58,237,0.5)",
            }}
          >
            <Camera size={13} style={{ color: "white" }} />
          </button>
        </div>
        <div>
          <p className="text-base" style={{ color: "white", fontWeight: 600 }}>
            {profileData.name || "Your Name"}
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            {profileData.job || "Your Job"}
          </p>
          <div
            className="flex items-center gap-1 mt-1.5 text-xs px-2.5 py-1 rounded-full w-fit"
            style={{
              background: "rgba(52,211,153,0.1)",
              border: "1px solid rgba(52,211,153,0.2)",
              color: "#34d399",
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
            Profile Active
          </div>
        </div>
        <button
          className="ml-auto w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Edit3 size={15} style={{ color: "rgba(255,255,255,0.4)" }} />
        </button>
      </motion.div>

      {/* Basic Info */}
      <SectionHeader label="BASIC INFO" />
      <div className="space-y-3 mb-6">
        <FieldRow
          label="Name"
          value={profileData.name}
          onChange={(v) => setProfileData({ ...profileData, name: v })}
          placeholder="Your first name"
        />
        <div className="grid grid-cols-2 gap-3">
          <FieldRow
            label="Age"
            value={profileData.age}
            onChange={(v) => setProfileData({ ...profileData, age: v })}
            placeholder="25"
            type="number"
          />
          <FieldRow
            label="Height"
            value={profileData.height}
            onChange={(v) => setProfileData({ ...profileData, height: v })}
            placeholder={"5'10\""}
          />
        </div>
        <FieldRow
          label="Job"
          icon={<Briefcase size={14} style={{ color: "rgba(255,255,255,0.3)" }} />}
          value={profileData.job}
          onChange={(v) => setProfileData({ ...profileData, job: v })}
          placeholder="Your job title"
        />
      </div>

      {/* Bio */}
      <SectionHeader label="BIO" />
      <div className="mb-6">
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <textarea
            value={profileData.bio}
            onChange={(e) =>
              setProfileData({ ...profileData, bio: e.target.value })
            }
            placeholder="Tell your story..."
            rows={4}
            className="w-full bg-transparent px-4 pt-4 pb-3 text-sm resize-none outline-none"
            style={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.7 }}
          />
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              {profileData.bio.length} chars
            </span>
            <AIImproveButton
              isLoading={improvingField === "bio"}
              isSaved={savedFields.has("bio")}
              onClick={() => handleAIImprove("bio")}
            />
          </div>
        </div>
      </div>

      {/* Prompts */}
      <SectionHeader label="PROMPTS" />
      <div className="space-y-3 mb-6">
        {profileData.prompts.map((prompt, i) => (
          <motion.div
            key={i}
            layout
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <button
              onClick={() =>
                setExpandedPrompt(expandedPrompt === i ? null : i)
              }
              className="w-full px-4 py-3.5 flex items-center justify-between text-left"
            >
              <div className="flex-1 min-w-0 pr-2">
                <p
                  className="text-xs mb-0.5"
                  style={{ color: "#a78bfa", fontWeight: 600 }}
                >
                  {prompt.question}
                </p>
                <p
                  className="text-sm truncate"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  {prompt.answer}
                </p>
              </div>
              {expandedPrompt === i ? (
                <ChevronUp size={16} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
              ) : (
                <ChevronDown size={16} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
              )}
            </button>

            <AnimatePresence>
              {expandedPrompt === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: "hidden" }}
                >
                  <div
                    className="px-4 pb-3"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <textarea
                      value={prompt.answer}
                      onChange={(e) => {
                        const newPrompts = [...profileData.prompts];
                        newPrompts[i] = {
                          ...newPrompts[i],
                          answer: e.target.value,
                        };
                        setProfileData({ ...profileData, prompts: newPrompts });
                      }}
                      rows={3}
                      className="w-full bg-transparent pt-3 text-sm resize-none outline-none"
                      style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}
                    />
                    <div className="flex justify-end mt-1">
                      <AIImproveButton
                        isLoading={improvingField === `prompt${i}`}
                        isSaved={savedFields.has(`prompt${i}`)}
                        onClick={() => handleAIImprove(`prompt${i}`, i)}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Interests */}
      <SectionHeader label="INTERESTS" />
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {profileData.interests.map((tag) => (
            <motion.div
              key={tag}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm"
              style={{
                background: "rgba(167,139,250,0.12)",
                border: "1px solid rgba(167,139,250,0.25)",
                color: "#c4b5fd",
              }}
            >
              <span>{tag}</span>
              <button onClick={() => removeInterest(tag)} className="opacity-50 hover:opacity-100 transition-opacity">
                <X size={11} />
              </button>
            </motion.div>
          ))}
          <button
            onClick={() => setShowInterestPicker(!showInterestPicker)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm transition-all active:scale-95"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px dashed rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            <Plus size={13} />
            Add
          </button>
        </div>

        {/* Interest picker */}
        <AnimatePresence>
          {showInterestPicker && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="overflow-hidden"
            >
              <div
                className="rounded-2xl p-4"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex flex-wrap gap-2">
                  {interestOptions
                    .filter((o) => !profileData.interests.includes(o))
                    .map((opt) => (
                      <button
                        key={opt}
                        onClick={() => addInterest(opt)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs transition-all active:scale-95"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.6)",
                        }}
                      >
                        <Plus size={10} />
                        {opt}
                      </button>
                    ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Save Button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 mt-auto transition-all"
        style={{
          background: "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)",
          boxShadow: "0 8px 24px rgba(124,58,237,0.4)",
        }}
      >
        <Check size={18} style={{ color: "white" }} />
        <span style={{ color: "white", fontWeight: 700, fontSize: 16 }}>
          Save Profile
        </span>
      </motion.button>
    </div>
  );
};

// Sub-components

const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
  <p
    className="text-[11px] mb-3 tracking-wider"
    style={{ color: "rgba(255,255,255,0.3)", fontWeight: 600 }}
  >
    {label}
  </p>
);

const FieldRow: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
}> = ({ label, value, onChange, placeholder, type = "text", icon }) => (
  <div
    className="rounded-2xl px-4 py-1"
    style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
    }}
  >
    <p className="text-[10px] pt-2.5 mb-0.5" style={{ color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>
      {label.toUpperCase()}
    </p>
    <div className="flex items-center gap-2 pb-2.5">
      {icon}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm outline-none"
        style={{ color: "rgba(255,255,255,0.85)" }}
      />
    </div>
  </div>
);

const AIImproveButton: React.FC<{
  isLoading: boolean;
  isSaved: boolean;
  onClick: () => void;
}> = ({ isLoading, isSaved, onClick }) => (
  <motion.button
    whileTap={{ scale: 0.92 }}
    onClick={onClick}
    disabled={isLoading}
    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all"
    style={
      isSaved
        ? {
            background: "rgba(52,211,153,0.12)",
            border: "1px solid rgba(52,211,153,0.3)",
            color: "#34d399",
          }
        : {
            background:
              "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(219,39,119,0.15))",
            border: "1px solid rgba(167,139,250,0.3)",
            color: "#a78bfa",
          }
    }
  >
    {isLoading ? (
      <>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw size={12} />
        </motion.div>
        <span>Improving...</span>
      </>
    ) : isSaved ? (
      <>
        <Check size={12} />
        <span>Improved!</span>
      </>
    ) : (
      <>
        <Sparkles size={12} />
        <span>✨ AI Improve</span>
      </>
    )}
  </motion.button>
);