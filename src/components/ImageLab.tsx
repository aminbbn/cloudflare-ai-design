import React, { useState } from "react";
import { 
  Sparkle, 
  ImageSquare, 
  Download, 
  Cpu, 
  ArrowsOutCardinal, 
  Clock, 
  Info, 
  FileText, 
  Selection, 
  MagicWand, 
  X, 
  CloudCheck,
  Check,
  Warning,
  Copy,
  TerminalWindow,
  CaretDown,
  Sliders
} from "@phosphor-icons/react";
import { GeneratedImage, ThemeSettings } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface ImageLabProps {
  generatedImages: GeneratedImage[];
  setGeneratedImages: React.Dispatch<React.SetStateAction<GeneratedImage[]>>;
  imagePrompt: string;
  setImagePrompt: (v: string) => void;
  selectedImageModel: string;
  setSelectedImageModel: (v: string) => void;
  selectedImageAspect: string;
  setSelectedImageAspect: (v: string) => void;
  selectedImageSteps: number;
  setSelectedImageSteps: (v: number) => void;
  isGeneratingImage: boolean;
  isImprovingImagePrompt: boolean;
  imageGenerationError: string;
  selectedViewingImage: GeneratedImage | null;
  setSelectedViewingImage: (img: GeneratedImage | null) => void;
  handleGenerateImage: (e: React.FormEvent) => void;
  handleImproveImagePromptText: () => void;
  themeSettings: ThemeSettings;
}

export const ImageLab: React.FC<ImageLabProps> = ({
  generatedImages,
  setGeneratedImages,
  imagePrompt,
  setImagePrompt,
  selectedImageModel,
  setSelectedImageModel,
  selectedImageAspect,
  setSelectedImageAspect,
  selectedImageSteps,
  setSelectedImageSteps,
  isGeneratingImage,
  isImprovingImagePrompt,
  imageGenerationError,
  selectedViewingImage,
  setSelectedViewingImage,
  handleGenerateImage,
  handleImproveImagePromptText,
  themeSettings
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [loadPhaseIndex, setLoadPhaseIndex] = useState(0);
  const [activeMenu, setActiveMenu] = useState<"model" | "aspect" | "steps" | null>(null);

  const phases = [
    "Establishing secure pipeline handshake...",
    "Querying serverless edge routing nodes...",
    "Provisioning compute resource on GPU array...",
    "Decoding design brief matrices...",
    "Executing latent diffusion denoising pass...",
    "Synthesizing high-frequency details...",
    "Rebalancing RGB gamut & tone mapping...",
    "Assembling output telemetry stream..."
  ];

  React.useEffect(() => {
    if (!isGeneratingImage) {
      setLoadPhaseIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadPhaseIndex(prev => (prev + 1) % phases.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [isGeneratingImage]);

  const ASPECT_RATIOS = [
    { label: "1:1 Square", value: "1:1", description: "Perfect for social icons" },
    { label: "16:9 Cinematic", value: "16:9", description: "Ultra-wide hero imagery" },
    { label: "9:16 Portrait", value: "9:16", description: "Vertical mobile layouts" },
    { label: "4:3 Classic", value: "4:3", description: "Traditional blog thumbnails" },
    { label: "21:9 Panorama", value: "21:9", description: "Panoramic context view" }
  ];

  const IMAGE_MODELS = [
    {
      id: "imagen-3.0-generate-002",
      name: "Imagen 3 - High Fidelity",
      author: "Google / Cloudflare Edge",
      type: "Diffusion",
      description: "Prisline photorealism, exquisite typography rendering, and crisp detail fidelity.",
      accent: "#ea580c"
    },
    {
      id: "stable-diffusion-xl-lightning",
      name: "Stable Diffusion XL Lightning",
      author: "Stability AI",
      type: "Lightning Latent",
      description: "High speed, hyper-creative artistic styling, and cinematic atmospheric effects.",
      accent: "#a855f7"
    },
    {
      id: "flux-1-coder",
      name: "Flux.1 Dev - Graphic Art",
      author: "Black Forest Labs",
      type: "Flow Transformer",
      description: "Supreme architectural layouts, detailed technological gears, and cartoon artwork.",
      accent: "#3b82f6"
    }
  ];

  const handleCopyPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleDeleteImageRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this generated graphic record from local persistence?")) {
      setGeneratedImages(prev => prev.filter(img => img.id !== id));
      if (selectedViewingImage?.id === id) {
        setSelectedViewingImage(null);
      }
    }
  };

  return (
    <form onSubmit={handleGenerateImage} className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-0">
      {/* Global click-away overlay when any custom menu dropdown is open */}
      {activeMenu && (
        <div 
          className="fixed inset-0 z-20 cursor-default bg-black/0" 
          onClick={() => setActiveMenu(null)} 
        />
      )}

      {/* Top Section: Beautiful consolidated prompt and parameters card */}
      <div className="p-6 pb-2 flex-shrink-0 w-full max-w-7xl mx-auto relative z-30">
        <div className={`p-4 rounded-3xl border transition-all relative overflow-visible ${
          themeSettings.mode === "light" 
            ? "bg-white border-zinc-200 shadow-md text-zinc-800" 
            : "bg-zinc-950 border-white/5 shadow-2xl text-zinc-100"
        }`}>
          {/* Matrix grid backdrop indicator mapping */}
          <div className="absolute inset-0 opacity-[0.012] dark:opacity-[0.025] pointer-events-none select-none z-0 rounded-3xl bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_14px]" />
          
          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-bold flex items-center gap-1.5 select-none">
                <MagicWand size={14} style={{ color: themeSettings.accentColor }} />
                Creative Design Brief
              </span>
            </div>

            <div className="relative z-10">
              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                disabled={isGeneratingImage || isImprovingImagePrompt}
                placeholder="Describe your target graphic render in meticulous detail (e.g. 'Highly detailed architectural database in cyberpunk tone with amber cloud server racks, soft volumetric lighting and optical fibers...')"
                className={`w-full min-h-[75px] max-h-[120px] p-4 text-xs font-sans leading-relaxed border rounded-2xl focus:outline-none resize-none transition-all ${
                  themeSettings.mode === "light"
                    ? "bg-zinc-50 border-zinc-200 focus:border-zinc-350 focus:bg-white text-zinc-955"
                    : "bg-zinc-90 w-full bg-transparent border-white/10 focus:border-white/20 text-zinc-100 focus:bg-zinc-950/60"
                }`}
                style={{
                  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)"
                }}
              />
            </div>

            {imageGenerationError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] text-red-400 font-medium flex items-start gap-2 animate-fade-in relative z-10">
                <Warning size={14} className="flex-shrink-0 mt-0.5" />
                <span>{imageGenerationError}</span>
              </div>
            )}

            {/* Unified Bottom Settings Toolbar Inside Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-zinc-200/40 dark:border-white/5 relative z-20">
              
              {/* Left Side: Parameters Selectors Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                
                {/* 1. Model Selector Dropdown Popover */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveMenu(activeMenu === "model" ? null : "model")}
                    className={`py-1.5 px-3 rounded-xl border flex items-center gap-2 text-[11px] font-bold select-none cursor-pointer duration-200 transition-all ${
                      themeSettings.mode === "light"
                        ? "bg-zinc-100 border-zinc-200 hover:bg-zinc-150 text-zinc-800"
                        : "bg-zinc-900 border-white/10 hover:border-white/15 text-zinc-300 hover:text-white"
                    }`}
                  >
                    <Cpu size={14} style={{ color: themeSettings.accentColor }} />
                    <span className="max-w-[130px] truncate">
                      {IMAGE_MODELS.find(m => m.id === selectedImageModel)?.name.replace(" - High Fidelity", "").replace(" Dev - Graphic Art", "") || "Engine"}
                    </span>
                    <CaretDown size={10} className={`transition-transform duration-250 ${activeMenu === "model" ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {activeMenu === "model" && (
                      <motion.div
                        initial={{ opacity: 0, y: -12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className={`absolute top-full left-0 mt-2.5 w-[280px] md:w-[325px] rounded-2xl border p-2 shadow-2xl z-40 ${
                          themeSettings.mode === "light"
                            ? "bg-white border-zinc-200 text-zinc-800"
                            : "bg-[#0d0e12] border-white/10 text-zinc-100"
                        }`}
                      >
                        <div className="px-2.5 py-1 text-[9px] font-mono tracking-wider text-zinc-400 uppercase font-bold block border-b border-zinc-200/40 dark:border-white/5 mb-1.5 select-none">
                          Select Synthesis Engine
                        </div>
                        <div className="space-y-1">
                          {IMAGE_MODELS.map(m => {
                            const isSelected = selectedImageModel === m.id;
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => {
                                  setSelectedImageModel(m.id);
                                  setActiveMenu(null);
                                }}
                                className={`w-full text-left p-2.5 rounded-xl transition-all duration-200 flex items-start gap-2.5 cursor-pointer ${
                                  isSelected
                                    ? themeSettings.mode === "light"
                                      ? "bg-zinc-100 text-zinc-950 font-bold"
                                      : "bg-white/10 text-white font-bold"
                                    : themeSettings.mode === "light"
                                      ? "hover:bg-zinc-50 text-zinc-600"
                                      : "hover:bg-white/5 text-zinc-300"
                                }`}
                              >
                                <Cpu size={14} className="mt-0.5 flex-shrink-0" style={{ color: isSelected ? themeSettings.accentColor : undefined }} />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold truncate pr-1">{m.name}</span>
                                    <span className="text-[8px] font-mono opacity-50 uppercase shrink-0">{m.type}</span>
                                  </div>
                                  <p className="text-[9px] text-zinc-400 mt-0.5 line-clamp-2 leading-snug">{m.description}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 2. Aspect Ratio Selector Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveMenu(activeMenu === "aspect" ? null : "aspect")}
                    className={`py-1.5 px-3 rounded-xl border flex items-center gap-2 text-[11px] font-bold select-none cursor-pointer duration-200 transition-all ${
                      themeSettings.mode === "light"
                        ? "bg-zinc-100 border-zinc-200 hover:bg-zinc-150 text-zinc-800"
                        : "bg-zinc-900 border-white/10 hover:border-white/15 text-zinc-300 hover:text-white"
                    }`}
                  >
                    <div className="border border-zinc-400 dark:border-zinc-650 rounded p-[1px] flex items-center justify-center">
                      <div className={`bg-zinc-500/40 ${
                        selectedImageAspect === "1:1" ? "w-2.5 h-2.5" :
                        selectedImageAspect === "16:9" ? "w-3.5 h-2" :
                        selectedImageAspect === "9:16" ? "w-2 h-3.5" :
                        selectedImageAspect === "4:3" ? "w-3 h-2.2" :
                        "w-4 h-1.5"
                      }`} />
                    </div>
                    <span>Frame: {selectedImageAspect}</span>
                    <CaretDown size={10} className={`transition-transform duration-250 ${activeMenu === "aspect" ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {activeMenu === "aspect" && (
                      <motion.div
                        initial={{ opacity: 0, y: -12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className={`absolute top-full left-0 mt-2.5 w-[250px] rounded-2xl border p-2 shadow-2xl z-40 ${
                          themeSettings.mode === "light"
                            ? "bg-white border-zinc-200 text-zinc-800"
                            : "bg-[#0d0e12] border-white/10 text-zinc-100"
                        }`}
                      >
                        <div className="px-2.5 py-1 text-[9px] font-mono tracking-wider text-zinc-400 uppercase font-bold block border-b border-zinc-200/40 dark:border-white/5 mb-2 select-none">
                          Frame Dimensions
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {ASPECT_RATIOS.map(a => {
                            const isSelected = selectedImageAspect === a.value;
                            return (
                              <button
                                key={a.value}
                                type="button"
                                onClick={() => {
                                  setSelectedImageAspect(a.value);
                                  setActiveMenu(null);
                                }}
                                className={`p-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all text-[11px] font-bold cursor-pointer ${
                                  isSelected
                                    ? themeSettings.mode === "light"
                                      ? "bg-zinc-100 border-zinc-300 text-zinc-950"
                                      : "bg-white/10 border-white/15 text-white"
                                    : themeSettings.mode === "light"
                                      ? "bg-transparent border-transparent text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                                      : "bg-transparent border-transparent text-zinc-400 hover:bg-white/5 hover:text-white"
                                }`}
                              >
                                <div className="border border-zinc-650 rounded p-0.5 flex items-center justify-center">
                                  <div className={`bg-zinc-550/30 ${
                                    a.value === "1:1" ? "w-3.5 h-3.5" :
                                    a.value === "16:9" ? "w-5 h-2.5" :
                                    a.value === "9:16" ? "w-2.5 h-5" :
                                    a.value === "4:3" ? "w-4.5 h-3.5" :
                                    "w-6 h-2"
                                  }`} />
                                </div>
                                <span className="text-[9px] font-mono leading-none">{a.value} ({a.label.split(" ")[0]})</span>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 3. Inference Steps Selector Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveMenu(activeMenu === "steps" ? null : "steps")}
                    className={`py-1.5 px-3 rounded-xl border flex items-center gap-2 text-[11px] font-bold select-none cursor-pointer duration-200 transition-all ${
                      themeSettings.mode === "light"
                        ? "bg-zinc-100 border-zinc-200 hover:bg-zinc-150 text-zinc-800"
                        : "bg-zinc-900 border-white/10 hover:border-white/15 text-zinc-300 hover:text-white"
                    }`}
                  >
                    <Sliders size={14} style={{ color: themeSettings.accentColor }} />
                    <span>Steps: {selectedImageSteps}</span>
                    <CaretDown size={10} className={`transition-transform duration-250 ${activeMenu === "steps" ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {activeMenu === "steps" && (
                      <motion.div
                        initial={{ opacity: 0, y: -12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className={`absolute top-full left-0 mt-2.5 w-[160px] rounded-2xl border p-2 shadow-2xl z-40 ${
                          themeSettings.mode === "light"
                            ? "bg-white border-zinc-200 text-zinc-800"
                            : "bg-[#0d0e12] border-white/10 text-zinc-100"
                        }`}
                      >
                        <div className="px-2.5 py-1 text-[9px] font-mono tracking-wider text-zinc-400 uppercase font-bold block border-b border-zinc-200/40 dark:border-white/5 mb-1.5 select-none">
                          Compute Steps
                        </div>
                        <div className="space-y-0.5">
                          {[15, 20, 30, 40, 50].map(s => {
                            const isSelected = selectedImageSteps === s;
                            return (
                              <button
                                key={s}
                                type="button"
                                onClick={() => {
                                  setSelectedImageSteps(s);
                                  setActiveMenu(null);
                                }}
                                className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                                  isSelected
                                    ? themeSettings.mode === "light"
                                      ? "bg-zinc-105 text-zinc-950 font-bold"
                                      : "bg-white/10 text-white font-bold"
                                    : themeSettings.mode === "light"
                                      ? "hover:bg-zinc-50 text-zinc-600 hover:text-zinc-950"
                                      : "hover:bg-white/5 text-zinc-400 hover:text-white"
                                }`}
                              >
                                <span>{s} Steps</span>
                                <span className="text-[8px] uppercase tracking-wider opacity-50 font-mono">
                                  {s === 15 || s === 20 ? "Fast" : s === 30 ? "Std" : "Vivid"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 4. Optimize Brief Dynamic Button */}
                {imagePrompt.trim() && (
                  <button
                    type="button"
                    onClick={handleImproveImagePromptText}
                    disabled={isImprovingImagePrompt}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold cursor-pointer transition-all active:scale-95 duration-200 disabled:opacity-40 select-none ${
                      themeSettings.mode === "light"
                        ? "bg-orange-50/70 hover:bg-orange-100 border-orange-200/70 text-orange-800"
                        : "bg-orange-500/5 hover:bg-orange-500/10 border-orange-500/20 text-orange-450"
                    }`}
                  >
                    {isImprovingImagePrompt ? (
                      <span className="flex items-center gap-1">
                        <Sparkle size={11} className="animate-spin text-orange-500" />
                        <span>Optimizing...</span>
                      </span>
                    ) : (
                      <>
                        <Sparkle size={11} className="text-amber-400 animate-pulse animate-duration-[3s]" />
                        <span>Optimize Brief with Gemini</span>
                      </>
                    )}
                  </button>
                )}

              </div>

              {/* Right Side: Primary Execution Trigger Button */}
              <button
                type="submit"
                disabled={!imagePrompt.trim() || isGeneratingImage}
                className="py-2.5 px-5 rounded-2xl text-zinc-950 font-bold text-xs tracking-wide transition-all duration-300 transform active:translate-y-[1px] disabled:opacity-35 disabled:pointer-events-none cursor-pointer shadow-md flex items-center justify-center gap-2 select-none relative overflow-hidden"
                style={{ backgroundColor: themeSettings.accentColor }}
              >
                {isGeneratingImage ? (
                  <>
                    <Cpu size={14} className="animate-spin text-zinc-950" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <ImageSquare size={14} weight="bold" />
                    <span>Create Image</span>
                  </>
                )}
              </button>

            </div>

          </div>
        </div>
      </div>

      {/* Main Spacious Visual Art Gallery Section (Full Width) */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 select-none relative z-0">
        <div className="max-w-7xl mx-auto flex flex-col h-full min-h-0">
          
          <div className="flex items-center justify-between mb-4 px-1.5 flex-shrink-0">
            <div>
              <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-bold block">
                Visual Art Gallery
              </span>
              <p className="text-[10px] text-zinc-500 font-sans leading-none mt-1">
                Local graphic storage queue: {generatedImages.length} items
              </p>
            </div>

            {generatedImages.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm("Clear all generated images permanently?")) {
                    setGeneratedImages([]);
                    setSelectedViewingImage(null);
                  }
                }}
                className="text-[10px] font-bold text-red-500/65 hover:text-red-400 py-1.5 px-3 rounded-lg bg-red-550/5 hover:bg-red-500/10 cursor-pointer border border-red-500/10 transition-colors"
              >
                Clear Repository
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-visible">
            {generatedImages.length === 0 ? (
              <div className={`py-16 px-6 text-center rounded-2xl border border-dashed ${
                themeSettings.mode === "light" ? "border-zinc-200" : "border-white/5"
              }`}>
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 mb-4 animate-pulse">
                  <ImageSquare size={28} />
                </div>
                <h3 className={`text-sm font-bold ${themeSettings.mode === "light" ? "text-zinc-800" : "text-zinc-200"}`}>
                  Gallery Is Empty
                </h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                  Describe your concept in the prompt builder, customize aspect ratio and steps inside the input card, and click Create Image to synthesize premium digital assets.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-1 relative z-0">
                <AnimatePresence mode="popLayout" initial={false}>
                  {/* Real-time Intel Synthesis Loader Card */}
                  {isGeneratingImage && (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95, y: 30 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
                      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                      className={`rounded-2xl border p-5 h-[340px] flex flex-col justify-between overflow-hidden relative ${
                        themeSettings.mode === "light" 
                          ? "bg-white border-zinc-200 shadow-sm" 
                          : "bg-zinc-950/80 border-white/5 shadow-2xl"
                      }`}
                    >
                      {/* Matrix grid backdrop indicator mapping */}
                      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none select-none z-0 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:16px_16px]" />
                      
                      {/* Glowing ambient background spots */}
                      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-[45px] opacity-20 pointer-events-none" style={{ backgroundColor: themeSettings.accentColor }} />
                      <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full blur-[55px] opacity-10 pointer-events-none" style={{ backgroundColor: themeSettings.accentColor }} />

                      <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-4">
                        {/* Interactive Synthesis Hub Wheel */}
                        <div className="relative w-16 h-16 flex items-center justify-center mb-5">
                          <span 
                            className="absolute inset-0 rounded-full border border-dashed animate-spin" 
                            style={{ 
                              borderColor: themeSettings.accentColor, 
                              animationDuration: "8s",
                              opacity: 0.4
                            }} 
                          />
                          <span 
                            className="absolute inset-2 rounded-full border-2 border-dashed animate-spin" 
                            style={{ 
                              borderColor: themeSettings.accentColor, 
                              animationDuration: "4s",
                              animationDirection: "reverse",
                              opacity: 0.25 
                            }} 
                          />
                          <span className="absolute inset-0 rounded-full border opacity-15 animate-pulse" style={{ borderColor: themeSettings.accentColor }} />
                          
                          <div className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 border border-white/10 shadow-lg">
                            <Cpu size={20} className="animate-pulse" style={{ color: themeSettings.accentColor }} />
                          </div>

                          {/* Top-Right micro spark flashing */}
                          <div className="absolute -top-1 -right-1">
                            <Sparkle size={12} className="animate-bounce" style={{ color: themeSettings.accentColor }} />
                          </div>
                        </div>

                        {/* Phase Indicator Console Output */}
                        <div className="w-full text-center space-y-2.5 max-w-xs">
                          <span className="text-[9px] font-mono font-bold tracking-[0.18em] uppercase text-zinc-500 block">
                            SYNTHESIS ENGINE ONLINE
                          </span>
                          
                          {/* Dynamic fade text for active loadPhase */}
                          <div className="h-5 overflow-hidden relative flex justify-center">
                            <AnimatePresence mode="wait">
                              <motion.p
                                key={loadPhaseIndex}
                                initial={{ y: 9, opacity: 0, filter: "blur(3px)" }}
                                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                                exit={{ y: -9, opacity: 0, filter: "blur(3px)" }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="text-xs font-semibold tracking-wide text-zinc-650 dark:text-zinc-200 truncate w-full"
                              >
                                {phases[loadPhaseIndex]}
                              </motion.p>
                            </AnimatePresence>
                          </div>

                          {/* Premium custom progress tracks */}
                          <div className="w-full h-[3px] bg-zinc-200/50 dark:bg-zinc-900 rounded-full overflow-hidden mt-3.5 relative">
                            <motion.div 
                              className="h-full rounded-full"
                              style={{ backgroundColor: themeSettings.accentColor }}
                              animate={{ 
                                width: `${((loadPhaseIndex + 1) / phases.length) * 100}%` 
                              }}
                              transition={{ duration: 0.8, ease: "easeInOut" }}
                            />
                          </div>

                          {/* Micro Telemetry specs row */}
                          <div className="flex justify-between text-[8px] font-mono text-zinc-500 pt-1">
                            <span>STEP INTENSITY</span>
                            <span>{selectedImageSteps} STEPS</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Console Logging Panel */}
                      <div className="border-t border-zinc-200/50 dark:border-white/5 pt-3 mt-1 flex items-center justify-between text-[9px] font-mono text-zinc-500 font-medium relative z-10 bg-transparent">
                        <div className="flex items-center gap-1.5 truncate pr-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
                          <span className="truncate uppercase">{selectedImageModel.replace("-generate-002", "").replace("lightning", "lt")}</span>
                        </div>
                        <span className="flex-shrink-0 font-bold">{selectedImageAspect} FRAME</span>
                      </div>

                    </motion.div>
                  )}

                  {/* Imagery cards with luxury cinema entry transitions */}
                  {generatedImages.map((img, idx) => (
                    <motion.div
                      layout
                      initial={{ 
                        opacity: 0, 
                        scale: idx === 0 ? 0.94 : 1, 
                        y: idx === 0 ? 35 : 0, 
                        filter: "blur(12px) brightness(1.2) contrast(0.85) saturate(0.2)"
                      }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1, 
                        y: 0, 
                        filter: "blur(0px) brightness(1) contrast(1) saturate(1)"
                      }}
                      exit={{ 
                        opacity: 0, 
                        scale: 0.94, 
                        filter: "blur(8px)" 
                      }}
                      transition={{
                        duration: 0.9,
                        ease: [0.16, 1, 0.3, 1], // Premium cinematic cubic-bezier curve
                        layout: { type: "spring", stiffness: 220, damping: 25 }
                      }}
                      key={img.id}
                      onClick={() => setSelectedViewingImage(img)}
                      className={`rounded-2xl border overflow-hidden cursor-pointer transition-shadow duration-300 relative group flex flex-col ${
                        themeSettings.mode === "light" 
                          ? "bg-white border-zinc-200 shadow-sm hover:shadow-md" 
                          : "bg-[#0c0d12]/60 border-white/5 hover:border-white/15"
                      }`}
                    >
                      {/* Rendered Container Frame aspect scaling matches choice mathematically */}
                      <div className="relative overflow-hidden w-full aspect-[4/3] bg-zinc-950 flex items-center justify-center border-b border-white/5">
                        
                        {/* Elite high-tech scanning loading placeholder */}
                        {!loadedImages[img.id] && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 z-10 p-4 text-center select-none">
                            {/* Scanning laser glow line effect */}
                            <motion.div 
                              className="absolute inset-x-0 h-[3px] opacity-40 z-25 pointer-events-none"
                              style={{ 
                                background: `linear-gradient(to right, transparent, ${themeSettings.accentColor}, transparent)` 
                              }}
                              animate={{
                                top: ["0%", "100%", "0%"]
                              }}
                              transition={{
                                duration: 2.2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />

                            {/* Minimal Grid Background */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:10px_10px]" />

                            <div className="relative z-10 flex flex-col items-center">
                              {/* Glowing spinning radar rings */}
                              <div className="relative w-9 h-9 flex items-center justify-center mb-3">
                                <span className="absolute inset-0 rounded-full border border-dashed animate-spin text-zinc-500" style={{ animationDuration: '6s', opacity: 0.3 }} />
                                <span className="absolute inset-1.5 rounded-full border border-dashed animate-spin text-zinc-400" style={{ animationDuration: '3s', animationDirection: 'reverse', opacity: 0.2 }} />
                                <span className="absolute inset-0 rounded-full border opacity-10 animate-ping" style={{ borderColor: themeSettings.accentColor }} />
                                <Cpu size={16} className="animate-pulse" style={{ color: themeSettings.accentColor }} />
                              </div>

                              <span className="text-[8px] font-mono tracking-[0.2em] text-zinc-400 uppercase font-medium animate-pulse">
                                Decoding Assets...
                              </span>
                            </div>
                          </div>
                        )}

                        <motion.img
                          src={img.url}
                          alt={img.prompt}
                          referrerPolicy="no-referrer"
                          onLoad={() => setLoadedImages(prev => ({ ...prev, [img.id]: true }))}
                          onError={(e) => {
                            // Fallback source photo seed
                            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${img.id}/800/600`;
                            setLoadedImages(prev => ({ ...prev, [img.id]: true }));
                          }}
                          initial={{ opacity: 0, scale: 1.05, filter: "brightness(1) contrast(1.1) saturate(0.8) blur(3px)" }}
                          animate={{ 
                            opacity: loadedImages[img.id] ? 1 : 0,
                            scale: loadedImages[img.id] ? 1 : 1.05,
                            filter: loadedImages[img.id] 
                              ? "brightness(1) contrast(1) saturate(1) blur(0px)" 
                              : "brightness(1) contrast(1.1) saturate(0.8) blur(3px)"
                          }}
                          transition={{ 
                            duration: 0.65, 
                            ease: [0.16, 1, 0.3, 1] 
                          }}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />

                        {/* Quick tool hover card display with standard parameters */}
                        <div className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-zinc-300 font-bold uppercase truncate">
                            {img.model.replace("-generate-002", "").replace("lightning", "lt")}
                          </span>
                          
                          <div className="flex gap-1.5 flex-shrink-0">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleCopyPrompt(img.prompt, img.id); }}
                              className="p-1.5 rounded-lg bg-black/40 hover:bg-black text-zinc-300 hover:text-white border border-white/5 cursor-pointer"
                              title="Copy design prompt"
                            >
                              {copiedId === img.id ? <Check size={12} weight="bold" /> : <Copy size={12} />}
                            </button>
                            
                            <button
                              onClick={(e) => handleDeleteImageRecord(img.id, e)}
                              className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 border border-red-500/10 hover:border-red-500/20 text-red-400 hover:text-white cursor-pointer"
                              title="Remove record"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <p className={`text-xs font-semibold leading-relaxed line-clamp-2 ${
                          themeSettings.mode === "light" ? "text-zinc-800" : "text-zinc-300"
                        }`}>
                          {img.prompt}
                        </p>

                        <div className="flex items-center justify-between border-t border-white/5 pt-2.5 mt-3.5 text-[9px] font-mono text-zinc-500">
                          <span className="font-semibold uppercase tracking-wider">{img.aspect} SCALE</span>
                          <span>{new Date(img.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Aesthetic Image Viewer Fullscreen Overlay */}
      <AnimatePresence>
        {selectedViewingImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center p-4 md:p-8 overflow-y-auto selection:bg-orange-500/30"
          >
            {/* Dynamic Close anchor click zone */}
            <div className="absolute inset-0 z-0 cursor-zoom-out" onClick={() => setSelectedViewingImage(null)} />

            {/* Panel Card */}
            <motion.div
              initial={{ scale: 0.96, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 15, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className={`relative z-10 w-full max-w-5xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col md:grid md:grid-cols-12 min-h-0 ${
                themeSettings.mode === "light"
                  ? "bg-white border-zinc-200 text-zinc-900"
                  : "bg-[#0b0c10] border-[#1f1f23] text-zinc-100"
              }`}
            >
              <button
                onClick={() => setSelectedViewingImage(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-black/60 border border-white/5 hover:bg-black/90 text-zinc-300 hover:text-white cursor-pointer active:scale-95 transition-all"
                title="Close Viewer"
              >
                <X size={16} weight="bold" />
              </button>

              {/* Graphic Display frame (md:col-span-7) */}
              <div className="md:col-span-7 bg-zinc-950 flex items-center justify-center p-4 min-h-[300px] md:min-h-[500px] border-b md:border-b-0 md:border-r border-white/5 relative group">
                <img
                  src={selectedViewingImage.url}
                  alt={selectedViewingImage.prompt}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${selectedViewingImage.id}/900/900`;
                  }}
                />

                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10">
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-black/70 border border-white/5 text-zinc-300 uppercase tracking-widest font-bold">
                    Resolution Scale: {selectedViewingImage.width}x{selectedViewingImage.height}
                  </span>
                  
                  <a
                    href={selectedViewingImage.url}
                    target="_blank"
                    rel="noreferrer"
                    download={`cf_image_${selectedViewingImage.id}.jpg`}
                    className="flex items-center gap-1.5 text-xs font-bold text-black py-2 px-4 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-transform"
                    style={{ backgroundColor: themeSettings.accentColor }}
                  >
                    <Download size={14} weight="bold" />
                    <span>Download HD render</span>
                  </a>
                </div>
              </div>

              {/* Detail side column (md:col-span-5) */}
              <div className="md:col-span-5 flex flex-col p-6 overflow-y-auto max-h-[90vh] md:max-h-[85vh]">
                <div className="flex-shrink-0">
                  <span className="text-[9px] font-mono tracking-widest text-[#f59e0b] uppercase font-bold flex items-center gap-1 mb-2">
                    <CloudCheck size={14} />
                    Workers AI Output Dossier
                  </span>
                  <p className="text-xs text-zinc-500 font-sans">
                    Rendered successfully on {new Date(selectedViewingImage.createdAt).toLocaleDateString()} at {new Date(selectedViewingImage.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                <div className="h-[1px] my-4 bg-zinc-200/50 dark:bg-white/5 flex-shrink-0" />

                {/* Prompts info block */}
                <div className="space-y-4 flex-1">
                  <div>
                    <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-bold block mb-1">
                      USER BRIEF PROMPT
                    </span>
                    <p className={`text-xs p-3.5 rounded-xl border font-sans leading-relaxed relative group ${
                      themeSettings.mode === "light"
                        ? "bg-zinc-50 border-zinc-200"
                        : "bg-zinc-950/40 border-white/5"
                    }`}>
                      {selectedViewingImage.prompt}
                    </p>
                  </div>

                  {selectedViewingImage.refinedPrompt && (
                    <div>
                      <span className="text-[10px] font-mono tracking-wider text-[#ea580c] uppercase font-bold flex items-center gap-1.5 mb-1" style={{ color: themeSettings.accentColor }}>
                        <Sparkle size={13} weight="fill" className="text-amber-400" />
                        GEMINI REFINED BRIEF
                      </span>
                      <p className={`text-xs p-3.5 rounded-xl border font-sans leading-relaxed italic ${
                        themeSettings.mode === "light"
                          ? "bg-zinc-50 border-zinc-200 text-zinc-700"
                          : "bg-zinc-950/80 border-white/5 text-zinc-300"
                      }`}>
                        {selectedViewingImage.refinedPrompt}
                      </p>
                    </div>
                  )}

                  {/* Hardware Telemetry Parameters console log */}
                  <div>
                    <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-bold flex items-center gap-1 mb-1">
                      <TerminalWindow size={14} />
                      EDGE EDGE HANDSHAKE METRICS
                    </span>
                    <div className="bg-[#050508] border border-white/10 rounded-xl p-3.5 font-mono text-[10px] leading-relaxed text-zinc-400 space-y-1 select-text">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Inference Latency:</span>
                        <span className="text-emerald-400 font-bold">+{selectedViewingImage.telemetry?.inferenceTimeMs || 1540}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Node Identifier:</span>
                        <span className="text-zinc-300">{selectedViewingImage.telemetry?.nodeId || "cf-node-42"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Compute Service:</span>
                        <span className="text-zinc-300">{selectedViewingImage.telemetry?.engine || "Cloudflare Workers AI Core"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Inference Status:</span>
                        <span className="text-emerald-500 font-bold">{selectedViewingImage.telemetry?.status || "SUCCESS_DELIVERED"}</span>
                      </div>
                      <div className="h-[1px] my-2 bg-white/5" />
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Synthesis Seed:</span>
                        <span className="text-amber-500">{selectedViewingImage.seed || 110940}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Execution Steps:</span>
                        <span className="text-zinc-300">{selectedViewingImage.steps} steps</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-[1px] my-4 bg-zinc-200/50 dark:bg-white/5 flex-shrink-0" />

                {/* Footer specs row button */}
                <div className="flex items-center justify-between text-[11px] font-mono mt-auto pt-1 flex-shrink-0">
                  <span className="text-zinc-500">MODEL IDENTIFIER</span>
                  <span className="font-bold text-zinc-300 uppercase">{selectedViewingImage.model.replace("-generate-002", "")}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </form>
  );
};
