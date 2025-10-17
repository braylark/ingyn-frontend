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
import { toast } from "sonner@2.0.3";

// 👇 NEW: import your API client (JS file is fine)
import { generateImage, generateText } from "../lib/api"; // path: src/lib/api.js

const initialSuggestedPosts = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    caption:
      "Starting the week with intention 🌅 Remember, self-care isn't selfish—it's essential. What's one thing you're doing for yourself today?",
    hashtags: ["#MindfulMonday", "#WellnessJourney", "#SelfCare", "#MorningRoutine"],
    reason: "High engagement on Monday motivational content",
    predictedReach: "2.5K",
    bestTime: "7:00 AM",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    caption:
      "Fueling my body with colors from nature 🥗✨ Nutrition isn't about restriction—it's about nourishment. What's your favorite healthy meal?",
    hashtags: ["#HealthyEating", "#PlantBased", "#NutritionTips", "#WellnessLifestyle"],
    reason: "Nutrition content performs 40% better with your audience",
    predictedReach: "3.1K",
    bestTime: "12:30 PM",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    caption:
      "Find your balance 🧘‍♀️ In the chaos of daily life, taking time to breathe and reset isn't a luxury—it's a necessity. Join me for tomorrow's meditation session!",
    hashtags: ["#YogaLife", "#Meditation", "#MindBodySoul", "#InnerPeace"],
    reason: "Meditation posts drive 2x more saves than average",
    predictedReach: "1.9K",
    bestTime: "6:00 PM",
  },
];

const sampleImages = [
  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
];

interface ContentCreationHubProps {
  hasAccount: boolean;
  onAccountCreated: () => void;
}

export default function ContentCreationHub({
  hasAccount,
  onAccountCreated,
}: ContentCreationHubProps) {
  const [customPrompt, setCustomPrompt] = useState("");
  const [editingPost, setEditingPost] = useState<number | null>(null);
  const [editedCaption, setEditedCaption] = useState("");
  const [showTrainDialog, setShowTrainDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("my-posts");
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [suggestedPosts, setSuggestedPosts] = useState(initialSuggestedPosts);
  const [nextId, setNextId] = useState(100);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // 👇 NEW: generation state
  const [generating, setGenerating] = useState(false);

  // Account creation and payment flow
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<"schedule" | "post" | null>(null);
  const [pendingPostId, setPendingPostId] = useState<number | null>(null);

  const handleEditPost = (postId: number, caption: string) => {
    setEditingPost(postId);
    setEditedCaption(caption);
  };

  const handleSaveEdit = () => {
    setEditingPost(null);
    setEditedCaption("");
  };

  const renderPostCard = (post: any, showAIReason: boolean, isMyPost: boolean) => (
    <Card key={post.id} className="bg-white border-0 rounded-2xl overflow-hidden flex flex-col">
      {/* Post Image */}
      <div className="w-full aspect-square relative flex-shrink-0">
        <ImageWithFallback src={post.image} alt={`Post ${post.id}`} className="w-full h-full object-cover" />
        {/* Social Proof Overlay */}
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

      {/* Post Content */}
      <div className="p-4 space-y-4">
        {/* AI Insight - Only show for suggested posts */}
        {showAIReason && post.reason && (
          <div className="flex items-start gap-2 bg-[#6464B4]/10 rounded-lg p-3 bg-[rgba(100,100,180,0.1)]">
            <Sparkles className="w-4 h-4 text-[#6464B4] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-[rgb(100,100,180)]">{post.reason}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-[#A1A1A1]">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Best: {post.bestTime}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Caption */}
        {editingPost === post.id ? (
          <div className="space-y-2">
            <Textarea
              value={editedCaption}
              onChange={(e) => setEditedCaption(e.target.value)}
              className="rounded-xl border-gray-200 min-h-[100px]"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSaveEdit}
                size="sm"
                className="flex-1 bg-[#00D1B2] hover:bg-[#00b89d] text-white rounded-lg"
              >
                Save
              </Button>
              <Button onClick={() => setEditingPost(null)} size="sm" variant="outline" className="flex-1 rounded-lg">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-[#1E1E1E]">{post.caption}</p>
            <div className="flex gap-2 mt-2">
              <Button
                onClick={() => handleEditPost(post.id, post.caption)}
                variant="ghost"
                size="sm"
                className="text-[#A1A1A1] hover:text-[#00D1B2] hover:bg-[#00D1B2]/10 rounded-lg px-2"
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>
              <Button
                onClick={() => handleDeletePost(post.id, isMyPost)}
                variant="ghost"
                size="sm"
                className="text-[#A1A1A1] hover:text-red-500 hover:bg-red-50 rounded-lg px-2"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        )}

        {/* Hashtags */}
        <div className="flex flex-wrap gap-2">
          {post.hashtags.map((tag: string, idx: number) => (
            <Badge key={idx} className="bg-gray-100 text-[#A1A1A1] hover:bg-gray-100 text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Action Buttons */}
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
  );

  const renderPostList = (post: any, showAIReason: boolean, isMyPost: boolean) => (
    <Card key={post.id} className="bg-white border-0 rounded-2xl overflow-hidden">
      <div className="flex gap-4 p-4">
        {/* Post Image - Smaller in list view */}
        <div className="w-32 h-32 md:w-40 md:h-40 relative flex-shrink-0 rounded-xl overflow-hidden">
          <ImageWithFallback src={post.image} alt={`Post ${post.id}`} className="w-full h-full object-cover" />
        </div>

        {/* Post Content */}
        <div className="flex-1 space-y-3">
          {/* AI Insight - Only show for suggested posts */}
          {showAIReason && post.reason && (
            <div className="flex items-start gap-2 bg-[#00D1B2]/10 rounded-lg p-3">
              <Sparkles className="w-4 h-4 text-[#00D1B2] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-[#00D1B2]">{post.reason}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-[#A1A1A1]">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Best: {post.bestTime}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Caption */}
          {editingPost === post.id ? (
            <div className="space-y-2">
              <Textarea
                value={editedCaption}
                onChange={(e) => setEditedCaption(e.target.value)}
                className="rounded-xl border-gray-200 min-h-[100px]"
              />
              <div className="flex gap-2">
                <Button className="bg-[#00D1B2] hover:bg-[#00b89d] text-white rounded-lg" size="sm" onClick={handleSaveEdit}>
                  Save
                </Button>
                <Button size="sm" variant="outline" className="rounded-lg" onClick={() => setEditingPost(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-[#1E1E1E] line-clamp-2">{post.caption}</p>
              <div className="flex gap-2 mt-2">
                <Button
                  onClick={() => handleEditPost(post.id, post.caption)}
                  variant="ghost"
                  size="sm"
                  className="text-[#A1A1A1] hover:text-[#00D1B2] hover:bg-[#00D1B2]/10 rounded-lg px-2"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button
                  onClick={() => handleDeletePost(post.id, isMyPost)}
                  variant="ghost"
                  size="sm"
                  className="text-[#A1A1A1] hover:text-red-500 hover:bg-red-50 rounded-lg px-2"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          )}

          {/* Hashtags */}
          <div className="flex flex-wrap gap-2">
            {post.hashtags.map((tag: string, idx: number) => (
              <Badge key={idx} className="bg-gray-100 text-[#A1A1A1] hover:bg-gray-100 text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Stats & Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-[#A1A1A1] text-sm">
                <Heart className="w-4 h-4" />
                <span>~{post.predictedReach}</span>
              </div>
              <div className="flex items-center gap-1 text-[#A1A1A1] text-sm">
                <TrendingUp className="w-4 h-4 text-[#00D1B2]" />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => handleScheduleClick(post.id)} className="bg-[rgb(100,100,180)] hover:bg-[#6464B4] text-white rounded-xl" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
              <Button onClick={() => handlePostNowClick(post.id)} variant="outline" className="border-gray-200 rounded-xl" size="sm">
                <Send className="w-4 h-4 mr-2" />
                Post Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  // 👇 UPDATED: call backend, create post from real response
  const handleGenerateCustomPost = async () => {
    if (!customPrompt.trim()) {
      toast.error("Please enter a prompt to generate content");
      return;
    }

    setGenerating(true);
    try {
      toast.loading("Generating image…", { id: "gen" });

      // 1) Image generation
      const imgRes: any = await generateImage(customPrompt);
      // Normalize common response shapes from generator
      const images: string[] =
        imgRes?.images ||
        imgRes?.image_urls ||
        (imgRes?.image ? [imgRes.image] : []) ||
        [];

      if (!images.length) {
        throw new Error("No image returned from generator");
      }

      // 2) Optional: caption generation (fallback text if API not ready)
      let caption = "";
      try {
        const txtRes: any = await generateText(`Write an engaging, brand-safe Instagram caption (<= 150 words) for: ${customPrompt}`);
        caption = txtRes?.text || txtRes?.caption || "";
      } catch {
        caption = `${customPrompt} ✨ (AI-generated image – edit this caption to make it perfect)`;
      }

      // 3) Create a new post object for "My Posts"
      const newPost = {
        id: nextId,
        image: images[0],
        caption,
        hashtags: ["#Custom", "#AIGenerated", "#YourBrand", "#ContentCreation"],
        predictedReach: `${(Math.random() * 3 + 1).toFixed(1)}K`,
        bestTime: `${Math.floor(Math.random() * 12 + 1)}:00 ${Math.random() > 0.5 ? "AM" : "PM"}`,
      };

      setMyPosts((prev) => [newPost, ...prev]);
      setNextId((n) => n + 1);
      setCustomPrompt("");
      setActiveTab("my-posts");

      toast.success("Custom post generated! Check 'My Posts' to review.", { id: "gen" });
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Generation failed", { id: "gen" });
    } finally {
      setGenerating(false);
    }
  };

  const handleDeletePost = (postId: number, isMyPost: boolean) => {
    if (isMyPost) {
      setMyPosts(myPosts.filter((post) => post.id !== postId));
      toast.success("Post removed from My Posts");
    } else {
      setSuggestedPosts(suggestedPosts.filter((post) => post.id !== postId));
      toast.success("Post removed from Suggested Posts");
    }
  };

  const handleGenerateMoreSuggested = () => {
    const newSuggestedPost = {
      id: nextId,
      image: sampleImages[Math.floor(Math.random() * sampleImages.length)],
      caption:
        "New AI-generated suggestion 🌟 Based on your audience's preferences and trending topics in your niche.",
      hashtags: ["#Trending", "#AIContent", "#Engagement", "#Growth"],
      reason: "Generated based on latest engagement trends",
      predictedReach: `${(Math.random() * 3 + 1).toFixed(1)}K`,
      bestTime: `${Math.floor(Math.random() * 12 + 1)}:00 ${Math.random() > 0.5 ? "AM" : "PM"}`,
    };

    setSuggestedPosts([...suggestedPosts, newSuggestedPost]);
    setNextId(nextId + 1);
    toast.success("New suggested post added!");
  };

  const handleScheduleClick = (postId: number) => {
    if (!hasAccount) {
      setPendingAction("schedule");
      setPendingPostId(postId);
      setShowAccountDialog(true);
    } else {
      toast.success("Post scheduled successfully!");
    }
  };

  const handlePostNowClick = (postId: number) => {
    if (!hasAccount) {
      setPendingAction("post");
      setPendingPostId(postId);
      setShowAccountDialog(true);
    } else {
      toast.success("Post published successfully!");
    }
  };

  const handleAccountCreationComplete = () => {
    setShowAccountDialog(false);
    setShowPaymentDialog(true);
  };

  const handlePaymentComplete = () => {
    setShowPaymentDialog(false);
    onAccountCreated();

    if (pendingAction === "schedule") {
      toast.success("Account created! Post scheduled successfully!");
    } else if (pendingAction === "post") {
      toast.success("Account created! Post published successfully!");
    }

    setPendingAction(null);
    setPendingPostId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-3xl text-[#1E1E1E] mb-2">Create Content</h1>
          <p className="text-gray-600">AI-powered content suggestions tailored to your audience</p>
        </div>
      </div>

      {/* Custom Prompt Bar */}
      <Card className="p-6 bg-white border-0 rounded-2xl">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#6464B4]" />
            <h3 className="text-[#1E1E1E]">Generate Custom Content</h3>
          </div>
          <Textarea
            placeholder="Describe the post you want to create... (e.g., 'A motivational post about morning yoga routines')"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="rounded-xl border-gray-200 min-h-[80px] py-[4px] px-[12px] mt-[0px] mr-[0px] mb-[16px] ml-[0px]"
          />
          <Button
            onClick={handleGenerateCustomPost}
            disabled={generating}
            className="bg-[rgb(100,100,180)] hover:bg-[#6464B4] text-white rounded-xl px-6"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {generating ? "Generating…" : "Generate"}
          </Button>
        </div>
      </Card>

      {/* AI Insights Section */}
      <Card className="p-6 bg-gradient-to-br from-[#6464B4] to-[#5454A0] border-0 rounded-2xl">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 space-y-3">
            <h3 className="text-xl text-white">Why These Posts?</h3>
            <p className="text-white/90 text-sm">
              Ingyn's AI has analyzed your audience engagement patterns, trending topics in your niche, and optimal
              posting times. These suggestions are designed to maximize reach and authenticity based on real-time data
              from your connected platforms.
            </p>
            <div className="grid md:grid-cols-3 gap-3 mt-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <TrendingUp className="w-5 h-5 text-white flex-shrink-0" />
                <div>
                  <p className="text-xs text-white/70">Audience Growth</p>
                  <p className="text-sm text-white">+12% this week</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <Target className="w-5 h-5 text-white flex-shrink-0" />
                <div>
                  <p className="text-xs text-white/70">Best Topic</p>
                  <p className="text-sm text-white">Nutrition tips</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <Clock className="w-5 h-5 text-white flex-shrink-0" />
                <div>
                  <p className="text-xs text-white/70">Peak Time</p>
                  <p className="text-sm text-white">7-8 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Posts Section with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <TabsList className="bg-gray-100 border border-gray-200">
            <TabsTrigger value="my-posts" className="data-[state=active]:bg-[#6464B4] data-[state=active]:text-white text-gray-600">
              My Posts {myPosts.length > 0 && `(${myPosts.length})`}
            </TabsTrigger>
            <TabsTrigger value="suggested" className="data-[state=active]:bg-[#6464B4] data-[state=active]:text-white text-gray-600">
              Suggested Posts {suggestedPosts.length > 0 && `(${suggestedPosts.length})`}
            </TabsTrigger>
          </TabsList>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`rounded-md ${
                viewMode === "grid"
                  ? "bg-[#6464B4] text-white hover:bg-[#6464B4] hover:text-white"
                  : "text-gray-600 hover:text-[#1E1E1E] hover:bg-gray-200"
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
                  ? "bg-[#6464B4] text-white hover:bg-[#6464B4] hover:text-white"
                  : "text-gray-600 hover:text-[#1E1E1E] hover:bg-gray-200"
              }`}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* My Posts Tab */}
        <TabsContent value="my-posts" className="mt-4">
          {myPosts.length === 0 ? (
            <Card className="p-12 bg-white border border-gray-200 rounded-2xl text-center">
              <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl text-[#1E1E1E] mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-6">Generate custom content using the AI prompt above or create posts manually</p>
            </Card>
          ) : (
            <div className={viewMode === "grid" ? "grid lg:grid-cols-3 gap-6" : "space-y-4"}>
              {myPosts.map((post) => (viewMode === "grid" ? renderPostCard(post, false, true) : renderPostList(post, false, true)))}
            </div>
          )}
        </TabsContent>

        {/* Suggested Posts Tab */}
        <TabsContent value="suggested" className="mt-4">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[#A1A1A1]">AI-powered suggestions based on your audience trends</p>
            <Button onClick={handleGenerateMoreSuggested} variant="outline" className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Generate More
            </Button>
          </div>

          <div className={viewMode === "grid" ? "grid lg:grid-cols-3 gap-6" : "space-y-4"}>
            {suggestedPosts.map((post) => (viewMode === "grid" ? renderPostCard(post, true, false) : renderPostList(post, true, false)))}
          </div>
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
