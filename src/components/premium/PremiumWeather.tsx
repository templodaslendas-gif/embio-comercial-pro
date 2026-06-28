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
  if ([0, 1].includes(code))
    return "from-sky-500/20 via-blue-400/10 to-transparent";
  if ([2].includes(code))
    return "from-slate-400/20 via-blue-300/10 to-transparent";
  if ([3].includes(code))
    return "from-slate-500/20 via-slate-400/10 to-transparent";
  if ([45, 48].includes(code))
    return "from-gray-400/20 via-gray-300/10 to-transparent";
  if ([51, 53, 55, 61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return "from-blue-600/20 via-blue-400/10 to-transparent";
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return "from-sky-200/20 via-blue-100/10 to-transparent";
  if ([95, 96, 99].includes(code))
    return "from-violet-600/20 via-purple-400/10 to-transparent";
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

export function PremiumWeather({ className }: { className?: string }) {
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
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/40",
        "bg-card/80 backdrop-blur-xl",
        className,
      )}
    >
      {/* gradient overlay */}
      <div className={cn("absolute inset-0 bg-gradient-to-br pointer-events-none", gradient)} />

      <div className="relative p-4 space-y-4">
        {/* Permission banners */}
        {permission === "prompt" || permission === "unknown" ? (
          <div className="flex items-center justify-between gap-2 rounded-xl bg-accent/8 border border-accent/15 px-3 py-2">
            <div className="flex items-center gap-2 text-xs text-foreground min-w-0">
              <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
              <span className="text-muted-foreground">Usar localização atual?</span>
            </div>
            <Button size="sm" className="h-7 px-3 text-xs shrink-0 bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={requestLocation} disabled={requesting}>
              {requesting ? "..." : "Permitir"}
            </Button>
          </div>
        ) : permission === "denied" ? (
          <div className="flex items-center gap-2 rounded-xl bg-muted/30 border border-border/30 px-3 py-2">
            <AlertCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-[11px] text-muted-foreground flex-1">Localização bloqueada — usando localização padrão.</span>
          </div>
        ) : null}

        {isLoading ? (
          <WeatherSkeleton />
        ) : isError || !data ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Não foi possível carregar o clima.</p>
          </div>
        ) : (
          <WeatherContent data={data} coords={coords} CurrentIcon={CurrentIcon} />
        )}
      </div>
    </div>
  );
}

function WeatherContent({
  data, coords, CurrentIcon,
}: {
  data: Record<string, any>;
  coords: Coords;
  CurrentIcon: React.ElementType;
}) {
  const temp = Math.round(data.current?.temperature_2m ?? 0);
  const humidity = Math.round(data.current?.relative_humidity_2m ?? 0);
  const wind = Math.round(data.current?.wind_speed_10m ?? 0);
  const todayMax = Math.round(data.daily?.temperature_2m_max?.[0] ?? 0);
  const todayMin = Math.round(data.daily?.temperature_2m_min?.[0] ?? 0);
  const desc = descFor(data.current?.weather_code ?? 0);

  return (
    <>
      {/* Current weather */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/55 mb-2">
            <MapPin className="h-3 w-3" />
            <span className="truncate max-w-[140px]">{coords.name}</span>
          </div>
          <div className="flex items-end gap-3">
            <CurrentIcon className="h-10 w-10 text-accent mb-0.5 shrink-0" />
            <div>
              <div className="flex items-start">
                <span className="text-5xl font-bold tabular-nums leading-none text-foreground">{temp}</span>
                <span className="text-2xl font-light text-muted-foreground mt-1">°C</span>
              </div>
              <p className="text-[11px] text-muted-foreground/70 mt-1">{desc}</p>
            </div>
          </div>
        </div>
        {/* Stats */}
        <div className="flex flex-col gap-2 text-right">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground justify-end">
            <Droplets className="h-3 w-3 text-blue-400" />
            <span className="tabular-nums">{humidity}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground justify-end">
            <Wind className="h-3 w-3 text-muted-foreground/60" />
            <span className="tabular-nums">{wind} km/h</span>
          </div>
          <div className="text-[10px] text-muted-foreground/50 leading-tight">
            <span className="tabular-nums text-foreground/80">{todayMax}°</span>
            {" / "}
            <span className="tabular-nums">{todayMin}°</span>
          </div>
        </div>
      </div>

      {/* 7-day forecast */}
      <div className="grid grid-cols-7 gap-1 pt-3 border-t border-border/25">
        {(data.daily?.time ?? []).map((t: string, i: number) => {
          const Icon = iconFor(data.daily.weather_code[i]);
          const max = Math.round(data.daily.temperature_2m_max[i]);
          const min = Math.round(data.daily.temperature_2m_min[i]);
          const dayLabel = i === 0 ? "Hj" : format(new Date(t + "T00:00:00"), "EEE", { locale: ptBR })
            .replace(/^\w/, (c) => c.toUpperCase()).slice(0, 3);
          const isToday = i === 0;
          return (
            <div
              key={t}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl py-2 px-0.5 transition-colors",
                isToday
                  ? "bg-accent/12 ring-1 ring-accent/20"
                  : "bg-muted/15 hover:bg-muted/25",
              )}
            >
              <span
                className={cn(
                  "text-[9px] uppercase font-semibold leading-none",
                  isToday ? "text-accent" : "text-muted-foreground/60",
                )}
              >
                {dayLabel}
              </span>
              <Icon
                className={cn(
                  "h-3.5 w-3.5 mt-0.5",
                  isToday ? "text-accent" : "text-muted-foreground/60",
                )}
              />
              <span className="text-[10px] tabular-nums font-semibold text-foreground leading-tight">
                {max}°
              </span>
              <span className="text-[9px] tabular-nums text-muted-foreground/50 leading-tight">
                {min}°
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}

function WeatherSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-12 w-36" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 pt-3 border-t border-border/25">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
