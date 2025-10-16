import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Users, TrendingUp, Target, Search } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import ComingSoon from "./ComingSoon";

const collaborations = [
  {
    id: 1,
    brand: "PureVita Supplements",
    category: "Health & Wellness",
    reach: "50K-100K",
    engagement: "8.5%",
    compatibility: 94,
    image: "https://images.unsplash.com/photo-1581122583802-9e2afdc5ab7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwbGlmZXN0eWxlfGVufDF8fHx8MTc2MDA0MTMxOXww&ixlib=rb-4.1.0&q=80&w=1080",
    deal: "$500-1000 per post",
    tags: ["Supplements", "Wellness", "Fitness"],
  },
  {
    id: 2,
    brand: "MindFlow Meditation",
    category: "Mental Health",
    reach: "30K-50K",
    engagement: "9.2%",
    compatibility: 92,
    image: "https://images.unsplash.com/photo-1497888329096-51c27beff665?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWxsbmVzcyUyMG1vcm5pbmd8ZW58MXx8fHwxNzYwMDQxMzE5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    deal: "$300-600 per post",
    tags: ["Meditation", "Mindfulness", "App"],
  },
  {
    id: 3,
    brand: "NutriBalance Meals",
    category: "Nutrition",
    reach: "40K-80K",
    engagement: "8.9%",
    compatibility: 91,
    image: "https://images.unsplash.com/photo-1581122583802-9e2afdc5ab7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwbGlmZXN0eWxlfGVufDF8fHx8MTc2MDA0MTMxOXww&ixlib=rb-4.1.0&q=80&w=1080",
    deal: "$600-1200 per post",
    tags: ["Nutrition", "Meal Prep", "Healthy Eating"],
  },
];

export default function Marketplace() {
  return (
    <ComingSoon
      title="Brand Marketplace"
      description="Connect with brands and discover collaboration opportunities for your AI ambassador. Monetization features launching soon!"
    >
      <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-white">Brand Marketplace</h1>
        <p className="text-[#A1A1A1]">
          Discover collaboration opportunities for your AI ambassador
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6 bg-white border-0 rounded-2xl">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#A1A1A1]" />
            <Input
              placeholder="Search brands..."
              className="pl-10 rounded-xl border-gray-200"
            />
          </div>
          <Select>
            <SelectTrigger className="rounded-xl border-gray-200">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="health">Health & Wellness</SelectItem>
              <SelectItem value="fitness">Fitness Equipment</SelectItem>
              <SelectItem value="nutrition">Nutrition</SelectItem>
              <SelectItem value="tech">Technology</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="rounded-xl border-gray-200">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compatibility">Best Match</SelectItem>
              <SelectItem value="reach">Highest Reach</SelectItem>
              <SelectItem value="engagement">Best Engagement</SelectItem>
              <SelectItem value="deal">Highest Pay</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-[#00D1B2] to-[#00b89d] border-0 rounded-2xl text-white">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-white/90">Active Collaborations</p>
              <Users className="w-5 h-5" />
            </div>
            <p className="text-3xl">3</p>
            <p className="text-sm text-white/70">+2 pending proposals</p>
          </div>
        </Card>
        <Card className="p-6 bg-white border-0 rounded-2xl">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[#A1A1A1]">Total Earnings</p>
              <TrendingUp className="w-5 h-5 text-[#00D1B2]" />
            </div>
            <p className="text-3xl text-[#1E1E1E]">$2,450</p>
            <p className="text-sm text-[#00D1B2]">+18% this month</p>
          </div>
        </Card>
        <Card className="p-6 bg-white border-0 rounded-2xl">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[#A1A1A1]">Avg. Compatibility</p>
              <Target className="w-5 h-5 text-[#00D1B2]" />
            </div>
            <p className="text-3xl text-[#1E1E1E]">89%</p>
            <p className="text-sm text-[#A1A1A1]">Based on your niche</p>
          </div>
        </Card>
      </div>

      {/* Collaboration Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collaborations.map((collab) => (
          <Card
            key={collab.id}
            className="p-0 bg-white border-0 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-video bg-gray-100 relative">
              <ImageWithFallback
                src={collab.image}
                alt={collab.brand}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <Badge className="bg-white text-[#1E1E1E] hover:bg-white">
                  {collab.compatibility}% Match
                </Badge>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg text-[#1E1E1E] mb-1">{collab.brand}</h3>
                <p className="text-sm text-[#A1A1A1]">{collab.category}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-xs text-[#A1A1A1]">Potential Reach</p>
                  <p className="text-sm text-[#1E1E1E]">{collab.reach}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-[#A1A1A1]">Engagement Rate</p>
                  <p className="text-sm text-[#1E1E1E]">{collab.engagement}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-[#1E1E1E]">{collab.deal}</p>
                <div className="flex flex-wrap gap-2">
                  {collab.tags.map((tag) => (
                    <Badge
                      key={tag}
                      className="bg-[#00D1B2]/10 text-[#00D1B2] hover:bg-[#00D1B2]/20 text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl border-gray-200"
                >
                  View Details
                </Button>
                <Button className="flex-1 bg-[#00D1B2] hover:bg-[#00b89d] text-white rounded-xl">
                  Apply
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Future Features Banner */}
      <Card className="p-8 bg-gradient-to-br from-[#1E1E1E] to-[#2d2d2d] border-0 rounded-2xl text-white text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <h3 className="text-xl">More Opportunities Coming Soon</h3>
          <p className="text-white/70">
            We're continuously adding new brand partnerships. Set your preferences
            and we'll notify you when relevant collaborations become available.
          </p>
          <Button className="bg-[#00D1B2] hover:bg-[#00b89d] text-white rounded-xl mt-4">
            Set Preferences
          </Button>
        </div>
      </Card>
    </div>
    </ComingSoon>
  );
}
