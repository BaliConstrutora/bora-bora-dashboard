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
    
      
        


          

B


          {!collapsed && (
            


              Bora Bora
              Construtora Bali
            


          )}
        


      
      
        
          
            
              
                
                  Dashboard
                
              
              
                
                  
                    
                      Atestados
                      
                    
                  
                  
                    
                      {atestadosSubItems.map((item) => {
                        const isActive = item.url === "/atestados" ? pathname === "/atestados" : pathname === item.url;
                        return (
                          
                            
                              {item.title}
                            
                          
                        );
                      })}
                    
                  
                
              
              
                
                  Licitações
                
              
              
                
                  Concorrências
                
              
            
          
        
      
    
  );
}