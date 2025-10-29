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
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import TrainAmbassadorDialog from "./TrainAmbassadorDialog";
import AccountCreationDialog from "./AccountCreationDialog";
import PaymentDialog from "./PaymentDialog";

/* ──────────────────────────────────────────────── */
const CHARACTER_ID = "8cc016ad-c9c7-460e-a1d3-f348f8f8ae46";
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

/* ──────────────────────────────────────────────── */
/** Try to pull a string caption from various model shapes */
function coerceCaption(data: any): string {
  if (!data) return "";
  if (typeof data === "string") return data;
  if (typeof data.text === "string") return data.text;
  if (typeof data.result === "string") return data.result;
  // Google-style: candidates[0].content.parts[0].text
  try {
    const t = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof t === "string") return t;
  } catch {}
  return "";
}

const extractHashtags = (caption: string) =>
  caption.split(/\s+/).filter((w) => w.startsWith("#")).slice(0, 6);

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
      <div className="mt-4 text-sm font-medium text-gray-800 bg-white/90 border border-gray-200 px-4 py-2 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.08)] text-center">
        Cooking your content magic… hang tight ✨
      </div>
    </div>
  );
}

function FailedBlock({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#2a1a1a] rounded-xl p-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs text-white">
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
    body: JSON.stringify({ prompt, characterId: CHARACTER_ID }),
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
  const [activeTab, setActiveTab] = useState("my-posts");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [showTrainDialog, setShowTrainDialog] = useState(false);
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const promptRef = useRef<HTMLTextAreaElement | null>(null);

  /* Generate */
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
        Array.isArray(imageRes.image_urls) && imageRes.image_urls.length
          ? imageRes.image_urls[0]
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
        prev.map((p) => (p.id === optimisticId ? { ...p, status: "failed" } : p))
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleDeletePost = (postId: number) =>
    setMyPosts((prev) => prev.filter((p) => p.id !== postId));

  /* Cards */
  const GridCard = (post: PostItem) => (
    <Card key={post.id} className="bg-white border-0 rounded-2xl overflow-hidden flex flex-col">
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
            <ImageWithFallback
              src={post.image}
              alt={`Generated ${post.id}`}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-3 left-3 right-3 flex gap-2">
              <div className="flex-1 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 text-white text-sm">
                <Heart className="w-4 h-4 text-white" />
                <span>~{post.predictedReach}</span>
              </div>
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#00D1B2]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Always render caption block when ready */}
      {post.status === "ready" && (
        <div className="p-4 space-y-4">
          <p className="text-sm text-[#1E1E1E] break-words">{post.caption}</p>
          {post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.hashtags.map((tag, i) => (
                <Badge key={i} className="bg-gray-100 text-[#A1A1A1] text-xs hover:bg-gray-100">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex gap-2">
              <Button className="flex-1 bg-[rgb(100,100,180)] text-white rounded-xl hover:bg-[#6464B4]">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
              <Button variant="outline" className="flex-1 border-gray-200 rounded-xl">
                <Send className="w-4 h-4 mr-2" />
                Post Now
              </Button>
            </div>
            <Button
              variant="ghost"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center justify-center gap-2 text-xs font-medium rounded-xl"
              onClick={() => handleDeletePost(post.id)}
            >
              <Trash2 className="w-4 h-4" />
              Delete post
            </Button>
          </div>
        </div>
      )}
    </Card>
  );

  const ListCard = (post: PostItem) => (
    <Card
      key={post.id}
      className="bg-white border-0 rounded-2xl overflow-hidden p-4 flex flex-row gap-4 items-start"
    >
      <div className="w-[200px] h-[200px] rounded-xl overflow-hidden flex-shrink-0 bg-[#f9f9f9]">
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
          <ImageWithFallback
            src={post.image}
            alt={`Generated ${post.id}`}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        )}
      </div>

      {/* RIGHT COLUMN:
          - Only render content when READY to prevent duplicate status lines.
       */}
      {post.status === "ready" ? (
        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div className="space-y-3">
            <p className="text-sm text-[#1E1E1E] break-words">{post.caption}</p>
            {post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map((tag, i) => (
                  <Badge key={i} className="bg-gray-100 text-[#A1A1A1] text-xs hover:bg-gray-100">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 pt-4">
            <div className="flex gap-2">
              <Button className="flex-1 bg-[rgb(100,100,180)] text-white rounded-xl hover:bg-[#6464B4]">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
              <Button variant="outline" className="flex-1 border-gray-200 rounded-xl">
                <Send className="w-4 h-4 mr-2" />
                Post Now
              </Button>
            </div>
            <Button
              variant="ghost"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center justify-start gap-2 text-xs font-medium rounded-xl self-start"
              onClick={() => handleDeletePost(post.id)}
            >
              <Trash2 className="w-4 h-4" />
              Delete post
            </Button>
          </div>
        </div>
      ) : (
        // render nothing while processing; (failed shows only the left failure block)
        <div className="flex-1" />
      )}
    </Card>
  );

  /* RENDER */
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-3xl text-[#1E1E1E] mb-2">Create Content</h1>
          <p className="text-gray-600">AI-powered content suggestions tailored to your audience</p>
        </div>
      </div>

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

      <TrainAmbassadorDialog
        isOpen={showTrainDialog}
        onClose={() => setShowTrainDialog(false)}
      />
      <AccountCreationDialog
        isOpen={showAccountDialog}
        onComplete={() => setShowPaymentDialog(true)}
      />
      <PaymentDialog
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        onComplete={onAccountCreated}
      />
    </div>
  );
}
