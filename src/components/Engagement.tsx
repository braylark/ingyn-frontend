import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Heart,
  MessageCircle,
  Send,
  Sparkles,
  ThumbsUp,
  AlertCircle,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import ComingSoon from "./ComingSoon";

interface Comment {
  id: number;
  user: string;
  avatar: string;
  comment: string;
  sentiment: "positive" | "neutral" | "negative";
  time: string;
  aiSuggestion?: string;
}

const mockComments: Comment[] = [
  {
    id: 1,
    user: "sarah_fit",
    avatar: "SF",
    comment: "This is exactly what I needed to hear today! Thank you for sharing 💚",
    sentiment: "positive",
    time: "2m ago",
    aiSuggestion: "So glad this resonated with you, Sarah! What part of your routine are you most excited to try? 🌟",
  },
  {
    id: 2,
    user: "wellness_warrior",
    avatar: "WW",
    comment: "Love your content! Do you have any tips for morning yoga routines?",
    sentiment: "positive",
    time: "5m ago",
    aiSuggestion: "Thank you! I'll be sharing a beginner-friendly morning yoga flow next week. Stay tuned! 🧘‍♀️",
  },
  {
    id: 3,
    user: "mike_health",
    avatar: "MH",
    comment: "Interesting perspective, but I'm not sure this works for everyone.",
    sentiment: "neutral",
    time: "12m ago",
    aiSuggestion: "You're absolutely right - everyone's journey is unique! What approach has worked best for you?",
  },
  {
    id: 4,
    user: "jenna_lifestyle",
    avatar: "JL",
    comment: "This changed my life! I've been following your advice for 2 weeks now 🙏",
    sentiment: "positive",
    time: "18m ago",
    aiSuggestion: "That's amazing, Jenna! I'd love to hear more about your experience. What changes have you noticed?",
  },
];

export default function Engagement() {
  const [autoEngage, setAutoEngage] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [customReply, setCustomReply] = useState("");

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <Heart className="w-4 h-4 text-red-500" />;
      case "neutral":
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case "negative":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            ❤️ Positive
          </Badge>
        );
      case "neutral":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            😐 Neutral
          </Badge>
        );
      case "negative":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            ⚠️ Negative
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <ComingSoon
      title="Engagement AI"
      description="AI-powered comment management and auto-responses will be available soon. Manage all your conversations in one place with smart suggestions."
    >
      <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl text-white">Engagement AI</h1>
          <p className="text-[#A1A1A1]">
            AI-powered comment management and responses
          </p>
        </div>
        <Card className="p-4 bg-white/5 backdrop-blur-sm border-white/10 rounded-2xl">
          <div className="flex items-center gap-3">
            <Label htmlFor="auto-engage" className="text-white cursor-pointer">
              Auto-Engage Mode
            </Label>
            <Switch
              id="auto-engage"
              checked={autoEngage}
              onCheckedChange={setAutoEngage}
            />
          </div>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-0 rounded-2xl">
          <div className="space-y-1">
            <p className="text-sm text-[#A1A1A1]">Total Comments</p>
            <p className="text-2xl text-[#1E1E1E]">324</p>
          </div>
        </Card>
        <Card className="p-4 bg-white border-0 rounded-2xl">
          <div className="space-y-1">
            <p className="text-sm text-[#A1A1A1]">Positive</p>
            <p className="text-2xl text-[#1E1E1E]">248</p>
            <p className="text-xs text-[#00D1B2]">76.5%</p>
          </div>
        </Card>
        <Card className="p-4 bg-white border-0 rounded-2xl">
          <div className="space-y-1">
            <p className="text-sm text-[#A1A1A1]">Neutral</p>
            <p className="text-2xl text-[#1E1E1E]">58</p>
            <p className="text-xs text-blue-500">17.9%</p>
          </div>
        </Card>
        <Card className="p-4 bg-white border-0 rounded-2xl">
          <div className="space-y-1">
            <p className="text-sm text-[#A1A1A1]">Negative</p>
            <p className="text-2xl text-[#1E1E1E]">18</p>
            <p className="text-xs text-yellow-600">5.6%</p>
          </div>
        </Card>
      </div>

      {/* Comments Feed */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4 bg-white border-0 rounded-2xl">
            <h3 className="text-[#1E1E1E] mb-4">Recent Comments</h3>
            <div className="space-y-4">
              {mockComments.map((comment) => (
                <div
                  key={comment.id}
                  className={`p-4 border rounded-xl cursor-pointer transition-colors ${
                    selectedComment?.id === comment.id
                      ? "border-[#00D1B2] bg-[#00D1B2]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedComment(comment)}
                >
                  <div className="flex gap-3">
                    <Avatar className="w-10 h-10 bg-[#00D1B2] flex-shrink-0">
                      <AvatarFallback className="bg-[#00D1B2] text-white">
                        {comment.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-[#1E1E1E]">
                          @{comment.user}
                        </span>
                        <div className="flex items-center gap-2">
                          {getSentimentBadge(comment.sentiment)}
                          <span className="text-xs text-[#A1A1A1]">
                            {comment.time}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-[#1E1E1E]/70">
                        {comment.comment}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* AI Suggestion Panel */}
        <div className="space-y-4">
          {selectedComment ? (
            <Card className="p-6 bg-white border-0 rounded-2xl">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#00D1B2]" />
                  <h3 className="text-[#1E1E1E]">AI Suggested Reply</h3>
                </div>

                <div className="p-4 bg-[#00D1B2]/10 rounded-xl border border-[#00D1B2]/20">
                  <p className="text-sm text-[#1E1E1E]">
                    {selectedComment.aiSuggestion}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-[#00D1B2] hover:bg-[#00b89d] text-white rounded-xl"
                    onClick={() => {
                      alert("Reply sent!");
                      setSelectedComment(null);
                    }}
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl border-gray-200"
                  >
                    Edit
                  </Button>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <Label>Custom Reply</Label>
                  <Textarea
                    placeholder="Write a custom response..."
                    className="rounded-xl border-gray-200 min-h-[100px]"
                    value={customReply}
                    onChange={(e) => setCustomReply(e.target.value)}
                  />
                  <Button
                    className="w-full rounded-xl border-gray-200"
                    variant="outline"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Custom Reply
                  </Button>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#A1A1A1]">
                      Quick Actions
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 rounded-lg"
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      Like
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 rounded-lg"
                    >
                      Hide
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-12 bg-white border-0 rounded-2xl">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-[#00D1B2]/10 rounded-2xl flex items-center justify-center mx-auto">
                  <MessageCircle className="w-8 h-8 text-[#00D1B2]" />
                </div>
                <p className="text-[#A1A1A1]">
                  Select a comment to see AI suggestions
                </p>
              </div>
            </Card>
          )}

          {/* Engagement Tips */}
          <Card className="p-6 bg-gradient-to-br from-[#00D1B2]/10 to-[#00D1B2]/5 border border-[#00D1B2]/20 rounded-2xl">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#00D1B2]" />
                <h3 className="text-[rgb(255,255,255)]">Engagement Tips</h3>
              </div>
              <ul className="space-y-2 text-sm text-[#1E1E1E]/70 text-[rgba(255,255,255,0.5)]">
                <li className="flex items-start gap-2">
                  <span className="text-[#00D1B2] mt-1">•</span>
                  <span>Respond to comments within 2 hours for best engagement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00D1B2] mt-1">•</span>
                  <span>Ask questions to encourage conversation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00D1B2] mt-1">•</span>
                  <span>Address negative comments with empathy</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
    </ComingSoon>
  );
}
