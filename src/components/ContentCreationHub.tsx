import { useRef, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Sparkles,
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
  UserPlus,
  Star,
  FileText,
  Wand2,
  Info,
  MoreHorizontal,
} from "lucide-react";
import PaymentDialog from "./PaymentDialog";
import TrainAmbassadorDialog from "./TrainAmbassadorDialog";
import AccountCreationDialog from "./AccountCreationDialog";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const AVATAR_STORAGE_KEY = "ingyn_selected_avatar";
const DEFAULT_CHARACTER_ID = "8cc016ad-c9c7-460e-a1d3-f348f8f8ae46"; // Lyra as default

const API_BASE = "";
const LOADER_GIF =
  "https://i.pinimg.com/originals/54/58/a1/5458a14ae4c8f07055b7441ff0f234cf.gif";

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

// Pull characterId from localStorage selection
function getCurrentCharacterId(): string {
  if (typeof window === "undefined") return DEFAULT_CHARACTER_ID;
  try {
    const stored = window.localStorage.getItem(AVATAR_STORAGE_KEY);
    if (!stored) return DEFAULT_CHARACTER_ID;
    const parsed = JSON.parse(stored) as { characterId?: string };
    return parsed.characterId || DEFAULT_CHARACTER_ID;
  } catch {
    return DEFAULT_CHARACTER_ID;
  }
}

// Helpers
function formatHashtags(text: string) {
  const tags = text
    .split(/\s+/)
    .filter((t) => t.startsWith("#"))
    .map((t) => t.replace(/[^\w#]/g, ""));
  return Array.from(new Set(tags));
}

function splitCaptionAndHashtags(text: string): {
  caption: string;
  hashtags: string[];
} {
  const lines = text.split("\n");
  const captionLines: string[] = [];
  const hashtagLines: string[] = [];

  for (const line of lines) {
    if (line.trim().startsWith("#")) hashtagLines.push(line.trim());
    else captionLines.push(line);
  }

  const hashtags = formatHashtags(hashtagLines.join(" "));
  const caption = captionLines.join("\n").trim();

  return { caption, hashtags };
}

function getPredictedReach() {
  const ranges = ["1.8k–2.4k", "2.3k–3.1k", "3.5k–4.8k", "4.9k–6.2k"];
  return ranges[Math.floor(Math.random() * ranges.length)];
}

function getBestTime() {
  const windows = ["10–11 AM", "12–1 PM", "3–4 PM", "7–9 PM"];
  return windows[Math.floor(Math.random() * windows.length)];
}

// Loader + error states
function LoaderBlock() {
  return (
    <div className="flex flex-1 items-center justify-center bg-[#f9f9f9]">
      <div className="flex flex-col items-center gap-2">
        <img
          src={LOADER_GIF}
          alt="Generating preview..."
          className="w-[350px] h-[262px] object-contain bg-[#f9f9f9]"
        />
        <p className="text-xs text-[#A1A1A1]">
          Ingyn is generating your Higgsfield-powered preview…
        </p>
      </div>
    </div>
  );
}

function FailedBlock({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-1 items-center justify-center bg-[#fef2f2]">
      <div className="text-center space-y-2 px-4">
        <p className="text-xs font-medium text-[#991b1b]">
          Something went wrong generating this post.
        </p>
        <button
          onClick={onRetry}
          className="text-[11px] text-[#991b1b] underline hover:text-[#7f1d1d]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

// Backend calls
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
    body: JSON.stringify({
      prompt: gptPrompt,
      characterId: getCurrentCharacterId(),
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function ContentCreationHub({
  hasAccount,
  onAccountCreated,
}: ContentCreationHubProps) {
  const [customPrompt, setCustomPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<"visual" | "caption">("visual");

  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showTrainDialog, setShowTrainDialog] = useState(false);
  const [showAccountDialog, setShowAccountDialog] = useState(!hasAccount);

  const promptRef = useRef<HTMLTextAreaElement | null>(null);

  const handleGenerate = async () => {
    if (!customPrompt.trim()) return;

    const newPost: PostItem = {
      id: Date.now(),
      image: "",
      caption: customPrompt.trim(),
      status: "processing",
      hashtags: [],
      predictedReach: "",
      bestTime: "",
    };

    setPosts((prev) => [newPost, ...prev]);
    setGenerating(true);

    try {
      const [imgRes, captionRes] = await Promise.all([
        generateImageFromBackend(customPrompt.trim()),
        generateCaptionFromBackend(customPrompt.trim()),
      ]);

      const captionText =
        (captionRes as any)?.data?.text ??
        (captionRes as any)?.text ??
        (captionRes as any)?.result ??
        "";

      const { caption, hashtags } = splitCaptionAndHashtags(
        captionText || newPost.caption
      );

      setPosts((prev) =>
        prev.map((p) =>
          p.id === newPost.id
            ? {
                ...p,
                image: (imgRes as any)?.data?.url ?? (imgRes as any)?.url ?? "",
                caption,
                hashtags,
                status: "ready",
                predictedReach: getPredictedReach(),
                bestTime: getBestTime(),
              }
            : p
        )
      );
    } catch (err) {
      console.error(err);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === newPost.id ? { ...p, status: "failed" } : p
        )
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleClearAll = () => {
    setPosts([]);
  };

  const GridCard = (post: PostItem) => (
    <Card
      key={post.id}
      className="bg-white border-0 rounded-2xl overflow-hidden flex flex-col"
    >
      <div className="w-full aspect-square bg-[#f9f9f9] rounded-xl overflow-hidden flex">
        {post.status === "processing" && <LoaderBlock />}
        {post.status === "failed" && (
          <FailedBlock
            onRetry={() => {
              setCustomPrompt(post.caption || "");
              promptRef.current?.focus();
            }}
          />
        )}
        {post.status === "ready" && (
          <div className="relative w-full h-full">
            {post.image ? (
              <ImageWithFallback
                src={post.image}
                alt="Generated post preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-[#f9f9f9]">
                <p className="text-xs text-[#A1A1A1]">
                  Image preview will appear here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2">
          <Badge className="bg-[#F5F5FA] text-[#6464B4] border-0 text-[11px]">
            Higgsfield Visual + Caption
          </Badge>
          {post.status === "ready" && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[11px] text-[#A1A1A1]">
                <Clock className="w-3 h-3" />
                <span>{post.bestTime || "Best time coming soon"}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#A1A1A1]">
                <BarChart2 className="w-3 h-3" />
                <span>{post.predictedReach || "Reach estimate"}</span>
              </div>
            </div>
          )}
        </div>

        {post.status === "ready" && (
          <>
            <p className="text-sm text-[#1E1E1E] break-words">{post.caption}</p>
            {post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map((tag, i) => (
                  <Badge
                    key={i}
                    className="bg-gray-100 text-[#A1A1A1] text-xs hover:bg-gray-100"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </>
        )}

        {post.status === "processing" && (
          <p className="text-xs text-[#A1A1A1]">
            We&apos;re crafting your caption and image based on your current
            ambassador profile…
          </p>
        )}

        {post.status === "failed" && (
          <p className="text-xs text-[#991b1b]">
            We couldn&apos;t generate this post. Try again or adjust your
            prompt.
          </p>
        )}

        <div className="flex items-center justify-between pt-2 mt-auto">
          <div className="flex items-center gap-2 text-[11px] text-[#A1A1A1]">
            <Heart className="w-3 h-3" />
            <span>Save to Planner</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full border-gray-200"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
            <Button size="sm" className="h-8 rounded-full text-xs px-3">
              <Send className="w-3 h-3 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  const ListRow = (post: PostItem) => (
    <Card className="bg-white border-0 rounded-2xl p-3 md:p-4 flex flex-col md:flex-row gap-3 md:gap-4 items-start">
      <div className="w-full md:w-32 aspect-square bg-[#f9f9f9] rounded-xl overflow-hidden flex-shrink-0 flex">
        {post.status === "processing" && <LoaderBlock />}
        {post.status === "failed" && (
          <FailedBlock
            onRetry={() => {
              setCustomPrompt(post.caption || "");
              promptRef.current?.focus();
            }}
          />
        )}
        {post.status === "ready" && (
          <div className="relative w-full h-full">
            {post.image ? (
              <ImageWithFallback
                src={post.image}
                alt="Generated post preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-[#f9f9f9]">
                <p className="text-xs text-[#A1A1A1]">
                  Image preview will appear here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-[#F5F5FA] text-[#6464B4] border-0 text-[11px]">
              Higgsfield Visual + Caption
            </Badge>
            {post.status === "ready" && (
              <div className="flex items-center gap-2 text-[11px] text-[#A1A1A1]">
                <Clock className="w-3 h-3" />
                <span>{post.bestTime || "Best time coming soon"}</span>
                <BarChart2 className="w-3 h-3" />
                <span>{post.predictedReach || "Reach estimate"}</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full text-[#A1A1A1] hover:text-[#1E1E1E]"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {post.status === "ready" && (
          <>
            <p className="text-sm text-[#1E1E1E] break-words">{post.caption}</p>
            {post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map((tag, i) => (
                  <Badge
                    key={i}
                    className="bg-gray-100 text-[#A1A1A1] text-xs hover:bg-gray-100"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </>
        )}

        {post.status === "processing" && (
          <p className="text-xs text-[#A1A1A1]">
            We&apos;re crafting your caption and image based on your current
            ambassador profile…
          </p>
        )}

        {post.status === "failed" && (
          <p className="text-xs text-[#991b1b]">
            We couldn&apos;t generate this post. Try again or adjust your
            prompt.
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-3 text-[11px] text-[#A1A1A1]">
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              <span>Save</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Schedule</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full border-gray-200"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
            <Button size="sm" className="h-8 rounded-full text-xs px-3">
              <Send className="w-3 h-3 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-[#6464B4]/10 text-[#6464B4] border-0">
              Higgsfield Visual Studio
            </Badge>
            <Badge className="bg-[#F97316]/10 text-[#F97316] border-0 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Beta
            </Badge>
          </div>
          <h2 className="text-xl md:text-2xl font-semibold text-[#1E1E1E]">
            Generate scroll-stopping posts in one shot
          </h2>
          <p className="text-sm text-[#6B7280] max-w-xl">
            Turn simple prompts into ready-to-post visuals and captions, tuned to
            your Ingyn ambassador&apos;s brand voice and Higgsfield-powered
            character.
          </p>
        </div>

        <div className="flex flex-col items-stretch md:items-end gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="rounded-full border-gray-200 text-xs flex items-center gap-2"
              onClick={() => setShowTrainDialog(true)}
            >
              <Wand2 className="w-3 h-3" />
              Train Ambassador
            </Button>
            <Button
              className="rounded-full text-xs flex items-center gap-2"
              onClick={() => setShowPaymentDialog(true)}
            >
              <Star className="w-3 h-3" />
              Upgrade Plan
            </Button>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#A1A1A1]">
            <Info className="w-3 h-3" />
            <span>
              Your avatar selection controls which Higgsfield character generates
              your content.
            </span>
          </div>
        </div>
      </div>

      {/* Prompt + controls */}
      <Card className="bg-white border-0 rounded-2xl p-4 md:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "visual" | "caption")}
            className="w-full md:w-auto"
          >
            <TabsList className="bg-[#F5F5FA] rounded-full p-1">
              <TabsTrigger
                value="visual"
                className="rounded-full text-xs md:text-sm data-[state=active]:bg-white"
              >
                Visual + Caption
              </TabsTrigger>
              <TabsTrigger
                value="caption"
                className="rounded-full text-xs md:text-sm data-[state=active]:bg-white"
              >
                Caption Only
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-3 text-[11px] text-[#6B7280]">
            <div className="flex items-center gap-1">
              <UserPlus className="w-3 h-3" />
              <span>Uses your current ambassador profile</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span>Save best prompts for later</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Textarea
            ref={promptRef}
            className="w-full rounded-2xl border border-gray-200 focus-visible:ring-[#6464B4] min-h-[120px] resize-none"
            placeholder="Describe the post you want to create. Example: 'Share a carousel idea where Lyra breaks down 3 ways creators can repurpose one long-form video into 10 short clips.'"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
          />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#6B7280]">
              <Badge className="bg-[#F5F5FA] text-[#4B5563] border-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Tip: Mention your avatar by name (Lyra or Mello) for even sharper
                results.
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full border-gray-200"
                onClick={handleClearAll}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                className="rounded-full text-xs px-4 flex items-center gap-2"
                disabled={generating || !customPrompt.trim()}
                onClick={handleGenerate}
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

      {/* View toggle + results */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <BarChart2 className="w-4 h-4 text-[#6464B4]" />
          <span>Each post includes predicted reach and best posting window.</span>
        </div>

        <div className="flex items-center gap-1 bg-[#F5F5FA] rounded-full p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1 text-[11px] px-3 py-1 rounded-full ${
              viewMode === "grid"
                ? "bg-white shadow-sm text-[#1E1E1E]"
                : "text-[#6B7280]"
            }`}
          >
            <LayoutGrid className="w-3 h-3" />
            <span>Grid</span>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1 text-[11px] px-3 py-1 rounded-full ${
              viewMode === "list"
                ? "bg-white shadow-sm text-[#1E1E1E]"
                : "text-[#6B7280]"
            }`}
          >
            <List className="w-3 h-3" />
            <span>List</span>
          </button>
        </div>
      </div>

      {posts.length === 0 ? (
        <Card className="bg-white border-0 rounded-2xl p-6 md:p-10 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#F5F5FA] flex items-center justify-center mb-1">
            <Sparkles className="w-5 h-5 text-[#6464B4]" />
          </div>
          <h3 className="text-lg font-semibold text-[#1E1E1E]">
            Your Higgsfield content lab is empty—for now
          </h3>
          <p className="text-sm text-[#6B7280] max-w-md">
            Start by describing a post you want to create. Ingyn will generate a
            visual and caption pair based on your selected avatar&apos;s
            personality, tone, and training data.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[#6B7280]">
            <Badge className="bg-[#F5F5FA] text-[#4B5563] border-0 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Mention Lyra or Mello in your prompt
            </Badge>
            <Badge className="bg-[#F5F5FA] text-[#4B5563] border-0 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              We&apos;ll suggest a posting window
            </Badge>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:gap-5">
          {viewMode === "grid" ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
              {posts.map((post) => GridCard(post))}
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {posts.map((post) => ListRow(post))}
            </div>
          )}
        </div>
      )}

      {/* Dialogs */}
      <PaymentDialog
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        onComplete={() => setShowPaymentDialog(false)}
      />
      <TrainAmbassadorDialog
        isOpen={showTrainDialog}
        onClose={() => setShowTrainDialog(false)}
      />
      <AccountCreationDialog
        isOpen={showAccountDialog}
        onComplete={() => {
          onAccountCreated();
          setShowAccountDialog(false);
        }}
      />
    </div>
  );
}
