import { useState } from "react";
import laptopImg from "../../../assets/laptopPro15.jpg";
import mouseImg from "../../../assets/mouse.jpg";

const VERDE = "#8BB2A1";

export default function Wishlist() {

  const [cupon, setCupon] = useState("");

  const [productos, setProductos] = useState([
    {
      id: 1,
      nombre: "Laptop Pro 15",
      empresa: "TechOffice Solutions",
      precio: 1299.99,
      img: laptopImg,
      checked: false
    },
    {
      id: 2,
      nombre: "Mouse Inalámbrico",
      empresa: "TechOffice Solutions",
      precio: 29.99,
      img: mouseImg,
      checked: false
    },
    {
      id: 3,
      nombre: "Teclado Mecánico RGB",
      empresa: "GamerGear",
      precio: 149.99,
      img: null,
      checked: false
    }
  ]);

  const toggleCheck = (id) => {

    setProductos(
      productos.map(p =>
        p.id === id
          ? { ...p, checked: !p.checked }
          : p
      )
    );

  };

  const seleccionados = productos.filter(p => p.checked);

  const total = seleccionados.reduce(
    (acc, p) => acc + p.precio,
    0
  );

  const aplicarCupon = () => {

    if (!cupon) {
      alert("Ingresa un cupón");
      return;
    }

    alert("Cupón aplicado");

  };

  return (

    <div className="min-h-screen bg-[#E5EAE9] py-10">

      <div className="max-w-7xl mx-auto px-6">

        <h1 className="text-3xl font-bold text-[#2f3e39] mb-8">
          Lista de deseos
        </h1>

        <div className="grid grid-cols-3 gap-8">

          {/* productos */}

          <div className="col-span-2 flex flex-col gap-6">

            {productos.map(producto => (

              <div
                key={producto.id}
                className="bg-[#F3F5F4] border border-[#C7D6CF] rounded-lg p-5 flex items-center justify-between"
              >

                <div className="flex gap-5 items-center">

                  <input
                    type="checkbox"
                    checked={producto.checked}
                    onChange={() => toggleCheck(producto.id)}
                    className="w-5 h-5 cursor-pointer"
                  />

                  {producto.img ? (

                    <img
                      src={producto.img}
                      className="w-[110px] h-[80px] rounded-md object-cover"
                    />

                  ) : (

                    <div className="w-[110px] h-[80px] rounded-md bg-[#E8DCCB]" />

                  )}

                  <div>

                    <h2 className="font-semibold text-[17px]">
                      {producto.nombre}
                    </h2>

                    <p className="text-gray-500 text-[13px]">
                      {producto.empresa}
                    </p>

                    <div className="mt-2 font-semibold text-[18px]">
                      $ {producto.precio}
                    </div>

                  </div>

                </div>

                {producto.checked ? (

                  <div className="text-gray-500 text-[13px]">
                    Seleccionado
                  </div>

                ) : (

                  <div className="text-gray-400 text-[13px]">
                    No seleccionado
                  </div>

                )}

              </div>

            ))}

          </div>

          {/* resumen */}

          <div className="flex flex-col gap-6">

            <div className="bg-[#F3F5F4] border border-[#C7D6CF] rounded-lg p-5">

              <h3 className="font-semibold mb-4">
                Resumen de selección
              </h3>

              {seleccionados.length === 0 ? (

                <p className="text-gray-500 text-[13px]">
                  No hay productos seleccionados
                </p>

              ) : (

                <div className="flex flex-col gap-3">

                  {seleccionados.map(p => (

                    <div
                      key={p.id}
                      className="flex justify-between text-[14px]"
                    >

                      <span>
                        {p.nombre}
                      </span>

                      <span>
                        $ {p.precio}
                      </span>

                    </div>

                  ))}

                  <div className="border-t pt-3 mt-3 flex justify-between font-semibold">

                    <span>Total</span>

                    <span>
                      $ {total.toFixed(2)}
                    </span>

                  </div>

                  {/* cupon solo si hay productos seleccionados*/}

                  <div className="mt-4">

                    <p className="text-[14px] font-semibold mb-2">
                      Cupón de descuento
                    </p>

                    <div className="flex gap-2 w-full">

                      <input
                        type="text"
                        placeholder="Ingresa tu cupón"
                        value={cupon}
                        onChange={(e) => setCupon(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-[13px]"
                      />

                      <button
                        onClick={aplicarCupon}
                        className="px-4 py-2 rounded-md text-white text-[13px] whitespace-nowrap"
                        style={{ backgroundColor: VERDE }}
                      >
                        Aplicar
                      </button>

                    </div>

                  </div>

                  <button
                    className="mt-4 w-full py-3 rounded-md text-white text-[14px] font-medium"
                    style={{ backgroundColor: VERDE }}
                  >
                    Comprar selección
                  </button>

                </div>

              )}

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}