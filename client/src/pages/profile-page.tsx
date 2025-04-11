import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TournamentParticipant } from "@shared/schema";
import { WalletData } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Mail, 
  Phone, 
  Gamepad2, 
  History, 
  Trophy, 
  Skull, 
  Medal,
  Camera,
  Save,
  BarChart
} from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile form data
  const [profileData, setProfileData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
    gameUid: user?.gameUid || ""
  });
  
  // Fetch wallet data
  const { data: walletData } = useQuery<WalletData>({
    queryKey: ["/api/wallet"],
    enabled: !!user,
  });
  
  // Fetch user's tournament participations
  const { data: tournaments = [] } = useQuery<TournamentParticipant[]>({
    queryKey: ["/api/tournaments/participations"],
    enabled: !!user,
    // In this mock, we'll simulate the API response
    queryFn: async () => {
      // This is a simulated response, in the real app this would come from the API
      return [];
    },
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      const res = await apiRequest("PATCH", "/api/user", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleProfileUpdate = () => {
    updateProfileMutation.mutate(profileData);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };
  
  if (!user) {
    return null; // Protected route will handle the redirect
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      
      <main className="flex-grow pt-16 md:pt-20 pb-20 md:pb-6">
        <div className="container mx-auto px-4 py-12">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-primary">
                  <AvatarFallback className="text-4xl">
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="icon" 
                  className="absolute bottom-0 right-0 rounded-full bg-accent hover:bg-accent-dark"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-center md:text-left">
                <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">{user.username}</h1>
                <p className="text-slate-400 mb-4">{user.gameUid ? `Free Fire ID: ${user.gameUid}` : "Free Fire ID not set"}</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="bg-dark p-3 rounded-lg min-w-24 text-center">
                    <p className="text-sm text-slate-400">Balance</p>
                    <p className="font-bold text-accent">{walletData ? formatCurrency(walletData.balance) : "Loading..."}</p>
                  </div>
                  
                  <div className="bg-dark p-3 rounded-lg min-w-24 text-center">
                    <p className="text-sm text-slate-400">Coins</p>
                    <p className="font-bold">{walletData ? walletData.coins : "Loading..."}</p>
                  </div>
                  
                  <div className="bg-dark p-3 rounded-lg min-w-24 text-center">
                    <p className="text-sm text-slate-400">Tournaments</p>
                    <p className="font-bold">{tournaments.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Profile Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-dark mb-6">
              <TabsTrigger value="profile" className="data-[state=active]:bg-primary">
                Profile
              </TabsTrigger>
              <TabsTrigger value="stats" className="data-[state=active]:bg-primary">
                Stats
              </TabsTrigger>
              <TabsTrigger value="tournaments" className="data-[state=active]:bg-primary">
                Tournaments
              </TabsTrigger>
              <TabsTrigger value="achievements" className="data-[state=active]:bg-primary">
                Achievements
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6">
              <Card className="bg-dark border-slate-700">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                          id="username"
                          name="username"
                          placeholder="Enter your username"
                          className="bg-slate-800 pl-10 border-slate-700"
                          value={profileData.username}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          className="bg-slate-800 pl-10 border-slate-700"
                          value={profileData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                          id="phone"
                          name="phone"
                          placeholder="Enter your phone number"
                          className="bg-slate-800 pl-10 border-slate-700"
                          value={profileData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gameUid">Free Fire UID</Label>
                      <div className="relative">
                        <Gamepad2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                          id="gameUid"
                          name="gameUid"
                          placeholder="Enter your Free Fire UID"
                          className="bg-slate-800 pl-10 border-slate-700"
                          value={profileData.gameUid}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      className="gap-2" 
                      onClick={handleProfileUpdate}
                      disabled={updateProfileMutation.isPending}
                    >
                      <Save className="h-4 w-4" />
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-dark border-slate-700">
                <CardHeader>
                  <CardTitle>Account Security</CardTitle>
                  <CardDescription>Manage your password and account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="Enter your current password"
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Enter your new password"
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your new password"
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button variant="outline">Change Password</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="stats" className="space-y-6">
              <Card className="bg-dark border-slate-700">
                <CardHeader>
                  <CardTitle>Performance Stats</CardTitle>
                  <CardDescription>Your gaming performance statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-800 p-4 rounded-xl text-center">
                      <div className="rounded-full w-12 h-12 bg-primary/20 flex items-center justify-center mx-auto mb-2">
                        <Trophy className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold">0</h3>
                      <p className="text-sm text-slate-400">Tournaments Won</p>
                    </div>
                    
                    <div className="bg-slate-800 p-4 rounded-xl text-center">
                      <div className="rounded-full w-12 h-12 bg-accent/20 flex items-center justify-center mx-auto mb-2">
                        <Skull className="h-6 w-6 text-accent" />
                      </div>
                      <h3 className="text-xl font-bold">0</h3>
                      <p className="text-sm text-slate-400">Total Kills</p>
                    </div>
                    
                    <div className="bg-slate-800 p-4 rounded-xl text-center">
                      <div className="rounded-full w-12 h-12 bg-green-500/20 flex items-center justify-center mx-auto mb-2">
                        <Medal className="h-6 w-6 text-green-500" />
                      </div>
                      <h3 className="text-xl font-bold">0</h3>
                      <p className="text-sm text-slate-400">Top 3 Finishes</p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-800 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-lg">Recent Performance</h3>
                      <div className="flex items-center text-sm text-slate-400">
                        <BarChart className="h-4 w-4 mr-1" />
                        Last 10 matches
                      </div>
                    </div>
                    
                    <div className="h-64 flex items-center justify-center">
                      <p className="text-slate-400">No match data available yet</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tournaments" className="space-y-6">
              <Card className="bg-dark border-slate-700">
                <CardHeader>
                  <CardTitle>Tournament History</CardTitle>
                  <CardDescription>Your tournament participation history</CardDescription>
                </CardHeader>
                <CardContent>
                  {tournaments.length === 0 ? (
                    <div className="bg-slate-800 rounded-xl p-8 text-center">
                      <History className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                      <h3 className="font-bold text-lg mb-2">No Tournament History</h3>
                      <p className="text-slate-400 max-w-md mx-auto">
                        You haven't participated in any tournaments yet. Join a tournament to see your match history here.
                      </p>
                      <Button className="mt-4" asChild>
                        <a href="/tournaments">Browse Tournaments</a>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Here would be the tournament history display */}
                      <p>Tournament history would be displayed here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="achievements" className="space-y-6">
              <Card className="bg-dark border-slate-700">
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                  <CardDescription>Your earned achievements and badges</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-800 rounded-xl p-8 text-center">
                    <Trophy className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                    <h3 className="font-bold text-lg mb-2">No Achievements Yet</h3>
                    <p className="text-slate-400 max-w-md mx-auto">
                      You haven't earned any achievements yet. Participate in tournaments and win matches to earn achievements.
                    </p>
                    <Button className="mt-4" asChild>
                      <a href="/tournaments">Join Tournaments</a>
                    </Button>
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
