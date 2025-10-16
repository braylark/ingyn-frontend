import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Sparkles, Check, Clock } from "lucide-react";
import { useState, useEffect } from "react";

interface PricingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStartFreeTrial: () => void;
}

export default function PricingDialog({ isOpen, onClose, onStartFreeTrial }: PricingDialogProps) {
  const [timeLeft, setTimeLeft] = useState({ minutes: 14, seconds: 23 });

  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl bg-white p-0 gap-0" aria-describedby={undefined}>
        <DialogTitle className="sr-only">Ingyn.AI Premium Subscription</DialogTitle>
        {/* Timer Header */}
        <div className="bg-[rgb(255,255,255)] text-white px-8 py-4 flex items-center justify-between rounded-[10px]">
          <div className="flex items-center gap-3 mt-[0px] mr-[0px] mb-[0px] ml-[106px]">
            <Clock className="w-5 h-5 text-[#6464B4]" />
            <span className="text-sm text-[rgb(0,0,0)]">Special offer expires in</span>
            <span className="text-[rgb(100,100,180)] font-mono">
              {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
          
        </div>

        <div className="grid md:grid-cols-1 gap-0">
          {/* Left Side - Pricing */}
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl text-[#1E1E1E]">Try Ingyn.AI Premium</h2>
              <p className="text-[rgb(100,100,180)] text-xl">free for 7 days</p>
              <p className="text-sm text-[#A1A1A1]">Then $139.00/year, only $2.73/week</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#1E1E1E] mt-0.5 flex-shrink-0" />
                <span className="text-[#1E1E1E]">Unlimited AI avatar generations</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#1E1E1E] mt-0.5 flex-shrink-0" />
                <span className="text-[#1E1E1E]">AI-powered content creation & scheduling</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#1E1E1E] mt-0.5 flex-shrink-0" />
                <span className="text-[#1E1E1E]">Advanced analytics & insights</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#1E1E1E] mt-0.5 flex-shrink-0" />
                <span className="text-[#1E1E1E]">Priority support & updates</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#1E1E1E] mt-0.5 flex-shrink-0" />
                <span className="text-[#1E1E1E]">Multi-platform deployment</span>
              </div>
            </div>

            <Button
              onClick={onStartFreeTrial}
              className="w-full bg-[rgb(100,100,180)] hover:bg-[#6464B4] text-white rounded-xl h-12"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Start for Free
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-[#A1A1A1]">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-[#00D1B2] border-2 border-white"></div>
                <div className="w-6 h-6 rounded-full bg-[#4F46E5] border-2 border-white"></div>
                <div className="w-6 h-6 rounded-full bg-[#F59E0B] border-2 border-white"></div>
              </div>
              <span>27,781 started Premium this week</span>
            </div>
          </div>

          {/* Right Side - Timeline */}
          
        </div>
      </DialogContent>
    </Dialog>
  );
}
