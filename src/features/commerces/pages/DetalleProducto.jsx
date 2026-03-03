import { useState } from "react";
import { useNavigate } from "react-router-dom";
import iphoneImg from "../../../assets/iphone.png";
import negroImg from "../../../assets/iphonenegrito.png";
import naranjaImg from "../../../assets/iphonenaranja.png";
import whiteImg from "../../../assets/iphonewhite.png";

/* ---------- SVG ICON COMPONENT ---------- */

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
  star: (
    <path
      d="M12 3l2.9 6 6.6.6-5 4.4 1.5 6.4L12 17l-6 3.4 1.5-6.4-5-4.4 6.6-.6L12 3z"
      fill="currentColor"
    />
  ),
  heart: (
    <path
      d="M12 21s-7-4.6-9.5-8.4C-0.2 8.5 2.1 3 7 5.5 9 6.5 12 10 12 10s3-3.5 5-4.5c4.9-2.5 7.2 3 4.5 7.1C19 16.4 12 21 12 21z"
      fill="currentColor"
    />
  ),
  minus: (
    <path
      d="M5 12h14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  ),
  plus: (
    <>
      <path
        d="M12 5v14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </>
  ),
};

const VERDE = "#8BB2A1";

/*componente*/

export default function DetalleProducto() {
  const navigate = useNavigate();

  const [memoria, setMemoria] = useState("256 GB");
  const [cantidad, setCantidad] = useState(1);
  const [favorito, setFavorito] = useState(false);

  const colores = [
    { id: "deep-blue", nombre: "Deep Blue", img: negroImg },
    { id: "orange", nombre: "Orange", img: naranjaImg },
    { id: "white", nombre: "White", img: whiteImg },
  ];

  const [colorSel, setColorSel] = useState(colores[0]);

  return (
    <div className="min-h-screen bg-[#F3F3F3] overflow-y-auto">
      <div className="max-w-6xl mx-auto px-12 py-10 flex flex-col gap-10">

        {/*boton de atras de nissei*/}
        <button
          type="button"
          onClick={() => navigate("/homepage")}
          className="flex items-center gap-3 w-fit"
        >
          <SvgIcon className="w-5 h-5 text-black">{I.back}</SvgIcon>
          <span className="text-[20px] font-semibold text-black">
            Nissei / Celulares
          </span>
        </button>

        {/*contenido*/}
        <div className="grid grid-cols-2 gap-16 items-start">

          {/*imagen aifon*/}
          <div className="flex justify-center">
            <img
              src={iphoneImg}
              alt="iPhone"
              className="w-[350px] object-contain"
              draggable={false}
            />
          </div>

          {/*info aifon */}
          <div className="flex flex-col items-start">

            <h2 className="text-[21px] font-semibold text-black">
              Apple iPhone 17 Pro A3256 Dual
            </h2>

            {/*rating*/}
            <button
              type="button"
              onClick={() => navigate("/comentarios")}
              className="flex items-center gap-2 mt-1 text-[12px] w-fit"
            >
              <span className="flex items-center gap-1 text-yellow-500">
                4.2
                <SvgIcon className="w-4 h-4 text-yellow-500">{I.star}</SvgIcon>
              </span>
              <span className="text-gray-500 underline">
                178 calificaciones
              </span>
            </button>

            {/*presio*/}
            <div className="mt-3 text-[30px] font-semibold text-black">
              Gs. 13.290.000
            </div>

            {/*stock*/}
            <span
              className="mt-1 text-white text-[10px] px-3 py-[2px] rounded w-fit"
              style={{ backgroundColor: VERDE }}
            >
              En stock
            </span>

            {/*caracteristicas */}
            <div className="mt-6">
              <h3 className="text-[13px] font-semibold mb-2 text-black">
                Características
              </h3>
              <ul className="text-[12px] text-black list-disc pl-5 space-y-1">
                <li>Pantalla LTPO Super Retina XDR OLED 6.3"</li>
                <li>Resolución 1206 × 2622p</li>
                <li>Triple 48Mp + 48Mp + 48Mp</li>
                <li>Frontal 18Mp</li>
              </ul>
            </div>

            {/*colores*/}
            <div className="mt-6">
              <h3 className="text-[13px] font-semibold mb-2 text-black">
                Color{" "}
                <span className="text-gray-500 font-normal">
                  {colorSel.nombre}
                </span>
              </h3>

              <div className="flex gap-3">
                {colores.map((c) => {
                  const activo = c.id === colorSel.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColorSel(c)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition
                        ${
                          activo
                            ? "ring-2 ring-black"
                            : "border border-gray-300 hover:border-black"
                        }`}
                    >
                      <img
                        src={c.img}
                        alt={c.nombre}
                        className="w-8 h-8 rounded-full object-cover"
                        draggable={false}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/*memoria opciones*/}
            <div className="mt-6">
              <h3 className="text-[13px] font-semibold mb-2 text-black">
                Memoria Interna{" "}
                <span className="text-gray-500 font-normal">
                  {memoria}
                </span>
              </h3>

              <div className="inline-flex rounded-full border border-gray-300 overflow-hidden text-[12px]">
                {["256 GB", "512 GB"].map((opcion) => (
                  <button
                    key={opcion}
                    type="button"
                    onClick={() => setMemoria(opcion)}
                    className={`px-5 py-[5px] ${
                      memoria === opcion ? "bg-gray-200" : "bg-white"
                    }`}
                  >
                    {opcion}
                  </button>
                ))}
              </div>
            </div>

            {/*cantidad*/}
            <div className="mt-6">
              <h3 className="text-[13px] font-semibold mb-2 text-black">
                Cantidad
              </h3>

              <div className="inline-flex border border-gray-300 rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setCantidad((v) => (v > 1 ? v - 1 : 1))
                  }
                  className="w-9 h-9 flex items-center justify-center"
                >
                  <SvgIcon className="w-4 h-4 text-gray-600">
                    {I.minus}
                  </SvgIcon>
                </button>

                <div className="w-10 h-9 flex items-center justify-center text-[12px] text-black">
                  {cantidad}
                </div>

                <button
                  type="button"
                  onClick={() => setCantidad((v) => v + 1)}
                  className="w-9 h-9 flex items-center justify-center"
                >
                  <SvgIcon className="w-4 h-4 text-gray-600">
                    {I.plus}
                  </SvgIcon>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/*footer*/}
        <div className="flex items-center justify-between pt-6 border-t border-gray-300">

          <button
            type="button"
            onClick={() => navigate("/comentarios")}
            className="text-[18px] font-semibold text-black border-b border-black pb-[2px]"
          >
            Comentarios
          </button>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="px-8 py-2 rounded-md text-white text-[12px] font-medium"
              style={{ backgroundColor: VERDE }}
            >
              Agregar al Carrito
            </button>

            <button
              type="button"
              onClick={() => setFavorito((v) => !v)}
              className="w-10 h-10 rounded-full border border-gray-300 bg-white flex items-center justify-center"
            >
              <SvgIcon
                className={`w-5 h-5 ${
                  favorito ? "text-red-500" : "text-gray-600"
                }`}
              >
                {I.heart}
              </SvgIcon>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}