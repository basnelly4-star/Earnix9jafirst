import { useState } from "react";
import { X, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const FEE_PERCENT = 2;
const BANK_DETAILS = {
  bankName: "Moniepoint ",
  accountName: "Esther Stephan ",
  accountNumber: "5256542408",
};

export const AddBalanceModal = ({ open, onOpenChange, onSuccess }: any) => {
  const [amount, setAmount] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const amountNum = Number(amount) || 0;
  const total = amountNum + (amountNum * 2) / 100;

  if (!open) return null;

  const handleFile = (e: any) => {
    const fs = Array.from(e.target.files || []);
    if (files.length + fs.length > 3) return toast.error("Max 3 files");
    setFiles([...files, ...fs]);
    e.target.value = "";
  };

  const removeFile = (i: number) => setFiles(files.filter((_, idx) => idx !== i));

  const submit = async () => {
    if (amountNum < 1000) return toast.error("Min ₦1,000");
    if (!files.length) return toast.error("Upload receipt");

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Login required");

      const { data: topup } = await supabase
        .from("instant_activation_payments")
        .insert({
          user_id: session.user.id,
          amount: total,
          status: "pending",
          has_receipt: true,
          receipt_count: files.length,
        })
        .select()
        .single();

      await Promise.all(
        files.map(async (f, i) => {
          const ext = f.name.split(".").pop();
          const path = `${session.user.id}/topup_${topup.id}_${i}.${ext}`;
          await supabase.storage.from("receipts").upload(path, f);
          await supabase.from("topup_receipts").insert({
            topup_id: topup.id,
            storage_key: path,
            mime_type: f.type,
            file_size: f.size,
            uploaded_by: session.user.id,
          });
        })
      );

      toast.success("Submitted! We go check");
      onSuccess();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Dark background */}
      <div className="fixed inset-0 bg-black/70 z-50" onClick={() => onOpenChange(false)} />

      {/* The actual pop-up modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-background rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">

          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="text-2xl font-bold">Add Balance</h2>
            <button onClick={() => onOpenChange(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* SCROLLABLE CONTENT — THIS WORKS ON EVERY PHONE */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ WebkitOverflowScrolling: "touch" }}>
            {/* Bank */}
            <div className="bg-muted/50 p-5 rounded-xl border text-center">
              <p className="font-bold text-lg mb-4">Send Money To:</p>
              <p>Bank: <strong>{BANK_DETAILS.bankName}</strong></p>
              <p>Name: <strong>{BANK_DETAILS.accountName}</strong></p>
              <p>Account: <strong className="font-mono text-xl">{BANK_DETAILS.accountNumber}</strong></p>
            </div>

            <div>
              <Label>Amount (₦)</Label>
              <Input type="number" className="h-12 mt-2" placeholder="10000" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>

            {amountNum >= 1000 && (
              <div className="bg-primary/10 p-5 rounded-xl border text-center">
                <p className="text-2xl font-bold">Total: ₦{total.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-2">(includes 2% fee)</p>
              </div>
            )}

            <div>
              <Label>Upload Receipt (max 3)</Label>
              <div className="border-2 border-dashed rounded-xl p-8 text-center mt-3">
                <input type="file" id="file" multiple accept="image/*,.pdf" onChange={handleFile} className="hidden" />
                <label htmlFor="file" className="cursor-pointer">
                  <Upload className="w-16 h-16 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium">Tap to upload</p>
                </label>
              </div>

              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 mt-3 bg-muted/50 p-3 rounded-lg">
                  {f.type.includes("image") ? <img src={URL.createObjectURL(f)} className="w-12 h-12 rounded object-cover" /> : <FileText className="w-12 h-12" />}
                  <div className="flex-1 truncate">{f.name}</div>
                  <button onClick={() => removeFile(i)}><X /></button>
                </div>
              ))}
            </div>

            {/* This red box proves scrolling works */}
            <div className="h-64 bg-yellow-500 rounded-xl flex items-center justify-center text-white text-3xl font-bold">
              Your balance will be credited instantly 
              once we confirm your payment
            </div>
          </div>

          {/* Submit Button */}
          <div className="p-6 border-t">
            <Button onClick={submit} disabled={loading || amountNum < 1000 || !files.length} className="w-full h-14 text-lg font-bold">
              {loading ? "Submitting..." : "I've Paid & Uploaded Receipt"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};