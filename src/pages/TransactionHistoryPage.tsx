import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FinancialLayout } from "@/components/FinancialLayout";
import { useAuth } from "@/hooks/useAuth";

export default function TransactionHistoryPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <FinancialLayout defaultTab="transactions" />;
}