import React from "react";
import { Wifi, WifiOff, ChevronRight } from "lucide-react";
import { Proyecto, Llamado, PdrRow } from "../types";

interface LaunchScreenProps {
  proyecto: Proyecto | null;
  llamado: Llamado | null;
  llamadosList: Llamado[];
  pdrRows: PdrRow[];
  loading: boolean;
  networkOnline: boolean;
  onEnter: () => void;
  onSelectLlamado: (id: number) => void;
}

export default function LaunchScreen({
  proyecto,
  llamado,
  llamadosList,
  pdrRows,
  loading,
  networkOnline,
  onEnter,
  onSelectLlamado
}: LaunchScreenProps) {
  return (
    <div id="launch-screen-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      <div id="launch-screen-card" className="max-w-md w-full bg-slate-900/60 border border-slate-800/80 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6 text-center relative-top">
        
        {/* Logo Cliente / Titular */}
        <div id="client-logo-wrapper" className="flex justify-center mt-2">
          <div 
            style={{ backgroundColor: proyecto?.color_cliente || '#1e1b4b' }}
            className="w-24 h-24 rounded-2xl flex items-center justify-center p-2.5 border border-slate-800/60 shadow-inner overflow-hidden"
          >
            {proyecto?.cliente && (proyecto.cliente.startsWith("http://") || proyecto.cliente.startsWith("https://")) ? (
              <img
                id="client-img-logo"
                src={proyecto.cliente}
                alt="Cliente Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span id="client-text-logo" className="text-center text-xs font-black text-white uppercase tracking-wider break-words line-clamp-3">
                {proyecto?.cliente || "CLIENTE"}
              </span>
            )}
          </div>
        </div>

        <div id="project-header" className="border-t border-b border-slate-850/60 py-4 my-1 space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-white">{proyecto?.campana || "Cargando..."}</h2>
          <p className="text-xs text-indigo-400 font-mono font-medium uppercase tracking-wider">{proyecto?.productora || "Por favor, configure o espere"}</p>
        </div>

        {/* Selector de Llamados */}
        <div className="space-y-4">
          <div className="w-full text-left space-y-1.5">
            {(() => {
              if (!proyecto) {
                return (
                  <div id="loading-pdr-banner" className="text-xs text-slate-500 font-mono text-center py-2 bg-slate-950/20 rounded-xl border border-slate-850/40">
                    Conectando con base de datos de rodaje...
                  </div>
                );
              }
              const relatedLlamados = llamadosList.filter(l => l.proyecto_id === proyecto.id);
              if (relatedLlamados.length <= 1) {
                const single = relatedLlamados[0] || llamado;
                return (
                  <div id="single-llamado-info">
                    <label className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block font-mono">Llamado:</label>
                    <div className="bg-slate-950 border border-slate-850/80 text-amber-400 text-sm font-bold rounded-xl px-4 py-3 w-full font-mono">
                      {single?.d_o_d || `Llamado ${single?.id || ""}`}
                    </div>
                  </div>
                );
              }

              return (
                <div id="select-day-selector">
                  <label className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block font-mono">Seleccionar Día:</label>
                  <select
                    id="llamado-select"
                    value={llamado?.id || ""}
                    onChange={(e) => {
                      const lId = parseInt(e.target.value, 10);
                      onSelectLlamado(lId);
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
            <div id="llamado-summary-box" className="bg-slate-950/40 border border-slate-850/50 rounded-2xl p-4 text-left text-xs space-y-2 font-mono text-slate-400">
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
                  Desayuno: {llamado.desayuno || "-"} &nbsp;&bull;&nbsp; Almuerzo: {llamado.almuerzo || "-"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Boton Ingresar */}
        <div className="pt-2">
          <button
            id="enter-plan-btn"
            onClick={onEnter}
            disabled={loading && pdrRows.length === 0}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-450 hover:to-amber-550 active:scale-[0.98] text-slate-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-950/20 hover:shadow-amber-500/10 transition duration-150 uppercase tracking-widest font-sans cursor-pointer disabled:opacity-40"
          >
            <span>{loading && pdrRows.length === 0 ? "Actualizando..." : "Ingresar al Plan"}</span>
            <ChevronRight className="w-4 h-4 text-slate-950 shrink-0" />
          </button>
        </div>

        {/* Estado de red */}
        <div id="network-status" className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 font-mono">
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
