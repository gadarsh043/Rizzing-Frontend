import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  ImagePlus,
  X,
  Sparkles,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { useApp, UploadedImage } from "../../context/AppContext";

const DEMO_IMAGES = [
  {
    id: "demo1",
    url: "https://images.unsplash.com/photo-1701884691134-5eb2211ba6fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    name: "sofia_profile_1.jpg",
  },
  {
    id: "demo2",
    url: "https://images.unsplash.com/photo-1754295559919-5cbfd62bf195?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    name: "sofia_profile_2.jpg",
  },
  {
    id: "demo3",
    url: "https://images.unsplash.com/photo-1759356034828-210dc9d09487?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    name: "sofia_profile_3.jpg",
  },
];

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { uploadedImages, setUploadedImages, setGeneratedRizz, setOcrText } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      addImageFiles(files);
    },
    [uploadedImages]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((f) =>
      f.type.startsWith("image/")
    );
    addImageFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addImageFiles = (files: File[]) => {
    const newImgs: UploadedImage[] = files.slice(0, 4 - uploadedImages.length).map((f) => ({
      id: Math.random().toString(36).slice(2),
      url: URL.createObjectURL(f),
      name: f.name,
      file: f,
    }));
    setUploadedImages([...uploadedImages, ...newImgs].slice(0, 4));
  };

  const removeImage = (id: string) => {
    setUploadedImages(uploadedImages.filter((img) => img.id !== id));
  };

  const handleUseDemoImages = () => {
    setUploadedImages(DEMO_IMAGES);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const formData = new FormData();
      uploadedImages.forEach((img) => {
        if (img.file) formData.append('images', img.file);
      });
      
      const apiUrl = (import.meta as any).env.VITE_API_URL ? `${(import.meta as any).env.VITE_API_URL}/rizzing` : 'http://localhost:5001/rizzing';
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      if (data.line) {
        setGeneratedRizz(data.line);
        if (data.ocrText) setOcrText(data.ocrText);
        navigate("/app/result");
      } else {
        alert(data.error || 'Failed to generate rizz');
        setIsGenerating(false);
      }
    } catch (err) {
      console.error(err);
      alert('Network error connecting to backend.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative min-h-full flex flex-col px-5 pt-14 pb-6 screen-enter">
      {/* Background orbs */}
      <div
        className="orb w-64 h-64 -top-10 -right-10 opacity-20"
        style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }}
      />
      <div
        className="orb w-48 h-48 top-1/2 -left-10 opacity-10"
        style={{ background: "radial-gradient(circle, #db2777, transparent)" }}
      />

      {/* Header */}
      <div className="relative mb-8">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Good evening 👋
            </p>
            <h1
              className="text-2xl"
              style={{ fontWeight: 700, color: "white", letterSpacing: "-0.5px" }}
            >
              Craft your{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #a78bfa, #f472b6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                opening line
              </span>
            </h1>
          </div>
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #7c3aed20, #db277720)",
              border: "1px solid rgba(167,139,250,0.2)",
            }}
          >
            <span className="text-lg">✨</span>
          </div>
        </div>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
          Upload 1-4 screenshots from their dating profile
        </p>
      </div>

      {/* Upload Zone */}
      <motion.div
        animate={isDragging ? { scale: 1.02 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative rounded-3xl p-6 mb-5 cursor-pointer flex flex-col items-center justify-center min-h-[200px] transition-all duration-300"
        style={
          isDragging
            ? {
                background:
                  "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(219,39,119,0.1))",
                border: "2px dashed rgba(139,92,246,0.8)",
                boxShadow:
                  "0 0 0 0 transparent, 0 0 50px rgba(139,92,246,0.4), inset 0 0 50px rgba(139,92,246,0.1)",
              }
            : {
                background: "rgba(255,255,255,0.03)",
                border: "2px dashed rgba(255,255,255,0.12)",
              }
        }
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        <motion.div
          animate={
            isDragging
              ? { y: -6, scale: 1.1 }
              : { y: 0, scale: 1 }
          }
          transition={{ type: "spring", stiffness: 300 }}
          className="flex flex-col items-center gap-3"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-1"
            style={
              isDragging
                ? {
                    background:
                      "linear-gradient(135deg, rgba(124,58,237,0.4), rgba(219,39,119,0.3))",
                    boxShadow: "0 0 24px rgba(139,92,246,0.5)",
                  }
                : {
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }
            }
          >
            <ImagePlus
              size={28}
              style={
                isDragging
                  ? { color: "#a78bfa" }
                  : { color: "rgba(255,255,255,0.3)" }
              }
            />
          </div>
          <div className="text-center">
            <p
              className="text-sm mb-1"
              style={{
                color: isDragging ? "#a78bfa" : "rgba(255,255,255,0.6)",
                fontWeight: 600,
              }}
            >
              {isDragging ? "Drop screenshots here!" : "Tap to upload screenshots"}
            </p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              PNG, JPG up to 10MB · Max 4 images
            </p>
          </div>
        </motion.div>

        {/* Animated border pulse when empty */}
        {uploadedImages.length === 0 && !isDragging && (
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              border: "1px solid rgba(139,92,246,0.3)",
              borderRadius: "inherit",
            }}
          />
        )}
      </motion.div>

      {/* Demo Images Button */}
      {uploadedImages.length === 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={handleUseDemoImages}
          className="flex items-center justify-center gap-2 mb-5 py-3 rounded-2xl w-full transition-all active:scale-95"
          style={{
            background: "rgba(167,139,250,0.08)",
            border: "1px solid rgba(167,139,250,0.2)",
          }}
        >
          <Sparkles size={15} style={{ color: "#a78bfa" }} />
          <span className="text-sm" style={{ color: "#a78bfa", fontWeight: 500 }}>
            Try with demo profile
          </span>
        </motion.button>
      )}

      {/* Uploaded Images Grid */}
      <AnimatePresence>
        {uploadedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-5"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>
                Profile Screenshots
                <span
                  className="ml-2 text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(167,139,250,0.15)",
                    color: "#a78bfa",
                  }}
                >
                  {uploadedImages.length}/4
                </span>
              </p>
              {uploadedImages.length < 4 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 text-xs transition-all active:scale-95"
                  style={{ color: "#a78bfa" }}
                >
                  <Upload size={12} />
                  Add more
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {uploadedImages.map((img, i) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative rounded-2xl overflow-hidden group"
                  style={{ aspectRatio: "3/4" }}
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ background: "rgba(0,0,0,0.4)" }}
                  />
                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(img.id);
                    }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 active:scale-90"
                    style={{
                      background: "rgba(0,0,0,0.7)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <X size={14} style={{ color: "white" }} />
                  </button>
                  {/* Index badge */}
                  <div
                    className="absolute bottom-2 left-2 w-5 h-5 rounded-lg flex items-center justify-center text-[10px]"
                    style={{
                      background: "rgba(0,0,0,0.6)",
                      backdropFilter: "blur(8px)",
                      color: "rgba(255,255,255,0.8)",
                      fontWeight: 600,
                    }}
                  >
                    {i + 1}
                  </div>
                </motion.div>
              ))}

              {/* Add more slot */}
              {uploadedImages.length < 4 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="relative rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95"
                  style={{
                    aspectRatio: "3/4",
                    background: "rgba(255,255,255,0.02)",
                    border: "2px dashed rgba(255,255,255,0.08)",
                  }}
                >
                  <ImagePlus size={20} style={{ color: "rgba(255,255,255,0.2)" }} />
                  <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                    Add photo
                  </span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate Button */}
      <AnimatePresence>
        {uploadedImages.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={handleGenerate}
            disabled={isGenerating}
            className="relative w-full rounded-2xl py-4 px-6 flex items-center justify-center gap-3 overflow-hidden transition-all duration-300 active:scale-95 mb-5"
            style={{
              background: isGenerating
                ? "rgba(124,58,237,0.3)"
                : "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)",
              boxShadow: isGenerating
                ? "none"
                : "0 8px 32px rgba(124,58,237,0.5), 0 4px 16px rgba(219,39,119,0.3)",
            }}
          >
            {isGenerating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white"
                />
                <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
                  Analyzing profile...
                </span>
              </>
            ) : (
              <>
                <Sparkles size={18} style={{ color: "white" }} />
                <span style={{ color: "white", fontWeight: 700, fontSize: 16 }}>
                  Generate My Rizz
                </span>
                <ChevronRight size={18} style={{ color: "rgba(255,255,255,0.7)" }} />
              </>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Loading skeleton overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center px-6"
            style={{
              background: "rgba(5,5,16,0.85)",
              backdropFilter: "blur(12px)",
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-5xl mb-6"
            >
              🪄
            </motion.div>
            <div className="space-y-3 w-full max-w-[280px]">
              {["Analyzing profile photos...", "Finding conversation hooks...", "Crafting your perfect line..."].map(
                (txt, i) => (
                  <motion.div
                    key={txt}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.5 }}
                    className="flex items-center gap-3"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ delay: i * 0.5, duration: 0.5 }}
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0"
                      style={{
                        background: "linear-gradient(135deg, #7c3aed, #db2777)",
                      }}
                    >
                      ✓
                    </motion.div>
                    <div
                      className="shimmer rounded-lg h-8 flex-1"
                      style={{ border: "1px solid rgba(255,255,255,0.05)" }}
                    />
                  </motion.div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disclaimer */}
      <div
        className="mt-auto rounded-2xl p-4 flex gap-3"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <AlertCircle size={16} className="shrink-0 mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }} />
        <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>
          Note: This tool is just here to help remove that initial conversation
          hesitation — nothing else! Be yourself once the ball is rolling. 💙
        </p>
      </div>
    </div>
  );
};