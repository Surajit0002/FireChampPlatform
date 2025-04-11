import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReferralData } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  Share, 
  Copy, 
  Users, 
  Gift, 
  Medal, 
  CheckCircle2, 
  ClockIcon,
  Link as LinkIcon,
  User,
  ArrowRight,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Send
} from "lucide-react";

export default function ReferralPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState("");
  const [activeTab, setActiveTab] = useState("myReferral");
  
  // Fetch referral data
  const { data: referralData, isLoading } = useQuery<ReferralData>({
    queryKey: ["/api/referrals"],
    enabled: !!user,
  });
  
  // Apply referral code mutation
  const applyReferralMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest("POST", "/api/referrals/apply", { referralCode: code });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Referral applied",
        description: "Referral code applied successfully!",
      });
      setReferralCode("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to apply referral",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleCopyReferral = () => {
    if (!referralData) return;
    
    navigator.clipboard.writeText(referralData.referralCode)
      .then(() => {
        toast({
          title: "Copied!",
          description: "Referral code copied to clipboard",
        });
      })
      .catch(() => {
        toast({
          title: "Failed to copy",
          description: "Please try again or copy manually",
          variant: "destructive",
        });
      });
  };
  
  const handleCopyReferralLink = () => {
    if (!referralData) return;
    
    const referralLink = `${window.location.origin}/refer?code=${referralData.referralCode}`;
    navigator.clipboard.writeText(referralLink)
      .then(() => {
        toast({
          title: "Copied!",
          description: "Referral link copied to clipboard",
        });
      })
      .catch(() => {
        toast({
          title: "Failed to copy",
          description: "Please try again or copy manually",
          variant: "destructive",
        });
      });
  };
  
  const handleShareReferral = (platform: string) => {
    if (!referralData) return;
    
    const referralLink = `${window.location.origin}/refer?code=${referralData.referralCode}`;
    const message = `Join FireChamp and compete in Free Fire tournaments to win cash prizes! Use my referral code: ${referralData.referralCode}`;
    
    let shareUrl = "";
    
    switch (platform) {
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${message} ${referralLink}`)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(message)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${message} ${referralLink}`)}`;
        break;
      case "telegram":
        shareUrl = `https://telegram.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, "_blank");
  };
  
  const handleApplyReferral = () => {
    if (!referralCode) {
      toast({
        title: "Missing code",
        description: "Please enter a referral code",
        variant: "destructive",
      });
      return;
    }
    
    applyReferralMutation.mutate(referralCode);
  };
  
  // Check for referral code in URL (for when users click a shared link)
  useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      setReferralCode(code);
      setActiveTab("applyReferral");
    }
  });
  
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      
      <main className="flex-grow pt-16 md:pt-20 pb-20 md:pb-6">
        <div className="container mx-auto px-4 py-12">
          {/* Referral Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-primary-dark to-primary rounded-2xl p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="text-center md:text-left">
                  <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">Refer & Earn</h1>
                  <p className="text-slate-300 max-w-lg">
                    Invite your friends to join FireChamp and earn ₹50 for each friend who registers and plays their first tournament.
                  </p>
                </div>
                
                <div className="flex-shrink-0 bg-dark/20 backdrop-blur-sm rounded-xl p-5 text-center max-w-xs mx-auto md:mx-0">
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-3">
                    <Gift className="h-8 w-8 text-accent" />
                  </div>
                  <div className="text-2xl font-bold text-accent mb-1">₹50</div>
                  <p className="text-sm text-slate-300">per successful referral</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Referral Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-dark mb-6">
              <TabsTrigger value="myReferral" className="data-[state=active]:bg-primary">
                My Referral
              </TabsTrigger>
              <TabsTrigger value="applyReferral" className="data-[state=active]:bg-primary">
                Apply Referral
              </TabsTrigger>
              <TabsTrigger value="rewards" className="data-[state=active]:bg-primary">
                My Rewards
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="data-[state=active]:bg-primary">
                Referral Leaderboard
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="myReferral" className="space-y-6">
              <Card className="bg-dark border-slate-700">
                <CardHeader>
                  <CardTitle>My Referral Code</CardTitle>
                  <CardDescription>Share your referral code with friends to earn rewards</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isLoading ? (
                    <div className="animate-pulse space-y-4">
                      <div className="h-12 bg-slate-800 rounded-lg"></div>
                      <div className="h-12 bg-slate-800 rounded-lg"></div>
                      <div className="h-20 bg-slate-800 rounded-lg"></div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-slate-800 p-6 rounded-xl">
                        <p className="text-sm text-slate-400 mb-2">Your Referral Code</p>
                        <div className="flex items-center">
                          <div className="bg-slate-900 rounded-l-lg p-3 border-y border-l border-slate-700 flex-grow">
                            <p className="font-mono font-bold text-lg">{referralData?.referralCode || ""}</p>
                          </div>
                          <Button 
                            className="rounded-l-none"
                            onClick={handleCopyReferral}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                        </div>
                      </div>
                      
                      <div className="bg-slate-800 p-6 rounded-xl">
                        <p className="text-sm text-slate-400 mb-2">Your Referral Link</p>
                        <div className="flex items-center">
                          <div className="bg-slate-900 rounded-l-lg p-3 border-y border-l border-slate-700 flex-grow truncate">
                            <p className="font-mono text-sm">
                              {window.location.origin}/refer?code={referralData?.referralCode || ""}
                            </p>
                          </div>
                          <Button 
                            className="rounded-l-none"
                            onClick={handleCopyReferralLink}
                          >
                            <LinkIcon className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="font-medium">Share with friends via</h3>
                        <div className="flex flex-wrap gap-3">
                          <Button 
                            onClick={() => handleShareReferral("whatsapp")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-2" viewBox="0 0 16 16">
                              <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                            </svg>
                            WhatsApp
                          </Button>
                          <Button 
                            onClick={() => handleShareReferral("facebook")}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Facebook className="h-4 w-4 mr-2" />
                            Facebook
                          </Button>
                          <Button 
                            onClick={() => handleShareReferral("twitter")}
                            className="bg-sky-500 hover:bg-sky-600"
                          >
                            <Twitter className="h-4 w-4 mr-2" />
                            Twitter
                          </Button>
                          <Button 
                            onClick={() => handleShareReferral("telegram")}
                            className="bg-blue-500 hover:bg-blue-600"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Telegram
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card className="bg-dark border-slate-700">
                <CardHeader>
                  <CardTitle>How Referrals Work</CardTitle>
                  <CardDescription>Learn how to earn rewards through referrals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-800 p-6 rounded-xl">
                      <div className="rounded-full w-12 h-12 bg-primary/20 flex items-center justify-center mb-4">
                        <Share className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">Share Your Code</h3>
                      <p className="text-slate-400">
                        Share your unique referral code or link with your friends who play Free Fire.
                      </p>
                    </div>
                    
                    <div className="bg-slate-800 p-6 rounded-xl">
                      <div className="rounded-full w-12 h-12 bg-primary/20 flex items-center justify-center mb-4">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">Friends Register</h3>
                      <p className="text-slate-400">
                        Your friends register using your referral code and create their FireChamp account.
                      </p>
                    </div>
                    
                    <div className="bg-slate-800 p-6 rounded-xl">
                      <div className="rounded-full w-12 h-12 bg-accent/20 flex items-center justify-center mb-4">
                        <Gift className="h-6 w-6 text-accent" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">Earn Rewards</h3>
                      <p className="text-slate-400">
                        You earn ₹50 for each friend who joins and participates in their first tournament.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="applyReferral" className="space-y-6">
              <Card className="bg-dark border-slate-700">
                <CardHeader>
                  <CardTitle>Apply Referral Code</CardTitle>
                  <CardDescription>Enter a friend's referral code to get started</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-slate-800 p-6 rounded-xl">
                        <p className="text-sm text-slate-400 mb-2">Enter Referral Code</p>
                        <div className="flex items-center">
                          <Input
                            placeholder="Enter referral code"
                            className="bg-slate-900 border-slate-700 rounded-r-none"
                            value={referralCode}
                            onChange={(e) => setReferralCode(e.target.value)}
                          />
                          <Button 
                            className="rounded-l-none"
                            onClick={handleApplyReferral}
                            disabled={applyReferralMutation.isPending || !referralCode}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            {applyReferralMutation.isPending ? "Applying..." : "Apply"}
                          </Button>
                        </div>
                      </div>
                      
                      {user?.referredBy ? (
                        <div className="bg-green-600/20 border border-green-600/30 p-4 rounded-xl">
                          <div className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-green-500">Referral Code Applied</h4>
                              <p className="text-sm text-slate-300 mt-1">
                                You've already used a referral code to sign up.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-yellow-600/20 border border-yellow-600/30 p-4 rounded-xl">
                          <div className="flex items-start">
                            <ClockIcon className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-yellow-500">No Referral Applied</h4>
                              <p className="text-sm text-slate-300 mt-1">
                                You haven't applied any referral code yet. Enter a code to get started.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-slate-800 p-6 rounded-xl">
                      <h3 className="font-bold mb-4">Referral Benefits</h3>
                      <ul className="space-y-3 text-slate-300">
                        <li className="flex items-start">
                          <div className="bg-slate-700 flex items-center justify-center w-6 h-6 rounded-full mr-3 mt-0.5 shrink-0">
                            <span className="text-xs">1</span>
                          </div>
                          <p>Get rewarded when you use someone's referral code</p>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-slate-700 flex items-center justify-center w-6 h-6 rounded-full mr-3 mt-0.5 shrink-0">
                            <span className="text-xs">2</span>
                          </div>
                          <p>New users can apply a referral code to get a welcome bonus</p>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-slate-700 flex items-center justify-center w-6 h-6 rounded-full mr-3 mt-0.5 shrink-0">
                            <span className="text-xs">3</span>
                          </div>
                          <p>Both you and your friend earn rewards when a referral is successful</p>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-slate-700 flex items-center justify-center w-6 h-6 rounded-full mr-3 mt-0.5 shrink-0">
                            <span className="text-xs">4</span>
                          </div>
                          <p>Referral codes can only be applied once per account</p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="rewards" className="space-y-6">
              <Card className="bg-dark border-slate-700">
                <CardHeader>
                  <CardTitle>My Referral Rewards</CardTitle>
                  <CardDescription>Track your referral earnings and status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-800 p-4 rounded-xl text-center">
                      <div className="rounded-full w-12 h-12 bg-primary/20 flex items-center justify-center mx-auto mb-2">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold">{referralData?.referrals.length || 0}</h3>
                      <p className="text-sm text-slate-400">Total Referrals</p>
                    </div>
                    
                    <div className="bg-slate-800 p-4 rounded-xl text-center">
                      <div className="rounded-full w-12 h-12 bg-green-500/20 flex items-center justify-center mx-auto mb-2">
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      </div>
                      <h3 className="text-xl font-bold">
                        {referralData?.referrals.filter(r => r.status === "completed").length || 0}
                      </h3>
                      <p className="text-sm text-slate-400">Completed Referrals</p>
                    </div>
                    
                    <div className="bg-slate-800 p-4 rounded-xl text-center">
                      <div className="rounded-full w-12 h-12 bg-accent/20 flex items-center justify-center mx-auto mb-2">
                        <Gift className="h-6 w-6 text-accent" />
                      </div>
                      <h3 className="text-xl font-bold">
                        {formatCurrency(
                          (referralData?.referrals.filter(r => r.status === "completed") || [])
                            .reduce((sum, r) => sum + (r.reward || 0), 0)
                        )}
                      </h3>
                      <p className="text-sm text-slate-400">Total Earnings</p>
                    </div>
                  </div>
                  
                  {!isLoading && (!referralData || referralData.referrals.length === 0) ? (
                    <div className="bg-slate-800 rounded-xl p-8 text-center">
                      <Users className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                      <h3 className="font-bold text-lg mb-2">No Referrals Yet</h3>
                      <p className="text-slate-400 max-w-md mx-auto">
                        You haven't referred anyone yet. Share your referral code with friends to start earning rewards.
                      </p>
                      <Button 
                        className="mt-4"
                        onClick={() => setActiveTab("myReferral")}
                      >
                        Share My Code
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-slate-800 rounded-xl overflow-hidden">
                      <div className="grid grid-cols-3 gap-4 p-4 text-sm font-medium text-slate-400 border-b border-slate-700">
                        <div>Referred User</div>
                        <div>Status</div>
                        <div className="text-right">Reward</div>
                      </div>
                      
                      <div className="p-4 space-y-4">
                        {isLoading ? (
                          Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="animate-pulse h-10 bg-slate-700 rounded-lg"></div>
                          ))
                        ) : (
                          referralData?.referrals.map((referral, index) => (
                            <div 
                              key={referral.id || index}
                              className="grid grid-cols-3 gap-4 items-center py-2"
                            >
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-2">
                                  <AvatarFallback>
                                    {referral.referredId.toString().substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span>User {referral.referredId}</span>
                              </div>
                              <div>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  referral.status === "completed" 
                                    ? "bg-green-600/20 text-green-400" 
                                    : "bg-yellow-600/20 text-yellow-400"
                                }`}>
                                  {referral.status === "completed" ? "Completed" : "Pending"}
                                </span>
                              </div>
                              <div className="text-right font-medium text-accent">
                                {formatCurrency(referral.reward || 0)}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="bg-dark border-slate-700">
                <CardHeader>
                  <CardTitle>Referral Terms</CardTitle>
                  <CardDescription>Important information about the referral program</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-800 p-6 rounded-xl space-y-4">
                    <p className="text-slate-300">
                      The FireChamp referral program allows you to earn rewards by inviting friends to join the platform.
                      Here are the key terms:
                    </p>
                    
                    <ul className="space-y-3 text-slate-300">
                      <li className="flex items-start">
                        <div className="bg-slate-700 flex items-center justify-center w-6 h-6 rounded-full mr-3 mt-0.5 shrink-0">
                          <Globe className="h-4 w-4" />
                        </div>
                        <p>You earn ₹50 for each friend who signs up using your referral code and participates in at least one tournament.</p>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-slate-700 flex items-center justify-center w-6 h-6 rounded-full mr-3 mt-0.5 shrink-0">
                          <Globe className="h-4 w-4" />
                        </div>
                        <p>Your friend must enter your referral code during registration or apply it within 7 days of creating their account.</p>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-slate-700 flex items-center justify-center w-6 h-6 rounded-full mr-3 mt-0.5 shrink-0">
                          <Globe className="h-4 w-4" />
                        </div>
                        <p>Rewards are credited to your wallet automatically once your friend completes their first tournament.</p>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-slate-700 flex items-center justify-center w-6 h-6 rounded-full mr-3 mt-0.5 shrink-0">
                          <Globe className="h-4 w-4" />
                        </div>
                        <p>FireChamp reserves the right to modify the referral program terms at any time.</p>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="leaderboard" className="space-y-6">
              <Card className="bg-dark border-slate-700">
                <CardHeader>
                  <CardTitle>Referral Leaderboard</CardTitle>
                  <CardDescription>Top referrers on FireChamp this month</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Top 3 Referrers */}
                  <div className="flex flex-col md:flex-row items-center justify-center p-8 bg-gradient-to-r from-primary-dark to-primary relative rounded-2xl mb-8">
                    {/* 2nd Place */}
                    <motion.div 
                      className="flex flex-col items-center md:order-1 mb-8 md:mb-0"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white">
                          <Avatar className="w-full h-full">
                            <AvatarFallback className="text-2xl bg-slate-700">TC</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-accent text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center">2</div>
                      </div>
                      <p className="mt-4 font-medium text-lg">TopChamp</p>
                      <p className="text-xs text-slate-300">18 Referrals</p>
                    </motion.div>
                    
                    {/* 1st Place */}
                    <motion.div 
                      className="flex flex-col items-center md:order-2 relative mb-8 md:mb-0 md:mx-10 transform md:scale-110"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-12 h-12">
                        <Medal className="h-full w-full text-yellow-400" />
                      </div>
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-yellow-400">
                          <Avatar className="w-full h-full">
                            <AvatarFallback className="text-3xl bg-yellow-600">FK</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-dark text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center">1</div>
                      </div>
                      <p className="mt-4 font-medium text-lg">FireKing</p>
                      <p className="text-xs text-slate-300">25 Referrals</p>
                    </motion.div>
                    
                    {/* 3rd Place */}
                    <motion.div 
                      className="flex flex-col items-center md:order-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white">
                          <Avatar className="w-full h-full">
                            <AvatarFallback className="text-2xl bg-amber-800">NS</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-accent text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center">3</div>
                      </div>
                      <p className="mt-4 font-medium text-lg">NinjaSlayer</p>
                      <p className="text-xs text-slate-300">14 Referrals</p>
                    </motion.div>
                  </div>
                  
                  {/* Leaderboard Table */}
                  <div className="bg-slate-800 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-4 gap-4 p-4 text-sm font-medium text-slate-400 border-b border-slate-700">
                      <div>Rank</div>
                      <div>Player</div>
                      <div>Referrals</div>
                      <div className="text-right">Earnings</div>
                    </div>
                    
                    <div className="p-4 space-y-4">
                      {Array.from({ length: 7 }).map((_, index) => {
                        const rank = index + 4; // Start from rank 4 since top 3 are shown above
                        const referrals = 14 - index;
                        const earnings = referrals * 50;
                        
                        // Highlight the current user (let's assume rank 6 for this example)
                        const isCurrentUser = rank === 6;
                        
                        return (
                          <div 
                            key={index}
                            className={`grid grid-cols-4 gap-4 items-center py-2 px-3 rounded-lg ${
                              isCurrentUser ? "bg-primary/10 border border-primary/30" : ""
                            }`}
                          >
                            <div className="font-medium">{rank}</div>
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarFallback>
                                  {`P${rank}`.substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <span>
                                Player{rank}
                                {isCurrentUser && (
                                  <span className="ml-2 text-xs text-primary">(You)</span>
                                )}
                              </span>
                            </div>
                            <div>{referrals}</div>
                            <div className="text-right font-medium text-accent">
                              {formatCurrency(earnings)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="bg-slate-800 p-6 rounded-xl mt-6">
                    <h3 className="font-bold mb-4">Referral Contest</h3>
                    <p className="text-slate-300 mb-4">
                      The top 3 referrers each month will receive special prizes in addition to their regular referral earnings:
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-dark font-bold mr-3">1</div>
                          <span>1st Place</span>
                        </div>
                        <span className="font-bold text-accent">{formatCurrency(1000)}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-dark font-bold mr-3">2</div>
                          <span>2nd Place</span>
                        </div>
                        <span className="font-bold text-accent">{formatCurrency(500)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-dark font-bold mr-3">3</div>
                          <span>3rd Place</span>
                        </div>
                        <span className="font-bold text-accent">{formatCurrency(250)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-xl">
                      <div className="flex">
                        <ArrowRight className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                        <p className="text-sm">
                          Contest resets on the 1st of each month. Invite more friends to climb the leaderboard and win big!
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <AppFooter />
    </div>
  );
}
