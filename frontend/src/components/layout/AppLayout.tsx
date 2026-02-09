import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ToastHost from "@/components/common/ToastHost";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-base-900 text-text-200">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
      <Footer />
      <ToastHost />
    </div>
  );
}
