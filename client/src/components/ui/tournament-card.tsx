import { Tournament } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";

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
          {/* Using a placeholder image since we can't generate or use binary files */}
          <div className="w-full h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <span className="text-slate-600 text-lg font-medium">
              {mode.toUpperCase()} - {map}
            </span>
          </div>

          {/* Status Badge */}
          <div className={`absolute top-3 left-3 ${getStatusColor(status)} rounded-lg py-1 px-3 text-xs font-bold`}>
            {status.toUpperCase()}
          </div>
          
          {/* Featured Badge */}
          {featured && (
            <div className="absolute top-3 right-3 bg-primary rounded-lg py-1 px-3 text-xs font-bold">
              FEATURED
            </div>
          )}
          
          {/* Time Remaining */}
          {status === 'upcoming' && (
            <div className="absolute top-3 right-3 bg-dark/80 backdrop-blur-sm rounded-lg py-1 px-3 text-xs font-bold flex items-center">
              <CountdownTimer targetDate={new Date(startTime)} />
            </div>
          )}
        </div>
        
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-heading font-bold text-lg">{name}</h3>
              <p className="text-sm text-slate-400">{map} • {mode}</p>
            </div>
            <div className="bg-dark-light rounded-lg py-1 px-2 text-xs font-medium">
              {getModeText(mode)}
            </div>
          </div>
          
          <div className="flex justify-between mb-4">
            <div>
              <p className="text-xs text-slate-400">Prize Pool</p>
              <p className="font-bold text-accent">{formatCurrency(prizePool)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Entry Fee</p>
              <p className="font-medium">{formatCurrency(entryFee)}</p>
            </div>
            {tournament.perKillReward && (
              <div>
                <p className="text-xs text-slate-400">Per Kill</p>
                <p className="font-medium">{formatCurrency(tournament.perKillReward)}</p>
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-slate-400">
                {maxPlayers - participantsCount} slots left
              </span>
              <span className="text-xs font-medium">
                {participantsCount}/{maxPlayers}
              </span>
            </div>
            <ProgressBar 
              value={participantsCount} 
              max={maxPlayers} 
              className="h-2 bg-slate-700"
              fillClassName="bg-primary"
            />
          </div>
        </CardContent>
        
        <CardFooter className="px-5 pb-5 pt-0">
          {joined ? (
            <Link href={`/tournaments/${id}`}>
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Link>
          ) : (
            <Button 
              className="w-full bg-primary hover:bg-primary-light" 
              onClick={() => onJoin && onJoin(id)}
            >
              {status === 'upcoming' ? `Join Now • ${formatCurrency(entryFee)}` : 'View Details'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
