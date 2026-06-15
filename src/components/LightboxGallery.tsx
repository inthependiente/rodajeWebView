import React from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { PdrRow } from "../types";

interface LightboxGalleryProps {
  activeRefImage: string | null;
  setActiveRefImage: (img: string | null) => void;
  imageGallery: string[];
  galleryIndex: number;
  setGalleryIndex: (index: number) => void;
  pdrRows: PdrRow[];
  handlePrevGalleryImage: () => void;
  handleNextGalleryImage: () => void;
}

export default function LightboxGallery({
  activeRefImage,
  setActiveRefImage,
  imageGallery,
  galleryIndex,
  setGalleryIndex,
  pdrRows,
  handlePrevGalleryImage,
  handleNextGalleryImage
}: LightboxGalleryProps) {
  if (!activeRefImage) return null;

  return (
    <div id="lightbox-gallery-modal" className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <button
        id="close-lightbox-btn"
        onClick={() => setActiveRefImage(null)}
        className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition cursor-pointer"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="max-w-4xl w-full flex flex-col items-center">
        
        <div className="relative w-full max-h-[70vh] flex justify-center items-center overflow-hidden bg-slate-950 rounded-2xl border border-slate-800">
          <img
            id="lightbox-current-image"
            src={activeRefImage}
            alt="Fullscreen reference view"
            className="max-h-full max-w-full object-contain"
            referrerPolicy="no-referrer"
          />

          <button
            id="lightbox-prev-btn"
            onClick={handlePrevGalleryImage}
            className="absolute left-3 p-3 bg-slate-900/80 hover:bg-indigo-600 rounded-full text-white backdrop-blur-sm transition border border-slate-800 cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            id="lightbox-next-btn"
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

          <div id="lightbox-thumbnails-container" className="flex justify-center gap-1.5 mt-3 overflow-x-auto max-w-lg p-1">
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
  );
}
