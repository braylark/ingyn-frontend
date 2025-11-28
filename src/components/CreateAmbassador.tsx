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
  Users,
  Lightbulb,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface CreateAmbassadorProps {
  onComplete?: () => void;
  onBack?: () => void;
}

const AVATAR_STORAGE_KEY = "ingyn_selected_avatar";

const avatarOptions = [
  {
    id: "lyra",
    name: "Lyra Solara",
    characterId: "8cc016ad-c9c7-460e-a1d3-f348f8f8ae46",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    alt: "Lyra Solara avatar",
  },
  {
    id: "mello",
    name: "Mello Bolt",
    characterId: "c9744a0c-2426-4f20-8be9-2722fb8e3dd4",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    alt: "Mello Bolt avatar",
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
];

const toneKeys = ["warm", "casual", "playful", "bold"] as const;
type ToneKey = (typeof toneKeys)[number];

export default function CreateAmbassador({
  onComplete,
  onBack,
}: CreateAmbassadorProps) {
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"identity" | "values" | "audience" | "voice">(
    "identity"
  );

  // Form state
  const [ambassadorName, setAmbassadorName] = useState("");
  const [brandStory, setBrandStory] = useState("");
  const [primaryFocus, setPrimaryFocus] = useState("");
  const [contentKeywords, setContentKeywords] = useState("");
  const [uniqueTrait, setUniqueTrait] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [desiredFeeling, setDesiredFeeling] = useState("");
  const [brandPhrases, setBrandPhrases] = useState("");
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [tonePreferences, setTonePreferences] = useState<Record<ToneKey, number>>({
    warm: 50,
    casual: 50,
    playful: 50,
    bold: 50,
  });

  const [previewSummary, setPreviewSummary] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Load stored avatar from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(AVATAR_STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as { id?: string };
      if (!parsed?.id) return;
      const idx = avatarOptions.findIndex((a) => a.id === parsed.id);
      if (idx >= 0) setSelectedAvatarIndex(idx);
    } catch {
      // ignore
    }
  }, []);

  // Build preview summary
  useEffect(() => {
    let summary = "";

    if (brandStory.trim()) {
      summary =
        brandStory.trim().length > 140
          ? brandStory.trim().slice(0, 140) + "..."
          : brandStory.trim();
    } else if (primaryFocus.trim() && contentKeywords.trim()) {
      const keywords = contentKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
        .slice(0, 3)
        .join(", ");
      summary = `Focused on ${primaryFocus.toLowerCase()}, with content around ${keywords}.`;
    } else if (primaryFocus.trim()) {
      summary = `A ${primaryFocus.toLowerCase()} ambassador focused on helping your audience take action.`;
    } else if (selectedValues.length > 0) {
      summary = `Driven by ${selectedValues
        .slice(0, 2)
        .join(" and ")
        .toLowerCase()}, showing up consistently for your audience.`;
    } else {
      summary =
        "An AI brand ambassador tuned to your voice, values, and audience—ready to create content on your behalf.";
    }

    setPreviewSummary(summary);
    setShowPreview(!!ambassadorName.trim() || !!summary.trim());
  }, [brandStory, primaryFocus, contentKeywords, selectedValues, ambassadorName]);

  const toggleValue = (val: string) => {
    setSelectedValues((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  const toggleTheme = (theme: string) => {
    setSelectedThemes((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]
    );
  };

  const handleToneChange = (key: ToneKey, value: number[]) => {
    setTonePreferences((prev) => ({ ...prev, [key]: value[0] }));
  };

  const getToneLabel = (value: number) => {
    if (value < 35) return "Subtle";
    if (value < 65) return "Balanced";
    return "Signature";
  };

  const toneDescriptions: Record<ToneKey, string> = {
    warm: "How emotionally warm and empathetic your ambassador feels.",
    casual: "How conversational vs. polished the voice should sound.",
    playful: "How fun and light vs. serious and grounded the tone is.",
    bold: "How bold and opinionated vs. neutral and safe your content is.",
  };

  const progressFlags = [
    !!ambassadorName.trim(),
    !!primaryFocus.trim(),
    selectedValues.length > 0,
    !!targetAudience.trim(),
    !!brandPhrases.trim(),
    toneKeys.some((k) => tonePreferences[k] !== 50),
  ];
  const progress = Math.round(
    (progressFlags.filter(Boolean).length / progressFlags.length) * 100
  );

  const persistSelectedAvatar = (index: number) => {
    const avatar = avatarOptions[index] ?? avatarOptions[0];
    if (typeof window !== "undefined") {
      window.localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(avatar));
    }
  };

  const handleAvatarClick = (index: number) => {
    setSelectedAvatarIndex(index);
    persistSelectedAvatar(index);
  };

  const handleSkip = () => {
    const order: ("identity" | "values" | "audience" | "voice")[] = [
      "identity",
      "values",
      "audience",
      "voice",
    ];
    const idx = order.indexOf(activeTab);
    if (idx < order.length - 1) {
      setActiveTab(order[idx + 1]);
      return;
    }
    handleContinue();
  };

  const handleContinue = () => {
    persistSelectedAvatar(selectedAvatarIndex);
    onComplete?.();
  };

  return (
    <div className="min-h-screen bg-[#F5F5FA]">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full border border-gray-200 hover:bg-white"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-[#6464B4]/10 text-[#6464B4] border-0">
                Step 1 of 3
              </Badge>
              <span className="text-xs text-[#A1A1A1]">
                Define your AI ambassador&apos;s core identity
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-semibold text-[#1E1E1E] mt-1">
              Design your AI Brand Ambassador
            </h1>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#6464B4] to-[#F97316] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-[#A1A1A1]">
              The more detail you give, the smarter your content feels.
            </span>
            <span className="text-xs text-[#6464B4] font-medium">
              {progress}% complete
            </span>
          </div>
        </div>

        {/* Layout */}
        <div className="grid lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1.1fr)] gap-6 md:gap-8 items-start">
          {/* Left: Form */}
          <Card className="p-4 md:p-6 bg-white border-0 rounded-2xl">
            <Tabs
              value={activeTab}
              onValueChange={(v) =>
                setActiveTab(v as "identity" | "values" | "audience" | "voice")
              }
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 md:mb-6">
                <TabsList className="grid grid-cols-4 w-full md:w-auto bg-[#F5F5FA] rounded-full p-1">
                  <TabsTrigger
                    value="identity"
                    className="text-xs md:text-sm rounded-full data-[state=active]:bg-white"
                  >
                    Identity
                  </TabsTrigger>
                  <TabsTrigger
                    value="values"
                    className="text-xs md:text-sm rounded-full data-[state=active]:bg-white"
                  >
                    Values
                  </TabsTrigger>
                  <TabsTrigger
                    value="audience"
                    className="text-xs md:text-sm rounded-full data-[state=active]:bg-white"
                  >
                    Audience
                  </TabsTrigger>
                  <TabsTrigger
                    value="voice"
                    className="text-xs md:text-sm rounded-full data-[state=active]:bg-white"
                  >
                    Voice
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2 text-xs text-[#A1A1A1]">
                  <Sparkles className="w-4 h-4 text-[#6464B4]" />
                  <span>Ingyn auto-trains on these answers.</span>
                </div>
              </div>

              {/* Identity */}
              <TabsContent value="identity" className="space-y-5 mt-0">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm text-[#1E1E1E]">
                    <Sparkles className="w-4 h-4 text-[#6464B4]" />
                    Ambassador name
                  </Label>
                  <Input
                    placeholder="e.g., Lyra, Mello, or your brand name"
                    value={ambassadorName}
                    onChange={(e) => setAmbassadorName(e.target.value)}
                    className="rounded-xl border-gray-200 focus-visible:ring-[#6464B4]"
                  />
                  <p className="text-xs text-[#A1A1A1]">
                    This is the name people will see in captions and content.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm text-[#1E1E1E]">
                    <BookOpen className="w-4 h-4 text-[#F97316]" />
                    Brand story (optional)
                  </Label>
                  <Textarea
                    placeholder="In a few sentences, describe the story behind your brand and this ambassador."
                    value={brandStory}
                    onChange={(e) => setBrandStory(e.target.value)}
                    rows={4}
                    className="rounded-xl border-gray-200 focus-visible:ring-[#6464B4] resize-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm text-[#1E1E1E]">
                      <Target className="w-4 h-4 text-[#6464B4]" />
                      Primary focus
                    </Label>
                    <Input
                      placeholder="e.g., content marketing, wellness, creator growth"
                      value={primaryFocus}
                      onChange={(e) => setPrimaryFocus(e.target.value)}
                      className="rounded-xl border-gray-200 focus-visible:ring-[#6464B4]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm text-[#1E1E1E]">
                      <Sparkles className="w-4 h-4 text-[#6464B4]" />
                      Core topics / keywords
                    </Label>
                    <Input
                      placeholder="Separate with commas — short-form, funnels, email, etc."
                      value={contentKeywords}
                      onChange={(e) => setContentKeywords(e.target.value)}
                      className="rounded-xl border-gray-200 focus-visible:ring-[#6464B4]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm text-[#1E1E1E]">
                    <Lightbulb className="w-4 h-4 text-[#F97316]" />
                    What makes this ambassador unique?
                  </Label>
                  <Input
                    placeholder="e.g., playful but data-driven, calm and grounding, no-fluff strategist…"
                    value={uniqueTrait}
                    onChange={(e) => setUniqueTrait(e.target.value)}
                    className="rounded-xl border-gray-200 focus-visible:ring-[#6464B4]"
                  />
                </div>
              </TabsContent>

              {/* Values */}
              <TabsContent value="values" className="space-y-5 mt-0">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm text-[#1E1E1E]">
                    <Heart className="w-4 h-4 text-[#F97316]" />
                    Core values
                  </Label>
                  <p className="text-xs text-[#A1A1A1] mb-1">
                    Pick up to 4 values that should show up in every piece of content.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {brandValues.map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggleValue(value)}
                        className={`px-3 py-1 rounded-full text-xs border transition-all ${
                          selectedValues.includes(value)
                            ? "bg-[#6464B4] text-white border-[#6464B4] shadow-sm"
                            : "bg-white text-[#1E1E1E] border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm text-[#1E1E1E]">
                    <Sparkles className="w-4 h-4 text-[#6464B4]" />
                    Content themes
                  </Label>
                  <p className="text-xs text-[#A1A1A1]">
                    Select the content types your ambassador should lean into.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {contentThemes.map((theme) => (
                      <button
                        key={theme}
                        type="button"
                        onClick={() => toggleTheme(theme)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs border transition-all ${
                          selectedThemes.includes(theme)
                            ? "bg-[#6464B4] text-white border-[#6464B4] shadow-sm"
                            : "bg-white text-[#1E1E1E] border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span>{theme}</span>
                        {selectedThemes.includes(theme) && (
                          <Check className="w-3 h-3" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Audience */}
              <TabsContent value="audience" className="space-y-5 mt-0">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm text-[#1E1E1E]">
                    <Users className="w-4 h-4 text-[#6464B4]" />
                    Who are you speaking to?
                  </Label>
                  <Textarea
                    placeholder="Describe your ideal audience: founders, creators, local business owners, etc."
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    rows={3}
                    className="rounded-xl border-gray-200 focus-visible:ring-[#6464B4] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm text-[#1E1E1E]">
                    <Heart className="w-4 h-4 text-[#F97316]" />
                    How should they feel after engaging?
                  </Label>
                  <Input
                    placeholder="e.g., seen, empowered, clear on next steps, inspired to act"
                    value={desiredFeeling}
                    onChange={(e) => setDesiredFeeling(e.target.value)}
                    className="rounded-xl border-gray-200 focus-visible:ring-[#6464B4]"
                  />
                </div>
              </TabsContent>

              {/* Voice */}
              <TabsContent value="voice" className="space-y-5 mt-0">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm text-[#1E1E1E]">
                    <Sparkles className="w-4 h-4 text-[#6464B4]" />
                    Signature phrases (optional)
                  </Label>
                  <Textarea
                    placeholder='Any recurring phrases, taglines, or sayings? e.g., "Let&apos;s get tactical", "Stay wealthy, not just busy."'
                    value={brandPhrases}
                    onChange={(e) => setBrandPhrases(e.target.value)}
                    rows={3}
                    className="rounded-xl border-gray-200 focus-visible:ring-[#6464B4] resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-sm text-[#1E1E1E]">
                      <Lightbulb className="w-4 h-4 text-[#F97316]" />
                      Tone controls
                    </Label>
                    <span className="text-xs text-[#A1A1A1]">
                      Dial in how your ambassador should sound day-to-day.
                    </span>
                  </div>

                  {toneKeys.map((key) => {
                    const label =
                      key === "warm"
                        ? "Warm vs. Neutral"
                        : key === "casual"
                        ? "Casual vs. Formal"
                        : key === "playful"
                        ? "Playful vs. Serious"
                        : "Bold vs. Safe";

                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#1E1E1E]">{label}</span>
                          <span className="text-[#6464B4] font-medium">
                            {getToneLabel(tonePreferences[key])}
                          </span>
                        </div>
                        <Slider
                          value={[tonePreferences[key]]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={(v) => handleToneChange(key, v)}
                          className="cursor-pointer"
                        />
                        <p className="text-[11px] text-[#A1A1A1]">
                          {toneDescriptions[key]}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>

            {/* Footer actions */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 mt-6">
              <Button
                variant="outline"
                className="order-2 md:order-1 rounded-xl border-gray-200 text-[#1E1E1E]"
                onClick={handleSkip}
              >
                Skip for now
              </Button>
              <Button
                className="order-1 md:order-2 rounded-xl bg-[#1E1E1E] hover:bg-black text-sm px-6"
                onClick={handleContinue}
              >
                Save & Continue
              </Button>
            </div>
          </Card>

          {/* Right: Live preview + avatar selection */}
          <Card className="p-4 md:p-6 bg-white border-0 rounded-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[#1E1E1E]">
                  Live ambassador preview
                </h3>
                <Badge className="bg-[#6464B4]/10 text-[#6464B4] border-0">
                  AI-assisted
                </Badge>
              </div>

              {/* Avatar picker */}
              <div>
                <Label className="text-sm text-[#1E1E1E] mb-3 block">
                  Choose avatar style
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {avatarOptions.map((avatar, index) => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => handleAvatarClick(index)}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-square ${
                        selectedAvatarIndex === index
                          ? "border-[#6464B4] shadow-lg"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <ImageWithFallback
                        src={avatar.url}
                        alt={avatar.alt}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 right-2">
                        <span className="inline-block px-2 py-1 text-[11px] bg-black/60 text-white rounded-full">
                          {avatar.name}
                        </span>
                      </div>
                      {selectedAvatarIndex === index && (
                        <div className="absolute inset-0 bg-[#6464B4]/20 flex items-center justify-center">
                          <div className="w-8 h-8 bg-[#6464B4] rounded-full flex items-center justify-center shadow-lg">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[#A1A1A1] mt-2">
                  This choice controls which Higgsfield character (Lyra or Mello) is used when
                  generating your visuals and captions.
                </p>
              </div>

              {/* Summary */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F5F5FA] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#6464B4]" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[#A1A1A1]">
                      Brand ambassador
                    </p>
                    <p className="text-sm font-medium text-[#1E1E1E]">
                      {ambassadorName || "Your AI Brand Ambassador"}
                    </p>
                  </div>
                </div>

                <AnimatePresence>
                  {showPreview && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm text-[#4B4B4B]"
                    >
                      {previewSummary}
                    </motion.p>
                  )}
                  {!showPreview && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm text-[#A1A1A1]"
                    >
                      As you fill this out, we&apos;ll summarize how your ambassador shows up
                      online.
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                  <div className="space-y-1">
                    <p className="text-[11px] text-[#A1A1A1] flex items-center gap-1">
                      <Target className="w-3 h-3 text-[#6464B4]" />
                      Focus
                    </p>
                    <p className="text-[#1E1E1E]">
                      {primaryFocus || "We’ll infer this from your topics."}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-[#A1A1A1] flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#6464B4]" />
                      Audience
                    </p>
                    <p className="text-[#1E1E1E]">
                      {targetAudience || "Your ideal followers and customers."}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-[#A1A1A1] flex items-center gap-1">
                      <Heart className="w-3 h-3 text-[#F97316]" />
                      Feeling
                    </p>
                    <p className="text-[#1E1E1E]">
                      {desiredFeeling || "Energized, understood, and ready to act."}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-[#A1A1A1] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#6464B4]" />
                      Signature
                    </p>
                    <p className="text-[#1E1E1E]">
                      {uniqueTrait || "A distinct POV shaped by your brand’s DNA."}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-[#A1A1A1] mb-2">Core values</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedValues.length > 0 ? (
                      selectedValues.slice(0, 4).map((value) => (
                        <span
                          key={value}
                          className="px-3 py-1 bg-[#6464B4]/10 text-[#6464B4] rounded-full text-[11px]"
                        >
                          {value}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[#A1A1A1]">
                        Values you select will appear here.
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 p-3 rounded-xl bg-[#F5F5FA] border border-dashed border-gray-200 flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-[#6464B4] mt-0.5" />
                  <p className="text-xs text-[#4B4B4B]">
                    Your answers here guide how your Higgsfield character speaks, writes, and
                    appears across content—so it feels like an extension of you, not a generic AI.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
