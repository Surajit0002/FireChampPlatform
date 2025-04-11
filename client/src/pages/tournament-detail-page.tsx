import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Tournament, TournamentParticipant } from "@shared/schema";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { WalletData } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Trophy, 
  Users, 
  Shield, 
  Swords, 
  Skull, 
  AlertCircle, 
  Info, 
  ArrowLeft,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function TournamentDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const tournamentId = parseInt(id);
  
  const [activeTab, setActiveTab] = useState("overview");
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  
  // Fetch tournament details
  const { data: tournament, isLoading: isLoadingTournament } = useQuery<Tournament>({
    queryKey: [`/api/tournaments/${tournamentId}`],
    enabled: !isNaN(tournamentId),
  });
  
  // Fetch tournament participants
  const { data: participants = [], isLoading: isLoadingParticipants } = useQuery<TournamentParticipant[]>({
    queryKey: [`/api/tournaments/${tournamentId}/participants`],
    enabled: !isNaN(tournamentId),
  });
  
  // Fetch wallet if user is logged in
  const { data: walletData } = useQuery<WalletData>({
    queryKey: ["/api/wallet"],
    enabled: !!user,
  });
  
  // Check if user has already joined this tournament
  const hasJoined = user && participants.some(p => p.userId === user.id);
  
  // Join tournament mutation
  const joinMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/tournaments/${tournamentId}/join`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${tournamentId}/participants`] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      toast({
        title: "Success",
        description: "You have successfully joined the tournament",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to join tournament",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Withdraw from tournament mutation
  const withdrawMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/tournaments/${tournamentId}/withdraw`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${tournamentId}/participants`] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      toast({
        title: "Success",
        description: "You have successfully withdrawn from the tournament",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to withdraw",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleJoinTournament = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to join tournaments",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    if (!tournament) return;
    
    // Check if user has enough balance
    if (walletData && walletData.balance < tournament.entryFee) {
      toast({
        title: "Insufficient balance",
        description: `You need ${formatCurrency(tournament.entryFee)} to join this tournament. Please add funds to your wallet.`,
        variant: "destructive",
      });
      navigate("/wallet");
      return;
    }
    
    joinMutation.mutate();
  };
  
  const handleWithdrawTournament = () => {
    if (!hasJoined) return;
    
    withdrawMutation.mutate();
  };
  
  if (isLoadingTournament) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow pt-16 md:pt-20 pb-20 md:pb-6">
          <div className="container mx-auto px-4 py-12">
            <div className="animate-pulse bg-dark rounded-2xl h-96"></div>
          </div>
        </main>
        <AppFooter />
      </div>
    );
  }
  
  if (!tournament) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow pt-16 md:pt-20 pb-20 md:pb-6">
          <div className="container mx-auto px-4 py-12">
            <div className="bg-dark rounded-2xl p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h1 className="font-heading text-2xl font-bold mb-4">Tournament Not Found</h1>
              <p className="text-slate-400 mb-6">
                The tournament you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <a href="/tournaments">Go Back to Tournaments</a>
              </Button>
            </div>
          </div>
        </main>
        <AppFooter />
      </div>
    );
  }
  
  const participantsCount = participants.length;
  const slotsRemaining = tournament.maxPlayers - participantsCount;
  const startDate = new Date(tournament.startTime);
  const isUpcoming = tournament.status === "upcoming";
  const isOngoing = tournament.status === "ongoing";
  const isCompleted = tournament.status === "completed";
  
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      
      <main className="flex-grow pt-16 md:pt-20 pb-20 md:pb-6">
        <div className="container mx-auto px-4 py-12">
          {/* Back button */}
          <Button
            variant="ghost"
            className="mb-6 pl-0 hover:pl-0"
            onClick={() => navigate("/tournaments")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tournaments
          </Button>
          
          {/* Tournament header */}
          <div className="relative rounded-2xl overflow-hidden mb-8">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 z-0"></div>
            
            {/* Content */}
            <div className="relative z-10 p-8 md:p-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                      isUpcoming 
                        ? "bg-green-600" 
                        : isOngoing 
                        ? "bg-accent" 
                        : "bg-slate-600"
                    }`}>
                      {tournament.status.toUpperCase()}
                    </span>
                    <span className="bg-dark-light rounded-lg py-1 px-2 text-xs font-medium">
                      {tournament.mode.toUpperCase()}
                    </span>
                  </div>
                  
                  <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
                    {tournament.name}
                  </h1>
                  
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center text-sm text-slate-300">
                      <Calendar className="mr-1 h-4 w-4" />
                      {formatDateTime(tournament.startTime)}
                    </div>
                    <div className="flex items-center text-sm text-slate-300">
                      <MapPin className="mr-1 h-4 w-4" />
                      {tournament.map}
                    </div>
                    <div className="flex items-center text-sm text-slate-300">
                      <Users className="mr-1 h-4 w-4" />
                      {participantsCount}/{tournament.maxPlayers} Players
                    </div>
                  </div>
                </div>
                
                {isUpcoming && (
                  <div className="shrink-0 bg-dark/50 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-sm text-slate-300 mb-1">Tournament starts in:</div>
                    <div className="text-xl font-bold">
                      <CountdownTimer 
                        targetDate={startDate}
                        showIcon={false}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Tournament content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              {/* Tournament info cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-dark border-slate-700">
                  <CardContent className="p-4">
                    <p className="text-xs text-slate-400 mb-1">Prize Pool</p>
                    <p className="text-xl font-bold text-accent">{formatCurrency(tournament.prizePool)}</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-dark border-slate-700">
                  <CardContent className="p-4">
                    <p className="text-xs text-slate-400 mb-1">Entry Fee</p>
                    <p className="text-xl font-bold">{formatCurrency(tournament.entryFee)}</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-dark border-slate-700">
                  <CardContent className="p-4">
                    <p className="text-xs text-slate-400 mb-1">Per Kill</p>
                    <p className="text-xl font-bold">
                      {tournament.perKillReward ? formatCurrency(tournament.perKillReward) : "N/A"}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-dark border-slate-700">
                  <CardContent className="p-4">
                    <p className="text-xs text-slate-400 mb-1">Mode</p>
                    <p className="text-xl font-bold">{tournament.mode}</p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Tournament tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-dark w-full justify-start mb-6 overflow-x-auto">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="rules">Rules</TabsTrigger>
                  <TabsTrigger value="prizes">Prizes</TabsTrigger>
                  <TabsTrigger value="players">Players</TabsTrigger>
                  {isCompleted && <TabsTrigger value="results">Results</TabsTrigger>}
                </TabsList>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    <TabsContent value="overview" className="m-0">
                      <Card className="bg-dark border-slate-700">
                        <CardContent className="p-6">
                          <h3 className="font-heading text-xl font-bold mb-4">Tournament Details</h3>
                          
                          <div className="space-y-4 text-slate-300">
                            <p>{tournament.description || "Join this exciting Free Fire tournament and battle for glory and prizes!"}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                              <div>
                                <h4 className="font-bold mb-3">Match Details</h4>
                                <ul className="space-y-3">
                                  <li className="flex items-start">
                                    <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Map: {tournament.map}</span>
                                  </li>
                                  <li className="flex items-start">
                                    <Users className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Mode: {tournament.mode}</span>
                                  </li>
                                  <li className="flex items-start">
                                    <Clock className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Start Time: {formatDateTime(tournament.startTime)}</span>
                                  </li>
                                  <li className="flex items-start">
                                    <Swords className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Match Type: Battle Royale</span>
                                  </li>
                                </ul>
                              </div>
                              
                              <div>
                                <h4 className="font-bold mb-3">Requirements</h4>
                                <ul className="space-y-3">
                                  <li className="flex items-start">
                                    <Shield className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Valid Free Fire ID required</span>
                                  </li>
                                  <li className="flex items-start">
                                    <Info className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Players must be ready 15 minutes before start time</span>
                                  </li>
                                  <li className="flex items-start">
                                    <AlertCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Screenshots may be required for verification</span>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          
                          {(isOngoing || isCompleted) && tournament.roomId && (
                            <div className="mt-8 p-4 bg-primary/10 rounded-xl border border-primary/30">
                              <h4 className="font-bold mb-2 flex items-center">
                                <Info className="h-5 w-5 mr-2" />
                                Room Details
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-slate-400">Room ID</p>
                                  <p className="font-medium">{tournament.roomId}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-slate-400">Password</p>
                                  <p className="font-medium">{tournament.roomPassword || "No password required"}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="rules" className="m-0">
                      <Card className="bg-dark border-slate-700">
                        <CardContent className="p-6">
                          <h3 className="font-heading text-xl font-bold mb-4">Tournament Rules</h3>
                          
                          <div className="space-y-4 text-slate-300">
                            {tournament.rules ? (
                              <p>{tournament.rules}</p>
                            ) : (
                              <>
                                <h4 className="font-bold">General Rules</h4>
                                <ul className="list-disc list-inside space-y-2 ml-2">
                                  <li>Players must use their registered Free Fire ID to participate.</li>
                                  <li>Teaming with other players outside your squad is not allowed.</li>
                                  <li>Hacking, glitching, or using any unauthorized software is strictly prohibited.</li>
                                  <li>Players must be present in the room at least 5 minutes before the match starts.</li>
                                  <li>Match results are final and determined by the tournament organizers.</li>
                                </ul>
                                
                                <h4 className="font-bold mt-6">Scoring System</h4>
                                <ul className="list-disc list-inside space-y-2 ml-2">
                                  <li>Placement Points:
                                    <ul className="list-disc list-inside ml-6">
                                      <li>1st Place: 20 points</li>
                                      <li>2nd Place: 14 points</li>
                                      <li>3rd Place: 10 points</li>
                                      <li>4th-10th Place: 7-1 points (decreasing)</li>
                                    </ul>
                                  </li>
                                  <li>Each kill is worth {tournament.perKillReward ? formatCurrency(tournament.perKillReward) : "1 point"}.</li>
                                  <li>The total score is calculated as the sum of placement points and kill points.</li>
                                </ul>
                                
                                <h4 className="font-bold mt-6">Disqualification</h4>
                                <p>Players can be disqualified for any of the following reasons:</p>
                                <ul className="list-disc list-inside space-y-2 ml-2">
                                  <li>Using hacks or unauthorized tools</li>
                                  <li>Teaming with players outside your squad</li>
                                  <li>Harassing other players</li>
                                  <li>Not following the tournament rules</li>
                                  <li>Being absent at the match start time</li>
                                </ul>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="prizes" className="m-0">
                      <Card className="bg-dark border-slate-700">
                        <CardContent className="p-6">
                          <h3 className="font-heading text-xl font-bold mb-4">Prize Distribution</h3>
                          
                          <div className="text-slate-300">
                            <p className="mb-6">
                              Total Prize Pool: <span className="font-bold text-accent">{formatCurrency(tournament.prizePool)}</span>
                            </p>
                            
                            <ul className="space-y-4">
                              <li className="flex items-center justify-between pb-3 border-b border-slate-700">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-dark font-bold mr-3">1</div>
                                  <span>1st Place</span>
                                </div>
                                <span className="font-bold text-accent">{formatCurrency(tournament.prizePool * 0.45)}</span>
                              </li>
                              
                              <li className="flex items-center justify-between pb-3 border-b border-slate-700">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-dark font-bold mr-3">2</div>
                                  <span>2nd Place</span>
                                </div>
                                <span className="font-bold text-accent">{formatCurrency(tournament.prizePool * 0.25)}</span>
                              </li>
                              
                              <li className="flex items-center justify-between pb-3 border-b border-slate-700">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-dark font-bold mr-3">3</div>
                                  <span>3rd Place</span>
                                </div>
                                <span className="font-bold text-accent">{formatCurrency(tournament.prizePool * 0.15)}</span>
                              </li>
                              
                              <li className="flex items-center justify-between pb-3 border-b border-slate-700">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full bg-dark-light flex items-center justify-center text-white font-bold mr-3">4</div>
                                  <span>4th Place</span>
                                </div>
                                <span className="font-bold text-accent">{formatCurrency(tournament.prizePool * 0.08)}</span>
                              </li>
                              
                              <li className="flex items-center justify-between pb-3 border-b border-slate-700">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full bg-dark-light flex items-center justify-center text-white font-bold mr-3">5</div>
                                  <span>5th Place</span>
                                </div>
                                <span className="font-bold text-accent">{formatCurrency(tournament.prizePool * 0.05)}</span>
                              </li>
                              
                              {tournament.perKillReward && (
                                <li className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-dark flex items-center justify-center text-white font-bold mr-3">
                                      <Skull className="h-4 w-4" />
                                    </div>
                                    <span>Per Kill Reward</span>
                                  </div>
                                  <span className="font-bold text-accent">{formatCurrency(tournament.perKillReward)}</span>
                                </li>
                              )}
                            </ul>
                            
                            <div className="mt-6 p-4 bg-slate-800/50 rounded-xl">
                              <h4 className="font-medium mb-2 flex items-center">
                                <Info className="h-4 w-4 mr-2" />
                                Prize Claiming
                              </h4>
                              <p className="text-sm text-slate-400">
                                Prizes will be automatically credited to the winners' wallets after the tournament results are finalized. 
                                Winners can withdraw their earnings from the wallet section.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="players" className="m-0">
                      <Card className="bg-dark border-slate-700">
                        <CardContent className="p-6">
                          <h3 className="font-heading text-xl font-bold mb-4">Registered Players</h3>
                          
                          {isLoadingParticipants ? (
                            <div className="animate-pulse space-y-4">
                              {Array.from({ length: 5 }).map((_, index) => (
                                <div key={index} className="h-12 bg-slate-800 rounded-lg"></div>
                              ))}
                            </div>
                          ) : participants.length === 0 ? (
                            <div className="text-center py-8">
                              <Users className="h-10 w-10 text-slate-500 mx-auto mb-4" />
                              <p className="text-slate-400">No players have registered for this tournament yet.</p>
                              {user && !hasJoined && isUpcoming && (
                                <Button onClick={handleJoinTournament} className="mt-4">
                                  Be the First to Join
                                </Button>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex justify-between text-sm text-slate-400 px-4">
                                <span>Player</span>
                                <span>Status</span>
                              </div>
                              
                              {participants.map((participant) => (
                                <div 
                                  key={participant.id}
                                  className={`flex items-center justify-between p-3 rounded-lg ${
                                    user && participant.userId === user.id 
                                      ? "bg-primary/10 border border-primary/30" 
                                      : "bg-slate-800"
                                  }`}
                                >
                                  <div className="flex items-center">
                                    <Avatar className="h-8 w-8 mr-3">
                                      <AvatarImage src="" alt="Player" />
                                      <AvatarFallback className="bg-primary text-xs">
                                        {participant.userId.toString().substring(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>
                                      Player {participant.userId}
                                      {user && participant.userId === user.id && (
                                        <span className="ml-2 text-xs text-primary">(You)</span>
                                      )}
                                    </span>
                                  </div>
                                  <span className={`text-sm px-2 py-1 rounded ${
                                    participant.status === "registered" 
                                      ? "bg-green-600/20 text-green-400" 
                                      : participant.status === "played" 
                                      ? "bg-blue-600/20 text-blue-400" 
                                      : "bg-yellow-600/20 text-yellow-400"
                                  }`}>
                                    {participant.status.charAt(0).toUpperCase() + participant.status.slice(1)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {isCompleted && (
                      <TabsContent value="results" className="m-0">
                        <Card className="bg-dark border-slate-700">
                          <CardContent className="p-6">
                            <h3 className="font-heading text-xl font-bold mb-4">Tournament Results</h3>
                            
                            <div className="text-slate-300">
                              {/* Would show results here if they were available */}
                              <div className="text-center py-8">
                                <Trophy className="h-10 w-10 text-yellow-400 mx-auto mb-4" />
                                <p className="text-slate-400">The results for this tournament are being processed.</p>
                                <p className="text-slate-500 text-sm mt-2">Check back soon for final standings.</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    )}
                  </motion.div>
                </AnimatePresence>
              </Tabs>
            </div>
            
            {/* Sidebar */}
            <div>
              {/* Registration card */}
              <Card className="bg-dark border-slate-700 sticky top-24">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-lg">Registration</h4>
                      <div className={`text-xs px-2 py-1 rounded ${
                        isUpcoming 
                          ? "bg-green-600" 
                          : isOngoing 
                          ? "bg-accent" 
                          : "bg-slate-600"
                      }`}>
                        {tournament.status.toUpperCase()}
                      </div>
                    </div>
                    <p className="text-sm text-slate-400">
                      {isUpcoming 
                        ? "Tournament starts in:" 
                        : isOngoing 
                        ? "Tournament is live!" 
                        : "Tournament has ended"}
                    </p>
                  </div>
                  
                  {/* Countdown Timer */}
                  {isUpcoming && (
                    <div className="grid grid-cols-4 gap-2 mb-6">
                      <div className="bg-slate-800 rounded-lg p-2 text-center">
                        <div 
                          className="text-xl font-bold"
                          id="days"
                        >
                          {Math.floor((new Date(tournament.startTime).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                        </div>
                        <div className="text-xs text-slate-400">Days</div>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-2 text-center">
                        <div 
                          className="text-xl font-bold"
                          id="hours"
                        >
                          {Math.floor(((new Date(tournament.startTime).getTime() - new Date().getTime()) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}
                        </div>
                        <div className="text-xs text-slate-400">Hours</div>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-2 text-center">
                        <div 
                          className="text-xl font-bold"
                          id="minutes"
                        >
                          {Math.floor(((new Date(tournament.startTime).getTime() - new Date().getTime()) % (1000 * 60 * 60)) / (1000 * 60))}
                        </div>
                        <div className="text-xs text-slate-400">Mins</div>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-2 text-center">
                        <div 
                          className="text-xl font-bold"
                          id="seconds"
                        >
                          {Math.floor(((new Date(tournament.startTime).getTime() - new Date().getTime()) % (1000 * 60)) / 1000)}
                        </div>
                        <div className="text-xs text-slate-400">Secs</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Slots Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-slate-400">
                        {slotsRemaining} {slotsRemaining === 1 ? "slot" : "slots"} remaining
                      </span>
                      <span className="text-xs font-medium">
                        {participantsCount}/{tournament.maxPlayers}
                      </span>
                    </div>
                    <ProgressBar 
                      value={participantsCount} 
                      max={tournament.maxPlayers}
                      className="h-2 bg-slate-700"
                      fillClassName="bg-primary"
                    />
                  </div>
                  
                  {/* Action buttons */}
                  {isUpcoming ? (
                    hasJoined ? (
                      <Button 
                        variant="outline" 
                        className="w-full mb-4"
                        onClick={handleWithdrawTournament}
                        disabled={withdrawMutation.isPending}
                      >
                        {withdrawMutation.isPending ? "Processing..." : "Withdraw from Tournament"}
                      </Button>
                    ) : (
                      <Button 
                        className="w-full bg-accent hover:bg-accent-dark mb-4"
                        onClick={handleJoinTournament}
                        disabled={
                          joinMutation.isPending || 
                          participantsCount >= tournament.maxPlayers
                        }
                      >
                        {joinMutation.isPending 
                          ? "Processing..." 
                          : participantsCount >= tournament.maxPlayers 
                          ? "Tournament Full" 
                          : `Join Tournament • ${formatCurrency(tournament.entryFee)}`}
                      </Button>
                    )
                  ) : isOngoing ? (
                    hasJoined ? (
                      <Button 
                        className="w-full bg-primary hover:bg-primary-light mb-4"
                      >
                        Enter Match Room
                      </Button>
                    ) : (
                      <Button 
                        variant="secondary" 
                        className="w-full mb-4"
                        disabled
                      >
                        Registration Closed
                      </Button>
                    )
                  ) : (
                    <Button 
                      variant="secondary" 
                      className="w-full mb-4"
                      disabled
                    >
                      Tournament Ended
                    </Button>
                  )}
                  
                  <p className="text-xs text-slate-400 text-center">
                    {isUpcoming 
                      ? "Room details will be revealed 15 minutes before the match" 
                      : isOngoing && hasJoined 
                      ? "Use the room ID and password to join the match" 
                      : "Thanks for your interest in this tournament"}
                  </p>
                  
                  {/* Organizer info (sample) */}
                  <div className="mt-6 pt-6 border-t border-slate-700">
                    <div className="flex items-center">
                      <User className="h-5 w-5 mr-2 text-slate-400" />
                      <span className="text-sm">Organized by FireChamp</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <AppFooter />
    </div>
  );
}
