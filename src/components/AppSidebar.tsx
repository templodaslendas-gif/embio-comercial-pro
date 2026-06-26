import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  FileText,
  Users,
  UserCheck,
  CalendarDays,
  BookOpen,
  Headphones,
  Droplets,
  Package,
  Cog,
  ChevronDown,
  FlaskConical,
  Flame,
  Rocket,
  Palette,
  LayoutList,
} from "lucide-react";
import { useBranding } from "@/hooks/useBranding";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const navLinkBase =
  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/70 transition-all duration-200 hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground";
const navLinkActive =
  "bg-sidebar-accent text-sidebar-primary font-semibold";
const subLinkBase =
  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-sidebar-foreground/60 transition-all duration-200 hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground";
const subLinkActive =
  "bg-sidebar-accent text-sidebar-primary font-semibold";

export function AppSidebar() {
  const [produtosOpen, setProdutosOpen] = useState(false);
  const [propulsoresOpen, setPropulsoresOpen] = useState(false);
  const { t } = useTranslation();
  const { branding } = useBranding();

  const mainMenuItems = [
    { title: t("sidebar.dashboard"), url: "/", icon: LayoutDashboard },
    { title: "Clientes", url: "/clientes", icon: UserCheck },
    { title: "Catálogo", url: "/catalogo", icon: LayoutList },
    { title: "Agenda", url: "/agenda", icon: CalendarDays },
    { title: t("sidebar.newQuote"), url: "/novo-orcamento", icon: FileText },
    { title: t("sidebar.myClients"), url: "/meus-clientes", icon: Users },
  ];

  const produtoItems = [
    { title: "Embio 3100", url: "/produtos/embio-3100", icon: FlaskConical },
    { title: "Embio 3000", url: "/produtos/embio-3000", icon: Droplets },
    { title: "Embio 6000", url: "/produtos/embio-6000", icon: Flame },
    { title: "Embio 5000+", url: "/produtos/embio-5000", icon: Rocket },
    { title: "Embio 8000", url: "/produtos/embio-8000", icon: Droplets },
  ];

  const propulsorItems = [
    { title: "Propulsor 3CV", url: "/propulsores/3cv" },
    { title: "Propulsor 4CV", url: "/propulsores/4cv" },
    { title: "Propulsor 5CV", url: "/propulsores/5cv" },
    { title: "Propulsor 7,5 CV", url: "/propulsores/7-5cv" },
    { title: "Propulsor 10CV", url: "/propulsores/10cv" },
  ];

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="p-5 pb-4">
        <div className="flex items-center gap-3">
          {branding.logo_url ? (
            <img src={branding.logo_url} alt={branding.app_name} className="h-10 w-10 rounded-lg object-contain bg-sidebar-accent/40" />
          ) : (
            <span className="text-3xl">🐷</span>
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold tracking-tight text-sidebar-primary truncate">
              {branding.app_name}
            </h1>
            {branding.slogan && (
              <p className="text-[10px] text-sidebar-foreground/50 italic">
                {branding.slogan}
              </p>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/35 text-[10px] uppercase tracking-[0.15em] mb-1 px-3">
            {t("sidebar.menu")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={navLinkBase}
                      activeClassName={navLinkActive}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Produtos */}
              <li>
                <Collapsible open={produtosOpen} onOpenChange={setProdutosOpen}>
                  <CollapsibleTrigger className={`${navLinkBase} w-full`}>
                    <Package className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">{t("sidebar.products")}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                        produtosOpen ? "rotate-180" : ""
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ul className="ml-4 mt-1 space-y-0.5 border-l border-sidebar-border/60 pl-3">
                      {produtoItems.map((item) => (
                        <li key={item.title}>
                          <NavLink
                            to={item.url}
                            className={subLinkBase}
                            activeClassName={subLinkActive}
                          >
                            <item.icon className="h-3.5 w-3.5 shrink-0" />
                            <span>{item.title}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              </li>

              {/* Propulsores */}
              <li>
                <Collapsible open={propulsoresOpen} onOpenChange={setPropulsoresOpen}>
                  <CollapsibleTrigger className={`${navLinkBase} w-full`}>
                    <Cog className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">{t("sidebar.propulsors")}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                        propulsoresOpen ? "rotate-180" : ""
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ul className="ml-4 mt-1 space-y-0.5 border-l border-sidebar-border/60 pl-3">
                      {propulsorItems.map((item) => (
                        <li key={item.title}>
                          <NavLink
                            to={item.url}
                            className={subLinkBase}
                            activeClassName={subLinkActive}
                          >
                            <Cog className="h-3.5 w-3.5 shrink-0" />
                            <span>{item.title}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              </li>

              {/* Instruções */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/instrucoes"
                    className={navLinkBase}
                    activeClassName={navLinkActive}
                  >
                    <BookOpen className="h-4 w-4 shrink-0" />
                    <span>{t("sidebar.instructions")}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Configurações da marca */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/configuracoes-marca"
                    className={navLinkBase}
                    activeClassName={navLinkActive}
                  >
                    <Palette className="h-4 w-4 shrink-0" />
                    <span>{t("sidebar.branding")}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/35 text-[10px] uppercase tracking-[0.15em] mb-1 px-3">
            {t("sidebar.external")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a
                    href={`https://wa.me/5545999317831?text=${encodeURIComponent(
                      `Vim pelo app ${(branding.company_name || branding.app_name || "").trim()}, preciso de suporte.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={navLinkBase}
                  >
                    <Headphones className="h-4 w-4 shrink-0" />
                    <span>{t("sidebar.support")}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <p className="text-[10px] text-sidebar-foreground/25 text-center">
          {t("sidebar.copyright")}
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
