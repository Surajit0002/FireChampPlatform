
import { useState } from "react";
import { useLocation } from "wouter";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Shield, Users, Trophy, Star } from "lucide-react";

export default function CreateTeamPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    tag: "",
    description: "",
    type: "public",
    maxMembers: "4",
    gameMode: "tpp",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Form validation
      if (!formData.name || !formData.tag) {
        throw new Error("Team name and tag are required");
      }

      if (formData.tag.length > 4) {
        throw new Error("Team tag must be 4 characters or less");
      }

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

      const response = await fetch("/api/teams", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Failed to create team");
      }

      toast({
        title: "Team Created!",
        description: "Your team has been created successfully.",
      });
      navigate("/my-team");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create team. Please try again.",
        variant: "destructive",
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
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-8 w-8 text-primary" />
                <h1 className="font-heading text-3xl md:text-4xl font-bold">Create Your Team</h1>
              </div>
              <p className="text-slate-400 mb-8">Form your squad and compete in tournaments together</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
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
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Tell us about your team..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="h-32"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <Label>Max Members</Label>
                      <Select
                        value={formData.maxMembers}
                        onValueChange={(value) => setFormData({ ...formData, maxMembers: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">Duo (2)</SelectItem>
                          <SelectItem value="4">Squad (4)</SelectItem>
                          <SelectItem value="6">Extended (6)</SelectItem>
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
                          <SelectItem value="tpp">TPP</SelectItem>
                          <SelectItem value="fpp">FPP</SelectItem>
                          <SelectItem value="clash">Clash Squad</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <div>
                      <Label>Primary Language</Label>
                      <Select
                        value={formData.primaryLanguage}
                        onValueChange={(value) => setFormData({ ...formData, primaryLanguage: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="hi">Hindi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Discord Server</Label>
                      <Input
                        placeholder="Discord invite link"
                        value={formData.socialLinks.discord}
                        onChange={(e) => setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, discord: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Instagram</Label>
                      <Input
                        placeholder="Instagram username"
                        value={formData.socialLinks.instagram}
                        onChange={(e) => setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                        })}
                      />
                    </div>
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

                  <div className="space-y-4 bg-slate-800/50 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3">Team Settings</h3>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Allow Team Invites</Label>
                        <p className="text-sm text-slate-400">Let members invite others to join</p>
                      </div>
                      <Switch
                        checked={formData.allowInvites}
                        onCheckedChange={(checked) => setFormData({ ...formData, allowInvites: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Require Approval</Label>
                        <p className="text-sm text-slate-400">Review join requests before accepting</p>
                      </div>
                      <Switch
                        checked={formData.requireApproval}
                        onCheckedChange={(checked) => setFormData({ ...formData, requireApproval: checked })}
                      />
                    </div>

                    <div>
                      <Label>Minimum Level Required</Label>
                      <Select
                        value={formData.minimumLevel}
                        onValueChange={(value) => setFormData({ ...formData, minimumLevel: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select minimum level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Level 1 (None)</SelectItem>
                          <SelectItem value="5">Level 5</SelectItem>
                          <SelectItem value="10">Level 10</SelectItem>
                          <SelectItem value="20">Level 20</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent-dark"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Team..." : "Create Team"}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
