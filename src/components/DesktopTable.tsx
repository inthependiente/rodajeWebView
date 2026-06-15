import React from "react";
import { CheckCircle, Eye } from "lucide-react";
import { PdrRow } from "../types";

export interface MemoizedRowItem {
  row: PdrRow;
  index: number;
  planTimes: {
    plannedStartStr: string;
    plannedEndStr: string;
    startMin: number;
    endMin: number;
  };
  estTimes: {
    estimadaStartStr: string;
    estimadaEndStr: string;
    originalEstimadaStart: string;
  };
  durationReal: number;
  completedTimeStr?: string | null;
  firstPhoto: string | null;
  isSpecialRow: boolean;
}

interface DesktopTableProps {
  memoizedRows: MemoizedRowItem[];
  localCompletedTimes: Record<number, string>;
  triggerLightboxOpen: (row: PdrRow) => void;
}

export default function DesktopTable({
  memoizedRows,
  localCompletedTimes,
  triggerLightboxOpen
}: DesktopTableProps) {
  return (
    <div id="desktop-table-container" className="hidden md:block overflow-x-auto">
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
          {memoizedRows.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-16 text-center italic text-sm text-slate-500">
                Espere un momento, trayendo plan de rodaje en tiempo real...
              </td>
            </tr>
          ) : (
            memoizedRows.map(({ row, index, planTimes, estTimes, durationReal, completedTimeStr, firstPhoto, isSpecialRow }) => {
              return (
                <tr
                  key={row.id}
                  className={`group align-middle hover:bg-slate-950/40 border-b border-indigo-950/20 transition duration-155 select-none ${
                    row.terminado ? "bg-slate-950/40 opacity-40-important" : ""
                  } ${
                    isSpecialRow ? "bg-[#18142d] hover:bg-[#201b3d] border-b border-indigo-900/30" : ""
                  }`}
                  style={row.terminado ? { opacity: 0.4 } : undefined}
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
                    {row.terminado && (completedTimeStr || localCompletedTimes[row.id]) && (
                      <div className="mt-1 flex flex-col items-center">
                        <span className="text-[10px] font-bold font-mono tracking-tighter text-emerald-400 block leading-none">
                          {completedTimeStr || localCompletedTimes[row.id]}
                        </span>
                        <span className="text-[9px] font-black font-mono tracking-tight text-emerald-500/80 block mt-1 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/30 animate-pulse">
                          {durationReal} min
                        </span>
                      </div>
                    )}
                  </td>

                  {isSpecialRow ? (
                    <td colSpan={5} className="py-4 px-6 text-center select-all">
                      <div className="font-extrabold text-sm text-slate-150 uppercase tracking-wider py-1 max-w-xl mx-auto drop-shadow-sm leading-relaxed text-slate-200">
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
                      <td className="py-3 px-3 text-center font-mono bg-amber-955/5 text-amber-300 w-[75px]">
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
                          <button
                            id={`ref-photo-btn-${row.id}`} 
                            onClick={(e) => { e.stopPropagation(); triggerLightboxOpen(row); }}
                            className="relative group/photo inline-block cursor-zoom-in border-none bg-transparent p-0"
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
                          </button>
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
  );
}
