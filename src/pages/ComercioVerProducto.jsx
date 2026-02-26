import { MyCommerceLayout } from "../layouts/MyCommerceLayout";
import sillaImg from "../assets/silla.jpg";

function SvgIcon({ children, className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const I = {
  back: (
    <path
      d="M15 18l-6-6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  edit: (
    <>
      <path
        d="M12 20h9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  calendar: (
    <>
      <path
        d="M7 2v3M17 2v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M3 9h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M5 5h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </>
  ),
  eye: (
    <>
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12 15a3 3 0 100-6 3 3 0 000 6z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </>
  ),
  check: (
    <path
      d="M20 6L9 17l-5-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};

const TITLE = "text-[#6B9080]";
const BODY = "text-slate-900";
const SUBTLE = "text-slate-600";

function Pill({ children, variant = "indigo" }) {
  const cls =
    variant === "green"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
      : "bg-indigo-50 text-indigo-700 ring-indigo-100";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-[1px] text-[10px] ring-1 ${cls}`}
    >
      {children}
    </span>
  );
}

function SideCard({ title, children }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
      <div className="px-4 pt-2.5 pb-2">
        <h3 className={`text-[12px] font-semibold ${TITLE} text-center`}>
          {title}
        </h3>
      </div>
      <div className="px-4 pb-3">{children}</div>
    </div>
  );
}

function Stars({ count = 5 }) {
  return (
    <div className="flex items-center gap-[1px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`text-[12px] leading-none ${
            i < count ? "text-amber-500" : "text-amber-200"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function AvatarIcon() {
  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-100">
      <svg
        className="h-3.5 w-3.5 text-blue-600"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 21a8 8 0 10-16 0"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 11a4 4 0 100-8 4 4 0 000 8z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function Row({ left, right, rightClass = "" }) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className={SUBTLE}>{left}</span>
      <span className={`${BODY} font-semibold ${rightClass}`}>{right}</span>
    </div>
  );
}

export default function ComercioVerProducto() {
  const comentarios = [
    {
      nombre: "María González",
      fecha: "14 de enero de 2024",
      estrellas: 5,
      verificada: true,
      texto: "Excelente producto, muy buena calidad. Lo recomiendo 100%",
    },
    {
      nombre: "Carlos Ruiz",
      fecha: "9 de enero de 2024",
      estrellas: 4,
      verificada: false,
      texto:
        "Buen producto, llegó en tiempo y forma. Solo le faltó un poco más de información en la descripción.",
    },
    {
      nombre: "Ana López",
      fecha: "7 de enero de 2024",
      estrellas: 5,
      verificada: false,
      texto: "Perfecto! Tal como se ve en las fotos. Muy satisfecha con la compra.",
    },
  ];

  return (
    <MyCommerceLayout>
      <div className="min-h-screen bg-[#ECF7F0]">
        <main className="px-3 py-3 max-w-[1080px]">
          {/* top bar*/}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2 text-left">
              <button
                type="button"
                className="mt-[1px] inline-flex h-7 w-7 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100 hover:bg-slate-50"
                aria-label="Volver"
              >
                <SvgIcon className="w-4 h-4 text-[#6B9080]">{I.back}</SvgIcon>
              </button>

              <div className="text-left">
                <h1 className={`text-[18px] font-semibold ${TITLE}`}>
                  Silla Ergonómica Oficina
                </h1>
                <p className="text-[11px] text-slate-500">
                  Vista detallada del producto y sus calificaciones
                </p>
              </div>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-200/70 px-3 py-1.5 text-[11px] font-semibold text-emerald-900 shadow-sm ring-1 ring-emerald-200 hover:bg-emerald-200"
            >
              <SvgIcon className="w-4 h-4">{I.edit}</SvgIcon>
              Editar Producto
            </button>
          </div>

          {/* grid */}
          <div className="mt-3 grid grid-cols-12 gap-3">
            {/* izquierda */}
            <div className="col-span-12 lg:col-span-8 space-y-3">
              {/* card producto */}
              <section className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
                <div className="grid grid-cols-12 gap-3">
                  {/* imagen */}
                  <div className="col-span-5">
                    <div className="overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-100">
                      <img
                        src={sillaImg}
                        alt="Silla"
                        className="h-[145px] w-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="col-span-7 text-left">
                    <h2 className={`text-[14px] font-semibold ${TITLE}`}>
                      Silla Ergonómica Oficina
                    </h2>

                    <p
                      className={`mt-1.5 max-w-[420px] text-[11px] leading-relaxed ${BODY}`}
                    >
                      Silla ergonómica de oficina con soporte lumbar ajustable,
                      reposabrazos acolchados y base giratoria de 360°. Perfecta
                      para largas jornadas de trabajo.
                    </p>

                    <div className="mt-3 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className={SUBTLE}>Precio:</span>
                        <span className="font-semibold text-emerald-700">$ 89.990</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={SUBTLE}>Categoría:</span>
                        <Pill variant="indigo">Muebles</Pill>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={SUBTLE}>Estado:</span>
                        <Pill variant="green">Activo</Pill>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={SUBTLE}>Calificación:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] leading-none text-amber-500">★</span>
                          <span className={`${BODY} font-semibold`}>4.7</span>
                          <span className="text-[11px] text-slate-500">( 3 reseñas )</span>
                        </div>
                      </div>

                      <div className="flex items-start justify-between">
                        <span className={`pt-[1px] ${SUBTLE}`}>Etiquetas:</span>
                        <div className="flex flex-wrap justify-end gap-1.5">
                          <Pill variant="indigo">ergonomica</Pill>
                          <Pill variant="indigo">oficina</Pill>
                          <Pill variant="indigo">silla</Pill>
                          <Pill variant="indigo">trabajo</Pill>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* comentarios */}
              <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                <div className="px-4 pt-3 pb-2 text-left">
                  <h3 className={`text-[12px] font-semibold ${TITLE}`}>
                    Calificaciones y Comentarios ( {comentarios.length} )
                  </h3>
                </div>

                <div className="px-4 pb-3">
                  {comentarios.map((c, idx) => (
                    <div
                      key={idx}
                      className={[
                        "py-2.5",
                        idx !== 0 ? "border-t border-slate-100" : "",
                      ].join(" ")}
                    >
                      <div className="flex items-start gap-2 text-left">
                        <AvatarIcon />
                        <div className="flex-1 text-left">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className={`text-[11px] font-semibold ${TITLE}`}>
                              {c.nombre}
                            </span>

                            {c.verificada && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600">
                                <SvgIcon className="w-3 h-3">{I.check}</SvgIcon>
                                Verificada
                              </span>
                            )}

                            <Stars count={c.estrellas} />

                            <span className="text-[10px] text-slate-500">{c.fecha}</span>
                          </div>

                          <p className={`mt-1.5 text-[11px] leading-relaxed ${BODY}`}>
                            {c.texto}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* derecha */}
            <div className="col-span-12 lg:col-span-4 space-y-3">
              <SideCard title="Información">
                <div className="space-y-3 text-left text-[11px]">
                  <div className="flex items-start gap-2">
                    <span className="mt-[1px] text-blue-600">
                      <SvgIcon className="w-4 h-4">{I.calendar}</SvgIcon>
                    </span>
                    <div className="leading-tight">
                      <div className={`text-[11px] font-semibold ${TITLE}`}>Creado</div>
                      <div className="mt-0.5 text-[11px] text-slate-600">1 de enero de 2024</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="mt-[1px] text-amber-500">
                      <SvgIcon className="w-4 h-4">{I.edit}</SvgIcon>
                    </span>
                    <div className="leading-tight">
                      <div className={`text-[11px] font-semibold ${TITLE}`}>Última actualización</div>
                      <div className="mt-0.5 text-[11px] text-slate-600">15 de enero de 2024</div>
                    </div>
                  </div>

                  <div className="pt-0.5">
                    <div className={`text-[11px] font-semibold ${TITLE}`}>ID del producto</div>
                    <div className="mt-0.5 text-[11px] text-slate-600">1</div>
                  </div>
                </div>
              </SideCard>

              <SideCard title="Estadísticas">
                <div className="space-y-2.5">
                  <Row
                    left="Calificación promedio:"
                    right="4.7 / 5.0"
                    rightClass="text-amber-600"
                  />
                  <Row left="Total de reseñas:" right="3" rightClass="text-emerald-700" />
                  <Row left="Reseñas verificadas:" right="2" rightClass="text-emerald-700" />
                </div>
              </SideCard>

              <SideCard title="Acciones Rápidas">
                <div className="space-y-2">
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-100/70 px-3 py-1.5 text-[11px] font-semibold text-emerald-900 hover:bg-emerald-100"
                  >
                    <SvgIcon className="w-4 h-4">{I.edit}</SvgIcon>
                    Editar Información
                  </button>

                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-100/60 px-3 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    <SvgIcon className="w-4 h-4">{I.eye}</SvgIcon>
                    Ver en Tienda
                  </button>
                </div>
              </SideCard>
            </div>
          </div>
        </main>
      </div>
    </MyCommerceLayout>
  );
}