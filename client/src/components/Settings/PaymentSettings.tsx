import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { CreditCard, Coins, Zap, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { planService } from '../../services/planService';
import type { TokenPlan, UserBalance } from '../../services/planService';
import { PaymentNotificationModal } from './PaymentNotificationModal';
import { TransactionHistory } from './TransactionHistory';

import { ErrorState } from '../ui/ErrorState';

export function PaymentSettings() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [plans, setPlans] = useState<TokenPlan[]>([]);
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [notificationStatus, setNotificationStatus] = useState<'processing' | 'success' | 'error' | 'canceled' | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const sessionId = searchParams.get('session_id');

    let cancelled = false;

    const verifyCheckout = async () => {
      if (!success || !sessionId) return;

      setNotificationStatus('processing');
      setIsNotificationOpen(true);

      for (let attempt = 0; attempt < 20; attempt += 1) {
        if (cancelled) return;
        try {
          const status = await planService.getCheckoutStatus(sessionId);
          if (cancelled) return;
          if (status.status === 'fulfilled') {
            setNotificationStatus('success');
            if (status.balance) setBalance(status.balance);
            return;
          }
          if (status.status === 'unpaid') {
            setNotificationStatus('error');
            return;
          }
        } catch {
        }
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      if (!cancelled) setNotificationStatus('error');
    };

    if (success && sessionId) {
      void verifyCheckout();
    } else if (success) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('success');
      params.delete('session_id');
      if (!params.get('tab')) params.set('tab', 'billing');
      router.replace(`${pathname}?${params.toString()}`);
    } else if (canceled) {
      setNotificationStatus('canceled');
      setIsNotificationOpen(true);
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [plansData, balanceData] = await Promise.all([
          planService.getPlans(),
          planService.getBalance()
        ]);
        setPlans(plansData);
        setBalance(balanceData);
      } catch {
        setError('Failed to load plans. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [searchParams, pathname, router]);

  const handlePurchase = async (planId: string) => {
    try {
      setIsPurchasing(planId);
      const response = await planService.purchasePlan(planId);
      if (response.checkout_url) {
        window.location.href = response.checkout_url;
      }
    } catch {
      setNotificationStatus('error');
      setIsNotificationOpen(true);
      setIsPurchasing(null);
    }
  };

  const handleNotificationClose = () => {
    setIsNotificationOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('success');
    params.delete('canceled');
    params.delete('error');
    params.delete('session_id');
    if (!params.get('tab')) params.set('tab', 'billing');
    router.replace(`${pathname}?${params.toString()}`);
    if (notificationStatus === 'success') {
      planService.getBalance().then(setBalance);
    }
    setNotificationStatus(null);
  };


  const getPlanIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'starter':
        return <Zap className="w-5 h-5" />;
      case 'pro':
        return <Coins className="w-5 h-5" />;
      case 'enterprise':
        return <ShieldCheck className="w-5 h-5" />;
      default:
        return <Zap className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState 
        title="Unable to load plans"
        message={error}
      />
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <div className="flex items-center gap-2 text-gray-900 font-semibold">
          <CreditCard className="w-5 h-5 text-primary-500" />
          <h2>Pay As You Go</h2>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium border border-blue-200">
            <Coins className="w-3.5 h-3.5" />
            <span>{balance?.balance ?? 0} Tokens Available</span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Purchase Tokens</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {"Don't have your own API key? No problem. Purchase tokens to use our premium AI models directly. Tokens are deducted only when you generate content."}
                </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>No subscription</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Secure payment</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Never expire</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
                <div 
                    key={plan.id}
                    className={`
                        rounded-xl p-5 relative flex flex-col transition-all cursor-pointer group
                        ${plan.is_popular 
                            ? 'border-2 border-primary-500 bg-white shadow-sm transform hover:-translate-y-1 duration-200' 
                            : 'border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
                        }
                    `}
                >
                    {plan.is_popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">
                            Most Popular
                        </div>
                    )}
                    
                    <div className={`w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600 ${!plan.is_popular && 'group-hover:scale-110 transition-transform'}`}>
                        {getPlanIcon(plan.name)}
                    </div>
                    
                    <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                    <div className="text-2xl font-bold text-gray-900 my-2">
                        {plan.tokens} <span className="text-sm font-normal text-gray-500">Tokens</span>
                    </div>
                    <div className="text-sm text-gray-500 mb-6">
                        ${plan.price.toFixed(2)} {plan.currency}
                    </div>
                    
                    <div className="mt-auto">
                        <Button 
                            size="sm" 
                            className={`w-full ${plan.is_popular ? 'bg-primary-500 hover:bg-primary-600 text-white border-transparent' : 'text-primary-600'}`}
                            variant={plan.is_popular ? 'primary' : 'outline'}
                            onClick={() => handlePurchase(plan.id)}
                            isLoading={isPurchasing === plan.id}
                            disabled={isPurchasing !== null}
                        >
                            Buy {plan.name}
                        </Button>
                    </div>
                </div>
            ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
             <p>Transactions are secure and encrypted.</p>
             <p>Powered by Stripe</p>
        </div>
      </div>

      <PaymentNotificationModal 
        isOpen={isNotificationOpen}
        onClose={handleNotificationClose}
        status={notificationStatus}
      />

      <TransactionHistory />
    </div>
  );
}
