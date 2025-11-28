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
  Trash2,
  Clock,
  BarChart2,
  Zap,
  ChevronDown,
  Settings,
  Info,
  MoreHorizontal,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import TrainAmbassadorDialog from "./TrainAmbassadorDialog";
import AccountCreationDialog from "./AccountCreationDialog";
import PaymentDialog from "./PaymentDialog";

/* ──────────────────────────────────────────────── */
const AVATAR_STORAGE_KEY = "ingyn_selected_avatar";
const DEFAULT_CHARACTER_ID = "8cc016ad-c9c7-460e-a1d3-f348f8f8ae46"; // Lyra default
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const LOADER_GIF =
  "https://i.pinimg.com/originals/54/58/a1/5458a14ae4c8f07055b7441ff0f234cf.gif";

// Read selected avatar from localStorage (set by CreateAmbassador)
function getCurrentCharacterId(): string {
  if (typeof window === "undefined") return DEFAULT_CHARACTER_ID;
  try {
    const stored = window.localStorage.getItem(AVATAR_STORAGE_KEY);
    if (!stored) return DEFAULT_CHARACTER_ID;
    const parsed = JSON.parse(stored) as { characterId?: string };
    return parsed?.characterId || DEFAULT_CHARACTER_ID;
  } catch {
    return DEFAULT_CHARACTER_ID;
  }
}

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

/* ──────────────────────────────────────────────── */
/* Helpers */
const coerceCaption = (raw: any): string => {
  if (!raw) return "";
  if (typeof raw === "string") return raw;

  // Try typical Gemini / OpenAI-style responses
  try {
    if (
      typeof raw === "object" &&
      raw !== null &&
      "candidates" in raw &&
      Array.isArray((raw as any).candidates)
    ) {
      const t = (raw as any).candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof t === "string") return t;
    }
  } catch {}

  try {
    if (
      typeof raw === "object" &&
      raw !== null &&
      "choices" in raw &&
      Array.isArray((raw as any).choices)
    ) {
      const t = (raw as any).choices?.[0]?.message?.content;
      if (typeof t === "string") return t;
    }
  } catch {}

  try {
    if (typeof raw === "object" && raw !== null && "text" in raw) {
      const t = (raw as any).text;
      if (typeof t === "string") return t;
    }
  } catch {}

  try {
    return JSON.stringify(raw);
  } catch {
    return "";
  }
};

const extractHashtags = (caption: string) =>
  caption
    .split(/\s+/)
    .filter((w) => w.startsWith("#"))
    .slice(0, 6);

const estimateReach = () => "12.4k est reach";
const suggestBestTime = () => "Tue 7:30 PM";

/* ──────────────────────────────────────────────── */
/* Visual blocks */
function LoaderBlock() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#f9f9f9] rounded-xl p-4">
      <img
        src={LOADER_GIF}
        alt="Loading animation"
        style={{
          width: "min(350px, 80%)",
          height: "auto",
          maxHeight: "70%",
          display: "block",
          borderRadius: 8,
        }}
      />
      <div className="mt-4 text-sm font-medium text-gray-800 bg-white/90 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.08)] text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1.5">
          <Sparkles className="w-4 h-4 text-[#6464B4]" />
          Cooking your content magic… hang tight ✨
        </span>
      </div>
    </div>
  );
}

function FailedBlock({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#2a1a1a] rounded-xl p-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm border border-white/10 px-3 py-1 rounded-full text-xs text-white">
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

/* ──────────────────────────────────────────────── */
/* Backend calls */
async function generateImageFromBackend(prompt: string) {
  const res = await fetch(`${API_BASE}/api/v1/generate-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, characterId: getCurrentCharacterId() }),
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
    body: JSON.stringify({ prompt: gptPrompt, characterId: getCurrentCharacterId() }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* ──────────────────────────────────────────────── */
export default function ContentCreationHub({
  hasAccount,
  onAccountCreated,
}: ContentCreationHubProps) {
  const [customPrompt, setCustomPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [myPosts, setMyPosts] = useState<PostItem[]>([]);
  const [nextId, setNextId] = useState(100);
  const [activeTab, setActiveTab] = useState<"my-posts" | "insights">(
    "my-posts"
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showTrainDialog, setShowTrainDialog] = useState(false);
  const [showAccountDialog, setShowAccountDialog] = useState(!hasAccount);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const promptRef = useRef<HTMLTextAreaElement | null>(null);

  const handleGenerateCustomPost = async () => {
    if (!customPrompt.trim()) {
      promptRef.current?.focus();
      return;
    }
    setGenerating(true);

    const optimisticId = nextId;
    setMyPosts((prev) => [
      {
        id: optimisticId,
        image: "",
        caption: "",
        status: "processing",
        hashtags: [],
        predictedReach: "—",
        bestTime: "—",
      },
      ...prev,
    ]);
    setNextId((n) => n + 1);
    setActiveTab("my-posts");

    try {
      const imageRes = await generateImageFromBackend(customPrompt);
      const url =
        Array.isArray((imageRes as any).image_urls) &&
        (imageRes as any).image_urls.length
          ? (imageRes as any).image_urls[0]
          : "";
      if (!url) throw new Error("No image URL");

      let captionRaw: any = "";
      try {
        captionRaw = await generateCaptionFromBackend(customPrompt);
      } catch {
        captionRaw = "";
      }

      // Robust parse + guaranteed fallback
      let caption = coerceCaption(captionRaw).trim();
      if (!caption) caption = `✨ ${customPrompt}`;

      setMyPosts((prev) =>
        prev.map((p) =>
          p.id === optimisticId
            ? {
                ...p,
                image: url,
                caption,
                status: "ready",
                hashtags: extractHashtags(caption),
                predictedReach: estimateReach(),
                bestTime: suggestBestTime(),
              }
            : p
        )
      );
      setCustomPrompt("");
    } catch {
      setMyPosts((prev) =>
        prev.map((p) =>
          p.id === optimisticId ? { ...p, status: "failed" } : p
        )
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleDeletePost = (postId: number) =>
    setMyPosts((prev) => prev.filter((p) => p.id !== postId));

  /* ──────────────────────────────────────────────── */
  /* Rendering helpers */
  const renderPostCard = (post: PostItem) => {
    const isProcessing = post.status === "processing";
    const isFailed = post.status === "failed";
    const isReady = post.status === "ready";

    if (viewMode === "list") {
      return (
        <Card
          key={post.id}
          className="w-full bg-white border border-gray-100 rounded-2xl p-3 md:p-4 flex gap-3 md:gap-4"
        >
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-[#f9f9f9] flex-shrink-0">
            {isProcessing && <LoaderBlock />}
            {isFailed && (
              <FailedBlock
                onRetry={() => {
                  setCustomPrompt(post.caption || customPrompt);
                  promptRef.current?.focus();
                }}
              />
            )}
            {isReady && (
              <ImageWithFallback
                src={post.image}
                alt={`Generated ${post.id}`}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
              />
            )}
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#F5F5FA] text-[#4B4B4B] border-0 text-[11px]">
                    Higgsfield Visual + Caption
                  </Badge>
                  {isReady && (
                    <>
                      <span className="flex items-center gap-1 text-[11px] text-[#6B7280]">
                        <Clock className="w-3 h-3" />
                        {post.bestTime}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-[#6B7280]">
                        <BarChart2 className="w-3 h-3" />
                        {post.predictedReach}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-[#111827] line-clamp-3">
                  {post.caption || customPrompt}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => handleDeletePost(post.id)}
              >
                <Trash2 className="w-4 h-4 text-[#9CA3AF]" />
              </Button>
            </div>

            {isReady && post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.hashtags.map((tag) => (
                  <Badge
                    key={tag}
                    className="bg-[#F3F4F6] text-[#4B5563] border-0 text-[11px]"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {isFailed && (
              <p className="text-[11px] text-[#FECACA] bg-[#7F1D1D] px-2 py-1 rounded-full w-fit">
                We couldn&apos;t generate this post. Try again or adjust your
                prompt.
              </p>
            )}

            <div className="flex justify-between items-center pt-1">
              <div className="flex items-center gap-3 text-[11px] text-[#6B7280]">
                <button className="inline-flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  Save to Planner
                </button>
                <button className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Schedule
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full border-gray-200"
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
                <Button className="h-8 rounded-full text-xs px-3">
                  <Send className="w-3 h-3 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </Card>
      );
    }

    // Grid view
    return (
      <Card
        key={post.id}
        className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col"
      >
        <div className="w-full aspect-[4/5] bg-[#f9f9f9]">
          {isProcessing && <LoaderBlock />}
          {isFailed && (
            <FailedBlock
              onRetry={() => {
                setCustomPrompt(post.caption || customPrompt);
                promptRef.current?.focus();
              }}
            />
          )}
          {isReady && (
            <ImageWithFallback
              src={post.image}
              alt={`Generated ${post.id}`}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
            />
          )}
        </div>
        <div className="p-3 md:p-4 flex-1 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <Badge className="bg-[#F5F5FA] text-[#4B4B4B] border-0 text-[11px]">
              Higgsfield Visual + Caption
            </Badge>
            {isReady && (
              <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.bestTime}
                </span>
                <span className="inline-flex items-center gap-1">
                  <BarChart2 className="w-3 h-3" />
                  {post.predictedReach}
                </span>
              </div>
            )}
          </div>

          <p className="text-sm text-[#111827] line-clamp-3">
            {post.caption || customPrompt}
          </p>

          {isReady && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.hashtags.map((tag) => (
                <Badge
                  key={tag}
                  className="bg-[#F3F4F6] text-[#4B5563] border-0 text-[11px]"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {isFailed && (
            <p className="text-[11px] text-[#B91C1C] bg-[#FEE2E2] px-2 py-1 rounded-full w-fit">
              We couldn&apos;t generate this post. Try again or adjust your
              prompt.
            </p>
          )}

          <div className="flex items-center justify-between pt-2 mt-auto">
            <button className="inline-flex items-center gap-1 text-[11px] text-[#6B7280]">
              <Heart className="w-3 h-3" />
              Save to Planner
            </button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-gray-200"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
              <Button className="h-8 rounded-full text-xs px-3">
                <Send className="w-3 h-3 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  /* ──────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-[#6464B4]/10 text-[#6464B4] border-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Higgsfield Visual Studio
            </Badge>
            <Badge className="bg-[#F97316]/10 text-[#F97316] border-0 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Beta
            </Badge>
          </div>
          <h2 className="text-xl md:text-2xl font-semibold text-[#111827]">
            Turn one prompt into a scroll-stopping post
          </h2>
          <p className="text-sm text-[#6B7280] max-w-xl">
            Generate a Higgsfield image and caption combo tuned to your
            ambassador&apos;s voice. No prompt engineering degree required.
          </p>
        </div>
        <div className="flex flex-col items-stretch md:items-end gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="rounded-full text-xs flex items-center gap-2"
              onClick={() => setShowTrainDialog(true)}
            >
              <Settings className="w-3 h-3" />
              Train Ambassador
            </Button>
            <Button
              className="rounded-full text-xs flex items-center gap-2"
              onClick={() => setShowPaymentDialog(true)}
            >
              <Zap className="w-3 h-3" />
              Upgrade
            </Button>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
            <Info className="w-3 h-3" />
            <span>
              Avatar choice (Lyra / Mello) controls which Higgsfield character
              is used.
            </span>
          </div>
        </div>
      </div>

      {/* Prompt card */}
      <Card className="bg-white border border-gray-100 rounded-2xl p-4 md:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <Tabs defaultValue="custom" className="w-full md:w-auto">
            <TabsList className="bg-[#F5F5FA] rounded-full p-1">
              <TabsTrigger
                value="custom"
                className="rounded-full text-xs md:text-sm data-[state=active]:bg-white"
              >
                Custom prompt
              </TabsTrigger>
              <TabsTrigger
                value="templates"
                className="rounded-full text-xs md:text-sm data-[state=active]:bg-white"
              >
                Templates
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-3 text-[11px] text-[#6B7280]">
            <span className="inline-flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Auto-estimates reach
            </span>
            <span className="hidden md:inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Suggests best posting window
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <Textarea
            ref={promptRef}
            className="w-full rounded-2xl border border-gray-200 focus-visible:ring-[#6464B4] min-h-[120px] resize-none text-sm"
            placeholder={`Describe the post you want. Example: "Create a carousel where Lyra breaks down 3 hooks creators can use to double watch time."`}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
          />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#6B7280]">
              <Badge className="bg-[#F5F5FA] text-[#4B5563] border-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Mention Lyra or Mello in your prompt for sharper results.
              </Badge>
              <span className="inline-flex items-center gap-1">
                <Info className="w-3 h-3" />
                Uses your current ambassador training data.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full border-gray-200"
                onClick={() => setCustomPrompt("")}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                className="h-9 rounded-full text-xs px-4 flex items-center gap-2"
                disabled={generating}
                onClick={handleGenerateCustomPost}
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    Generate with Higgsfield
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-[#6B7280]">
          <span className="inline-flex items-center gap-1">
            <BarChart2 className="w-4 h-4 text-[#6464B4]" />
            Every post gets an estimated reach band.
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-4 h-4 text-[#6464B4]" />
            We suggest a posting window, not a hard schedule.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1 bg-[#F5F5FA] rounded-full p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1 text-[11px] px-3 py-1 rounded-full ${
                viewMode === "grid"
                  ? "bg-white shadow-sm text-[#111827]"
                  : "text-[#6B7280]"
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1 text-[11px] px-3 py-1 rounded-full ${
                viewMode === "list"
                  ? "bg-white shadow-sm text-[#111827]"
                  : "text-[#6B7280]"
              }`}
            >
              <List className="w-3 h-3" />
              List
            </button>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full border-gray-200"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Posts */}
      {myPosts.length === 0 ? (
        <Card className="bg-white border border-gray-100 rounded-2xl p-8 md:p-10 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#F5F5FA] flex items-center justify-center mb-1">
            <Sparkles className="w-5 h-5 text-[#6464B4]" />
          </div>
          <h3 className="text-lg font-semibold text-[#111827]">
            Your Higgsfield lab is empty (for now)
          </h3>
          <p className="text-sm text-[#6B7280] max-w-md">
            Start by describing a post above. We&apos;ll generate a visual and
            caption tuned to your ambassador&apos;s voice and avatar choice.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-[#6B7280]">
            <Badge className="bg-[#F5F5FA] text-[#4B5563] border-0 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Uses your Lyra / Mello character
            </Badge>
            <Badge className="bg-[#F5F5FA] text-[#4B5563] border-0 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Suggests posting window
            </Badge>
          </div>
        </Card>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={(v) =>
            setActiveTab(v as "my-posts" | "insights")
          }
          className="w-full"
        >
          <div className="flex items-center justify-between mb-3">
            <TabsList className="bg-[#F5F5FA] rounded-full p-1">
              <TabsTrigger
                value="my-posts"
                className="rounded-full text-xs md:text-sm data-[state=active]:bg-white"
              >
                Generated posts
              </TabsTrigger>
              <TabsTrigger
                value="insights"
                className="rounded-full text-xs md:text-sm data-[state=active]:bg-white flex items-center gap-1"
              >
                <TrendingUp className="w-3 h-3" />
                Performance insights
              </TabsTrigger>
            </TabsList>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full text-xs flex items-center gap-1"
            >
              Last 30 days
              <ChevronDown className="w-3 h-3" />
            </Button>
          </div>

          <TabsContent value="my-posts" className="mt-0">
            <div
              className={
                viewMode === "grid"
                  ? "grid md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5"
                  : "space-y-3 md:space-y-4"
              }
            >
              {myPosts.map((post) => renderPostCard(post))}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="mt-0">
            <Card className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-[#6464B4]" />
                <h3 className="text-sm font-semibold text-[#111827]">
                  Coming soon: Ingyn performance insights
                </h3>
              </div>
              <p className="text-sm text-[#6B7280] max-w-md">
                Once you&apos;ve posted a few Higgsfield-powered posts, Ingyn
                will show which visuals, hooks, and posting windows drive the
                most reach and engagement.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Dialogs */}
      <TrainAmbassadorDialog
        isOpen={showTrainDialog}
        onClose={() => setShowTrainDialog(false)}
      />
      <AccountCreationDialog
        isOpen={showAccountDialog}
        onComplete={() => {
          setShowAccountDialog(false);
          setShowPaymentDialog(true);
        }}
      />
      <PaymentDialog
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        onComplete={onAccountCreated}
      />
    </div>
  );
}
