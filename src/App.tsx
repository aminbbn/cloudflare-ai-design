import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Cloud, 
  Plus, 
  MagnifyingGlass, 
  Archive, 
  FolderPlus, 
  Folder, 
  Gear, 
  Palette, 
  PaperPlaneRight, 
  Paperclip, 
  Trash, 
  Pencil, 
  Check, 
  Copy, 
  X, 
  ArrowClockwise, 
  CloudCheck,
  Note,
  Terminal,
  FileCode,
  ImageSquare,
  Presentation,
  ChatCircle,
  FolderOpen,
  Cpu,
  Sparkle
} from "@phosphor-icons/react";

import { 
  Chat, 
  Message, 
  Project, 
  SystemPrompt, 
  CloudflareAccount, 
  AppUsageStats, 
  ThemeSettings 
} from "./types";

import LoginModal from "./components/LoginModal";
import AppearanceModal from "./components/AppearanceModal";
import SettingsModal from "./components/SettingsModal";
import ShinyText from "./components/ShinyText";

const MODEL_NAMES: Record<string, string> = {
  "gemini-2.5-flash": "Gemini 2.5 Flash",
  "gemini-2.5-pro": "Gemini 2.5 Pro",
  "deepseek-r1": "DeepSeek R1 (Reasoning)",
  "llama-3.3-70b": "Llama 3.3 70B",
  "qwen-2.5-coder": "Qwen 2.5 Coder"
};

const getModelDisplayName = (modelId?: string, fallbackId?: string) => {
  const targetId = modelId || fallbackId || "gemini-2.5-flash";
  return MODEL_NAMES[targetId] || MODEL_NAMES["gemini-2.5-flash"];
};

const getModelInitials = (modelId?: string, fallbackId?: string) => {
  const name = getModelDisplayName(modelId, fallbackId);
  if (name.includes("Gemini")) return "GM";
  if (name.includes("DeepSeek") || name.includes("R1")) return "DS";
  if (name.includes("Llama")) return "LL";
  if (name.includes("Qwen")) return "QW";
  return "AI";
};

// Pre-seeded Default Projects
const DEFAULT_PROJECTS: Project[] = [
  { id: "proj_edge", title: "Cloud Serverless", color: "#F38020" },
  { id: "proj_sec", title: "WAF & Security", color: "#FFFFFF" },
  { id: "proj_cdn", title: "Anycast CDN Content", color: "#FDBA74" },
  { id: "proj_seo", title: "SEO Optimizations", color: "#71717A" },
];

// Pre-seeded Default System Prompts
const DEFAULT_SYSTEM_PROMPTS: SystemPrompt[] = [
  { 
    id: "prompt_expert", 
    label: "Cloudflare Cloud Expert", 
    prompt: "You are Cloudflare AI, an elite systems architect. Provide extremely clear, technical answers dense with code snippets, configuration models, and low-latency considerations. Use professional developer language at all times." 
  },
  { 
    id: "prompt_sec", 
    label: "WAF Security Auditor", 
    prompt: "You are a Cloudflare WAF Security Auditor. Analyze queries for vulnerabilities, advise on DDoS mitigation, rate limiting, and draft bulletproof Custom WAF rules using standard rule syntax." 
  },
  { 
    id: "prompt_general", 
    label: "General Assistant Mode", 
    prompt: "You are a helpful conversational AI assistant. Keep responses clear, precise, nicely formatted in markdown, and optimized for general utility tasks." 
  }
];

// Pre-populated default chats
const INITIAL_CHATS: Chat[] = [
  {
    id: "chat_workers_setup",
    title: "Worker Image Proxy Handler",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    isArchived: false,
    projectId: "proj_edge",
    messages: [
      {
        id: "m_w1",
        role: "user",
        text: "How do I rewrite clean image URLs to an underlying asset bucket inside a Cloudflare Worker proxy?",
        timestamp: "10:15 AM"
      },
      {
        id: "m_w2",
        role: "assistant",
        text: "Here is a highly optimized Cloudflare Worker router script to proxy image URL segments safely to an S3 or R2 storage bucket:\n\n```typescript\nexport default {\n  async fetch(request, env, ctx) {\n    const url = new URL(request.url);\n    \n    // Parse paths matching /images/:key\n    const match = url.pathname.match(/^\\/images\\/(.+)/);\n    if (!match) {\n      return new Response(\"Image path invalid\", { status: 400 });\n    }\n    \n    const assetKey = match[1];\n    const targetUri = `https://${env.R2_BUCKET_ID}.r2.cloudflarestorage.com/${assetKey}`;\n    \n    // Optimize and forward headers with Anycast caching rules\n    const modifiedHeaders = new Headers(request.headers);\n    modifiedHeaders.set(\"Host\", new URL(targetUri).host);\n    \n    return fetch(targetUri, {\n      method: request.method,\n      headers: modifiedHeaders\n    });\n  }\n};\n```\nEnsure you configure the `R2_BUCKET_ID` inside your `wrangler.toml` file to route coordinates securely.",
        timestamp: "10:17 AM"
      }
    ]
  },
  {
    id: "chat_waf_custom",
    title: "SQL Injection Prevention",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    isArchived: false,
    projectId: "proj_sec",
    messages: [
      {
        id: "m_s1",
        role: "user",
        text: "Can you design a custom WAF express rule to flag potential SQL injections?",
        timestamp: "Yesterday, 3:30 PM"
      },
      {
        id: "m_s2",
        role: "assistant",
        text: "Here is a recommended Cloudflare WAF Expression to block common SQL injection patterns on entry routes, specifically targeted at headers and query segments:\n\n```cloudflare\n(http.request.uri.path contains \"/api/\" and (\n  http.request.uri.query contains \"union\" or \n  http.request.uri.query contains \"select\" or \n  http.request.uri.query contains \"--\" or\n  http.request.uri.query contains \"/*\" or\n  http.request.uri.query contains \"xp_cmdshell\"\n)) or (http.user_agent contains \"sqlmap\")\n```\nThis firewall rule performs matching against SQL tokens and common scanning agents, blocklisting them at the firewall level with 0ms backend latency cost.",
        timestamp: "Yesterday, 3:32 PM"
      }
    ]
  }
];

const INITIAL_THEME: ThemeSettings = {
  mode: "dark",
  accentColor: "#F38020", // Cloudflare Orange
  backgroundType: "minimal",
  backgroundImageUrl: "",
  backgroundOpacity: 0,
  backgroundBlur: 0,
  fontFamily: "Inter",
  fontSize: "base",
  cardBlur: false,
};

const WordByWordAnimator: React.FC<{ text: string; isLatest: boolean }> = ({ text, isLatest }) => {
  if (!text) return null;
  
  if (!isLatest) {
    return <span>{text}</span>;
  }

  const tokens = text.split(/(\s+)/);

  return (
    <>
      {tokens.map((token, idx) => {
        if (/^\s+$/.test(token)) {
          return <span key={idx}>{token}</span>;
        }
        return (
          <motion.span
            key={idx}
            initial={{ opacity: 0, filter: "blur(3px)", y: 2 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{
              duration: 0.18,
              delay: Math.min(idx * 0.012, 1.8),
              ease: [0.16, 1, 0.3, 1]
            }}
            className="inline-block"
          >
            {token}
          </motion.span>
        );
      })}
    </>
  );
};

const CloudflareAILoader: React.FC<{ accentColor: string }> = ({ accentColor }) => {
  const [dots, setDots] = useState(".");
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    "Contacting Cloudflare edge neurons",
    "Allocating Llama weights on Workers",
    "Synthesizing latent variables",
    "Optimizing premium response text"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
    }, 450);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 2500);
    return () => clearInterval(stepInterval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12, filter: "blur(3px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-3 p-4 rounded-xl bg-zinc-950/15 border border-white/5 text-left relative overflow-hidden shadow-lg mt-2"
    >
      <div className="flex items-center gap-4 relative z-10">
        <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-zinc-900 border border-white/10 overflow-visible">
          <motion.div 
            className="absolute inset-0 rounded-xl pointer-events-none opacity-25 filter blur-sm"
            style={{ backgroundColor: accentColor }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.45, 0.2]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <svg viewBox="0 0 94 94" className="w-5 h-5 z-10">
            <defs>
              <linearGradient id="cfLoaderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={accentColor} />
                <stop offset="100%" stopColor="#f38020" />
              </linearGradient>
            </defs>
            <path 
              fill="url(#cfLoaderGrad)" 
              d="M83.4,45.6c-.7-10.7-9.5-19.1-20.3-19.1-3.9,0-7.5,1.1-10.6,3.1C47.8,21.9,39,17,29,17,14.6,17,3,28.6,3,43c0,12,8.2,22,19.3,24.8l56.8,0c8.1-1,14.3-7.9,14.3-16.2C93.4,48.5,89.5,45.6,83.4,45.6z" 
            />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-300">
            <span>Thinking</span>
            <span className="inline-block w-4 text-left">{dots}</span>
          </div>
          <div className="h-4 overflow-hidden relative mt-0.5 animate-pulse">
            <div
              className="text-[10px] font-mono uppercase tracking-widest text-zinc-400"
              style={{ color: `${accentColor}cc` }}
            >
              {steps[activeStep]}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-0.5 bg-zinc-900 border border-white/5 rounded-full relative overflow-hidden">
          <motion.div 
            className="w-1/3 h-full absolute top-0 bottom-0 rounded-full font-sans"
            style={{ 
              background: `linear-gradient(90deg, transparent, ${accentColor}, #f97316, transparent)` 
            }}
            animate={{
              left: ["-100%", "100%"]
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  // --- Persistent States ---
  const [account, setAccount] = useState<CloudflareAccount | null>(() => {
    const saved = localStorage.getItem("cf_ai_account");
    return saved ? JSON.parse(saved) : null;
  });

  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem("cf_ai_chats");
    return saved ? JSON.parse(saved) : INITIAL_CHATS;
  });

  const seenMessageIds = useRef<Set<string>>(null!);
  if (!seenMessageIds.current) {
    const ids = new Set<string>();
    const saved = localStorage.getItem("cf_ai_chats");
    const parsed: Chat[] = saved ? JSON.parse(saved) : INITIAL_CHATS;
    parsed.forEach(c => {
      if (c && c.messages) {
        c.messages.forEach(m => {
          ids.add(m.id);
        });
      }
    });
    seenMessageIds.current = ids;
  }

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem("cf_ai_projects");
    return saved ? JSON.parse(saved) : DEFAULT_PROJECTS;
  });

  const [systemPrompts, setSystemPrompts] = useState<SystemPrompt[]>(() => {
    const saved = localStorage.getItem("cf_ai_prompts");
    return saved ? JSON.parse(saved) : DEFAULT_SYSTEM_PROMPTS;
  });

  const [activePromptId, setActivePromptId] = useState<string>(() => {
    return localStorage.getItem("cf_ai_active_prompt_id") || "prompt_expert";
  });

  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
    const saved = localStorage.getItem("cf_ai_theme");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.backgroundType === "abstract" && parsed.backgroundImageUrl?.includes("picsum")) {
          return INITIAL_THEME;
        }
        return parsed;
      } catch (e) {
        return INITIAL_THEME;
      }
    }
    return INITIAL_THEME;
  });

  const [stats, setStats] = useState<AppUsageStats>(() => {
    const saved = localStorage.getItem("cf_ai_stats");
    return saved ? JSON.parse(saved) : {
      chatsCreated: INITIAL_CHATS.length,
      messagesProcessed: 4,
      apiLatencySum: 2300,
      estimatedTokens: 14800
    };
  });

  // --- UI Interactive States ---
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showArchivedOnly, setShowArchivedOnly] = useState(false);
  
  // Modals Toggles
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Chat Workspace state
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isImprovingText, setIsImprovingText] = useState(false);
  
  // Custom AI Model selector state
  const [selectedModelId, setSelectedModelId] = useState<string>(() => {
    return localStorage.getItem("cf_ai_selected_model_id") || "gemini-2.5-flash";
  });
  
  // Message edit state
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // Chat rename inline state
  const [isRenamingChat, setIsRenamingChat] = useState(false);
  const [renameText, setRenameText] = useState("");

  // New Project toggle/input
  const [showNewProjInput, setShowNewProjInput] = useState(false);
  const [newProjName, setNewProjName] = useState("");
  const [newProjColor, setNewProjColor] = useState("#F38020");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Custom menu popovers states and refs
  const [showProjDropdown, setShowProjDropdown] = useState(false);
  const [showPromptDropdown, setShowPromptDropdown] = useState(false);
  const projDropdownRef = useRef<HTMLDivElement>(null);
  const promptDropdownRef = useRef<HTMLDivElement>(null);

  // States for creating custom system prompts
  const [showAddPromptForm, setShowAddPromptForm] = useState(false);
  const [newPromptLabel, setNewPromptLabel] = useState("");
  const [newPromptText, setNewPromptText] = useState("");
  const [isImprovingCustomPrompt, setIsImprovingCustomPrompt] = useState(false);

  const handleImproveCustomPrompt = async () => {
    if (!newPromptText.trim() || isImprovingCustomPrompt) return;
    setIsImprovingCustomPrompt(true);
    try {
      const response = await fetch("/api/improve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: newPromptText
        })
      });

      if (!response.ok) {
        throw new Error("Unable to improve prompt.");
      }

      const data = await response.json();
      const improvedText = data.text || newPromptText;
      setNewPromptText(improvedText);
    } catch (e) {
      console.error(e);
    } finally {
      setIsImprovingCustomPrompt(false);
    }
  };

  const handleCreatePrompt = () => {
    if (!newPromptLabel.trim() || !newPromptText.trim()) return;
    const newId = `prompt_${Date.now()}`;
    const newPrompt: SystemPrompt = {
      id: newId,
      label: newPromptLabel.trim(),
      prompt: newPromptText.trim()
    };
    setSystemPrompts(prev => [...prev, newPrompt]);
    setActivePromptId(newId);
    setNewPromptLabel("");
    setNewPromptText("");
    setShowAddPromptForm(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (projDropdownRef.current && !projDropdownRef.current.contains(event.target as Node)) {
        setShowProjDropdown(false);
      }
      if (promptDropdownRef.current && !promptDropdownRef.current.contains(event.target as Node)) {
        setShowPromptDropdown(false);
        setShowAddPromptForm(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --- Persistence Synchronizer ---
  useEffect(() => {
    localStorage.setItem("cf_ai_chats", JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem("cf_ai_projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("cf_ai_prompts", JSON.stringify(systemPrompts));
  }, [systemPrompts]);

  useEffect(() => {
    localStorage.setItem("cf_ai_active_prompt_id", activePromptId);
  }, [activePromptId]);

  useEffect(() => {
    localStorage.setItem("cf_ai_theme", JSON.stringify(themeSettings));
  }, [themeSettings]);

  useEffect(() => {
    localStorage.setItem("cf_ai_stats", JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    if (account) {
      localStorage.setItem("cf_ai_account", JSON.stringify(account));
    } else {
      localStorage.removeItem("cf_ai_account");
    }
  }, [account]);

  useEffect(() => {
    localStorage.setItem("cf_ai_selected_model_id", selectedModelId);
  }, [selectedModelId]);

  // Auto-grow logic for input textarea (limit max height to half of chat size - approx 35% of viewport height)
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Capture the previous height to provide a baseline transition target
    const prevHeight = textarea.clientHeight;
    
    textarea.style.transition = "none";
    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;
    const maxHeight = window.innerHeight * 0.35;
    const targetHeight = Math.min(scrollHeight, maxHeight);
    
    // Re-apply previous height to allow the browser layout engine to transition from it
    textarea.style.height = `${prevHeight}px`;
    
    // Animate smoothly to the target height in the next frame
    const animationFrameId = requestAnimationFrame(() => {
      textarea.style.transition = "height 0.2s cubic-bezier(0.16, 1, 0.3, 1)";
      textarea.style.height = `${targetHeight}px`;
      textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [inputMessage]);

  // Auto-scroller
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, selectedChatId, isLoading]);

  // Handle mock and genuine AI execution
  const activeChat = chats.find(c => c.id === selectedChatId);

  // --- Helper operations ---
  const handleAddNewChat = (initialText?: string) => {
    const newChat: Chat = {
      id: "chat_" + Date.now().toString(),
      title: initialText ? (initialText.length > 25 ? initialText.substring(0, 25) + "..." : initialText) : "New Conversation",
      createdAt: new Date().toISOString(),
      isArchived: false,
      projectId: selectedProjectId || null,
      messages: []
    };

    setChats(prev => [newChat, ...prev]);
    setSelectedChatId(newChat.id);
    setIsRenamingChat(false);
    
    setStats(prev => ({
      ...prev,
      chatsCreated: prev.chatsCreated + 1
    }));

    if (initialText) {
      setTimeout(() => {
        submitUserPrompt(newChat.id, initialText);
      }, 50);
    }
  };

  const submitUserPrompt = async (chatId: string, textPayload: string) => {
    if (!textPayload.trim() || isLoading) return;

    // Retrieve active prompt instruction content
    const activePrompt = systemPrompts.find(s => s.id === activePromptId);
    const pLabel = activePrompt ? activePrompt.prompt : "";

    const userMsg: Message = {
      id: "msg_" + Date.now(),
      role: "user",
      text: textPayload,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Append user message local state
    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        return {
          ...c,
          title: c.title === "New Conversation" ? (textPayload.substring(0, 24) + "...") : c.title,
          messages: [...c.messages, userMsg]
        };
      }
      return c;
    }));

    setInputMessage("");
    setIsLoading(true);
    const startLatency = Date.now();

    try {
      const currentChat = chats.find(c => c.id === chatId) || { messages: [] };
      const apiHistory = [...currentChat.messages, userMsg].map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textPayload,
          history: apiHistory,
          systemPrompt: pLabel,
          model: selectedModelId
        })
      });

      const latency = Date.now() - startLatency;

      if (!res.ok) {
        throw new Error("Cloudflare AI rejected response configuration.");
      }

      const data = await res.json();
      
      const assistantMsg: Message = {
        id: "msg_ai_" + Date.now(),
        role: "assistant",
        text: data.text || "Connection handshake succeeded: null coordinates",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: selectedModelId
      };

      setChats(prev => prev.map(c => {
        if (c.id === chatId) {
          return {
            ...c,
            messages: [...c.messages, assistantMsg]
          };
        }
        return c;
      }));

      // Update Analytics
      setStats(prev => ({
        ...prev,
        messagesProcessed: prev.messagesProcessed + 2,
        apiLatencySum: prev.apiLatencySum + latency,
        estimatedTokens: prev.estimatedTokens + textPayload.length + (data.text?.length || 0)
      }));

    } catch (err: any) {
      console.error(err);
      const errorMsg: Message = {
        id: "msg_err_" + Date.now(),
        role: "assistant",
        text: `⚠️ Connection Failure: ${err?.message || "Verify your backend container execution status."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChats(prev => prev.map(c => {
        if (c.id === chatId) {
          return { ...c, messages: [...c.messages, errorMsg] };
        }
        return c;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImproveInputText = async () => {
    if (!inputMessage.trim() || isImprovingText) return;
    setIsImprovingText(true);

    try {
      const response = await fetch("/api/improve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: inputMessage
        })
      });

      if (!response.ok) {
        throw new Error("Unable to improve prompt.");
      }

      const data = await response.json();
      const improvedText = data.text || inputMessage;

      // New text is ready! Remove the shine overlay immediately so standard text renders cleanly
      setIsImprovingText(false);

      // Animate replacement progressively like a typewriter
      let current = "";
      const speed = 7; // ms per char
      const totalLen = improvedText.length;
      let i = 0;
      
      const interval = setInterval(() => {
        if (i < totalLen) {
          current += improvedText.charAt(i);
          setInputMessage(current);
          i++;
        } else {
          clearInterval(interval);
        }
      }, speed);

    } catch (err) {
      console.error(err);
      setIsImprovingText(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const textPayload = inputMessage.trim();
    if (!textPayload) return;

    if (!selectedChatId) {
      // Create a brand new chat automatically on prompt submission
      const newChatId = "chat_" + Date.now().toString();
      const newChat: Chat = {
        id: newChatId,
        title: textPayload.length > 25 ? textPayload.substring(0, 25) + "..." : textPayload,
        createdAt: new Date().toISOString(),
        isArchived: false,
        projectId: selectedProjectId || null,
        messages: []
      };

      setChats(prev => [newChat, ...prev]);
      setSelectedChatId(newChatId);
      setIsRenamingChat(false);
      
      setStats(prev => ({
        ...prev,
        chatsCreated: prev.chatsCreated + 1
      }));

      setInputMessage("");

      setTimeout(() => {
        submitUserPrompt(newChatId, textPayload);
      }, 50);
    } else {
      submitUserPrompt(selectedChatId, textPayload);
      setInputMessage("");
    }
  };

  // --- Message individual edit & delete ---
  const handleStartEditMessage = (id: string, text: string) => {
    setEditingMessageId(id);
    setEditingText(text);
  };

  const handleSaveEditMessage = (msgId: string) => {
    if (!selectedChatId || !editingText.trim()) return;

    setChats(prev => prev.map(c => {
      if (c.id === selectedChatId) {
        return {
          ...c,
          messages: c.messages.map(m => {
            if (m.id === msgId) {
              return { ...m, text: editingText };
            }
            return m;
          })
        };
      }
      return c;
    }));

    setEditingMessageId(null);
    setEditingText("");
  };

  const handleDeleteMessage = (msgId: string) => {
    if (!selectedChatId) return;

    setChats(prev => prev.map(c => {
      if (c.id === selectedChatId) {
        return {
          ...c,
          messages: c.messages.filter(m => m.id !== msgId)
        };
      }
      return c;
    }));
  };

  // --- Chat modifications ---
  const handleRenameChat = () => {
    if (!selectedChatId || !renameText.trim()) return;

    setChats(prev => prev.map(c => {
      if (c.id === selectedChatId) {
        return { ...c, title: renameText };
      }
      return c;
    }));
    setIsRenamingChat(false);
  };

  const handleToggleArchiveChat = (id: string) => {
    setChats(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, isArchived: !c.isArchived };
      }
      return c;
    }));
  };

  const handleDeleteChat = (id: string) => {
    setChats(prev => prev.filter(c => c.id !== id));
    if (selectedChatId === id) {
      setSelectedChatId(null);
    }
  };

  const handleAssignProjectToChat = (chatId: string, projId: string | null) => {
    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        return { ...c, projectId: projId };
      }
      return c;
    }));
  };

  // --- Project Add ---
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;

    const newProj: Project = {
      id: "proj_" + Date.now(),
      title: newProjName,
      color: newProjColor
    };

    setProjects(prev => [...prev, newProj]);
    setNewProjName("");
    setShowNewProjInput(false);
  };

  // --- Global Telemetry Actions ---
  const handleLoginSuccess = (cfAccount: CloudflareAccount) => {
    setAccount(cfAccount);
  };

  const handleDisconnect = () => {
    setAccount(null);
    setShowSettingsModal(false);
  };

  const handleSaveSystemPrompts = (prompts: SystemPrompt[], activeId: string) => {
    setSystemPrompts(prompts);
    setActivePromptId(activeId);
  };

  const handleExportChats = () => {
    // Generate clean backup payload
    const backupData = {
      account,
      chats,
      projects,
      systemPrompts,
      themeSettings,
      stats,
      exportedAt: new Date().toISOString()
    };

    const sBlob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const u = URL.createObjectURL(sBlob);
    const a = document.createElement("a");
    a.href = u;
    a.download = `cloudflare_ai_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(u);
  };

  const handleClearAllChats = () => {
    setChats([]);
    setSelectedChatId(null);
    setStats({
      chatsCreated: 0,
      messagesProcessed: 0,
      apiLatencySum: 0,
      estimatedTokens: 0
    });
    setShowSettingsModal(false);
  };

  // --- Filtering computations ---
  const filteredChats = chats.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.messages.some(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by project selection
    const matchesProject = !selectedProjectId || c.projectId === selectedProjectId;

    // Filter by archive toggle state
    const matchesArchive = showArchivedOnly ? c.isArchived : !c.isArchived;

    return matchesSearch && matchesProject && matchesArchive;
  });

  // --- Clipboard helper ---
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied response context successful!");
  };

  // Custom regex markdown parser helper with code block stylers to avoid template bugs
  const renderMarkdownText = (text: string, isLatest: boolean = false) => {
    if (!text) return "";
    
    // Safety splits for standard backtick codes
    const segments = text.split(/(```[\s\S]*?```)/g);

    return segments.map((seg, sIdx) => {
      if (seg.startsWith("```") && seg.endsWith("```")) {
        // Code Block match
        const lines = seg.slice(3, -3).trim().split("\n");
        const language = lines[0] && !lines[0].includes(" ") ? lines[0] : "typescript";
        const codeText = lines[0] && !lines[0].includes(" ") ? lines.slice(1).join("\n") : lines.join("\n");

        const containerProps = isLatest ? {
          initial: { opacity: 0, y: 10, filter: "blur(6px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
          transition: { duration: 0.4, ease: "easeOut" }
        } : {};

        return (
          <motion.div 
            key={sIdx} 
            {...containerProps}
            className="my-4 rounded-xl overflow-hidden border border-white/5 bg-zinc-950 font-mono text-xs shadow-lg leading-relaxed text-zinc-300"
          >
            {/* Header bar of Code Box */}
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-white/5 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5 lowercase">
                <Terminal size={14} className="text-orange-500" style={{ color: themeSettings.accentColor }} />
                {language}
              </span>
              <button 
                onClick={() => handleCopyToClipboard(codeText)}
                className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Copy size={12} />
                Copy
              </button>
            </div>
            <pre className="p-4 overflow-x-auto whitespace-pre font-mono text-left tracking-wide leading-relaxed">
              <code>{codeText}</code>
            </pre>
          </motion.div>
        );
      } else {
        // Plain text parsing
        const inlineSegments = seg.split(/(`[^`\n]+`)/g);
        return (
          <p key={sIdx} className="whitespace-pre-line leading-relaxed text-sm md:text-base font-medium">
            {inlineSegments.map((item, inlineIdx) => {
              if (item.startsWith("`") && item.endsWith("`")) {
                const codeProps = isLatest ? {
                  initial: { opacity: 0, scale: 0.95 },
                  animate: { opacity: 1, scale: 1 },
                  transition: { duration: 0.2, delay: 0.1 }
                } : {};

                return (
                  <motion.code 
                    key={inlineIdx} 
                    {...codeProps}
                    className="bg-white/10 px-1.5 py-0.5 rounded text-xs text-orange-400 font-mono inline-block" 
                    style={{ color: themeSettings.accentColor }}
                  >
                    {item.slice(1, -1)}
                  </motion.code>
                );
              }
              return <WordByWordAnimator key={inlineIdx} text={item} isLatest={isLatest} />;
            })}
          </p>
        );
      }
    });
  };

  const activeProjectColor = projects.find(p => p.id === selectedProjectId)?.color || themeSettings.accentColor;

  return (
    <div 
      className={`min-h-[100dvh] w-full max-w-full overflow-hidden flex flex-col items-center justify-center relative font-sans ${themeSettings.mode === "light" ? "text-zinc-900" : "text-zinc-100"}`}
      style={{
        fontFamily: "Inter, sans-serif"
      }}
    >
      {/* 1. LAYER 0: Custom Adaptive Scenery Graphic Backgrounds */}
      {themeSettings.backgroundType === "minimal" ? (
        <div className={`absolute inset-0 z-0 transition-colors duration-500 ${themeSettings.mode === "light" ? "bg-white" : "bg-black"}`} />
      ) : (
        <>
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-700 pointer-events-none scale-105"
            style={{
              backgroundImage: `url(${themeSettings.backgroundImageUrl})`,
              filter: `blur(${themeSettings.backgroundBlur}px)`,
              opacity: themeSettings.backgroundOpacity / 100,
            }}
          />
          {/* Backing dark cover */}
          <div className={`absolute inset-0 z-0 pointer-events-none ${themeSettings.mode === "light" ? "bg-white/80" : "bg-black/85"}`} />
        </>
      )}

      {/* 2. LAYER 1: Core Connected authorization check */}
      {!account && (
        <LoginModal 
          onLoginSuccess={handleLoginSuccess}
          accentColor={themeSettings.accentColor}
        />
      )}

      {/* 3. LAYER 2: Main Layout Desktop Container */}
      <main className="absolute inset-3 md:inset-6 lg:inset-8 z-10 flex gap-4 md:gap-6 overflow-hidden">
        
        {/* --- LEFT SIDEBAR (Inspired by Zyricon/Synapse style) --- */}
        <aside className={`w-72 flex-shrink-0 flex flex-col border rounded-2xl p-5 relative overflow-hidden transition-all ${
          themeSettings.mode === "light" 
            ? "bg-[#fafafa] border-zinc-200/80 text-zinc-800 shadow-[0_6px_25px_rgba(0,0,0,0.02)]" 
            : "bg-[#0a0a0c]/90 border-[#1f1f23] text-zinc-100"
        } ${themeSettings.cardBlur ? "backdrop-blur-2xl" : ""}`}>
          
          {/* Brand header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[#111] shadow-md transition-all active:rotate-12 cursor-pointer"
                style={{ backgroundColor: themeSettings.accentColor }}
                onClick={() => handleAddNewChat()}
                title="Create New Session"
              >
                <Cloud size={20} weight="bold" />
              </div>
              <div>
                <h1 className={`text-sm font-black uppercase tracking-wider font-sans leading-none ${
                  themeSettings.mode === "light" ? "text-zinc-900" : "text-white"
                }`}>
                  Cloudflare AI
                </h1>
                <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1.5 uppercase font-bold tracking-tight">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  CONNECTED
                </span>
              </div>
            </div>

            {/* Quick Settings tool triggers */}
            <div className="flex items-center gap-1 py-1 px-1 bg-zinc-950/40 rounded-lg border border-white/5">
              <button 
                onClick={() => setShowAppearanceModal(true)}
                className="p-1.5 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer hover:bg-white/5"
                title="Aesthetics Customizer"
              >
                <Palette size={14} />
              </button>
              <button 
                onClick={() => setShowSettingsModal(true)}
                className="p-1.5 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer hover:bg-white/5"
                title="Global Node Settings"
              >
                <Gear size={14} />
              </button>
            </div>
          </div>

          {/* New Conversation Trigger */}
          <button
            onClick={() => handleAddNewChat()}
            className="w-full py-3.5 px-4 rounded-xl border border-white/5 hover:border-white/10 text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-2 bg-zinc-950/20 hover:bg-zinc-950/50 transition-all cursor-pointer shadow-inner active:scale-[0.98] mb-4 group"
          >
            <Plus size={15} weight="bold" className="text-orange-500 group-hover:rotate-90 transition-transform" style={{ color: themeSettings.accentColor }} />
            New Conversation
          </button>

          {/* Past History Search text input */}
          <div className="relative mb-4">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              <MagnifyingGlass size={15} />
            </span>
            <input
              type="text"
              placeholder="Search conversation triggers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-zinc-950/60 border border-white/5 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500/50 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Segment selection filters */}
          <div className="flex gap-1.5 p-1 bg-zinc-950/80 rounded-xl border border-white/5 text-[10px] font-bold text-zinc-400 mb-4 h-9">
            <button
              onClick={() => { setShowArchivedOnly(false); setSelectedProjectId(null); }}
              className={`flex-1 py-1.5 rounded text-center transition-colors font-sans uppercase tracking-wider cursor-pointer ${
                !showArchivedOnly && !selectedProjectId ? "bg-white/10 text-white" : "hover:text-zinc-200"
              }`}
            >
              Chats
            </button>
            <button
              onClick={() => { setShowArchivedOnly(true); setSelectedProjectId(null); }}
              className={`flex-1 py-1.5 rounded text-center transition-colors font-sans uppercase tracking-wider cursor-pointer flex justify-center items-center gap-1 ${
                showArchivedOnly ? "bg-white/10 text-white" : "hover:text-zinc-200"
              }`}
            >
              <Archive size={11} />
              Archived
            </button>
          </div>

          {/* ACTIVE CHATS LIST STREAM */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1.5 mb-4">
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block pl-2.5 mb-2 leading-none">
              {showArchivedOnly ? "ARCHIVED INDEX" : selectedProjectId ? "WORKPLACE RECORDS" : "CONVERSATION STREAM"}
            </span>

            {filteredChats.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-650 italic">
                No active records located
              </div>
            ) : (
              filteredChats.map(c => {
                const isActive = selectedChatId === c.id;
                const projColor = projects.find(p => p.id === c.projectId)?.color;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedChatId(c.id);
                      setRenameText(c.title);
                      setIsRenamingChat(false);
                    }}
                    className={`group relative py-2.5 px-3 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 border ${
                      isActive 
                        ? themeSettings.mode === "light"
                          ? "bg-orange-500/10 border-orange-500/20 shadow-sm text-zinc-900 font-bold" 
                          : "bg-[#121316] border-white/10 shadow-lg text-white font-semibold" 
                        : themeSettings.mode === "light"
                          ? "bg-transparent border-transparent hover:bg-zinc-200/50 text-zinc-600 hover:text-zinc-900"
                          : "bg-transparent border-transparent hover:bg-[#121316]/50 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <div className="min-w-0 flex-1 flex items-center gap-2">
                      {/* Project dot */}
                      <span 
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: projColor || "transparent" }}
                      />
                      <span className="text-xs font-semibold truncate block">
                        {c.title}
                      </span>
                    </div>

                    {/* Action toggles hoverable inside list item */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleArchiveChat(c.id);
                        }}
                        className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-orange-500 transition-colors"
                        title={c.isArchived ? "Restore Conversation" : "Archive Session"}
                      >
                        <Archive size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Delete this conversation record permanently?")) {
                            handleDeleteChat(c.id);
                          }
                        }}
                        className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-red-400 transition-colors"
                        title="Delete Session"
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* WORKSPACES / PROJECTS DIVISION */}
          <div className="border-t border-white/5 pt-4">
            <div className="flex items-center justify-between pl-2.5 mb-2">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                SEGMENT PROJECTS
              </span>
              <button 
                onClick={() => setShowNewProjInput(!showNewProjInput)}
                className="text-zinc-400 hover:text-orange-500 cursor-pointer"
                title="Create Workspace Project"
              >
                <FolderPlus size={15} />
              </button>
            </div>

            {/* Custom project creator */}
            {showNewProjInput && (
              <form onSubmit={handleCreateProject} className={`p-2.5 rounded-xl border mb-3 space-y-2 ${
                themeSettings.mode === "light"
                  ? "bg-zinc-50 border-zinc-200"
                  : "bg-zinc-950 border-white/5"
              }`}>
                <input
                  type="text"
                  required
                  placeholder="Project name..."
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  className={`w-full px-2 py-1.5 rounded-lg text-xs font-sans focus:outline-none focus:border-orange-500 ${
                    themeSettings.mode === "light"
                      ? "bg-white border border-zinc-200 text-zinc-800 placeholder-zinc-400"
                      : "bg-[#0e1014] border border-white/5 text-white placeholder-zinc-650"
                  }`}
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {["#F38020", "#FFFFFF", "#FDBA74", "#71717A", "#27272A", "#D4D4D8"].map(c => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setNewProjColor(c)}
                        className={`w-3.5 h-3.5 rounded-full border border-black/20 ${newProjColor === c ? "ring-1 ring-white" : ""}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <button type="submit" className={`p-1 rounded text-[10px] font-bold ${
                    themeSettings.mode === "light"
                      ? "bg-orange-500 text-white hover:bg-orange-600 cursor-pointer"
                      : "bg-white text-black hover:bg-zinc-100 cursor-pointer"
                  }`}>
                    Add
                  </button>
                </div>
              </form>
            )}

            {/* List of Projects */}
            <div className="space-y-0.5 max-h-[140px] overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedProjectId(null)}
                className={`w-full py-2 px-2.5 rounded-lg text-left text-xs font-semibold flex items-center justify-between transition-colors whitespace-nowrap cursor-pointer ${
                  selectedProjectId === null
                    ? themeSettings.mode === "light"
                      ? "bg-orange-500/10 text-zinc-900 font-bold"
                      : "bg-zinc-950/40 text-white font-bold"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  <FolderOpen size={14} className={selectedProjectId === null ? "text-orange-500" : ""} style={{ color: selectedProjectId === null ? themeSettings.accentColor : undefined }} />
                  All Records
                </span>
                <span className="text-[10px] font-mono text-zinc-500">({chats.filter(c => !c.isArchived).length})</span>
              </button>

              {projects.map(p => {
                const count = chats.filter(c => c.projectId === p.id && !c.isArchived).length;
                const isSelected = selectedProjectId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProjectId(p.id)}
                    className={`w-full py-2 px-2.5 rounded-lg text-left text-xs font-semibold flex items-center justify-between transition-colors whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? themeSettings.mode === "light"
                          ? "bg-orange-500/10 text-zinc-900 font-bold"
                          : "bg-zinc-950/40 text-white font-bold"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                    }`}
                  >
                    <span className="flex items-center gap-2 max-w-[80%] truncate">
                      <span className="w-2.5 h-2.5 rounded-full block border border-black/45 flex-shrink-0" style={{ backgroundColor: p.color }} />
                      <span className="truncate">{p.title}</span>
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Profile and connection indicator */}
          <div className={`mt-auto border-t pt-4 flex items-center justify-between text-left ${
            themeSettings.mode === "light" ? "border-zinc-200/60" : "border-white/5"
          }`}>
            <div className="flex items-center gap-2">
              <div 
                className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs ${
                  themeSettings.mode === "light"
                    ? "bg-white text-zinc-800 border-zinc-200"
                    : "bg-zinc-950/80 font-bold"
                }`}
                style={{ borderColor: `${themeSettings.accentColor}20`, color: themeSettings.accentColor }}
              >
                CF
              </div>
              <div className="min-w-0">
                <span className={`text-[10px] font-bold block truncate leading-none mb-0.5 ${
                  themeSettings.mode === "light" ? "text-zinc-800" : "text-zinc-300"
                }`}>
                  {account?.email || "developer@cloudflare.com"}
                </span>
                <span className="text-[9px] font-mono text-zinc-500 leading-none capitalize block font-medium">
                  CONNECTED · {account?.plan || "Free"}
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => setShowSettingsModal(true)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                themeSettings.mode === "light"
                  ? "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50"
                  : "text-zinc-500 hover:text-white hover:bg-white/5"
              }`}
            >
              <Gear size={16} />
            </button>
          </div>
        </aside>

        {/* --- CORE WORKSPACE WINDOW --- */}
        <div className={`flex-1 flex flex-col border rounded-2xl overflow-hidden relative ${
          themeSettings.mode === "light"
            ? "bg-[#ffffff] border-zinc-200/80 shadow-[0_6px_25px_rgba(0,0,0,0.02)]"
            : "bg-[#0a0a0c]/85 border-[#1f1f23]"
        } ${themeSettings.cardBlur ? "backdrop-blur-xl" : ""}`}>
          
          {/* Header Bar of core window */}
          <div className={`px-6 py-4 border-b flex items-center justify-between z-10 relative ${
            themeSettings.mode === "light"
              ? "border-zinc-200/60 bg-[#f9fafb]"
              : "border-white/5 bg-zinc-950/20"
          }`}>
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {activeChat ? (
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {/* Editable title on click */}
                  {isRenamingChat ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={renameText}
                        onChange={(e) => setRenameText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRenameChat();
                        }}
                        className="px-2 py-1 bg-zinc-950 border border-white/10 rounded text-xs text-white focus:outline-none"
                        autoFocus
                      />
                      <button 
                        onClick={handleRenameChat}
                        className="p-1 rounded hover:bg-white/5 text-emerald-400 cursor-pointer"
                      >
                        <Check size={14} />
                      </button>
                      <button 
                        onClick={() => setIsRenamingChat(false)}
                        className="p-1 rounded hover:bg-white/5 text-red-400 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h2 
                        onClick={() => {
                          setIsRenamingChat(true);
                          setRenameText(activeChat.title);
                        }}
                        className="text-sm font-bold text-white tracking-tight cursor-help hover:text-zinc-200 truncate"
                        title="Click here to Rename"
                      >
                        {activeChat.title}
                      </h2>
                      <button 
                        onClick={() => {
                          setIsRenamingChat(true);
                          setRenameText(activeChat.title);
                        }}
                        className="text-zinc-500 hover:text-white p-1 cursor-pointer"
                      >
                        <Pencil size={12} />
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div>
                   <h2 className={`text-sm font-bold tracking-tight ${
                     themeSettings.mode === "light" ? "text-zinc-950" : "text-white"
                   }`}>Cloudflare AI Workspace</h2>
                   <p className="text-[10px] text-zinc-500 font-sans">Choose or draft an optimization coordinate below</p>
                </div>
              )}
            </div>

            {/* Right-aligned parameters - beautifully spaced to avoid clustering */}
            <div className="flex items-center gap-4">
              {activeChat && (
                <>
                  {/* Custom Project Dropdown Popover */}
                  {(() => {
                    const activeProj = projects.find(p => p.id === activeChat.projectId);
                    const projColor = activeProj ? activeProj.color : (themeSettings.mode === "light" ? "#71717a" : "#a1a1aa");
                    return (
                      <div ref={projDropdownRef} className="relative">
                        <button
                          onClick={() => setShowProjDropdown(!showProjDropdown)}
                          className="relative flex items-center justify-center w-8 h-8 rounded-xl border transition-all duration-300 hover:scale-[1.05] active:scale-[0.95] cursor-pointer"
                          style={{
                            borderColor: activeProj ? `${activeProj.color}25` : (themeSettings.mode === "light" ? "#e4e4e7" : "#27272a"),
                            backgroundColor: activeProj ? `${activeProj.color}08` : "transparent",
                            color: projColor
                          }}
                          title={activeProj ? `Project: ${activeProj.title}` : "Assign Project"}
                        >
                          <Folder 
                            size={16} 
                            weight={activeProj ? "fill" : "regular"} 
                            className="transition-transform duration-500 hover:rotate-12 hover:scale-110"
                            style={{ color: projColor }}
                          />
                        </button>

                        <AnimatePresence>
                          {showProjDropdown && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: 8 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 8 }}
                              transition={{ duration: 0.15, ease: "easeOut" }}
                              className={`absolute right-0 mt-2 z-50 w-56 rounded-2xl border p-2 shadow-2xl backdrop-blur-md ${
                                themeSettings.mode === "light"
                                  ? "bg-white/95 border-zinc-200 text-zinc-800"
                                  : "bg-zinc-900/95 border-[#1f1f23] text-zinc-200"
                              }`}
                            >
                              <div className="px-2.5 py-1.5 text-[9px] font-mono tracking-wider text-zinc-500 uppercase">
                                Assign Target Project
                              </div>
                              <div className="h-[1px] my-1 bg-zinc-200/50 dark:bg-white/5" />
                              <div className="space-y-0.5 max-h-60 overflow-y-auto pr-1">
                                <button
                                  onClick={() => {
                                    handleAssignProjectToChat(activeChat.id, null);
                                    setShowProjDropdown(false);
                                  }}
                                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-[10px] font-bold transition-all duration-200 cursor-pointer ${
                                    !activeChat.projectId
                                      ? (themeSettings.mode === "light" ? "bg-zinc-100 text-zinc-950" : "bg-white/10 text-white")
                                      : (themeSettings.mode === "light" ? "hover:bg-zinc-100 text-zinc-600" : "hover:bg-white/5 text-zinc-400")
                                  }`}
                                >
                                  <span className="flex items-center gap-1.5">
                                    <Folder size={14} className="text-zinc-500" />
                                    <span>(None / Sandbox)</span>
                                  </span>
                                  {!activeChat.projectId && <Check size={12} weight="bold" style={{ color: themeSettings.accentColor }} />}
                                </button>

                                {projects.map(p => {
                                  const isSelected = activeChat.projectId === p.id;
                                  return (
                                    <button
                                      key={p.id}
                                      onClick={() => {
                                        handleAssignProjectToChat(activeChat.id, p.id);
                                        setShowProjDropdown(false);
                                      }}
                                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-[10px] font-bold transition-all duration-200 cursor-pointer ${
                                        isSelected
                                          ? (themeSettings.mode === "light" ? "bg-zinc-100 text-zinc-950" : "bg-white/10 text-white")
                                          : (themeSettings.mode === "light" ? "hover:bg-zinc-100 text-zinc-600" : "hover:bg-white/5 text-zinc-400")
                                      }`}
                                    >
                                      <span className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                        <span className="truncate">{p.title}</span>
                                      </span>
                                      {isSelected && <Check size={12} weight="bold" style={{ color: p.color }} />}
                                    </button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })()}

                  {/* System Prompt Dropdown Popover */}
                  <div ref={promptDropdownRef} className="relative">
                    <button
                      onClick={() => setShowPromptDropdown(!showPromptDropdown)}
                      className={`relative flex items-center justify-center w-8 h-8 rounded-xl border transition-all duration-300 hover:scale-[1.05] active:scale-[0.95] cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.02)] ${
                        themeSettings.mode === "light"
                          ? "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-350"
                          : "bg-zinc-900/40 border-white/5 text-zinc-300 hover:border-white/15"
                      }`}
                      title={`System Prompt: ${systemPrompts.find(p => p.id === activePromptId)?.label || "Expert Mode"}`}
                    >
                      <Terminal 
                        size={16} 
                        className="transition-all duration-500 hover:rotate-6 hover:scale-110 text-zinc-400" 
                        style={{ color: themeSettings.accentColor }}
                      />
                    </button>

                    <AnimatePresence>
                      {showPromptDropdown && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 8 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className={`absolute right-0 mt-2 z-50 rounded-2xl border p-3 shadow-2xl backdrop-blur-md transition-all duration-300 ${
                            showAddPromptForm ? "w-80 sm:w-[460px]" : "w-64"
                          } ${
                            themeSettings.mode === "light"
                              ? "bg-white/95 border-zinc-200 text-zinc-800"
                              : "bg-zinc-900/95 border-[#1f1f23] text-zinc-200"
                          }`}
                        >
                          <div className="flex items-center justify-between px-1.5 py-1">
                            <div className="text-[9px] font-mono tracking-wider text-zinc-500 uppercase">
                              {showAddPromptForm ? "Create Custom System Prompt" : "AI Expert System Prompts"}
                            </div>
                            {!showAddPromptForm && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowAddPromptForm(true);
                                }}
                                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-[9px] text-emerald-400 font-bold transition-all border border-emerald-500/20 active:scale-95 cursor-pointer"
                                title="Define a custom system prompt"
                              >
                                <Plus size={10} weight="bold" />
                                <span>New</span>
                              </button>
                            )}
                          </div>
                          <div className="h-[1px] my-1.5 bg-zinc-200/50 dark:bg-white/5" />
                          
                          {showAddPromptForm ? (
                            <div className="p-1 space-y-3.5">
                              <div className="space-y-1">
                                <label className="block text-[9px] font-mono tracking-wider text-zinc-500 uppercase">Prompt Label</label>
                                <input
                                  type="text"
                                  value={newPromptLabel}
                                  onChange={(e) => setNewPromptLabel(e.target.value)}
                                  placeholder="e.g. Edge Performance Optimizer"
                                  className={`w-full px-3 py-2 rounded-xl text-[11px] font-bold outline-none border transition-all ${
                                    themeSettings.mode === "light"
                                      ? "bg-zinc-50 border-zinc-200 focus:border-zinc-350 focus:bg-white text-zinc-850"
                                      : "bg-zinc-950/40 border-white/5 focus:border-white/15 focus:bg-zinc-950/60 text-white"
                                  }`}
                                  autoFocus
                                />
                              </div>
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <label className="block text-[9px] font-mono tracking-wider text-zinc-500 uppercase">System Instructions</label>
                                  
                                  {/* Beautiful Spark-driven Improve with AI option */}
                                  <button
                                    type="button"
                                    onClick={handleImproveCustomPrompt}
                                    disabled={isImprovingCustomPrompt || !newPromptText.trim()}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition-all text-[9px] font-bold cursor-pointer active:scale-95 duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                                      newPromptText.trim()
                                        ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border-amber-500/25 hover:border-amber-500/40"
                                        : "bg-zinc-500/5 text-zinc-500 border-transparent cursor-not-allowed opacity-55"
                                    }`}
                                    title="Use Gemini Client API to enrich and polish this prompt instructions template"
                                  >
                                    <Sparkle size={10} className={isImprovingCustomPrompt ? "animate-spin" : "transition-transform duration-300 hover:scale-[1.15]"} />
                                    <span>{isImprovingCustomPrompt ? "AI Polishing..." : "Improve with AI"}</span>
                                  </button>
                                </div>
                                <textarea
                                  value={newPromptText}
                                  onChange={(e) => setNewPromptText(e.target.value)}
                                  rows={6}
                                  placeholder="Describe roles, tasks, constraints, and preferred layout outputs here (e.g. 'You are an elite DNS performance consultant...')"
                                  className={`w-full px-3 py-2 rounded-xl text-[11px] font-medium outline-none border transition-all resize-none scrollbar-none leading-relaxed ${
                                    themeSettings.mode === "light"
                                      ? "bg-zinc-50 border-zinc-200 focus:border-zinc-350 focus:bg-white text-zinc-800"
                                      : "bg-zinc-950/40 border-white/5 focus:border-white/15 focus:bg-zinc-950/60 text-white"
                                  }`}
                                />
                              </div>
                              <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-zinc-200/50 dark:border-white/5">
                                <button
                                  onClick={() => {
                                    setShowAddPromptForm(false);
                                    setNewPromptLabel("");
                                    setNewPromptText("");
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all active:scale-95 cursor-pointer ${
                                    themeSettings.mode === "light"
                                      ? "hover:bg-zinc-100 text-zinc-650"
                                      : "hover:bg-white/5 text-zinc-400"
                                  }`}
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleCreatePrompt}
                                  disabled={!newPromptLabel.trim() || !newPromptText.trim()}
                                  className={`px-3.5 py-1.5 rounded-xl text-[10px] font-bold transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1 ${
                                    newPromptLabel.trim() && newPromptText.trim()
                                      ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_2px_10px_rgba(16,185,129,0.08)]"
                                      : "opacity-40 cursor-not-allowed bg-zinc-500/5 text-zinc-400 border border-transparent"
                                  }`}
                                >
                                  <Check size={10} weight="bold" />
                                  <span>Create Prompt</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-0.5 max-h-72 overflow-y-auto pr-1">
                              {systemPrompts.map(p => {
                                const isSelected = activePromptId === p.id;
                                return (
                                  <button
                                    key={p.id}
                                    onClick={() => {
                                      setActivePromptId(p.id);
                                      setShowPromptDropdown(false);
                                    }}
                                    className={`w-full flex flex-col justify-start px-3 py-2 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                                      isSelected
                                        ? (themeSettings.mode === "light" ? "bg-zinc-100 text-zinc-950" : "bg-white/10 text-white")
                                        : (themeSettings.mode === "light" ? "hover:bg-zinc-50 text-zinc-650" : "hover:bg-white/5 text-zinc-400")
                                    }`}
                                  >
                                    <div className="w-full flex items-center justify-between">
                                      <span className="text-[10px] font-bold truncate">{p.label}</span>
                                      {isSelected && <Check size={12} weight="bold" style={{ color: themeSettings.accentColor }} />}
                                    </div>
                                    <p className="text-[9px] mt-0.5 opacity-60 leading-normal line-clamp-2 font-normal">
                                      {p.prompt}
                                    </p>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}

              {/* Connected node health lights with dynamic interactive status */}
              <div 
                className="group relative flex items-center justify-center w-8 h-8 rounded-xl border bg-emerald-500/5 border-emerald-500/15 text-emerald-400 transition-all duration-300 hover:bg-emerald-500/10 hover:border-emerald-500/35 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] active:scale-95 cursor-pointer"
                title="Secure Link Connection Handshake Active"
              >
                <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                
                <CloudCheck 
                  size={16} 
                  weight="fill"
                  className="transition-transform duration-500 group-hover:scale-110" 
                />
              </div>
            </div>
          </div>

          {/* Core Chat Flow Window Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 z-0 relative">
            
            {/* If no chat active or active chat empty, render the premium Zyricon central prompt screen */}
            {!activeChat || activeChat.messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center py-6 animate-fade-in-up">
                
                {/* Central shining node artwork */}
                <div className="relative w-56 h-56 mb-8 flex items-center justify-center select-none overflow-visible">
                  {/* Broad Ambient Soft Diffusion Wash of Core Color */}
                  <div 
                    className="absolute inset-4 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-1000"
                    style={{
                      background: `radial-gradient(circle, ${themeSettings.accentColor} 0%, transparent 70%)`
                    }}
                  />

                  {/* Neural Grid Synaptic Ring 1 (Tilted, Slow Clockwise Rotate & Breathe) */}
                  <motion.div 
                    className="absolute w-48 h-48 rounded-full border pointer-events-none"
                    style={{ 
                      borderColor: `${themeSettings.accentColor}12`,
                      rotate: 15
                    }}
                    animate={{ 
                      rotate: [15, 375],
                      scale: [1, 1.04, 1]
                    }}
                    transition={{
                      rotate: { duration: 25, repeat: Infinity, ease: "linear" },
                      scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    {/* Neural Synapse Node Spark A */}
                    <div 
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full blur-[1px] shadow-[0_0_8px_currentColor]"
                      style={{ 
                        backgroundColor: themeSettings.accentColor,
                        color: themeSettings.accentColor
                      }}
                    />
                  </motion.div>

                  {/* Neural Grid Synaptic Ring 2 (Opposite tilt, Counter-Clockwise & Subtle Pulse) */}
                  <motion.div 
                    className="absolute w-40 h-40 rounded-full border border-dashed pointer-events-none"
                    style={{ 
                      borderColor: `${themeSettings.accentColor}18`,
                      rotate: -35
                    }}
                    animate={{ 
                      rotate: [-35, -395],
                      scale: [0.98, 1.03, 0.98]
                    }}
                    transition={{
                      rotate: { duration: 18, repeat: Infinity, ease: "linear" },
                      scale: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }
                    }}
                  >
                    {/* Neural Synapse Node Spark B */}
                    <div 
                      className="absolute bottom-4 right-8 w-1.5 h-1.5 rounded-full shadow-[0_0_6px_currentColor]"
                      style={{ 
                        backgroundColor: themeSettings.accentColor,
                        color: themeSettings.accentColor
                      }}
                    />
                  </motion.div>

                  {/* Neural Grid Synaptic Ring 3 (Highly tilted, Slow vertical breathing) */}
                  <motion.div 
                    className="absolute w-32 h-32 rounded-full border pointer-events-none"
                    style={{ 
                      borderColor: `${themeSettings.accentColor}08`,
                      transform: "rotateX(60deg) rotateY(20deg)"
                    }}
                    animate={{ 
                      scale: [1, 1.08, 1],
                      opacity: [0.3, 0.7, 0.3]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />

                  {/* Deep Consciousness Expandable Soundwaves / Thinking Rings */}
                  <motion.div
                    className="absolute w-20 h-20 rounded-full border pointer-events-none"
                    style={{ borderColor: `${themeSettings.accentColor}25` }}
                    animate={{
                      scale: [1, 2.7],
                      opacity: [0.6, 0]
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: [0.16, 1, 0.3, 1] // Super smooth deceleration
                    }}
                  />
                  <motion.div
                    className="absolute w-20 h-20 rounded-full border pointer-events-none"
                    style={{ borderColor: `${themeSettings.accentColor}18` }}
                    animate={{
                      scale: [1, 1.9],
                      opacity: [0.8, 0]
                    }}
                    transition={{
                      duration: 5,
                      delay: 2.5,
                      repeat: Infinity,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                  />

                  {/* Micro Synaptic Spark Particles floating in ambient sphere */}
                  <div className="absolute inset-0 pointer-events-none overflow-visible">
                    <motion.div 
                      className="absolute w-1 h-1 rounded-full left-1/4 top-1/4"
                      style={{ backgroundColor: themeSettings.accentColor }}
                      animate={{ y: [0, -15, 0], opacity: [0.2, 0.8, 0.2] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div 
                      className="absolute w-1 h-1 rounded-full right-1/4 bottom-1/4"
                      style={{ backgroundColor: themeSettings.accentColor }}
                      animate={{ y: [0, 15, 0], opacity: [0.1, 0.7, 0.1] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
                    />
                  </div>

                  {/* Central telemetry core orb with floating breathing motion */}
                  <motion.div 
                    className="w-20 h-20 rounded-full cursor-pointer relative z-10 flex items-center justify-center p-0.5 border shadow-[0_0_35px_rgba(0,0,0,0.45)] group"
                    style={{ 
                      borderColor: `${themeSettings.accentColor}80`,
                      background: themeSettings.mode === "light" 
                        ? `linear-gradient(135deg, ${themeSettings.accentColor}, #ffffff)`
                        : `linear-gradient(135deg, ${themeSettings.accentColor}, #09090b, #030303)`
                    }}
                    animate={{
                      y: [0, -4, 0, 4, 0],
                      scale: [1, 1.02, 1, 0.98, 1]
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    whileHover={{ 
                      scale: 1.08,
                      boxShadow: `0 0 30px ${themeSettings.accentColor}50`,
                    }}
                  >
                    <div 
                      className="w-full h-full rounded-full flex items-center justify-center text-white px-3"
                      style={{
                        background: themeSettings.mode === "light" 
                          ? `linear-gradient(135deg, #ffffff, #f3f4f6)`
                          : `linear-gradient(135deg, #090a10, #030406)`,
                      }}
                    >
                      {/* Premium representation of the Cloudflare Logo Cloud */}
                      <svg 
                        viewBox="0 0 94 94" 
                        className="w-10 h-10 transition-transform duration-500 ease-out group-hover:scale-110"
                        style={{ color: themeSettings.accentColor }}
                      >
                        <defs>
                          <linearGradient id="cfCloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={themeSettings.accentColor} />
                            <stop offset="100%" stopColor="#f97316" />
                          </linearGradient>
                        </defs>
                        <path 
                          fill="url(#cfCloudGrad)" 
                          d="M83.4,45.6c-.7-10.7-9.5-19.1-20.3-19.1-3.9,0-7.5,1.1-10.6,3.1C47.8,21.9,39,17,29,17,14.6,17,3,28.6,3,43c0,12,8.2,22,19.3,24.8l56.8,0c8.1-1,14.3-7.9,14.3-16.2C93.4,48.5,89.5,45.6,83.4,45.6z" 
                        />
                      </svg>
                    </div>
                  </motion.div>
                </div>

                <h1 className={`text-3xl md:text-5xl font-black tracking-tighter leading-none text-center max-w-xl mb-3 ${
                  themeSettings.mode === "light" ? "text-zinc-900" : "text-white"
                }`}>
                  Ready to Create Something New?
                </h1>
                <p className="text-xs md:text-sm text-zinc-500 max-w-md text-center mb-8 leading-relaxed">
                  Compose blazing fast serverless scripts, compile secure cloud networks, and optimize your database pipelines from a secure sandbox.
                </p>

                {/* Quick actions row */}
                <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10 max-w-md">
                  <button
                    onClick={() => handleAddNewChat("Explain how to write a custom image optimizer inside Cloudflare Workers")}
                    className={`px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer hover:scale-[1.02] active:scale-95 ${
                      themeSettings.mode === "light"
                        ? "bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-zinc-300"
                        : "bg-white/5 border border-white/5 hover:border-white/10 text-zinc-350 hover:text-white"
                    }`}
                  >
                    Write Image Optimizer
                  </button>
                  <button
                    onClick={() => handleAddNewChat("Analyze common WAF security rules to block botnets")}
                    className={`px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer hover:scale-[1.02] active:scale-95 ${
                      themeSettings.mode === "light"
                        ? "bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-zinc-300"
                        : "bg-white/5 border border-white/5 hover:border-white/10 text-zinc-355 hover:text-white"
                    }`}
                  >
                    Analyze WAF Rules
                  </button>
                  <button
                    onClick={() => handleAddNewChat("Outline deployment milestones for Cloudflare Pages serverless hosting")}
                    className={`px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer hover:scale-[1.02] active:scale-95 ${
                      themeSettings.mode === "light"
                        ? "bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-zinc-300"
                        : "bg-white/5 border border-white/5 hover:border-white/10 text-zinc-360 hover:text-white"
                    }`}
                  >
                    Cloudflare Pages Plan
                  </button>
                </div>

                {/* Bento Features matrix (Inspired by Image 1) */}
                <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl pt-4 border-t ${
                  themeSettings.mode === "light" ? "border-zinc-200/80" : "border-white/5"
                }`}>
                  
                  {/* Card 1 */}
                  <div 
                    onClick={() => handleAddNewChat("Generate a pristine Cloudflare Worker route template")}
                    className={`p-5 rounded-2xl border text-left cursor-pointer transition-all hover:-translate-y-1 ${
                      themeSettings.mode === "light"
                        ? "bg-[#fafafa] border-zinc-200/80 hover:border-zinc-300/90 hover:bg-zinc-100/30"
                        : "bg-zinc-950/40 border-white/5 hover:border-white/10 hover:bg-[#121212]/60"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 mb-3" style={{ color: themeSettings.accentColor }}>
                      <Terminal size={18} />
                    </div>
                    <h3 className={`text-xs font-bold mb-1.5 uppercase tracking-wider ${
                      themeSettings.mode === "light" ? "text-zinc-800" : "text-white"
                    }`}>Dev Assistant</h3>
                    <p className="text-[11px] text-zinc-500 leading-normal">
                      Build robust script blocks, serverless handlers, database bindings instantly.
                    </p>
                  </div>

                  {/* Card 2 */}
                  <div 
                    onClick={() => handleAddNewChat("Draft a technical presentation structure for Cloudflare zero trust implementation")}
                    className={`p-5 rounded-2xl border text-left cursor-pointer transition-all hover:-translate-y-1 ${
                      themeSettings.mode === "light"
                        ? "bg-[#fafafa] border-zinc-200/80 hover:border-zinc-300/90 hover:bg-zinc-100/30"
                        : "bg-zinc-950/40 border-white/5 hover:border-white/10 hover:bg-[#121212]/70"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 mb-3" style={{ color: themeSettings.accentColor }}>
                      <Presentation size={18} />
                    </div>
                    <h3 className={`text-xs font-bold mb-1.5 uppercase tracking-wider ${
                      themeSettings.mode === "light" ? "text-zinc-800" : "text-white"
                    }`}>Presentation Ideas</h3>
                    <p className="text-[11px] text-zinc-500 leading-normal">
                      Draft structural slide diagrams for cybersecurity rules and caching schemas.
                    </p>
                  </div>

                  {/* Card 3 */}
                  <div 
                    onClick={() => handleAddNewChat("Design beautiful illustrative flowcharts representing Cloud routing paths")}
                    className={`p-5 rounded-2xl border text-left cursor-pointer transition-all hover:-translate-y-1 ${
                      themeSettings.mode === "light"
                        ? "bg-[#fafafa] border-zinc-200/80 hover:border-zinc-300/90 hover:bg-zinc-100/30"
                        : "bg-zinc-950/40 border-white/5 hover:border-white/10 hover:bg-[#121212]/80"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-500/10 flex items-center justify-center text-zinc-400 mb-3">
                      <ImageSquare size={18} />
                    </div>
                    <h3 className={`text-xs font-bold mb-1.5 uppercase tracking-wider ${
                      themeSettings.mode === "light" ? "text-zinc-800" : "text-white"
                    }`}>Scenery Creator</h3>
                    <p className="text-[11px] text-zinc-500 leading-normal">
                      Formulate visual interface components and pixel layouts directly.
                    </p>
                  </div>

                </div>

              </div>
            ) : (
              /* If chat has messages, display them */
              <div className="space-y-6">
                {activeChat.messages.map((m, idx) => {
                  const isUser = m.role === "user";
                  const isEditing = editingMessageId === m.id;
                  const isLatest = idx === activeChat.messages.length - 1;
                  const shouldAnimate = isLatest && !seenMessageIds.current.has(m.id);
                  if (shouldAnimate) {
                    seenMessageIds.current.add(m.id);
                  }

                  return (
                    <div 
                      key={m.id} 
                      className={`flex gap-4 p-4 rounded-2xl transition-colors ${
                        isUser 
                          ? "justify-end text-right" 
                          : "justify-start text-left bg-zinc-950/15 border border-white/5"
                      }`}
                    >
                      {/* Avatar */}
                      {!isUser && (
                        <div 
                          className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-[10px]"
                          style={{ backgroundColor: `${themeSettings.accentColor}20`, color: themeSettings.accentColor }}
                        >
                          {getModelInitials(m.model, selectedModelId)}
                        </div>
                      )}

                      <div className={`max-w-[85%] min-w-0 space-y-1 ${isUser ? "flex flex-col items-end" : ""}`}>
                        {/* Meta information */}
                        <div className={`flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider ${isUser ? "justify-end" : "justify-start"}`}>
                          <span>{isUser ? "Local Operator" : getModelDisplayName(m.model, selectedModelId)}</span>
                          <span>•</span>
                          <span>{m.timestamp}</span>
                        </div>

                        {/* Text / Editing box */}
                        {isEditing ? (
                          <div className="space-y-2 mt-1">
                            <textarea
                              rows={3}
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-white placeholder-zinc-650"
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => { setEditingMessageId(null); setEditingText(""); }}
                                className="px-2.5 py-1 bg-zinc-800 text-xs font-semibold rounded"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEditMessage(m.id)}
                                className="px-2.5 py-1 bg-white text-black text-xs font-semibold rounded"
                                style={{ backgroundColor: themeSettings.accentColor, color: "#000" }}
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className={`text-sm md:text-base leading-relaxed break-words font-medium ${isUser ? "text-zinc-400" : "text-zinc-200"}`}
                            style={isUser ? { color: "#a1a1aa" } : undefined}
                          >
                            {isUser ? (
                              <p className="whitespace-pre-wrap text-zinc-400" style={{ color: "#a1a1aa" }}>{m.text}</p>
                            ) : (
                              renderMarkdownText(m.text, shouldAnimate)
                            )}
                          </div>
                        )}

                        {/* Individual action bar */}
                        {!isEditing && (
                          <div className={`flex items-center gap-3.5 pt-1 text-[11px] text-zinc-500 ${isUser ? "justify-end" : "justify-start"}`}>
                            {isUser && (
                              <button
                                onClick={() => handleStartEditMessage(m.id, m.text)}
                                className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Pencil size={11} />
                                Edit
                              </button>
                            )}
                            
                            {!isUser && (
                              <button
                                onClick={() => handleCopyToClipboard(m.text)}
                                className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Copy size={11} />
                                Copy text
                              </button>
                            )}

                            <button
                              onClick={() => {
                                if (confirm("Delete this message?")) handleDeleteMessage(m.id);
                              }}
                              className="hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Trash size={11} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {/* Visual loading stream indicator */}
                {isLoading && (
                  <CloudflareAILoader accentColor={themeSettings.accentColor} />
                )}
                
                <div ref={chatEndRef} />
              </div>
            )}

          </div>

          {/* Interactive professional input bar (Inspired by screenshot 3) */}
          <div className="px-5 pt-3 pb-4 border-t border-white/5 bg-zinc-950/40 relative z-10">
            <form onSubmit={handleSendMessage} className="relative">
              {/* Glowing overlay border under layout parameters */}
              <div 
                className="overflow-hidden bg-[#121212] border border-white/10 rounded-2xl focus-within:border-orange-500/60 shadow-2xl transition-all p-3 relative"
                style={{ focusWithinBorderColor: themeSettings.accentColor } as React.CSSProperties}
              >
                {/* Premium Spark AI optimizer icon */}
                <div className="absolute right-3.5 top-3.5 z-20 flex items-center gap-1.5">
                  {inputMessage.trim() && (
                    <motion.button
                      id="ai-prompt-improve-trigger"
                      type="button"
                      onClick={handleImproveInputText}
                      disabled={isImprovingText}
                      title="Improve prompt with AI"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-850/60 border border-white/5 shadow-sm hover:shadow-orange-500/10 cursor-pointer flex items-center justify-center transition-all disabled:opacity-50 disabled:pointer-events-none relative group overflow-hidden"
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        className="absolute inset-0 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-orange-500/20 via-purple-500/20 to-blue-500/20 filter blur-xs"
                      />

                      <motion.div
                        animate={isImprovingText ? {
                          rotate: 360,
                          scale: [1, 1.25, 1],
                          color: ["#a855f7", "#ec4899", "#f97316", "#3b82f6", "#a855f7"]
                        } : {}}
                        transition={isImprovingText ? {
                          rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
                          scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
                          color: { duration: 2, repeat: Infinity }
                        } : {
                          duration: 0.2
                        }}
                        className="relative z-10 flex items-center justify-center"
                      >
                        <Sparkle size={15} weight="fill" className={isImprovingText ? "" : "text-zinc-400 group-hover:text-amber-400"} />
                      </motion.div>
                    </motion.button>
                  )}
                </div>

                {/* Typing input (Auto-growing wrapper to match overlay exactly) */}
                <div className="relative w-full">
                  {/* Gradient Shine Animation overlay – ONLY ON THE USER WORDS (Line-by-Line) */}
                  {isImprovingText && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 pr-10 pointer-events-none select-none text-xs md:text-sm px-2 py-1 leading-relaxed font-sans text-left z-10 overflow-hidden whitespace-pre-wrap"
                    >
                      <ShinyText
                        text={inputMessage}
                        speed={1.6}
                        spread={170}
                        color="#4b5563"
                        gradientColors={['#ea580c', '#fa8a14', '#f59e0b', '#fa8a14', '#ea580c']}
                        sweepDirection="vertical"
                        className="font-bold select-none text-xs md:text-sm tracking-normal w-full text-left font-sans leading-relaxed whitespace-pre-wrap block"
                      />
                    </motion.div>
                  )}

                  <textarea
                    ref={textareaRef}
                    value={inputMessage}
                    disabled={isImprovingText}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && !isImprovingText) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    rows={1}
                    placeholder={isImprovingText ? "AI is refining your developer prompt parameters..." : "Ask anything to Cloudflare AI... (Start typing to open a new conversation)"}
                    className="w-full bg-transparent placeholder-zinc-650 text-xs md:text-sm focus:outline-none resize-none px-2 py-1 pr-10 leading-relaxed max-h-[35vh] transition-colors duration-300 relative z-0 font-sans"
                    style={{ 
                      color: isImprovingText ? "transparent" : "#f4f4f5", 
                      caretColor: isImprovingText ? "transparent" : "auto"
                    }}
                  />
                </div>

                {/* Sub-bar utility items containing the model selector */}
                <div className="flex items-center justify-between border-t border-white/5 pt-2.5 mt-2 px-1">
                  
                  {/* Premium Model Selector on the left */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-zinc-900 border border-white/5 px-2.5 py-1.5 rounded-xl transition-all focus-within:border-orange-500/40 focus-within:ring-1 focus-within:ring-orange-500/20" style={{ focusWithinBorderColor: themeSettings.accentColor + "40" } as any}>
                      <Cpu size={14} className="text-orange-500" style={{ color: themeSettings.accentColor }} />
                      <select
                        id="model-select-control"
                        value={selectedModelId}
                        onChange={(e) => setSelectedModelId(e.target.value)}
                        className="bg-transparent text-[11px] text-zinc-300 font-medium focus:outline-none cursor-pointer pr-1"
                      >
                        <option value="gemini-2.5-flash" className="bg-[#121212] text-zinc-300">Gemini 2.5 Flash</option>
                        <option value="gemini-2.5-pro" className="bg-[#121212] text-zinc-300">Gemini 2.5 Pro</option>
                        <option value="deepseek-r1" className="bg-[#121212] text-zinc-300">DeepSeek R1 (Reasoning)</option>
                        <option value="llama-3.3-70b" className="bg-[#121212] text-zinc-300">Llama 3.3 70B</option>
                        <option value="qwen-2.5-coder" className="bg-[#121212] text-zinc-300">Qwen 2.5 Coder</option>
                      </select>
                    </div>
                  </div>

                  {/* Send Action */}
                  <button
                    id="chat-send-trigger"
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="p-2.5 rounded-xl text-[#111] transition-all transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-md"
                    style={{ backgroundColor: themeSettings.accentColor }}
                  >
                    <PaperPlaneRight size={15} weight="bold" />
                  </button>
                </div>
              </div>
            </form>
          </div>

        </div>

      </main>

      {/* 4. LAYER 3: Modal overlays */}
      {showAppearanceModal && (
        <AppearanceModal
          settings={themeSettings}
          onSave={(updated) => setThemeSettings(updated)}
          onClose={() => setShowAppearanceModal(false)}
        />
      )}

      {showSettingsModal && account && (
        <SettingsModal
          account={account}
          usageStats={stats}
          systemPrompts={systemPrompts}
          activeSystemPromptId={activePromptId}
          accentColor={themeSettings.accentColor}
          mode={themeSettings.mode}
          onDisconnect={handleDisconnect}
          onSaveSystemPrompts={handleSaveSystemPrompts}
          onExportChats={handleExportChats}
          onClearChats={handleClearAllChats}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

    </div>
  );
}
