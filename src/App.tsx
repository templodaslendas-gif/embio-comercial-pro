import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { BrandingProvider } from "@/hooks/useBranding";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NovoOrcamento from "./pages/NovoOrcamento";
import MeusClientes from "./pages/MeusClientes";
import InstrucoesPreparo from "./pages/InstrucoesPreparo";
import ConfiguracoesMarca from "./pages/ConfiguracoesMarca";
import Embio3100 from "./pages/produtos/Embio3100";
import Embio3000 from "./pages/produtos/Embio3000";
import Embio6000 from "./pages/produtos/Embio6000";
import Embio5000 from "./pages/produtos/Embio5000";
import Embio8000 from "./pages/produtos/Embio8000";
import Propulsor3CV from "./pages/propulsores/Propulsor3CV";
import Propulsor4CV from "./pages/propulsores/Propulsor4CV";
import Propulsor5CV from "./pages/propulsores/Propulsor5CV";
import Propulsor75CV from "./pages/propulsores/Propulsor75CV";
import Propulsor10CV from "./pages/propulsores/Propulsor10CV";
import Catalogo from "./pages/Catalogo";
import Clientes from "./pages/Clientes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <BrandingProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/novo-orcamento" element={<NovoOrcamento />} />
                        <Route path="/meus-clientes" element={<MeusClientes />} />
                        <Route path="/catalogo" element={<Catalogo />} />
                        <Route path="/clientes" element={<Clientes />} />
                        <Route path="/instrucoes" element={<InstrucoesPreparo />} />
                        <Route path="/configuracoes-marca" element={<ConfiguracoesMarca />} />
                        <Route path="/produtos/embio-3100" element={<Embio3100 />} />
                        <Route path="/produtos/embio-3000" element={<Embio3000 />} />
                        <Route path="/produtos/embio-6000" element={<Embio6000 />} />
                        <Route path="/produtos/embio-5000" element={<Embio5000 />} />
                        <Route path="/produtos/embio-8000" element={<Embio8000 />} />
                        <Route path="/propulsores/3cv" element={<Propulsor3CV />} />
                        <Route path="/propulsores/4cv" element={<Propulsor4CV />} />
                        <Route path="/propulsores/5cv" element={<Propulsor5CV />} />
                        <Route path="/propulsores/7-5cv" element={<Propulsor75CV />} />
                        <Route path="/propulsores/10cv" element={<Propulsor10CV />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrandingProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
