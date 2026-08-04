import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Index from "@/pages/Index";

export function RoleBasedHome() {
  const { role, roleLoading } = useAuth();

  if (roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (role === "super_admin") return <Navigate to="/admin" replace />;

  return <Index />;
}
