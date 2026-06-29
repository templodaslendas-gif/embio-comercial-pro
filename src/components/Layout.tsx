import { useTranslation } from "react-i18next";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/hooks/useAuth";
import { useBranding } from "@/hooks/useBranding";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Moon, Sun, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FFRFooter } from "@/components/FFRFooter";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const { branding } = useBranding();
  const { theme, toggle } = useTheme();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const companyName = branding.company_name || branding.app_name || "Embio";

  const fullDate = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const dateDisplay = fullDate.charAt(0).toUpperCase() + fullDate.slice(1);

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

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/50 bg-background/95 backdrop-blur-sm px-4 md:px-5">
            {/* Esquerda: trigger + saudação */}
            <div className="flex items-center gap-3 min-w-0">
              <SidebarTrigger className="h-7 w-7 shrink-0 text-muted-foreground/60 hover:text-foreground transition-colors" />
              <div className="hidden sm:block min-w-0">
                <p className="text-sm font-semibold text-foreground leading-none truncate">
                  {greeting}, {companyName}
                </p>
                <p className="text-[11px] text-muted-foreground/55 mt-0.5 leading-none truncate">
                  {dateDisplay}
                </p>
              </div>
            </div>

            {/* Direita: avatar com dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 rounded-full p-0 hover:bg-muted/60 transition-colors shrink-0"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-muted text-[10px] font-semibold text-muted-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <div className="px-3 py-2.5 border-b border-border/50">
                  <p className="text-[12px] font-semibold truncate">{displayName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                </div>
                <DropdownMenuItem className="gap-2 text-[12px] cursor-pointer mt-0.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggle} className="gap-2 text-[12px] cursor-pointer">
                  {theme === "dark"
                    ? <Sun className="h-3.5 w-3.5 text-muted-foreground" />
                    : <Moon className="h-3.5 w-3.5 text-muted-foreground" />}
                  {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={signOut}
                  className="gap-2 text-destructive focus:text-destructive cursor-pointer text-[12px]"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  {t("layout.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
