import { Rocket, Droplets, Flame } from "lucide-react";
import { CalculatorCard } from "@/components/calculators/CalculatorCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DimensionamentoPropulsor = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Rocket className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              Propulsor
            </h1>
            <p className="text-sm text-muted-foreground">
              Calculadoras para Embio 3000/8000, 6000 e 5000+
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="3000-8000" className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-muted/60">
          <TabsTrigger value="3000-8000" className="text-xs md:text-sm">
            3000 & 8000
          </TabsTrigger>
          <TabsTrigger value="6000" className="text-xs md:text-sm">
            6000
          </TabsTrigger>
          <TabsTrigger value="5000" className="text-xs md:text-sm">
            5000+
          </TabsTrigger>
        </TabsList>

        <TabsContent value="3000-8000" className="mt-4">
          <CalculatorCard
            title="Embio 3000 & 8000"
            description="Para tratamento de efluentes líquidos. Insira o volume em litros."
            inputLabel="Volume em Litros (L)"
            inputPlaceholder="Ex: 2100000"
            calculate={(value) => {
              const frascos = Math.ceil(value / 700000);
              return {
                frascos,
                porAplicacao: Math.ceil(frascos / 2),
                frequencia: "15 em 15 dias",
                detalhes: `Para ${value.toLocaleString("pt-BR")} litros, você precisará de ${frascos} frasco(s) a cada aplicação.`,
              };
            }}
            icon={<Droplets className="h-5 w-5" />}
            productName="Embio 3000 & 8000"
          />
        </TabsContent>

        <TabsContent value="6000" className="mt-4">
          <CalculatorCard
            title="Embio 6000"
            description="Exclusivo para Biodigestor. Insira o número de animais."
            inputLabel="Número de Animais"
            inputPlaceholder="Ex: 3000"
            calculate={(value) => {
              const frascos = Math.ceil(value / 1000);
              return {
                frascos,
                porAplicacao: Math.ceil(frascos / 2),
                frequencia: "10 em 10 dias",
                detalhes: `Para ${value.toLocaleString("pt-BR")} animais (biodigestor), você precisará de ${frascos} frasco(s) a cada aplicação.`,
              };
            }}
            icon={<Flame className="h-5 w-5" />}
            productName="Embio 6000"
          />
        </TabsContent>

        <TabsContent value="5000" className="mt-4">
          <CalculatorCard
            title="Embio 5000+"
            description="Para baias de cavalos. Insira o número de baias."
            inputLabel="Número de Baias"
            inputPlaceholder="Ex: 120"
            calculate={(value) => {
              const frascos = Math.ceil(value / 60);
              return {
                frascos,
                porAplicacao: Math.ceil(frascos / 2),
                frequencia: "Semanal",
                detalhes: `Para ${value.toLocaleString("pt-BR")} baias, você precisará de ${frascos} frasco(s) por semana. Cada frasco gera 60L de calda e trata até 60 baias.`,
              };
            }}
            icon={<Rocket className="h-5 w-5" />}
            productName="Embio 5000+"
          />
        </TabsContent>
      </Tabs>

      <p className="text-[11px] text-muted-foreground/60 text-center">
        Cálculos baseados em parâmetros técnicos oficiais Embio
      </p>
    </div>
  );
};

export default DimensionamentoPropulsor;
