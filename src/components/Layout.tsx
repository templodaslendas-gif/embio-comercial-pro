import { useTranslation } from "react-i18next";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/hooks/useAuth";
import { useBranding } from "@/hooks/useBranding";
import { Button } from "@/components/ui/button";
import { LogOut, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const { t, i18n } = useTranslation();
  const { branding } = useBranding();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Usuário";

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR", {
    weekday: "short", day: "2-digit", month: "short",
  });

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "pt" ? "en" : "pt");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <header className="sticky top-0 z-30 flex h-11 items-center justify-between border-b border-border/50 bg-background px-4 md:px-5">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-7 w-7 text-muted-foreground/60 hover:text-foreground transition-colors" />
              <span className="hidden sm:block text-xs text-muted-foreground/50 ml-1 capitalize">{dateStr}</span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="h-7 px-2 text-[11px] text-muted-foreground/60 hover:text-foreground font-medium rounded-md"
              >
                <Globe className="h-3 w-3 mr-1" />
                {i18n.language === "pt" ? "EN" : "PT"}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 h-8 px-2 rounded-lg hover:bg-muted/60 transition-colors"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground shrink-0">
                      {initials}
                    </div>
                    <span className="hidden md:block text-[12px] font-medium text-foreground/70 max-w-[120px] truncate">
                      {displayName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 rounded-lg">
                  <div className="px-3 py-2 border-b border-border/50">
                    <p className="text-[12px] font-medium truncate">{displayName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuItem
                    onClick={signOut}
                    className="gap-2 text-destructive focus:text-destructive cursor-pointer mt-1 text-[12px]"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    {t("layout.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 p-5 md:p-7 lg:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
