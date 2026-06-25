import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ChevronLeft,
  Clock,
  HelpCircle,
  X,
  ExternalLink
} from "lucide-react";
import { PdrRow, AppConfig, Proyecto, Llamado } from "./types";
import LaunchScreen from "./components/LaunchScreen";
import DesktopTable from "./components/DesktopTable";
import MobileCards from "./components/MobileCards";
import LightboxGallery from "./components/LightboxGallery";

// Fallback dynamic configurations
const DEFAULT_SUPABASE_URL = "https://mvmlwelmilhitoetessx.supabase.co";
const DEFAULT_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12bWx3ZWxtaWxoaXRvZXRlc3N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NTYxOTksImV4cCI6MjA5NjUzMjE5OX0.1MIsmOLAZM31b1BsysxII88U6JzOQWMp5kNDRiFmCnc";

export default function App() {
  // Configuration for DB Connection
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem("rodajeAPP_config_v2");
    if (saved) {
      try { 
        return JSON.parse(saved); 
      } catch (e) { /* ignore */ }
    }
    return {
      supabaseUrl: DEFAULT_SUPABASE_URL,
      supabaseAnonKey: DEFAULT_ANON_KEY,
      selectedLlamadoId: 1, // Default selection (Día 1 de rodaje)
      mode: "online"
    };
  });

  const [entered, setEntered] = useState(false);
  const [showSupabaseSettings, setShowSupabaseSettings] = useState(false);
  const [tempUrl, setTempUrl] = useState(config.supabaseUrl);
  const [tempKey, setTempKey] = useState(config.supabaseAnonKey);
  const [tempLlamadoId, setTempLlamadoId] = useState(String(config.selectedLlamadoId || "1"));

  const [loading, setLoading] = useState(false);
  const [networkOnline, setNetworkOnline] = useState(navigator.onLine);

  // Core Data
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [llamado, setLlamado] = useState<Llamado | null>(null);

  const [proyectosList, setProyectosList] = useState<Proyecto[]>(() => {
    const cached = localStorage.getItem("rodajeAPP_v2_cache_all_proyectos");
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { /* ignore */ }
    }
    return [];
  });

  const [llamadosList, setLlamadosList] = useState<Llamado[]>(() => {
    const cached = localStorage.getItem("rodajeAPP_v2_cache_all_llamados");
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { /* ignore */ }
    }
    return [];
  });
  const [pdrRows, setPdrRows] = useState<PdrRow[]>([]);
  const [localCompletedTimes, setLocalCompletedTimes] = useState<Record<number, string>>({});

  // Reference visualizer scrollable modal
  const [activeRefImage, setActiveRefImage] = useState<string | null>(null);
  const [showBetaModal, setShowBetaModal] = useState(false);
  const [imageGallery, setImageGallery] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Clock dynamic minutes
  const [clockMinutes, setClockMinutes] = useState(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  // Setup clock listener (updates synchronized with system minute change precisely)
  useEffect(() => {
    let timeoutId: any;
    let intervalId: any;

    const updateClock = () => {
      const now = new Date();
      setClockMinutes(now.getHours() * 60 + now.getMinutes());
    };

    const syncClock = () => {
      updateClock();
      const now = new Date();
      const delay = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds()) + 100; // Aligned precisely with the next minute (plus minor safety offset)
      timeoutId = setTimeout(() => {
        updateClock();
        intervalId = setInterval(updateClock, 60000);
      }, delay);
    };

    syncClock();

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);

  // Update online listener
  useEffect(() => {
    const updateOnlineStatus = () => setNetworkOnline(navigator.onLine);
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  // Save config back on change
  useEffect(() => {
    localStorage.setItem("rodajeAPP_config_v2", JSON.stringify(config));
    setTempUrl(config.supabaseUrl);
    setTempKey(config.supabaseAnonKey);
    setTempLlamadoId(String(config.selectedLlamadoId || ""));
  }, [config]);

  // Sync project & default llamado with URL search parameter "?id=X"
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryId = urlParams.get("id");
    if (queryId) {
      const pId = parseInt(queryId, 10);
      const foundProj = proyectosList.find(p => p.id === pId);
      if (foundProj) {
        setProyecto(foundProj);
        
        const related = llamadosList.filter(l => l.proyecto_id === pId);
        if (related.length > 0) {
          const isCurrentLlam_related = related.some(l => l.id === config.selectedLlamadoId);
          if (!isCurrentLlam_related) {
            const firstLlam = related[0];
            setLlamado(firstLlam);
            setConfig(prev => ({ ...prev, selectedLlamadoId: firstLlam.id }));
          } else {
            const currentLlam = related.find(l => l.id === config.selectedLlamadoId);
            if (currentLlam) {
              setLlamado(currentLlam);
            }
          }
        }
      }
    }
  }, [proyectosList, llamadosList, config.selectedLlamadoId]);

  // Load from cache or fetch from real Supabase database
  const cacheKeySuffix = config.selectedLlamadoId || 44;

  const loadCachedOrFetch = useCallback(async () => {
    setLoading(true);

    const cachedProyecto = localStorage.getItem(`rodajeAPP_v2_cache_proyecto_${cacheKeySuffix}`);
    const cachedLlamado = localStorage.getItem(`rodajeAPP_v2_cache_llamado_${cacheKeySuffix}`);
    const cachedPdr = localStorage.getItem(`rodajeAPP_v2_cache_pdr_${cacheKeySuffix}`);
    const cachedCompTimes = localStorage.getItem(`rodajeAPP_v2_cache_compTimes_${cacheKeySuffix}`);

    if (cachedProyecto && cachedLlamado && cachedPdr) {
      try {
        setProyecto(JSON.parse(cachedProyecto));
        setLlamado(JSON.parse(cachedLlamado));
        setPdrRows(JSON.parse(cachedPdr));
        if (cachedCompTimes) {
          setLocalCompletedTimes(JSON.parse(cachedCompTimes));
        }
      } catch (e) {
        console.error("Cache parsing error", e);
      }
    }

    if (config.mode === "online" && navigator.onLine) {
      try {
        const headers = {
          "apikey": config.supabaseAnonKey,
          "Authorization": `Bearer ${config.supabaseAnonKey}`,
          "Content-Type": "application/json"
        };

        // Fetch projects
        try {
          const allProjRes = await fetch(`${config.supabaseUrl}/rest/v1/proyectos?select=*`, { headers });
          if (allProjRes.ok) {
            const allProjData = await allProjRes.json();
            if (allProjData && allProjData.length > 0) {
              setProyectosList(allProjData);
              localStorage.setItem("rodajeAPP_v2_cache_all_proyectos", JSON.stringify(allProjData));
            }
          }
        } catch (projErr) {
          console.warn("Could not fetch todos los proyectos", projErr);
        }

        // Fetch llamados
        try {
          const allLlamRes = await fetch(`${config.supabaseUrl}/rest/v1/llamados?select=*`, { headers });
          if (allLlamRes.ok) {
            const allLlamData = await allLlamRes.json();
            if (allLlamData && allLlamData.length > 0) {
              setLlamadosList(allLlamData);
              localStorage.setItem("rodajeAPP_v2_cache_all_llamados", JSON.stringify(allLlamData));
            }
          }
        } catch (llamErr) {
          console.warn("Could not fetch llamados", llamErr);
        }

        // Fetch active llamado
        const url = `${config.supabaseUrl}/rest/v1/llamados?id=eq.${cacheKeySuffix}&select=*,proyectos(*)`;
        const res = await fetch(url, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const activeLlamado = data[0];
            let activeProyecto = activeLlamado.proyectos || null;
            if (!activeProyecto) {
              const foundProj = proyectosList.find(p => p.id === activeLlamado.proyecto_id);
              if (foundProj) {
                activeProyecto = foundProj;
              }
            }
            setLlamado(activeLlamado);
            if (activeProyecto) {
              setProyecto(activeProyecto);
            }

            // Fetch Plan de Rodaje (pdr) list matching SQLite-Supabase tables schema
            const pdrUrl = `${config.supabaseUrl}/rest/v1/pdr?llamado_id=eq.${cacheKeySuffix}&select=id,orden,duracion_min,status,inicio_reg,shotlist_id,shotlist(id,esc,plano,descripcion,cast_nombres,notas,referencia_urls)&order=orden.asc`;
            const pdrRes = await fetch(pdrUrl, { headers });
            if (pdrRes.ok) {
              const pdrData = await pdrRes.json();
              const parsed: PdrRow[] = pdrData.map((p: any) => ({
                id: p.id,
                orden: p.orden,
                duracion_min: p.duracion_min || 15,
                llamado_id: cacheKeySuffix,
                shotlist_id: p.shotlist_id,
                terminado: !!p.status,
                inicio_reg: p.inicio_reg,
                shotlist: {
                  id: p.shotlist?.id ?? p.shotlist_id ?? 0,
                  esc: p.shotlist?.esc ?? "",
                  plano: p.shotlist?.plano ?? "",
                  descripcion: p.shotlist?.descripcion ?? "",
                  cast_nombres: p.shotlist?.cast_nombres ?? "",
                  notas: p.shotlist?.notes ?? p.shotlist?.notas ?? "",
                  referencia_urls: p.shotlist?.referencia_urls ?? ""
                }
              }));
              setPdrRows(parsed);
              
              // Build status mapping of already finished items with mock completed time strings
              const mappedTimes: Record<number, string> = {};
              let curMin = parseTimeToMinutes(activeLlamado.llamado_hora || "08:00");
              parsed.forEach((row) => {
                if (row.terminado) {
                  curMin += row.duracion_min;
                  mappedTimes[row.id] = formatMinutesToTime(curMin);
                } else {
                  curMin += row.duracion_min;
                }
              });
              setLocalCompletedTimes(mappedTimes);

              // Save to cache
              if (activeProyecto) {
                localStorage.setItem(`rodajeAPP_v2_cache_proyecto_${cacheKeySuffix}`, JSON.stringify(activeProyecto));
              }
              localStorage.setItem(`rodajeAPP_v2_cache_llamado_${cacheKeySuffix}`, JSON.stringify(activeLlamado));
              localStorage.setItem(`rodajeAPP_v2_cache_pdr_${cacheKeySuffix}`, JSON.stringify(parsed));
              localStorage.setItem(`rodajeAPP_v2_cache_compTimes_${cacheKeySuffix}`, JSON.stringify(mappedTimes));
            }
          }
        }
      } catch (err: any) {
        console.warn("Unable to connect with Supabase live server:", err);
      }
    }
    setLoading(false);
  }, [cacheKeySuffix, config.supabaseUrl, config.supabaseAnonKey, config.mode, proyectosList]);

  useEffect(() => {
    loadCachedOrFetch();
  }, [loadCachedOrFetch]);

  // Timings and Minutes Calculators
  const baseLlamadoMinutes = parseTimeToMinutes(llamado?.llamado_hora || "08:00");

  function parseTimeToMinutes(tStr: string): number {
    const m = (tStr || "08:00").match(/^(\d{1,2}):(\d{2})/);
    if (!m) return 480;
    return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  }

  function formatMinutesToTime(min: number): string {
    const h = Math.floor(min / 60) % 24;
    const m = min % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  // Premium Performance optimizations: Pack calculations into a highly consolidated memoized hook
  const memoizedRows = useMemo(() => {
    const baseHour = llamado?.llamado_hora || "08:00";
    const baseMin = parseTimeToMinutes(baseHour);
    
    // Calculate local completed times dynamically to enforce unified source of truth
    const derivedCompletedTimes: Record<number, string> = {};
    let curCompletedMin = baseMin;
    pdrRows.forEach((row) => {
      const nextMin = curCompletedMin + row.duracion_min;
      if (row.terminado) {
        derivedCompletedTimes[row.id] = formatMinutesToTime(nextMin);
      }
      curCompletedMin = nextMin;
    });

    let planCumulative = baseMin;
    
    // 1. Precalculate plan timings
    const rawPlan = pdrRows.map((row) => {
      const start = planCumulative;
      planCumulative += row.duracion_min;
      return {
        plannedStartStr: formatMinutesToTime(start),
        plannedEndStr: formatMinutesToTime(planCumulative),
        startMin: start,
        endMin: planCumulative
      };
    });

    // 2. Precalculate estimated timings, real durations, and references
    let runningEstEndMin = baseMin;

    const parseTimeToMinutesEx = (timeStr: string | null | undefined, defaultMin: number): number => {
      if (!timeStr) return defaultMin;
      let s = timeStr;
      if (s.includes("T")) {
        try {
          const parts = s.split("T");
          if (parts[1]) {
            s = parts[1];
          }
        } catch (_) {}
      }
      if (s.includes(":")) {
        const parts = s.split(":");
        if (parts.length >= 2) {
          const h = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10);
          if (!isNaN(h) && !isNaN(m)) {
            return h * 60 + m;
          }
        }
      }
      return defaultMin;
    };

    return pdrRows.map((row, idx) => {
      const planTimes = rawPlan[idx] || { startMin: baseMin, endMin: baseMin + row.duracion_min, plannedStartStr: "08:00", plannedEndStr: "08:15" };
      
      let estStartMin: number;
      if (idx === 0) {
        estStartMin = baseMin;
      } else {
        const prevRow = pdrRows[idx - 1];
        if (prevRow.terminado) {
          estStartMin = parseTimeToMinutesEx(prevRow.inicio_reg, runningEstEndMin);
        } else {
          estStartMin = runningEstEndMin;
        }
      }
      
      const estEndMin = estStartMin + row.duracion_min;
      runningEstEndMin = estEndMin;
      
      const estStartStr = formatMinutesToTime(estStartMin);
      const estEndStr = formatMinutesToTime(estEndMin);
      
      let completedTimeStr: string | null = null;
      if (row.terminado) {
        completedTimeStr = row.inicio_reg || derivedCompletedTimes[row.id] || localCompletedTimes[row.id];
      }

      // Real Duration (only if completed)
      let durationReal = 0;
      if (row.terminado) {
        const matchedEnd = row.inicio_reg || derivedCompletedTimes[row.id] || localCompletedTimes[row.id];
        const prevMatchedEnd = idx > 0 && pdrRows[idx - 1]?.terminado 
          ? (pdrRows[idx - 1].inicio_reg || derivedCompletedTimes[pdrRows[idx - 1].id] || localCompletedTimes[pdrRows[idx - 1].id])
          : null;
        const startMin = idx === 0
          ? baseMin
          : prevMatchedEnd
            ? parseTimeToMinutesEx(prevMatchedEnd, baseMin)
            : baseMin;
        const endMin = parseTimeToMinutesEx(matchedEnd, baseMin + row.duracion_min);
        durationReal = Math.max(0, endMin - startMin);
      }

      // First reference photo
      const firstPhoto = row.shotlist?.referencia_urls && row.shotlist.referencia_urls.trim().length > 6
         ? row.shotlist.referencia_urls.split(",")[0].trim()
         : null;

      // Special row pattern
      const isSpecialRow = row.shotlist?.plano?.toUpperCase() === "ES";

      return {
        row,
        index: idx,
        planTimes,
        estTimes: {
          estimadaStartStr: estStartStr,
          estimadaEndStr: estEndStr,
          originalEstimadaStart: formatMinutesToTime(estStartMin)
        },
        durationReal,
        completedTimeStr,
        firstPhoto,
        isSpecialRow
      };
    });
  }, [pdrRows, clockMinutes]);

  // 3. Estado real-time calculated desvío values
  const analyzeRealTimeCalculatedState = () => {
    if (pdrRows.length === 0) {
      return { text: "SIN PLANOS EN EL PLAN", class: "bg-slate-900 border-slate-700 text-zinc-300 pointer-events-none" };
    }

    if (llamado && llamado.fecha) {
      try {
        const targetDateStr = llamado.fecha.substring(0, 10); // "YYYY-MM-DD"
        const parts = targetDateStr.split('-');
        const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : targetDateStr;
        
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayDateStr = `${year}-${month}-${day}`;

        if (targetDateStr !== todayDateStr) {
          if (targetDateStr > todayDateStr) {
            return { text: `PROGRAMADO: ${formattedDate}`, class: "bg-indigo-950/80 border-indigo-500 text-indigo-400 font-bold" };
          } else {
            return { text: `CONCLUIDO: ${formattedDate}`, class: "bg-slate-900/90 border-slate-800 text-slate-400 font-medium" };
          }
        } else {
          if (clockMinutes < baseLlamadoMinutes) {
            const timeStr = llamado.llamado_hora || "08:00";
            return { text: `PROGRAMADO: ${formattedDate} - ${timeStr}`, class: "bg-indigo-950/80 border-indigo-500 text-indigo-400 font-bold" };
          }
        }
      } catch (err) {
        console.error("Error comparing dates", err);
      }
    }

    // Find first pending shot index
    const firstPendingIdx = pdrRows.findIndex((row) => !row.terminado);

    if (firstPendingIdx !== -1) {
      let a = baseLlamadoMinutes;
      for (let i = 0; i < firstPendingIdx; i++) {
        a += pdrRows[i].duracion_min;
      }
      
      const b = pdrRows[firstPendingIdx].duracion_min;
      const c = a + b;
      const d = clockMinutes;
      
      if (d > c) {
        const diff = d - c;
        return { text: `${diff} MINUTOS ATRASADO`, class: "bg-rose-950/80 border-rose-500 text-rose-400 font-black font-mono tracking-wide" };
      } else if (d >= a && d <= c) {
        return { text: "RODAJE A TIEMPO", class: "bg-cyan-950/80 border-cyan-500 text-cyan-400 font-black font-mono tracking-wide" };
      } else {
        const diff = c - d;
        return { text: `${diff} MINUTOS ADELANTADO`, class: "bg-emerald-950/80 border-emerald-500 text-emerald-400 font-black font-mono tracking-wide" };
      }
    } else {
      // All done
      const lastDone = pdrRows[pdrRows.length - 1];
      if (lastDone && localCompletedTimes[lastDone.id]) {
        const actualMin = parseTimeToMinutes(localCompletedTimes[lastDone.id]);
        
        let totalPlanMin = baseLlamadoMinutes;
        for (const r of pdrRows) {
          totalPlanMin += r.duracion_min;
        }
        
        const difference = actualMin - totalPlanMin;
        if (difference === 0) {
          return { text: "RODAJE FINALIZADO A TIEMPO", class: "bg-cyan-950/80 border-cyan-500 text-cyan-400 font-black font-mono tracking-wide" };
        } else if (difference < 0) {
          return { text: `FINALIZADO: ${Math.abs(difference)} MIN ADELANTO`, class: "bg-emerald-950/80 border-emerald-500 text-emerald-400 font-black font-mono tracking-wide" };
        } else {
          return { text: `FINALIZADO: ${difference} MIN RETRASO`, class: "bg-rose-950/80 border-rose-500 text-rose-400 font-black font-mono tracking-wide" };
        }
      }
    }

    return { text: "RODAJE INICIADO A TIEMPO", class: "bg-cyan-950/80 border-cyan-500 text-cyan-300 font-mono" };
  };

  const calculatedState = useMemo(() => analyzeRealTimeCalculatedState(), [
    pdrRows,
    llamado,
    clockMinutes,
    baseLlamadoMinutes,
    localCompletedTimes
  ]);

  // Calculate "Plano Actual" minutes: compare current time vs the actual completion time of the last "Terminada" row
  const planoActualMinutes = useMemo(() => {
    // Find the last completed row
    let lastCompletedIdx = -1;
    for (let i = memoizedRows.length - 1; i >= 0; i--) {
      if (memoizedRows[i].row.terminado) {
        lastCompletedIdx = i;
        break;
      }
    }

    if (lastCompletedIdx === -1) return null;

    const lastCompleted = memoizedRows[lastCompletedIdx];
    // Use the actual time when the row was marked as "Terminada" (completedTimeStr)
    const completedTime = lastCompleted.completedTimeStr;
    if (!completedTime) return null;

    const completedMin = parseTimeToMinutes(completedTime);
    return clockMinutes - completedMin;
  }, [memoizedRows, clockMinutes]);

  // Reference visual reference lightbox loader
  const triggerLightboxOpen = (selectedRow: PdrRow) => {
    const allVisualUrls = pdrRows
      .map((r) => r.shotlist?.referencia_urls)
      .join(",")
      .split(",")
      .map((u) => u.trim())
      .filter((u) => u.startsWith("http") || u.startsWith("https"));

    if (allVisualUrls.length > 0) {
      setImageGallery(allVisualUrls);
      const rowUr = (selectedRow.shotlist?.referencia_urls || "").split(",")[0]?.trim();
      const matchIdx = allVisualUrls.indexOf(rowUr);
      const defaultIdx = matchIdx >= 0 ? matchIdx : 0;
      setGalleryIndex(defaultIdx);
      setActiveRefImage(allVisualUrls[defaultIdx]);
    } else {
      alert("Este plano no tiene referencias de imágenes válidas guardadas.");
    }
  };

  const handlePrevGalleryImage = () => {
    if (imageGallery.length === 0) return;
    const nextIdx = (galleryIndex - 1 + imageGallery.length) % imageGallery.length;
    setGalleryIndex(nextIdx);
    setActiveRefImage(imageGallery[nextIdx]);
  };

  const handleNextGalleryImage = () => {
    if (imageGallery.length === 0) return;
    const nextIdx = (galleryIndex + 1) % imageGallery.length;
    setGalleryIndex(nextIdx);
    setActiveRefImage(imageGallery[nextIdx]);
  };

  if (!entered) {
    return (
      <LaunchScreen
        proyecto={proyecto}
        llamado={llamado}
        llamadosList={llamadosList}
        pdrRows={pdrRows}
        loading={loading}
        networkOnline={networkOnline}
        onEnter={() => {
          if (pdrRows.length > 0 || !loading) {
            setEntered(true);
          }
        }}
        onSelectLlamado={(lId) => {
          const selectedLlam = llamadosList.find(l => l.id === lId) || llamado;
          if (selectedLlam) {
            setLlamado(selectedLlam);
          }
          setConfig(prev => ({ ...prev, selectedLlamadoId: lId }));
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      
      {/* Dynamic top persistent timing status calculator */}
      <div className={`sticky top-0 z-40 transition-colors backdrop-blur-md border-b flex items-center justify-center px-4 py-3 md:px-6 shadow-xl ${calculatedState.class}`}>
        <div className="flex items-center gap-3 justify-center text-center flex-wrap">
          <Clock className="w-5 h-5 shrink-0 animate-pulse" />
          <h1 className="text-sm md:text-base font-black tracking-wide font-mono uppercase">
            {calculatedState.text}
          </h1>
          {planoActualMinutes !== null && (
            <span className="text-sm md:text-base font-black tracking-wide font-mono uppercase border-l border-white/20 pl-3">
              Plano Actual - {Math.abs(planoActualMinutes)} MIN
            </span>
          )}
        </div>
      </div>

      {/* Main Core Dashboard Frame */}
      <div className="max-w-7xl w-full mx-auto p-4 md:p-6 flex-1 flex flex-col gap-6">

        {/* Plan Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex-1 flex flex-col justify-between">
          <div>
            <div className="bg-slate-950/60 px-4 py-3 border-b border-slate-850 flex flex-col md:flex-row md:items-center justify-between text-xs text-slate-400 gap-2 md:gap-0">
              <span className="font-bold tracking-wider uppercase font-mono order-2 md:order-1">PLAN DE RODAJE EN VIVO</span>
              <div className="flex items-center gap-2 order-1 md:order-2 justify-end w-full md:w-auto">
                {proyecto?.id && (
                  <a
                    href={`https://inthependiente.github.io/storyboardStudio/?id=${proyecto.id}&mode=presenter`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-amber-400 hover:text-amber-300 hover:bg-amber-950/20 rounded border border-amber-900/40 transition cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Ver Storyboards</span>
                  </a>
                )}
                <button
                  onClick={() => setEntered(false)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-indigo-400 hover:text-indigo-300 hover:bg-[#1f1a4a]/40 rounded border border-indigo-900/40 transition cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Volver a Inicio</span>
                </button>
                <button
                  onClick={() => setShowBetaModal(true)}
                  title="Información beta"
                  className="flex items-center justify-center w-6 h-6 rounded border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850 transition cursor-pointer"
                  style={{ minWidth: '24px', minHeight: '24px' }}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <DesktopTable
              memoizedRows={memoizedRows}
              localCompletedTimes={localCompletedTimes}
              triggerLightboxOpen={triggerLightboxOpen}
            />

            <MobileCards
              memoizedRows={memoizedRows}
              localCompletedTimes={localCompletedTimes}
              triggerLightboxOpen={triggerLightboxOpen}
            />
          </div>

          <div className="bg-slate-950/20 px-4 py-3 border-t border-slate-850 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 text-[11px] text-slate-500 font-mono">
            <span>Total Tomas: {pdrRows.length}</span>
            <span className="text-slate-600 sm:border-l sm:border-slate-800 sm:pl-6">rodajeApp v1.0 (inthependiente)</span>
          </div>
        </div>
      </div>

      <LightboxGallery
        activeRefImage={activeRefImage}
        setActiveRefImage={setActiveRefImage}
        imageGallery={imageGallery}
        galleryIndex={galleryIndex}
        setGalleryIndex={setGalleryIndex}
        pdrRows={pdrRows}
        handlePrevGalleryImage={handlePrevGalleryImage}
        handleNextGalleryImage={handleNextGalleryImage}
      />

      {showBetaModal && (
        <div id="beta-info-modal" className="fixed inset-0 bg-slate-950/85 z-55 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
          <div className="max-w-md w-full bg-slate-905 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            <button
              id="close-beta-modal-btn"
              onClick={() => setShowBetaModal(false)}
              className="absolute top-4 right-4 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-4 text-[#fbbf24]">
              <HelpCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-black tracking-tight font-mono uppercase">INFORMACIÓN BETA</h3>
            </div>
            
            <div className="text-xs text-slate-300 font-sans space-y-3 leading-relaxed">
              <p>
                La aplicación que estás viendo, está en desarrollo y se encuentra en etapa beta por lo que puede contener errores o fallas.
              </p>
              <p>
                El estado actual del rodaje y los tiempos estimados de inicio y fin de planos dependen de una conexión a base de datos y se actualizarán dinámicamente siempre que una fila sea marque como completada por el AD y este tenga conexión a internet.
              </p>
              <p className="pt-3 border-t border-slate-800/80 text-slate-400">
                Si tienes alguna sugerencia o has detectado algún error en el funcionamiento de la app puedes enviarla al correo{" "}
                <a href="mailto:arauco@gmail.com" className="text-amber-400 hover:text-amber-300 hover:underline font-mono">
                  arauco@gmail.com
                </a>
              </p>
            </div>
            
            <div className="mt-5 flex justify-end">
              <button
                id="close-beta-modal-footer-btn"
                onClick={() => setShowBetaModal(false)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-mono rounded border border-slate-700 transition cursor-pointer hover:text-white"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
