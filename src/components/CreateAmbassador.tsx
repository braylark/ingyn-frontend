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
    bold: 50,
  });

  const [previewSummary, setPreviewSummary] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    // Generate AI-like summary based on form inputs
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
        window.localStorage.setItem(
          AVATAR_STORAGE_KEY,
          JSON.stringify({
            name: selected.name,
            characterId: selected.characterId,
          }),
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
      // If on last tab, complete the setup
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
          <div className="space-y-4 md:space-y-6">
            {/* Overview Card */}
            <Card className="p-4 md:p-5 bg-white border-0 rounded-2xl shadow-xs">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm md:text-base font-semibold text-[#1E1E1E]">
                      Design your AI ambassador
                    </h2>
                    <p className="text-xs md:text-sm text-[#6B7280]">
                      Tell Ingyn how your ambassador should look, sound, and
                      show up for your brand.
                    </p>
                  </div>
                  <Badge className="bg-[#F97316]/10 text-[#F97316] border-0">
                    Beta
                  </Badge>
                </div>
                <div className="grid sm:grid-cols-3 gap-3 text-xs text-[#6B7280]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#6464B4]/10 flex items-center justify-center">
                      <Heart className="w-4 h-4 text-[#6464B4]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#374151]">
                        Brand-aware voice
                      </p>
                      <p>Train how your ambassador talks & responds</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#F97316]/10 flex items-center justify-center">
                      <Target className="w-4 h-4 text-[#F97316]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#374151]">
                        Audience-aligned
                      </p>
                      <p>Anchor responses to your ideal followers</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#10B981]/10 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-[#10B981]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#374151]">
                        Ready for content
                      </p>
                      <p>Reuse this setup across all Ingyn tools</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tabbed Form */}
            <Card className="p-4 md:p-5 bg-white border-0 rounded-2xl">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-4 md:space-y-5"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <TabsList className="bg-[#F5F5FA] rounded-full p-1 h-auto">
                    <TabsTrigger
                      value="identity"
                      className="text-xs md:text-sm rounded-full px-3 md:px-4 py-1.5 md:py-2 data-[state=active]:bg-white"
                    >
                      Identity
                    </TabsTrigger>
                    <TabsTrigger
                      value="values"
                      className="text-xs md:text-sm rounded-full px-3 md:px-4 py-1.5 md:py-2 data-[state=active]:bg-white"
                    >
                      Brand values
                    </TabsTrigger>
                    <TabsTrigger
                      value="audience"
                      className="text-xs md:text-sm rounded-full px-3 md:px-4 py-1.5 md:py-2 data-[state=active]:bg-white"
                    >
                      Audience
                    </TabsTrigger>
                    <TabsTrigger
                      value="voice"
                      className="text-xs md:text-sm rounded-full px-3 md:px-4 py-1.5 md:py-2 data-[state=active]:bg-white"
                    >
                      Voice & tone
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                    <span>Approx. setup time: 4–6 min</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-full text-xs px-3"
                      onClick={handleSkipSection}
                    >
                      Skip this section
                    </Button>
                  </div>
                </div>

                {/* Identity Tab */}
                <TabsContent
                  value="identity"
                  className="space-y-4 md:space-y-5"
                >
                  <div className="grid gap-4 md:gap-5">
                    <div className="grid md:grid-cols-2 gap-4 md:gap-5">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label className="text-xs md:text-sm text-[#374151]">
                            Ambassador name
                          </Label>
                          <Input
                            placeholder="Ex: Lyra, Nova, or your brand name"
                            className="rounded-xl text-sm"
                            value={ambassadorName}
                            onChange={(e) =>
                              setAmbassadorName(e.target.value)
                            }
                          />
                          <p className="text-[11px] text-[#6B7280]">
                            This is how your ambassador will introduce
                            themselves in content and replies.
                          </p>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs md:text-sm text-[#374151]">
                            What&apos;s their primary role?
                          </Label>
                          <Input
                            placeholder="Ex: Creator coach, founder, strategist"
                            className="rounded-xl text-sm"
                            value={primaryFocus}
                            onChange={(e) => setPrimaryFocus(e.target.value)}
                          />
                          <p className="text-[11px] text-[#6B7280]">
                            This helps Ingyn understand how your ambassador
                            should show up in posts.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-xs md:text-sm text-[#374151]">
                          Short brand story
                        </Label>
                        <Textarea
                          placeholder="Describe your brand or creator story in 3–4 sentences. How did you start? What do you stand for?"
                          className="min-h-[120px] rounded-2xl text-sm"
                          value={brandStory}
                          onChange={(e) => setBrandStory(e.target.value)}
                        />
                        <p className="text-[11px] text-[#6B7280]">
                          Ingyn uses this context when crafting intros, hooks,
                          and replies.
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 md:gap-5">
                      <div className="space-y-3">
                        <Label className="text-xs md:text-sm text-[#374151]">
                          What makes them different?
                        </Label>
                        <Input
                          placeholder="Ex: &quot;Brutally honest but kind&quot; or &quot;Breaks complex ideas into simple visuals&quot;"
                          className="rounded-xl text-sm"
                          value={uniqueTrait}
                          onChange={(e) => setUniqueTrait(e.target.value)}
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-xs md:text-sm text-[#374151]">
                          3–5 keywords that describe their personality
                        </Label>
                        <Input
                          placeholder="Ex: Direct, playful, strategic, data-driven"
                          className="rounded-xl text-sm"
                          value={personality}
                          onChange={(e) => setPersonality(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Brand Values Tab */}
                <TabsContent
                  value="values"
                  className="space-y-4 md:space-y-5"
                >
                  <div className="grid md:grid-cols-[1.4fr,1fr] gap-4 md:gap-5 items-start">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-xs md:text-sm text-[#374151]">
                            What values should your ambassador embody?
                          </Label>
                          <p className="text-[11px] text-[#6B7280]">
                            These guide how your ambassador frames advice,
                            opinions, and recommendations.
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 rounded-full text-xs px-3"
                          onClick={() => setSelectedValues([])}
                        >
                          Clear all
                        </Button>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-2.5">
                        {brandValues.map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => toggleValue(value)}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-all ${
                              selectedValues.includes(value)
                                ? "border-[#6464B4] bg-[#6464B4]/5 text-[#111827]"
                                : "border-gray-200 hover:border-gray-300 text-[#4B5563]"
                            }`}
                          >
                            <span>{value}</span>
                            {selectedValues.includes(value) && (
                              <Check className="w-3.5 h-3.5 text-[#6464B4]" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Card className="p-3 md:p-4 bg-[#F9FAFB] border border-gray-100 rounded-2xl">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-[#6464B4]" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-[#111827]">
                            How Ingyn uses your values
                          </p>
                          <p className="text-xs text-[#6B7280]">
                            Values help Ingyn decide whether to push for
                            urgency, focus on education, highlight community,
                            or challenge assumptions in your content.
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs md:text-sm text-[#374151]">
                      Topics your ambassador should prioritize
                    </Label>
                    <Textarea
                      placeholder="Ex: Advanced TikTok hooks, short-form script breakdowns, offer positioning for 1–3 person teams."
                      className="min-h-[80px] rounded-2xl text-sm"
                      value={contentKeywords}
                      onChange={(e) => setContentKeywords(e.target.value)}
                    />
                    <p className="text-[11px] text-[#6B7280]">
                      This helps Ingyn steer posts toward the right lanes when
                      you type shorter prompts.
                    </p>
                  </div>
                </TabsContent>

                {/* Audience Tab */}
                <TabsContent
                  value="audience"
                  className="space-y-4 md:space-y-5"
                >
                  <div className="space-y-4 md:space-y-5">
                    <div className="grid md:grid-cols-2 gap-4 md:gap-5">
                      <div className="space-y-3">
                        <Label className="text-xs md:text-sm text-[#374151]">
                          Who is your ideal follower?
                        </Label>
                        <Textarea
                          placeholder="Ex: Solo creators and small teams trying to turn content into a reliable lead engine."
                          className="min-h-[100px] rounded-2xl text-sm"
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-xs md:text-sm text-[#374151]">
                          What are they stuck on right now?
                        </Label>
                        <Textarea
                          placeholder="Ex: They post consistently but struggle to convert views into pipeline."
                          className="min-h-[100px] rounded-2xl text-sm"
                          value={audienceChallenges}
                          onChange={(e) =>
                            setAudienceChallenges(e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-[1.3fr,1fr] gap-4 md:gap-5 items-start">
                      <div className="space-y-3">
                        <Label className="text-xs md:text-sm text-[#374151]">
                          What should your audience feel after engaging?
                        </Label>
                        <Input
                          placeholder="Ex: Clear, energized, and confident in their next move."
                          className="rounded-xl text-sm"
                          value={desiredFeeling}
                          onChange={(e) => setDesiredFeeling(e.target.value)}
                        />
                        <p className="text-[11px] text-[#6B7280]">
                          Ingyn uses this to adjust tone, pacing, and how
                          direct your ambassador is in posts and replies.
                        </p>
                      </div>

                      <Card className="p-3 md:p-4 bg-[#F9FAFB] border border-gray-100 rounded-2xl">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center">
                            <Users className="w-4 h-4 text-[#10B981]" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-[#111827]">
                              Audience-aware content
                            </p>
                            <p className="text-xs text-[#6B7280]">
                              These details help Ingyn propose angles, hooks,
                              and examples that match where your audience is on
                              their journey.
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                {/* Voice & Tone Tab */}
                <TabsContent
                  value="voice"
                  className="space-y-4 md:space-y-5"
                >
                  <div className="grid md:grid-cols-[1.4fr,1fr] gap-4 md:gap-5 items-start">
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label className="text-xs md:text-sm text-[#374151]">
                          How should your ambassador sound?
                        </Label>
                        <Textarea
                          placeholder="Ex: Direct but kind, doesn&apos;t sugarcoat, uses simple language and concrete examples."
                          className="min-h-[90px] rounded-2xl text-sm"
                          value={ctaStyle}
                          onChange={(e) => setCtaStyle(e.target.value)}
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-xs md:text-sm text-[#374151]">
                          Phrases or language they should use often
                        </Label>
                        <Textarea
                          placeholder='Ex: &quot;Let&apos;s break this down&quot;, &quot;Here&apos;s the play&quot;, &quot;If you&apos;re serious about this...&quot;'
                          className="min-h-[80px] rounded-2xl text-sm"
                          value={brandPhrases}
                          onChange={(e) => setBrandPhrases(e.target.value)}
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-xs md:text-sm text-[#374151]">
                          Words, phrases, or tones to avoid
                        </Label>
                        <Textarea
                          placeholder="Ex: Avoid cringe buzzwords, fake urgency, or overly corporate language."
                          className="min-h-[80px] rounded-2xl text-sm"
                          value={avoidPhrases}
                          onChange={(e) => setAvoidPhrases(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Card className="p-3 md:p-4 bg-[#F9FAFB] border border-gray-100 rounded-2xl">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center">
                            <Lightbulb className="w-4 h-4 text-[#FBBF24]" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-[#111827]">
                              Tone sliders
                            </p>
                            <p className="text-xs text-[#6B7280]">
                              Use sliders to help Ingyn fine-tune how your
                              ambassador should sound across content and
                              replies.
                            </p>
                          </div>
                        </div>
                      </Card>

                      <div className="space-y-3">
                        {toneOptions.map((tone) => (
                          <div key={tone.label} className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] text-[#4B5563]">
                              <span>{tone.label}</span>
                              <span>{tone.opposite}</span>
                            </div>
                            <Slider
                              value={[
                                toneSliders[
                                  tone.label.toLowerCase() as keyof typeof toneSliders
                                ] || 50,
                              ]}
                              onValueChange={([value]) =>
                                setToneSliders((prev) => ({
                                  ...prev,
                                  [tone.label.toLowerCase()]: value,
                                }))
                              }
                              className="w-full"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Live Preview - Sticky */}
          <Card className="p-4 md:p-6 bg-white border-0 rounded-2xl lg:sticky lg:top-24">
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[#1E1E1E]">Live Preview</h3>
                <Badge className="bg-[#6464B4]/10 text-[#6464B4] hover:bg-[#6464B4]/10">
                  AI Generated
                </Badge>
              </div>

              {/* Avatar Selection */}
              <div>
                <Label className="text-sm text-[#1E1E1E] mb-3 block">
                  Choose Avatar Style
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {avatarOptions.map((avatar, index) => (
                    <button
                      key={avatar.id}
                      onClick={() => setSelectedAvatar(index)}
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
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="inline-flex items-center gap-1.5 bg-white/95 rounded-full px-2.5 py-1 text-[11px] text-[#111827]">
                            <Check className="w-3 h-3 text-[#10B981]" />
                            Selected
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ambassador Preview */}
              <AnimatePresence mode="wait">
                {showPreview ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3 md:space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#6464B4]/10 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-[#6464B4]" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-[#9CA3AF]">
                          Ambassador Snapshot
                        </p>
                        <p className="text-sm font-medium text-[#111827]">
                          {ambassadorName || "Your ambassador name"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {primaryFocus && (
                          <Badge className="bg-[#F3F4FF] text-[#4B4C99] border-0">
                            {primaryFocus}
                          </Badge>
                        )}
                        {selectedValues.slice(0, 2).map((value) => (
                          <Badge
                            key={value}
                            className="bg-[#ECFDF5] text-[#047857] border-0"
                          >
                            {value}
                          </Badge>
                        ))}
                        {selectedThemes.slice(0, 2).map((theme) => (
                          <Badge
                            key={theme}
                            className="bg-[#EFF6FF] text-[#1D4ED8] border-0"
                          >
                            {theme}
                          </Badge>
                        ))}
                      </div>

                      {previewSummary && (
                        <motion.p
                          className="text-sm text-[#1E1E1E]/70"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          {previewSummary}
                        </motion.p>
                      )}

                      {!previewSummary && (
                        <p className="text-xs text-[#6B7280]">
                          As you fill in details, we&apos;ll summarize how your
                          ambassador shows up for your brand.
                        </p>
                      )}
                    </div>

                    <Card className="p-3 bg-[#F9FAFB] border border-gray-100 rounded-2xl">
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center">
                          <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-[#111827]">
                            How this setup is used
                          </p>
                          <p className="text-xs text-[#6B7280]">
                            Ingyn will use this profile as the base for content
                            generation, post rewrites, and future ambassador
                            analytics. You can refine it anytime.
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3 md:space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#F3F4FF] flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-[#6464B4]" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-[#9CA3AF]">
                          Ambassador Preview
                        </p>
                        <p className="text-sm font-medium text-[#111827]">
                          Your ambassador will appear here
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-[#6B7280]">
                      As you fill in details about your ambassador&apos;s role,
                      voice, and audience, Ingyn will generate a live preview of
                      how they&apos;ll show up across your content.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
