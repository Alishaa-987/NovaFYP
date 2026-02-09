import { useEffect, useRef, useState } from "react";

type ToastTone = "success" | "info" | "error";

type ToastMessage = {
  message: string;
  tone: ToastTone;
};

const toneStyles: Record<ToastTone, string> = {
  success: "bg-emerald-500/20 text-emerald-200 border-emerald-400/40",
  info: "bg-brand-500/20 text-brand-100 border-brand-400/40",
  error: "bg-red-500/20 text-red-100 border-red-400/40"
};

export default function ToastHost() {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<{ message: string; tone?: ToastTone }>;
      const message = customEvent.detail?.message;
      if (!message) {
        return;
      }
      const tone = customEvent.detail?.tone ?? "info";
      setToast({ message, tone });

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        setToast(null);
      }, 2500);
    };

    window.addEventListener("novafyp_toast", handleToast);
    return () => {
      window.removeEventListener("novafyp_toast", handleToast);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!toast) {
    return null;
  }

  return (
    <div className="fixed right-6 bottom-6 z-50">
      <div
        className={`border rounded-2xl px-4 py-3 shadow-glow backdrop-blur-xl ${toneStyles[toast.tone]}`}
        role="status"
        aria-live="polite"
      >
        <div className="text-sm font-semibold">{toast.message}</div>
      </div>
    </div>
  );
}
