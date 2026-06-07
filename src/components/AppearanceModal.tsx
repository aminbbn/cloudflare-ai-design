import React, { useState } from "react";
import { Sun, Moon, Sparkle, Image as ImageIcon, TextT, TextAlignLeft, Sliders, X, Check } from "@phosphor-icons/react";
import { ThemeSettings } from "../types";

interface AppearanceModalProps {
  settings: ThemeSettings;
  onSave: (updatedSettings: ThemeSettings) => void;
  onClose: () => void;
}

const LANDSCAPE_PRESETS = [
  { name: "Mountain Peak", url: "https://picsum.photos/seed/mountain_snow/1920/1080" },
  { name: "Desert Dunes", url: "https://picsum.photos/seed/desert_dunes/1920/1080" },
  { name: "Forest Silence", url: "https://picsum.photos/seed/forest_lake/1920/1080" },
  { name: "Sunset Horizon", url: "https://picsum.photos/seed/sunset_coast/1920/1080" },
];

const ABSTRACT_PRESETS = [
  { name: "Solar Flares", url: "https://picsum.photos/seed/sunset_glow/1920/1080" },
  { name: "Deep Neon Void", url: "https://picsum.photos/seed/neon_dark/1920/1080" },
  { name: "Matrix Grid", url: "https://picsum.photos/seed/cyber_mesh/1920/1080" },
  { name: "Obsidian Flow", url: "https://picsum.photos/seed/liquid_glass/1920/1080" },
];

const ACCENT_COLORS = [
  { name: "Cloudflare Orange", value: "#F38020" },
  { name: "Clean Silver-White", value: "#FFFFFF" },
  { name: "Carbon Zinc", value: "#71717A" },
];

export default function AppearanceModal({ settings, onSave, onClose }: AppearanceModalProps) {
  const [localSettings, setLocalSettings] = useState<ThemeSettings>({ ...settings });
  const [customBgUrl, setCustomBgUrl] = useState("");

  const handleApplyPreset = (url: string) => {
    setLocalSettings(prev => ({
      ...prev,
      backgroundType: "image",
      backgroundImageUrl: url,
    }));
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customBgUrl) return;
    setLocalSettings(prev => ({
      ...prev,
      backgroundType: "image",
      backgroundImageUrl: customBgUrl,
    }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-950 border border-white/10 rounded-3xl shadow-[0_30px_70px_rgba(0,0,0,0.8)] text-zinc-200"
        style={{ "--active-accent": localSettings.accentColor } as React.CSSProperties}
      >
        {/* Header bar of Dialog */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <Sliders size={20} className="text-orange-500" style={{ color: localSettings.accentColor }} />
            <div>
              <h3 className="font-bold text-lg font-sans tracking-tight text-white">Appearance & Core Esthetics</h3>
              <p className="text-[11px] text-zinc-400">Fine-tune background mesh, dynamic lighting, and readability filters</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer text-zinc-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Theme Mode Preference selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
              Application Base Theme Theme
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLocalSettings(prev => ({ ...prev, mode: "dark" }))}
                className={`py-3.5 px-4 rounded-xl border flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                  localSettings.mode === "dark"
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-900/10 hover:bg-zinc-800/10 text-zinc-400"
                }`}
                style={{ borderColor: localSettings.mode === "dark" ? localSettings.accentColor : "rgba(255,255,255,0.05)" }}
              >
                <Moon size={18} weight={localSettings.mode === "dark" ? "fill" : "regular"} />
                <span className="text-sm font-semibold">Dark Mode</span>
              </button>

              <button
                type="button"
                onClick={() => setLocalSettings(prev => ({ ...prev, mode: "light" }))}
                className={`py-3.5 px-4 rounded-xl border flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                  localSettings.mode === "light"
                    ? "bg-white text-zinc-900"
                    : "bg-zinc-900/10 hover:bg-zinc-800/10 text-zinc-400"
                }`}
                style={{ borderColor: localSettings.mode === "light" ? localSettings.accentColor : "rgba(255,255,255,0.05)" }}
              >
                <Sun size={18} weight={localSettings.mode === "light" ? "fill" : "regular"} />
                <span className="text-sm font-semibold">Light Mode</span>
              </button>
            </div>
          </div>

          {/* Accent Color System */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
              Accent Operations Highlight color
            </label>
            <div className="flex flex-wrap gap-2.5">
              {ACCENT_COLORS.map(color => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setLocalSettings(prev => ({ ...prev, accentColor: color.value }))}
                  className="px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                  style={{
                    backgroundColor: localSettings.accentColor === color.value ? `${color.value}15` : "rgba(255,255,255,0.02)",
                    borderColor: localSettings.accentColor === color.value ? color.value : "rgba(255,255,255,0.05)",
                    color: localSettings.accentColor === color.value ? color.value : "#a1a1aa",
                  }}
                >
                  <span 
                    className="w-3.5 h-3.5 rounded-full inline-block border border-black/10" 
                    style={{ backgroundColor: color.value }}
                  />
                  {color.name}
                </button>
              ))}
            </div>
          </div>

          {/* Background Selection Section */}
          <div className="space-y-4 pt-1 border-t border-white/5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Backgound Style Matrix
              </label>
              <div className="flex bg-zinc-950 p-1 rounded-lg border border-white/5 text-[11px] font-semibold text-zinc-400">
                {(["minimal", "abstract", "image"] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setLocalSettings(prev => ({ ...prev, backgroundType: type }))}
                    className={`px-3 py-1 rounded-md transition-colors capitalize ${
                      localSettings.backgroundType === type ? "bg-white/10 text-white" : "hover:text-zinc-300"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {localSettings.backgroundType !== "minimal" && (
              <div className="space-y-4">
                {/* Image presets */}
                <div className="space-y-3 p-3 bg-zinc-950/60 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
                    Telemetry Scenery presets
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(localSettings.backgroundType === "image" ? LANDSCAPE_PRESETS : ABSTRACT_PRESETS).map(preset => {
                      const isActive = localSettings.backgroundImageUrl === preset.url;
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => handleApplyPreset(preset.url)}
                          className="group relative h-16 rounded-xl overflow-hidden border border-white/5 text-left transition-all cursor-pointer focus:outline-none"
                          style={{
                            borderColor: isActive ? localSettings.accentColor : "rgba(255,255,255,0.05)",
                            boxShadow: isActive ? `0 0 10px ${localSettings.accentColor}40` : "none"
                          }}
                        >
                          <img 
                            src={preset.url} 
                            alt={preset.name}
                            referrerPolicy="no-referrer"
                            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-85 transition-opacity" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
                          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                            <span className="text-[10px] font-medium text-white tracking-tight leading-none drop-shadow-sm truncate">
                              {preset.name}
                            </span>
                            {isActive && (
                              <span className="p-0.5 rounded-full bg-orange-500 text-zinc-950" style={{ backgroundColor: localSettings.accentColor }}>
                                <Check size={8} weight="bold" />
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Background URL upload */}
                  <form onSubmit={handleApplyCustomUrl} className="flex gap-2 pt-1">
                    <input
                      type="url"
                      placeholder="Insert custom unsplash or background image link..."
                      value={customBgUrl}
                      onChange={(e) => setCustomBgUrl(e.target.value)}
                      className="flex-1 px-3 py-2 bg-zinc-900 border border-white/5 rounded-lg text-xs focus:outline-none text-white focus:border-orange-500 transition-colors"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-white/10 text-xs font-semibold rounded-lg hover:bg-white/15 transition-colors cursor-pointer text-zinc-200"
                    >
                      Apply Link
                    </button>
                  </form>
                </div>

                {/* Opacity & Blur Slider settings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-zinc-950/30 rounded-2xl border border-white/5">
                  {/* Background Opacity */}
                  <div>
                    <div className="flex justify-between items-center text-xs text-zinc-400 mb-1.5 font-bold uppercase tracking-wider">
                      <span>Background Opacity</span>
                      <span className="font-mono text-[11px]" style={{ color: localSettings.accentColor }}>
                        {localSettings.backgroundOpacity}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={localSettings.backgroundOpacity}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, backgroundOpacity: Number(e.target.value) }))}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      style={{ accentColor: localSettings.accentColor }}
                    />
                  </div>

                  {/* Background Blur */}
                  <div>
                    <div className="flex justify-between items-center text-xs text-zinc-400 mb-1.5 font-bold uppercase tracking-wider">
                      <span>Background Lens Blur</span>
                      <span className="font-mono text-[11px]" style={{ color: localSettings.accentColor }}>
                        {localSettings.backgroundBlur}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={localSettings.backgroundBlur}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, backgroundBlur: Number(e.target.value) }))}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      style={{ accentColor: localSettings.accentColor }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Typography configuration */}
        <div className="p-6 space-y-4 pt-1 border-t border-white/5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Font family selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Font Family Typeface
              </label>
              <select
                value="Inter"
                disabled
                className="w-full px-3 py-2.5 bg-zinc-950/40 border border-white/5 rounded-xl text-xs focus:outline-none transition-colors text-zinc-550 cursor-not-allowed"
              >
                <option value="Inter">Inter (Swiss Premium - Locked)</option>
              </select>
            </div>

            {/* Font size picker */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Base Interface Font Size
              </label>
              <div className="grid grid-cols-4 gap-1.5 bg-zinc-950/80 p-1 rounded-xl border border-white/5">
                {(["sm", "base", "lg", "xl"] as const).map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setLocalSettings(prev => ({ ...prev, fontSize: size }))}
                    className={`py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider ${
                      localSettings.fontSize === size 
                        ? "bg-white/10 text-white" 
                        : "hover:text-zinc-300 text-zinc-500"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Toggle buttons for visual details */}
          <div className="flex items-center justify-between p-3.5 bg-zinc-950/40 rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              <Sparkle size={16} className="text-amber-500" />
              <div>
                <span className="text-xs font-semibold text-zinc-300 block">Glassmorphism Card Filters</span>
                <span className="text-[10px] text-zinc-500">Apply ambient backdrop filter to content containers for overlay depth</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={localSettings.cardBlur} 
                onChange={(e) => setLocalSettings(prev => ({ ...prev, cardBlur: e.target.checked }))}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-300 after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500" style={{ accentColor: localSettings.accentColor }} />
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/5 bg-zinc-950/60 flex items-center justify-end gap-3 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-transparent hover:bg-white/5 text-xs font-semibold text-zinc-400 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-white text-black font-semibold text-xs rounded-xl hover:bg-zinc-100 transition-colors active:scale-95 cursor-pointer flex items-center gap-1.5"
            style={{ backgroundColor: localSettings.accentColor, color: "#000" }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
