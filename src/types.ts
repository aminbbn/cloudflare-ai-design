export interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  model?: string;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  isArchived: boolean;
  projectId: string | null;
  messages: Message[];
}

export interface Project {
  id: string;
  title: string;
  color: string;
}

export interface SystemPrompt {
  id: string;
  label: string;
  prompt: string;
}

export interface CloudflareAccount {
  connected: boolean;
  email: string;
  accountId: string;
  apiToken: string;
  plan: "Free Developer" | "Enterprise Network" | "Pro Core";
}

export interface AppUsageStats {
  chatsCreated: number;
  messagesProcessed: number;
  apiLatencySum: number; // millisecond estimation
  estimatedTokens: number;
}

export interface ThemeSettings {
  mode: "dark" | "light";
  accentColor: string; // e.g. '#F38020' for Cloudflare Orange
  backgroundType: "image" | "abstract" | "minimal";
  backgroundImageUrl: string;
  backgroundOpacity: number; // 0 to 100
  backgroundBlur: number; // 0 to 40 px
  fontFamily: "Inter" | "Outfit" | "Space Grotesk" | "Plus Jakarta Sans" | "JetBrains Mono" | "Playfair Display";
  fontSize: "sm" | "base" | "lg" | "xl";
  cardBlur: boolean;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  refinedPrompt: string;
  model: string;
  aspect: string;
  steps: number;
  createdAt: string;
  seed: number;
  width: number;
  height: number;
  telemetry?: {
    inferenceTimeMs: number;
    tokensUsed: number;
    engine: string;
    status: string;
    nodeId: string;
  };
}
