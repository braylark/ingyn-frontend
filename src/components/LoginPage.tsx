import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Sparkles } from "lucide-react";

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#F8F9FB] to-[#EEF0F5] items-center justify-center p-12">
        <div className="max-w-md text-[#1E1E1E] space-y-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-[#6464B4] rounded-xl flex items-center justify-center text-white">
              <Sparkles className="w-7 h-7" />
            </div>
            <span className="text-3xl">Ingyn.AI</span>
          </div>
          <h1 className="text-4xl">
            Create Authentic Avatars for your business or brands
          </h1>
          <p className="text-lg text-[#6B7280]">
            Create, manage, and grow AI ambassadors that
            authentically represent your brand across social
            platforms.
          </p>
          <div className="space-y-4 pt-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#00D1B2]/20 rounded-lg flex items-center justify-center bg-[rgba(100,100,180,0.2)]">
                <span className="text-[rgb(100,100,180)]">
                  ✓
                </span>
              </div>
              <span>AI-powered content generation</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#6464B4]/20 rounded-lg flex items-center justify-center">
                <span className="text-[#6464B4]">✓</span>
              </div>
              <span>Smart scheduling & analytics</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#6464B4]/20 rounded-lg flex items-center justify-center">
                <span className="text-[#6464B4]">✓</span>
              </div>
              <span>Automated engagement at scale</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Get Started / Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <Card className="w-full max-w-md p-8 bg-white border border-gray-200 rounded-2xl shadow-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-[#6464B4] rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl text-[#1E1E1E]">
              Ingyn.AI
            </span>
          </div>

          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl text-[#1E1E1E] mb-2">
                Create Your AI Ambassador
              </h2>
              <p className="text-[#A1A1A1]">
                Get started in minutes with our AI-powered
                platform
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={onLogin}
                className="w-full bg-[#6464B4] hover:bg-[#5454A0] text-white rounded-xl h-14"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Get Started Free
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-[#A1A1A1]">
                    or sign in
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  className="rounded-xl border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="rounded-xl border-gray-200"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  <span className="text-[#A1A1A1]">
                    Remember me
                  </span>
                </label>
                <a
                  href="#"
                  className="text-[#6464B4] hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              <Button
                onClick={onLogin}
                className="w-full bg-white hover:bg-gray-50 text-[#1E1E1E] border border-gray-200 rounded-xl h-12"
              >
                Sign In
              </Button>

              <p className="text-xs text-center text-[#A1A1A1]">
                By continuing, you agree to our{" "}
                <a
                  href="#"
                  className="text-[#6464B4] hover:underline"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-[#6464B4] hover:underline"
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}