import React from "react";
import { CheckCircle, Eye } from "lucide-react";
import { PdrRow } from "../types";
import { MemoizedRowItem } from "./DesktopTable";

interface MobileCardsProps {
  memoizedRows: MemoizedRowItem[];
  localCompletedTimes: Record<number, string>;
  triggerLightboxOpen: (row: PdrRow) => void;
}

function formatTimeToHHMM(timeStr: string | null | undefined): string {
  if (!timeStr) return "";
  if (timeStr.includes("T")) {
    try {
      const timePart = timeStr.split("T")[1];
      if (timePart) {
        const parts = timePart.split(":");
        if (parts.length >= 2) {
          return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
        }
      }
    } catch (_) { /* ignore */ }
  }
  if (timeStr.includes(":")) {
    const parts = timeStr.split(":");
    if (parts.length >= 2) {
      const hour = parts[0].trim().slice(-2);
      const min = parts[1].trim().slice(0, 2);
      return `${hour.padStart(2, "0")}:${min.padStart(2, "0")}`;
    }
  }
  return timeStr;
}

export default function MobileCards({
  memoizedRows,
  localCompletedTimes,
  triggerLightboxOpen
}: MobileCardsProps) {
  return (
    <div id="mobile-cards-container" className="block md:hidden divide-y divide-slate-850">
      {memoizedRows.length === 0 ? (
        <div id="no-mobile-plans-message" className="py-16 text-center italic text-sm text-slate-500 font-mono">
          No hay planos cargados para este día.
        </div>
      ) : (
        memoizedRows.map(({ row, index, planTimes, estTimes, durationReal, completedTimeStr, firstPhoto, isSpecialRow }) => {

          if (isSpecialRow) {
            return (
              <div
                key={row.id}
                className="p-4 bg-[#18142d] border-b border-slate-850 select-none"
                style={row.terminado ? { opacity: 0.5 } : undefined}
              >
                <div className="font-extrabold text-sm text-slate-150 uppercase tracking-wider text-center leading-relaxed text-slate-200">
                  {row.shotlist?.descripcion || "FILA ESPECIAL"}
                </div>
                {row.shotlist?.notas ? (
                  <div className="text-[10px] text-indigo-400 font-mono mt-1 font-medium italic text-center">
                    NOTAS: {row.shotlist.notas}
                  </div>
                ) : null}
              </div>
            );
          }

          return (
            <div
              key={row.id}
              className={`p-4 transition duration-150 select-none flex flex-col gap-3 ${
                row.terminado ? "bg-slate-950/20" : "bg-slate-900/10"
              }`}
              style={row.terminado ? { opacity: 0.6 } : undefined}
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
                      <span>TERMINADA</span>
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

                <div className="flex flex-col items-center justify-center py-0.5 text-amber-300 bg-amber-955/5 rounded-lg">
                  <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider mb-0.5 text-center">
                    {row.terminado ? "TERMINADA" : "INICIA"}
                  </span>
                  <div className="flex items-center gap-1 flex-wrap justify-center font-mono">
                    <span className="text-[14px] font-black text-amber-450">
                      {row.terminado ? (formatTimeToHHMM(row.inicio_reg) || estTimes.estimadaStartStr) : estTimes.estimadaStartStr}
                    </span>
                    {!row.terminado && (
                      <>
                        <span className="text-[10px] text-amber-600/60">&bull;</span>
                        <span className="text-[11px] text-slate-500">{estTimes.estimadaEndStr}</span>
                      </>
                    )}
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

                  {row.terminado && (completedTimeStr || localCompletedTimes[row.id]) && (
                    <div className="mt-2 text-[10px] text-emerald-400/90 font-mono flex items-center gap-1">
                      <span className="font-bold">Duración real:</span>
                      <span className="bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-900/30">
                        {durationReal} min
                      </span>
                    </div>
                  )}
                </div>

                {firstPhoto && (
                  <button
                    id={`mobile-ref-photo-btn-${row.id}`}
                    className="shrink-0 relative cursor-pointer border-none bg-transparent p-0"
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
                  </button>
                )}
              </div>

            </div>
          );
        })
      )}
    </div>
  );
}
