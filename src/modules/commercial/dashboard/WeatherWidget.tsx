import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Cloud, CloudRain, CloudSnow, Sun, CloudSun, CloudLightning, CloudFog, MapPin, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";

// TODO: allow user to configure their default city
const DEFAULT = { lat: -24.5557, lon: -54.0689, name: "Marechal C. Rondon" };
const ASKED_KEY = "ff_geo_asked_v1";

type Coords = { lat: number; lon: number; name: string };
type PermState = "granted" | "denied" | "prompt" | "unknown";

function iconFor(code: number) {
  if ([0, 1].includes(code)) return Sun;
  if ([2].includes(code)) return CloudSun;
  if ([3].includes(code)) return Cloud;
  if ([45, 48].includes(code)) return CloudFog;
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return CloudRain;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return CloudSnow;
  if ([95, 96, 99].includes(code)) return CloudLightning;
  return Cloud;
}

function descFor(code: number) {
  if ([0].includes(code)) return "Sol";
  if ([1, 2].includes(code)) return "P. nubl.";
  if ([3].includes(code)) return "Nublado";
  if ([45, 48].includes(code)) return "Neblina";
  if ([51, 53, 55].includes(code)) return "Garoa";
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "Chuva";
  if ([66, 67].includes(code)) return "Chuva gel.";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Neve";
  if ([95, 96, 99].includes(code)) return "Tempest.";
  return "—";
}

async function fetchWeather({ lat, lon }: Coords) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&current=temperature_2m,weather_code&timezone=auto&forecast_days=7`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("weather");
  return res.json();
}

export function WeatherWidget() {
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
        try { localStorage.setItem(ASKED_KEY, "granted"); } catch { /* ignore */ }
        setRequesting(false);
      },
      () => {
        setPermission("denied");
        try { localStorage.setItem(ASKED_KEY, "denied"); } catch { /* ignore */ }
        setRequesting(false);
      },
      { timeout: 10000, maximumAge: 600000, enableHighAccuracy: true },
    );
  };

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setPermission("denied");
      return;
    }

    const init = async () => {
      let state: PermState = "unknown";
      try {
        if ("permissions" in navigator) {
          const status = await navigator.permissions.query({ name: "geolocation" as PermissionName });
          state = status.state as PermState;
          status.onchange = () => setPermission(status.state as PermState);
        }
      } catch { /* fallback abaixo */ }

      setPermission(state);

      if (state === "granted") {
        requestLocation();
      }
    };

    init();
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["weather", coords.lat, coords.lon],
    queryFn: () => fetchWeather(coords),
    staleTime: 30 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
  });

  const showPromptBanner = permission === "prompt" || permission === "unknown";
  const showDeniedBanner = permission === "denied";

  return (
    <div className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/15 via-card/80 to-primary/10 backdrop-blur-sm p-3 space-y-2">
      {showPromptBanner && (
        <div className="flex items-center justify-between gap-2 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1.5">
          <div className="flex items-center gap-1.5 text-xs text-foreground min-w-0">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">Usar sua localização?</span>
          </div>
          <Button
            size="sm"
            className="h-7 px-2.5 text-xs shrink-0"
            onClick={requestLocation}
            disabled={requesting}
          >
            {requesting ? "..." : "Permitir"}
          </Button>
        </div>
      )}

      {showDeniedBanner && (
        <div className="flex items-center justify-between gap-2 rounded-lg bg-muted/60 border border-border px-2.5 py-1.5">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Localização bloqueada — ative no navegador.</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-[11px] shrink-0"
            onClick={requestLocation}
            disabled={requesting}
          >
            Tentar
          </Button>
        </div>
      )}

      {isLoading || !data ? (
        <div className="h-20 animate-pulse rounded-lg bg-background/30" />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{coords.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {(() => {
                const CurrentIcon = iconFor(data.current?.weather_code ?? 0);
                const currentTemp = Math.round(data.current?.temperature_2m ?? 0);
                return (
                  <>
                    <CurrentIcon className="h-6 w-6 text-accent" />
                    <span className="text-xl font-bold tabular-nums">{currentTemp}°</span>
                  </>
                );
              })()}
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {data.daily.time.map((t: string, i: number) => {
              const Icon = iconFor(data.daily.weather_code[i]);
              const max = Math.round(data.daily.temperature_2m_max[i]);
              const min = Math.round(data.daily.temperature_2m_min[i]);
              const day = format(new Date(t + "T00:00:00"), "EEE", { locale: ptBR }).slice(0, 3);
              return (
                <div key={t} className="flex flex-col items-center gap-0.5 rounded-lg py-1.5 bg-background/40">
                  <span className="text-[10px] uppercase font-medium text-muted-foreground">{day}</span>
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-[10px] tabular-nums font-semibold leading-tight">{max}°</span>
                  <span className="text-[9px] tabular-nums text-muted-foreground leading-tight">{min}°</span>
                  <span className="text-[8px] text-muted-foreground leading-tight truncate max-w-full px-0.5">{descFor(data.daily.weather_code[i])}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
