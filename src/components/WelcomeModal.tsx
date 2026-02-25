import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Bolt, Users } from "lucide-react";

const APP_NAME = "Earnix9ja";

export const WelcomeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [telegramJoined, setTelegramJoined] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("chixx9ja_welcome_seen");
    const telegramStatus = localStorage.getItem("chixx9ja_telegram_joined");
    if (!seen) {
      setIsOpen(true);
      if (telegramStatus === "true") {
        setTelegramJoined(true);
      }
    }
  }, []);

  const close = () => {
    localStorage.setItem("chixx9ja_welcome_seen", "true");
    localStorage.removeItem("chixx9ja_telegram_joined");
    setIsOpen(false);
    setStep(1);
  };

  const joinTelegram = () => {
    localStorage.setItem("chixx9ja_telegram_joined", "true");
    setTelegramJoined(true);
    window.location.href = "https://t.me/earnix9jachannel";
  };

  const handleOpenChange = (open: boolean) => {
    // Prevent closing the modal while on step 1 unless Telegram join action occurred
    if (!open && step === 1 && !telegramJoined) return;
    if (!open) {
      // When allowed to close, mark as seen
      localStorage.setItem("chixx9ja_welcome_seen", "true");
      setStep(1);
    }
    setIsOpen(open);
  };

  const handleEscapeKeyDown = (e: KeyboardEvent) => {
    // Prevent escape key on step 1 unless telegram joined
    if (step === 1 && !telegramJoined) {
      e.preventDefault();
    }
  };

  const handleInteractOutside = (e: Event) => {
    // Prevent clicking outside the dialog on step 1 unless telegram joined
    if (step === 1 && !telegramJoined) {
      e.preventDefault();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        hideClose 
        className="sm:max-w-md"
        onEscapeKeyDown={handleEscapeKeyDown}
        onInteractOutside={handleInteractOutside}
      >
        {/* Gradient header similar to PayGo */}
        <div className="relative rounded-t-lg overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-white/90">Step {step} of 2</p>
              <div className="mt-2">
                <h3 className="text-white text-lg font-bold">Welcome to {APP_NAME}, Friend!</h3>
              </div>
            </div>
            {/* X button removed to prevent skipping the onboarding step */}
          </div>

          {/* pill progress */}
          <div className="mt-3 flex items-center gap-2">
            <div className={`h-2 flex-1 rounded-full ${step >= 1 ? "bg-white/90" : "bg-white/30"}`} />
            <div className={`h-2 flex-1 rounded-full ${step >= 2 ? "bg-white/90" : "bg-white/30"}`} />
          </div>
        </div>

        {/* Body (keeps same visual size/spacing) */}
        <div className="p-6 -mt-2 space-y-5 bg-card/80 rounded-b-lg">
          {step === 1 ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                <Gift className="w-8 h-8 text-purple-400" />
              </div>

              <h4 className="text-xl font-semibold">Welcome to {APP_NAME}!</h4>

              <p className="text-sm text-muted-foreground mx-3">
                As a new user you'll receive a welcome bonus of <span className="font-bold">₦50,000</span>.
                This bonus is credited after you complete the required steps (joining our Telegram is one of them).
              </p>

              <div className="space-y-2">
                <button onClick={joinTelegram} className="w-full bg-gradient-to-r from-purple-500 to-pink-400 text-white font-semibold py-3 rounded-lg">Join Telegram Channel</button>
                {telegramJoined && (
                  <button onClick={() => setStep(2)} className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold py-3 rounded-lg">Amazing! Continue →</button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                <Bolt className="w-8 h-8 text-yellow-400" />
              </div>

              <h4 className="text-xl font-semibold">Start Earning More!</h4>

              <p className="text-sm text-muted-foreground mx-3">
                Earn by referrals, daily tasks, special promotions and by claiming earnings every few minutes.
              </p>

              <div className="space-y-2 text-left">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-semibold">Referrals</p>
                    <p className="text-xs text-muted-foreground">Earn ₦12,000 per referral</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="ml-0">
                    <p className="font-semibold">Daily Tasks</p>
                    <p className="text-xs text-muted-foreground">Complete tasks to earn instant rewards</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="ml-0">
                    <p className="font-semibold">Special Promotions</p>
                    <p className="text-xs text-muted-foreground">Participate in limited-time offers</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button onClick={close} className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold py-3 rounded-lg">Let's Get Started →</button>
                <button onClick={() => setStep(1)} className="w-full bg-muted hover:bg-muted/80 text-foreground font-medium py-2 rounded-lg">← Back</button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
