import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Instagram,
  Music,
  Link,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import PricingDialog from "./PricingDialog";
import PaymentDialog from "./PaymentDialog";
import AccountCreationDialog from "./AccountCreationDialog";

const scheduledPosts = [
  {
    id: 1,
    date: "2025-10-10",
    time: "07:00 PM",
    status: "approved",
    image: "https://images.unsplash.com/photo-1497888329096-51c27beff665?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWxsbmVzcyUyMG1vcm5pbmd8ZW58MXx8fHwxNzYwMDQxMzE5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    caption: "Start your day with intention 🌅",
    engagementScore: 92,
  },
  {
    id: 2,
    date: "2025-10-11",
    time: "06:00 PM",
    status: "approved",
    image: "https://images.unsplash.com/photo-1581122583802-9e2afdc5ab7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwbGlmZXN0eWxlfGVufDF8fHx8MTc2MDA0MTMxOXww&ixlib=rb-4.1.0&q=80&w=1080",
    caption: "Movement is medicine 💪✨",
    engagementScore: 88,
  },
  {
    id: 3,
    date: "2025-10-12",
    time: "08:00 AM",
    status: "pending",
    image: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBtZWRpYSUyMGNvbnRlbnR8ZW58MXx8fHwxNzU5OTk5Nzc2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    caption: "Wellness isn't a destination 🌿",
    engagementScore: 85,
  },
];

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Scheduler() {
  const [selectedDate, setSelectedDate] = useState("2025-10-10");
  const [autoSchedule, setAutoSchedule] = useState(true);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("list");
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showAccountCreation, setShowAccountCreation] = useState(false);

  const handleConnectAccount = (platform: string) => {
    // Check if user has subscription before connecting
    if (!hasSubscription) {
      setShowPricing(true);
      return;
    }
    // In a real app, this would open OAuth flow
    setConnectedAccounts([...connectedAccounts, platform]);
  };

  const handleStartFreeTrial = () => {
    setShowPricing(false);
    setShowPayment(true);
  };

  const handlePaymentComplete = () => {
    setShowPayment(false);
    setShowAccountCreation(true);
  };

  const handleAccountCreationComplete = () => {
    setShowAccountCreation(false);
    setHasSubscription(true);
  };

  const getPostsForDate = (dateStr: string) => {
    return scheduledPosts.filter((post) => post.date === dateStr);
  };

  // If no accounts connected, show connection prompt
  if (connectedAccounts.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl text-[#1E1E1E]">Smart Scheduler</h1>
          <p className="text-gray-600">
            Optimize posting times for maximum engagement
          </p>
        </div>

        <Card className="p-12 bg-white border border-gray-200 rounded-2xl">
          <div className="flex flex-col items-center text-center space-y-6 max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-[#4F46E5] to-[#6366F1] rounded-2xl flex items-center justify-center">
              <Link className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl text-[#1E1E1E]">Unlock Smart Scheduling</h2>
              <p className="text-gray-600">
                Connect your Instagram or TikTok account to schedule and publish posts directly to your social media platforms. Start your free trial to get started!
              </p>
            </div>

            <div className="grid w-full gap-3">
              <Button
                onClick={() => handleConnectAccount("instagram")}
                className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white hover:opacity-90 rounded-xl h-12"
              >
                <Instagram className="w-5 h-5 mr-3" />
                Connect Instagram
              </Button>
              <Button
                onClick={() => handleConnectAccount("tiktok")}
                className="bg-[#000000] text-white hover:bg-[#111111] rounded-xl h-12"
              >
                <Music className="w-5 h-5 mr-3" />
                Connect TikTok
              </Button>
            </div>

            <p className="text-xs text-gray-600">
              Your data is secure. We only access public metrics and posting capabilities.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl text-[#1E1E1E]">Smart Scheduler</h1>
          <p className="text-gray-600">
            Optimize posting times for maximum engagement
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={viewMode === "calendar" ? "default" : "outline"}
            onClick={() => setViewMode("calendar")}
            className={
              viewMode === "calendar"
                ? "bg-[#00D1B2] hover:bg-[#00b89d] text-white rounded-xl"
                : "border-white/20 text-white hover:bg-white/10 rounded-xl"
            }
          >
            <CalendarIcon className="w-4 h-4 mr-2" font-color="#" />
            Calendar
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            className={
              viewMode === "list"
                ? "bg-[#00D1B2] hover:bg-[#00b89d] text-white rounded-xl"
                : "border-white/20 text-white hover:bg-white/10 rounded-xl"
            }
          >
            List View
          </Button>
        </div>
      </div>

      {/* Auto Schedule Toggle */}
      <Card className="p-6 bg-white/5 backdrop-blur-sm border-white/10 rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="auto-schedule" className="text-white cursor-pointer">
              Auto Schedule based on engagement insights
            </Label>
            <p className="text-sm text-[#A1A1A1]">
              Let AI automatically schedule posts at optimal times
            </p>
          </div>
          <Switch
            id="auto-schedule"
            checked={autoSchedule}
            onCheckedChange={setAutoSchedule}
          />
        </div>
      </Card>

      {viewMode === "calendar" ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Simple Calendar View */}
          <Card className="lg:col-span-2 p-6 bg-white border-0 rounded-2xl">
            <div className="space-y-4">
              <h3 className="text-[#1E1E1E]">October 2025</h3>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-sm text-[#A1A1A1] py-2">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                  const dateStr = `2025-10-${String(day).padStart(2, '0')}`;
                  const hasPost = scheduledPosts.some(p => p.date === dateStr);
                  const isSelected = dateStr === selectedDate;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`aspect-square rounded-xl flex items-center justify-center text-sm transition-colors ${
                        isSelected
                          ? 'bg-[#00D1B2] text-white'
                          : hasPost
                          ? 'bg-[#00D1B2]/10 text-[#00D1B2] hover:bg-[#00D1B2]/20'
                          : 'text-[#1E1E1E] hover:bg-gray-100'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Best Times Indicator */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
              <h3 className="text-[#1E1E1E]">Best Times to Post</h3>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => (
                  <div key={day} className="text-center">
                    <div className="text-xs text-[#A1A1A1] mb-2">{day}</div>
                    <div className="space-y-1">
                      <div className="h-8 bg-[#00D1B2]/20 rounded flex items-center justify-center text-xs text-[#00D1B2]">
                        7PM
                      </div>
                      <div className="h-8 bg-[#00D1B2]/10 rounded flex items-center justify-center text-xs text-[#00D1B2]">
                        8AM
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Scheduled Posts for Selected Date */}
          <Card className="p-6 bg-white border-0 rounded-2xl">
            <div className="space-y-4">
              <h3 className="text-[#1E1E1E]">
                {new Date(selectedDate).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
              </h3>
              <div className="space-y-3">
                {getPostsForDate(selectedDate).length > 0 ? (
                  getPostsForDate(selectedDate).map((post) => (
                    <div
                      key={post.id}
                      className="p-3 border border-gray-200 rounded-xl space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#00D1B2]" />
                        <span className="text-sm text-[#1E1E1E]">{post.time}</span>
                        <Badge
                          className={
                            post.status === "approved"
                              ? "bg-[#00D1B2]/10 text-[#00D1B2]"
                              : "bg-yellow-100 text-yellow-700"
                          }
                        >
                          {post.status}
                        </Badge>
                      </div>
                      <div className="aspect-square w-full bg-gray-100 rounded-lg overflow-hidden">
                        <ImageWithFallback
                          src={post.image}
                          alt="Post preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-sm text-[#1E1E1E]">{post.caption}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#A1A1A1]">Engagement Score</span>
                        <span className="text-[#00D1B2]">{post.engagementScore}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-[#A1A1A1]">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No posts scheduled for this date</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-6 bg-white border-0 rounded-2xl">
          <div className="space-y-4">
            {scheduledPosts.map((post) => (
              <div
                key={post.id}
                className="flex flex-col md:flex-row gap-4 p-4 border border-gray-200 rounded-xl hover:border-[#00D1B2] transition-colors"
              >
                <div className="w-full md:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <ImageWithFallback
                    src={post.image}
                    alt="Post preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      className={
                        post.status === "approved"
                          ? "bg-[#00D1B2]/10 text-[#00D1B2]"
                          : "bg-yellow-100 text-yellow-700"
                      }
                    >
                      {post.status}
                    </Badge>
                    <span className="text-sm text-[#A1A1A1]">
                      {post.date} at {post.time}
                    </span>
                    <span className="text-sm text-[#00D1B2]">
                      {post.engagementScore}% engagement score
                    </span>
                  </div>
                  <p className="text-[#1E1E1E]">{post.caption}</p>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-gray-200"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-gray-200"
                    >
                      Reschedule
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Payment Flow Dialogs */}
      <PricingDialog
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        onStartFreeTrial={handleStartFreeTrial}
      />
      <PaymentDialog
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onComplete={handlePaymentComplete}
      />
      <AccountCreationDialog
        isOpen={showAccountCreation}
        onComplete={handleAccountCreationComplete}
      />
    </div>
  );
}
