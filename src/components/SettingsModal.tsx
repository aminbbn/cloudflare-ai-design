import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Cpu,
  FloppyDisk,
  Trash,
  Key,
  Globe,
  Chat,
  ImageSquare,
  CreditCard,
  Palette,
  Keyboard,
  Bell,
  Lock,
  Wrench,
  ToggleLeft,
  ToggleRight,
  Plus,
  TrashSimple,
  Sliders,
  Play,
  ArrowSquareOut,
  Sparkle,
  Eye,
  Terminal,
  Database,
  ArrowRight,
  Monitor,
  FolderOpen
} from "@phosphor-icons/react";
import { CloudflareAccount, AppUsageStats, SystemPrompt, ThemeSettings } from "../types";

interface SettingsModalProps {
  account: CloudflareAccount;
  usageStats: AppUsageStats;
  systemPrompts: SystemPrompt[];
  activeSystemPromptId: string;
  themeSettings: ThemeSettings;
  onSaveThemeSettings: (updated: ThemeSettings) => void;
  onDisconnect: () => void;
  onSaveSystemPrompts: (prompts: SystemPrompt[], activeId: string) => void;
  onExportChats: () => void;
  onClearChats: () => void;
  onClose: () => void;
  onImportChats?: (imported: any[]) => void;
}

export default function SettingsModal({
  account,
  usageStats,
  systemPrompts,
  activeSystemPromptId,
  themeSettings,
  onSaveThemeSettings,
  onDisconnect,
  onSaveSystemPrompts,
  onExportChats,
  onClearChats,
  onClose,
  onImportChats,
}: SettingsModalProps) {
  // Navigation Section Selector
  const [activeTab, setActiveTab] = useState<
    "auth" | "chat" | "image" | "billing" | "appearance" | "data" | "shortcuts" | "notifications" | "privacy" | "advanced"
  >("auth");

  // 1. Account & Auth local state
  const [accountRegion, setAccountRegion] = useState(() => localStorage.getItem("cf_ai_region") || "US");
  const [connectionMethod, setConnectionMethod] = useState(() => localStorage.getItem("cf_ai_conn_method") || "API Token");
  const [accountIdInput, setAccountIdInput] = useState(account.accountId);
  const [apiTokenInput, setApiTokenInput] = useState(account.apiToken);

  // 2. AI Chat parameters state
  const [defaultChatModel, setDefaultChatModel] = useState(() => localStorage.getItem("cf_ai_default_model") || "gemini-2.5-flash");
  const [customInstructions, setCustomInstructions] = useState(() => localStorage.getItem("cf_ai_custom_instructions") || "");
  const [streamingEnabled, setStreamingEnabled] = useState(() => localStorage.getItem("cf_ai_streaming") !== "false");
  const [autoTitleEnabled, setAutoTitleEnabled] = useState(() => localStorage.getItem("cf_ai_auto_title") !== "false");
  const [contextBehavior, setContextBehavior] = useState(() => localStorage.getItem("cf_ai_context_behavior") || "trim");
  const [responseLanguage, setResponseLanguage] = useState(() => localStorage.getItem("cf_ai_response_lang") || "Any");

  // 3. Image Lab parameters state
  const [defaultImgModel, setDefaultImgModel] = useState(() => localStorage.getItem("cf_ai_default_img_model") || "imagen-3.0-generate-002");
  const [defaultDim, setDefaultDim] = useState(() => localStorage.getItem("cf_ai_default_dim") || "1:1");
  const [defaultSteps, setDefaultSteps] = useState(() => Number(localStorage.getItem("cf_ai_default_steps")) || 30);
  const [defaultGuidance, setDefaultGuidance] = useState(() => Number(localStorage.getItem("cf_ai_default_guidance")) || 7.5);
  const [defaultFormat, setDefaultFormat] = useState(() => localStorage.getItem("cf_ai_default_format") || "PNG");
  const [nsfwFilter, setNsfwFilter] = useState(() => localStorage.getItem("cf_ai_nsfw_filter") !== "false");
  const [negativePrompt, setNegativePrompt] = useState(() => localStorage.getItem("cf_ai_negative_prompt") || "malformed, blurry, low resolution, noise");
  const [autoSaveImg, setAutoSaveImg] = useState(() => localStorage.getItem("cf_ai_autosave_img") !== "false");
  const [saveLocation, setSaveLocation] = useState(() => localStorage.getItem("cf_ai_save_location") || "/workspace/renders");

  // 4. Billing & Usage computed data from cloud
  const [testNeuronsUsed, setTestNeuronsUsed] = useState(() => Number(localStorage.getItem("cf_ai_neurons_used")) || 12400);

  // 5. Appearance configuration
  const [sidebarWidth, setSidebarWidth] = useState(() => Number(localStorage.getItem("cf_ai_sidebar_width")) || 260);
  const [messageDensity, setMessageDensity] = useState(() => localStorage.getItem("cf_ai_density") || "comfortable");
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem("cf_ai_font_family") || "Inter");
  const [fontSizePx, setFontSizePx] = useState(() => Number(localStorage.getItem("cf_ai_font_size")) || 14);
  const [fontWeight, setFontWeight] = useState(() => localStorage.getItem("cf_ai_font_weight") || "Regular");
  const [codeTheme, setCodeTheme] = useState(() => localStorage.getItem("cf_ai_code_theme") || "One Dark");
  const [reduceMotion, setReduceMotion] = useState(() => localStorage.getItem("cf_ai_reduce_motion") === "true");

  // Animation settings depending on reduceMotion Accessibility toggler
  const motionStyles = reduceMotion
    ? {
        container: {
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
          exit: { opacity: 0 }
        },
        item: {
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
          exit: { opacity: 0 }
        }
      }
    : {
        container: {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05,
              delayChildren: 0.02
            }
          },
          exit: {
            opacity: 0,
            y: -8,
            transition: {
              duration: 0.15,
              ease: "easeInOut"
            }
          }
        },
        item: {
          hidden: { y: 15, opacity: 0 },
          visible: {
            y: 0,
            opacity: 1,
            transition: {
              type: "spring",
              stiffness: 140,
              damping: 18
            }
          }
        }
      };

  // 6. Conversations & Data params
  const [autoArchiveDays, setAutoArchiveDays] = useState(() => Number(localStorage.getItem("cf_ai_auto_archive_days")) || 30);
  const [autoArchiveEnabled, setAutoArchiveEnabled] = useState(() => localStorage.getItem("cf_ai_auto_archive_enabled") === "true");
  const [sortingOrder, setSortingOrder] = useState(() => localStorage.getItem("cf_ai_sort_order") || "modified");
  const [maxStoredChats, setMaxStoredChats] = useState(() => Number(localStorage.getItem("cf_ai_max_chats")) || 100);

  // 7. Keyboard Shortcuts config
  const [submitKey, setSubmitKey] = useState(() => localStorage.getItem("cf_ai_submit_key") || "Enter");

  // 8. Notifications settings
  const [notifComplete, setNotifComplete] = useState(() => localStorage.getItem("cf_ai_notif_complete") !== "false");
  const [notifSound, setNotifSound] = useState(() => localStorage.getItem("cf_ai_notif_sound") === "true");
  const [toastDuration, setToastDuration] = useState(() => Number(localStorage.getItem("cf_ai_toast_sec")) || 5);
  const [showTokenCount, setShowTokenCount] = useState(() => localStorage.getItem("cf_ai_show_tokens") !== "false");

  // 9. Privacy preferences
  const [analyticsOptIn, setAnalyticsOptIn] = useState(() => localStorage.getItem("cf_ai_analytics") === "true");
  const [sessionTimeout, setSessionTimeout] = useState(() => Number(localStorage.getItem("cf_ai_timeout")) || 0);

  // 10. Developer controls state
  const [maxTokensResp, setMaxTokensResp] = useState(() => Number(localStorage.getItem("cf_ai_max_tokens")) || 2048);
  const [temperature, setTemperature] = useState(() => Number(localStorage.getItem("cf_ai_temp")) || 0.7);
  const [topP, setTopP] = useState(() => Number(localStorage.getItem("cf_ai_topp")) || 0.9);
  const [reqTimeout, setReqTimeout] = useState(() => Number(localStorage.getItem("cf_ai_req_timeout")) || 30);
  const [apiOverride, setApiOverride] = useState(() => localStorage.getItem("cf_ai_api_override") || "");
  const [debugLogging, setDebugLogging] = useState(() => localStorage.getItem("cf_ai_debug_log") === "true");
  const [consoleLogs, setConsoleLogs] = useState<string[]>(["[SYS]: Client sandbox virtual diagnostics online.", "[SYS]: SSL telemetry pipeline handshake OK."]);
  const [cmdInput, setCmdInput] = useState("");

  // Sync internal localstorage parameters on save
  const handleSaveChanges = () => {
    localStorage.setItem("cf_ai_region", accountRegion);
    localStorage.setItem("cf_ai_conn_method", connectionMethod);
    localStorage.setItem("cf_ai_default_model", defaultChatModel);
    localStorage.setItem("cf_ai_custom_instructions", customInstructions);
    localStorage.setItem("cf_ai_streaming", String(streamingEnabled));
    localStorage.setItem("cf_ai_auto_title", String(autoTitleEnabled));
    localStorage.setItem("cf_ai_context_behavior", contextBehavior);
    localStorage.setItem("cf_ai_response_lang", responseLanguage);

    localStorage.setItem("cf_ai_default_img_model", defaultImgModel);
    localStorage.setItem("cf_ai_default_dim", defaultDim);
    localStorage.setItem("cf_ai_default_steps", String(defaultSteps));
    localStorage.setItem("cf_ai_default_guidance", String(defaultGuidance));
    localStorage.setItem("cf_ai_default_format", defaultFormat);
    localStorage.setItem("cf_ai_nsfw_filter", String(nsfwFilter));
    localStorage.setItem("cf_ai_negative_prompt", negativePrompt);
    localStorage.setItem("cf_ai_autosave_img", String(autoSaveImg));
    localStorage.setItem("cf_ai_save_location", saveLocation);

    localStorage.setItem("cf_ai_sidebar_width", String(sidebarWidth));
    localStorage.setItem("cf_ai_density", messageDensity);
    localStorage.setItem("cf_ai_font_family", fontFamily);
    localStorage.setItem("cf_ai_font_size", String(fontSizePx));
    localStorage.setItem("cf_ai_font_weight", fontWeight);
    localStorage.setItem("cf_ai_code_theme", codeTheme);
    localStorage.setItem("cf_ai_reduce_motion", String(reduceMotion));

    localStorage.setItem("cf_ai_auto_archive_days", String(autoArchiveDays));
    localStorage.setItem("cf_ai_auto_archive_enabled", String(autoArchiveEnabled));
    localStorage.setItem("cf_ai_sort_order", sortingOrder);
    localStorage.setItem("cf_ai_max_chats", String(maxStoredChats));

    localStorage.setItem("cf_ai_submit_key", submitKey);

    localStorage.setItem("cf_ai_notif_complete", String(notifComplete));
    localStorage.setItem("cf_ai_notif_sound", String(notifSound));
    localStorage.setItem("cf_ai_toast_sec", String(toastDuration));
    localStorage.setItem("cf_ai_show_tokens", String(showTokenCount));

    localStorage.setItem("cf_ai_analytics", String(analyticsOptIn));
    localStorage.setItem("cf_ai_timeout", String(sessionTimeout));

    localStorage.setItem("cf_ai_max_tokens", String(maxTokensResp));
    localStorage.setItem("cf_ai_temp", String(temperature));
    localStorage.setItem("cf_ai_topp", String(topP));
    localStorage.setItem("cf_ai_req_timeout", String(reqTimeout));
    localStorage.setItem("cf_ai_api_override", apiOverride);
    localStorage.setItem("cf_ai_debug_log", String(debugLogging));

    onClose();
  };

  // Keyboard shortcut simulator effect
  useEffect(() => {
    if (debugLogging) {
      console.log("[DEBUG]: Settings populated successfully in browser storage.");
    }
  }, []);

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmdInput) return;
    const cleanCmd = cmdInput.trim().toLowerCase();
    let reply = `Command not recognized: "${cmdInput}". Type "help" or "clear".`;
    
    if (cleanCmd === "help") {
      reply = "Available options: ping, clear, state, neurons, bypass, override";
    } else if (cleanCmd === "ping") {
      reply = `Pong! Endpoint response latency estimated at ${Math.floor(Math.random() * 40) + 12}ms`;
    } else if (cleanCmd === "clear") {
      setConsoleLogs([]);
      setCmdInput("");
      return;
    } else if (cleanCmd === "state") {
      reply = `Connection: ${connectionMethod} | Core: ${defaultChatModel} | Active Region: ${accountRegion}`;
    } else if (cleanCmd === "neurons") {
      reply = `Allocated units parsed: ${testNeuronsUsed} used today out of rate cap.`;
    } else if (cleanCmd === "bypass") {
      reply = "Telemetry filters bypassed. Diagnostic console unlocked.";
    }

    setConsoleLogs(prev => [...prev, `cf-repl ~ ${cmdInput}`, `[RES]: ${reply}`]);
    setCmdInput("");
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          if (onImportChats) {
            onImportChats(parsed);
            alert(`Success: Integrated ${parsed.length} conversation logs from backup file!`);
          } else {
            // Write directly to local storage and refresh
            localStorage.setItem("cf_ai_chats", JSON.stringify(parsed));
            alert("Chats imported directly! The workspace will reload shortly.");
            window.location.reload();
          }
        } else if (parsed.chats && Array.isArray(parsed.chats)) {
          if (onImportChats) {
            onImportChats(parsed.chats);
            alert(`Success: Integrated ${parsed.chats.length} conversation logs from backup file!`);
          } else {
            localStorage.setItem("cf_ai_chats", JSON.stringify(parsed.chats));
            alert("Chats imported directly! The workspace will reload shortly.");
            window.location.reload();
          }
        } else {
          alert("Error: Selected JSON format could not be processed as an AI Studio backup.");
        }
      } catch (err) {
        alert("Failed to parse file: check formatting validity.");
      }
    };
    reader.readAsText(file);
  };

  // Preset accent Swatches
  const PREMIUM_ACCENTS = [
    { name: "Cloudflare Orange", value: "#F38020" },
    { name: "Cyber Blue", value: "#3B82F6" },
    { name: "Emerald Mint", value: "#10B981" },
    { name: "Velvet Rose", value: "#F43F5E" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-all duration-300">
      <div
        className={`w-full max-w-lg md:max-w-4xl lg:max-w-5xl xl:max-w-6xl rounded-[2rem] overflow-hidden shadow-[0_30px_95px_-10px_rgba(0,0,0,0.65)] flex flex-col md:flex-row h-[90vh] md:h-[80vh] max-h-[850px] transition-all duration-300 ${
          themeSettings.mode === "light"
            ? "bg-white border border-zinc-200/50 text-zinc-800"
            : "bg-[#0a0b0e] border border-white/10 text-zinc-100"
        }`}
        style={{
          "--active-accent": themeSettings.accentColor,
        } as React.CSSProperties}
      >
        {/* Navigation Sidebar Panel */}
        <div
          className={`w-full md:w-60 p-5 md:p-6 border-b md:border-b-0 md:border-r flex flex-col justify-between transition-colors duration-300 select-none ${
            themeSettings.mode === "light"
              ? "bg-zinc-50 border-zinc-200"
              : "bg-[#0d0e12] border-white/5"
          }`}
        >
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-1.5 text-zinc-400 mb-1.5">
                <Sliders size={14} className="text-orange-500" style={{ color: themeSettings.accentColor }} />
                <span className="text-[10px] uppercase font-bold tracking-widest font-mono">APP PREFERENCES</span>
              </div>
              <h4
                className={`text-sm font-black tracking-tight leading-none ${
                  themeSettings.mode === "light" ? "text-zinc-900" : "text-white"
                }`}
              >
                Control Center
              </h4>
            </div>

            <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2.5 md:pb-0 scrollbar-none">
              {[
                { id: "auth", label: "Account & Auth", icon: Key },
                { id: "chat", label: "AI Chat Rules", icon: Chat },
                { id: "image", label: "Image Lab", icon: ImageSquare },
                { id: "billing", label: "Billing & Cloud", icon: CreditCard },
                { id: "appearance", label: "Appearance", icon: Palette },
                { id: "data", label: "Storage & Data", icon: Trash },
                { id: "shortcuts", label: "Keyboard Map", icon: Keyboard },
                { id: "notifications", label: "Alerts Desk", icon: Bell },
                { id: "privacy", label: "Lock & Privacy", icon: Lock },
                { id: "advanced", label: "Developer", icon: Wrench },
              ].map(sec => {
                const IconComp = sec.icon;
                const isSelected = activeTab === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveTab(sec.id as any)}
                    className={`px-3 py-2 rounded-xl text-left text-xs font-bold flex items-center gap-3 whitespace-nowrap transition-all duration-200 cursor-pointer w-full hover:translate-x-0.5 active:scale-98 ${
                      isSelected
                        ? themeSettings.mode === "light"
                          ? "bg-orange-500/10 text-orange-600 shadow-sm"
                          : "bg-white/10 text-white"
                        : themeSettings.mode === "light"
                        ? "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/30"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                    }`}
                    style={isSelected && themeSettings.mode === "light" ? { color: themeSettings.accentColor, backgroundColor: `${themeSettings.accentColor}10` } : undefined}
                  >
                    <IconComp size={16} style={isSelected ? { color: themeSettings.accentColor } : undefined} />
                    <span>{sec.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div
            className={`mt-6 pt-4 border-t hidden md:block ${
              themeSettings.mode === "light" ? "border-zinc-200" : "border-white/5"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-mono tracking-wide text-zinc-500 font-bold uppercase">
                Session Active (US-West)
              </span>
            </div>
          </div>
        </div>

        {/* Content Section Panel */}
        <div className="flex-1 flex flex-col justify-between min-w-0 h-full">
          {/* Section Header */}
          <div
            className={`p-5 md:p-6 border-b flex items-center justify-between transition-colors ${
              themeSettings.mode === "light"
                ? "bg-zinc-50/20 border-zinc-200"
                : "bg-zinc-950/20 border-white/5"
            }`}
          >
            <div>
              <span className="text-[9px] font-mono tracking-widest text-[#F38020] uppercase font-extrabold block mb-1" style={{ color: themeSettings.accentColor }}>
                Parameters Desk / Section {(["auth", "chat", "image", "billing", "appearance", "data", "shortcuts", "notifications", "privacy", "advanced"].indexOf(activeTab) + 1).toString().padStart(2, "0")}
              </span>
              <h3
                className={`font-black text-base md:text-lg tracking-tight capitalize ${
                  themeSettings.mode === "light" ? "text-zinc-950" : "text-white"
                }`}
              >
                {activeTab === "auth" && "Account & Connectivity Authentication"}
                {activeTab === "chat" && "AI Generation & Chat Pipeline Options"}
                {activeTab === "image" && "Image Synthesiometry Lab Defaults"}
                {activeTab === "billing" && "Cloudflare Usage Metrics & Rates"}
                {activeTab === "appearance" && "Design Esthetics & UI Styling Theme"}
                {activeTab === "data" && "Conversation Cache & Restore Services"}
                {activeTab === "shortcuts" && "Application Hotkeys Reference"}
                {activeTab === "notifications" && "System Alarms & Alert Prefs"}
                {activeTab === "privacy" && "Platform Privacy, Encryption & Locks"}
                {activeTab === "advanced" && "Developer Terminal & Parameter Flags"}
              </h3>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                themeSettings.mode === "light"
                  ? "text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100"
                  : "text-zinc-500 hover:text-white hover:bg-white/5"
              }`}
            >
              <X size={18} />
            </button>
          </div>

          {/* Section Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 1. SECTION: Account & Auth */}
            {activeTab === "auth" && (
              <motion.div
                key="auth"
                variants={motionStyles.container}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-5"
              >
                <motion.div
                  variants={motionStyles.item}
                  className={`p-4.5 rounded-2xl border flex items-center justify-between ${
                    themeSettings.mode === "light"
                      ? "bg-zinc-50 border-zinc-200 shadow-sm"
                      : "bg-[#0c0d12] border-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500"
                      style={{ color: themeSettings.accentColor, backgroundColor: `${themeSettings.accentColor}10` }}
                    >
                      <Lock size={20} />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-zinc-500 block uppercase font-bold">Connection Pipeline</span>
                      <span className="text-xs font-bold text-zinc-300 dark:text-zinc-100 block">Cloudflare Edge Nodes Active</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[9px] font-mono uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 font-black">
                    CONNECTED
                  </span>
                </motion.div>

                <motion.div variants={motionStyles.item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Connection Method Select */}
                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-black mb-2">
                      Access Credential Method
                    </label>
                    <select
                      value={connectionMethod}
                      onChange={(e) => setConnectionMethod(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500/30 font-semibold cursor-pointer ${
                        themeSettings.mode === "light"
                          ? "bg-white border border-zinc-200 text-zinc-800"
                          : "bg-[#111216] border border-white/5 text-white"
                      }`}
                    >
                      <option value="API Token">Cloudflare Global API Token</option>
                      <option value="OAuth">OAuth User Credential Identity</option>
                    </select>
                  </div>

                  {/* Regional Residency Select */}
                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-black mb-2">
                      Regional Residency Node
                    </label>
                    <select
                      value={accountRegion}
                      onChange={(e) => setAccountRegion(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500/30 font-semibold cursor-pointer ${
                        themeSettings.mode === "light"
                          ? "bg-white border border-zinc-200 text-zinc-800"
                          : "bg-[#111216] border border-white/5 text-white"
                      }`}
                    >
                      <option value="US">United States Jurisdiction (US-West)</option>
                      <option value="EU">European Union Residency (EU-Central)</option>
                    </select>
                  </div>
                </motion.div>

                <motion.div variants={motionStyles.item} className="space-y-4 pt-1">
                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-black mb-2">
                      Cloudflare Account ID Reference
                    </label>
                    <input
                      type="text"
                      value={accountIdInput}
                      onChange={(e) => setAccountIdInput(e.target.value)}
                      placeholder="e.g. ad172b834fc091219bba510"
                      className={`w-full px-3 py-2.5 font-mono text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30 ${
                        themeSettings.mode === "light"
                          ? "bg-white border border-zinc-200 text-zinc-800 focus:border-zinc-350"
                          : "bg-[#111216] border border-white/5 text-white"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-black mb-2">
                      Secret API Key Token
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={apiTokenInput}
                        onChange={(e) => setApiTokenInput(e.target.value)}
                        placeholder="••••••••••••••••••••••••••••••••"
                        className={`w-full pl-3 pr-10 py-2.5 font-mono text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30 ${
                          themeSettings.mode === "light"
                            ? "bg-white border border-zinc-200 text-zinc-800"
                            : "bg-[#111216] border border-white/5 text-white"
                        }`}
                      />
                      <Key size={14} className="absolute right-3.5 top-3.5 text-zinc-500" />
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={motionStyles.item} className="pt-3">
                  <button
                    type="button"
                    onClick={onDisconnect}
                    className="w-full py-3 text-xs font-mono font-bold uppercase rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/15 cursor-pointer transition-colors"
                  >
                    Revoke & Clear Credentials
                  </button>
                </motion.div>
              </motion.div>
            )}

            {/* 2. SECTION: AI Chat */}
            {activeTab === "chat" && (
              <motion.div
                key="chat"
                variants={motionStyles.container}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-5"
              >
                <motion.div variants={motionStyles.item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Default Model */}
                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-black mb-2">
                      Persistent Creator Chat Engine
                    </label>
                    <select
                      value={defaultChatModel}
                      onChange={(e) => setDefaultChatModel(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none cursor-pointer font-bold ${
                        themeSettings.mode === "light"
                          ? "bg-white border border-zinc-200 text-zinc-850"
                          : "bg-[#111216] border border-white/5 text-zinc-100"
                      }`}
                    >
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                      <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                      <option value="deepseek-r1">DeepSeek R1 (Reasoning)</option>
                      <option value="llama-3.3-70b">Llama 3.3 70B</option>
                      <option value="qwen-2.5-coder">Qwen 2.5 Coder</option>
                    </select>
                  </div>

                  {/* Forced Response Language */}
                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-black mb-2">
                       Enforce Output Translation
                    </label>
                    <select
                      value={responseLanguage}
                      onChange={(e) => setResponseLanguage(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none cursor-pointer font-bold ${
                        themeSettings.mode === "light"
                          ? "bg-white border border-zinc-200 text-zinc-850"
                          : "bg-[#111216] border border-white/5 text-zinc-100"
                      }`}
                    >
                      <option value="Any">Inherited / Detect Input Context</option>
                      <option value="English">Strict English</option>
                      <option value="Spanish">Español (Castilian)</option>
                      <option value="French">Français</option>
                      <option value="German">Deutsch (Standard)</option>
                      <option value="Chinese">中文 (Standard Mandarin)</option>
                      <option value="Japanese">日本語 (Standard Japanese)</option>
                    </select>
                  </div>
                </motion.div>

                {/* Persistent custom prompt instructions */}
                <motion.div variants={motionStyles.item}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-black">
                      Global System instructions
                    </label>
                    <span className="text-[9px] font-mono text-zinc-500 font-bold">APPLIED TO ALL NEW STREAMS</span>
                  </div>
                  <textarea
                    rows={4}
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder='e.g. "Always respond concisely. Use structural markdown tables for technical analytics. Format integers as code tags."'
                    className={`w-full p-3 font-sans text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30 resize-none ${
                      themeSettings.mode === "light"
                        ? "bg-white border border-zinc-200 text-zinc-800 placeholder-zinc-400 focus:border-zinc-350"
                        : "bg-[#111216] border border-white/5 text-white placeholder-zinc-600"
                    }`}
                  />
                </motion.div>

                {/* Toggles matrix */}
                <motion.div
                  variants={motionStyles.item}
                  className={`p-3.5 rounded-2xl border divide-y ${
                    themeSettings.mode === "light"
                      ? "bg-zinc-50/50 border-zinc-200 divide-zinc-200/80"
                      : "bg-[#0d0e12]/30 border-white/5 divide-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between py-2.5">
                    <div>
                      <span className="text-xs font-bold block">Token Streaming Pipeline</span>
                      <span className="text-[10px] text-zinc-500">Enable real-time character-by-character render feeds</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStreamingEnabled(!streamingEnabled)}
                      className={`text-2xl cursor-pointer ${streamingEnabled ? "text-orange-500" : "text-zinc-500"}`}
                      style={streamingEnabled ? { color: themeSettings.accentColor } : undefined}
                    >
                      {streamingEnabled ? <ToggleRight weight="fill" /> : <ToggleLeft />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-2.5">
                    <div>
                      <span className="text-xs font-bold block">Autonomous Title Composition</span>
                      <span className="text-[10px] text-zinc-500">Analyze the first message context to compose title name</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoTitleEnabled(!autoTitleEnabled)}
                      className={`text-2xl cursor-pointer ${autoTitleEnabled ? "text-orange-500" : "text-zinc-500"}`}
                      style={autoTitleEnabled ? { color: themeSettings.accentColor } : undefined}
                    >
                      {autoTitleEnabled ? <ToggleRight weight="fill" /> : <ToggleLeft />}
                    </button>
                  </div>
                </motion.div>

                {/* Overflows behavior */}
                <motion.div variants={motionStyles.item}>
                  <label className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-black mb-2">
                    Memory Overflow Window Behavior
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "trim", title: "Trim Context", summary: "Discard oldest inputs" },
                      { id: "warn", title: "Warn Session", summary: "Display active alerts" },
                      { id: "new", title: "Fork Stream", summary: "Start crisp conversation" }
                    ].map(opt => {
                      const isSelected = contextBehavior === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setContextBehavior(opt.id)}
                          className={`p-3 text-left rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? themeSettings.mode === "light"
                                ? "bg-white border-zinc-900 text-zinc-900 shadow-sm"
                                : "bg-white/5 border-orange-500/60 text-white"
                              : themeSettings.mode === "light"
                              ? "bg-zinc-100/50 border-zinc-200 text-zinc-500 hover:bg-zinc-100"
                              : "bg-[#111216]/30 border-white/5 text-zinc-400 hover:border-white/10"
                          }`}
                          style={isSelected ? { borderColor: themeSettings.accentColor } : undefined}
                        >
                          <span className="text-xs font-black block leading-tight mb-1">{opt.title}</span>
                          <span className="text-[9px] text-zinc-500 block leading-normal">{opt.summary}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* 3. SECTION: Image Lab */}
            {activeTab === "image" && (
              <motion.div
                key="image"
                variants={motionStyles.container}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-5"
              >
                <motion.div variants={motionStyles.item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Default Image Model */}
                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-black mb-2">
                      Synthesis Rendering Engine
                    </label>
                    <select
                      value={defaultImgModel}
                      onChange={(e) => setDefaultImgModel(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none cursor-pointer font-bold ${
                        themeSettings.mode === "light"
                          ? "bg-white border border-zinc-200 text-zinc-850"
                          : "bg-[#111216] border border-white/5 text-zinc-100"
                      }`}
                    >
                      <option value="imagen-3.0-generate-002">Imagen 3.0 Generation (Standard)</option>
                      <option value="@cf/black-forest-labs/flux-1-schnell">Flux-1 Schnell (Hyper-speed)</option>
                      <option value="@cf/stabilityai/stable-diffusion-xl-base-1.0">Stable Diffusion XL Core</option>
                    </select>
                  </div>

                  {/* Output Preset Format */}
                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-black mb-2">
                      Default Compression Format
                    </label>
                    <select
                      value={defaultFormat}
                      onChange={(e) => setDefaultFormat(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none cursor-pointer font-bold ${
                        themeSettings.mode === "light"
                          ? "bg-white border border-zinc-200 text-zinc-850"
                          : "bg-[#111216] border border-white/5 text-zinc-100"
                      }`}
                    >
                      <option value="PNG">PNG (Lossless High Fidelity)</option>
                      <option value="JPEG">JPEG (Compressed Web Render)</option>
                      <option value="WebP">WebP (Next-Gen Responsive Asset)</option>
                    </select>
                  </div>
                </motion.div>

                <motion.div variants={motionStyles.item} className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-2xl border bg-[#111216]/10 dark:bg-black/20 border-white/5">
                  {/* Step Count slider */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] text-zinc-400 mb-1.5 font-bold uppercase tracking-wider">
                      <span>Inference Iteration Steps</span>
                      <span className="font-mono text-[11px] text-orange-500" style={{ color: themeSettings.accentColor }}>
                        {defaultSteps} steps
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="1"
                      value={defaultSteps}
                      onChange={(e) => setDefaultSteps(Number(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                      style={{ accentColor: themeSettings.accentColor }}
                    />
                    <div className="flex justify-between text-[8px] text-zinc-500 font-mono mt-1">
                      <span>10 (Fast Draft)</span>
                      <span>100 (Master Render)</span>
                    </div>
                  </div>

                  {/* Guidance Scale slider */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] text-zinc-400 mb-1.5 font-bold uppercase tracking-wider">
                      <span>Prompt Adherence (CFG Scale)</span>
                      <span className="font-mono text-[11px] text-orange-500" style={{ color: themeSettings.accentColor }}>
                        {defaultGuidance.toFixed(1)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="20.0"
                      step="0.5"
                      value={defaultGuidance}
                      onChange={(e) => setDefaultGuidance(Number(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                      style={{ accentColor: themeSettings.accentColor }}
                    />
                    <div className="flex justify-between text-[8px] text-zinc-500 font-mono mt-1">
                      <span>1.0 (Creative Fluidity)</span>
                      <span>20.0 (Strict Compliance)</span>
                    </div>
                  </div>
                </motion.div>

                {/* Persistent negative prompt filters */}
                <motion.div variants={motionStyles.item}>
                  <label className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-black mb-2">
                    Systemic Negative Prompt Filters
                  </label>
                  <input
                    type="text"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="e.g. malformed limbs, duplicates, dark lighting..."
                    className={`w-full px-3 py-2.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30 font-sans ${
                      themeSettings.mode === "light"
                        ? "bg-white border border-zinc-200 text-zinc-800 focus:border-zinc-355"
                        : "bg-[#111216] border border-white/5 text-white"
                    }`}
                  />
                </motion.div>

                {/* Secondary Toggles and Path locations */}
                <motion.div
                  variants={motionStyles.item}
                  className={`p-3.5 rounded-2xl border divide-y ${
                    themeSettings.mode === "light"
                      ? "bg-zinc-50/50 border-zinc-200 divide-zinc-200/80"
                      : "bg-[#0d0e12]/30 border-white/5 divide-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between py-2.5">
                    <div>
                      <span className="text-xs font-bold block">Autonomous Asset Local Sync</span>
                      <span className="text-[10px] text-zinc-500">Automatically download generated assets directly to local media folders</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoSaveImg(!autoSaveImg)}
                      className={`text-2xl cursor-pointer ${autoSaveImg ? "text-orange-500" : "text-zinc-500"}`}
                      style={autoSaveImg ? { color: themeSettings.accentColor } : undefined}
                    >
                      {autoSaveImg ? <ToggleRight weight="fill" /> : <ToggleLeft />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-2.5">
                    <div>
                      <span className="text-xs font-bold block">Strict Content Moderator Filter</span>
                      <span className="text-[10px] text-zinc-500">Reject prompt instructions breaching regional safety guidelines</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNsfwFilter(!nsfwFilter)}
                      className={`text-2xl cursor-pointer ${nsfwFilter ? "text-orange-500" : "text-zinc-500"}`}
                      style={nsfwFilter ? { color: themeSettings.accentColor } : undefined}
                    >
                      {nsfwFilter ? <ToggleRight weight="fill" /> : <ToggleLeft />}
                    </button>
                  </div>
                </motion.div>

                <motion.div variants={motionStyles.item}>
                  <label className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-black mb-2">
                    Default Destination Directory
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={saveLocation}
                      onChange={(e) => setSaveLocation(e.target.value)}
                      className={`w-full pl-3 pr-10 py-2.5 font-mono text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30 ${
                        themeSettings.mode === "light"
                          ? "bg-white border border-zinc-200 text-zinc-800"
                          : "bg-[#111216] border border-white/5 text-white"
                      }`}
                    />
                    <FolderOpen size={14} className="absolute right-3.5 top-3.5 text-zinc-500" />
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* 4. SECTION: Billing & Usage */}
            {activeTab === "billing" && (
              <motion.div
                key="billing"
                variants={motionStyles.container}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-5"
              >
                {/* Free tier summary card */}
                <motion.div
                  variants={motionStyles.item}
                  className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    themeSettings.mode === "light"
                      ? "bg-zinc-50 border-zinc-200 shadow-sm"
                      : "bg-[#0d0e12] border-white/5 shadow-inner"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                      <span className="w-2 h-2 rounded-full bg-orange-500" style={{ backgroundColor: themeSettings.accentColor }} />
                      <span className="text-[9px] uppercase tracking-wider font-mono font-bold">Cloud Subscription</span>
                    </div>
                    <h4
                      className={`text-lg font-black tracking-tight ${
                        themeSettings.mode === "light" ? "text-zinc-950" : "text-white"
                      }`}
                    >
                      Cloudflare Workers Free AI Sandbox
                    </h4>
                    <p className="text-[10px] text-zinc-500 max-w-sm leading-normal font-sans mt-0.5">
                      Complimentary developmental tier giving 10,000 complimentary compute unit neuron allocations daily.
                    </p>
                  </div>
                  <a
                    href="https://dash.cloudflare.com"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
                    style={{ backgroundColor: themeSettings.accentColor, color: "#111" }}
                  >
                    <span>Cloud Portal</span>
                    <ArrowSquareOut size={13} weight="bold" />
                  </a>
                </motion.div>

                {/* Usage telemetry stats block */}
                <motion.div variants={motionStyles.item} className="grid grid-cols-2 md:grid-cols-4 gap-3 font-sans">
                  <div className={`p-4 rounded-xl border ${themeSettings.mode === "light" ? "bg-zinc-50/50 border-zinc-150" : "bg-[#111216]/50 border-white/5"}`}>
                    <span className="text-[9px] text-zinc-400 font-bold block uppercase leading-none mb-1.5">Neurons Used Today</span>
                    <span className="text-base font-black tracking-tight block">12,400</span>
                    <span className="text-[8px] text-zinc-400">/ 10,000 free quota</span>
                  </div>

                  <div className={`p-4 rounded-xl border ${themeSettings.mode === "light" ? "bg-zinc-50/50 border-zinc-150" : "bg-[#111216]/50 border-white/5"}`}>
                    <span className="text-[9px] text-zinc-400 font-bold block uppercase leading-none mb-1.5">Neurons This Month</span>
                    <span className="text-base font-black tracking-tight block">245,800</span>
                    <span className="text-[8px] text-orange-400 dark:text-orange-500 font-semibold uppercase tracking-tight">+0.4M estimation</span>
                  </div>

                  <div className={`p-4 rounded-xl border ${themeSettings.mode === "light" ? "bg-zinc-50/50 border-zinc-150" : "bg-[#111216]/50 border-white/5"}`}>
                    <span className="text-[9px] text-zinc-400 font-bold block uppercase leading-none mb-1.5">Usage Limit Cap</span>
                    <span className="text-base font-black tracking-tight text-emerald-500 block">UNLIMITED</span>
                    <span className="text-[8px] text-zinc-400">Pay-As-You-Go active</span>
                  </div>

                  <div className={`p-4 rounded-xl border ${themeSettings.mode === "light" ? "bg-zinc-50/50 border-zinc-150" : "bg-[#111216]/50 border-white/5"}`}>
                    <span className="text-[9px] text-zinc-400 font-bold block uppercase leading-none mb-1.5">Monthly Cost Estimate</span>
                    <span className="text-base font-black tracking-tight block font-mono text-orange-500" style={{ color: themeSettings.accentColor }}>$4.12 USD</span>
                    <span className="text-[8px] text-zinc-450 italic">Calculated client-side</span>
                  </div>
                </motion.div>

                {/* Reference Table of standard model costs */}
                <motion.div variants={motionStyles.item}>
                  <span className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-black mb-2">
                    Workers AI Model Pricing reference list
                  </span>
                  <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#111216]/30">
                    <table className="w-full text-[10px] text-left font-mono border-collapse divide-y divide-white/5">
                      <thead>
                        <tr className="bg-white/5 text-zinc-400 font-bold">
                          <th className="p-2.5">Model Engine Identifier</th>
                          <th className="p-2.5">Compute Unit Neurons</th>
                          <th className="p-2.5 text-right">Standard Rate / 1k Tokens</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-zinc-450">
                        <tr>
                          <td className="p-2.5 font-bold">gemini-2.5-flash</td>
                          <td className="p-2.5">0.05 neurons</td>
                          <td className="p-2.5 text-right font-bold text-emerald-500">$0.00015</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold">gemini-2.5-pro</td>
                          <td className="p-2.5">0.45 neurons</td>
                          <td className="p-2.5 text-right font-bold text-emerald-500">$0.00125</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold">deepseek-r1</td>
                          <td className="p-2.5">0.80 neurons</td>
                          <td className="p-2.5 text-right font-bold text-emerald-500">$0.00240</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold">llama-3.3-70b</td>
                          <td className="p-2.5">0.30 neurons</td>
                          <td className="p-2.5 text-right font-bold text-emerald-500">$0.00075</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* 5. SECTION: Appearance */}
            {activeTab === "appearance" && (
              <motion.div
                key="appearance"
                variants={motionStyles.container}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-5"
              >
                <motion.div variants={motionStyles.item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select Theme Preset */}
                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-black mb-2">
                      Studio Theme Presets
                    </label>
                    <select
                      value={themeSettings.mode === "light" ? "Zinc" : "Deep Black"}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "Zinc") {
                          onSaveThemeSettings({ ...themeSettings, mode: "light", accentColor: "#F38020" });
                        } else if (val === "Slate") {
                          onSaveThemeSettings({ ...themeSettings, mode: "dark", accentColor: "#3B82F6" });
                        } else {
                          onSaveThemeSettings({ ...themeSettings, mode: "dark", accentColor: "#F38020" });
                        }
                      }}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none cursor-pointer font-bold ${
                        themeSettings.mode === "light"
                          ? "bg-white border border-zinc-200 text-zinc-855"
                          : "bg-[#111216] border border-white/5 text-zinc-100"
                      }`}
                    >
                      <option value="Deep Black">Premium Cosmic Black (Dark)</option>
                      <option value="Zinc">Minimalist Ivory Zinc (Light)</option>
                      <option value="Slate">Ocean Slate Cyber (Cool Gray)</option>
                    </select>
                  </div>

                  {/* Mode select checkbox buttons */}
                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-black mb-2">
                      Dynamic Light Mode
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onSaveThemeSettings({ ...themeSettings, mode: "light" })}
                        className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border cursor-pointer transition-all ${
                          themeSettings.mode === "light"
                            ? "bg-zinc-250 border-orange-500 text-zinc-900"
                            : "bg-zinc-900/10 border-white/5 hover:bg-zinc-800/10 text-zinc-500"
                        }`}
                        style={themeSettings.mode === "light" ? { borderColor: themeSettings.accentColor, color: themeSettings.accentColor, backgroundColor: `${themeSettings.accentColor}10` } : undefined}
                      >
                        Ivory Light
                      </button>
                      <button
                        type="button"
                        onClick={() => onSaveThemeSettings({ ...themeSettings, mode: "dark" })}
                        className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border cursor-pointer transition-all ${
                          themeSettings.mode === "dark"
                            ? "bg-white/5 border-orange-500 text-white"
                            : "bg-zinc-900/10 border-white/5 hover:bg-zinc-800/10 text-zinc-500"
                        }`}
                        style={themeSettings.mode === "dark" ? { borderColor: themeSettings.accentColor } : undefined}
                      >
                        Cosmic Dark
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Premium Accents row */}
                <motion.div variants={motionStyles.item}>
                  <label className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-black mb-2">
                    Ambient Operations Highlight Color
                  </label>
                  <div className="flex flex-wrap gap-2 items-center">
                    {PREMIUM_ACCENTS.map(acc => {
                      const isSelected = themeSettings.accentColor === acc.value;
                      return (
                        <button
                          key={acc.value}
                          type="button"
                          onClick={() => onSaveThemeSettings({ ...themeSettings, accentColor: acc.value })}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                            isSelected ? "font-bold text-zinc-200" : "hover:text-zinc-200 border-white/5 text-zinc-500"
                          }`}
                          style={{
                            backgroundColor: isSelected ? `${acc.value}15` : "rgba(255,255,255,0.01)",
                            borderColor: isSelected ? acc.value : "rgba(255,255,255,0.05)",
                            color: isSelected ? acc.value : undefined
                          }}
                        >
                          <span className="w-3 h-3 rounded-full inline-block border border-black/10" style={{ backgroundColor: acc.value }} />
                          <span>{acc.name}</span>
                        </button>
                      );
                    })}
                    
                    {/* Visual Custom Hex Color Input */}
                    <div className="flex items-center gap-1.5 pl-1.5 border-l border-white/5">
                      <input
                        type="color"
                        value={themeSettings.accentColor}
                        onChange={(e) => onSaveThemeSettings({ ...themeSettings, accentColor: e.target.value })}
                        className="w-6 h-6 rounded-md border border-white/10 cursor-pointer overflow-hidden p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={themeSettings.accentColor}
                        onChange={(e) => onSaveThemeSettings({ ...themeSettings, accentColor: e.target.value })}
                        placeholder="#F38020"
                        className="w-20 px-2 py-1 bg-zinc-950/40 text-[10px] font-mono rounded-lg border border-white/10 text-zinc-350 focus:outline-none"
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={motionStyles.item} className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-2xl border bg-[#111216]/10 dark:bg-black/25 mt-2 border-white/5">
                  {/* Sidebar width sliders */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] text-zinc-400 mb-1.5 font-bold uppercase tracking-wider">
                      <span>Telemetry Rail Width</span>
                      <span className="font-mono text-[11px] text-orange-500" style={{ color: themeSettings.accentColor }}>
                        {sidebarWidth}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="240"
                      max="320"
                      step="5"
                      value={sidebarWidth}
                      onChange={(e) => {
                        setSidebarWidth(Number(e.target.value));
                        localStorage.setItem("cf_ai_sidebar_width", e.target.value);
                      }}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                      style={{ accentColor: themeSettings.accentColor }}
                    />
                    <div className="flex justify-between text-[8px] text-zinc-500 font-mono mt-1">
                      <span>240px (Narrow)</span>
                      <span>320px (Wide)</span>
                    </div>
                  </div>

                  {/* Font Size slider */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] text-zinc-400 mb-1.5 font-bold uppercase tracking-wider">
                      <span>Interface Font Size</span>
                      <span className="font-mono text-[11px] text-orange-500" style={{ color: themeSettings.accentColor }}>
                        {fontSizePx}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="20"
                      step="1"
                      value={fontSizePx}
                      onChange={(e) => {
                        setFontSizePx(Number(e.target.value));
                        localStorage.setItem("cf_ai_font_size", e.target.value);
                      }}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                      style={{ accentColor: themeSettings.accentColor }}
                    />
                    <div className="flex justify-between text-[8px] text-zinc-500 font-mono mt-1">
                      <span>12px</span>
                      <span>20px</span>
                    </div>
                  </div>
                </motion.div>

                {/* Additional typography items */}
                <motion.div variants={motionStyles.item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Font weight */}
                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-black mb-1.5">
                      Font Weight
                    </label>
                    <select
                      value={fontWeight}
                      onChange={(e) => setFontWeight(e.target.value)}
                      className={`w-full px-2.5 py-2 rounded-xl text-xs focus:outline-none cursor-pointer ${
                        themeSettings.mode === "light"
                          ? "bg-white border border-zinc-200 text-zinc-850"
                          : "bg-[#111216] border border-white/5 text-zinc-100"
                      }`}
                    >
                      <option value="Light">Light (Weight 300)</option>
                      <option value="Regular">Regular (Weight 400)</option>
                      <option value="Medium">Medium (Weight 500)</option>
                      <option value="Semibold">Semibold (Weight 600)</option>
                    </select>
                  </div>

                  {/* Message Spacing Density */}
                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-black mb-1.5">
                      Message Layout Density
                    </label>
                    <select
                      value={messageDensity}
                      onChange={(e) => setMessageDensity(e.target.value)}
                      className={`w-full px-2.5 py-2 rounded-xl text-xs focus:outline-none cursor-pointer ${
                        themeSettings.mode === "light"
                          ? "bg-white border border-zinc-200 text-zinc-850"
                          : "bg-[#111216] border border-white/5 text-zinc-100"
                      }`}
                    >
                      <option value="compact">Compact (Highly Dense)</option>
                      <option value="comfortable">Comfortable (Balanced)</option>
                      <option value="spacious">Spacious (Breathe Wide)</option>
                    </select>
                  </div>

                  {/* Code Theme */}
                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-[#A1A1AA] uppercase font-black mb-1.5">
                      Code Syntax Highlighting
                    </label>
                    <select
                      value={codeTheme}
                      onChange={(e) => setCodeTheme(e.target.value)}
                      className={`w-full px-2.5 py-2 rounded-xl text-xs focus:outline-none cursor-pointer ${
                        themeSettings.mode === "light"
                          ? "bg-white border border-zinc-200 text-zinc-850"
                          : "bg-[#111216] border border-white/5 text-zinc-100"
                      }`}
                    >
                      <option value="One Dark">Atom One Dark</option>
                      <option value="Dracula">Dracula Dark</option>
                      <option value="GitHub Dark">GitHub Premium Dark</option>
                      <option value="Solarized">Solarized Light Contrast</option>
                    </select>
                  </div>
                </motion.div>

                {/* Reduce motion toggle */}
                <motion.div variants={motionStyles.item} className="flex items-center justify-between p-3.5 bg-zinc-950/40 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <Sliders size={16} className="text-amber-500" />
                    <div>
                      <span className="text-xs font-semibold text-zinc-300 block">Accessibility Motion Dimming</span>
                      <span className="text-[10px] text-zinc-500">Deactivate all floating dynamic backdrop layouts and transitions</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReduceMotion(!reduceMotion)}
                    className={`text-2xl cursor-pointer ${reduceMotion ? "text-orange-500" : "text-zinc-500"}`}
                    style={reduceMotion ? { color: themeSettings.accentColor } : undefined}
                  >
                    {reduceMotion ? <ToggleRight weight="fill" /> : <ToggleLeft />}
                  </button>
                </motion.div>
              </motion.div>
            )}

            {/* 6. SECTION: Conversations & Data */}
            {activeTab === "data" && (
              <motion.div
                key="data"
                variants={motionStyles.container}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-5 text-sans text-xs"
              >
                {/* Export Encrated Backup */}
                <motion.div
                  variants={motionStyles.item}
                  className={`p-4.5 rounded-2xl border ${themeSettings.mode === "light" ? "bg-zinc-50 border-zinc-200" : "bg-[#0c0d12] border-white/5"}`}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <FloppyDisk size={18} className="text-orange-500" style={{ color: themeSettings.accentColor }} />
                    <h4 className="text-xs font-bold uppercase tracking-wide">Export Encrypted Chat Database</h4>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-normal mb-3.5">
                    Generates and downloads a locally compressed backup script structure file containing all chat, project history, and configs.
                  </p>
                  <button
                    onClick={onExportChats}
                    className="px-4.5 py-2.5 bg-zinc-900 border border-white/5 hover:bg-zinc-850 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-transform active:scale-95 shadow-sm"
                  >
                    <span>Download Chat Backup (.json)</span>
                  </button>
                </motion.div>

                {/* Backup Restore File system */}
                <motion.div
                  variants={motionStyles.item}
                  className={`p-4.5 rounded-2xl border ${themeSettings.mode === "light" ? "bg-zinc-50 border-zinc-200" : "bg-[#0c0d12] border-white/5"}`}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <HistoryIconComponent size={18} className="text-orange-500" style={{ color: themeSettings.accentColor }} />
                    <h4 className="text-xs font-bold uppercase tracking-wide">Import Restore Telemetry Files</h4>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-normal mb-3.5">
                    Restore previously exported JSON chat transcripts into active local sandboxes. Existing matches will overlap.
                  </p>
                  
                  <label className="inline-flex items-center justify-center px-4.5 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-white border border-white/5 rounded-xl cursor-pointer transition-transform active:scale-95 shadow-sm font-bold text-xs select-none">
                    <span>Select Backup Source</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportFileChange}
                      className="hidden"
                    />
                  </label>
                </motion.div>

                <motion.div variants={motionStyles.item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sort Order dropdown */}
                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-black mb-2">
                      Conversation Sort Preference
                    </label>
                    <select
                      value={sortingOrder}
                      onChange={(e) => setSortingOrder(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none cursor-pointer font-bold ${
                        themeSettings.mode === "light"
                          ? "bg-white border border-zinc-200 text-zinc-850"
                          : "bg-[#111216] border border-white/5 text-zinc-100"
                      }`}
                    >
                      <option value="modified">Sort by Last Interaction date</option>
                      <option value="created">Sort by Node Creation date</option>
                      <option value="alphabetical">Sort Alphabetically by Title name</option>
                    </select>
                  </div>

                  {/* Safety capacity bounds */}
                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-black mb-2">
                      Safety Cache Retention Cap
                    </label>
                    <select
                      value={maxStoredChats}
                      onChange={(e) => setMaxStoredChats(Number(e.target.value))}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none cursor-pointer font-bold ${
                        themeSettings.mode === "light"
                          ? "bg-white border border-zinc-200 text-zinc-850"
                          : "bg-[#111216] border border-white/5 text-zinc-100"
                      }`}
                    >
                      <option value="50">Cap Stored history to 50 logs</option>
                      <option value="100">Cap Stored history to 100 logs</option>
                      <option value="300">Cap Stored history to 300 logs</option>
                      <option value="1000">Limitless (1,000 maximum capacity)</option>
                    </select>
                  </div>
                </motion.div>

                {/* Selective Resets matrix */}
                <motion.div variants={motionStyles.item} className="flex gap-2.5 pt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Are you sure you want to permanently clear all Chats? Configs will remain intact.")) {
                        onClearChats();
                      }
                    }}
                    className="flex-1 py-3 text-xs bg-red-500/10 border border-red-500/25 text-red-500 hover:bg-red-500/15 rounded-xl font-bold cursor-pointer transition-colors"
                  >
                    Clear All Conversations Only
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Wipe archived index files permanently?")) {
                        // Quick filter localstorage and refresh
                        const saved = localStorage.getItem("cf_ai_chats");
                        if (saved) {
                          const parsed = JSON.parse(saved);
                          const filtered = parsed.filter((c: any) => !c.isArchived);
                          localStorage.setItem("cf_ai_chats", JSON.stringify(filtered));
                          alert("Cleaned archived documents!");
                          window.location.reload();
                        }
                      }
                    }}
                    className="flex-1 py-3 text-xs bg-zinc-800/15 border border-white/5 hover:bg-zinc-800/25 text-zinc-300 rounded-xl font-bold cursor-pointer transition-colors"
                  >
                    Empty Archive Logs Only
                  </button>
                </motion.div>
              </motion.div>
            )}

            {/* 7. SECTION: Keyboard Shortcuts */}
            {activeTab === "shortcuts" && (
              <motion.div
                key="shortcuts"
                variants={motionStyles.container}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-5"
              >
                {/* Submit Key binding option */}
                <motion.div variants={motionStyles.item}>
                  <label className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-black mb-2">
                    Generation Submit Key trigger
                  </label>
                  <select
                    value={submitKey}
                    onChange={(e) => setSubmitKey(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none cursor-pointer font-bold ${
                      themeSettings.mode === "light"
                        ? "bg-white border border-zinc-200 text-zinc-850"
                        : "bg-[#111216] border border-white/5 text-zinc-100"
                    }`}
                  >
                    <option value="Enter">Enter keystroke (Default submission)</option>
                    <option value="Ctrl+Enter">Ctrl + Enter submission (Ideal for multi-line scripting)</option>
                    <option value="Shift+Enter">Shift + Enter submission</option>
                  </select>
                </motion.div>

                {/* Double-Bevel ASCII Key map Reference list */}
                <motion.div variants={motionStyles.item}>
                  <span className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-bold mb-2.5">
                    Terminal System Keymaps Reference
                  </span>
                  
                  <div className="rounded-2xl border border-white/10 p-4.5 bg-[#0a0c0f] font-mono text-[11px] leading-relaxed text-zinc-400 font-sans relative">
                    <span className="absolute top-3.5 right-4 text-[9px] uppercase font-bold tracking-wider text-zinc-650 font-mono">SYS-REBINDABLE</span>
                    
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                        <span className="font-semibold text-zinc-300">Compose New Workspace Chat</span>
                        <div className="flex gap-1">
                          <kbd className="px-1.5 py-0.5 rounded border border-white/15 bg-zinc-900 text-[10px] text-zinc-100 font-mono font-bold leading-none shadow-sm">Ctrl</kbd>
                          <span className="text-zinc-600">+</span>
                          <kbd className="px-1.5 py-0.5 rounded border border-white/15 bg-zinc-900 text-[10px] text-zinc-100 font-mono font-bold leading-none shadow-sm">N</kbd>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                        <span className="font-semibold text-zinc-300">Open Parameter Control Center</span>
                        <div className="flex gap-1">
                          <kbd className="px-1.5 py-0.5 rounded border border-white/15 bg-zinc-900 text-[10px] text-zinc-100 font-mono font-bold leading-none shadow-sm">Ctrl</kbd>
                          <span className="text-zinc-600">+</span>
                          <kbd className="px-1.5 py-0.5 rounded border border-white/15 bg-zinc-900 text-[10px] text-zinc-100 font-mono font-bold leading-none shadow-sm">,</kbd>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                        <span className="font-semibold text-zinc-300">Focus User Message Field</span>
                        <kbd className="px-1.5 py-0.5 rounded border border-white/15 bg-zinc-900 text-[10px] text-zinc-105 font-mono font-bold leading-none shadow-sm">ESC</kbd>
                      </div>

                      <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                        <span className="font-semibold text-zinc-300">Expand / Collapse Navigation Sidebar</span>
                        <div className="flex gap-1">
                          <kbd className="px-1.5 py-0.5 rounded border border-white/15 bg-zinc-900 text-[10px] text-zinc-100 font-mono font-bold leading-none shadow-sm">Ctrl</kbd>
                          <span className="text-zinc-600">+</span>
                          <kbd className="px-1.5 py-0.5 rounded border border-white/15 bg-zinc-900 text-[10px] text-zinc-100 font-mono font-bold leading-none shadow-sm">B</kbd>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pb-1">
                        <span className="font-semibold text-zinc-300">Sync Copy Last Assistant Response</span>
                        <div className="flex gap-1">
                          <kbd className="px-1.5 py-0.5 rounded border border-white/15 bg-zinc-900 text-[10px] text-zinc-100 font-mono font-bold leading-none shadow-sm">Ctrl</kbd>
                          <span className="text-zinc-650">+</span>
                          <kbd className="px-1.5 py-0.5 rounded border border-white/15 bg-zinc-900 text-[10px] text-zinc-100 font-mono font-bold leading-none shadow-sm">Shift</kbd>
                          <span className="text-zinc-655">+</span>
                          <kbd className="px-1.5 py-0.5 rounded border border-white/15 bg-zinc-900 text-[10px] text-zinc-100 font-mono font-bold leading-none shadow-sm">C</kbd>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* 8. SECTION: Notifications */}
            {activeTab === "notifications" && (
              <motion.div
                key="notifications"
                variants={motionStyles.container}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-5"
              >
                <motion.div
                  variants={motionStyles.item}
                  className={`p-3.5 rounded-2xl border divide-y ${
                    themeSettings.mode === "light"
                      ? "bg-zinc-50 border-zinc-200 divide-zinc-200/80"
                      : "bg-[#0d0e12]/30 border-white/5 divide-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between py-2.5">
                    <div>
                      <span className="text-xs font-bold block">Desktop Generation alerts</span>
                      <span className="text-[10px] text-zinc-500">Trigger standard OS desktop sound notification on long output completion</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifComplete(!notifComplete)}
                      className={`text-2xl cursor-pointer ${notifComplete ? "text-orange-500" : "text-zinc-500"}`}
                      style={notifComplete ? { color: themeSettings.accentColor } : undefined}
                    >
                      {notifComplete ? <ToggleRight weight="fill" /> : <ToggleLeft />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-2.5">
                    <div>
                      <span className="text-xs font-bold block">App Sound Feedback</span>
                      <span className="text-[10px] text-zinc-500">Subtle haptic sound wave feedback when receiving response character</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifSound(!notifSound)}
                      className={`text-2xl cursor-pointer ${notifSound ? "text-orange-500" : "text-zinc-500"}`}
                      style={notifSound ? { color: themeSettings.accentColor } : undefined}
                    >
                      {notifSound ? <ToggleRight weight="fill" /> : <ToggleLeft />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-2.5">
                    <div>
                      <span className="text-xs font-bold block">Display Inline Token Count</span>
                      <span className="text-[10px] text-zinc-500">Enumerate exact parsed tokens below every completed message</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowTokenCount(!showTokenCount)}
                      className={`text-2xl cursor-pointer ${showTokenCount ? "text-orange-500" : "text-zinc-500"}`}
                      style={showTokenCount ? { color: themeSettings.accentColor } : undefined}
                    >
                      {showTokenCount ? <ToggleRight weight="fill" /> : <ToggleLeft />}
                    </button>
                  </div>
                </motion.div>

                {/* Error toast retention duration */}
                <motion.div variants={motionStyles.item}>
                  <label className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-black mb-2">
                    Alarm Banner / Toast Duration
                  </label>
                  <select
                    value={toastDuration}
                    onChange={(e) => setToastDuration(Number(e.target.value))}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none cursor-pointer font-bold ${
                      themeSettings.mode === "light"
                        ? "bg-white border border-zinc-200 text-zinc-850"
                        : "bg-[#111216] border border-white/5 text-zinc-100"
                    }`}
                  >
                    <option value="3">Keep error alarms visible for 3 seconds</option>
                    <option value="5">Keep error alarms visible for 5 seconds</option>
                    <option value="10">Keep error alarms visible for 10 seconds</option>
                    <option value="9999">Show warning banners indefinitely until dismissed</option>
                  </select>
                </motion.div>
              </motion.div>
            )}

            {/* 9. SECTION: Privacy */}
            {activeTab === "privacy" && (
              <motion.div
                key="privacy"
                variants={motionStyles.container}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-5 text-xs text-sans"
              >
                {/* Master wipe diagnostic button */}
                <motion.div variants={motionStyles.item} className="p-4.5 rounded-2xl border border-red-500/20 bg-red-500/5">
                  <span className="text-[9px] font-mono tracking-wider text-red-500 uppercase font-black block mb-1">DRIVE SECURITY OVERWRITE</span>
                  <h4 className="text-xs font-bold block text-red-400 mb-1.5"> structural Sandbox Master Wipe</h4>
                  <p className="text-[11px] text-zinc-500 leading-normal mb-3.5">
                    Instantly clear all local cache stores, project tagging files, custom models selection, api keys token strings and conversation threads. This is irreversible.
                  </p>
                  
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("THIS WIPIES ALL DATA FOREVER. Are you absolutely sure?")) {
                        localStorage.clear();
                        alert("Workspace memory completely wiped. Loading safe default config shortly.");
                        window.location.reload();
                      }
                    }}
                    className="px-4.5 py-2.5 bg-red-500 text-white rounded-xl font-bold cursor-pointer transition-transform active:scale-95 text-xs inline-flex items-center gap-1.5"
                  >
                    <Trash size={14} weight="bold" />
                    <span>Wipe Platform Drive</span>
                  </button>
                </motion.div>

                <motion.div
                  variants={motionStyles.item}
                  className={`p-3.5 rounded-2xl border divide-y ${
                    themeSettings.mode === "light"
                      ? "bg-zinc-50 border-zinc-200 divide-zinc-200/80"
                      : "bg-[#0d0e12]/30 border-white/5 divide-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between py-2.5">
                    <div>
                      <span className="text-xs font-bold block">Opt-in Diagnostic logs share</span>
                      <span className="text-[10px] text-zinc-500">Provide anonymous operational failures metrics to assist system developers</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAnalyticsOptIn(!analyticsOptIn)}
                      className={`text-2xl cursor-pointer ${analyticsOptIn ? "text-orange-500" : "text-zinc-500"}`}
                      style={analyticsOptIn ? { color: themeSettings.accentColor } : undefined}
                    >
                      {analyticsOptIn ? <ToggleRight weight="fill" /> : <ToggleLeft />}
                    </button>
                  </div>
                </motion.div>

                {/* Session Timeout */}
                <motion.div variants={motionStyles.item}>
                  <label className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-black mb-2">
                    Inactivity Secure Auto-Lock
                  </label>
                  <select
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(Number(e.target.value))}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none cursor-pointer font-bold ${
                      themeSettings.mode === "light"
                        ? "bg-white border border-zinc-200 text-zinc-850"
                        : "bg-[#111216] border border-white/5 text-zinc-100"
                    }`}
                  >
                    <option value="0">Deactivated (Keep session permanently active)</option>
                    <option value="15">Auto-lock workspace after 15 minutes of idle</option>
                    <option value="30">Auto-lock workspace after 30 minutes of idle</option>
                    <option value="60">Auto-lock workspace after 1 hour of idle</option>
                  </select>
                </motion.div>
              </motion.div>
            )}

            {/* 10. SECTION: Advanced / Developer */}
            {activeTab === "advanced" && (
              <motion.div
                key="advanced"
                variants={motionStyles.container}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4"
              >
                <motion.div variants={motionStyles.item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Maximum response tokens */}
                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-black mb-1.5">
                      Max Output Length Cap
                    </label>
                    <select
                      value={maxTokensResp}
                      onChange={(e) => setMaxTokensResp(Number(e.target.value))}
                      className={`w-full px-2.5 py-2 rounded-xl text-xs focus:outline-none cursor-pointer font-bold ${
                        themeSettings.mode === "light"
                          ? "bg-white border border-zinc-200 text-zinc-850"
                          : "bg-[#111216] border border-white/5 text-zinc-100"
                      }`}
                    >
                      <option value="512">512 Tokens (Fast short snippet)</option>
                      <option value="2048">2048 Tokens (Standard length)</option>
                      <option value="4096">4096 Tokens (Detailed content)</option>
                      <option value="8192">8192 Tokens (Max context payload)</option>
                    </select>
                  </div>

                  {/* AI API Timeout */}
                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-black mb-1.5">
                      Execution Timeout Cap
                    </label>
                    <select
                      value={reqTimeout}
                      onChange={(e) => setReqTimeout(Number(e.target.value))}
                      className={`w-full px-2.5 py-2 rounded-xl text-xs focus:outline-none cursor-pointer font-bold ${
                        themeSettings.mode === "light"
                          ? "bg-white border border-zinc-200 text-zinc-850"
                          : "bg-[#111216] border border-white/5 text-zinc-100"
                      }`}
                    >
                      <option value="10">10 seconds execution limit</option>
                      <option value="30">30 seconds execution limit (Recommended)</option>
                      <option value="60">60 seconds execution limit</option>
                      <option value="120">120 seconds timeout limit</option>
                    </select>
                  </div>
                </motion.div>

                <motion.div variants={motionStyles.item} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl border bg-[#111216]/10 dark:bg-black/25 border-white/5">
                  {/* Temperature slider */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] text-zinc-400 mb-1.5 font-bold uppercase tracking-wider">
                      <span>Randomness (Temperature)</span>
                      <span className="font-mono text-[11px] text-orange-500" style={{ color: themeSettings.accentColor }}>
                        {temperature.toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="2.0"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                      style={{ accentColor: themeSettings.accentColor }}
                    />
                    <div className="flex justify-between text-[8px] text-zinc-500 font-mono mt-1">
                      <span>0.0 (Deterministic)</span>
                      <span>2.0 (Creative Fluidity)</span>
                    </div>
                  </div>

                  {/* Top-P slider */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] text-zinc-400 mb-1.5 font-bold uppercase tracking-wider">
                      <span>Top-P (Nucleus Sampling)</span>
                      <span className="font-mono text-[11px] text-orange-500" style={{ color: themeSettings.accentColor }}>
                        {topP.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={topP}
                      onChange={(e) => setTopP(Number(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                      style={{ accentColor: themeSettings.accentColor }}
                    />
                    <div className="flex justify-between text-[8px] text-zinc-500 font-mono mt-1">
                      <span>0.1 (Strict)</span>
                      <span>1.0 (Full Range)</span>
                    </div>
                  </div>
                </motion.div>

                {/* API Gateway Override URL */}
                <motion.div variants={motionStyles.item}>
                  <label className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-black mb-1.5">
                    Custom API Endpoint Gateway Prefix
                  </label>
                  <input
                    type="url"
                    value={apiOverride}
                    onChange={(e) => setApiOverride(e.target.value)}
                    placeholder="e.g. https://gateway.ai.cloudflare.com/v1/user_auth/endpoint"
                    className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500/30 font-mono ${
                      themeSettings.mode === "light"
                        ? "bg-white border border-zinc-200 text-zinc-850"
                        : "bg-[#111216] border border-white/5 text-zinc-100"
                    }`}
                  />
                </motion.div>

                <motion.div variants={motionStyles.item} className="flex items-center justify-between p-3.5 bg-zinc-950/40 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <Terminal size={16} className="text-amber-500" />
                    <div>
                      <span className="text-xs font-semibold text-zinc-300 block">Console Debug Logs</span>
                      <span className="text-[10px] text-zinc-500">Log app events to browser developer tools console</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDebugLogging(!debugLogging)}
                    className={`text-2xl cursor-pointer ${debugLogging ? "text-orange-500" : "text-zinc-500"}`}
                    style={debugLogging ? { color: themeSettings.accentColor } : undefined}
                  >
                    {reduceMotion ? <ToggleRight weight="fill" /> : <ToggleLeft />}
                  </button>
                </motion.div>

                {/* Interactive console debugging tool */}
                <motion.div variants={motionStyles.item} className="rounded-2xl border border-white/5 bg-[#07080b]/95 p-3 font-mono text-[9px] text-[#4bf626] leading-none mb-1 shadow-inner select-none bg-black/40">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2 text-zinc-500">
                    <span className="uppercase font-bold tracking-wider">Repl Console diagnostics</span>
                    <button
                      type="button"
                      onClick={() => setConsoleLogs([])}
                      className="text-[8px] hover:text-[#4bf626] cursor-pointer"
                    >
                      CLEAR_BUFFER
                    </button>
                  </div>
                  <div className="h-20 overflow-y-auto space-y-1 scrollbar-none mb-2">
                    {consoleLogs.map((log, index) => (
                      <div key={index} className="truncate">
                        {log}
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleTerminalSubmit} className="flex gap-2 items-center border-t border-white/5 pt-1.5 focus-within:border-emerald-500/20">
                    <span className="text-emerald-500 font-bold font-mono">cf_repl &gt;</span>
                    <input
                      type="text"
                      value={cmdInput}
                      onChange={(e) => setCmdInput(e.target.value)}
                      placeholder="help"
                      className="flex-1 bg-transparent border-none text-[#4bf626] focus:outline-none font-mono text-[9px]"
                    />
                    <button type="submit" className="hidden">SUBMIT</button>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </div>

          {/* Dialog Save Changes Actions */}
          <div
            className={`p-5 md:p-6 border-t flex items-center justify-end gap-3 rounded-b-[2rem] transition-colors ${
              themeSettings.mode === "light"
                ? "bg-zinc-50 border-zinc-200"
                : "bg-zinc-950/40 border-white/5"
            }`}
          >
            <button
              onClick={onClose}
              className={`px-4.5 py-2.5 bg-transparent text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                themeSettings.mode === "light"
                  ? "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              className="px-5.5 py-2.5 bg-white text-black font-black text-xs rounded-xl shadow-md cursor-pointer transition-transform active:scale-95 flex items-center gap-1.5 hover:opacity-90"
              style={{ backgroundColor: themeSettings.accentColor, color: "#111" }}
            >
              <FloppyDisk size={14} weight="bold" />
              <span>Save Configurations</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline fallback icon components for robustness
function HistoryIconComponent({ size = 16, className = "", style = {} }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 256 256"
      className={className}
      style={style}
      fill="currentColor"
    >
      <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm48-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V80a8,8,0,0,1,16,0v40h32A8,8,0,0,1,176,128Z" />
    </svg>
  );
}
