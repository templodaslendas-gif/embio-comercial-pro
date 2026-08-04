import { LayoutDashboard, LogOut, ArrowLeftCircle, Users } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";

const nav =
  "flex items-center gap-2.5 w-full rounded-lg px-2.5 py-2.5 text-[14px] text-slate-200 transition-all duration-200 hover:bg-white/10 hover:text-white";
const navActive =
  "bg-sidebar-primary/14 text-white font-semibold shadow-[inset_2px_0_0_0_hsl(var(--sidebar-primary)),0_2px_10px_-4px_hsl(var(--sidebar-primary)/0.4)]";

export function AdminSidebar() {
  const { signOut } = useAuth();

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-md bg-sidebar-primary flex items-center justify-center shrink-0">
            <LayoutDashboard className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate leading-tight">
              Super Admin
            </p>
            <p className="text-sm text-sidebar-foreground/60 truncate leading-tight mt-0.5">
              Painel administrativo
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2 gap-0">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin" end className={nav} activeClassName={navActive}>
                    <LayoutDashboard className="h-[15px] w-[15px] shrink-0 opacity-85" />
                    <span>Dashboard</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/vendedores" className={nav} activeClassName={navActive}>
                    <Users className="h-[15px] w-[15px] shrink-0 opacity-85" />
                    <span>Vendedores</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/" className={nav} activeClassName={navActive}>
                    <ArrowLeftCircle className="h-[15px] w-[15px] shrink-0 opacity-85" />
                    <span>Ambiente comercial</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-3.5 border-t border-white/10">
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-sm text-sidebar-foreground/70 hover:text-white transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sair
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
