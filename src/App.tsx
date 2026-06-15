import React, { useState, useEffect, useCallback } from "react";
import {
  Wifi,
  WifiOff,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  Eye,
  Database,
  EyeOff
} from "lucide-react";
import { PdrRow, AppConfig, Shotlist, Proyecto, Llamado } from "./types";

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
      selectedLlamadoId: 44, // Default selection
      mode: "online"
    };
  });

  const [entered, setEntered] = useState(false);
  const [showSupabaseSettings, setShowSupabaseSettings] = useState(false);
  const [tempUrl, setTempUrl] = useState(config.supabaseUrl);
  const [tempKey, setTempKey] = useState(config.supabaseAnonKey);
  const [tempLlamadoId, setTempLlamadoId] = useState(String(config.selectedLlamadoId || "44"));

  const [loading, setLoading] = useState(false);
  const [logMessage, setLogMessage] = useState<string | null>(null);
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
  const [imageGallery, setImageGallery] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Clock dynamic minutes
  const [clockMinutes, setClockMinutes] = useState(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  // Setup clock listener (updates once per minute)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setClockMinutes(now.getHours() * 60 + now.getMinutes());
    }, 60000);
    return () => clearInterval(interval);
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
    setLogMessage(null);

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
        setLogMessage("Plan cargado localmente.");
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
            const pdrUrl = `${config.supabaseUrl}/rest/v1/pdr?llamado_id=eq.${cacheKeySuffix}&select=id,orden,duracion_min,status,shotlist_id,shotlist(id,esc,plano,descripcion,cast_nombres,notas,referencia_urls)&order=orden.asc`;
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
                shotlist: {
                  id: p.shotlist?.id || Math.floor(Math.random() * 100000),
                  esc: p.shotlist?.esc || "12",
                  plano: p.shotlist?.plano || "1",
                  descripcion: p.shotlist?.descripcion || "Plano sin descripción",
                  cast_nombres: p.shotlist?.cast_nombres || "",
                  notas: p.shotlist?.notes || p.shotlist?.notas || "",
                  referencia_urls: p.shotlist?.referencia_urls || ""
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

              setLogMessage("Sincronización silenciosa completada.");

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

  // 1. Planificados timetable mapping
  let planCumulative = baseLlamadoMinutes;
  const rawPlanTimings = pdrRows.map((row) => {
    const start = planCumulative;
    planCumulative += row.duracion_min;
    return {
      pdrId: row.id,
      plannedStartStr: formatMinutesToTime(start),
      plannedEndStr: formatMinutesToTime(planCumulative),
      startMin: start,
      endMin: planCumulative
    };
  });

  // 2. Estimadas timetables logic
  let runningEstEnd = baseLlamadoMinutes;
  const wrapEstTimings = pdrRows.map((row, idx) => {
    const planTimes = rawPlanTimings[idx] || { startMin: baseLlamadoMinutes, endMin: baseLlamadoMinutes + row.duracion_min };
    
    let origStartMin: number;
    if (idx === 0) {
      origStartMin = baseLlamadoMinutes;
    } else {
      const prevRow = pdrRows[idx - 1];
      if (prevRow.terminado && localCompletedTimes[prevRow.id]) {
        origStartMin = parseTimeToMinutes(localCompletedTimes[prevRow.id]);
      } else {
        origStartMin = runningEstEnd;
      }
    }
    
    runningEstEnd = origStartMin + row.duracion_min;
    
    let estStartStr = "";
    let estEndStr = "";
    
    if (row.terminado && localCompletedTimes[row.id]) {
      const lockedStr = localCompletedTimes[row.id];
      estStartStr = lockedStr;
      estEndStr = lockedStr;
    } else {
      const isFirstPending = idx === 0 || pdrRows[idx - 1]?.terminado;
      let start: number;
      if (isFirstPending) {
        const nowTime = clockMinutes;
        const schedTime = planTimes.startMin;
        const diff = nowTime - schedTime;
        if (diff > 0) {
          start = nowTime;
        } else {
          start = schedTime;
        }
      } else {
        start = runningEstEnd;
      }
      estStartStr = formatMinutesToTime(start);
      estEndStr = formatMinutesToTime(start + row.duracion_min);
    }
    
    return {
      pdrId: row.id,
      estimadaStartStr: estStartStr,
      estimadaEndStr: estEndStr,
      originalEstimadaStart: formatMinutesToTime(origStartMin)
    };
  });

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

  const calculatedState = analyzeRealTimeCalculatedState();

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
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        <div className="max-w-md w-full bg-slate-900/60 border border-slate-800/80 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6 text-center relative">
          
          {/* Settings Database Connector Icon at Corner */}
          <button 
            type="button"
            onClick={() => setShowSupabaseSettings(prev => !prev)}
            className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
            title="Conexión de Base de Datos"
          >
            <Database className="w-4 h-4" />
          </button>

          {/* Logo Cliente / Titular */}
          <div className="flex justify-center mt-2">
            <div 
              style={{ backgroundColor: proyecto?.color_cliente || '#1e1b4b' }}
              className="w-24 h-24 rounded-2xl flex items-center justify-center p-2.5 border border-slate-800/60 shadow-inner overflow-hidden"
            >
              {proyecto?.cliente && (proyecto.cliente.startsWith("http://") || proyecto.cliente.startsWith("https://")) ? (
                <img
                  src={proyecto.cliente}
                  alt="Cliente Logo"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-center text-xs font-black text-white uppercase tracking-wider break-words line-clamp-3">
                  {proyecto?.cliente || "CLIENTE"}
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-b border-slate-850/60 py-4 my-1 space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-white">{proyecto?.campana || "Cargando..."}</h2>
            <p className="text-xs text-indigo-400 font-mono font-medium uppercase tracking-wider">{proyecto?.productora || "Por favor, configure o espere"}</p>
          </div>

          {/* Selector de Llamados */}
          <div className="space-y-4">
            <div className="w-full text-left space-y-1.5">
              {(() => {
                if (!proyecto) {
                  return (
                    <div className="text-xs text-slate-500 font-mono text-center py-2 bg-slate-950/20 rounded-xl border border-slate-850/40">
                      Conectando con base de datos de rodaje...
                    </div>
                  );
                }
                const relatedLlamados = llamadosList.filter(l => l.proyecto_id === proyecto.id);
                if (relatedLlamados.length <= 1) {
                  const single = relatedLlamados[0] || llamado;
                  return (
                    <div>
                      <label className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block font-mono">Llamado:</label>
                      <div className="bg-slate-950 border border-slate-850/80 text-amber-400 text-sm font-bold rounded-xl px-4 py-3 w-full font-mono">
                        {single?.d_o_d || `Llamado ${single?.id || ""}`}
                      </div>
                    </div>
                  );
                }

                return (
                  <div>
                    <label className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block font-mono">Seleccionar Día:</label>
                    <select
                      value={llamado?.id || ""}
                      onChange={(e) => {
                        const lId = parseInt(e.target.value, 10);
                        const selectedLlam = llamadosList.find(l => l.id === lId) || llamado;
                        if (selectedLlam) {
                          setLlamado(selectedLlam);
                        }
                        setConfig(prev => ({ ...prev, selectedLlamadoId: lId }));
                      }}
                      className="bg-slate-950 border border-slate-850/80 text-amber-400 text-sm font-bold rounded-xl px-4 py-3 w-full focus:border-indigo-500 focus:outline-none cursor-pointer font-mono shadow-inner"
                    >
                      {relatedLlamados.length === 0 ? (
                        llamado && (
                          <option value={llamado.id} className="bg-slate-950 text-amber-400">
                            {llamado.d_o_d || `Llamado ${llamado.id}`}
                          </option>
                        )
                      ) : (
                        relatedLlamados.map((l) => (
                          <option key={l.id} value={l.id} className="bg-slate-955 text-amber-400">
                            {l.d_o_d || `Llamado ${l.id}`}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                );
              })()}
            </div>

            {/* Informacion de Resumen del Llamado */}
            {llamado && (
              <div className="bg-slate-950/40 border border-slate-850/50 rounded-2xl p-4 text-left text-xs space-y-2 font-mono text-slate-400">
                <div className="flex justify-between border-b border-slate-850/40 pb-1.5">
                  <span className="text-slate-500">Fecha:</span>
                  <span className="text-slate-200 font-bold">
                    {(() => {
                      if (llamado && llamado.fecha) {
                        const dateStr = llamado.fecha.substring(0, 10);
                        const parts = dateStr.split('-');
                        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
                      }
                      return "-";
                    })()}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-850/40 pb-1.5">
                  <span className="text-slate-500">Hora de Llamado:</span>
                  <span className="text-amber-400 font-bold">{llamado.llamado_hora || "08:00"}</span>
                </div>
                <div className="flex justify-between text-[11px] pt-0.5">
                  <span className="text-slate-500">Comidas:</span>
                  <span className="text-slate-300">
                    🥪 {llamado.desayuno || "-"} &nbsp;&bull;&nbsp; 🍲 {llamado.almuerzo || "-"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Boton Ingresar */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (pdrRows.length > 0 || !loading) {
                  setEntered(true);
                }
              }}
              disabled={loading && pdrRows.length === 0}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-450 hover:to-amber-550 active:scale-[0.98] text-slate-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-950/20 hover:shadow-amber-500/10 transition duration-150 uppercase tracking-widest font-sans cursor-pointer disabled:opacity-40"
            >
              <span>{loading && pdrRows.length === 0 ? "Actualizando..." : "Ingresar al Plan"}</span>
              <ChevronRight className="w-4 h-4 text-slate-950 shrink-0" />
            </button>
          </div>

          {/* Settings Database Connector Popup directly embedded inside */}
          {showSupabaseSettings && (
            <div className="bg-slate-950 border border-slate-800 text-left p-4 rounded-2xl space-y-3 mt-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                <span className="font-bold text-white uppercase tracking-wider text-[10px] font-mono">Conexión Supabase</span>
                <button type="button" onClick={() => setShowSupabaseSettings(false)} className="text-slate-500 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 block">PROJECT REST URL</label>
                <input
                  type="text"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] font-mono text-slate-300 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 block">ANON/PUBLIC API KEY</label>
                <input
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] font-mono text-slate-300 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 block">LLAMADO ID</label>
                  <input
                    type="number"
                    value={tempLlamadoId}
                    onChange={(e) => setTempLlamadoId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] font-mono text-amber-400 font-bold focus:outline-none text-center"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      const cleanUrl = tempUrl.trim();
                      const cleanKey = tempKey.trim();
                      const cleanId = parseInt(tempLlamadoId, 10) || 44;

                      if (cleanUrl && cleanKey) {
                        localStorage.removeItem(`rodajeAPP_v2_cache_proyecto_${cleanId}`);
                        localStorage.removeItem(`rodajeAPP_v2_cache_llamado_${cleanId}`);
                        localStorage.removeItem(`rodajeAPP_v2_cache_pdr_${cleanId}`);
                        
                        setConfig({
                          supabaseUrl: cleanUrl,
                          supabaseAnonKey: cleanKey,
                          selectedLlamadoId: cleanId,
                          mode: "online"
                        });
                        setLogMessage("Conectando con base de datos en vivo...");
                        setShowSupabaseSettings(false);
                      }
                    }}
                    className="w-full py-1 px-3 bg-emerald-600 text-white rounded font-bold uppercase tracking-wider text-[10px] hover:bg-emerald-500 transition"
                  >
                    Conectar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Estado de red */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 font-mono">
            {networkOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                <span>Base de datos en línea</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-500" />
                <span>Modo caché offline</span>
              </>
            )}
          </div>

          <div className="text-[10px] text-slate-700 font-mono mt-2">
            rodajeApp v1.0 (inthependiente)
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      
      {/* Dynamic top persistent timing status calculator */}
      <div className={`sticky top-0 z-40 transition-colors backdrop-blur-md border-b flex items-center justify-center px-4 py-3 md:px-6 shadow-xl ${calculatedState.class}`}>
        <div className="flex items-center gap-3 justify-center text-center">
          <Clock className="w-5 h-5 shrink-0 animate-pulse" />
          <h1 className="text-sm md:text-base font-black tracking-wide font-mono uppercase">
            {calculatedState.text}
          </h1>
        </div>
      </div>

      {/* Main Core Dashboard Frame */}
      <div className="max-w-7xl w-full mx-auto p-4 md:p-6 flex-1 flex flex-col gap-6">

        {/* Plan Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex-1 flex flex-col justify-between">
          <div>
            <div className="bg-slate-950/60 px-4 py-3 border-b border-slate-850 flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold tracking-wider uppercase font-mono">PLAN DE RODAJE EN VIVO</span>
              <button
                onClick={() => setEntered(false)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-indigo-400 hover:text-indigo-300 hover:bg-[#1f1a4a]/40 rounded border border-indigo-900/40 transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Volver a Inicio</span>
              </button>
            </div>

            {/* DESKTOP VIEW: TABLA COMPLETA */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-slate-950/30 text-[8px] font-bold text-slate-450 uppercase tracking-widest border-b border-slate-850">
                    <th className="py-3 px-3 text-center w-[50px]">Status</th>
                    <th className="py-3 px-2 text-center w-[45px]">Esc/Pl</th>
                    <th className="py-3 px-3 text-center w-[65px]">Plan</th>
                    <th className="py-3 px-3 text-center w-[75px] bg-amber-955/10 text-amber-400">Estimada</th>
                    <th className="py-3 px-4">Descripción y Notas</th>
                    <th className="py-3 px-3 text-center w-[112px]">Referencias</th>
                  </tr>
                </thead>
                <tbody>
                  {pdrRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center italic text-sm text-slate-500">
                        Espere un momento, trayendo plan de rodaje en tiempo real...
                      </td>
                    </tr>
                  ) : (
                    pdrRows.map((row, index) => {
                      const planTimes = rawPlanTimings[index] || { plannedStartStr: "08:00", plannedEndStr: "08:15" };
                      const estTimes = wrapEstTimings[index] || { estimadaStartStr: "08:00", estimadaEndStr: "08:15", originalEstimadaStart: "08:00" };
                      const firstPhoto = row.shotlist?.referencia_urls && row.shotlist.referencia_urls.trim().length > 6
                        ? row.shotlist.referencia_urls.split(",")[0].trim()
                        : null;

                      const isSpecialRow = row.shotlist?.plano?.toUpperCase() === "ES";

                      return (
                        <tr
                          key={row.id}
                          className={`group align-middle hover:bg-slate-950/40 border-b border-indigo-950/20 transition duration-150 select-none ${
                            row.terminado ? "bg-slate-950/40 opacity-40" : ""
                          } ${
                            isSpecialRow ? "bg-[#18142d] hover:bg-[#201b3d] border-b border-indigo-900/30" : ""
                          }`}
                        >

                          {/* Finished indicator column */}
                          <td className="py-3 px-3 text-center w-[50px]">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center transition mx-auto border ${
                                row.terminado
                                  ? "bg-emerald-950 text-emerald-400 border-emerald-500/60 shadow-lg"
                                  : "bg-slate-950/20 text-slate-800 border-slate-900/45 opacity-30 cursor-default"
                              }`}
                              title={row.terminado ? "Plano Terminado" : "Plano Pendiente"}
                            >
                              <CheckCircle className={`w-5 h-5 ${row.terminado ? "fill-emerald-400/20" : ""}`} />
                            </div>
                            {row.terminado && localCompletedTimes[row.id] && (() => {
                              const startMin = index === 0
                                ? baseLlamadoMinutes
                                : (pdrRows[index - 1]?.terminado && localCompletedTimes[pdrRows[index - 1].id])
                                  ? parseTimeToMinutes(localCompletedTimes[pdrRows[index - 1].id])
                                  : baseLlamadoMinutes;
                              const endMin = parseTimeToMinutes(localCompletedTimes[row.id]);
                              const durationReal = Math.max(0, endMin - startMin);
                              return (
                                <div className="mt-1 flex flex-col items-center">
                                  <span className="text-[10px] font-bold font-mono tracking-tighter text-emerald-400 block leading-none">
                                    {localCompletedTimes[row.id]}
                                  </span>
                                  <span className="text-[9px] font-black font-mono tracking-tight text-emerald-500/80 block mt-1 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/30">
                                    {durationReal} min
                                  </span>
                                </div>
                              );
                            })()}
                          </td>

                          {isSpecialRow ? (
                            <td colSpan={5} className="py-4 px-6 text-center select-all">
                              <div className="font-extrabold text-sm text-slate-150 uppercase tracking-wider py-1 max-w-xl mx-auto drop-shadow-sm leading-relaxed">
                                {row.shotlist?.descripcion || "FILA ESPECIAL"}
                              </div>
                              {row.shotlist?.notas && (
                                <div className="text-[10px] text-indigo-400 font-mono mt-1 font-medium italic">
                                  NOTAS: {row.shotlist.notas}
                                </div>
                              )}
                            </td>
                          ) : (
                            <>
                              {/* Esc / Plano */}
                              <td className="py-3 px-2 text-center w-[45px]">
                                <div className="flex flex-col gap-0.5 items-center">
                                  <span className="text-[9px] text-slate-500 font-mono font-bold leading-none">ESC</span>
                                  <span className="text-[14px] font-bold font-mono text-slate-200">{row.shotlist?.esc || "-"}</span>
                                  <span className="text-[9px] text-[#94a3b8] font-mono font-bold leading-none mt-1">PL</span>
                                  <span className="text-[14px] font-bold font-mono text-indigo-400">{row.shotlist?.plano || "-"}</span>
                                </div>
                              </td>

                              {/* Planificado */}
                              <td className="py-3 px-3 text-center font-mono w-[65px]">
                                <div className="flex flex-col items-center justify-center gap-0.5">
                                  <span className="text-[14px] font-semibold text-slate-100">{planTimes.plannedStartStr}</span>
                                  <span className="text-[8px] text-slate-500 leading-none">&bull;</span>
                                  <span className="text-[14px] font-bold text-slate-400">{planTimes.plannedEndStr}</span>
                                </div>
                              </td>

                              {/* Estimada */}
                              <td className="py-3 px-3 text-center font-mono bg-amber-950/5 text-amber-300 w-[75px]">
                                <span className="text-[10px] font-semibold text-amber-500/80 block leading-none mb-1 font-mono">INICIA</span>
                                <div className="font-black text-[16px] text-amber-400 leading-tight">{estTimes.estimadaStartStr}</div>
                                <span className="text-[10px] text-slate-500 block mt-1">{estTimes.estimadaEndStr}</span>
                              </td>

                              {/* Description & notes */}
                              <td className="py-3 px-4 text-xs">
                                <p className="text-slate-200 font-medium text-sm leading-relaxed break-words">
                                  {row.shotlist?.descripcion || <span className="italic text-slate-600">Sin descripción</span>}
                                </p>
                                {row.shotlist?.notas && (
                                  <div className="flex items-center gap-1.5 mt-1.5 text-[11px]">
                                    <span className="text-indigo-400 font-black tracking-wider shrink-0 uppercase text-[10px]">NOTAS:</span>
                                    <span className="text-slate-400 font-mono break-words">{row.shotlist.notas}</span>
                                  </div>
                                )}
                              </td>

                              {/* References Column */}
                              <td className="py-3 px-3 text-center w-[112px]">
                                {firstPhoto ? (
                                  <div 
                                    onClick={(e) => { e.stopPropagation(); triggerLightboxOpen(row); }}
                                    className="relative group/photo inline-block cursor-zoom-in"
                                  >
                                    <img
                                      src={firstPhoto}
                                      alt="Reference"
                                      className="w-[100px] h-[55px] object-cover rounded-lg border border-slate-700/80 group-hover/photo:border-emerald-400/80 transition"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute inset-0 bg-black/45 rounded-lg opacity-0 group-hover/photo:opacity-100 flex items-center justify-center transition">
                                      <Eye className="w-4 h-4 text-white" />
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-600 select-none italic font-mono">-</span>
                                )}
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE VIEW: DETAILED PLAN CARDS */}
            <div className="block md:hidden divide-y divide-slate-850">
              {pdrRows.length === 0 ? (
                <div className="py-16 text-center italic text-sm text-slate-500 font-mono">
                  No hay planos cargados para este día.
                </div>
              ) : (
                pdrRows.map((row, index) => {
                  const planTimes = rawPlanTimings[index] || { plannedStartStr: "08:00", plannedEndStr: "08:15" };
                  const estTimes = wrapEstTimings[index] || { estimadaStartStr: "08:00", estimadaEndStr: "08:15", originalEstimadaStart: "08:00" };
                  const firstPhoto = row.shotlist?.referencia_urls && row.shotlist.referencia_urls.trim().length > 6
                    ? row.shotlist.referencia_urls.split(",")[0].trim()
                    : null;

                  const isSpecialRow = row.shotlist?.plano?.toUpperCase() === "ES";

                  if (isSpecialRow) {
                    return (
                      <div
                        key={row.id}
                        className={`p-4 bg-[#18142d] border-b border-slate-850 select-none ${
                          row.terminado ? "opacity-50" : ""
                        }`}
                      >
                        <div className="font-extrabold text-sm text-slate-150 uppercase tracking-wider text-center leading-relaxed">
                          {row.shotlist?.descripcion || "FILA ESPECIAL"}
                        </div>
                        {row.shotlist?.notas && (
                          <div className="text-[10px] text-indigo-400 font-mono mt-1 font-medium italic text-center">
                            NOTAS: {row.shotlist.notas}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={row.id}
                      className={`p-4 transition duration-150 select-none flex flex-col gap-3 ${
                        row.terminado ? "bg-slate-950/20 opacity-60" : "bg-slate-900/10"
                      }`}
                    >
                      {/* Top Row: Scene/Plano & Status */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-slate-950 text-[10px] font-bold font-mono px-2 py-1 rounded border border-slate-800 text-slate-400">
                            ESC <span className="text-slate-100 font-extrabold text-xs">{row.shotlist?.esc || "-"}</span>
                          </span>
                          <span className="bg-indigo-950/60 text-[10px] font-bold font-mono px-2 py-1 rounded border border-indigo-900/40 text-indigo-300">
                            PLANO <span className="text-indigo-400 font-extrabold text-xs">{row.shotlist?.plano || "-"}</span>
                          </span>
                        </div>

                        <div>
                          {row.terminado ? (
                            <div className="flex items-center gap-1 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400">
                              <CheckCircle className="w-3.5 h-3.5 fill-emerald-400/10 shrink-0" />
                              <span>FIN @ {localCompletedTimes[row.id]}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 bg-slate-950/60 border border-slate-800/80 px-2 py-0.5 rounded text-[10px] font-mono text-slate-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-pulse shrink-0"></span>
                              <span>PENDIENTE</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Middle row: timings Plan vs Est */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-950/30 border border-slate-850/55 rounded-xl p-2.5 text-xs font-mono">
                        <div className="flex flex-col items-center justify-center border-r border-slate-850/60 py-0.5">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5 text-center">PLANIFICADO</span>
                          <div className="flex items-center gap-1 text-[13px] font-semibold text-slate-200">
                            <span>{planTimes.plannedStartStr}</span>
                            <span className="text-[10px] text-slate-500">&bull;</span>
                            <span className="text-slate-400">{planTimes.plannedEndStr}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-center justify-center py-0.5 text-amber-300 bg-amber-950/5 rounded-lg">
                          <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider mb-0.5 text-center">ESTIMADO</span>
                          <div className="flex items-center gap-1 flex-wrap justify-center">
                            <span className="text-[14px] font-black text-amber-450">{estTimes.estimadaStartStr}</span>
                            <span className="text-[10px] text-amber-600/60">&bull;</span>
                            <span className="text-[11px] text-slate-500">{estTimes.estimadaEndStr}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom row: Description & References */}
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-200 font-medium text-[13px] leading-relaxed break-words">
                            {row.shotlist?.descripcion || <span className="italic text-slate-600">Sin descripción</span>}
                          </p>
                          {row.shotlist?.notas && (
                            <div className="flex items-start gap-1.5 mt-2 text-[11px]">
                              <span className="text-[#a5b4fc] font-black tracking-wider shrink-0 uppercase text-[9px] mt-0.5">NOTAS:</span>
                              <span className="text-slate-400 font-mono break-words leading-relaxed">{row.shotlist.notas}</span>
                            </div>
                          )}

                          {row.terminado && localCompletedTimes[row.id] && (() => {
                            const startMin = index === 0
                              ? baseLlamadoMinutes
                              : (pdrRows[index - 1]?.terminado && localCompletedTimes[pdrRows[index - 1].id])
                                ? parseTimeToMinutes(localCompletedTimes[pdrRows[index - 1].id])
                                : baseLlamadoMinutes;
                            const endMin = parseTimeToMinutes(localCompletedTimes[row.id]);
                            const durationReal = Math.max(0, endMin - startMin);
                            return (
                              <div className="mt-2 text-[10px] text-emerald-400/90 font-mono flex items-center gap-1">
                                <span className="font-bold">Duración real:</span>
                                <span className="bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-900/30">
                                  {durationReal} min
                                </span>
                              </div>
                            );
                          })()}
                        </div>

                        {firstPhoto && (
                          <div
                            className="shrink-0 relative cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); triggerLightboxOpen(row); }}
                          >
                            <img
                              src={firstPhoto}
                              alt="Ref"
                              className="w-14 h-14 object-cover rounded-lg border border-slate-800 hover:border-emerald-400 transition"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition">
                              <Eye className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-slate-950/20 px-4 py-3 border-t border-slate-850 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 text-[11px] text-slate-500 font-mono">
            <span>Total Tomas: {pdrRows.length}</span>
            <span className="text-slate-600 sm:border-l sm:border-slate-800 sm:pl-6">rodajeApp v1.0 (inthependiente)</span>
          </div>
        </div>
      </div>

      {/* REFERENCE GALLERY SCREEN MODAL */}
      {activeRefImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <button
            onClick={() => setActiveRefImage(null)}
            className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-4xl w-full flex flex-col items-center">
            
            <div className="relative w-full max-h-[70vh] flex justify-center items-center overflow-hidden bg-slate-950 rounded-2xl border border-slate-800">
              <img
                src={activeRefImage}
                alt="Fullscreen reference view"
                className="max-h-full max-w-full object-contain"
                referrerPolicy="no-referrer"
              />

              <button
                onClick={handlePrevGalleryImage}
                className="absolute left-3 p-3 bg-slate-900/80 hover:bg-indigo-600 rounded-full text-white backdrop-blur-sm transition border border-slate-800 cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={handleNextGalleryImage}
                className="absolute right-3 p-3 bg-slate-900/80 hover:bg-indigo-600 rounded-full text-white backdrop-blur-sm transition border border-slate-800 cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center mt-4 text-slate-300">
              <p className="text-sm font-bold font-mono tracking-wider text-emerald-400">
                REFERENCIA {galleryIndex + 1} DE {imageGallery.length}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xl mx-auto">
                {pdrRows.find((r) => r.shotlist?.referencia_urls?.includes(activeRefImage))?.shotlist?.descripcion || "Referencia visual del Plan de Rodaje"}
              </p>

              <div className="flex justify-center gap-1.5 mt-3 overflow-x-auto max-w-lg p-1">
                {imageGallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setGalleryIndex(i);
                      setActiveRefImage(img);
                    }}
                    className={`w-10 h-10 rounded border-2 overflow-hidden transition-all shrink-0 cursor-pointer ${
                      galleryIndex === i ? "border-emerald-400 scale-105" : "border-slate-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
