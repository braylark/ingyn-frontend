import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Sparkles,
  RefreshCw,
  Check,
  Calendar,
  Heart,
  MessageCircle,
  Share2,
  Lightbulb,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const mockIdeas = [
  {
    id: 1,
    title: "Morning Motivation Series",
    description: "5-day series about starting your day mindfully",
    trend: "High Engagement",
    audience: "Wellness enthusiasts",
  },
  {
    id: 2,
    title: "Nutrition Myth-Busting",
    description: "Educational posts about common nutrition misconceptions",
    trend: "Trending Topic",
    audience: "Health-conscious followers",
  },
];

const mockDrafts = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1497888329096-51c27beff665?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWxsbmVzcyUyMG1vcm5pbmd8ZW58MXx8fHwxNzYwMDQxMzE5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    caption:
      "Start your day with intention 🌅\n\nMorning routines don't have to be complicated. Just 10 minutes of mindful breathing and gentle stretching can transform your entire day.\n\nWhat's your favorite morning ritual? 💚",
    hashtags: "#MorningRoutine #Wellness #Mindfulness #SelfCare #HealthyHabits",
    likes: "2.4K",
    comments: "156",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1581122583802-9e2afdc5ab7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwbGlmZXN0eWxlfGVufDF8fHx8MTc2MDA0MTMxOXww&ixlib=rb-4.1.0&q=80&w=1080",
    caption:
      "Movement is medicine 💪✨\n\nYou don't need a gym membership to stay active. Your body is the best equipment you have.\n\nTry this simple 5-minute flow today and feel the difference!",
    hashtags: "#FitnessMotivation #BodyweightWorkout #HealthyLifestyle #WellnessJourney",
    likes: "3.1K",
    comments: "203",
  },
];

const mockApproved = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBtZWRpYSUyMGNvbnRlbnR8ZW58MXx8fHwxNzU5OTk5Nzc2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    caption: "Wellness isn't a destination, it's a journey 🌿",
    scheduledFor: "Oct 10, 7:00 PM",
  },
];

export default function ContentGenerator() {
  const [promptValue, setPromptValue] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-white">Content Generator</h1>
            <p className="text-[#A1A1A1]">
              AI-powered content creation for your ambassador
            </p>
          </div>
          <Button className="bg-[#00D1B2] hover:bg-[#00b89d] text-white rounded-xl hidden md:flex">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate New Post
          </Button>
        </div>

        {/* AI Prompt Bar */}
        <Card className="p-4 bg-white/5 backdrop-blur-sm border-white/10 rounded-2xl">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-[#00D1B2] rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <Input
              placeholder="Generate a post about morning motivation for wellness audiences..."
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              className="flex-1 bg-white border-0 rounded-xl"
            />
            <Button className="bg-[#00D1B2] hover:bg-[#00b89d] text-white rounded-xl px-6">
              Generate
            </Button>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="drafts" className="w-full">
        <TabsList className="bg-white/5 border-white/10 rounded-xl p-1">
          <TabsTrigger
            value="ideas"
            className="rounded-lg data-[state=active]:bg-[#00D1B2] data-[state=active]:text-white"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Ideas
          </TabsTrigger>
          <TabsTrigger
            value="drafts"
            className="rounded-lg data-[state=active]:bg-[#00D1B2] data-[state=active]:text-white"
          >
            Drafts
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="rounded-lg data-[state=active]:bg-[#00D1B2] data-[state=active]:text-white"
          >
            <Check className="w-4 h-4 mr-2" />
            Approved
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ideas" className="mt-6">
          <div className="grid gap-4">
            {mockIdeas.map((idea) => (
              <Card key={idea.id} className="p-6 bg-white border-0 rounded-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[#1E1E1E]">{idea.title}</h3>
                      <Badge className="bg-[#00D1B2]/10 text-[#00D1B2] hover:bg-[#00D1B2]/20">
                        {idea.trend}
                      </Badge>
                    </div>
                    <p className="text-sm text-[#A1A1A1]">{idea.description}</p>
                    <p className="text-sm text-[#1E1E1E]/70">
                      Target: {idea.audience}
                    </p>
                  </div>
                  <Button className="bg-[#00D1B2] hover:bg-[#00b89d] text-white rounded-xl">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Content
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="drafts" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {mockDrafts.map((draft) => (
              <Card key={draft.id} className="p-0 bg-white border-0 rounded-2xl overflow-hidden">
                <div className="aspect-square bg-gray-100">
                  <ImageWithFallback
                    src={draft.image}
                    alt="Content preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-sm text-[#1E1E1E] whitespace-pre-line">
                    {draft.caption}
                  </p>
                  <p className="text-sm text-[#00D1B2]">{draft.hashtags}</p>
                  <div className="flex items-center gap-4 text-sm text-[#A1A1A1]">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {draft.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {draft.comments}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="w-4 h-4" />
                      Share
                    </span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl border-gray-200"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </Button>
                    <Button className="flex-1 bg-[#00D1B2] hover:bg-[#00b89d] text-white rounded-xl">
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button className="bg-[#1E1E1E] hover:bg-[#2d2d2d] text-white rounded-xl">
                      <Calendar className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <div className="grid md:grid-cols-3 gap-6">
            {mockApproved.map((post) => (
              <Card key={post.id} className="p-0 bg-white border-0 rounded-2xl overflow-hidden">
                <div className="aspect-square bg-gray-100">
                  <ImageWithFallback
                    src={post.image}
                    alt="Approved content"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-sm text-[#1E1E1E]">{post.caption}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-[#00D1B2]" />
                    <span className="text-[#A1A1A1]">{post.scheduledFor}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
