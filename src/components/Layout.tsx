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

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "pt" ? "en" : "pt");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 bg-background/80 backdrop-blur-xl px-4 md:px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="mr-1" />
              <div className="hidden sm:flex items-center gap-2">
                {branding.logo_url ? (
                  <img src={branding.logo_url} alt={branding.app_name} className="h-7 w-auto object-contain" />
                ) : (
                  <span className="text-lg font-extrabold tracking-tight text-primary">
                    {branding.app_name}
                  </span>
                )}
                <span className="text-[11px] text-muted-foreground font-medium">
                  {t("layout.salesCalc")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="h-8 gap-1.5 px-2 rounded-xl text-xs font-medium"
              >
                <Globe className="h-3.5 w-3.5" />
                {i18n.language === "pt" ? "EN" : "PT"}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2.5 h-9 px-2 rounded-xl hover:bg-muted/60 transition-smooth"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                      {initials}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-foreground/80 max-w-[140px] truncate">
                      {displayName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                  <div className="px-3 py-2 border-b border-border/60">
                    <p className="text-sm font-medium truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                  <DropdownMenuItem
                    onClick={signOut}
                    className="gap-2 text-destructive focus:text-destructive cursor-pointer mt-1"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("layout.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
