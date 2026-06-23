import {
  Leaf,
  Droplets,
  Sprout,
  ShieldCheck,
  Recycle,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const benefits = [
  {
    icon: Droplets,
    title: "Tratamento de Efluentes",
    description:
      "Reduz a carga orgânica e o odor dos efluentes da fertirrigação, tornando o processo mais sustentável.",
  },
  {
    icon: Sprout,
    title: "Bioestimulante Natural",
    description:
      "Promove o crescimento radicular e a absorção de nutrientes pelas plantas de forma natural.",
  },
  {
    icon: ShieldCheck,
    title: "Seguro e Sustentável",
    description:
      "100% biológico, sem resíduos químicos. Seguro para operadores, animais e meio ambiente.",
  },
  {
    icon: Recycle,
    title: "Economia Circular",
    description:
      "Transforma dejetos em fertilizante de alta qualidade, fechando o ciclo de nutrientes na propriedade.",
  },
];

const Embiofert = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Leaf className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              Tratamento Embiofert
            </h1>
            <p className="text-sm text-muted-foreground">
              Fertilizante biológico para fertirrigação sustentável
            </p>
          </div>
        </div>
      </div>

      {/* Hero Card */}
      <Card className="overflow-hidden border-0 shadow-card gradient-hero text-primary-foreground">
        <CardContent className="p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold mb-3">
            Transforme Dejetos em Fertilizante
          </h2>
          <p className="text-primary-foreground/85 text-sm md:text-base leading-relaxed max-w-2xl">
            O Embiofert é a solução biológica da Embio para tratamento de
            efluentes na fertirrigação. Através de microrganismos selecionados,
            acelera a decomposição da matéria orgânica, reduz odores e transforma
            dejetos em um fertilizante natural de alta qualidade.
          </p>
          <a
            href="https://embio.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-5 rounded-lg bg-primary-foreground/15 px-4 py-2.5 text-sm font-medium text-primary-foreground backdrop-blur-sm transition-all hover:bg-primary-foreground/25"
          >
            Saiba mais no site oficial
            <ArrowRight className="h-4 w-4" />
          </a>
        </CardContent>
      </Card>

      {/* Benefits Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {benefits.map((benefit, i) => (
          <Card
            key={benefit.title}
            className="border border-border/50 shadow-card hover:shadow-card-hover transition-shadow duration-300 animate-fade-in"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <benefit.icon className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-base">{benefit.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground/60 text-center pt-4">
        Cálculos baseados em parâmetros técnicos oficiais Embio
      </p>
    </div>
  );
};

export default Embiofert;
