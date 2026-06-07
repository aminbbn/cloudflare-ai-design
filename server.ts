import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));

  // Initialize GoogleGenAI client securely
  const apiKey = process.env.GEMINI_API_KEY;
  let aiClient: GoogleGenAI | null = null;

  if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    try {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
      console.log("Cloudflare AI backend: Gemini client successfully configured.");
    } catch (err) {
      console.error("Cloudflare AI backend: Error configuring Gemini client:", err);
    }
  } else {
    console.log("Cloudflare AI backend: API key missing; operating in local simulation mode.");
  }

  // REST endpoints
  app.post("/api/improve", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || !text.trim()) {
        return res.status(400).json({ error: "No prompt text provided for improvement." });
      }

      const promptToImprove = text.trim();

      if (!aiClient) {
        // High-quality local improvement generator when unconfigured/offline
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        const improvedPromptsSimulated = [
          `Optimized edge configuration request: Analyze low-latency routing tables and security coordinates for the system: "${promptToImprove}". Provide standard configuration blueprints.`,
          `Security-audited system model response: Draft an elite technical architecture proposal tackling performance mitigation and speed optimizations for: "${promptToImprove}". Include benchmarking references.`,
          `Cloudflare Workers serverless structure audit: Refactor and secure the operational workflow for "${promptToImprove}" on standard cloud runtimes. Elaborate on R2 storage sync, KV namespaces, and D1 database query optimization.`,
        ];
        
        const refined = improvedPromptsSimulated[Math.floor(Math.random() * improvedPromptsSimulated.length)];
        return res.json({ text: refined });
      }

      const response = await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{
              text: `Translate this simple prompt or question into a professional, clear, highly detailed, and technical cloud architect prompt/inquiry designed for an elite Cloudflare systems assistant. Focus on robust, production-grade parameters, edge routing, performance metrics, and security structures if applicable. Return ONLY the improved prompt ready to use, with no extra wrapper text, intro, or markdown backticks.\n\nPrompt to improve:\n"${promptToImprove}"`
            }]
          }
        ],
        config: {
          temperature: 0.6,
        }
      });

      const improvedText = response.text?.trim() || promptToImprove;
      return res.json({ text: improvedText });

    } catch (err: any) {
      console.error("Cloudflare AI Improve API Error:", err);
      return res.json({ text: `${req.body.text} - refined for optimized cloud serverless architecture deployment guidelines.` });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, systemPrompt, model } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message content cannot be blank." });
      }

      if (!aiClient) {
        // High-quality local simulated responder when API key is unconfigured or offline
        await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 500));
        
        let localGreetingSuffix = "";
        if (model === "deepseek-r1") {
          localGreetingSuffix = "\n\n<think>\nEvaluating local simulated node path... stable.\nSelected Reasoning engine: DeepSeek-R1 (Local simulation mode).\n</think>\n[Reasoning Complete] All offline pathways are stable. Connect your live billing token to run full deep-thinking traces.";
        } else if (model === "qwen-2.5-coder") {
          localGreetingSuffix = " [Optimized with Qwen 2.5 Coder Mode - Code execution logs stable]";
        } else if (model) {
          localGreetingSuffix = ` [Model routing: ${model}]`;
        }

        const welcomeMessages = [
          `As the Cloudflare AI network guardian, I have synthesized your message: "${message}". Note: Standard Offline Mode is active or the cloud endpoint has completed simulated handshakes. To utilize live responses, update GEMINI_API_KEY. System Prompt setting: "${systemPrompt || "None"}".${localGreetingSuffix}`,
          `Analyzing telemetry for node connection... Simulated reply to "${message}" is stable. Our current edge latency is 2.3ms. All network pathways are nominal. Update your system parameters in Settings anytime.${localGreetingSuffix}`,
          `[Node-Simulated Reply] Received "${message}". Your system configuration is active and routing. How can your edge operations assist you further today?${localGreetingSuffix}`,
        ];
        
        const randomReply = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
        return res.json({ text: randomReply });
      }

      // Build standard message history array matching GoogleGenAI format
      const contents: any[] = [];
      if (history && Array.isArray(history)) {
        history.forEach((turn: any) => {
          contents.push({
            role: turn.role === "user" ? "user" : "model",
            parts: [{ text: turn.text }],
          });
        });
      }

      // Add current user prompt
      contents.push({
        role: "user",
        parts: [
          {
            text: message,
          },
        ],
      });

      // Map client models to safe live Gemini API equivalents with customized system instructions
      let resolvedModel = "gemini-2.5-flash";
      let resolvedSystemPrompt = systemPrompt || "You are Cloudflare AI, an advanced, high-performance conversational intelligence inspired by Cloudflare's digital edge networks. Provide technical, extremely helpful, rapid, and mathematically precise responses. Keep formatting clean with beautiful code snippets and markdown as needed.";

      if (model === "gemini-2.5-pro") {
        resolvedModel = "gemini-2.5-pro";
      } else if (model === "gemini-1.5-pro") {
        resolvedModel = "gemini-1.5-pro";
      } else if (model === "gemini-1.5-flash") {
        resolvedModel = "gemini-1.5-flash";
      } else if (model === "deepseek-r1") {
        resolvedModel = "gemini-2.5-pro";
        resolvedSystemPrompt += "\n\nCRITICAL: You are acting as the DeepSeek-R1 (Distilled) model hosted on the edge. You MUST begin your response by outputting your step-by-step reasoning inside a <think> ... </think> block. Deconstruct the architecture, consider all performance risks, and write highly analytical steps. Follow the reasoning block immediately with your finalized solution.";
      } else if (model === "llama-3.3-70b") {
        resolvedModel = "gemini-2.5-flash";
        resolvedSystemPrompt += "\n\nYou are simulating Meta's latest Llama-3.3-70b-instruct model on Cloudflare Workers AI. Adopt an engineering tone, starting with brief simulated system log headers representing standard Llama parameters.";
      } else if (model === "qwen-2.5-coder") {
        resolvedModel = "gemini-2.5-pro"; // Keep high-context coding power
        resolvedSystemPrompt += "\n\nYou are acting as the Qwen-2.5-Coder model, highly optimized for robust, production-grade systems programming. Focus intensely on rich, secure code snippets and minimal filler. Ensure every line of code has precise error handling.";
      }

      const response = await aiClient.models.generateContent({
        model: resolvedModel,
        contents: contents,
        config: {
          systemInstruction: resolvedSystemPrompt,
          temperature: 0.7,
        },
      });

      return res.json({ text: response.text || "No reply generated." });
    } catch (error: any) {
      console.error("Cloudflare AI API Error:", error);
      return res.status(500).json({
        error: error?.message || "An error occurred during edge model execution.",
      });
    }
  });

  // Setup dev server or static distribution build routing
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Cloudflare AI Node server active at http://0.0.0.0:${PORT}`);
  });
}

startServer();
