
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Users, Trophy, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TeamsPage() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    privacy: "all",
    status: "all",
    mode: "all"
  });

  // Fetch teams data
  const { data: teams = [], isLoading } = useQuery({
    queryKey: ["/api/teams"],
    queryFn: async () => {
      const res = await fetch("/api/teams");
      if (!res.ok) throw new Error("Failed to fetch teams");
      return res.json();
    }
  });

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />

      <main className="flex-grow pt-16 md:pt-20 pb-20 md:pb-6">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">Teams</h1>
              <p className="text-slate-400">Find your squad or create your own team</p>
            </div>

            <Button 
              className="bg-accent hover:bg-accent-dark"
              onClick={() => navigate("/teams/create")}
            >
              Create Team
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="bg-dark rounded-xl p-6 mb-8 border border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search teams by name..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <Select 
                value={filters.privacy}
                onValueChange={(value) => setFilters({...filters, privacy: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Privacy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  <SelectItem value="public">Public Teams</SelectItem>
                  <SelectItem value="private">Private Teams</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.mode}
                onValueChange={(value) => setFilters({...filters, mode: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Game Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="tpp">TPP</SelectItem>
                  <SelectItem value="fpp">FPP</SelectItem>
                  <SelectItem value="clash">Clash Squad</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-dark rounded-xl h-48 animate-pulse" />
              ))
            ) : teams.map((team) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-dark border-slate-700 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={team.logo} />
                        <AvatarFallback>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-xl mb-1">{team.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Users className="h-4 w-4" />
                          <span>{team.memberCount}/{team.maxMembers}</span>
                          {team.private && (
                            <span className="bg-slate-700 px-2 py-0.5 rounded text-xs">Private</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-slate-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                          <Trophy className="h-4 w-4" />
                          <span>Wins</span>
                        </div>
                        <span className="text-xl font-bold">{team.stats.wins}</span>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                          <Star className="h-4 w-4" />
                          <span>Rank</span>
                        </div>
                        <span className="text-xl font-bold">#{team.rank}</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full"
                      variant={team.canJoin ? "default" : "secondary"}
                      onClick={() => navigate(`/teams/${team.id}`)}
                    >
                      {team.canJoin ? "Join Team" : "View Details"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
