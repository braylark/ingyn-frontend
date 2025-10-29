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

      {/* shimmer sweep */}
      <div className="absolute inset-0 [mask-image:radial-gradient(circle_at_center,white_0%,transparent_70%)]">
        <div className="w-full h-full -translate-x-full animate-[shimmerMove_2s_linear_infinite] bg-[linear-gradient(120deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.18)_50%,rgba(255,255,255,0)_100%)]" />
      </div>
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
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function generateCaptionFromBackend(topicPrompt: string) {
  const gptPrompt =
    `Write a brand-safe Instagram caption (<=120 words) with a friendly, confident tone. Include 3–6 hashtags.\n\nTopic: ${topicPrompt}`;
  const res = await fetch(`${API_BASE}/api/v1/generate-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: gptPrompt, characterId: CHARACTER_ID }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return typeof data === "string" ? data : "";
}

/* ────────────────────────────────────────────────
   HELPERS
   ──────────────────────────────────────────────── */
const extractHashtagsFromCaption = (caption: string) =>
  caption
    .split(/\s+/)
    .filter((w) => w.startsWith("#"))
    .slice(0, 6);

const estimateReach = () => "12.4k est reach";
const suggestBestTime = () => "Tue 7:30 PM";

/* ────────────────────────────────────────────────
   COMPONENT
   ──────────────────────────────────────────────── */
export default function ContentCreationHub({
  hasAccount,
  onAccountCreated,
}: ContentCreationHubProps) {
  const [customPrompt, setCustomPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  const [myPosts, setMyPosts] = useState<PostItem[]>([]);
  const [nextId, setNextId] = useState(100);

  const [activeTab, setActiveTab] = useState("my-posts");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [showTrainDialog, setShowTrainDialog] = useState(false);
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const [pendingAction, setPendingAction] = useState<"schedule" | "post" | null>(
    null
  );
  const [pendingPostId, setPendingPostId] = useState<number | null>(null);

  const promptRef = useRef<HTMLTextAreaElement | null>(null);

  /* ───────────────────────────
     Generate flow
     ─────────────────────────── */
  const handleGenerateCustomPost = async () => {
    if (!customPrompt.trim()) {
      promptRef.current?.focus();
      return;
    }

    setGenerating(true);

    // optimistic placeholder post
    const optimisticId = nextId;
    const optimistic: PostItem = {
      id: optimisticId,
      image: "",
      caption: "",
      status: "processing",
      hashtags: [],
      predictedReach: "—",
      bestTime: "—",
    };

    setMyPosts((prev) => [optimistic, ...prev]);
    setNextId((n) => n + 1);
    setActiveTab("my-posts");

    try {
      // 1. generate image
      const imageRes = await generateImageFromBackend(customPrompt);
      const url =
        Array.isArray(imageRes.image_urls) && imageRes.image_urls.length
          ? imageRes.image_urls[0]
          : "";
      if (!url) throw new Error("No image URL");

      // 2. generate caption
      let caption = "";
      try {
        caption = await generateCaptionFromBackend(customPrompt);
      } catch {
        caption = "";
      }

      // 3. finalize
      setMyPosts((prev) =>
        prev.map((p) =>
          p.id === optimisticId
            ? {
                ...p,
                image: url,
                caption,
                status: "ready",
                hashtags: extractHashtagsFromCaption(caption),
                predictedReach: estimateReach(),
                bestTime: suggestBestTime(),
              }
            : p
        )
      );

      setCustomPrompt("");
    } catch {
      // failed
      setMyPosts((prev) =>
        prev.map((p) =>
          p.id === optimisticId
            ? {
                ...p,
                status: "failed",
              }
            : p
        )
      );
    } finally {
      setGenerating(false);
    }
  };

  /* ───────────────────────────
     Action handlers
     ─────────────────────────── */
  const handleScheduleClick = (postId: number) => {
    if (!hasAccount) {
      setPendingAction("schedule");
      setPendingPostId(postId);
      setShowAccountDialog(true);
    } else {
      // future: open scheduler
    }
  };

  const handlePostNowClick = (postId: number) => {
    if (!hasAccount) {
      setPendingAction("post");
      setPendingPostId(postId);
      setShowAccountDialog(true);
    } else {
      // future: post API call
    }
  };

  const handleAccountCreationComplete = () => {
    setShowAccountDialog(false);
    setShowPaymentDialog(true);
  };

  const handlePaymentComplete = () => {
    setShowPaymentDialog(false);
    onAccountCreated();
    setPendingAction(null);
    setPendingPostId(null);
  };

  /* ───────────────────────────
     Card render helpers
     ─────────────────────────── */

  // GRID CARD:
  // square visual on top; hide body until status === "ready"
  const GridCard = (post: PostItem) => {
    const onRetry = () => {
      setCustomPrompt(post.caption.replace(/^✨\s?/, "") || "");
      document
        .querySelector("textarea")
        ?.scrollIntoView({ behavior: "smooth" });
      promptRef.current?.focus();
    };

    return (
      <Card
        key={post.id}
        className="bg-white border-0 rounded-2xl overflow-hidden flex flex-col"
      >
        <div className="w-full aspect-square">
          {post.status === "processing" && <GeneratingBlock />}

          {post.status === "failed" && <FailedBlock onRetry={onRetry} />}

          {post.status === "ready" && (
            <div className="relative w-full h-full">
              <ImageWithFallback
                src={post.image}
                alt={`Generated ${post.id}`}
                className="w-full h-full object-cover rounded-xl"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
              />

              {/* overlay stats */}
              <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                <div className="flex-1 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-white" />
                  <span className="text-white text-sm">
                    ~{post.predictedReach}
                  </span>
                </div>
                <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#00D1B2]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {post.status === "ready" && (
          <div className="p-4 space-y-4">
            {post.caption && (
              <p className="text-sm text-[#1E1E1E] break-words">
                {post.caption}
              </p>
            )}

            {post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map((tag, idx) => (
                  <Badge
                    key={idx}
                    className="bg-gray-100 text-[#A1A1A1] hover:bg-gray-100 text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => handleScheduleClick(post.id)}
                className="flex-1 bg-[rgb(100,100,180)] hover:bg-[#6464B4] text-white rounded-xl"
                size="sm"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>

              <Button
                onClick={() => handlePostNowClick(post.id)}
                variant="outline"
                className="flex-1 border-gray-200 rounded-xl"
                size="sm"
              >
                <Send className="w-4 h-4 mr-2" />
                Post Now
              </Button>
            </div>
          </div>
        )}
      </Card>
    );
  };

  // LIST CARD:
  // left image is fixed 200x200; right side hidden unless ready
  const ListCard = (post: PostItem) => {
    const onRetry = () => {
      setCustomPrompt(post.caption.replace(/^✨\s?/, "") || "");
      document
        .querySelector("textarea")
        ?.scrollIntoView({ behavior: "smooth" });
      promptRef.current?.focus();
    };

    return (
      <Card
        key={post.id}
        className="bg-white border-0 rounded-2xl overflow-hidden p-4 flex flex-row gap-4 items-start"
      >
        <div className="w-[200px] h-[200px] rounded-xl overflow-hidden flex-shrink-0">
          {post.status === "processing" && <GeneratingBlock />}

          {post.status === "failed" && <FailedBlock onRetry={onRetry} />}

          {post.status === "ready" && (
            <ImageWithFallback
              src={post.image}
              alt={`Generated ${post.id}`}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
            />
          )}
        </div>

        {post.status === "ready" && (
          <div className="flex flex-col justify-between flex-1 min-w-0">
            <div className="space-y-3">
              {post.caption && (
                <p className="text-sm text-[#1E1E1E] break-words">
                  {post.caption}
                </p>
              )}

              {post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.hashtags.map((tag, idx) => (
                    <Badge
                      key={idx}
                      className="bg-gray-100 text-[#A1A1A1] hover:bg-gray-100 text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => handleScheduleClick(post.id)}
                className="flex-1 bg-[rgb(100,100,180)] hover:bg-[#6464B4] text-white rounded-xl"
                size="sm"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>

              <Button
                onClick={() => handlePostNowClick(post.id)}
                variant="outline"
                className="flex-1 border-gray-200 rounded-xl"
                size="sm"
              >
                <Send className="w-4 h-4 mr-2" />
                Post Now
              </Button>
            </div>
          </div>
        )}

        {post.status === "failed" && (
          <div className="flex flex-col justify-center flex-1 min-w-0 text-sm text-gray-500">
            <div className="text-gray-400 text-xs">
              Generation failed. Try again.
            </div>
          </div>
        )}
        {post.status === "processing" && (
          <div className="flex flex-col justify-center flex-1 min-w-0 text-sm text-gray-400">
            <div className="text-[11px] uppercase tracking-wide text-gray-400">
              Generating post content…
            </div>
          </div>
        )}
      </Card>
    );
  };

  /* ───────────────────────────
     RENDER
     ─────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-3xl text-[#1E1E1E] mb-2">Create Content</h1>
          <p className="text-gray-600">
            AI-powered content suggestions tailored to your audience
          </p>
        </div>
      </div>

      {/* Prompt Input */}
      <Card className="p-6 bg-white border-0 rounded-2xl">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#6464B4]" />
            <h3 className="text-[#1E1E1E]">Generate Custom Content</h3>
          </div>

          <Textarea
            ref={promptRef}
            placeholder="Describe the post you want to create..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="rounded-xl border-gray-200 min-h-[80px]"
          />

          <Button
            onClick={handleGenerateCustomPost}
            disabled={generating}
            className="bg-[rgb(100,100,180)] hover:bg-[#6464B4] text-white rounded-xl px-6 disabled:opacity-60"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {generating ? "Generating…" : "Generate"}
          </Button>
        </div>
      </Card>

      {/* Posts Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <TabsList className="bg-gray-100 border border-gray-200">
            <TabsTrigger
              value="my-posts"
              className="data-[state=active]:bg-[#6464B4] data-[state=active]:text-white text-gray-600"
            >
              My Posts {myPosts.length > 0 && `(${myPosts.length})`}
            </TabsTrigger>
          </TabsList>

          {/* view toggle */}
          <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`rounded-md ${
                viewMode === "grid"
                  ? "bg-[#6464B4] text-white hover:bg-[#6464B4]"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("list")}
              className={`rounded-md ${
                viewMode === "list"
                  ? "bg-[#6464B4] text-white hover:bg-[#6464B4]"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="my-posts" className="mt-4">
          {myPosts.length === 0 ? (
            <Card className="p-12 bg-white border border-gray-200 rounded-2xl text-center">
              <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl text-[#1E1E1E] mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-6">
                Generate custom content using the AI prompt above.
              </p>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid lg:grid-cols-3 gap-6">
              {myPosts.map((p) => (
                <GridCard key={p.id} {...p} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {myPosts.map((p) => (
                <ListCard key={p.id} {...p} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <TrainAmbassadorDialog
        isOpen={showTrainDialog}
        onClose={() => setShowTrainDialog(false)}
      />

      <AccountCreationDialog
        isOpen={showAccountDialog}
        onComplete={handleAccountCreationComplete}
      />

      <PaymentDialog
        isOpen={showPaymentDialog}
        onClose={() => {
          setShowPaymentDialog(false);
          setPendingAction(null);
          setPendingPostId(null);
        }}
        onComplete={handlePaymentComplete}
      />
    </div>
  );
}
