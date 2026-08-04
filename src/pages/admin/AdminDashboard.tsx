import { PremiumPage } from "@/components/premium/PremiumPage";
import { PremiumHeader } from "@/components/premium/PremiumHeader";
import { PremiumEmptyState } from "@/components/premium/PremiumEmptyState";
import { ShieldCheck } from "lucide-react";

export default function AdminDashboard() {
  return (
    <PremiumPage>
      <PremiumHeader
        icon={ShieldCheck}
        badge="Super Admin"
        title="Painel Administrativo"
        subtitle="Fundação segura de acesso ao Embio Intelligence Pro."
      />
      <div className="rounded-xl border border-border/60 bg-card">
        <PremiumEmptyState
          icon={ShieldCheck}
          title="Fundação implantada"
          description="Rankings, promoções, metas e gestão completa de vendedores chegam em missões futuras."
        />
      </div>
    </PremiumPage>
  );
}
