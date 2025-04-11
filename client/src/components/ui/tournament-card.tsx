import { Tournament } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { MapPin, Users, Trophy, Zap, Clock, ArrowRight, Sword, Target, Shield } from "lucide-react";

interface TournamentCardProps {
  tournament: Tournament;
  joined?: boolean;
  onJoin?: (id: number) => void;
  featured?: boolean;
}

export function TournamentCard({ tournament, joined, onJoin, featured = false }: TournamentCardProps) {
  const { id, name, startTime, entryFee, prizePool, mode, map, status, maxPlayers } = tournament;
  
  // Mock participants count for UI (in real app, would come from server)
  const participantsCount = Math.floor(Math.random() * maxPlayers);
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-green-600';
      case 'ongoing':
        return 'bg-accent';
      case 'completed':
        return 'bg-slate-600';
      default:
        return 'bg-slate-600';
    }
  };
  
  // Get mode badge text
  const getModeText = (mode: string) => {
    return mode.toUpperCase();
  };
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="bg-dark rounded-2xl overflow-hidden shadow-lg border border-slate-700 hover:border-primary transition-all duration-300">
        <div className="relative">
          {/* Dynamic background based on map */}
          <div className="w-full h-48 bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center relative overflow-hidden">
            {/* Map-specific patterns */}
            <div className="absolute inset-0 opacity-20">
              {map === 'Bermuda' && (
                <div className="absolute inset-0 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:20px_20px]"></div>
              )}
              {map === 'Kalahari' && (
                <div className="absolute inset-0 bg-[linear-gradient(45deg,#cc5200_25%,transparent_25%,transparent_50%,#cc5200_50%,#cc5200_75%,transparent_75%,transparent)] [background-size:20px_20px]"></div>
              )}
              {map === 'Purgatory' && (
                <div className="absolute inset-0 bg-[conic-gradient(#4c0519_0deg,#4c0519_90deg,transparent_90deg,transparent_180deg,#4c0519_180deg,#4c0519_270deg,transparent_270deg)] [background-size:30px_30px]"></div>
              )}
              {map === 'Alpine' && (
                <div className="absolute inset-0 bg-[radial-gradient(#164e63_1px,transparent_1px)] [background-size:16px_16px]"></div>
              )}
            </div>
            
            {/* Mode icon */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-30">
              {mode === 'solo' && <Target className="h-24 w-24 text-white" />}
              {mode === 'duo' && <Shield className="h-24 w-24 text-white" />}
              {mode === 'squad' && <Users className="h-24 w-24 text-white" />}
            </div>
            
            <div className="absolute bottom-4 left-4 flex flex-col">
              <div className="flex items-center mb-1">
                <MapPin className="h-4 w-4 text-white/70 mr-1" />
                <span className="text-white/90 text-sm font-medium">{map}</span>
              </div>
              <div className="flex items-center">
                {mode === 'solo' && <Target className="h-4 w-4 text-white/70 mr-1" />}
                {mode === 'duo' && <Shield className="h-4 w-4 text-white/70 mr-1" />}
                {mode === 'squad' && <Users className="h-4 w-4 text-white/70 mr-1" />}
                <span className="text-white/90 text-sm font-medium">{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <Badge 
            variant="outline" 
            className={`absolute top-3 left-3 ${getStatusColor(status)} border-0 rounded-lg py-1.5 px-3 text-xs font-bold uppercase`}
          >
            {status === 'upcoming' && <Clock className="h-3 w-3 mr-1" />}
            {status === 'ongoing' && <Zap className="h-3 w-3 mr-1" />}
            {status === 'completed' && <Trophy className="h-3 w-3 mr-1" />}
            {status}
          </Badge>
          
          {/* Featured Badge */}
          {featured && (
            <Badge
              variant="outline"
              className="absolute top-3 right-3 bg-primary border-0 rounded-lg py-1.5 px-3 text-xs font-bold"
            >
              <Sword className="h-3 w-3 mr-1" />
              FEATURED
            </Badge>
          )}
          
          {/* Time Remaining */}
          {status === 'upcoming' && !featured && (
            <div className="absolute top-3 right-3 bg-dark/80 backdrop-blur-sm rounded-lg py-1.5 px-3 text-xs font-bold flex items-center">
              <CountdownTimer targetDate={new Date(startTime)} showIcon={true} />
            </div>
          )}
        </div>
        
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-lg mb-1">{name}</h3>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-slate-400 mr-1" />
                <p className="text-sm text-slate-400">
                  {new Date(startTime).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
              </div>
            </div>
            <Badge
              variant={mode === 'squad' ? 'destructive' : mode === 'duo' ? 'secondary' : 'default'}
              className="rounded-lg text-xs font-medium py-1 px-2"
            >
              {mode === 'solo' && <Target className="h-3 w-3 mr-1" />}
              {mode === 'duo' && <Shield className="h-3 w-3 mr-1" />}
              {mode === 'squad' && <Users className="h-3 w-3 mr-1" />}
              {getModeText(mode)}
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-slate-800/50 rounded-lg p-2 text-center">
              <div className="flex justify-center mb-1">
                <Trophy className="h-4 w-4 text-yellow-400" />
              </div>
              <p className="text-xs text-slate-400">Prize Pool</p>
              <p className="font-bold text-accent">{formatCurrency(prizePool)}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2 text-center">
              <div className="flex justify-center mb-1">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <p className="text-xs text-slate-400">Entry Fee</p>
              <p className="font-medium">{formatCurrency(entryFee)}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2 text-center">
              <div className="flex justify-center mb-1">
                <Sword className="h-4 w-4 text-slate-300" />
              </div>
              <p className="text-xs text-slate-400">Per Kill</p>
              <p className="font-medium">{formatCurrency(tournament.perKillReward || 0)}</p>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-slate-400 mr-1" />
                <span className="text-xs text-slate-400">
                  {maxPlayers - participantsCount} slots left
                </span>
              </div>
              <span className="text-xs font-medium">
                {participantsCount}/{maxPlayers}
              </span>
            </div>
            <ProgressBar 
              value={participantsCount} 
              max={maxPlayers} 
              className="h-2.5 bg-slate-700/60 rounded-full overflow-hidden"
              fillClassName={participantsCount >= maxPlayers * 0.8 ? "bg-red-500" : "bg-primary"}
            />
          </div>
        </CardContent>
        
        <CardFooter className="px-5 pb-5 pt-0 flex flex-col gap-3">
          {status === 'upcoming' && (
            <div className="flex items-center justify-between w-full text-xs text-slate-400">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                Registration open
              </div>
              {tournament.roomId && (
                <div className="flex items-center">
                  <div className="px-2 py-0.5 bg-slate-800 rounded mr-1 font-mono">
                    {tournament.roomId}
                  </div>
                  Room ID
                </div>
              )}
            </div>
          )}
          
          {joined ? (
            <Link href={`/tournaments/${id}`} className="w-full">
              <Button 
                variant="outline" 
                className="w-full border-slate-700 hover:bg-slate-800 hover:text-white"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                View Details
              </Button>
            </Link>
          ) : (
            <Button 
              className={`w-full group ${
                status === 'upcoming' 
                  ? 'bg-gradient-to-r from-primary to-accent hover:from-primary-dark hover:to-accent-dark' 
                  : 'bg-primary hover:bg-primary-light'
              }`}
              onClick={() => onJoin && onJoin(id)}
            >
              {status === 'upcoming' ? (
                <>
                  <Zap className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                  Join Now • {formatCurrency(entryFee)}
                </>
              ) : (
                <>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  View Details
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
