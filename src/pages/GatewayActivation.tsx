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

const GatewayActivation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const withdrawalId = location.state?.withdrawalId;

  const [receipt, setReceipt] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  if (!withdrawalId) {
    navigate("/withdraw");
    return null;
  }

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

      // Create gateway activation record
      const { error } = await supabase.from("gateway_activations").insert({
        user_id: session.user.id,
        withdrawal_id: withdrawalId,
        amount: 13250,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Gateway activation payment submitted!");
      navigate("/gateway-pending");
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
          <h1 className="text-2xl font-bold">Gateway Activation</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <Card className="bg-gradient-to-br from-card to-card/80 backdrop-blur-lg border-border/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Withdrawal Submitted!</h2>
              <p className="text-sm text-muted-foreground">
                Complete activation to process
              </p>
            </div>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Activation Fee</p>
            <p className="text-3xl font-bold text-primary">₦13,250</p>
          </div>
        </Card>

        <Card className="bg-card/80 backdrop-blur-lg border-border/50 p-6">
          <h3 className="font-semibold mb-4">Payment Instructions</h3>
          <div className="space-y-3 text-sm mb-6">
            <p className="flex gap-2">
              <span className="font-bold">1.</span>
              <span>Transfer ₦13,250 to the account details below</span>
            </p>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <p className="text-sm font-semibold">Bank Details</p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-mono">Account:5252357097</p>
                  <CopyButton text="5252357097" />
                </div>
                <p>Name: Grace Onuoha </p>
                <p>Bank: MONIEPOINT</p>
              </div>
            </div>
            <p className="flex gap-2">
              <span className="font-bold">2.</span>
              <span>Upload your payment receipt below</span>
            </p>
            <p className="flex gap-2">
              <span className="font-bold">3.</span>
              <span>Wait for confirmation (usually within 24 hours)</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="receipt">Upload Payment Receipt</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="receipt"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="bg-background/50"
                  required
                />
                <Upload className="w-5 h-5 text-muted-foreground" />
              </div>
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

export default GatewayActivation;
