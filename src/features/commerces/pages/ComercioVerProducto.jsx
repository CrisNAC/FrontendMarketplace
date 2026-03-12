import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getProductById } from "../services/productDetailApi";
import { MyCommerceLayout } from "../../../layouts/MyCommerceLayout";
import sillaImg from "../../../assets/silla.jpg";

const TITLE = "text-[#6B9080]";
const SUBTLE = "text-slate-600";

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full px-2 py-[1px] text-[10px] bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
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

      <div className="px-4 pb-3">
        {children}
      </div>

    </div>
  );
}

export default function ComercioVerProducto() {

  const navigate = useNavigate();

  const { id } = useParams();

  const [producto, setProducto] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const comentarios = [
    {
      nombre: "María González",
      fecha: "14 de enero de 2024",
      estrellas: 5,
      verificada: true,
      texto: "Excelente producto"
    }
  ];

  useEffect(() => {

    const fetchProduct = async () => {

      try {

        const data = await getProductById(id);
        console.log(data);
        setProducto(data);

      }
      catch (err) {

        console.log(err);

        setError("No se pudo cargar el producto");

      }
      finally {

        setLoading(false);

      }

    };

    fetchProduct();

  }, [id]);


  if (loading) {

    return (
      <p className="p-10">
        Cargando producto...
      </p>
    );

  }

  if (error) {

    return (
      <p className="p-10 text-red-500">
        {error}
      </p>
    );

  }

  if (!producto) {

    return (
      <p className="p-10">
        Producto no encontrado
      </p>
    );

  }

  return (

    <MyCommerceLayout>

      <div className="min-h-screen bg-[#ECF7F0]">

        <main className="px-3 py-3 max-w-[1080px]">

          {/* HEADER */}

          <div className="flex items-start justify-between">

            <div className="flex items-start gap-2">

              <button
                onClick={() => navigate("/comercio")}
                className="mt-[1px] inline-flex h-7 w-7 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100"
              >
                ←
              </button>

              <div>

                <h1 className={`text-[18px] font-semibold ${TITLE}`}>
                  {producto.name}
                </h1>

                <p className="text-[11px] text-slate-500">
                  Vista detallada del producto
                </p>

              </div>

            </div>

            <button
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-200/70 px-3 py-1.5 text-[11px]"
            >
              Editar Producto
            </button>

          </div>


          {/* GRID */}

          <div className="mt-3 grid grid-cols-12 gap-3">

            {/* IZQUIERDA */}

            <div className="col-span-12 lg:col-span-8 space-y-3">

              {/* PRODUCTO */}

              <section className="rounded-2xl bg-white p-3 shadow-sm ring-1">

                <div className="grid grid-cols-12 gap-3">

                  <div className="col-span-5">

                    <img
                      src={sillaImg}
                      className="h-[145px] w-full object-cover rounded-2xl"
                    />

                  </div>

                  <div className="col-span-7">

                    <h2 className={`text-[14px] font-semibold ${TITLE}`}>
                      {producto.name}
                    </h2>

                    <p className="mt-2 text-[11px]">
                      {producto.description}
                    </p>

                    <div className="mt-3 space-y-1.5 text-[11px]">

                      <div className="flex justify-between">

                        <span className={SUBTLE}>
                          Precio:
                        </span>

                        <span className="font-semibold text-emerald-700">
                          Gs {producto.price?.toLocaleString()}
                        </span>

                      </div>

                      <div className="flex justify-between">

                        <span className={SUBTLE}>
                          Categoría:
                        </span>

                        <Pill>
                          {producto.category?.name}
                        </Pill>

                      </div>

                      <div className="flex justify-between">

                        <span className={SUBTLE}>
                          Estado:
                        </span>

                        <Pill>
                          {producto.status}
                        </Pill>

                      </div>

                      <div className="flex justify-between">

                        <span className={SUBTLE}>
                          ID:
                        </span>

                        <span>
                          {producto.id}
                        </span>

                      </div>

                      <div className="flex justify-between">

                        <span className={SUBTLE}>
                          Etiquetas:
                        </span>

                        <div className="flex gap-1">

                          {producto.tags?.map(tag => (

                            <Pill key={tag.id}>
                              {tag.name}
                            </Pill>

                          ))}

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </section>


              {/* COMENTARIOS */}

              <section className="rounded-2xl bg-white shadow-sm ring-1">

                <div className="px-4 pt-3 pb-2">

                  <h3 className={`text-[12px] font-semibold ${TITLE}`}>
                    Comentarios ({comentarios.length})
                  </h3>

                </div>

                <div className="px-4 pb-3">

                  {comentarios.map((c, i) => (

                    <div key={i} className="py-2">

                      <p className="text-[11px] font-semibold">
                        {c.nombre}
                      </p>

                      <p className="text-[11px] text-slate-600">
                        {c.texto}
                      </p>

                    </div>

                  ))}

                </div>

              </section>

            </div>


            {/* DERECHA */}

            <div className="col-span-12 lg:col-span-4 space-y-3">

              <SideCard title="Información">

                <div className="text-[11px] space-y-2">

                  <div>

                    Creado:

                    <div className="text-slate-600">

                      {producto.createdAt
                        ? new Date(producto.createdAt).toLocaleDateString()
                        : "-"
                      }

                    </div>

                  </div>

                  <div>

                    Actualizado:

                    <div className="text-slate-600">

                      {producto.updatedAt
                        ? new Date(producto.updatedAt).toLocaleDateString()
                        : "-"
                      }

                    </div>

                  </div>

                </div>

              </SideCard>

            </div>

          </div>

        </main>

      </div>

    </MyCommerceLayout>

  );

}