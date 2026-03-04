import { Edit2 } from "lucide-react";
import Navbar from "../../../components/navbar/Navbar";
import { SidebarClientProfile } from "../../../components/SidebarClientProfile";

const AccountSectionHeader = ({ title, rightContent }) => {
    return (
        <div className="bg-[#f0f2f1] border border-gray-200 px-4 py-3 font-semibold text-black flex justify-between items-center rounded-sm">
            <span className="text-[15px]">{title}</span>
            {rightContent && <div className="text-sm font-normal">{rightContent}</div>}
        </div>
    );
};

const AccountInfoCard = ({ title, children, footer }) => {
    return (
        <div className="border border-gray-200 rounded-sm bg-white flex flex-col h-full shadow-sm">
            <div className="p-5 flex-1">
                <h3 className="font-semibold text-black text-[15px] mb-4">{title}</h3>
                <div className="text-gray-800 text-[15px] space-y-1.5">{children}</div>
            </div>
            {footer && (
                <div className="px-5 pb-5 mt-auto flex justify-between items-center text-[14px] text-[#1b7bd5]">
                    {footer}
                </div>
            )}
        </div>
    );
};

const MyAccountPage = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="max-w-[1400px] mx-auto w-full px-6 py-10">
                <h1 className="text-[28px] font-bold text-[#2d4030] mb-8">Mi Cuenta</h1>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <aside className="w-full md:w-[280px] shrink-0">
                        <SidebarClientProfile />
                    </aside>

                    <div className="flex-1 w-full space-y-10">
                        <section>
                            <AccountSectionHeader title="Información de la cuenta" />
                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <AccountInfoCard
                                    title="Información de Contacto"
                                    footer={
                                        <>
                                            <button className="hover:underline">Editar</button>
                                            <button className="hover:underline">Cambiar contraseña</button>
                                        </>
                                    }
                                >
                                    <p>Eliana Sanchez</p>
                                    <p>elianasanchez0666@gmail.com</p>
                                </AccountInfoCard>

                                <AccountInfoCard
                                    title="Boletines informativos"
                                    footer={<button className="hover:underline">Editar</button>}
                                >
                                    <p>Usted no está suscrito a nuestro boletín de noticias.</p>
                                </AccountInfoCard>
                            </div>
                        </section>

                        <section>
                            <AccountSectionHeader
                                title="Libreta de direcciones"
                                rightContent={
                                    <button className="flex items-center gap-1.5 text-[#1b7bd5] hover:underline">
                                        Gestionar direcciones
                                        <Edit2 size={14} />
                                    </button>
                                }
                            />
                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <AccountInfoCard
                                    title="Dirección de pago predeterminada"
                                    footer={<button className="hover:underline">Editar dirección</button>}
                                >
                                    <p>No ha establecido una dirección de facturación predeterminada.</p>
                                </AccountInfoCard>

                                <AccountInfoCard
                                    title="Dirección de envío predeterminada"
                                    footer={<button className="hover:underline">Editar dirección</button>}
                                >
                                    <p>No ha establecido una dirección de envío predeterminada.</p>
                                </AccountInfoCard>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MyAccountPage;
