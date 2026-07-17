import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, FileCheck, Landmark, Building2, List, PlusCircle, Table2, ChevronDown } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, useSidebar } from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const atestadosSubItems = [
  { title: "Lista de Atestados", url: "/atestados", icon: List },
  { title: "Cadastro", url: "/atestados/novo", icon: PlusCircle },
  { title: "Planilha de Quantidades", url: "/atestados/planilha", icon: Table2 },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAtestadosActive = pathname.startsWith("/atestados");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-center p-2">
          <span className="text-xl font-bold">B</span>
        </div>
        {!collapsed && (
          <div className="px-4 pb-2 text-center">
            <div className="font-semibold">Bora Bora</div>
            <div className="text-xs text-muted-foreground">Construtora Bali</div>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/"}>
                  <Link to="/">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Collapsible defaultOpen={isAtestadosActive}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={isAtestadosActive}>
                      <FileCheck className="h-4 w-4" />
                      <span>Atestados</span>
                      <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {atestadosSubItems.map((item) => {
                        const isActive = item.url === "/atestados" ? pathname === "/atestados" : pathname === item.url;
                        return (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton asChild isActive={isActive}>
                              <Link to={item.url}>
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/licitacoes")}>
                  <Link to="/licitacoes">
                    <Landmark className="h-4 w-4" />
                    <span>Licitações</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/concorrencias")}>
                  <Link to="/concorrencias">
                    <Building2 className="h-4 w-4" />
                    <span>Concorrências</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}