import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  TrendingDown,
  Lightbulb,
} from "lucide-react";
import ComingSoon from "./ComingSoon";

const followerData = [
  { date: "Oct 1", followers: 12400 },
  { date: "Oct 2", followers: 12650 },
  { date: "Oct 3", followers: 12800 },
  { date: "Oct 4", followers: 13200 },
  { date: "Oct 5", followers: 13500 },
  { date: "Oct 6", followers: 13900 },
  { date: "Oct 7", followers: 14300 },
  { date: "Oct 8", followers: 14800 },
  { date: "Oct 9", followers: 15200 },
];

const engagementData = [
  { day: "Mon", rate: 8.2 },
  { day: "Tue", rate: 7.5 },
  { day: "Wed", rate: 9.1 },
  { day: "Thu", rate: 8.8 },
  { day: "Fri", rate: 10.2 },
  { day: "Sat", rate: 11.5 },
  { day: "Sun", rate: 10.8 },
];

const timeData = [
  { hour: "6AM", engagement: 45 },
  { hour: "9AM", engagement: 72 },
  { hour: "12PM", engagement: 88 },
  { hour: "3PM", engagement: 65 },
  { hour: "6PM", engagement: 95 },
  { hour: "9PM", engagement: 82 },
];

const trendingTopics = [
  { tag: "wellness", count: 234, trend: "up" },
  { tag: "mindfulness", count: 198, trend: "up" },
  { tag: "fitness", count: 176, trend: "up" },
  { tag: "nutrition", count: 145, trend: "down" },
  { tag: "selfcare", count: 132, trend: "up" },
  { tag: "yoga", count: 128, trend: "up" },
  { tag: "meditation", count: 115, trend: "down" },
  { tag: "health", count: 98, trend: "up" },
];

export default function Analytics() {
  return (
    <ComingSoon
      title="Analytics Dashboard"
      description="Advanced analytics and insights will be available in the next release. Track follower growth, engagement rates, and AI-powered recommendations."
    >
      <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-white">Analytics Dashboard</h1>
        <p className="text-[#A1A1A1]">Track your AI ambassador's performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-white border-0 rounded-2xl">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-[#A1A1A1]">Total Followers</p>
              <h3 className="text-2xl text-[#1E1E1E]">15.2K</h3>
              <div className="flex items-center gap-1 text-sm text-[#00D1B2]">
                <TrendingUp className="w-4 h-4" />
                <span>+12.5%</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-[#00D1B2]/10 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-[#00D1B2]" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border-0 rounded-2xl">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-[#A1A1A1]">Engagement Rate</p>
              <h3 className="text-2xl text-[#1E1E1E]">9.8%</h3>
              <div className="flex items-center gap-1 text-sm text-[#00D1B2]">
                <TrendingUp className="w-4 h-4" />
                <span>+2.3%</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-[#00D1B2]/10 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-[#00D1B2]" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border-0 rounded-2xl">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-[#A1A1A1]">Total Likes</p>
              <h3 className="text-2xl text-[#1E1E1E]">48.3K</h3>
              <div className="flex items-center gap-1 text-sm text-[#00D1B2]">
                <TrendingUp className="w-4 h-4" />
                <span>+18.2%</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-[#00D1B2]/10 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-[#00D1B2]" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border-0 rounded-2xl">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-[#A1A1A1]">Comments</p>
              <h3 className="text-2xl text-[#1E1E1E]">3.2K</h3>
              <div className="flex items-center gap-1 text-sm text-[#00D1B2]">
                <TrendingUp className="w-4 h-4" />
                <span>+8.7%</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-[#00D1B2]/10 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-[#00D1B2]" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts - Simplified View */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Follower Growth */}
        <Card className="p-6 bg-white border-0 rounded-2xl">
          <div className="space-y-4">
            <div>
              <h3 className="text-[#1E1E1E]">Follower Growth</h3>
              <p className="text-sm text-[#A1A1A1]">Last 9 days</p>
            </div>
            <div className="h-64 flex items-end justify-between gap-2 px-4 pb-4 border-b border-l border-gray-200">
              {followerData.map((item, index) => {
                const maxFollowers = Math.max(...followerData.map(d => d.followers));
                const height = (item.followers / maxFollowers) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-gradient-to-t from-[#00D1B2] to-[#00D1B2]/30 rounded-t-lg transition-all hover:opacity-80" style={{ height: `${height}%` }}></div>
                    <span className="text-xs text-[#A1A1A1]">{item.date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Engagement Rate */}
        <Card className="p-6 bg-white border-0 rounded-2xl">
          <div className="space-y-4">
            <div>
              <h3 className="text-[#1E1E1E]">Engagement Rate by Day</h3>
              <p className="text-sm text-[#A1A1A1]">Average weekly performance</p>
            </div>
            <div className="h-64 flex items-end justify-between gap-2 px-4 pb-4 border-b border-l border-gray-200">
              {engagementData.map((item, index) => {
                const maxRate = Math.max(...engagementData.map(d => d.rate));
                const height = (item.rate / maxRate) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-[#00D1B2] rounded-t-lg transition-all hover:opacity-80" style={{ height: `${height}%` }}></div>
                    <span className="text-xs text-[#A1A1A1]">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Best Times to Post */}
        <Card className="lg:col-span-2 p-6 bg-white border-0 rounded-2xl">
          <div className="space-y-4">
            <div>
              <h3 className="text-[#1E1E1E]">Best Times to Post</h3>
              <p className="text-sm text-[#A1A1A1]">Engagement by time of day</p>
            </div>
            <div className="h-64 relative px-4 pb-4 border-b border-l border-gray-200">
              <svg className="w-full h-full">
                {timeData.map((item, index) => {
                  const x = (index / (timeData.length - 1)) * 100;
                  const maxEngagement = Math.max(...timeData.map(d => d.engagement));
                  const y = 100 - (item.engagement / maxEngagement) * 100;
                  return (
                    <g key={index}>
                      <circle cx={`${x}%`} cy={`${y}%`} r="5" fill="#00D1B2" />
                      {index > 0 && (
                        <line
                          x1={`${((index - 1) / (timeData.length - 1)) * 100}%`}
                          y1={`${100 - (timeData[index - 1].engagement / maxEngagement) * 100}%`}
                          x2={`${x}%`}
                          y2={`${y}%`}
                          stroke="#00D1B2"
                          strokeWidth="3"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>
              <div className="flex justify-between mt-2">
                {timeData.map((item, index) => (
                  <span key={index} className="text-xs text-[#A1A1A1]">{item.hour}</span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Trending Topics */}
        <Card className="p-6 bg-white border-0 rounded-2xl">
          <div className="space-y-4">
            <div>
              <h3 className="text-[#1E1E1E]">Trending Topics</h3>
              <p className="text-sm text-[#A1A1A1]">Popular hashtags</p>
            </div>
            <div className="space-y-2">
              {trendingTopics.map((topic, index) => (
                <div
                  key={topic.tag}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#A1A1A1] w-4">
                      {index + 1}
                    </span>
                    <span className="text-sm text-[#1E1E1E]">
                      #{topic.tag}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#A1A1A1]">{topic.count}</span>
                    {topic.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-[#00D1B2]" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-[#A1A1A1]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="p-6 bg-gradient-to-br from-[#00D1B2]/10 to-[#00D1B2]/5 border border-[#00D1B2]/20 rounded-2xl">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-[#00D1B2] rounded-xl flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-2">
            <h3 className="text-[#1E1E1E]">AI Insights</h3>
            <p className="text-sm text-[#1E1E1E]/70">
              Your community loves posts about <strong>wellness routines</strong> and{" "}
              <strong>mindfulness tips</strong> posted around <strong>7PM</strong>.
              Weekend posts see 15% higher engagement. Consider creating a series
              about morning rituals to capitalize on this trend.
            </p>
          </div>
        </div>
      </Card>
    </div>
    </ComingSoon>
  );
}
