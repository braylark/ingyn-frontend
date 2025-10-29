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
const API_BASE = ""; // keep "" if Netlify proxies /api → backend

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
   LOADER + FAILED VISUALS
   ──────────────────────────────────────────────── */

/**
 * Puff-style loader: two circles expanding/fading.
 * Underneath: "Your post is being generated."
 */
function PuffLoaderBlock() {
  return (
    <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#111] via-[#232356] to-[#000] flex flex-col items-center justify-center text-white relative overflow-hidden">
      {/* two expanding circles */}
      <div className="relative w-16 h-16 mb-3">
        <div className="absolute inset-0 rounded-full border-4 border-white/60 animate-[puff_1.5s_ease-out_infinite] opacity-80" />
        <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-[puff_1.5s_ease-out_infinite] [animation-delay:0.75s]" />
      </div>

      <div className="text-xs font-medium bg-black/50 backdrop-blur-sm border border-white/10 px-3 py-1 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
        Your post is being generated.
      </div>

      <style>{`
        @keyframes puff {
          0% {
            transform: scale(0.5);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Failure block with retry action.
 */
function FailedBlock({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#2a1a1a] via-[#3a1f1f] to-[#000] flex flex-col items-center justify-center text-white relative overflow-hidden">
      <div className="flex flex-col items-center gap-2 z-10">
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
    `Write a brand-safe Instagram caption (<=120 words) with a friendly, confident tone. ` +
    `Include 3–6 hashtags.\n\nTopic: ${topicPrompt}`;

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
     GENERATE FLOW
     ─────────────────────────── */
  const handleGenerateCustomPost = async () => {
    if (!customPrompt.trim()) {
      promptRef.current?.focus();
      return;
    }

    setGenerating(true);

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
      // 1. image
      const imageRes = await generateImageFromBackend(customPrompt);
      const url =
        Array.isArray(imageRes.image_urls) && imageRes.image_urls.length
          ? imageRes.image_urls[0]
          : "";
      if (!url) throw new Error("No image URL");

      // 2. caption
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
     ACTION HANDLERS
     ─────────────────────────── */
  const handleScheduleClick = (postId: number) => {
    if (!hasAccount) {
      setPendingAction("schedule");
      setPendingPostId(postId);
      setShowAccountDialog(true);
    } else {
      // TODO integrate scheduler
    }
  };

  const handlePostNowClick = (postId: number) => {
    if (!hasAccount) {
      setPendingAction("post");
      setPendingPostId(postId);
      setShowAccountDialog(true);
    } else {
      // TODO integrate posting
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
     CARD RENDER HELPERS
     ─────────────────────────── */

  // GRID CARD (for grid mode)
  // - big image block (aspect-square)
  // - only shows caption/buttons if status === "ready"
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
          {post.status === "processing" && <PuffLoaderBlock />}

          {post.status === "failed" && <FailedBlock onRetry={onRetry} />}

          {post.status === "ready" && (
            <div className="relative w-full h-full rounded-xl overflow-hidden">
              <ImageWithFallback
                src={post.image}
                alt={`Generated ${post.id}`}
                className="w-full h-full object-cover"
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

  // LIST CARD (for list mode)
  // - image column is a fixed 200x200 thumbnail on the left
  // - right column only appears when status === "ready"
  // - while processing: we show the PuffLoaderBlock in that 200x200 box
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
        {/* LEFT: fixed-size thumbnail container */}
        <div className="w-[200px] h-[200px] rounded-xl overflow-hidden flex-shrink-0 flex-grow-0 bg-black">
          {post.status === "processing" && (
            <div className="w-full h-full">
              <PuffLoaderBlock />
            </div>
          )}

          {post.status === "failed" && (
            <div className="w-full h-full">
              <FailedBlock onRetry={onRetry} />
            </div>
          )}

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

        {/* RIGHT: content only if ready */}
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

        {/* RIGHT: fallback message if not ready */}
        {post.status === "processing" && (
          <div className="flex items-center flex-1 min-w-0 text-[11px] text-gray-500 uppercase tracking-wide">
            Your post is being generated.
          </div>
        )}
        {post.status === "failed" && (
          <div className="flex items-center flex-1 min-w-0 text-[11px] text-gray-500">
            Generation failed. Try again.
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

      {/* Prompt / Generator */}
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

      {/* Posts */}
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
