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
  TrendingUp
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
    id: "lyra",
    name: "Lyra Solara",
    characterId: "8cc016ad-c9c7-460e-a1d3-f348f8f8ae46",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    alt: "Lyra Solara avatar"
  },
  {
    id: "mello",
    name: "Mello Bolt",
    characterId: "c9744a0c-2426-4f20-8be9-2722fb8e3dd4",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    alt: "Mello Bolt avatar"
  }
];

const brandValues = [
  "Authenticity", "Innovation", "Sustainability", "Community", 
  "Transparency", "Excellence", "Inclusivity", "Empowerment",
  "Creativity", "Integrity", "Wellness", "Growth"
];

const contentThemes = [
  "Educational", "Inspirational", "Behind-the-scenes", "Product features",
  "User stories", "Tips & tricks", "Industry insights", "Lifestyle",
  "Tutorials", "Trending topics", "Q&A", "Community highlights"
];

const toneAttributes = [
  { label: "Friendly", opposite: "Professional" },
  { label: "Casual", opposite: "Formal" },
  { label: "Playful", opposite: "Serious" },
  { label: "Bold", opposite: "Conservative" },
];

export default function CreateAmbassador({ onComplete, onBack }: CreateAmbassadorProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [activeTab, setActiveTab] = useState("identity");
  
  // Form state - all blank initially
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
    bold: 50
  });

  // Load previously selected avatar from localStorage, if any
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(AVATAR_STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as { id?: string };
      if (!parsed?.id) return;
      const foundIndex = avatarOptions.findIndex((a) => a.id === parsed.id);
      if (foundIndex >= 0) {
        setSelectedAvatar(foundIndex);
      }
    } catch {
      // ignore parsing errors
    }
  }, []);
const [previewSummary, setPreviewSummary] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    // Generate AI-like summary based on form inputs
    let summary = "";
    
    if (brandStory) {
      summary = brandStory.slice(0, 120) + (brandStory.length > 120 ? "..." : "");
    } else if (primaryFocus && contentKeywords) {
      const keywords = contentKeywords.split(",").slice(0, 3).join(", ");
      summary = `Focused on ${primaryFocus.toLowerCase()}, with expertise in ${keywords}.`;
    } else if (primaryFocus) {
      summary = `A ${primaryFocus.toLowerCase()} ambassador dedicated to inspiring and engaging audiences.`;
    } else if (selectedValues.length > 0) {
      summary = `Driven by ${selectedValues.slice(0, 2).join(" and ").toLowerCase()}, creating meaningful connections.`;
    } else {
      summary = "";
    }
    
    setPreviewSummary(summary);
    setShowPreview(ambassadorName.length > 0 || summary.length > 0);
  }, [brandStory, primaryFocus, contentKeywords, selectedValues, ambassadorName]);

  const handleValueToggle = (value: string) => {
    setSelectedValues(prev => 
      prev.includes(value) 
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const handleThemeToggle = (theme: string) => {
    setSelectedThemes(prev =>
      prev.includes(theme)
        ? prev.filter(t => t !== theme)
        : [...prev, theme]
    );
  };

  const handleToneChange = (label: string, value: number[]) => {
    setToneSliders(prev => ({
      ...prev,
      [label.toLowerCase()]: value[0]
    }));
  };

  const getToneLabel = (value: number) => {
    if (value < 35) return "Subtle";
    if (value < 65) return "Balanced";
    return "Strong";
  };

  const toneDescriptions: Record<string, string> = {
    friendly: "How warm and approachable your ambassador sounds.",
    casual: "How conversational vs. polished and formal the voice is.",
    playful: "How fun and energetic vs. grounded and serious the tone feels.",
    bold: "How direct and opinionated vs. safe and neutral the messaging is."
  };

  const progressSteps = [
    ambassadorName.length > 0,
    primaryFocus.length > 0,
    selectedValues.length > 0,
    targetAudience.length > 0,
    brandPhrases.length > 0,
    Object.values(toneSliders).some(v => v !== 50),
  ];

  const progressPercentage = (progressSteps.filter(Boolean).length / progressSteps.length) * 100;

  const handleContinue = () => {
    if (typeof window !== "undefined") {
      const selected = avatarOptions[selectedAvatar] ?? avatarOptions[0];
      window.localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(selected));
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

        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#6464B4] to-[#F97316] transition-all duration-700"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-[#A1A1A1]">
              The more context you give, the smarter your content will feel.
            </span>
            <span className="text-xs text-[#6464B4] font-medium">
              {Math.round(progressPercentage)}% complete
            </span>
          </div>
        </div>

        {/* Layout */}
        <div className="grid lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1.1fr)] gap-6 md:gap-8 items-start">
          {/* Left: Form */}
          <Card className="p-4 md:p-6 bg-white border-0 rounded-2xl">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
                <TabsList className="grid grid-cols-4 w-full md:w-auto bg-[#F5F5FA] rounded-full p-1">
                  <TabsTrigger value="identity" className="text-xs md:text-sm rounded-full data-[state=active]:bg-white">
                    Identity
                  </TabsTrigger>
                  <TabsTrigger value="values" className="text-xs md:text-sm rounded-full data-[state=active]:bg-white">
                    Values
                  </TabsTrigger>
                  <TabsTrigger value="audience" className="text-xs md:text-sm rounded-full data-[state=active]:bg-white">
                    Audience
                  </TabsTrigger>
                  <TabsTrigger value="voice" className="text-xs md:text-sm rounded-full data-[state=active]:bg-white">
                    Voice
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2 text-xs text-[#A1A1A1]">
                  <Sparkles className="w-4 h-4 text-[#6464B4]" />
                  <span>Ingyn will auto-train using these answers.</span>
                </div>
              </div>

              {/* Identity tab */}
              <TabsContent value="identity" className="space-y-5 md:space-y-6 mt-0">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm text-[#1E1E1E]">
                    <Sparkles className="w-4 h-4 text-[#6464B4]" />
                    Ambassador Name
                  </Label>
                  <Input
                    placeholder="e.g., Lyra, Mello, or your brand name"
                    value={ambassadorName}
                    onChange={(e) => setAmbassadorName(e.target.value)}
                    className="rounded-xl border-gray-200 focus-visible:ring-[#6464B4]"
                  />
                  <p className="text-xs text-[#A1A1A1]">
                    This is the name your audience will see—keep it memorable and aligned with your brand.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm text-[#1E1E1E]">
                    <BookOpen className="w-4 h-4 text-[#F97316]" />
                    Brand Story (optional)
                  </Label>
                  <Textarea
                    placeholder="Share a short story of your brand and what this ambassador represents."
                    value={brandStory}
                    onChange={(e) => setBrandStory(e.target.value)}
                    rows={4}
                    className="rounded-xl border-gray-200 focus-visible:ring-[#6464B4] resize-none"
                  />
                  <p className="text-xs text-[#A1A1A1]">
                    Not required, but a clear story helps your ambassador speak with more emotional context.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm text-[#1E1E1E]">
                      <Target className="w-4 h-4 text-[#6464B4]" />
                      Primary Focus
                    </Label>
                    <Input
                      placeholder="e.g., content marketing, wellness tips, SaaS growth"
                      value={primaryFocus}
                      onChange={(e) => setPrimaryFocus(e.target.value)}
                      className="rounded-xl border-gray-200 focus-visible:ring-[#6464B4]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm text-[#1E1E1E]">
                      <MessageCircle className="w-4 h-4 text-[#6464B4]" />
                      Core Topics / Keywords
                    </Label>
                    <Input
                      placeholder="Separate with commas — e.g., short-form video, funnels, email automation"
                      value={contentKeywords}
                      onChange={(e) => setContentKeywords(e.target.value)}
                      className="rounded-xl border-gray-200 focus-visible:ring-[#6464B4]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm text-[#1E1E1E]">
                    <TrendingUp className="w-4 h-4 text-[#F97316]" />
                    What makes this ambassador unique?
                  </Label>
                  <Input
                    placeholder="e.g., playful but data-driven, calm and grounding, ruthless with fluff, etc."
                    value={uniqueTrait}
                    onChange={(e) => setUniqueTrait(e.target.value)}
                    className="rounded-xl border-gray-200 focus-visible:ring-[#6464B4]"
                  />
                </div>
              </TabsContent>

              {/* Values tab */}
              <TabsContent value="values" className="space-y-5 md:space-y-6 mt-0">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm text-[#1E1E1E]">
                    <Heart className="w-4 h-4 text-[#F97316]" />
                    Core Values
                  </Label>
                  <p className="text-xs text-[#A1A1A1] mb-2">
                    Choose up to 4 values that your ambassador should embody in every piece of content.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {brandValues.map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleValueToggle(value)}
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

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm text-[#1E1E1E]">
                    <Lightbulb className="w-4 h-4 text-[#F97316]" />
                    Brand Personality (optional)
                  </Label>
                  <Textarea
                    placeholder="Describe your brand’s personality in your own words."
                    value={personality}
                    onChange={(e) => setPersonality(e.target.value)}
                    rows={3}
                    className="rounded-xl border-gray-200 focus-visible:ring-[#6464B4] resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm text-[#1E1E1E]">
                    <Sparkles className="w-4 h-4 text-[#6464B4]" />
                    Content Themes
                  </Label>
                  <p className="text-xs text-[#A1A1A1]">
                    Select the content types this ambassador should prioritize.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {contentThemes.map((theme) => (
                      <button
                        key={theme}
                        type="button"
                        onClick={() => handleThemeToggle(theme)}
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

              {/* Audience tab */}
              <TabsContent value="audience" className="space-y-5 md:space-y-6 mt-0">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm text-[#1E1E1E]">
                    <Users className="w-4 h-4 text-[#6464B4]" />
                    Who are you speaking to?
                  </Label>
                  <Textarea
                    placeholder="Describe your ideal audience. e.g., early-stage founders, busy moms building side hustles, wellness creators…"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    rows={3}
                    className="rounded-xl border-gray-200 focus-visible:ring-[#6464B4] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm text-[#1E1E1E]">
                    <MessageCircle className="w-4 h-4 text-[#F97316]" />
                    What are they struggling with?
                  </Label>
                  <Textarea
                    placeholder="List their top challenges, fears, or blockers that your content should address."
                    value={audienceChallenges}
                    onChange={(e) => setAudienceChallenges(e.target.value)}
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
                    placeholder="e.g., clear on next steps, empowered, calm, fired up, ready to take action"
                    value={desiredFeeling}
                    onChange={(e) => setDesiredFeeling(e.target.value)}
                    className="rounded-xl border-gray-200 focus-visible:ring-[#6464B4]"
                  />
                </div>
              </TabsContent>

              {/* Voice tab */}
              <TabsContent value="voice" className="space-y-5 md:space-y-6 mt-0">
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

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm text-[#1E1E1E]">
                    <MessageCircle className="w-4 h-4 text-[#F97316]" />
                    Words or angles to avoid (optional)
                  </Label>
                  <Textarea
                    placeholder="Anything your ambassador should never say, promise, or lean into."
                    value={avoidPhrases}
                    onChange={(e) => setAvoidPhrases(e.target.value)}
                    rows={3}
                    className="rounded-xl border-gray-200 focus-visible:ring-[#6464B4] resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-sm text-[#1E1E1E]">
                      <Sparkles className="w-4 h-4 text-[#6464B4]" />
                      Tone controls
                    </Label>
                    <span className="text-xs text-[#A1A1A1]">
                      Dial in how your ambassador should sound across content.
                    </span>
                  </div>

                  {toneAttributes.map(({ label, opposite }) => {
                    const key = label.toLowerCase();
                    const value = toneSliders[key];
                    return (
                      <div key={label} className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#1E1E1E]">
                            {label} vs. {opposite}
                          </span>
                          <span className="text-[#6464B4] font-medium">
                            {getToneLabel(value)} emphasis
                          </span>
                        </div>
                        <Slider
                          value={[value]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={(v) => handleToneChange(label, v)}
                          className="cursor-pointer"
                        />
                        <p className="text-[11px] text-[#A1A1A1]">
                          {toneDescriptions[key]}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm text-[#1E1E1E]">
                    <Target className="w-4 h-4 text-[#6464B4]" />
                    Call-to-action style (optional)
                  </Label>
                  <Input
                    placeholder="e.g., soft invitations, direct commands, story-led CTAs, etc."
                    value={ctaStyle}
                    onChange={(e) => setCtaStyle(e.target.value)}
                    className="rounded-xl border-gray-200 focus-visible:ring-[#6464B4]"
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Footer buttons */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 mt-6">
              <Button
                variant="outline"
                className="order-2 md:order-1 rounded-xl border-gray-200 text-[#1E1E1E]"
                onClick={handleSkipSection}
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

          {/* Right: Live preview */}
          <div className="space-y-4">
            <Card className="p-4 md:p-6 bg-white border-0 rounded-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[#1E1E1E] text-sm font-medium">Live ambassador preview</h3>
                  <Badge className="bg-[#6464B4]/10 text-[#6464B4] border-0">
                    AI-assisted
                  </Badge>
                </div>

                {/* Avatar Selection */}
                <div>
                  <Label className="text-sm text-[#1E1E1E] mb-3 block">Choose Avatar Style</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {avatarOptions.map((avatar, index) => (
                      <button
                        key={avatar.id}
                        onClick={() => {
                        setSelectedAvatar(index);
                        if (typeof window !== "undefined") {
                          const selected = avatarOptions[index];
                          window.localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(selected));
                        }
                      }}
                        className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-square ${
                          selectedAvatar === index
                            ? "border-[#6464B4] shadow-lg"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <ImageWithFallback
                          src={avatar.url}
                          alt={avatar.alt}
                          className="w-full h-full object-cover"
                        />
                        {selectedAvatar === index && (
                          <div className="absolute inset-0 bg-[#6464B4]/20 flex items-center justify-center">
                            <div className="w-8 h-8 bg-[#6464B4] rounded-full flex items-center justify-center">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ambassador Card */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F5F5FA] flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-[#6464B4]" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-[#A1A1A1]">
                        Brand Ambassador
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
                        {previewSummary || "We’ll generate a smart summary of your ambassador as you fill this out."}
                      </motion.p>
                    )}
                    {!showPreview && (
                      <motion.p
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-sm text-[#A1A1A1]"
                      >
                        As you define your ambassador, we&apos;ll summarize how they show up online here.
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

                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ delay: 0.2 }}
                    className="pt-2"
                  >
                    <p className="text-xs text-[#A1A1A1] mb-2">Core values</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedValues.length > 0 ? (
                        selectedValues.slice(0, 4).map((value, index) => (
                          <motion.span 
                            key={value} 
                            className="px-3 py-1 bg-[#6464B4]/10 text-[#6464B4] rounded-full text-[11px]"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.25 + index * 0.05 }}
                          >
                            {value}
                          </motion.span>
                        ))
                      ) : (
                        <span className="text-xs text-[#A1A1A1]">
                          Selected values will appear here as part of your ambassador&apos;s identity.
                        </span>
                      )}
                    </div>
                  </motion.div>
                </div>

                <div className="mt-2 p-3 rounded-xl bg-[#F5F5FA] border border-dashed border-gray-200 flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-[#6464B4] mt-0.5" />
                  <p className="text-xs text-[#4B4B4B]">
                    These settings help Ingyn and your Higgsfield character align content, visuals, and captions
                    with your brand&apos;s identity automatically—so you spend less time rewriting.
                  </p>
                </div>
              </div>
            </Card>
          </div>
          </div>
        </div>
      </div>


    </div>
  );
}
