import { FlaskConical, Calculator } from "lucide-react";
import { CalculatorCard } from "@/components/calculators/CalculatorCard";

const Dimensionamento3100 = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <FlaskConical className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              Embio 3100
            </h1>
            <p className="text-sm text-muted-foreground">
              Tratamento biológico para dejetos animais
            </p>
          </div>
        </div>
      </div>

      <CalculatorCard
        title="Dimensionamento Embio 3100"
        description="Insira o número de animais para calcular a quantidade de frascos necessária."
        inputLabel="Número de Animais"
        inputPlaceholder="Ex: 5000"
        calculate={(value) => {
          const frascos = Math.ceil(value / 1000);
          return {
            frascos,
            porAplicacao: Math.ceil(frascos / 2),
            frequencia: "15 em 15 dias",
            detalhes: `Para ${value.toLocaleString("pt-BR")} animais, você precisará de ${frascos} frasco(s) a cada aplicação.`,
          };
        }}
        icon={<Calculator className="h-5 w-5" />}
        productName="Embio 3100"
      />

      <p className="text-[11px] text-muted-foreground/60 text-center">
        Cálculos baseados em parâmetros técnicos oficiais Embio
      </p>
    </div>
  );
};

export default Dimensionamento3100;
