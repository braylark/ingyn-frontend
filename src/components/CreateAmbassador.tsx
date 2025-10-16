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

const avatarOptions = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    alt: "Avatar Option 1"
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    alt: "Avatar Option 2"
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    alt: "Avatar Option 3"
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

  // Compute preview summary
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

  const handleContinue = () => {
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
    setSelectedValues(prev => 
      prev.includes(value) 
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const toggleTheme = (theme: string) => {
    setSelectedThemes(prev => 
      prev.includes(theme) 
        ? prev.filter(t => t !== theme)
        : [...prev, theme]
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      {/* Fixed Header Section */}
      <div className="sticky top-0 z-10 bg-[#F5F6FA] p-4 md:p-6 pb-0">
        <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
          {/* Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-[#1E1E1E] hover:text-[#6464B4] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          )}

          <div className="text-[#1E1E1E] space-y-2">
            <h1 className="text-2xl md:text-3xl">Let's Train Your AI Ambassador</h1>
            <p className="text-sm md:text-base text-gray-600">
              Help us understand your brand's soul so your AI can authentically represent you. The more details you provide, the better your AI ambassador will understand and embody your brand's unique personality and values.
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="p-4 md:p-6 pt-4 md:pt-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
          {/* Left Side - AI Insights & Live Preview */}
          <div className="space-y-4 md:space-y-6">
            {/* AI Insights */}
            <Card className="p-4 md:p-6 bg-gradient-to-br from-[#6464B4] to-[#5454A0] border-0 rounded-2xl">
              <div className="flex gap-3 md:gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-1 md:space-y-2">
                  <h3 className="text-white">AI Insights</h3>
                  <p className="text-sm text-white/90">
                    The more details you provide, the better your AI ambassador will understand 
                    and embody your brand's unique personality and values.
                  </p>
                </div>
              </div>
            </Card>

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
                  <Label className="text-sm text-[#1E1E1E] mb-3 block">Choose Avatar Style</Label>
                  <div className="grid grid-cols-3 gap-3">
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
                  <AnimatePresence mode="wait">
                    {showPreview ? (
                      <motion.div
                        key="filled-preview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          <motion.div 
                            className="w-12 h-12 bg-gradient-to-br from-[#6464B4] to-[#5454A0] rounded-full flex items-center justify-center text-white"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                          >
                            {ambassadorName ? ambassadorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'}
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <motion.h4 
                              className="text-[#1E1E1E] truncate"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 }}
                            >
                              {ambassadorName || "Your Ambassador"}
                            </motion.h4>
                            <motion.p 
                              className="text-sm text-[#A1A1A1] truncate"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.25 }}
                            >
                              {primaryFocus || "AI Ambassador"}
                            </motion.p>
                          </div>
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

                        {selectedValues.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ delay: 0.4 }}
                          >
                            <p className="text-xs text-[#A1A1A1] mb-2">Core Values</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedValues.slice(0, 4).map((value, index) => (
                                <motion.span 
                                  key={value} 
                                  className="px-3 py-1 bg-[#6464B4]/10 text-[#6464B4] rounded-full text-sm"
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.5 + (index * 0.05), type: "spring" }}
                                >
                                  {value}
                                </motion.span>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty-preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-8"
                      >
                        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                          <Sparkles className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-sm text-[#A1A1A1]">
                          Start filling in the form to see your AI ambassador come to life
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </Card>

          </div>

          {/* Right Side - Training Form - Scrollable */}
          <div>
            <Card className="bg-white border-0 rounded-2xl">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="p-4 md:p-6 pb-0">
                  <TabsList className="w-full grid grid-cols-4 mb-4 md:mb-6">
                  <TabsTrigger value="identity" className="flex items-center gap-1 md:gap-2 px-2 md:px-4">
                    <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="text-xs md:text-sm">Identity</span>
                  </TabsTrigger>
                  <TabsTrigger value="values" className="flex items-center gap-1 md:gap-2 px-2 md:px-4">
                    <Heart className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="text-xs md:text-sm">Values</span>
                  </TabsTrigger>
                  <TabsTrigger value="audience" className="flex items-center gap-1 md:gap-2 px-2 md:px-4">
                    <Users className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="text-xs md:text-sm">Audience</span>
                  </TabsTrigger>
                  <TabsTrigger value="voice" className="flex items-center gap-1 md:gap-2 px-2 md:px-4">
                    <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="text-xs md:text-sm">Voice</span>
                  </TabsTrigger>
                  </TabsList>
                </div>

                {/* Form Content */}
                <div className="px-4 md:px-6 pb-4 md:pb-6">
                  {/* Identity Tab */}
                  <TabsContent value="identity" className="space-y-4 mt-0">
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-[#6464B4]" />
                      Ambassador Name
                    </Label>
                    <Input
                      placeholder="e.g., Maya Wellness"
                      className="rounded-xl border-gray-200"
                      value={ambassadorName}
                      onChange={(e) => setAmbassadorName(e.target.value)}
                    />
                    <p className="text-xs text-[#A1A1A1] mt-1">
                      Choose a name that reflects your brand identity
                    </p>
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-[#6464B4]" />
                      Brand Story
                    </Label>
                    <Textarea
                      placeholder="What's your brand's mission? What inspired you to start? What problem are you solving?"
                      className="rounded-xl border-gray-200 min-h-[120px]"
                      value={brandStory}
                      onChange={(e) => setBrandStory(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-[#6464B4]" />
                      Primary Focus
                    </Label>
                    <Input
                      placeholder="e.g., Wellness, Technology, Fashion, Finance"
                      className="rounded-xl border-gray-200"
                      value={primaryFocus}
                      onChange={(e) => setPrimaryFocus(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-[#6464B4]" />
                      Content Keywords
                    </Label>
                    <Input
                      placeholder="fitness, wellness, mindfulness, nutrition..."
                      className="rounded-xl border-gray-200"
                      value={contentKeywords}
                      onChange={(e) => setContentKeywords(e.target.value)}
                    />
                    <p className="text-xs text-[#A1A1A1] mt-1">
                      Separate with commas - these guide content generation
                    </p>
                  </div>
                  </TabsContent>

                  {/* Values Tab */}
                  <TabsContent value="values" className="space-y-4 mt-0">
                  <div>
                    <Label className="mb-3 block">
                      What core values drive your brand?
                    </Label>
                    <p className="text-sm text-[#A1A1A1] mb-3">
                      Select all that apply - this shapes how your AI represents you
                    </p>
                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                      {brandValues.map(value => (
                        <button
                          key={value}
                          onClick={() => toggleValue(value)}
                          className={`p-2 md:p-3 rounded-xl border-2 transition-all text-left ${
                            selectedValues.includes(value)
                              ? "border-[#6464B4] bg-[#6464B4]/10"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 md:w-5 md:h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                              selectedValues.includes(value)
                                ? "border-[#6464B4] bg-[#6464B4]"
                                : "border-gray-300"
                            }`}>
                              {selectedValues.includes(value) && (
                                <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                              )}
                            </div>
                            <span className="text-xs md:text-sm text-[#1E1E1E]">{value}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">
                      What makes your brand unique?
                    </Label>
                    <Textarea
                      placeholder="What sets you apart from competitors? What's your unique perspective or approach?"
                      className="rounded-xl border-gray-200 min-h-[100px]"
                      value={uniqueTrait}
                      onChange={(e) => setUniqueTrait(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">
                      Brand Personality Traits
                    </Label>
                    <Textarea
                      placeholder="If your brand was a person, how would you describe their personality?"
                      className="rounded-xl border-gray-200 min-h-[80px]"
                      value={personality}
                      onChange={(e) => setPersonality(e.target.value)}
                    />
                  </div>
                  </TabsContent>

                  {/* Audience Tab */}
                  <TabsContent value="audience" className="space-y-4 mt-0">
                  <div>
                    <Label className="mb-2 block">
                      Who is your target audience?
                    </Label>
                    <Textarea
                      placeholder="Describe age, interests, lifestyle, goals... Who are you trying to reach?"
                      className="rounded-xl border-gray-200 min-h-[100px]"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">
                      What are their biggest challenges?
                    </Label>
                    <Textarea
                      placeholder="What problems does your audience face? What keeps them up at night?"
                      className="rounded-xl border-gray-200 min-h-[100px]"
                      value={audienceChallenges}
                      onChange={(e) => setAudienceChallenges(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">
                      How do you want them to feel?
                    </Label>
                    <Input
                      placeholder="e.g., Inspired, Empowered, Informed, Entertained"
                      className="rounded-xl border-gray-200"
                      value={desiredFeeling}
                      onChange={(e) => setDesiredFeeling(e.target.value)}
                    />
                    <p className="text-xs text-[#A1A1A1] mt-1">
                      This guides the emotional tone of your content
                    </p>
                  </div>

                  <div>
                    <Label className="mb-3 block">
                      Preferred content themes
                    </Label>
                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                      {contentThemes.map(theme => (
                        <button
                          key={theme}
                          onClick={() => toggleTheme(theme)}
                          className={`p-2 md:p-3 rounded-xl border-2 transition-all text-left ${
                            selectedThemes.includes(theme)
                              ? "border-[#6464B4] bg-[#6464B4]/10"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 md:w-5 md:h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                              selectedThemes.includes(theme)
                                ? "border-[#6464B4] bg-[#6464B4]"
                                : "border-gray-300"
                            }`}>
                              {selectedThemes.includes(theme) && (
                                <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                              )}
                            </div>
                            <span className="text-xs md:text-sm text-[#1E1E1E]">{theme}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  </TabsContent>

                  {/* Voice Tab */}
                  <TabsContent value="voice" className="space-y-4 mt-0">
                  <div>
                    <Label className="mb-3 block">
                      Define your brand's voice
                    </Label>
                    <p className="text-sm text-[#A1A1A1] mb-4">
                      Adjust these sliders to define how your AI ambassador communicates
                    </p>
                    
                    {toneAttributes.map(attr => (
                      <div key={attr.label} className="space-y-2 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#1E1E1E]">{attr.opposite}</span>
                          <span className="text-sm text-[#1E1E1E]">{attr.label}</span>
                        </div>
                        <Slider
                          value={[toneSliders[attr.label.toLowerCase()]]}
                          onValueChange={(value) => 
                            setToneSliders(prev => ({ ...prev, [attr.label.toLowerCase()]: value[0] }))
                          }
                          max={100}
                          step={1}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <Label className="mb-2 block">
                      Example phrases your brand would say
                    </Label>
                    <Textarea
                      placeholder="Share 3-5 phrases that capture your brand's voice"
                      className="rounded-xl border-gray-200 min-h-[100px]"
                      value={brandPhrases}
                      onChange={(e) => setBrandPhrases(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">
                      Things your brand would NEVER say
                    </Label>
                    <Textarea
                      placeholder="Are there any topics, phrases, or tones to avoid?"
                      className="rounded-xl border-gray-200 min-h-[80px]"
                      value={avoidPhrases}
                      onChange={(e) => setAvoidPhrases(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">
                      Call-to-Action style
                    </Label>
                    <Input
                      placeholder="e.g., Direct questions, Soft suggestions, Action-oriented"
                      className="rounded-xl border-gray-200"
                      value={ctaStyle}
                      onChange={(e) => setCtaStyle(e.target.value)}
                    />
                  </div>
                  </TabsContent>
                </div>

                {/* Navigation Buttons - Inside Card */}
                <div className="p-4 md:p-6 pt-4 border-t border-gray-200 bg-white lg:flex-shrink-0">
                  <div className="flex gap-2 md:gap-3">
                    {activeTab !== "identity" && (
                      <Button
                        onClick={() => {
                          const tabs = ["identity", "values", "audience", "voice"];
                          const currentIndex = tabs.indexOf(activeTab);
                          if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1]);
                        }}
                        variant="outline"
                        className="flex-1 rounded-xl border-gray-200 h-12"
                      >
                        Previous
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      onClick={handleSkipSection}
                      className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-[#1E1E1E] rounded-xl h-12"
                    >
                      Skip
                    </Button>
                    
                    {activeTab !== "voice" ? (
                      <Button
                        onClick={() => {
                          const tabs = ["identity", "values", "audience", "voice"];
                          const currentIndex = tabs.indexOf(activeTab);
                          if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1]);
                        }}
                        className="flex-1 bg-[#6464B4] hover:bg-[#5454A0] text-white rounded-xl h-12"
                      >
                        Next Step
                      </Button>
                    ) : (
                      <Button
                        onClick={handleContinue}
                        className="flex-1 bg-[#6464B4] hover:bg-[#5454A0] text-white rounded-xl h-12"
                      >
                      
                        Complete Setup
                      </Button>
                    )}
                  </div>
                </div>
              </Tabs>
            </Card>
          </div>
          </div>
        </div>
      </div>


    </div>
  );
}
