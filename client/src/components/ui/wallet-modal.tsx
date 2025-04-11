import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { WalletData } from "@/types";
import { LucideWallet, PlusCircle, MinusCircle, CreditCard, ArrowDownCircle, ArrowUpCircle, Check } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface WalletModalProps {
  walletData: WalletData;
  trigger?: React.ReactNode;
}

export function WalletModal({ walletData, trigger }: WalletModalProps) {
  const [amount, setAmount] = useState("");
  const { toast } = useToast();

  const depositMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await apiRequest("POST", "/api/wallet/deposit", { amount });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      toast({
        title: "Deposit successful",
        description: `Added ${formatCurrency(parseFloat(amount))} to your wallet`,
      });
      setAmount("");
    },
    onError: (error: Error) => {
      toast({
        title: "Deposit failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await apiRequest("POST", "/api/wallet/withdraw", { amount });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      toast({
        title: "Withdrawal initiated",
        description: `Withdrawal request for ${formatCurrency(parseFloat(amount))} submitted`,
      });
      setAmount("");
    },
    onError: (error: Error) => {
      toast({
        title: "Withdrawal failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimals
    if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
      setAmount(value);
    }
  };

  const handleDeposit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    depositMutation.mutate(parseFloat(amount));
  };

  const handleWithdraw = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    if (parseFloat(amount) > walletData.balance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough funds to withdraw this amount",
        variant: "destructive",
      });
      return;
    }
    
    withdrawMutation.mutate(parseFloat(amount));
  };

  const getTransactionIcon = (type: string, status: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownCircle className="h-5 w-5 text-green-500" />;
      case "withdrawal":
        return <ArrowUpCircle className="h-5 w-5 text-red-500" />;
      case "tournament_entry":
        return <MinusCircle className="h-5 w-5 text-red-500" />;
      case "tournament_win":
        return <Check className="h-5 w-5 text-green-500" />;
      case "referral":
        return <PlusCircle className="h-5 w-5 text-green-500" />;
      default:
        return <CreditCard className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTransactionAmount = (amount: number, type: string) => {
    if (type === "deposit" || type === "tournament_win" || type === "referral") {
      return <span className="text-green-500 font-medium">+{formatCurrency(amount)}</span>;
    } else {
      return <span className="text-red-500 font-medium">-{formatCurrency(amount)}</span>;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center gap-2">
            <LucideWallet className="h-4 w-4" />
            <span>{formatCurrency(walletData.balance)}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-dark border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">My Wallet</DialogTitle>
        </DialogHeader>
        
        <div className="bg-gradient-to-r from-primary-dark to-primary p-6 -mx-6 mt-2 rounded-t-xl">
          <div className="bg-dark/20 backdrop-blur-sm rounded-xl p-4 mb-4">
            <p className="text-sm text-slate-300 mb-1">Available Balance</p>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold mr-2">{formatCurrency(walletData.balance)}</span>
              <span className="text-sm text-slate-300">+ {walletData.coins} coins</span>
            </div>
          </div>
          
          <Tabs defaultValue="deposit" className="w-full">
            <TabsList className="grid grid-cols-2 bg-dark/30 backdrop-blur-sm">
              <TabsTrigger value="deposit">Deposit</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            </TabsList>
            
            <TabsContent value="deposit" className="mt-4">
              <div className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={handleAmountChange}
                    className="bg-dark/30 backdrop-blur-sm border-slate-600"
                  />
                </div>
                <Button 
                  className="w-full bg-white text-primary hover:bg-slate-100"
                  onClick={handleDeposit}
                  disabled={depositMutation.isPending}
                >
                  {depositMutation.isPending ? "Processing..." : "Add Money"}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="withdraw" className="mt-4">
              <div className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={handleAmountChange}
                    className="bg-dark/30 backdrop-blur-sm border-slate-600"
                  />
                </div>
                <Button 
                  className="w-full bg-dark/30 backdrop-blur-sm text-white hover:bg-dark/50"
                  onClick={handleWithdraw}
                  disabled={withdrawMutation.isPending}
                >
                  {withdrawMutation.isPending ? "Processing..." : "Withdraw"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="pt-4">
          <h4 className="font-medium mb-4">Recent Transactions</h4>
          
          <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
            {walletData.transactions.length === 0 ? (
              <p className="text-center text-sm text-slate-400">No transactions yet</p>
            ) : (
              walletData.transactions.slice(0, 5).map((transaction) => (
                <motion.div 
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mr-3">
                      {getTransactionIcon(transaction.type, transaction.status)}
                    </div>
                    <div>
                      <p className="font-medium capitalize">{transaction.type.replace('_', ' ')}</p>
                      <p className="text-xs text-slate-400">
                        {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  {getTransactionAmount(transaction.amount, transaction.type)}
                </motion.div>
              ))
            )}
          </div>
          
          <div className="mt-6 text-center">
            <Button variant="link" asChild>
              <a href="/wallet" className="text-primary">View All Transactions</a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
