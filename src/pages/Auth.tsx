import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { recoverFromInvalidRefreshToken, supabase } from "@/integrations/supabase/client";

const isRetryableAuthIssue = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /AuthRetryableFetchError|504|503|502|Failed to fetch|NetworkError/i.test(message);
};

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Referral code handling
  const refParam = searchParams.get("ref");
  const storedRef = localStorage.getItem("referralCode") || "";
  const initialRefCode = refParam || storedRef;

  useEffect(() => {
    if (refParam) {
      localStorage.setItem("referralCode", refParam);
    }
  }, [refParam]);

  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    referralCode: initialRefCode,
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Redirect if already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session) navigate("/dashboard", { replace: true });
      } catch (error) {
        const recovered = await recoverFromInvalidRefreshToken(error);
        if (recovered) {
          return;
        }

        if (!isRetryableAuthIssue(error)) {
          console.error(error);
        }
      }
    };
    checkSession();
  }, [navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const finalRefCode = signupData.referralCode || localStorage.getItem("referralCode") || "";

      const { data, error } = await supabase.auth.signUp({
        email: signupData.email.trim(),
        password: signupData.password,
        options: {
          data: {
            fullName: signupData.fullName,
            referralCode: finalRefCode,
          },
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error("Signup failed");

      const userId = data.user.id;
      const generatedRefCode = Math.random().toString(36).substr(2, 6).toUpperCase();

      // Create user profile
      await supabase.from("profiles").upsert({
        id: userId,
        email: data.user.email!,
        full_name: signupData.fullName,
        referral_code: generatedRefCode,
        balance: 50000,
        total_referrals: 0,
      });

      // Welcome bonus
      await supabase.from("transactions").insert({
        user_id: userId,
        type: "credit",
        amount: 50000,
        description: "Welcome bonus",
        status: "completed",
      });

      // Handle referral
      if (finalRefCode && finalRefCode.trim() !== "") {
        console.log("🔍 DEBUG: Looking for referrer with code:", finalRefCode.trim());
        
        const { data: referrer, error: referrerError } = await supabase
          .from("profiles")
          .select("id, balance, total_referrals, referral_code")
          .ilike("referral_code", finalRefCode.trim())
          .maybeSingle();

        console.log("🔍 DEBUG: Referrer found:", referrer);
        console.log("🔍 DEBUG: Referrer error:", referrerError);

        if (referrer) {
          console.log("🔍 DEBUG: Updating referrer:", referrer.id);
          const currentBalance = Number(referrer.balance) || 0;
          const currentReferrals = Number(referrer.total_referrals) || 0;
          
          const newBalance = currentBalance + 12000;
          const newReferrals = currentReferrals + 1;

          console.log("🔍 DEBUG: Current balance:", currentBalance, "referrals:", currentReferrals);
          console.log("🔍 DEBUG: New balance:", newBalance, "referrals:", newReferrals);

          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              balance: newBalance,
              total_referrals: newReferrals,
            })
            .eq("id", referrer.id);

          console.log("🔍 DEBUG: Update error:", updateError);

          if (!updateError) {
            console.log("🔍 DEBUG: Successfully updated referrer");
          }

          await supabase.from("transactions").insert({
            user_id: referrer.id,
            type: "credit",
            amount: 12000,
            description: `Referral bonus from ${signupData.fullName}`,
            status: "completed",
          });
        } else {
          console.log("🔍 DEBUG: No referrer found or error occurred");
        }
      }

      localStorage.removeItem("referralCode");
      toast.success("Welcome to Earnix9ja! You got ₦50,000 bonus!");
      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Signup failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let loginError: unknown;

      for (let attempt = 1; attempt <= 2; attempt++) {
        const { error } = await supabase.auth.signInWithPassword({
          email: loginData.email.trim(),
          password: loginData.password,
        });

        if (!error) {
          loginError = null;
          break;
        }

        loginError = error;

        if (!isRetryableAuthIssue(error) || attempt === 2) {
          throw error;
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      if (loginError) throw loginError;

      toast.success("Welcome back!");
      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      const recovered = await recoverFromInvalidRefreshToken(error);
      if (recovered) {
        toast.error("Your previous session expired. Please login again.");
        return;
      }

      if (isRetryableAuthIssue(error)) {
        toast.error("Authentication server timed out. Please try again in a few seconds.");
      } else {
        toast.error(error.message || "Invalid email or password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen liquid-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/95 backdrop-blur-lg border-border/50 animate-slide-up">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold gradient-text mb-2">Earnix9ja</CardTitle>
          <CardDescription className="text-muted-foreground">
            Turn one click into thousands!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signup" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="login">Login</TabsTrigger>
            </TabsList>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={signupData.fullName}
                    onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                  <Input
                    id="referralCode"
                    placeholder="Enter referral code"
                    value={signupData.referralCode}
                    onChange={(e) => setSignupData({ ...signupData, referralCode: e.target.value })}
                    disabled={!!refParam}
                    readOnly={!!refParam}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-semibold glow-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Sign Up & Get ₦50,000 Bonus"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;