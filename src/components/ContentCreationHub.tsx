import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Sparkles,
  TrendingUp,
  Target,
  Clock,
  Edit,
  Calendar,
  Send,
  Plus,
  Heart,
  Trash2,
  LayoutGrid,
  List,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import TrainAmbassadorDialog from "./TrainAmbassadorDialog";
import AccountCreationDialog from "./AccountCreationDialog";
import PaymentDialog from "./PaymentDialog";
import { generateImage, generateText } from "../lib/api";

/* ---------- Inline status banner (no external deps) ---------- */
type Banner = { type: "success" | "error" | "info" | "loading"; msg: string } | null;

function BannerBar({ banner, onClose }: { banner: Banner; onClose: () => void }) {
  if (!banner) return null;
  const colors =
    banner.type === "success"
      ? "bg-emerald-600"
      : banner.type === "error"
      ? "bg-rose-600"
      : banner.type === "loading"
      ? "bg-slate-600"
      : "bg-blue-600";
  return (
    <div className={`${colors} text-white text-sm px-3 py-2 rounded-md mb-3 flex items-center justify-between`}>
      <span>{banner.msg}</span>
      <button className="text-white/80 hover:text-white" onClick={onClose}>×</button>
    </div>
  );
}

/* ---------- Helpers to normalize backend responses ---------- */
// Return a single image src string (URL or data URI) from many shapes
function extractImageSrc(resp: any): string | null {
  if (!resp) return null;

  // ✅ NEW: top-level array of URLs
  if (Array.isArray(resp) && resp.length && typeof resp[0] === "string") {
    return resp[0];
  }

  // ✅ NEW: top-level string (some backends return a raw URL string)
  if (typeof resp === "string" && resp.startsWith("http")) {
    return resp;
  }

  // Common flat shapes
  if (typeof resp.image === "string") return resp.image;
  if (typeof resp.image_url === "string") return resp.image_url;

  // Arrays nested inside objects
  if (Array.isArray(resp.images) && resp.images[0]) return resp.images[0];
  if (Array.isArray(resp.image_urls) && resp.image_urls[0]) return resp.image_urls[0];
  if (Array.isArray(resp.urls) && resp.urls[0]) return resp.urls[0];

  // Nested result/data
  if (resp.result?.image) return resp.result.image;
  if (resp.result?.image_url) return resp.result.image_url;
  if (Array.isArray(resp.result?.images) && resp.result.images[0]) return resp.result.images[0];
  if (Array.isArray(resp.result?.urls) && resp.result.urls[0]) return resp.result.urls[0];
  if (resp.data?.image_url) return resp.data.image_url;

  // Base64 blobs (png/jpg/webp)
  const base64 =
    resp.image_base64 ||
    resp.base64 ||
    resp.result?.image_base64 ||
    resp.data?.image_base64;
  if (typeof base64 === "string" && base64.length > 100) {
    const mime = base64.trim().startsWith("/") ? "image/jpeg" : "image/png";
    return `data:${mime};base64,${base64}`;
  }

  return null;
}

function normalizeCaption(resp: any, fallback: string): string {
  return resp?.text || resp?.caption || resp?.result?.text || resp?.result?.caption || `✨ ${fallback}`;
}

/* ---------- Main Component ---------- */
interface ContentCreationHubProps {
  hasAccount: boolean;
  onAccountCreated: () => void;
}

export default function ContentCreationHub({
  hasAccount,
  onAccountCreated,
}: ContentCreationHubProps) {
  const [customPrompt, setCustomPrompt] = useState("");
  const [banner, setBanner] = useState<Banner>(null);
  const [generating, setGenerating] = useState(false);

  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [nextId, setNextId] = useState(100);
  const [activeTab, setActiveTab] = useState("my-posts");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [showTrainDialog, setShowTrainDialog] = useState(false);
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const [pendingAction, setPendingAction] = useState<"schedule" | "post" | null>(null);
  const [pendingPostId, setPendingPostId] = useState<number | null>(null);

  const notify = (b: Banner) => setBanner(b);
  const clearBanner = () => setBanner(null);

  /* ---------- MAIN: prompt-only generation ---------- */
  const handleGenerateCustomPost = async () => {
    if (!customPrompt.trim()) {
      notify({ type: "error", msg: "Please enter a prompt to generate content" });
      return;
    }

    setGenerating(true);
    notify({ type: "loading", msg: "Generating image…" });

    try {
      // 1) Image generation — prompt-only
      const imgRes: any = await generateImage(customPrompt, {
        // Add any defaults your backend accepts; no characterId sent
        aspect_ratio: "1:1",
        count: 1,
      });
      // console.log("generate-image response:", imgRes);

      // const imageSrc = extractImageSrc(imgRes);
      const imageSrc = "https://picsum.photos/600/600"; // temporary image placeholder
      if (!imageSrc) {
        const preview = JSON.stringify(imgRes)?.slice(0, 200);
        throw new Error(`No image found in response. Preview: ${preview}`);
      }

      // 2) Caption generation (optional but nice)
      let caption = "";
      try {
        const txtRes: any = await generateText(
          `Write a short, brand-safe caption (<=120 words) for this prompt: ${customPrompt}`
        );
        // console.log("generate-text response:", txtRes);
        caption = normalizeCaption(txtRes, customPrompt);
      } catch {
        caption = `✨ ${customPrompt}`;
      }

      // 3) Create the new post for UI
      const newPost = {
        id: nextId,
        image: imageSrc,
        caption,
        hashtags: ["#Custom", "#AIGenerated", "#YourBrand", "#ContentCreation"],
        predictedReach: `${(Math.random() * 3 + 1).toFixed(1)}K`,
        bestTime: `${Math.floor(Math.random() * 12 + 1)}:00 ${Math.random() > 0.5 ? "AM" : "PM"}`,
      };

      setMyPosts((prev) => [newPost, ...prev]);
      setNextId((n) => n + 1);
      setCustomPrompt("");
      setActiveTab("my-posts");
      notify({ type: "success", msg: "Custom post generated! Check 'My Posts'." });
    } catch (e: any) {
      console.error(e);
      // If backend still enforces characterId you'll see 422 here; at least it's obvious why.
      notify({ type: "error", msg: e?.message || "Generation failed" });
    } finally {
      setGenerating(false);
      setTimeout(clearBanner, 4000);
    }
  };

  /* ---------- POST ACTION HANDLERS ---------- */
  const handleScheduleClick = (postId: number) => {
    if (!hasAccount) {
      setPendingAction("schedule");
      setPendingPostId(postId);
      setShowAccountDialog(true);
    } else {
      notify({ type: "success", msg: "Post scheduled successfully!" });
    }
  };

  const handlePostNowClick = (postId: number) => {
    if (!hasAccount) {
      setPendingAction("post");
      setPendingPostId(postId);
      setShowAccountDialog(true);
    } else {
      notify({ type: "success", msg: "Post published successfully!" });
    }
  };

  const handleAccountCreationComplete = () => {
    setShowAccountDialog(false);
    setShowPaymentDialog(true);
  };

  const handlePaymentComplete = () => {
    setShowPaymentDialog(false);
    onAccountCreated();
    if (pendingAction === "schedule")
      notify({ type: "success", msg: "Account created! Post scheduled successfully!" });
    else if (pendingAction === "post")
      notify({ type: "success", msg: "Account created! Post published successfully!" });
    setPendingAction(null);
    setPendingPostId(null);
  };

  /* ---------- UI ---------- */
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-3xl text-[#1E1E1E] mb-2">Create Content</h1>
          <p className="text-gray-600">AI-powered content suggestions tailored to your audience</p>
        </div>
      </div>

      <BannerBar banner={banner} onClose={clearBanner} />

      {/* Prompt-only input */}
      <Card className="p-6 bg-white border-0 rounded-2xl">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#6464B4]" />
            <h3 className="text-[#1E1E1E]">Generate Custom Content</h3>
          </div>
          <Textarea
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

      {/* My Posts */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <TabsList className="bg-gray-100 border border-gray-200">
            <TabsTrigger value="my-posts" className="data-[state=active]:bg-[#6464B4] data-[state=active]:text-white text-gray-600">
              My Posts {myPosts.length > 0 && `(${myPosts.length})`}
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`rounded-md ${viewMode === "grid" ? "bg-[#6464B4] text-white hover:bg-[#6464B4]" : "text-gray-600 hover:bg-gray-200"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("list")}
              className={`rounded-md ${viewMode === "list" ? "bg-[#6464B4] text-white hover:bg-[#6464B4]" : "text-gray-600 hover:bg-gray-200"}`}
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
              <p className="text-gray-600 mb-6">Generate custom content using the AI prompt above.</p>
            </Card>
          ) : (
            <div className={viewMode === "grid" ? "grid lg:grid-cols-3 gap-6" : "space-y-4"}>
              {myPosts.map((post) => (
                <Card key={post.id} className="bg-white border-0 rounded-2xl overflow-hidden">
                  <div className="w-full aspect-square relative">
                    <ImageWithFallback src={post.image} alt={`Post ${post.id}`} className="w-full h-full object-cover" />
                    <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                      <div className="flex-1 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-white" />
                        <span className="text-white text-sm">~{post.predictedReach}</span>
                      </div>
                      <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#00D1B2]" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    <p className="text-sm text-[#1E1E1E]">{post.caption}</p>
                    <div className="flex flex-wrap gap-2">
                      {post.hashtags.map((tag: string, idx: number) => (
                        <Badge key={idx} className="bg-gray-100 text-[#A1A1A1] hover:bg-gray-100 text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button onClick={() => handleScheduleClick(post.id)} className="flex-1 bg-[rgb(100,100,180)] hover:bg-[#6464B4] text-white rounded-xl" size="sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule
                      </Button>
                      <Button onClick={() => handlePostNowClick(post.id)} variant="outline" className="flex-1 border-gray-200 rounded-xl" size="sm">
                        <Send className="w-4 h-4 mr-2" />
                        Post Now
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <TrainAmbassadorDialog isOpen={showTrainDialog} onClose={() => setShowTrainDialog(false)} />
      <AccountCreationDialog isOpen={showAccountDialog} onComplete={handleAccountCreationComplete} />
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
