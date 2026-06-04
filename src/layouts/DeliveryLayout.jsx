// src/layouts/DeliveryLayout.jsx
import { useState, useEffect, useCallback } from "react";
import { Menu } from "lucide-react";
import { SidebarDelivery } from "../components/SidebarDelivery";

const MD_BREAKPOINT = 768;

function readDesktopFromMatchMedia() {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
        return true;
    }
    return window.matchMedia(`(min-width: ${MD_BREAKPOINT}px)`).matches;
}

function useIsDesktop() {
    const [desktop, setDesktop] = useState(readDesktopFromMatchMedia);

    useEffect(() => {
        if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
            return;
        }
        const mq = window.matchMedia(`(min-width: ${MD_BREAKPOINT}px)`);
        const onChange = () => setDesktop(mq.matches);
        onChange();
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);

    return desktop;
}

export const DeliveryLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const isDesktop = useIsDesktop();
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    useEffect(() => {
        if (isDesktop) setMobileNavOpen(false);
    }, [isDesktop]);

    const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

    const handleSidebarToggle = () => {
        if (isDesktop) {
            setCollapsed((p) => !p);
        } else {
            setMobileNavOpen(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-[var(--background-soft)] md:flex md:flex-row">
            <header className="fixed left-0 right-0 top-0 z-50 flex h-14 shrink-0 items-center gap-3 border-b border-slate-200/90 bg-white px-4 shadow-sm md:hidden">
                <button
                    type="button"
                    onClick={() => setMobileNavOpen(true)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-800"
                    aria-label="Abrir menú de navegación"
                >
                    <Menu size={22} />
                </button>
                <span className="text-base font-bold text-[var(--primary-dark)]">Panel Delivery</span>
            </header>

            {mobileNavOpen && !isDesktop ? (
                <button
                    type="button"
                    className="fixed inset-0 z-[55] bg-black/45 md:hidden"
                    aria-label="Cerrar menú"
                    onClick={closeMobileNav}
                />
            ) : null}

            <div
                className={[
                    "flex shrink-0 transition-transform duration-200 ease-out",
                    "fixed inset-y-0 left-0 z-[60] md:sticky md:top-0 md:h-screen md:z-auto md:translate-x-0",
                    !isDesktop && !mobileNavOpen ? "-translate-x-full" : "translate-x-0",
                ].join(" ")}
            >
                <SidebarDelivery
                    collapsed={isDesktop ? collapsed : false}
                    onToggle={handleSidebarToggle}
                    onNavigate={closeMobileNav}
                />
            </div>

            <main className="min-h-screen flex-1 overflow-auto bg-[var(--background-soft)] px-4 pb-6 pt-[4.5rem] md:min-h-screen md:p-6 md:pt-6">
                {children}
            </main>
        </div>
    );
};
