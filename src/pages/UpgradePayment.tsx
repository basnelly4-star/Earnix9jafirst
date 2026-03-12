import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { CopyButton } from "@/components/CopyButton";

const UpgradePayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tier = location.state as any;

  const [receipt, setReceipt] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  if (!tier) {
    navigate("/upgrade");
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

      // For now, we'll just store the upgrade request without actual file upload
      // In production, you'd upload to Supabase Storage
      const { error } = await supabase.from("upgrades").insert({
        user_id: session.user.id,
        upgrade_level: tier.level,
        amount: tier.amount,
        price: tier.price,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Upgrade request submitted!");
      navigate("/upgrade-pending");
    } catch (error: any) {
      toast.error("Failed to submit upgrade request");
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
            onClick={() => navigate("/upgrade")}
            className="text-primary-foreground hover:bg-background/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Complete Payment</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <Card className="bg-gradient-to-br from-card to-card/80 backdrop-blur-lg border-border/50 p-6">
          <h2
            className={`text-2xl font-bold mb-4 bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}
          >
            {tier.level} Upgrade
          </h2>
          <div className="space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Earnings per referral:
              </span>
              <span className="font-bold">₦{tier.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Upgrade price:</span>
              <span className="font-bold text-primary">
                ₦{tier.price.toLocaleString()}
              </span>
            </div>
          </div>
        </Card>

        <Card className="bg-card/80 backdrop-blur-lg border-border/50 p-6">
          <h3 className="font-semibold mb-4">Payment Instructions</h3>
          <div className="space-y-3 text-sm mb-6">
            <p className="flex gap-2">
              <span className="font-bold">1.</span>
              <span>
                Transfer ₦{tier.price.toLocaleString()} to the account details
                below
              </span>
            </p>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <p className="text-sm font-semibold">Bank Details</p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-mono">Account: 6636110028</p>
                  <CopyButton text="6636110028" />
                </div>
                <p>Name: Mavelous Madubuchi Nnaemeka</p>
                <p>Bank: MONIEPOINT</p>
              </div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Verification ID</p>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold">10077A</span>
                <CopyButton text="10077A" />
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

export default UpgradePayment;
