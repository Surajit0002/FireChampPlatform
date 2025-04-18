
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Settings, Star, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function MyTeamPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch team data
  const { data: team, isLoading } = useQuery({
    queryKey: ["/api/my-team"],
    queryFn: async () => {
      const res = await fetch("/api/my-team");
      if (!res.ok) throw new Error("Failed to fetch team");
      return res.json();
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />

      <main className="flex-grow pt-16 md:pt-20 pb-20 md:pb-6">
        <div className="container mx-auto px-4 py-12">
          {/* Team Banner */}
          <div 
            className="h-48 md:h-64 rounded-xl bg-cover bg-center mb-8 relative"
            style={{ backgroundImage: `url(${team.banner})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent rounded-xl" />
            <div className="absolute bottom-6 left-6 flex items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-slate-900">
                <AvatarImage src={team.logo} />
                <AvatarFallback>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-heading text-3xl font-bold mb-1">{team.name}</h1>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{team.type}</Badge>
                  <Badge variant="secondary">{team.gameMode}</Badge>
                </div>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Trophy className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm text-slate-400">Total Wins</p>
                        <p className="text-2xl font-bold">{team.stats.wins}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Star className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm text-slate-400">Team Rank</p>
                        <p className="text-2xl font-bold">#{team.rank}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Users className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm text-slate-400">Members</p>
                        <p className="text-2xl font-bold">{team.members.length}/{team.maxMembers}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="members">
              <div className="space-y-4">
                <div className="space-y-4">
                  {team.members.map((member) => (
                    <TeamMemberCard
                      key={member.id}
                      member={{
                        ...member,
                        uid: member.id,
                        stats: {
                          matches: member.stats?.totalMatches || 0,
                          wins: member.stats?.wins || 0,
                          kd: member.stats?.kd || 0
                        }
                      }}
                      isLeader={team.userRole === "leader"}
                      onPromote={async (uid) => {
                        try {
                          await fetch(`/api/teams/${team.id}/members/${uid}/promote`, {
                            method: 'POST'
                          });
                          // Refetch team data
                          queryClient.invalidateQueries(['/api/my-team']);
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to promote member",
                            variant: "destructive"
                          });
                        }
                      }}
                      onDemote={async (uid) => {
                        try {
                          await fetch(`/api/teams/${team.id}/members/${uid}/demote`, {
                            method: 'POST'
                          });
                          // Refetch team data
                          queryClient.invalidateQueries(['/api/my-team']);
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to demote member",
                            variant: "destructive"
                          });
                        }
                      }}
                      onRemove={async (uid) => {
                        try {
                          await fetch(`/api/teams/${team.id}/members/${uid}`, {
                            method: 'DELETE'
                          });
                          // Refetch team data
                          queryClient.invalidateQueries(['/api/my-team']);
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to remove member",
                            variant: "destructive"
                          });
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tournaments">
              {/* Tournament history implementation */}
            </TabsContent>

            <TabsContent value="settings">
              {/* Team settings implementation */}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
