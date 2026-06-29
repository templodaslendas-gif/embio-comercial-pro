import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Cloud, CloudRain, CloudSnow, Sun, CloudSun, CloudLightning,
  CloudFog, MapPin, AlertCircle, Wind, Droplets,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const DEFAULT = { lat: -24.5557, lon: -54.0689, name: "Marechal C. Rondon" };
const ASKED_KEY = "ff_geo_asked_v2";

type Coords = { lat: number; lon: number; name: string };
type PermState = "granted" | "denied" | "prompt" | "unknown";

function iconFor(code: number): React.ElementType {
  if ([0, 1].includes(code)) return Sun;
  if ([2].includes(code)) return CloudSun;
  if ([3].includes(code)) return Cloud;
  if ([45, 48].includes(code)) return CloudFog;
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return CloudRain;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return CloudSnow;
  if ([95, 96, 99].includes(code)) return CloudLightning;
  return Cloud;
}

function descFor(code: number): string {
  if ([0].includes(code)) return "Céu aberto";
  if ([1, 2].includes(code)) return "Parcialmente nublado";
  if ([3].includes(code)) return "Nublado";
  if ([45, 48].includes(code)) return "Neblina";
  if ([51, 53, 55].includes(code)) return "Garoa";
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "Chuva";
  if ([66, 67].includes(code)) return "Chuva gelada";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Neve";
  if ([95, 96, 99].includes(code)) return "Tempestade";
  return "—";
}

function gradientFor(code: number): string {
  if ([0, 1].includes(code)) return "from-sky-500/20 via-blue-400/10 to-transparent";
  if ([2].includes(code)) return "from-slate-400/20 via-blue-300/10 to-transparent";
  if ([3].includes(code)) return "from-slate-500/20 via-slate-400/10 to-transparent";
  if ([45, 48].includes(code)) return "from-gray-400/20 via-gray-300/10 to-transparent";
  if ([51, 53, 55, 61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return "from-blue-600/20 via-blue-400/10 to-transparent";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "from-sky-200/20 via-blue-100/10 to-transparent";
  if ([95, 96, 99].includes(code)) return "from-violet-600/20 via-purple-400/10 to-transparent";
  return "from-primary/10 via-accent/5 to-transparent";
}

async function fetchWeather({ lat, lon }: Coords) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max` +
    `&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m` +
    `&timezone=auto&forecast_days=7`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("weather_fetch_failed");
  return res.json();
}

export function PremiumWeather({ className, showSummary }: { className?: string; showSummary?: boolean }) {
  const [coords, setCoords] = useState<Coords>(DEFAULT);
  const [permission, setPermission] = useState<PermState>("unknown");
  const [requesting, setRequesting] = useState(false);

  const requestLocation = () => {
    if (!("geolocation" in navigator)) return;
    setRequesting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude, name: "Sua localização" });
        setPermission("granted");
        try { localStorage.setItem(ASKED_KEY, "granted"); } catch { /* noop */ }
        setRequesting(false);
      },
      () => {
        setPermission("denied");
        try { localStorage.setItem(ASKED_KEY, "denied"); } catch { /* noop */ }
        setRequesting(false);
      },
      { timeout: 10000, maximumAge: 600000, enableHighAccuracy: true },
    );
  };

  useEffect(() => {
    if (!("geolocation" in navigator)) { setPermission("denied"); return; }
    const init = async () => {
      let state: PermState = "unknown";
      try {
        if ("permissions" in navigator) {
          const s = await navigator.permissions.query({ name: "geolocation" as PermissionName });
          state = s.state as PermState;
          s.onchange = () => setPermission(s.state as PermState);
        }
      } catch { /* noop */ }
      setPermission(state);
      if (state === "granted") requestLocation();
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["weather-premium", coords.lat, coords.lon],
    queryFn: () => fetchWeather(coords),
    staleTime: 30 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
    retry: 1,
  });

  const weatherCode = data?.current?.weather_code ?? 0;
  const CurrentIcon = iconFor(weatherCode);
  const gradient = gradientFor(weatherCode);

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-border/40 bg-card/80 backdrop-blur-xl", className)}>
      <div className={cn("absolute inset-0 bg-gradient-to-br pointer-events-none", gradient)} />
      <div className="relative p-3 space-y-1.5">
        {(permission === "prompt" || permission === "unknown") ? (
          <div className="flex items-center justify-between gap-2 rounded-lg bg-accent/8 border border-accent/15 px-3 py-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="h-3 w-3 text-accent shrink-0" />
              <span className="text-xs text-muted-foreground truncate">Usar minha localização?</span>
            </div>
            <Button size="sm" className="h-6 px-2.5 text-xs shrink-0 bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={requestLocation} disabled={requesting}>
              {requesting ? "..." : "Permitir"}
            </Button>
          </div>
        ) : permission === "denied" ? (
          <div className="flex items-center gap-2 rounded-lg bg-muted/30 border border-border/30 px-3 py-1.5">
            <AlertCircle className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-[11px] text-muted-foreground flex-1">Usando localização padrão.</span>
          </div>
        ) : null}

        {isLoading ? (
          <WeatherSkeleton />
        ) : isError || !data ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Não foi possível carregar o clima.</p>
          </div>
        ) : (
          <WeatherContent data={data} coords={coords} CurrentIcon={CurrentIcon} showSummary={showSummary} />
        )}
      </div>
    </div>
  );
}

function WeatherContent({
  data, coords, CurrentIcon, showSummary,
}: {
  data: Record<string, any>;
  coords: Coords;
  CurrentIcon: React.ElementType;
  showSummary?: boolean;
}) {
  const temp = Math.round(data.current?.temperature_2m ?? 0);
  const humidity = Math.round(data.current?.relative_humidity_2m ?? 0);
  const wind = Math.round(data.current?.wind_speed_10m ?? 0);
  const todayMax = Math.round(data.daily?.temperature_2m_max?.[0] ?? 0);
  const todayMin = Math.round(data.daily?.temperature_2m_min?.[0] ?? 0);
  const desc = descFor(data.current?.weather_code ?? 0);

  const ForecastDay = ({ t, i }: { t: string; i: number }) => {
    const Icon = iconFor(data.daily.weather_code[i]);
    const max = Math.round(data.daily.temperature_2m_max[i]);
    const min = Math.round(data.daily.temperature_2m_min[i]);
    const dayLabel = i === 0
      ? "Hoje"
      : format(new Date(t + "T00:00:00"), "EEE", { locale: ptBR })
          .replace(/^\w/, (c) => c.toUpperCase()).slice(0, 3);
    const isToday = i === 0;
    return (
      <div className={cn(
        "flex flex-col items-center gap-0.5 rounded-lg py-1.5 px-0.5 transition-colors",
        isToday ? "bg-accent/15 ring-1 ring-accent/20" : "bg-muted/20 hover:bg-muted/35",
      )}>
        <span className={cn("text-[10px] font-bold leading-none", isToday ? "text-accent" : "text-muted-foreground/65")}>
          {dayLabel}
        </span>
        <Icon className={cn("h-4 w-4 mt-0.5", isToday ? "text-accent" : "text-muted-foreground/60")} />
        <span className="text-[11px] tabular-nums font-bold text-foreground leading-tight">{max}°</span>
        <span className="text-[9px] tabular-nums text-muted-foreground/55 leading-tight">{min}°</span>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {/* Faixa horizontal principal */}
      <div className="flex items-center gap-3">
        {/* Temperatura atual */}
        <div className="flex items-center gap-2 shrink-0">
          <CurrentIcon className="h-11 w-11 text-accent shrink-0" />
          <div>
            <div className="flex items-start leading-none">
              <span className="text-5xl font-bold tabular-nums text-foreground">{temp}</span>
              <span className="text-xl font-light text-muted-foreground mt-1">°C</span>
            </div>
            <p className="text-[11px] text-muted-foreground/75 mt-0.5">{desc}</p>
          </div>
        </div>

        <div className="h-10 w-px bg-border/40 shrink-0" />

        {/* Localização + stats */}
        <div className="shrink-0">
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground/60 mb-1.5">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate max-w-[120px]">{coords.name}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1">
              <Droplets className="h-3 w-3 text-blue-400 shrink-0" />
              <span className="tabular-nums font-medium">{humidity}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Wind className="h-3 w-3 shrink-0" />
              <span className="tabular-nums font-medium">{wind} km/h</span>
            </div>
            <span className="tabular-nums text-foreground/70 font-semibold">{todayMax}°/{todayMin}°</span>
          </div>
        </div>

        <div className="h-10 w-px bg-border/40 shrink-0 hidden md:block" />

        {/* Previsão 7 dias — desktop inline */}
        <div className="hidden md:grid grid-cols-7 gap-1 flex-1 min-w-0">
          {(data.daily?.time ?? []).map((t: string, i: number) => (
            <ForecastDay key={t} t={t} i={i} />
          ))}
        </div>
      </div>

      {/* Previsão 7 dias — mobile (linha separada) */}
      <div className="md:hidden grid grid-cols-7 gap-1 pt-1 border-t border-border/25">
        {(data.daily?.time ?? []).map((t: string, i: number) => (
          <ForecastDay key={t} t={t} i={i} />
        ))}
      </div>

      {showSummary && <WeatherSummaryInline data={data} />}
    </div>
  );
}

function WeatherSummaryInline({ data }: { data: Record<string, any> }) {
  const codes: number[] = data.daily?.weather_code ?? [];
  const precip: number[] = data.daily?.precipitation_sum ?? [];
  const windMax: number[] = data.daily?.wind_speed_10m_max ?? [];

  const rainyDays = precip.slice(1, 7).filter((p) => p > 2).length;
  const stormDays = codes.slice(1, 7).filter((c) => c >= 95).length;
  const clearDays = codes.slice(1, 7).filter((c) => c <= 2).length;
  const highWind = windMax.slice(1, 7).some((w) => w > 50);

  const rainyIdx = precip
    .slice(1, 7)
    .map((p, i) => (p > 2 ? i + 1 : -1))
    .filter((i) => i !== -1);
  const dayNames = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
  const todayDow = new Date().getDay();
  const rainyDayNames = rainyIdx.map((i) => dayNames[(todayDow + i) % 7]);

  let text: string;
  if (stormDays >= 2) {
    text = "⚠ Risco de tempestades esta semana. Reagende visitas externas.";
  } else if (rainyDays >= 4) {
    text = "🌧 Semana chuvosa. Priorize reuniões internas e evite campo.";
  } else if (rainyDays >= 2) {
    const days = rainyDayNames.slice(0, 2).join(" e ");
    text = `🌦 Chuvas previstas ${days ? `em ${days}` : "em alguns dias"}. Aproveite os dias secos para visitas.`;
  } else if (clearDays >= 5 && !highWind) {
    text = "✨ Semana excelente para visitas técnicas e atendimento em campo.";
  } else if (highWind) {
    text = "💨 Vento forte esperado. Cuidado com aplicações e operações externas.";
  } else {
    text = "📅 Condições mistas. Acompanhe a previsão diária antes de sair.";
  }

  return (
    <div className="border-t border-border/25 pt-1.5">
      <p className="text-[11px] text-muted-foreground/70 leading-snug">{text}</p>
    </div>
  );
}

function WeatherSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 pt-1 border-t border-border/25">
        {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
      </div>
    </div>
  );
}
