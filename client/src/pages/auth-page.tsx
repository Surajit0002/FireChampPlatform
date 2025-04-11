import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Trophy, Shield, Target } from "lucide-react";
import { motion } from "framer-motion";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional().or(z.literal("")),
  gameUid: z.string().min(3, "Game UID must be at least 3 characters").optional().or(z.literal(""))
});

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect if already logged in
  if (user) {
    navigate("/");
    return null;
  }
  
  const [activeTab, setActiveTab] = useState<string>("login");
  
  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });
  
  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      phone: "",
      gameUid: ""
    }
  });
  
  // Handle login form submission
  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        navigate("/");
      }
    });
  };
  
  // Handle registration form submission
  const onRegisterSubmit = (data: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        navigate("/");
      }
    });
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      
      <main className="flex-grow pt-16 md:pt-20 pb-20 md:pb-6">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Auth Form */}
            <div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <Card className="bg-dark border-slate-700">
                    <CardHeader>
                      <CardTitle>Welcome Back</CardTitle>
                      <CardDescription>Sign in to your FireChamp account</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                          <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter your username" 
                                    {...field} 
                                    className="bg-slate-800 border-slate-700"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder="Enter your password" 
                                    {...field}
                                    className="bg-slate-800 border-slate-700"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="w-full bg-primary hover:bg-primary-light mt-4"
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending ? "Signing in..." : "Sign In"}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-slate-700" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="bg-dark px-2 text-slate-400">
                            OR CONTINUE WITH
                          </span>
                        </div>
                      </div>
                      
                      <Button variant="outline" className="w-full">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5 mr-2">
                          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        </svg>
                        Sign in with Google
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="register">
                  <Card className="bg-dark border-slate-700">
                    <CardHeader>
                      <CardTitle>Create an Account</CardTitle>
                      <CardDescription>Join FireChamp and start competing today</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                          <FormField
                            control={registerForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Choose a username" 
                                    {...field} 
                                    className="bg-slate-800 border-slate-700"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder="Create a password" 
                                    {...field}
                                    className="bg-slate-800 border-slate-700"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={registerForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email (Optional)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="email" 
                                      placeholder="Enter your email" 
                                      {...field}
                                      className="bg-slate-800 border-slate-700"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={registerForm.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone (Optional)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Enter your phone number" 
                                      {...field}
                                      className="bg-slate-800 border-slate-700"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={registerForm.control}
                            name="gameUid"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Free Fire Game UID (Optional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter your Free Fire UID" 
                                    {...field}
                                    className="bg-slate-800 border-slate-700"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="w-full bg-primary hover:bg-primary-light mt-4"
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? "Creating account..." : "Create Account"}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Hero Section */}
            <div className="hidden md:block">
              <div className="bg-dark rounded-2xl p-8 h-full border border-slate-700 flex flex-col">
                <div className="mb-8">
                  <h2 className="font-heading text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Welcome to FireChamp
                  </h2>
                  <p className="text-slate-300">
                    The ultimate platform for Free Fire tournaments, where skills are rewarded and champions are born.
                  </p>
                </div>
                
                <div className="flex-1 space-y-6">
                  <motion.div 
                    className="flex items-start"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="bg-primary/20 p-2 rounded-full mr-4">
                      <Trophy className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Compete in Tournaments</h3>
                      <p className="text-slate-400">Join Solo, Duo, or Squad tournaments and showcase your skills against other players.</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-start"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="bg-accent/20 p-2 rounded-full mr-4">
                      <Target className="h-8 w-8 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Win Cash Prizes</h3>
                      <p className="text-slate-400">Cash rewards for tournament winners and per-kill incentives for every player.</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-start"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="bg-primary/20 p-2 rounded-full mr-4">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Secure Withdrawals</h3>
                      <p className="text-slate-400">Withdraw your winnings directly to your UPI wallet or bank account securely.</p>
                    </div>
                  </motion.div>
                </div>
                
                <div className="mt-auto pt-6 border-t border-slate-700">
                  <p className="text-slate-400 text-sm">
                    By creating an account, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <AppFooter />
    </div>
  );
}
