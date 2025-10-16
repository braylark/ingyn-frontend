import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Sparkles } from "lucide-react";

interface AccountCreationDialogProps {
  isOpen: boolean;
  onComplete: () => void;
}

export default function AccountCreationDialog({ isOpen, onComplete }: AccountCreationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md bg-white p-8" hideClose aria-describedby={undefined}>
        <DialogTitle className="sr-only">Create Your Ingyn.AI Account</DialogTitle>
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-3 justify-center">
            <div className="w-12 h-12 bg-[#00D1B2] rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl text-[#1E1E1E]">Ingyn.AI</span>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl text-[#1E1E1E]">Create Your Account</h2>
            <p className="text-[#A1A1A1]">Complete your registration to get started</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullname">Full Name</Label>
              <Input
                id="fullname"
                type="text"
                placeholder="John Doe"
                className="rounded-xl border-gray-200"
              />
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

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                className="rounded-xl border-gray-200"
              />
            </div>

            <Button
              onClick={onComplete}
              className="w-full bg-[#00D1B2] hover:bg-[#00b89d] text-white rounded-xl h-12"
            >
              Create Account & Start Trial
            </Button>

            <p className="text-xs text-center text-[#A1A1A1]">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-[#00D1B2] hover:underline">Terms of Service</a> and{" "}
              <a href="#" className="text-[#00D1B2] hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
