import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { useState } from "react";
import {
  Sparkles,
  Heart,
  Users,
  MessageCircle,
  Check,
  BookOpen,
  Target,
  TrendingUp,
} from "lucide-react";

interface TrainAmbassadorDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export default function TrainAmbassadorDialog({ isOpen, onClose }: TrainAmbassadorDialogProps) {
  const [activeTab, setActiveTab] = useState("identity");
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [toneSliders, setToneSliders] = useState<Record<string, number>>({
    friendly: 50,
    casual: 50,
    playful: 50,
    bold: 50
  });

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

  const handleSave = () => {
    // Save logic here
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#1E1E1E]">
            Train Your AI Ambassador
          </DialogTitle>
          <p className="text-sm text-[#A1A1A1] mt-2">
            Update your AI ambassador's training to improve content generation
          </p>
        </DialogHeader>

        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-4 mb-6">
              <TabsTrigger value="identity" className="flex items-center gap-1 text-xs md:text-sm">
                <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Identity</span>
              </TabsTrigger>
              <TabsTrigger value="values" className="flex items-center gap-1 text-xs md:text-sm">
                <Heart className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Values</span>
              </TabsTrigger>
              <TabsTrigger value="audience" className="flex items-center gap-1 text-xs md:text-sm">
                <Users className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Audience</span>
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center gap-1 text-xs md:text-sm">
                <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Voice</span>
              </TabsTrigger>
            </TabsList>

            {/* Identity Tab */}
            <TabsContent value="identity" className="space-y-4">
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#00D1B2]" />
                  Ambassador Name
                </Label>
                <Input
                  placeholder="e.g., Maya Wellness"
                  className="rounded-xl border-gray-200"
                  defaultValue="Maya Wellness"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-[#00D1B2]" />
                  Brand Story
                </Label>
                <Textarea
                  placeholder="What's your brand's mission? What inspired you to start?"
                  className="rounded-xl border-gray-200 min-h-[120px]"
                  defaultValue="A holistic wellness advocate inspiring mindful living through fitness, nutrition, and mental health awareness."
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-[#00D1B2]" />
                  Primary Focus
                </Label>
                <Input
                  placeholder="e.g., Wellness, Technology, Fashion"
                  className="rounded-xl border-gray-200"
                  defaultValue="Wellness & Mindful Living"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-[#00D1B2]" />
                  Content Keywords
                </Label>
                <Input
                  placeholder="fitness, wellness, mindfulness..."
                  className="rounded-xl border-gray-200"
                  defaultValue="fitness, wellness, mindfulness, yoga, nutrition"
                />
              </div>
            </TabsContent>

            {/* Values Tab */}
            <TabsContent value="values" className="space-y-4">
              <div>
                <Label className="mb-3 block">
                  What core values drive your brand?
                </Label>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {brandValues.map(value => (
                    <button
                      key={value}
                      onClick={() => toggleValue(value)}
                      className={`p-2 md:p-3 rounded-xl border-2 transition-all text-left ${
                        selectedValues.includes(value)
                          ? "border-[#00D1B2] bg-[#00D1B2]/10"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 md:w-5 md:h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedValues.includes(value)
                            ? "border-[#00D1B2] bg-[#00D1B2]"
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
                  placeholder="What sets you apart from competitors?"
                  className="rounded-xl border-gray-200 min-h-[100px]"
                />
              </div>
            </TabsContent>

            {/* Audience Tab */}
            <TabsContent value="audience" className="space-y-4">
              <div>
                <Label className="mb-2 block">
                  Who is your target audience?
                </Label>
                <Textarea
                  placeholder="Describe age, interests, lifestyle, goals..."
                  className="rounded-xl border-gray-200 min-h-[100px]"
                />
              </div>

              <div>
                <Label className="mb-2 block">
                  What are their biggest challenges?
                </Label>
                <Textarea
                  placeholder="What problems does your audience face?"
                  className="rounded-xl border-gray-200 min-h-[100px]"
                />
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
                          ? "border-[#00D1B2] bg-[#00D1B2]/10"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 md:w-5 md:h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedThemes.includes(theme)
                            ? "border-[#00D1B2] bg-[#00D1B2]"
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
            <TabsContent value="voice" className="space-y-4">
              <div>
                <Label className="mb-3 block">
                  Define your brand's voice
                </Label>

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
                />
              </div>

              <div>
                <Label className="mb-2 block">
                  Things your brand would NEVER say
                </Label>
                <Textarea
                  placeholder="Are there any topics, phrases, or tones to avoid?"
                  className="rounded-xl border-gray-200 min-h-[80px]"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-[#00D1B2] hover:bg-[#00b89d] text-white rounded-xl"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Save Training
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
