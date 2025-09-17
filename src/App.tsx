import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/useAuth";
import { WalletProvider } from "@/hooks/useWallet";
import { SecurityProvider } from "@/components/SecurityProvider";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AutomationDetails from "./pages/AutomationDetails";
import OrderDetails from "./pages/OrderDetails";
import NewOrder from "./pages/NewOrder";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import FinancialPage from "./pages/FinancialPage";
import WithdrawPage from "./pages/WithdrawPage";
import TransactionHistoryPage from "./pages/TransactionHistoryPage";
import NotFound from "./pages/NotFound";
import "./App.css"

const App = () => (
  <>
      <Toaster />
      <Sonner />
      <SecurityProvider>
        <AuthProvider>
          <WalletProvider>
            <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/automation/:id" element={<AutomationDetails />} />
              <Route path="/order/:id" element={<OrderDetails />} />
              <Route path="/new-order" element={<NewOrder />} />
              <Route path="/deposit" element={<FinancialPage />} />
              <Route path="/withdraw" element={<WithdrawPage />} />
              <Route path="/transaction-history" element={<TransactionHistoryPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </BrowserRouter>
          </WalletProvider>
        </AuthProvider>
      </SecurityProvider>
  </>
);

export default App;
