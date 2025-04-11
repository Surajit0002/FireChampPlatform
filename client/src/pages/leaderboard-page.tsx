import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LeaderboardEntry } from "@shared/schema";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Search, Trophy, Award, Medal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<string>("weekly");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Fetch leaderboard data
  const { data: leaderboard = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: [`/api/leaderboard/${period}`],
  });
  
  // Filter leaderboard based on search query
  const filteredLeaderboard = leaderboard.filter((entry) => {
    if (!searchQuery) return true;
    
    // In a real app, this would search by username
    // Since we only have userId, we'll search by that
    return entry.userId.toString().includes(searchQuery);
  });
  
  // Find current user's rank
  const userRank = user 
    ? filteredLeaderboard.findIndex(entry => entry.userId === user.id) + 1 
    : -1;
  
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      
      <main className="flex-grow pt-16 md:pt-20 pb-20 md:pb-6">
        <div className="container mx-auto px-4 py-12">
          {/* Page title and search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h1 className="font-heading text-3xl md:text-4xl font-bold">Leaderboard</h1>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search players"
                className="bg-dark pl-10 border-slate-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Leaderboard period tabs */}
          <Tabs value={period} onValueChange={setPeriod} className="mb-8">
            <TabsList className="bg-dark">
              <TabsTrigger value="daily" className="data-[state=active]:bg-primary">Daily</TabsTrigger>
              <TabsTrigger value="weekly" className="data-[state=active]:bg-primary">Weekly</TabsTrigger>
              <TabsTrigger value="monthly" className="data-[state=active]:bg-primary">Monthly</TabsTrigger>
              <TabsTrigger value="all-time" className="data-[state=active]:bg-primary">All Time</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Top 3 Players */}
          {!isLoading && filteredLeaderboard.length > 0 && (
            <div className="mb-8">
              <div className="flex flex-col md:flex-row items-center justify-center p-8 bg-gradient-to-r from-primary-dark to-primary relative rounded-2xl">
                {/* 2nd Place */}
                {filteredLeaderboard.length > 1 && (
                  <motion.div 
                    className="flex flex-col items-center md:order-1 mb-8 md:mb-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white">
                        <Avatar className="w-full h-full">
                          <AvatarFallback className="text-2xl bg-slate-700">
                            {filteredLeaderboard[1].userId.toString().substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-accent text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center">2</div>
                    </div>
                    <p className="mt-4 font-medium text-lg">Player {filteredLeaderboard[1].userId}</p>
                    <p className="text-xs text-slate-300">{filteredLeaderboard[1].kills} Kills</p>
                  </motion.div>
                )}
                
                {/* 1st Place */}
                <motion.div 
                  className="flex flex-col items-center md:order-2 relative mb-8 md:mb-0 md:mx-10 transform md:scale-110"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-12 h-12">
                    <Trophy className="h-full w-full text-yellow-400" />
                  </div>
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-yellow-400">
                      <Avatar className="w-full h-full">
                        <AvatarFallback className="text-3xl bg-yellow-600">
                          {filteredLeaderboard[0].userId.toString().substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-dark text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center">1</div>
                  </div>
                  <p className="mt-4 font-medium text-lg">Player {filteredLeaderboard[0].userId}</p>
                  <p className="text-xs text-slate-300">{filteredLeaderboard[0].kills} Kills</p>
                </motion.div>
                
                {/* 3rd Place */}
                {filteredLeaderboard.length > 2 && (
                  <motion.div 
                    className="flex flex-col items-center md:order-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white">
                        <Avatar className="w-full h-full">
                          <AvatarFallback className="text-2xl bg-amber-800">
                            {filteredLeaderboard[2].userId.toString().substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-accent text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center">3</div>
                    </div>
                    <p className="mt-4 font-medium text-lg">Player {filteredLeaderboard[2].userId}</p>
                    <p className="text-xs text-slate-300">{filteredLeaderboard[2].kills} Kills</p>
                  </motion.div>
                )}
              </div>
            </div>
          )}
          
          {/* Leaderboard Table */}
          <Card className="bg-dark overflow-hidden border-slate-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-light">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-medium">Rank</th>
                    <th className="py-3 px-4 text-left text-sm font-medium">Player</th>
                    <th className="py-3 px-4 text-left text-sm font-medium">Kills</th>
                    <th className="py-3 px-4 text-left text-sm font-medium">Wins</th>
                    <th className="py-3 px-4 text-left text-sm font-medium">Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {isLoading ? (
                      Array.from({ length: 10 }).map((_, index) => (
                        <tr key={index} className="border-t border-slate-700">
                          <td colSpan={5} className="py-3 px-4">
                            <div className="h-8 bg-slate-800 rounded animate-pulse"></div>
                          </td>
                        </tr>
                      ))
                    ) : filteredLeaderboard.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No leaderboard data available for this period.
                        </td>
                      </tr>
                    ) : (
                      filteredLeaderboard.map((entry, index) => {
                        const isCurrentUser = user && user.id === entry.userId;
                        const rankIcon = index < 3 ? (
                          index === 0 ? (
                            <Trophy className="h-4 w-4 text-yellow-400 mr-1" />
                          ) : index === 1 ? (
                            <Medal className="h-4 w-4 text-slate-300 mr-1" />
                          ) : (
                            <Award className="h-4 w-4 text-amber-700 mr-1" />
                          )
                        ) : null;
                        
                        return (
                          <motion.tr 
                            key={entry.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`border-t border-slate-700 ${
                              isCurrentUser ? "bg-primary/10" : "hover:bg-dark-light/50"
                            } transition-colors`}
                          >
                            <td className="py-3 px-4 text-sm font-medium">
                              <div className="flex items-center">
                                {rankIcon}
                                {index + 1}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                                  <Avatar>
                                    <AvatarFallback className={`${
                                      index === 0 ? "bg-yellow-600" :
                                      index === 1 ? "bg-slate-600" :
                                      index === 2 ? "bg-amber-800" :
                                      "bg-slate-800"
                                    }`}>
                                      {entry.userId.toString().substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                                <span>
                                  Player {entry.userId}
                                  {isCurrentUser && (
                                    <span className="ml-2 text-xs text-primary">(You)</span>
                                  )}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">{entry.kills}</td>
                            <td className="py-3 px-4">{entry.wins}</td>
                            <td className="py-3 px-4 text-accent font-medium">
                              {formatCurrency(entry.earnings)}
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            
            {/* My Rank (shown if user is logged in and is not in top results) */}
            {user && userRank > 10 && (
              <div className="border-t border-slate-700 p-4">
                <div className="bg-primary/10 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 flex items-center justify-center font-medium mr-3">
                        {userRank}
                      </div>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                          <Avatar>
                            <AvatarFallback>
                              {user.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <span>
                          {user.username}
                          <span className="ml-2 text-xs text-primary">(You)</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-slate-400">Kills</p>
                        <p>{filteredLeaderboard[userRank - 1]?.kills || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-400">Wins</p>
                        <p>{filteredLeaderboard[userRank - 1]?.wins || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-400">Earnings</p>
                        <p className="text-accent font-medium">
                          {formatCurrency(filteredLeaderboard[userRank - 1]?.earnings || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
          
          {/* Info Card */}
          <Card className="bg-dark mt-8 border-slate-700">
            <CardContent className="p-6">
              <h3 className="font-heading text-xl font-bold mb-4">How the Leaderboard Works</h3>
              <p className="text-slate-300 mb-4">
                The FireChamp leaderboard ranks players based on their performance in tournaments.
                Points are earned for kills, wins, and high placements in matches.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-slate-800 p-4 rounded-xl">
                  <div className="flex items-center mb-2">
                    <Skull className="h-5 w-5 text-accent mr-2" />
                    <h4 className="font-semibold">Kills</h4>
                  </div>
                  <p className="text-sm text-slate-400">
                    Each kill in a tournament earns you points and contributes to your position on the leaderboard.
                  </p>
                </div>
                
                <div className="bg-slate-800 p-4 rounded-xl">
                  <div className="flex items-center mb-2">
                    <Trophy className="h-5 w-5 text-yellow-400 mr-2" />
                    <h4 className="font-semibold">Wins</h4>
                  </div>
                  <p className="text-sm text-slate-400">
                    Tournament victories earn you significant points and improve your leaderboard ranking.
                  </p>
                </div>
                
                <div className="bg-slate-800 p-4 rounded-xl">
                  <div className="flex items-center mb-2">
                    <Award className="h-5 w-5 text-accent mr-2" />
                    <h4 className="font-semibold">Rewards</h4>
                  </div>
                  <p className="text-sm text-slate-400">
                    Top players on the leaderboard may receive special rewards and recognition.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <AppFooter />
    </div>
  );
}
