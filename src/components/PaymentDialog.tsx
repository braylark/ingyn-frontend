import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { X, CreditCard } from "lucide-react";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function PaymentDialog({ isOpen, onClose, onComplete }: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank" | "paypal" | "scan" | null>(null);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white p-6" aria-describedby={undefined}>
        <DialogTitle className="sr-only">Payment Method Selection</DialogTitle>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl text-[#1E1E1E]">Payment Method</h2>
            
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            {/* Credit/Debit Card */}
            <button
              onClick={() => setPaymentMethod("card")}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                paymentMethod === "card"
                  ? "border-[#6464B4] bg-[#6464B4]/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "card" ? "border-[#6464B4]" : "border-gray-300"
                  }`}>
                    {paymentMethod === "card" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#6464B4]"></div>
                    )}
                  </div>
                  <span className="text-[#1E1E1E]">Credit or Debit Card</span>
                </div>
                <div className="flex gap-2 text-xs text-[#A1A1A1]">
                  <span>VISA</span>
                  <span>MC</span>
                  <span>AMEX</span>
                </div>
              </div>
            </button>

            {/* Card Details - Show when card is selected */}
            {paymentMethod === "card" && (
              <div className="p-4 bg-gray-50 rounded-xl space-y-4 border border-gray-200">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                  <div className="w-10 h-10 bg-[#1E1E1E] rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#1E1E1E]">link</p>
                    <p className="text-xs text-[#A1A1A1]">braylark@gmail.com</p>
                  </div>
                  <button className="text-xs text-[#A1A1A1] hover:text-[#1E1E1E]">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3 bg-white rounded-lg px-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-[#A1A1A1]" />
                    <span className="text-[#1E1E1E]">Use •••• 4603</span>
                  </div>
                  <button className="text-sm text-[#6464B4] hover:underline">
                    Pay another way
                  </button>
                </div>
              </div>
            )}

            {/* US Bank */}
            <button
              onClick={() => setPaymentMethod("bank")}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                paymentMethod === "bank"
                  ? "border-[#6464B4] bg-[#6464B4]/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === "bank" ? "border-[#6464B4]" : "border-gray-300"
                }`}>
                  {paymentMethod === "bank" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#6464B4]"></div>
                  )}
                </div>
                <span className="text-[#1E1E1E]">US Bank</span>
              </div>
            </button>

            {/* PayPal */}
            <button
              onClick={() => setPaymentMethod("paypal")}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                paymentMethod === "paypal"
                  ? "border-[#6464B4] bg-[#6464B4]/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === "paypal" ? "border-[#6464B4]" : "border-gray-300"
                }`}>
                  {paymentMethod === "paypal" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#6464B4]"></div>
                  )}
                </div>
                <span className="text-[#1E1E1E]">PayPal</span>
              </div>
            </button>

          </div>

          {/* Due Today */}
          <div className="flex items-center justify-between py-4 border-t border-gray-200">
            <span className="text-gray-600">Due Today</span>
            <div className="text-right">
              <p className="text-[#1E1E1E]">$0.00 <span className="text-sm text-[#6464B4]">for a 7-day free trial</span></p>
              <p className="text-xs text-gray-600">Then $139.00/year</p>
            </div>
          </div>

          {/* Start Free Trial Button */}
          <Button
            onClick={onComplete}
            className="w-full bg-[#6464B4] hover:bg-[#5454A0] text-white rounded-xl h-12"
          >
            Start Your Free Trial
          </Button>

          {/* Terms */}
          <p className="text-xs text-center text-gray-600">
            You'll notice a $1.00 "Authorization" on your card, which is just a check to ensure funds in your
            account. If you cancel your trial, no charges will apply. This site is protected by reCAPTCHA and
            the Google{" "}
            <a href="#" className="text-[#6464B4] hover:underline">Privacy Policy</a> and{" "}
            <a href="#" className="text-[#6464B4] hover:underline">Terms of Service</a> apply.
          </p>

          {/* Footer */}
          <p className="text-xs text-center text-gray-600">
            By continuing you accept our{" "}
            <a href="#" className="text-[#6464B4] hover:underline">Terms of Use</a> and{" "}
            <a href="#" className="text-[#6464B4] hover:underline">Privacy Policy</a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
