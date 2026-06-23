"use client";

import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { motion } from "framer-motion";
import { Eraser, Check, Trash2 } from "lucide-react";

interface SignaturePadProps {
  onSave: (signatureData: string) => void;
  onClear: () => void;
}

export default function SignaturePad({ onSave, onClear }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const clear = () => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
    onClear();
  };

  const save = () => {
    if (sigCanvas.current?.isEmpty()) return;
    const dataUrl = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");
    if (dataUrl) {
      onSave(dataUrl);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="relative border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 overflow-hidden h-64 group focus-within:border-blue-400 transition-colors">
        <SignatureCanvas
          ref={sigCanvas}
          penColor="#0f172a"
          canvasProps={{
            className: "w-full h-full cursor-crosshair",
          }}
          onBegin={() => setIsEmpty(false)}
        />
        
        {isEmpty && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400">
            <span className="text-sm font-medium">Tanda tangan di sini</span>
            <span className="text-[10px] uppercase tracking-wider mt-1 opacity-60">Gunakan mouse atau touch screen</span>
          </div>
        )}

        <div className="absolute top-4 right-4 flex gap-2">
          <button
            type="button"
            onClick={clear}
            className="p-2 bg-white/80 backdrop-blur-sm text-red-500 hover:bg-red-50 rounded-lg shadow-sm transition-all"
            title="Hapus"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center px-2">
        <p className="text-xs text-slate-500 italic">
          Pastikan tanda tangan terlihat jelas dan rapi.
        </p>
        <button
          type="button"
          onClick={save}
          disabled={isEmpty}
          className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-900 disabled:bg-slate-200 transition-all shadow-sm"
        >
          <Check size={16} /> Konfirmasi Tanda Tangan
        </button>
      </div>
    </div>
  );
}
