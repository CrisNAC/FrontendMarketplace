import { Loader2 } from "lucide-react";

export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 size={28} className="animate-spin text-[#2d4030]" />
  </div>
);
