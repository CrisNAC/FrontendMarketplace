import { Navbar, SidebarClientProfile } from "@/components";

export const ClientLayout = ({ children, title }) => {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="shrink-0 sticky top-0 z-50">
        <Navbar />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[280px] shrink-0 overflow-y-auto p-6">
          {title && (
            <h1 className="text-[28px] font-bold text-[#2d4030] mb-6">{title}</h1>
          )}
          <SidebarClientProfile />
        </aside>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
