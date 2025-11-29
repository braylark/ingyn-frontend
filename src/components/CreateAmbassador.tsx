import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Slider } from "./ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import {
  Sparkles,
  Check,
  ArrowLeft,
  Heart,
  Target,
  MessageCircle,
  Lightbulb,
  Users,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion, AnimatePresence } from "motion/react";

interface CreateAmbassadorProps {
  onComplete?: () => void;
  onBack?: () => void;
}

const AVATAR_STORAGE_KEY = "ingyn_selected_avatar";

const avatarOptions = [
  {
    id: 1,
    name: "Lyra Solara",
    characterId: "8cc016ad-c9c7-460e-a1d3-f348f8f8ae46",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    alt: "Lyra Solara",
  },
  {
    id: 2,
    name: "Mello Bolt",
    characterId: "c9744a0c-2426-4f20-8be9-2722fb8e3dd4",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    alt: "Mello Bolt",
  },
];

const brandValues = [
  "Authenticity",
  "Innovation",
  "Sustainability",
  "Community",
  "Transparency",
  "Excellence",
  "Inclusivity",
  "Empowerment",
  "Creativity",
  "Integrity",
  "Wellness",
  "Growth",
];

const contentThemes = [
  "Educational",
  "Inspirational",
  "Behind-the-scenes",
  "Product features",
  "User stories",
  "Tips & tricks",
  "Industry insights",
  "Lifestyle",
  "Tutorials",
  "Trending topics",
  "Q&A",
  "Community highlights",
];

const focusAreas = [
  "Content creation",
  "Community building",
  "Sales & conversions",
  "Brand awareness",
  "Thought leadership",
  "Customer support",
];

const toneOptions = [
  { label: "Friendly", opposite: "Professional" },
  { label: "Casual", opposite: "Formal" },
  { label: "Playful", opposite: "Serious" },
  { label: "Bold", opposite: "Conservative" },
];

export default function CreateAmbassador({
  onComplete,
  onBack,
}: CreateAmbassadorProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [activeTab, setActiveTab] = useState("identity");

  const [ambassadorName, setAmbassadorName] = useState("");
  const [brandStory, setBrandStory] = useState("");
  const [primaryFocus, setPrimaryFocus] = useState("");
  const [contentKeywords, setContentKeywords] = useState("");
  const [uniqueTrait, setUniqueTrait] = useState("");
  const [personality, setPersonality] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [audienceChallenges, setAudienceChallenges] = useState("");
  const [desiredFeeling, setDesiredFeeling] = useState("");
  const [brandPhrases, setBrandPhrases] = useState("");
  const [avoidPhrases, setAvoidPhrases] = useState("");
  const [ctaStyle, setCtaStyle] = useState("");

  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [toneSliders, setToneSliders] = useState<Record<string, number>>({
    friendly: 50,
    casual: 50,
    playful: 50,
    bold: 50,
  });

  const [previewSummary, setPreviewSummary] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    let summary = "";

    if (brandStory) {
      summary =
        brandStory.slice(0, 120) + (brandStory.length > 120 ? "..." : "");
    } else if (primaryFocus && contentKeywords) {
      const keywords = contentKeywords.split(",").slice(0, 3).join(", ");
      summary = `Focused on ${primaryFocus.toLowerCase()}, with expertise in ${keywords}.`;
    } else if (primaryFocus) {
      summary = `A ${primaryFocus.toLowerCase()} ambassador dedicated to inspiring and engaging audiences.`;
    } else if (selectedValues.length > 0) {
      summary = `Driven by ${selectedValues
        .slice(0, 2)
        .join(" and ")
        .toLowerCase()}, creating meaningful connections.`;
    } else {
      summary = "";
    }

    setPreviewSummary(summary);
    setShowPreview(ambassadorName.length > 0 || summary.length > 0);
  }, [
    brandStory,
    primaryFocus,
    contentKeywords,
    selectedValues,
    ambassadorName,
  ]);

  const handleContinue = () => {
    const selected = avatarOptions[selectedAvatar] || avatarOptions[0];

    try {
      if (typeof window !== "undefined") {
        const payload = {
          name: selected.name,
          characterId: selected.characterId,
        };
        console.log("Saving avatar to localStorage:", payload);
        window.localStorage.setItem(
          AVATAR_STORAGE_KEY,
          JSON.stringify(payload),
        );
      }
    } catch (err) {
      console.error("Failed to save selected avatar:", err);
    }

    if (onComplete) {
      onComplete();
    }
  };

  const handleSkipSection = () => {
    const tabs = ["identity", "values", "audience", "voice"];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    } else {
      handleContinue();
    }
  };

  const toggleValue = (value: string) => {
    setSelectedValues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const toggleTheme = (theme: string) => {
    setSelectedThemes((prev) =>
      prev.includes(theme)
        ? prev.filter((t) => t !== theme)
        : [...prev, theme],
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      {/* Fixed Header Section */}
      <div className="sticky top-0 z-20 bg-[#F5F6FA]/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Badge className="bg-[#6464B4]/10 text-[#6464B4] border-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Step 1 of 2
                </Badge>
                <span className="text-xs text-[#6B7280] hidden sm:inline">
                  Define your AI ambassador&apos;s identity
                </span>
              </div>
              <h1 className="text-base md:text-lg font-semibold text-[#1E1E1E]">
                Create your brand ambassador
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-gray-200 text-xs"
            >
              Save as draft
            </Button>
            <Button
              size="sm"
              className="rounded-full text-xs bg-[#6464B4] hover:bg-[#5555A3]"
              onClick={handleContinue}
            >
              Continue to content setup
            </Button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-6 lg:py-8">
        <div className="grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-4 md:gap-6 lg:gap-8">
          {/* Form Section */}
          {/* ... (rest of the big JSX stays the same as before; unchanged) ... */}
          {/* To keep this short: all layout / cards / tabs are identical to the last version I gave you. */}
          {/* You only needed: AVATAR_STORAGE_KEY, avatarOptions, handleContinue, and the 2-column avatar grid. */}
        </div>
      </div>
    </div>
  );
}
