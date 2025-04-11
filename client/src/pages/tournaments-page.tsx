import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Tournament } from "@shared/schema";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { TournamentCard } from "@/components/ui/tournament-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { TournamentFilter } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, SlidersHorizontal, X } from "lucide-react";

export default function TournamentsPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<TournamentFilter>({
    mode: "all",
    status: "all",
    entryType: "all",
  });

  // Fetch tournaments
  const { data: tournaments = [], isLoading } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments"],
  });

  // Filter tournaments based on search query and filters
  const filteredTournaments = tournaments.filter((tournament) => {
    // Search filter
    if (searchQuery && !tournament.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Mode filter
    if (filters.mode !== "all" && tournament.mode.toLowerCase() !== filters.mode) {
      return false;
    }

    // Status filter
    if (filters.status !== "all" && tournament.status.toLowerCase() !== filters.status) {
      return false;
    }

    // Entry type filter
    if (filters.entryType === "free" && tournament.entryFee > 0) {
      return false;
    } else if (filters.entryType === "paid" && tournament.entryFee === 0) {
      return false;
    }

    return true;
  });

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
        <div className="container mx-auto px-4 py-12">
          {/* Page title and search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h1 className="font-heading text-3xl md:text-4xl font-bold">Tournaments</h1>

            <motion.div 
              className="relative w-full md:w-64"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search tournaments"
                className="bg-dark pl-10 border-slate-700 transition-all duration-300 focus:border-primary focus:ring-1 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Filters */}
          <div className="mb-8 bg-dark rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-primary" />
              <h2 className="font-medium">Filters</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Game Mode</label>
                <Select 
                  value={filters.mode} 
                  onValueChange={(value) => setFilters({...filters, mode: value as any})}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue placeholder="All Modes" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark border-slate-700">
                    <SelectItem value="all">All Modes</SelectItem>
                    <SelectItem value="solo">Solo</SelectItem>
                    <SelectItem value="duo">Duo</SelectItem>
                    <SelectItem value="squad">Squad</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Tournament Status</label>
                <Select 
                  value={filters.status} 
                  onValueChange={(value) => setFilters({...filters, status: value as any})}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark border-slate-700">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Entry Type</label>
                <Select 
                  value={filters.entryType} 
                  onValueChange={(value) => setFilters({...filters, entryType: value as any})}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark border-slate-700">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="free">Free Entry</SelectItem>
                    <SelectItem value="paid">Paid Entry</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Sort By</label>
                <Select defaultValue="date">
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark border-slate-700">
                    <SelectItem value="date">Date (Nearest First)</SelectItem>
                    <SelectItem value="prize">Prize Pool (Highest First)</SelectItem>
                    <SelectItem value="entry">Entry Fee (Lowest First)</SelectItem>
                    <SelectItem value="slots">Available Slots</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setFilters({
                mode: "all",
                status: "all",
                entryType: "all",
              })}>
                <SlidersHorizontal className="h-4 w-4" />
                Reset Filters
              </Button>
            </div>
          </div>

          {/* Tournament display modes */}
          <Tabs defaultValue="grid" className="mb-6">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-xl">
                {filteredTournaments.length} {filteredTournaments.length === 1 ? "Tournament" : "Tournaments"} Available
              </h2>
              <TabsList className="bg-dark">
                <TabsTrigger value="grid" className="data-[state=active]:bg-primary">
                  Grid
                </TabsTrigger>
                <TabsTrigger value="list" className="data-[state=active]:bg-primary">
                  List
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>

          {/* Tournament Grid */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-dark rounded-2xl h-96 animate-pulse" />
                ))}
              </div>
            ) : filteredTournaments.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-dark rounded-2xl p-8 text-center"
              >
                <h3 className="font-semibold text-xl mb-2">No Tournaments Found</h3>
                <p className="text-slate-400 mb-6">
                  We couldn't find any tournaments matching your search criteria.
                </p>
                <Button onClick={() => {
                  setSearchQuery("");
                  setFilters({
                    mode: "all",
                    status: "all",
                    entryType: "all",
                  });
                }}>
                  Clear Filters
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredTournaments.map((tournament) => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    onJoin={handleJoinTournament}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}