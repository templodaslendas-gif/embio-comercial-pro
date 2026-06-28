import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard, FileText, Users, UserCheck, CalendarDays,
  BookOpen, Headphones, Droplets, Package, Cog, ChevronRight,
  FlaskConical, Flame, Rocket, Palette, LayoutList, Wheat,
} from "lucide-react";
import { useBranding } from "@/hooks/useBranding";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const nav =
  "flex items-center gap-2.5 w-full rounded-md px-2.5 py-[7px] text-[13px] text-sidebar-foreground/55 transition-colors duration-150 hover:bg-sidebar-primary/10 hover:text-sidebar-primary";
const navActive = "bg-sidebar-primary/14 text-sidebar-primary font-semibold";
const subNav =
  "flex items-center gap-2 w-full rounded-md px-2.5 py-[6px] text-[12px] text-sidebar-foreground/45 transition-colors duration-150 hover:bg-sidebar-primary/8 hover:text-sidebar-primary/80";
const subNavActive = "text-sidebar-primary/85 font-medium";

const Divider = () => <div className="mx-2.5 my-3 border-t border-border/30" />;

const GroupLabel = ({ children }: { children: React.ReactNode }) => (
  <SidebarGroupLabel className="text-[10px] px-2.5 py-1 uppercase tracking-widest text-sidebar-primary/40 font-bold">
    {children}
  </SidebarGroupLabel>
);

export function AppSidebar() {
  const [produtosOpen, setProdutosOpen] = useState(false);
  const [propulsoresOpen, setPropulsoresOpen] = useState(false);
  const { t } = useTranslation();
  const { branding } = useBranding();

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="px-4 py-4 border-b border-border/30">
        <div className="flex items-center gap-2.5">
          {branding.logo_url ? (
            <img
              src={branding.logo_url}
              alt={branding.app_name}
              className="h-7 w-7 rounded-md object-contain"
            />
          ) : (
            <div className="h-7 w-7 rounded-md bg-sidebar-primary flex items-center justify-center shrink-0">
              <Wheat className="h-4 w-4 text-white" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-sidebar-foreground truncate leading-tight">
              {branding.app_name}
            </p>
            <p className="text-[10px] text-sidebar-foreground/35 truncate leading-tight mt-0.5">
              {branding.slogan || "Biotecnologia · Agropecuária"}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2 gap-0">
        <SidebarGroup className="p-0">
          <GroupLabel>Comercial</GroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {[
                { title: t("sidebar.dashboard"), url: "/", icon: LayoutDashboard, end: true },
                { title: "Clientes", url: "/clientes", icon: UserCheck },
                { title: "Catálogo", url: "/catalogo", icon: LayoutList },
                { title: "Agenda", url: "/agenda", icon: CalendarDays },
              ].map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.end} className={nav} activeClassName={navActive}>
                      <item.icon className="h-[15px] w-[15px] shrink-0 opacity-70" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Divider />

        <SidebarGroup className="p-0">
          <GroupLabel>Orçamentos</GroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {[
                { title: t("sidebar.newQuote"), url: "/novo-orcamento", icon: FileText },
                { title: t("sidebar.myClients"), url: "/meus-clientes", icon: Users },
              ].map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={nav} activeClassName={navActive}>
                      <item.icon className="h-[15px] w-[15px] shrink-0 opacity-70" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Divider />

        <SidebarGroup className="p-0">
          <GroupLabel>Técnico</GroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              <li>
                <Collapsible open={produtosOpen} onOpenChange={setProdutosOpen}>
                  <CollapsibleTrigger className={cn(nav, "justify-between")}>
                    <span className="flex items-center gap-2.5">
                      <Package className="h-[15px] w-[15px] shrink-0 opacity-70" />
                      <span>{t("sidebar.products")}</span>
                    </span>
                    <ChevronRight className={cn("h-3 w-3 opacity-40 transition-transform duration-200", produtosOpen && "rotate-90")} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ul className="ml-5 mt-0.5 space-y-0.5 border-l border-border/30 pl-3">
                      {[
                        { title: "Embio 3100", url: "/produtos/embio-3100", icon: FlaskConical },
                        { title: "Embio 3000", url: "/produtos/embio-3000", icon: Droplets },
                        { title: "Embio 6000", url: "/produtos/embio-6000", icon: Flame },
                        { title: "Embio 5000+", url: "/produtos/embio-5000", icon: Rocket },
                        { title: "Embio 8000", url: "/produtos/embio-8000", icon: Droplets },
                      ].map((item) => (
                        <li key={item.title}>
                          <NavLink to={item.url} className={subNav} activeClassName={subNavActive}>
                            <item.icon className="h-3 w-3 shrink-0 opacity-60" />
                            <span>{item.title}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              </li>

              <li>
                <Collapsible open={propulsoresOpen} onOpenChange={setPropulsoresOpen}>
                  <CollapsibleTrigger className={cn(nav, "justify-between")}>
                    <span className="flex items-center gap-2.5">
                      <Cog className="h-[15px] w-[15px] shrink-0 opacity-70" />
                      <span>{t("sidebar.propulsors")}</span>
                    </span>
                    <ChevronRight className={cn("h-3 w-3 opacity-40 transition-transform duration-200", propulsoresOpen && "rotate-90")} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ul className="ml-5 mt-0.5 space-y-0.5 border-l border-border/30 pl-3">
                      {[
                        { title: "3 CV", url: "/propulsores/3cv" },
                        { title: "4 CV", url: "/propulsores/4cv" },
                        { title: "5 CV", url: "/propulsores/5cv" },
                        { title: "7,5 CV", url: "/propulsores/7-5cv" },
                        { title: "10 CV", url: "/propulsores/10cv" },
                      ].map((item) => (
                        <li key={item.title}>
                          <NavLink to={item.url} className={subNav} activeClassName={subNavActive}>
                            <Cog className="h-3 w-3 shrink-0 opacity-60" />
                            <span>{item.title}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              </li>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/instrucoes" className={nav} activeClassName={navActive}>
                    <BookOpen className="h-[15px] w-[15px] shrink-0 opacity-70" />
                    <span>{t("sidebar.instructions")}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Divider />

        <SidebarGroup className="p-0">
          <GroupLabel>Admin</GroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/configuracoes-marca" className={nav} activeClassName={navActive}>
                    <Palette className="h-[15px] w-[15px] shrink-0 opacity-70" />
                    <span>{t("sidebar.branding")}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a
                    href={`https://wa.me/5545999317831?text=${encodeURIComponent("Preciso de suporte.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={nav}
                  >
                    <Headphones className="h-[15px] w-[15px] shrink-0 opacity-70" />
                    <span>{t("sidebar.support")}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-3 border-t border-border/30">
        <p className="text-[10px] text-sidebar-foreground/25 text-center">{t("sidebar.copyright")}</p>
      </SidebarFooter>
    </Sidebar>
  );
}
