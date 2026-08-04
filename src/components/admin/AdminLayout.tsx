import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useAuth } from "@/hooks/useAuth";
import { FFRFooter } from "@/components/FFRFooter";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/50 bg-background/95 backdrop-blur-sm px-4 md:px-5">
            <div className="flex items-center gap-3 min-w-0">
              <SidebarTrigger className="h-7 w-7 shrink-0 text-muted-foreground/60 hover:text-foreground transition-colors" />
              <p className="text-sm font-semibold text-foreground leading-none truncate">
                Painel Administrativo
              </p>
            </div>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </header>

          <main className="flex-1 p-5 md:p-7 lg:p-8">
            {children}
            <FFRFooter className="mt-8" />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
