import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, role, roleLoading } = useAuth();

  const isResolving = loading || (!!user && roleLoading);
  const isDenied = !isResolving && !!user && role !== "super_admin";

  useEffect(() => {
    if (isDenied) {
      toast.error("Acesso negado. Esta área é restrita ao Super Admin.");
    }
  }, [isDenied]);

  if (isResolving) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (role !== "super_admin") return <Navigate to="/" replace />;

  return <>{children}</>;
}
