import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { CopyButton } from "@/components/CopyButton";

const InstantWithdrawalActivation = () => {
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceipt(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!receipt) {
      toast.error("Please upload payment receipt");
      return;
    }

    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Create activation payment record
      const { error } = await supabase.from("instant_activation_payments").insert({
        user_id: session.user.id,
        amount: 12600,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Payment submitted! Awaiting confirmation.");
      navigate("/instant-withdrawal-pending");
    } catch (error: any) {
      toast.error("Failed to submit payment");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen liquid-bg pb-20">
      <div className="bg-gradient-to-r from-primary to-secondary p-6 text-primary-foreground">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/withdraw")}
            className="text-primary-foreground hover:bg-background/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Instant Withdrawal Activation</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <Card className="bg-card/80 backdrop-blur-lg border-border/50 p-6">
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
              ⚡ Instant Withdrawal Activation
            </h3>
            <p className="text-sm text-muted-foreground">
              Pay a one-time activation fee of ₦12,600 to unlock instant
              withdrawals without referral requirements.
            </p>
          </div>

          <div className="mb-6 p-6 bg-muted/50 rounded-lg space-y-4">
            <h3 className="font-semibold text-lg mb-4">Payment Details</h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-background/50 rounded">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="font-semibold">₦12,600</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-background/50 rounded">
                <span className="text-sm text-muted-foreground">
                  Account Number
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">6733036004</span>
                  <CopyButton text="6733036004" />
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-background/50 rounded">
                <span className="text-sm text-muted-foreground">
                  Account Name
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Dennis Deborah</span>
                  <CopyButton text="Dennis Deborah" />
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-background/50 rounded">
                <span className="text-sm text-muted-foreground">Bank</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Moniepoint</span>
                  <CopyButton text="Moniepoint" />
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-background/50 rounded">
                <span className="text-sm text-muted-foreground">
                  Verification ID
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold font-mono">10077A</span>
                  <CopyButton text="10077A" />
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="receipt">Upload Payment Receipt</Label>
              <Input
                id="receipt"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="bg-background/50"
              />
              {receipt && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  ✓ {receipt.name}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary"
              disabled={uploading}
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <Upload className="w-4 h-4 animate-spin" />
                  Uploading...
                </span>
              ) : (
                "Submit Payment"
              )}
            </Button>
          </form>
        </Card>
      </div>

      <FloatingActionButton />
    </div>
  );
};

export default InstantWithdrawalActivation;
