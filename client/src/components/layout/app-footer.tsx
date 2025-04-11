import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="bg-dark py-12 px-4 border-t border-slate-800">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="absolute text-white font-bold text-lg">FC</span>
              </div>
              <span className="font-heading font-bold text-xl tracking-tight">FireChamp</span>
            </div>
            <p className="text-slate-400 mb-4">The ultimate platform for Free Fire tournaments, where players compete, win, and earn real rewards.</p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h5 className="font-bold text-lg mb-4">Quick Links</h5>
            <ul className="space-y-2">
              <li><Link href="/" className="text-slate-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/tournaments" className="text-slate-400 hover:text-white transition-colors">Tournaments</Link></li>
              <li><Link href="/leaderboard" className="text-slate-400 hover:text-white transition-colors">Leaderboard</Link></li>
              <li><Link href="/wallet" className="text-slate-400 hover:text-white transition-colors">Wallet</Link></li>
              <li><Link href="/refer" className="text-slate-400 hover:text-white transition-colors">Refer & Earn</Link></li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h5 className="font-bold text-lg mb-4">Support</h5>
            <ul className="space-y-2">
              <li><a href="#help" className="text-slate-400 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#faq" className="text-slate-400 hover:text-white transition-colors">FAQs</a></li>
              <li><a href="#contact" className="text-slate-400 hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#report" className="text-slate-400 hover:text-white transition-colors">Report Issue</a></li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h5 className="font-bold text-lg mb-4">Legal</h5>
            <ul className="space-y-2">
              <li><a href="#terms" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#refund" className="text-slate-400 hover:text-white transition-colors">Refund Policy</a></li>
              <li><a href="#tournament-rules" className="text-slate-400 hover:text-white transition-colors">Tournament Rules</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm mb-4 md:mb-0">© {new Date().getFullYear()} FireChamp. All rights reserved.</p>
            <p className="text-slate-400 text-sm">FireChamp is not affiliated with Free Fire or Garena.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
