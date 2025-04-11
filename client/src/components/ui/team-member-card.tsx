
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Badge } from "./badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Button } from "./button";
import { MoreVertical, Shield, Star, Crown, UserMinus } from "lucide-react";
import { motion } from "framer-motion";

interface TeamMemberCardProps {
  member: {
    uid: string;
    username: string;
    role: string;
    avatar?: string;
    isOnline?: boolean;
    stats?: {
      matches: number;
      wins: number;
      kd: number;
    };
  };
  isLeader: boolean;
  onPromote?: (uid: string) => void;
  onDemote?: (uid: string) => void;
  onRemove?: (uid: string) => void;
}

const roleIcons = {
  leader: Crown,
  "co-leader": Shield,
  fragger: Star,
};

export function TeamMemberCard({ member, isLeader, onPromote, onDemote, onRemove }: TeamMemberCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const RoleIcon = roleIcons[member.role as keyof typeof roleIcons];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 rounded-lg p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarImage src={member.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${member.uid}`} />
            <AvatarFallback>{member.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{member.username}</p>
              {RoleIcon && <RoleIcon className="h-4 w-4 text-primary" />}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">{member.role}</Badge>
              {member.isOnline && (
                <Badge variant="secondary" className="bg-green-500/20 text-green-500">Online</Badge>
              )}
            </div>
          </div>
        </div>

        {isLeader && member.role !== "leader" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onPromote?.(member.uid)}>
                Promote
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDemote?.(member.uid)}>
                Demote
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-500"
                onClick={() => onRemove?.(member.uid)}
              >
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {member.stats && (
        <motion.div
          initial={false}
          animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
          className="mt-4 overflow-hidden"
        >
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="bg-slate-800 rounded p-2">
              <p className="text-slate-400">Matches</p>
              <p className="font-medium">{member.stats.matches}</p>
            </div>
            <div className="bg-slate-800 rounded p-2">
              <p className="text-slate-400">Wins</p>
              <p className="font-medium">{member.stats.wins}</p>
            </div>
            <div className="bg-slate-800 rounded p-2">
              <p className="text-slate-400">K/D</p>
              <p className="font-medium">{member.stats.kd}</p>
            </div>
          </div>
        </motion.div>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="w-full mt-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? "Show Less" : "Show More"}
      </Button>
    </motion.div>
  );
}
