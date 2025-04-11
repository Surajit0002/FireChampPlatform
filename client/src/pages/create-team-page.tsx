
import { useState } from "react";
import { useLocation } from "wouter";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function CreateTeamPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "public",
    maxMembers: "4",
    gameMode: "tpp",
    logo: null as File | null,
    banner: null as File | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Implement team creation API call
      toast({
        title: "Team Created!",
        description: "Your team has been created successfully.",
      });
      navigate("/my-team");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create team. Please try again.",
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
              <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">Create Your Team</h1>
              <p className="text-slate-400 mb-8">Form your squad and compete in tournaments together</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Team Name</label>
                    <Input
                      placeholder="Enter team name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                      placeholder="Tell us about your team..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="h-32"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Team Type</label>
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
                      <label className="block text-sm font-medium mb-2">Max Members</label>
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
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Game Mode</label>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Team Logo</label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFormData({ ...formData, logo: e.target.files?.[0] || null })}
                        className="cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Team Banner</label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFormData({ ...formData, banner: e.target.files?.[0] || null })}
                        className="cursor-pointer"
                      />
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
