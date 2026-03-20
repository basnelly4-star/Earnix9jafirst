import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Tasks = () => {
  const navigate = useNavigate();

  const tasks = [
    {
      id: 4,
      title: "Join Telegram Channel",
      description: "Join our official Telegram channel for updates",
      reward: "₦5,000",
      link: "https://otieu.com/4/10573002",
    },
    {
      id: 5,
      title: "Join Telegram Channel",
      description: "Join our official Telegram channel for updates",
      reward: "₦5,000",
      link: "https://otieu.com/4/10573002",
    },
    {
      id: 6,
      title: "Join Telegram Channel",
      description: "Join our official Telegram channel for updates",
      reward: "₦5,000",
      link: "https://www.effectivegatecpm.com/vmv8q8003e?key=86df7f349a5444d876061f4d1430b01c",
    },
    {
      id: 1,
      title: "Join Telegram Channel",
      description: "Join our official Telegram channel for updates",
      reward: "₦5,000",
      link: "https://t.me/earnixupdate",
    },
    {
      id: 2,
      title: "Join WhatsApp Group",
      description: "Join our WhatsApp community for instant updates",
      reward: "₦5,000",
      link: "https://whatsapp.com/channel/0029VbCUz1HF6smt6EnLWw0F",
    },
    {
      id: 3,
      title: "Earn Extra",
      description:
        "Tap on our sponsorship ads to earn extra and get closer to your minimum withdrawal!",
      reward: "₦5,000",
      link: `https://otieu.com/4/10573002 `,
    },
    {
      id: 7,
      title: "Sponsorship ads",
      description:
        "Tap on our sponsorship ads to earn extra and get closer to your minimum withdrawal!",
      reward: "₦5,000",
      link: `https://otieu.com/4/10573002 `,
    },
    {
      id: 8,
      title: "Earn More",
      description:
        "Tap on our sponsorship ads to earn extra and get closer to your minimum withdrawal!",
      reward: "₦5,000",
      link: `https://otieu.com/4/10573002 `,
    },
    {
      id: 9,
      title: "JEarmers",
      description:
        "Tap on our sponsorship ads to earn extra and get closer to your minimum withdrawal!",
      reward: "₦5,000",
      link: `https://otieu.com/4/10573002 `,
    },
    {
      id: 10,
      title: "Earn more",
      description:
        "Tap on our sponsorship ads to earn extra and get closer to your minimum withdrawal!",
      reward: "₦5,000",
      link: `https://otieu.com/4/10573002 `,
    },
  ];

  // Check if task was claimed today
  const isTaskClaimedToday = (taskId: number) => {
    const lastClaim = localStorage.getItem(`task_${taskId}_claimed`);
    if (!lastClaim) return false;
    
    const today = new Date().toDateString();
    const lastClaimDate = new Date(lastClaim).toDateString();
    return today === lastClaimDate;
  };

  // Mark task as claimed for today
  const markTaskAsClaimed = (taskId: number) => {
    localStorage.setItem(`task_${taskId}_claimed`, new Date().toISOString());
  };

  const handleClaim = async (task: any) => {
    // Check if already claimed today
    if (isTaskClaimedToday(task.id)) {
      toast.error("Already claimed today! Come back tomorrow.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please login first");
      return;
    }

    try {
      // Get current balance
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      // Calculate new balance
      let amount = 0;
      if (task.id === 1 || task.id === 2) amount = 5000;
      if (task.id === 5) amount = 15000;

      const newBalance = profile.balance + amount;

      // Update balance in database
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ balance: newBalance })
        .eq("id", user.id);

      if (updateError) {
        toast.error("Failed to update balance. Try again.");
      } else {
        // Mark as claimed for today
        markTaskAsClaimed(task.id);
        
        // Show success message
        toast.success(`${task.reward} added to your balance!`);
        
        // Open link for Telegram/WhatsApp tasks (even if balance update worked)
        if (task.link) {
          window.location.href = task.link;
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen liquid-bg pb-20">
      <div className="bg-gradient-to-r from-primary to-secondary p-6 text-primary-foreground">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="text-primary-foreground hover:bg-background/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Daily Tasks</h1>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <Card className="bg-gradient-to-br from-card to-card/80 backdrop-blur-lg border-border/50 p-6">
          <h2 className="text-xl font-bold mb-2">Earn Extra Rewards</h2>
          <p className="text-sm text-muted-foreground">
            Complete tasks to earn bonus credits and boost your earnings
          </p>
        </Card>

        {tasks.map((task) => {
          const isClaimed = isTaskClaimedToday(task.id);
          
          return (
            <Card key={task.id} className="bg-card/80 backdrop-blur-lg border-border/50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{task.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-primary">{task.reward}</span>
                    <span className="text-xs text-muted-foreground">reward</span>
                    {isClaimed && (
                      <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                        Claimed Today
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => handleClaim(task)}
                  disabled={isClaimed}
                  className={`px-6 py-3 font-bold ${
                    isClaimed 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  }`}
                >
                  {isClaimed ? "Claimed" : "Claim Now"}
                </Button>
              </div>
            </Card>
          );
        })}

        <Card className="bg-muted/50 border-border/50 p-4">
          <p className="text-sm text-center text-muted-foreground">
            Tasks reset every day at midnight. Check back tomorrow for more rewards!
          </p>
        </Card>
      </div>

      <FloatingActionButton />
    </div>
  );
};

export default Tasks;