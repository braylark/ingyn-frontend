import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Sparkles,
  Calendar,
  MessageCircle,
  Users,
  ArrowRight,
  Plus,
  Settings,
  Instagram,
  Music,
  Link,
  Edit,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import TrainAmbassadorDialog from "./TrainAmbassadorDialog";

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);
  const [showTrainDialog, setShowTrainDialog] = useState(false);

  const handleConnectAccount = (platform: string) => {
    // In a real app, this would open OAuth flow
    setConnectedAccounts([...connectedAccounts, platform]);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section with Ambassador */}
      <div className="flex items-center justify-between gap-4">
        {/* Circular Profile Photo */}
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 ring-2 ring-[#6464B4]/20">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
            alt="Maya Wellness"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Welcome Message */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl text-[#1E1E1E]">Welcome</h1>
            <Badge className="bg-[#6464B4]/10 text-[#6464B4] hover:bg-[#6464B4]/10 text-xs">
              Active
            </Badge>
          </div>
          <p className="text-gray-600">
            Your AI ambassador is ready. Let's create your first content!
          </p>
        </div>

        {/* Update Button */}
        <Button
          variant="outline"
          onClick={() => setShowTrainDialog(true)}
          className="border-gray-200 bg-white text-[#6464B4] hover:bg-gray-50 rounded-xl px-3 md:px-6 flex-shrink-0"
        >
          <Edit className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">Update Ambassador</span>
        </Button>
      </div>

      {/* Social Media Connection Required */}
      {connectedAccounts.length === 0 && (
        <Card className="p-8 bg-gradient-to-br from-[#4F46E5] to-[#6366F1] border-0 rounded-2xl text-white">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Link className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl">Connect Your Social Media</h2>
                <p className="text-white/80 text-sm">
                  Connect Instagram or TikTok to view stats and schedule posts
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <Button
                onClick={() => handleConnectAccount("instagram")}
                className="bg-white text-[#4F46E5] hover:bg-white/90 rounded-xl h-12 justify-start"
              >
                <Instagram className="w-5 h-5 mr-3" />
                Connect Instagram
              </Button>
              <Button
                onClick={() => handleConnectAccount("tiktok")}
                className="bg-white text-[#4F46E5] hover:bg-white/90 rounded-xl h-12 justify-start"
              >
                <Music className="w-5 h-5 mr-3" />
                Connect TikTok
              </Button>
            </div>

            <p className="text-xs text-white/70">
              Your data is secure. We only access public metrics and posting capabilities.
            </p>
          </div>
        </Card>
      )}

      {/* Quick Stats - Locked if no accounts connected */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`p-6 bg-white border border-gray-200 rounded-2xl ${connectedAccounts.length === 0 ? 'opacity-50' : ''}`}>
          <div className="space-y-2">
            <Users className="w-5 h-5 text-gray-600" />
            <p className="text-2xl text-[#1E1E1E]">
              {connectedAccounts.length === 0 ? '--' : '0'}
            </p>
            <p className="text-sm text-gray-600">Followers</p>
          </div>
        </Card>
        <Card className={`p-6 bg-white border border-gray-200 rounded-2xl ${connectedAccounts.length === 0 ? 'opacity-50' : ''}`}>
          <div className="space-y-2">
            <MessageCircle className="w-5 h-5 text-gray-600" />
            <p className="text-2xl text-[#1E1E1E]">
              {connectedAccounts.length === 0 ? '--' : '0'}
            </p>
            <p className="text-sm text-gray-600">Comments</p>
          </div>
        </Card>
        <Card className={`p-6 bg-white border border-gray-200 rounded-2xl ${connectedAccounts.length === 0 ? 'opacity-50' : ''}`}>
          <div className="space-y-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <p className="text-2xl text-[#1E1E1E]">
              {connectedAccounts.length === 0 ? '--' : '0'}
            </p>
            <p className="text-sm text-gray-600">Scheduled Posts</p>
          </div>
        </Card>
        <Card className={`p-6 bg-white border border-gray-200 rounded-2xl ${connectedAccounts.length === 0 ? 'opacity-50' : ''}`}>
          <div className="space-y-2">
            <Sparkles className="w-5 h-5 text-gray-600" />
            <p className="text-2xl text-[#1E1E1E]">--</p>
            <p className="text-sm text-gray-600">Engagement Rate</p>
          </div>
        </Card>
      </div>

      {/* Empty State for Recent Activity */}
      <Card className="p-12 bg-white border border-gray-200 rounded-2xl">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-gray-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl text-[#1E1E1E]">Ready to Create Content</h3>
            <p className="text-gray-600 max-w-md">
              Maya is all set up! Start generating posts and you'll see all your 
              content activity, engagement metrics, and scheduling here.
            </p>
          </div>
          <Button
            onClick={() => onNavigate("create")}
            className="bg-[#6464B4] hover:bg-[#5454A0] text-white rounded-xl px-6"
          >
            Generate First Post
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>

      <TrainAmbassadorDialog 
        isOpen={showTrainDialog} 
        onClose={() => setShowTrainDialog(false)} 
      />
    </div>
  );
}
