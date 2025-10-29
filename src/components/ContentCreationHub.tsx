import { useRef, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Sparkles,
  TrendingUp,
  Calendar,
  Send,
  Heart,
  LayoutGrid,
  List,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import TrainAmbassadorDialog from "./TrainAmbassadorDialog";
import AccountCreationDialog from "./AccountCreationDialog";
import PaymentDialog from "./PaymentDialog";

/* ────────────────────────────────────────────────
   CONSTANTS
   ──────────────────────────────────────────────── */
const CHARACTER_ID = "8cc016ad-c9c7-460e-a1d3-f348f8f8ae46";
const API_BASE = ""; // keep empty if Netlify proxies /api → backend

type PostStatus = "processing" | "ready" | "failed";

interface PostItem {
  id: number;
  image: string;
  caption: string;
  status: PostStatus;
  hashtags: string[];
  predictedReach: string;
  bestTime: string;
}

interface ContentCreationHubProps {
  hasAccount: boolean;
  onAccountCreated: () => void;
}

/* ────────────────────────────────────────────────
   VISUAL STATES
   ──────────────────────────────────────────────── */
function GeneratingBlock() {
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-[#111] via-[#232356] to-[#000] flex items-center justify-center">
      {/* animated glow */}
      <div className="absolute w-56 h-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(100,100,180,0.6),transparent_70%)] blur-3xl animate-pulse opacity-70" />
      {/* shimmer gradient */}
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0)_100%)] animate-[shimmerMove_2s_infinite]" />
      <style>{`
        @keyframes shimmerMove {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* spinner + text */}
      <div className="relative z-10 flex flex-col items-center gap-2 text-white">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-white" />
          <span>Generating image…</span>
        </div>
        <p className="text-[10px] text-white/60 tracking-widest uppercase">
          AI is creating your post
        </p>
      </div>
    </div>
  );
}

function FailedBlock({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-[#2a1a1a] via-[#3a1f1f] to-[#000] flex items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-white z-10">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs">
          <RefreshCw className="w-4 h-4 text-white" />
          <span>Generation failed</span>
        </div>
        <button
          onClick={onRetry}
          className="text-[11px] text-white/70 underline hover:text-white"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   BACKEND CALLS
   ──────────────────────────────────────────────── */
async function generateImageFromBackend(prompt: string) {
  const body = { prompt, characterId: CHARACTER_ID };
  const res = await fetch(`${API_BASE}/api/v1/generate-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await re
