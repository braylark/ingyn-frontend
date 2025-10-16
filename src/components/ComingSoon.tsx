import { Card } from "./ui/card";
import { Sparkles, Lock } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function ComingSoon({ title, description, children }: ComingSoonProps) {
  return (
    <div className="relative">
      {/* Blurred Background Content */}
      <div className="blur-sm pointer-events-none select-none opacity-50">
        {children}
      </div>

      {/* Coming Soon Overlay */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <Card className="p-8 bg-white border-0 rounded-2xl shadow-2xl max-w-md mx-4 pointer-events-auto">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#6464B4] to-[#6464B4] rounded-2xl flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl text-[#1E1E1E]">{title}</h2>
              <p className="text-[#A1A1A1]">{description}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#00D1B2] bg-[#00D1B2]/10 px-4 py-2 rounded-lg bg-[rgba(100,100,180,0.1)]">
              <span className="text-[rgb(100,100,180)]">Coming Soon</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
