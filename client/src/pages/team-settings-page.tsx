
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Shield, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";

export default function TeamSettingsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: team, isLoading } = useQuery({
    queryKey: ["/api/my-team"],
    queryFn: async () => {
      const res = await fetch("/api/my-team");
      if (!res.ok) throw new Error("Failed to fetch team");
      return res.json();
    }
  });

  const [formData, setFormData] = useState({
    name: team?.name || "",
    tag: team?.tag || "",
    description: team?.description || "",
    logo: null as File | null,
    banner: null as File | null,
    allowInvites: team?.allowInvites ?? true,
    requireApproval: team?.requireApproval ?? true,
    minimumLevel: team?.minimumLevel || "1",
    socialLinks: team?.socialLinks || {
      discord: "",
      instagram: ""
    }
  });

  const updateTeamMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch(`/api/teams/${team.id}`, {
        method: "PUT",
        body: data
      });
      if (!res.ok) throw new Error("Failed to update team");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Team Updated",
        description: "Your team settings have been saved successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update team settings. Please try again.",
        variant: "destructive"
      });
    }
  });

  const deleteTeamMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/teams/${team.id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete team");
    },
    onSuccess: () => {
      toast({
        title: "Team Deleted",
        description: "Your team has been deleted successfully."
      });
      navigate("/teams");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete team. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      await updateTeamMutation.mutateAsync(formDataToSend);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />

      <main className="flex-grow pt-16 md:pt-20 pb-20 md:pb-6">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                <h1 className="font-heading text-3xl font-bold">Team Settings</h1>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Team
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your team
                      and remove all members from it.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteTeamMutation.mutate()}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Delete Team
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

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
                    <Label>Update Team Logo</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({ ...formData, logo: e.target.files?.[0] || null })}
                      className="cursor-pointer"
                    />
                  </div>
                  <div>
                    <Label>Update Team Banner</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({ ...formData, banner: e.target.files?.[0] || null })}
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-4 bg-slate-800/50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3">Team Permissions</h3>
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
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent-dark"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving Changes..." : "Save Changes"}
              </Button>
            </form>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
