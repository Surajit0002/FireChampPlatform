
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  Users,
  Trophy,
  Star,
  UserPlus,
  X,
  Upload,
  Flag,
  Info
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type TeamMember = {
  uid: string;
  username: string;
  role: string;
  country?: string;
  rank?: string;
};

const roleDescriptions = {
  leader: "Team leader with full management rights",
  "co-leader": "Can manage members and team settings",
  fragger: "Primary damage dealer in fights",
  support: "Provides tactical support and utility",
  sniper: "Long-range specialist",
  substitute: "Backup player for tournaments"
};

export default function CreateTeamPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [newMember, setNewMember] = useState({
    uid: "",
    username: "",
    role: "member"
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    tag: "",
    description: "",
    tagline: "",
    type: "public",
    maxMembers: "4",
    gameMode: "squad",
    logo: null as File | null,
    banner: null as File | null,
    allowInvites: true,
    requireApproval: true,
    minimumLevel: "1",
    region: "global",
    primaryLanguage: "en",
    socialLinks: {
      discord: "",
      instagram: "",
    }
  });

  // Simulate fetching player info by UID
  const fetchPlayerInfo = async (uid: string) => {
    try {
      const response = await fetch(`/api/players/${uid}`);
      if (!response.ok) throw new Error("Player not found");
      const data = await response.json();
      return data;
    } catch (error) {
      return null;
    }
  };

  const handleAddMember = async () => {
    if (!newMember.uid) return;
    
    // Check for duplicate UID
    if (members.some(m => m.uid === newMember.uid)) {
      toast({
        title: "Error",
        description: "This player is already in the team",
        variant: "destructive"
      });
      return;
    }

    // Check role limits
    const roleCount = members.filter(m => m.role === newMember.role).length;
    if (newMember.role === "leader" && roleCount >= 1) {
      toast({
        title: "Error",
        description: "Team can only have one leader",
        variant: "destructive"
      });
      return;
    }

    // Fetch player info
    const playerInfo = await fetchPlayerInfo(newMember.uid);
    if (playerInfo) {
      setMembers([...members, {
        ...newMember,
        username: playerInfo.username,
        country: playerInfo.country,
        rank: playerInfo.rank
      }]);
      setNewMember({ uid: "", username: "", role: "member" });
    } else {
      toast({
        title: "Error",
        description: "Invalid player UID",
        variant: "destructive"
      });
    }
  };

  const handleRemoveMember = (uid: string) => {
    setMembers(members.filter(m => m.uid !== uid));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeToTerms) {
      toast({
        title: "Error",
        description: "Please agree to the team rules and code of conduct",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          formDataToSend.append(key, value);
        } else if (typeof value === "object") {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value.toString());
        }
      });

      // Add members data
      formDataToSend.append("members", JSON.stringify(members));

      const response = await fetch("/api/teams", {
        method: "POST",
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const team = await response.json();

      toast({
        title: "Team Created!",
        description: "Your team has been created successfully."
      });
      
      navigate(`/teams/${team.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create team",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />

      <main className="flex-grow pt-16 md:pt-20 pb-20 md:pb-6">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Section */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-8 w-8 text-primary" />
                  <h1 className="font-heading text-3xl md:text-4xl font-bold">Create Your Team</h1>
                </div>
                
                {/* Team Identity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Team Identity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Team Name</Label>
                        <Input
                          placeholder="Enter team name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Team Tag</Label>
                        <Input
                          placeholder="Short tag (max 4 chars)"
                          value={formData.tag}
                          onChange={(e) => setFormData({ ...formData, tag: e.target.value.toUpperCase() })}
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Tagline</Label>
                      <Input
                        placeholder="Team motto or tagline"
                        value={formData.tagline}
                        onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Tell us about your team..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="h-32"
                        maxLength={500}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Team Logo</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setFormData({ ...formData, logo: e.target.files?.[0] || null })}
                          className="cursor-pointer"
                        />
                      </div>
                      <div>
                        <Label>Team Banner</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setFormData({ ...formData, banner: e.target.files?.[0] || null })}
                          className="cursor-pointer"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Team Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Team Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Team Type</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) => setFormData({ ...formData, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Game Mode</Label>
                        <Select
                          value={formData.gameMode}
                          onValueChange={(value) => setFormData({ ...formData, gameMode: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="solo">Solo</SelectItem>
                            <SelectItem value="duo">Duo</SelectItem>
                            <SelectItem value="squad">Squad</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Max Members</Label>
                        <Select
                          value={formData.maxMembers}
                          onValueChange={(value) => setFormData({ ...formData, maxMembers: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2 Players</SelectItem>
                            <SelectItem value="4">4 Players</SelectItem>
                            <SelectItem value="5">5 Players</SelectItem>
                            <SelectItem value="6">6 Players</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Region</Label>
                        <Select
                          value={formData.region}
                          onValueChange={(value) => setFormData({ ...formData, region: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="global">Global</SelectItem>
                            <SelectItem value="asia">Asia</SelectItem>
                            <SelectItem value="europe">Europe</SelectItem>
                            <SelectItem value="na">North America</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Team Members */}
                <Card>
                  <CardHeader>
                    <CardTitle>Add Team Members</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Label>Player UID</Label>
                        <Input
                          placeholder="Enter player UID"
                          value={newMember.uid}
                          onChange={(e) => setNewMember({ ...newMember, uid: e.target.value })}
                        />
                      </div>
                      <div className="flex-1">
                        <Label>Role</Label>
                        <Select
                          value={newMember.role}
                          onValueChange={(value) => setNewMember({ ...newMember, role: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="leader">Leader</SelectItem>
                            <SelectItem value="co-leader">Co-Leader</SelectItem>
                            <SelectItem value="fragger">Fragger</SelectItem>
                            <SelectItem value="support">Support</SelectItem>
                            <SelectItem value="sniper">Sniper</SelectItem>
                            <SelectItem value="substitute">Substitute</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          onClick={handleAddMember}
                          className="gap-2"
                        >
                          <UserPlus className="h-4 w-4" />
                          Add
                        </Button>
                      </div>
                    </div>

                    <AnimatePresence>
                      <div className="space-y-4">
                        {members.map((member) => (
                          <TeamMemberCard
                            key={member.uid}
                            member={member}
                            isLeader={true}
                            onRemove={handleRemoveMember}
                            onPromote={(uid) => {
                              const updatedMembers = members.map(m => 
                                m.uid === uid ? { ...m, role: 'co-leader' } : m
                              );
                              setMembers(updatedMembers);
                            }}
                            onDemote={(uid) => {
                              const updatedMembers = members.map(m =>
                                m.uid === uid ? { ...m, role: 'member' } : m
                              );
                              setMembers(updatedMembers);
                            }}
                          />
                        ))}
                      </div>
                    </AnimatePresence>
                  </CardContent>
                </Card>

                {/* Terms Agreement */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the FireChamp Team Rules and Code of Conduct
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent-dark"
                  disabled={isSubmitting || !agreeToTerms || members.length < 2}
                >
                  {isSubmitting ? "Creating Team..." : "Create Team"}
                </Button>
              </div>

              {/* Preview Section */}
              <div className="lg:sticky lg:top-24 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative aspect-video rounded-lg bg-slate-800 mb-4">
                      {formData.banner ? (
                        <img
                          src={URL.createObjectURL(formData.banner)}
                          alt="Team banner"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-400">
                          <Upload className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative h-20 w-20">
                        {formData.logo ? (
                          <img
                            src={URL.createObjectURL(formData.logo)}
                            alt="Team logo"
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full w-full rounded-full bg-slate-700 text-slate-400">
                            <Shield className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">
                          {formData.name || "Your Team Name"}
                          {formData.tag && <span className="ml-2 text-sm text-slate-400">[{formData.tag}]</span>}
                        </h2>
                        <p className="text-slate-400">{formData.tagline || "Your team tagline"}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                            <Users className="h-4 w-4" />
                            <span>Members</span>
                          </div>
                          <span className="text-xl font-bold">{members.length}/{formData.maxMembers}</span>
                        </div>
                        <div className="bg-slate-800 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                            <Flag className="h-4 w-4" />
                            <span>Region</span>
                          </div>
                          <span className="text-xl font-bold capitalize">{formData.region}</span>
                        </div>
                      </div>

                      <div className="bg-slate-800 rounded-lg p-4">
                        <h3 className="font-medium mb-2">Team Description</h3>
                        <p className="text-sm text-slate-400">
                          {formData.description || "Tell everyone about your team..."}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">Squad Composition</h3>
                        <div className="space-y-2">
                          {members.map((member) => (
                            <div
                              key={member.uid}
                              className="flex items-center gap-2 text-sm"
                            >
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <span>{member.username}</span>
                              <span className="text-slate-400 capitalize">• {member.role}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </form>
          </motion.div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
