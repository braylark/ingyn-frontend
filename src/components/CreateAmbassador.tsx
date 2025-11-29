import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { ArrowLeft, Sparkles } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

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
    url: "/images/avatars/lyra-solara.jpg",
    alt: "Lyra Solara avatar",
  },
  {
    id: 2,
    name: "Mello Bolt",
    characterId: "c9744a0c-2426-4f20-8be9-2722fb8e3dd4",
    url: "/images/avatars/mello-bolt.jpg",
    alt: "Mello Bolt avatar",
  },
];

export default function CreateAmbassador({
  onComplete,
  onBack,
}: CreateAmbassadorProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(0);

  const [ambassadorName, setAmbassadorName] = useState("");
  const [brandStory, setBrandStory] = useState("");
  const [primaryFocus, setPrimaryFocus] = useState("");
  const [contentKeywords, setContentKeywords] = useState("");

  const [previewSummary, setPreviewSummary] = useState("");

  useEffect(() => {
    let summary = "";

    if (brandStory) {
      summary =
        brandStory.slice(0, 160) + (brandStory.length > 160 ? "…" : "");
    } else if (primaryFocus && contentKeywords) {
      const keywords = contentKeywords.split(",").slice(0, 3).join(", ");
      summary = `Focused on ${primaryFocus.toLowerCase()}, creating content around ${keywords}.`;
    } else if (primaryFocus) {
      summary = `A ${primaryFocus.toLowerCase()} ambassador helping your audience take action.`;
    }

    setPreviewSummary(summary);
  }, [brandStory, primaryFocus, contentKeywords]);

  const handleContinue = () => {
    const selected = avatarOptions[selectedAvatar] || avatarOptions[0];

    try {
      if (typeof window !== "undefined") {
        const payload = {
          name: selected.name,
          characterId: selected.characterId,
        };
        window.localStorage.setItem(
          AVATAR_STORAGE_KEY,
          JSON.stringify(payload),
        );
      }
    } catch (err) {
      console.error("Failed to save selected avatar:", err);
    }

    onComplete?.();
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      {/* Page header */}
      <header className="max-w-6xl mx-auto px-4 pt-6 pb-4 flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-9 w-9 mt-1"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="space-y-2">
          <Badge className="bg-[#6464B4]/10 text-[#6464B4] border-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI Ambassador Setup
          </Badge>
          <h1 className="text-xl md:text-2xl font-semibold text-[#111827]">
            Let&apos;s Train Your AI Ambassador
          </h1>
          <p className="text-sm text-[#6B7280] max-w-2xl">
            Choose your avatar and share a few details so your AI ambassador can
            speak in your brand&apos;s voice.
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 pb-10">
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.15fr)] items-start">
          {/* LEFT: Preview & avatar selection */}
          <Card className="bg-white border-0 rounded-2xl p-4 md:p-6 space-y-5">
            {/* AI Insights */}
            <div className="bg-gradient-to-r from-[#6464B4] to-[#8B5CF6] rounded-2xl p-4 text-white flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">AI Insights</p>
                <p className="text-xs md:text-sm text-white/80">
                  Your avatar choice and profile details guide how your AI shows
                  up in every generated post.
                </p>
              </div>
            </div>

            {/* Avatar picker */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#111827]">
                    Live Preview
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    Choose your avatar style and see a quick summary.
                  </p>
                </div>
                <Badge className="bg-[#F5F5FA] text-[#4B5563] border-0 text-[11px]">
                  AI Generated
                </Badge>
              </div>

              <div className="space-y-3">
                <Label className="text-xs md:text-sm text-[#374151]">
                  Choose Avatar Style
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {avatarOptions.map((avatar, index) => {
                    const isSelected = index === selectedAvatar;
                    return (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => setSelectedAvatar(index)}
                        className={`relative rounded-2xl overflow-hidden border transition-all aspect-[4/5] max-h-64 mx-auto w-full ${
                          isSelected
                            ? "border-[#6464B4] shadow-md"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <ImageWithFallback
                          src={avatar.url}
                          alt={avatar.alt}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                            <div className="inline-flex items-center gap-1.5 bg-white/95 rounded-full px-3 py-1 text-[11px] text-[#111827]">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                              Selected
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="inline-flex px-2 py-1 rounded-full bg-black/55 backdrop-blur text-[11px] text-white">
                            {avatar.name}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Snapshot */}
              <div className="mt-2 rounded-2xl border border-gray-100 bg-[#F9FAFB] p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
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

                {previewSummary ? (
                  <p className="text-sm text-[#4B5563]">{previewSummary}</p>
                ) : (
                  <p className="text-xs text-[#6B7280]">
                    Start filling in details on the right to preview how your AI
                    ambassador will be described in captions.
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* RIGHT: Simple identity form */}
          <Card className="bg-white border-0 rounded-2xl p-4 md:p-6 flex flex-col gap-5">
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#111827]">
                Ambassador Profile
              </p>
              <p className="text-xs text-[#6B7280]">
                These details help Higgsfield generate on-brand visuals and
                captions for you.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs md:text-sm text-[#374151]">
                  Ambassador Name
                </Label>
                <Input
                  placeholder="e.g., Lyra Wellness, Mello Media, or your brand name"
                  className="rounded-xl text-sm"
                  value={ambassadorName}
                  onChange={(e) => setAmbassadorName(e.target.value)}
                />
                <p className="text-[11px] text-[#6B7280]">
                  This is how your ambassador will introduce themselves in posts
                  and replies.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs md:text-sm text-[#374151]">
                  Brand Story
                </Label>
                <Textarea
                  placeholder="What's your brand's mission? What inspired you to start? Who are you here to help?"
                  className="min-h-[110px] rounded-2xl text-sm"
                  value={brandStory}
                  onChange={(e) => setBrandStory(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs md:text-sm text-[#374151]">
                  Primary Focus
                </Label>
                <Input
                  placeholder="e.g., Wellness, Streetwear, Creator tools, Finance"
                  className="rounded-xl text-sm"
                  value={primaryFocus}
                  onChange={(e) => setPrimaryFocus(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs md:text-sm text-[#374151]">
                  Content Keywords
                </Label>
                <Input
                  placeholder="fitness, mental health, product launches, lifestyle..."
                  className="rounded-xl text-sm"
                  value={contentKeywords}
                  onChange={(e) => setContentKeywords(e.target.value)}
                />
                <p className="text-[11px] text-[#6B7280]">
                  Separate with commas — these help shape topics, hooks, and
                  visual ideas.
                </p>
              </div>
            </div>

            {/* Actions — always visible */}
            <div className="pt-3 mt-auto flex flex-col md:flex-row md:items-center gap-3">
              <Button
                variant="outline"
                className="w-full md:w-auto rounded-full text-sm"
                onClick={onBack}
              >
                Skip for now
              </Button>
              <Button
                className="w-full md:flex-1 rounded-full text-sm bg-[#6464B4] hover:bg-[#5555A3]"
                onClick={handleContinue}
              >
                Save & Continue
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
