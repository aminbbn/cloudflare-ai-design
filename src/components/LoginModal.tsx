import React, { useState } from "react";
import { Cloud, ShieldCheck, ArrowRight } from "@phosphor-icons/react";
import { CloudflareAccount } from "../types";

interface LoginModalProps {
  onLoginSuccess: (account: CloudflareAccount) => void;
  accentColor: string;
}

export default function LoginModal({ onLoginSuccess, accentColor }: LoginModalProps) {
  const [email] = useState("developer@cloudflare.com");
  const [accountId] = useState("cf_user_98aef0104");
  const [apiToken] = useState("simulated_cloudflare_auth_token");
  const [plan] = useState<"Free Developer" | "Enterprise Network" | "Pro Core">("Enterprise Network");
  
  const [step, setStep] = useState<"input" | "connecting" | "success">("input");
  const [statusLog, setStatusLog] = useState("");

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("connecting");
    
    const logs = [
      "Establishing connection to Cloudflare Anycast API...",
      "Resolving authorization certificates through zone records...",
      "Validating Cloudflare ID credentials...",
      "Configuring cloud sandbox proxies...",
      "Simulating secure auth handshake... Successful!",
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setStatusLog(log);
        if (index === logs.length - 1) {
          setTimeout(() => {
            setStep("success");
          }, 800);
        }
      }, index * 500);
    });
  };

  const handleFinish = () => {
    onLoginSuccess({
      connected: true,
      email: email,
      accountId: accountId,
      apiToken: apiToken,
      plan: plan,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-md overflow-hidden bg-zinc-950 border border-white/10 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(243,128,32,0.2)] flex flex-col relative"
        style={{ "--accent-hex": accentColor } as React.CSSProperties}
      >
        {/* Subtle orange accent divider */}
        <div className="h-[2px] w-full" style={{ backgroundColor: accentColor }} />

        {step === "input" && (
          <div className="p-8 md:p-10 flex flex-col items-center text-center">
            {/* Elegant double-bezel wrapper around the cloud icon */}
            <div className="mb-6 p-2 bg-white/5 rounded-full ring-1 ring-white/10 flex items-center justify-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
              >
                <Cloud size={32} weight="fill" />
              </div>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white font-sans mb-2">
              Cloudflare Authentication
            </h2>
            <p className="text-xs text-zinc-400 max-w-xs mb-8">
              Access the high-performance local AI dashboard with a single secure handshake.
            </p>

            {/* Core sleek interactive login key button */}
            <button
              onClick={handleConnect}
              className="group w-full py-4 px-6 rounded-xl flex items-center justify-center gap-3 font-semibold transition-all hover:brightness-110 active:scale-[0.98] cursor-pointer"
              style={{ backgroundColor: accentColor, color: "#0c0d10" }}
            >
              <Cloud size={20} weight="fill" />
              <span>Login with Cloudflare</span>
              <ArrowRight size={18} weight="bold" className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <p className="text-[10px] text-zinc-500 mt-6 leading-relaxed max-w-[280px]">
              Secure login processes fully simulated client-side. No sensitive passwords are transmitted over external networks.
            </p>
          </div>
        )}

        {step === "connecting" && (
          <div className="p-10 md:p-12 flex flex-col items-center justify-center text-center">
            {/* Rotating radar aura mimicking server check */}
            <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
              <div 
                className="absolute inset-0 rounded-full border border-orange-500/20 animate-ping"
                style={{ animationDuration: "3s" }} 
              />
              <div 
                className="absolute inset-2 rounded-full border border-orange-500/45 animate-ping"
                style={{ animationDuration: "1.8s" }} 
              />
              <div 
                className="w-14 h-14 rounded-full bg-zinc-900 border flex items-center justify-center text-white"
                style={{ borderColor: accentColor }}
              >
                <Cloud size={24} className="animate-pulse" style={{ color: accentColor }} />
              </div>
            </div>

            <h3 className="text-lg font-semibold text-white tracking-tight mb-3">
              Connecting Cloudflare Gateway
            </h3>
            
            <div className="w-full bg-zinc-900/60 rounded-xl p-3.5 border border-white/5 min-h-[52px] flex items-center justify-center">
              <p className="text-xs font-mono text-orange-400 leading-normal">
                &gt; {statusLog || "Initializing node handshake..."}
              </p>
            </div>
            
            <p className="text-[10px] text-zinc-500 mt-6 font-mono uppercase tracking-wider">
              Anycast Routing: Active
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="p-10 md:p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
              <ShieldCheck size={36} weight="duotone" />
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-white mb-2">
              Connected Successfully
            </h3>
            <p className="text-xs text-zinc-400 mb-6 max-w-xs leading-relaxed">
              Your simulated session is online. Host network pathways mapped over our cloud security mesh.
            </p>

            <div className="w-full bg-zinc-900/40 rounded-xl p-4 border border-white/5 space-y-2 text-left mb-8">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-zinc-500">Connection Status</span>
                <span className="font-semibold text-emerald-400">ONLINE</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-zinc-500">Routing IP Address</span>
                <span className="font-mono text-zinc-300">104.16.0.1</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-zinc-500">Assigned Platform Tier</span>
                <span className="text-orange-400 font-medium tracking-wide uppercase">{plan}</span>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-3.5 bg-white text-zinc-950 font-semibold rounded-xl hover:bg-zinc-100 transition-colors cursor-pointer active:scale-95"
            >
              Enter Workspace
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
