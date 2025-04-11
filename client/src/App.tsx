import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import TournamentsPage from "@/pages/tournaments-page";
import TournamentDetailPage from "@/pages/tournament-detail-page";
import LeaderboardPage from "@/pages/leaderboard-page";
import ProfilePage from "@/pages/profile-page";
import WalletPage from "@/pages/wallet-page";
import ReferralPage from "@/pages/referral-page";
import { ProtectedRoute } from "@/lib/protected-route";
import TeamsPage from "@/pages/teams-page";
import CreateTeamPage from "@/pages/create-team-page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/tournaments" component={TournamentsPage} />
      <Route path="/tournaments/:id" component={TournamentDetailPage} />
      <Route path="/leaderboard" component={LeaderboardPage} />
      <Route path="/teams/create" component={CreateTeamPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />

      <ProtectedRoute path="/wallet" component={WalletPage} />
      <ProtectedRoute path="/refer" component={ReferralPage} />
      <Route path="/teams" component={TeamsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <Router />
      <Toaster />
    </div>
  );
}

export default App;
