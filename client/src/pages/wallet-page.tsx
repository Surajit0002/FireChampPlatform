import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Transaction } from "@shared/schema";
import { WalletData } from "@/types";
import { formatCurrency, formatDateTime, getRelativeTimeString } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { 
  Wallet, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ReceiptText, 
  Trophy,
  Users,
  CreditCard,
  RefreshCw,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

export default function WalletPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [transactionType, setTransactionType] = useState("all");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("upi");
  const [withdrawAccountDetails, setWithdrawAccountDetails] = useState("");
  
  // Fetch wallet data
  const { data: walletData, isLoading } = useQuery<WalletData>({
    queryKey: ["/api/wallet"],
    enabled: !!user,
  });
  
  // Filter transactions by type
  const filteredTransactions = walletData?.transactions.filter(transaction => {
    if (transactionType === "all") return true;
    return transaction.type === transactionType;
  }) || [];
  
  // Add money mutation
  const depositMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await apiRequest("POST", "/api/wallet/deposit", { amount });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      toast({
        title: "Success",
        description: `Added ${formatCurrency(parseFloat(depositAmount))} to your wallet`,
      });
      setDepositAmount("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add money",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Withdraw money mutation
  const withdrawMutation = useMutation({
    mutationFn: async (data: { amount: number, method: string, accountDetails: string }) => {
      const res = await apiRequest("POST", "/api/wallet/withdraw", { amount: data.amount });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      toast({
        title: "Withdrawal initiated",
        description: `Your withdrawal request for ${formatCurrency(parseFloat(withdrawAmount))} has been submitted and is pending approval.`,
      });
      setWithdrawAmount("");
      setWithdrawAccountDetails("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to withdraw",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    depositMutation.mutate(parseFloat(depositAmount));
  };
  
  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    if (!walletData || parseFloat(withdrawAmount) > walletData.balance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough funds to withdraw this amount",
        variant: "destructive",
      });
      return;
    }
    
    if (!withdrawAccountDetails) {
      toast({
        title: "Missing information",
        description: `Please enter your ${withdrawMethod === 'upi' ? 'UPI ID' : 'bank account details'}`,
        variant: "destructive",
      });
      return;
    }
    
    withdrawMutation.mutate({
      amount: parseFloat(withdrawAmount),
      method: withdrawMethod,
      accountDetails: withdrawAccountDetails
    });
  };
  
  const getTransactionIcon = (type: string, status: string) => {
    switch (type) {
      case "deposit":
        return (
          <div className="bg-green-600/20 p-2 rounded-full mr-3">
            <ArrowDownToLine className="h-5 w-5 text-green-500" />
          </div>
        );
      case "withdrawal":
        return (
          <div className="bg-red-600/20 p-2 rounded-full mr-3">
            <ArrowUpFromLine className="h-5 w-5 text-red-500" />
          </div>
        );
      case "tournament_entry":
        return (
          <div className="bg-blue-600/20 p-2 rounded-full mr-3">
            <Trophy className="h-5 w-5 text-blue-500" />
          </div>
        );
      case "tournament_win":
        return (
          <div className="bg-yellow-600/20 p-2 rounded-full mr-3">
            <Trophy className="h-5 w-5 text-yellow-500" />
          </div>
        );
      case "referral":
        return (
          <div className="bg-purple-600/20 p-2 rounded-full mr-3">
            <Users className="h-5 w-5 text-purple-500" />
          </div>
        );
      default:
        return (
          <div className="bg-slate-600/20 p-2 rounded-full mr-3">
            <CreditCard className="h-5 w-5 text-slate-500" />
          </div>
        );
    }
  };
  
  const getTransactionStatus = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <div className="flex items-center text-green-500">
            <CheckCircle2 className="h-4 w-4 mr-1" />
            <span className="text-xs">Completed</span>
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center text-yellow-500">
            <RefreshCw className="h-4 w-4 mr-1" />
            <span className="text-xs">Pending</span>
          </div>
        );
      case "failed":
        return (
          <div className="flex items-center text-red-500">
            <AlertTriangle className="h-4 w-4 mr-1" />
            <span className="text-xs">Failed</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-slate-500">
            <span className="text-xs">{status}</span>
          </div>
        );
    }
  };
  
  const getTransactionAmount = (transaction: Transaction) => {
    const { type, amount } = transaction;
    
    if (type === "deposit" || type === "tournament_win" || type === "referral") {
      return <span className="text-green-500 font-medium">+{formatCurrency(amount)}</span>;
    } else {
      return <span className="text-red-500 font-medium">-{formatCurrency(amount)}</span>;
    }
  };
  
  if (isLoading || !walletData) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow pt-16 md:pt-20 pb-20 md:pb-6">
          <div className="container mx-auto px-4 py-12">
            <div className="animate-pulse space-y-6">
              <div className="h-40 bg-dark rounded-2xl"></div>
              <div className="h-96 bg-dark rounded-2xl"></div>
            </div>
          </div>
        </main>
        <AppFooter />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      
      <main className="flex-grow pt-16 md:pt-20 pb-20 md:pb-6">
        <div className="container mx-auto px-4 py-12">
          {/* Wallet Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-primary-dark to-primary rounded-2xl p-8">
              <div className="flex flex-col md:flex-row items-center md:justify-between gap-6">
                <div className="flex items-center">
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-full mr-6">
                    <Wallet className="h-10 w-10" />
                  </div>
                  <div>
                    <h1 className="font-heading text-3xl md:text-4xl font-bold mb-1">My Wallet</h1>
                    <p className="text-slate-300">Manage your funds and transactions</p>
                  </div>
                </div>
                
                <div className="bg-dark/20 backdrop-blur-sm rounded-xl p-4 md:p-6 w-full md:w-auto">
                  <p className="text-sm text-slate-300 mb-1">Available Balance</p>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold mr-2">{formatCurrency(walletData.balance)}</span>
                    <span className="text-sm text-slate-300">+ {walletData.coins} coins</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Wallet Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-dark mb-6">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary">
                Overview
              </TabsTrigger>
              <TabsTrigger value="deposit" className="data-[state=active]:bg-primary">
                Add Money
              </TabsTrigger>
              <TabsTrigger value="withdraw" className="data-[state=active]:bg-primary">
                Withdraw
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-primary">
                Transaction History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-dark border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Total Balance</p>
                        <p className="text-2xl font-bold">{formatCurrency(walletData.balance)}</p>
                      </div>
                      <div className="bg-green-600/20 p-2 rounded-full">
                        <Wallet className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <Button 
                        size="sm" 
                        className="bg-primary hover:bg-primary-light flex-1"
                        onClick={() => setActiveTab("deposit")}
                      >
                        Add Money
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setActiveTab("withdraw")}
                      >
                        Withdraw
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-dark border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Coins Balance</p>
                        <p className="text-2xl font-bold">{walletData.coins} coins</p>
                      </div>
                      <div className="bg-yellow-600/20 p-2 rounded-full">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Button size="sm" variant="outline" className="w-full" disabled>
                        Redeem Coins (Coming soon)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-dark border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Pending Withdrawals</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(
                            walletData.transactions
                              .filter(t => t.type === "withdrawal" && t.status === "pending")
                              .reduce((sum, t) => sum + t.amount, 0)
                          )}
                        </p>
                      </div>
                      <div className="bg-blue-600/20 p-2 rounded-full">
                        <ArrowUpFromLine className="h-5 w-5 text-blue-500" />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          setActiveTab("history");
                          setTransactionType("withdrawal");
                        }}
                      >
                        View Withdrawals
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="bg-dark border-slate-700">
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your recent wallet activity</CardDescription>
                </CardHeader>
                <CardContent>
                  {walletData.transactions.length === 0 ? (
                    <div className="text-center py-8">
                      <ReceiptText className="h-10 w-10 text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-400">No transactions yet</p>
                      <p className="text-slate-500 text-sm mt-2">Your transaction history will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {walletData.transactions.slice(0, 5).map((transaction) => (
                        <div 
                          key={transaction.id}
                          className="flex items-center justify-between p-3 bg-slate-800 rounded-lg"
                        >
                          <div className="flex items-center">
                            {getTransactionIcon(transaction.type, transaction.status)}
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium capitalize">
                                  {transaction.type.replace('_', ' ')}
                                </p>
                                {getTransactionStatus(transaction.status)}
                              </div>
                              <p className="text-xs text-slate-400">
                                {getRelativeTimeString(transaction.createdAt)}
                              </p>
                            </div>
                          </div>
                          {getTransactionAmount(transaction)}
                        </div>
                      ))}
                      
                      <div className="text-center pt-2">
                        <Button 
                          variant="link" 
                          className="text-primary"
                          onClick={() => setActiveTab("history")}
                        >
                          View All Transactions
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="deposit" className="space-y-6">
              <Card className="bg-dark border-slate-700">
                <CardHeader>
                  <CardTitle>Add Money to Wallet</CardTitle>
                  <CardDescription>Choose an amount to add to your wallet</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label htmlFor="amount">Amount (INR)</Label>
                      <Input
                        id="amount"
                        type="text"
                        placeholder="Enter amount"
                        className="bg-slate-800 border-slate-700"
                        value={depositAmount}
                        onChange={(e) => {
                          // Allow only numbers and decimals
                          const value = e.target.value;
                          if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
                            setDepositAmount(value);
                          }
                        }}
                      />
                      
                      <div className="flex gap-2 flex-wrap">
                        {[100, 200, 500, 1000].map((amount) => (
                          <Button
                            key={amount}
                            variant="outline"
                            className="flex-1"
                            onClick={() => setDepositAmount(amount.toString())}
                          >
                            {formatCurrency(amount)}
                          </Button>
                        ))}
                      </div>
                      
                      <Button 
                        className="w-full bg-primary hover:bg-primary-light mt-4"
                        onClick={handleDeposit}
                        disabled={depositMutation.isPending || !depositAmount}
                      >
                        {depositMutation.isPending ? "Processing..." : "Add Money"}
                      </Button>
                    </div>
                    
                    <div className="bg-slate-800 p-6 rounded-xl">
                      <h3 className="font-bold mb-4">How it works</h3>
                      <ul className="space-y-3 text-slate-300">
                        <li className="flex items-start">
                          <div className="bg-slate-700 flex items-center justify-center w-6 h-6 rounded-full mr-3 mt-0.5 shrink-0">
                            <span className="text-xs">1</span>
                          </div>
                          <p>Enter the amount you want to add to your wallet</p>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-slate-700 flex items-center justify-center w-6 h-6 rounded-full mr-3 mt-0.5 shrink-0">
                            <span className="text-xs">2</span>
                          </div>
                          <p>Choose your preferred payment method</p>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-slate-700 flex items-center justify-center w-6 h-6 rounded-full mr-3 mt-0.5 shrink-0">
                            <span className="text-xs">3</span>
                          </div>
                          <p>Complete the payment securely</p>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-slate-700 flex items-center justify-center w-6 h-6 rounded-full mr-3 mt-0.5 shrink-0">
                            <span className="text-xs">4</span>
                          </div>
                          <p>The amount will be instantly credited to your wallet</p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="withdraw" className="space-y-6">
              <Card className="bg-dark border-slate-700">
                <CardHeader>
                  <CardTitle>Withdraw Funds</CardTitle>
                  <CardDescription>Withdraw your tournament winnings to your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label htmlFor="withdrawAmount">Amount (INR)</Label>
                      <Input
                        id="withdrawAmount"
                        type="text"
                        placeholder="Enter amount"
                        className="bg-slate-800 border-slate-700"
                        value={withdrawAmount}
                        onChange={(e) => {
                          // Allow only numbers and decimals
                          const value = e.target.value;
                          if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
                            setWithdrawAmount(value);
                          }
                        }}
                      />
                      
                      <Label htmlFor="withdrawMethod">Withdrawal Method</Label>
                      <Select 
                        value={withdrawMethod} 
                        onValueChange={setWithdrawMethod}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-700">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent className="bg-dark border-slate-700">
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                          <SelectItem value="paytm">Paytm</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Label htmlFor="accountDetails">
                        {withdrawMethod === 'upi' 
                          ? 'UPI ID' 
                          : withdrawMethod === 'bank' 
                          ? 'Bank Account Details' 
                          : 'Paytm Number'}
                      </Label>
                      <Input
                        id="accountDetails"
                        placeholder={withdrawMethod === 'upi' 
                          ? 'Enter your UPI ID' 
                          : withdrawMethod === 'bank' 
                          ? 'Enter your bank account details' 
                          : 'Enter your Paytm number'}
                        className="bg-slate-800 border-slate-700"
                        value={withdrawAccountDetails}
                        onChange={(e) => setWithdrawAccountDetails(e.target.value)}
                      />
                      
                      <Button 
                        className="w-full bg-primary hover:bg-primary-light mt-4"
                        onClick={handleWithdraw}
                        disabled={
                          withdrawMutation.isPending || 
                          !withdrawAmount || 
                          !withdrawAccountDetails || 
                          (walletData && parseFloat(withdrawAmount) > walletData.balance)
                        }
                      >
                        {withdrawMutation.isPending ? "Processing..." : "Withdraw Funds"}
                      </Button>
                    </div>
                    
                    <div className="bg-slate-800 p-6 rounded-xl">
                      <h3 className="font-bold mb-4">Withdrawal Information</h3>
                      <ul className="space-y-3 text-slate-300">
                        <li className="flex items-start">
                          <div className="bg-slate-700 flex items-center justify-center w-6 h-6 rounded-full mr-3 mt-0.5 shrink-0">
                            <span className="text-xs">•</span>
                          </div>
                          <p>Minimum withdrawal amount: {formatCurrency(100)}</p>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-slate-700 flex items-center justify-center w-6 h-6 rounded-full mr-3 mt-0.5 shrink-0">
                            <span className="text-xs">•</span>
                          </div>
                          <p>Processing time: 24-48 hours</p>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-slate-700 flex items-center justify-center w-6 h-6 rounded-full mr-3 mt-0.5 shrink-0">
                            <span className="text-xs">•</span>
                          </div>
                          <p>Your available balance: {formatCurrency(walletData.balance)}</p>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-slate-700 flex items-center justify-center w-6 h-6 rounded-full mr-3 mt-0.5 shrink-0">
                            <span className="text-xs">•</span>
                          </div>
                          <p>Withdrawal requests are subject to verification</p>
                        </li>
                      </ul>
                      
                      <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center text-yellow-500">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Important
                        </h4>
                        <p className="text-sm text-slate-300">
                          Ensure that the account details provided are correct. 
                          Incorrect details may result in failed transactions.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="space-y-6">
              <Card className="bg-dark border-slate-700">
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>View all your wallet transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <Button 
                      variant={transactionType === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTransactionType("all")}
                    >
                      All
                    </Button>
                    <Button 
                      variant={transactionType === "deposit" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTransactionType("deposit")}
                    >
                      Deposits
                    </Button>
                    <Button 
                      variant={transactionType === "withdrawal" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTransactionType("withdrawal")}
                    >
                      Withdrawals
                    </Button>
                    <Button 
                      variant={transactionType === "tournament_entry" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTransactionType("tournament_entry")}
                    >
                      Tournament Entries
                    </Button>
                    <Button 
                      variant={transactionType === "tournament_win" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTransactionType("tournament_win")}
                    >
                      Tournament Wins
                    </Button>
                  </div>
                  
                  {filteredTransactions.length === 0 ? (
                    <div className="text-center py-8">
                      <ReceiptText className="h-10 w-10 text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-400">No transactions found</p>
                      <p className="text-slate-500 text-sm mt-2">
                        {transactionType === "all" 
                          ? "You don't have any transactions yet" 
                          : `You don't have any ${transactionType.replace('_', ' ')} transactions`}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTransactions.map((transaction) => (
                        <div 
                          key={transaction.id}
                          className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-800 rounded-lg gap-3"
                        >
                          <div className="flex items-center">
                            {getTransactionIcon(transaction.type, transaction.status)}
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium capitalize">
                                  {transaction.type.replace('_', ' ')}
                                </p>
                                {getTransactionStatus(transaction.status)}
                              </div>
                              <p className="text-xs text-slate-400">
                                {formatDateTime(transaction.createdAt)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between md:justify-end gap-4 ml-10 md:ml-0">
                            {transaction.reference && (
                              <div className="text-right">
                                <p className="text-xs text-slate-400">Ref: {transaction.reference}</p>
                              </div>
                            )}
                            <div className="text-right font-medium">
                              {getTransactionAmount(transaction)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <AppFooter />
    </div>
  );
}
