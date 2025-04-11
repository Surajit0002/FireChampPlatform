import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Tournament } from "@shared/schema";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { TournamentCard } from "@/components/ui/tournament-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { WalletData } from "@/types";
import { WalletModal } from "@/components/ui/wallet-modal";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Clock, Share, Trophy, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [mode, setMode] = useState<string>("all");
  
  // Fetch tournaments
  const { data: tournaments = [], isLoading: isLoadingTournaments } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments"],
  });
  
  // Fetch wallet if user is logged in
  const { data: walletData } = useQuery<WalletData>({
    queryKey: ["/api/wallet"],
    enabled: !!user,
  });
  
  // Filter tournaments by mode
  const filteredTournaments = tournaments.filter(tournament => {
    if (mode === "all") return true;
    return tournament.mode.toLowerCase() === mode.toLowerCase();
  });
  
  // Featured tournament (first one or random)
  const featuredTournament = tournaments.length > 0 ? tournaments[0] : null;
  
  // Handler for joining tournament
  const handleJoinTournament = (id: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to join tournaments",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    navigate(`/tournaments/${id}`);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      
      <main className="flex-grow pt-16 md:pt-20 pb-20 md:pb-6">
        {/* Hero Section */}
        <section className="relative h-[80vh] md:h-[70vh] flex items-center overflow-hidden">
          {/* Background gradient and overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-dark to-black z-0"></div>
          <div className="absolute inset-0 bg-black opacity-40 z-10"></div>
          
          {/* Background pattern instead of image */}
          <div className="absolute inset-0 z-5 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(#1E40AF_1px,transparent_1px)] [background-size:20px_20px]"></div>
          </div>
          
          {/* Content */}
          <div className="container mx-auto px-4 relative z-20">
            <motion.div 
              className="max-w-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-shadow">
                Compete. Win. <span className="text-accent">Earn.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-300 mb-8">
                Join Free Fire tournaments, showcase your skills, and win cash prizes, diamonds & exclusive gear.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button asChild size="lg" className="bg-accent hover:bg-accent-dark text-white font-medium rounded-xl shadow-lg hover:shadow-accent/30">
                  <Link href="/tournaments">
                    Join Tournament
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white/30 hover:border-white/50 text-white font-medium rounded-xl backdrop-blur-sm">
                  <a href="#how-it-works">
                    How It Works
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
          
          {/* Floating tournament card */}
          {featuredTournament && (
            <motion.div 
              className="absolute bottom-8 right-4 md:right-12 lg:right-24 w-64 md:w-72 z-20 hidden md:block"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <TournamentCard tournament={featuredTournament} featured={true} onJoin={handleJoinTournament} />
            </motion.div>
          )}
        </section>
        
        {/* Featured Tournaments */}
        <section id="tournaments" className="py-12 px-4">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-heading text-2xl md:text-3xl font-bold">Featured Tournaments</h2>
              <Link href="/tournaments" className="text-primary font-medium text-sm flex items-center hover:text-primary-light transition-colors">
                View All
                <ArrowRight className="h-5 w-5 ml-1" />
              </Link>
            </div>
            
            {/* Tournament Filters */}
            <div className="flex items-center space-x-3 mb-6 overflow-x-auto pb-2">
              <Tabs value={mode} onValueChange={setMode} className="w-full">
                <TabsList className="bg-dark inline-flex h-auto p-1 gap-1">
                  <TabsTrigger 
                    value="all" 
                    className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2"
                  >
                    All Modes
                  </TabsTrigger>
                  <TabsTrigger 
                    value="solo" 
                    className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2"
                  >
                    Solo
                  </TabsTrigger>
                  <TabsTrigger 
                    value="duo" 
                    className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2"
                  >
                    Duo
                  </TabsTrigger>
                  <TabsTrigger 
                    value="squad" 
                    className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2"
                  >
                    Squad
                  </TabsTrigger>
                  <TabsTrigger 
                    value="free" 
                    className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2"
                  >
                    Free Entry
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {/* Tournament Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {isLoadingTournaments ? (
                  // Loading skeletons
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="bg-dark rounded-2xl h-96 animate-pulse" />
                  ))
                ) : filteredTournaments.length === 0 ? (
                  <div className="col-span-3 text-center py-10">
                    <p className="text-slate-400">No tournaments found for the selected mode.</p>
                  </div>
                ) : (
                  filteredTournaments.slice(0, 3).map((tournament) => (
                    <motion.div
                      key={tournament.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TournamentCard 
                        tournament={tournament} 
                        onJoin={handleJoinTournament}
                      />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
        
        {/* How It Works */}
        <section id="how-it-works" className="py-12 px-4 bg-dark">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">How FireChamp Works</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Getting started is easy. Join tournaments, compete, and withdraw your winnings in just a few simple steps.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Step 1 */}
              <motion.div 
                className="bg-dark-light rounded-2xl p-6 relative"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute -top-5 -left-5 w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-xl">1</div>
                <div className="flex justify-center mb-6">
                  <Users className="h-16 w-16 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-2 text-center">Register</h3>
                <p className="text-slate-400 text-center">Create your account using your phone number and Free Fire game ID.</p>
              </motion.div>
              
              {/* Step 2 */}
              <motion.div 
                className="bg-dark-light rounded-2xl p-6 relative"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute -top-5 -left-5 w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-xl">2</div>
                <div className="flex justify-center mb-6">
                  <Trophy className="h-16 w-16 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-2 text-center">Join Tournaments</h3>
                <p className="text-slate-400 text-center">Browse available tournaments and join by paying the entry fee from your wallet.</p>
              </motion.div>
              
              {/* Step 3 */}
              <motion.div 
                className="bg-dark-light rounded-2xl p-6 relative"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute -top-5 -left-5 w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-xl">3</div>
                <div className="flex justify-center mb-6">
                  <Clock className="h-16 w-16 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-2 text-center">Compete</h3>
                <p className="text-slate-400 text-center">Use the room ID and password to enter the match, compete, and climb the leaderboard.</p>
              </motion.div>
              
              {/* Step 4 */}
              <motion.div 
                className="bg-dark-light rounded-2xl p-6 relative"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute -top-5 -left-5 w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-xl">4</div>
                <div className="flex justify-center mb-6">
                  <Check className="h-16 w-16 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-2 text-center">Withdraw Winnings</h3>
                <p className="text-slate-400 text-center">Cash out your winnings directly to your bank account or UPI wallet.</p>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Referral Banner */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="bg-dark rounded-2xl p-8 md:p-10 relative overflow-hidden">
              {/* Background elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full opacity-10 transform translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent rounded-full opacity-10 transform -translate-x-1/2 translate-y-1/2"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
                <div className="mb-8 md:mb-0 md:mr-8 text-center md:text-left">
                  <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">Refer Friends & Earn Rewards</h2>
                  <p className="text-slate-300 mb-6 max-w-lg">Invite your friends to join FireChamp and earn ₹50 for each friend who registers and plays their first tournament.</p>
                  <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
                    <Button asChild className="bg-accent hover:bg-accent-dark text-white font-medium rounded-xl shadow-lg hover:shadow-accent/30">
                      <Link href="/refer">
                        Get My Referral Code
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="border-white/30 hover:border-white/50 text-white font-medium rounded-xl">
                      <Link href="/refer">
                        Learn More
                      </Link>
                    </Button>
                  </div>
                </div>
                
                <div className="w-72 h-72 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-56 h-56">
                      <div className="absolute inset-0 rounded-full border-4 border-dashed border-primary opacity-30 animate-spin-slow"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div 
                          className="w-40 h-40 bg-dark-light rounded-full shadow-xl flex items-center justify-center"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          <div className="text-center">
                            <div className="text-3xl font-bold text-accent mb-1">₹50</div>
                            <div className="text-sm">per referral</div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Wallet Modal Preview (only shown if user is logged in) */}
        {user && walletData && (
          <section className="py-12 px-4 md:hidden">
            <div className="container mx-auto max-w-md">
              <WalletModal walletData={walletData} trigger={
                <Button className="w-full bg-primary hover:bg-primary-light flex items-center justify-center gap-2">
                  <Share className="h-4 w-4" />
                  <span>Open Wallet</span>
                </Button>
              } />
            </div>
          </section>
        )}
      </main>
      
      <AppFooter />
    </div>
  );
}
