import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  total_earned: number;
  total_withdrawn: number;
  available_for_withdrawal: number;
  created_at: string;
  updated_at: string;
}

interface WalletContextType {
  wallet: Wallet | null;
  loading: boolean;
  fetchWallet: () => Promise<void>;
  refreshWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchWallet = async () => {
    if (!user) {
      setWallet(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If no wallet exists, create one
        if (error.code === 'PGRST116') {
          const { data: newWallet, error: createError } = await supabase
            .from('wallets')
            .insert({ user_id: user.id })
            .select()
            .single();
          
          if (!createError) {
            setWallet(newWallet);
          }
        }
        return;
      }
      setWallet(data);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshWallet = async () => {
    // Refresh without setting loading to true to avoid the flash
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!error) {
        setWallet(data);
      }
    } catch (error) {
      console.error('Error refreshing wallet:', error);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, [user]);

  const value = {
    wallet,
    loading,
    fetchWallet,
    refreshWallet
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}