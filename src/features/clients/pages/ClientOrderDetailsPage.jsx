import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { SidebarClientProfile } from '../../../components/SidebarClientProfile';
import Navbar from '../../../components/navbar/Navbar';

export const ClientOrderDetailsPage = () => {

    const { orderId } = useParams();

    const orders = [
        {
            id: "ORD-2024-001543",
            estado: "Entregado",
            fecha: "15 de junio del 2024",
            articulos: [
                {
                    idArticulo: "108747",
                    nombre: "Mouse Logitech M170 Inalámbrico",
                    variante: { etiqueta: "Color", valor: "Blanco" },
                    precioUnitario: 94000,
                    cantidadPedida: 1,
                    cantidadEnviada: 1,
                    subtotal: 94000
                }
            ],
            resumen: {
                costoEnvio: 0,
                recompensa: { puntos: 8, descuento: 32800 },
                total: 61200
            },
            infoPedido: {
                direccionEnvio: {
                    nombre: "Belén Sánchez",
                    calle: "Padre Carlos Winckel 235",
                    ciudad: "Encarnación, Itapúa",
                    pais: "Paraguay",
                    telefono: "0982230258",
                    vat: "5612448"
                },
                direccionFacturacion: {
                    nombre: "Belén Sánchez",
                    calle: "Padre Carlos Winckel 235",
                    ciudad: "Encarnación, Itapúa",
                    pais: "Paraguay",
                    telefono: "0982230258",
                    vat: "5612448"
                },
                metodoEnvio: "Retiro Elocker Nissei | Encarnación-Petrobras, Avda. Las Juanas - Tiempo de envío: 2 días hábiles | Abierto las 24hrs",
                metodoPago: "Tarjetas de crédito o débito Ueno Bank"
            }
        },
        {
            id: "ORD-2024-001502",
            estado: "Pendiente",
            fecha: "8 de junio del 2024",
            articulos: [
                {
                    idArticulo: "209881",
                    nombre: "Teclado Mecánico Redragon Kumara",
                    variante: { etiqueta: "Switch", valor: "Red" },
                    precioUnitario: 299000,
                    cantidadPedida: 1,
                    cantidadEnviada: 0,
                    subtotal: 299000
                }
            ],
            resumen: {
                costoEnvio: 15000,
                recompensa: { puntos: 0, descuento: 0 },
                total: 314000
            },
            infoPedido: {
                direccionEnvio: {
                    nombre: "Belén Sánchez",
                    calle: "Padre Carlos Winckel 235",
                    ciudad: "Encarnación, Itapúa",
                    pais: "Paraguay",
                    telefono: "0982230258",
                    vat: "5612448"
                },
                direccionFacturacion: {
                    nombre: "Belén Sánchez",
                    calle: "Padre Carlos Winckel 235",
                    ciudad: "Encarnación, Itapúa",
                    pais: "Paraguay",
                    telefono: "0982230258",
                    vat: "5612448"
                },
                metodoEnvio: "Envío a Domicilio Estándar - Tiempo de envío: 3 a 5 días hábiles",
                metodoPago: "Transferencia Bancaria (SIPA)"
            }
        },
        {
            id: "ORD-2024-001489",
            estado: "Cancelado",
            fecha: "1 de junio del 2024",
            articulos: [
                {
                    idArticulo: "108747",
                    nombre: "Mouse Logitech M170 Inalámbrico",
                    variante: { etiqueta: "Color", valor: "Blanco" },
                    precioUnitario: 94000,
                    cantidadPedida: 2,
                    cantidadEnviada: 2,
                    subtotal: 94000
                }
            ],
            resumen: {
                costoEnvio: 0,
                recompensa: { puntos: 8, descuento: 32800 },
                total: 61200
            },
            infoPedido: {
                direccionEnvio: {
                    nombre: "Belén Sánchez",
                    calle: "Padre Carlos Winckel 235",
                    ciudad: "Encarnación, Itapúa",
                    pais: "Paraguay",
                    telefono: "0982230258",
                    vat: "5612448"
                },
                direccionFacturacion: {
                    nombre: "Belén Sánchez",
                    calle: "Padre Carlos Winckel 235",
                    ciudad: "Encarnación, Itapúa",
                    pais: "Paraguay",
                    telefono: "0982230258",
                    vat: "5612448"
                },
                metodoEnvio: "Retiro Elocker Nissei | Encarnación-Petrobras, Avda. Las Juanas - Tiempo de envío: 2 días hábiles | Abierto las 24hrs",
                metodoPago: "Tarjetas de crédito o débito Ueno Bank"
            }
        }
    ];

    //se busca el pedido segun el id
    const order = orders.find(o => o.id === orderId);

    // funcion para calcular el subtotal de cada articulo
    const calcularSubtotal = (articulos) => {
        return articulos.reduce((acc, item) => acc + item.precioUnitario * item.cantidadPedida, 0);
    };


    // funcion para calcular el total del pedido
    const calcularTotal = (order) => {
        const subtotal = calcularSubtotal(order.articulos);
        return subtotal + order.resumen.costoEnvio - order.resumen.recompensa.descuento;
    }


    // Funcion para formatear moneda
    const formatCurrency = (val) => `Gs. ${val.toLocaleString('es-PY')}`;

    return (
        <div>
            <Navbar />
            {/*titulo*/}
            <h3 className="p-2 ms-5 mt-2 font-bold">Mis Pedidos</h3>

            <div className="grid grid-cols-[250px_1fr] min-h-screen gap-x-20">
                <div className="p-3 w-80">
                    <SidebarClientProfile />
                </div>

                <div className="mb-5">
                    {/* Cabecera dinámica */}
                    <div className="flex justify-between items-start mb-2 bg-white p-2 rounded-lg me-2">
                        <div>
                            <p className="text-lg font-bold">Pedido N° {order.id}</p>
                            <p className="text-sm text-gray-900 mb-0">Fecha de pedido: {order.fecha}</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <span className={`border px-3 py-1 rounded-sm text-sm ${order.estado === 'Entregado' ? 'border-green-500 text-green-600' :
                                order.estado === 'Cancelado' ? 'border-red-500 text-red-600' :
                                    'border-yellow-500 text-yellow-600'
                                }`}>
                                {order.estado}
                            </span>
                            <div className="text-sm">
                                <button className="text-blue-500 hover:underline p-1">Imprimir pedido</button>
                                <button className="text-gray-900 hover:underline p-1">Devolución</button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-2 rounded-lg me-2">
                        <div className="flex gap-6 mb-2 text-sm">
                            <span className="font-bold text-gray-900 border-b-2 border-black pb-2">Artículos pedidos</span>
                            <span className="text-gray-900 cursor-pointer hover:text-gray-900">Facturas</span>
                            <span className="text-gray-900 cursor-pointer hover:text-gray-900">Envíos de pedido</span>
                        </div>

                        {/* Tabla  */}
                        <div className="border border-gray-200 rounded-sm">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="p-2 font-semibold text-gray-900">Nombre del Producto</th>
                                        <th className="p-2 font-semibold text-gray-900 text-right">Art.</th>
                                        <th className="p-2 font-semibold text-gray-900 text-right">Precio</th>
                                        <th className="p-2 font-semibold text-gray-900 text-right">Cantidad</th>
                                        <th className="p-2 font-semibold text-gray-900 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.articulos.map((item, index) => (
                                        <tr key={index} className="border-b border-gray-200">
                                            <td className="p-2">
                                                <p className="font-medium text-gray-800">{item.nombre}</p>
                                                <p className="text-xs text-gray-900 mt-1">
                                                    <span className="font-bold text-gray-700">{item.variante.etiqueta}:</span> {item.variante.valor}
                                                </p>
                                            </td>
                                            <td className="p-2 text-gray-900">{item.idArticulo}</td>
                                            <td className="p-2 text-gray-900">{formatCurrency(item.precioUnitario)}</td>
                                            <td className="p-2 text-gray-900">
                                                <p>Pedido realizado: {item.cantidadPedida}</p>
                                                <p>Enviado: {item.cantidadEnviada}</p>
                                            </td>
                                            <td className="p-2 font-medium text-gray-900">{formatCurrency(calcularSubtotal([item]))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Resumen Dinamico */}
                            <div className="flex justify-end bg-gray-50/50">
                                <div className="w-80 text-sm space-y-2 me-5">
                                    <div className="flex justify-between">
                                        <span className="text-gray-900">Subtotal</span>
                                        <span className="text-gray-900 font-medium">{formatCurrency(calcularSubtotal(order.articulos))}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-900">Costo de envío</span>
                                        <span className="text-gray-900 font-medium">{formatCurrency(order.resumen.costoEnvio)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-base text-gray-900 border-gray-200 pt-2 mt-2">
                                        <span>Total</span>
                                        <span>{formatCurrency(calcularTotal(order))}</span>
                                    </div>
                                    {order.resumen.recompensa.puntos > 0 && (
                                        <div className="flex justify-between text-gray-900">
                                            <span>{order.resumen.recompensa.puntos} puntos de recompensa</span>
                                            <span className="text-gray-900">-{formatCurrency(order.resumen.recompensa.descuento)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Informacion del pedido */}
                        <div>
                            <p className="text-lg font-bold mb-0 p-2">Información de pedido</p>
                            <div className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-4 gap-1">

                                <div>
                                    <p className="font-bold text-gray-900">Dirección de envío</p>
                                    <div className="text-gray-900 text-xs">
                                        <p>{order.infoPedido.direccionEnvio.nombre}</p>
                                        <p>{order.infoPedido.direccionEnvio.calle}</p>
                                        <p>{order.infoPedido.direccionEnvio.ciudad}</p>
                                        <p>{order.infoPedido.direccionEnvio.pais}</p>
                                        <p>T: {order.infoPedido.direccionEnvio.telefono}</p>
                                        <p>VAT: {order.infoPedido.direccionEnvio.vat}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="font-bold text-gray-900">Método de envío</p>
                                    <p className="text-gray-600 text-xs">{order.infoPedido.metodoEnvio}</p>
                                </div>

                                <div>
                                    <p className="font-bold text-gray-900">Dirección de facturación</p>
                                    <div className="text-gray-900 text-xs">
                                        <p>{order.infoPedido.direccionFacturacion.nombre}</p>
                                        <p>{order.infoPedido.direccionFacturacion.calle}</p>
                                        <p>{order.infoPedido.direccionFacturacion.ciudad}</p>
                                        <p>{order.infoPedido.direccionFacturacion.pais}</p>
                                        <p>T: {order.infoPedido.direccionFacturacion.telefono}</p>
                                        <p>VAT: {order.infoPedido.direccionFacturacion.vat}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="font-bold text-gray-900">Método de pago</p>
                                    <p className="text-gray-900 text-xs">{order.infoPedido.metodoPago}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end mt-4 me-2">
                        <button onClick={() => window.history.back()} className="bg-[#6B9080] text-white px-4 py-2 rounded hover:bg-green-800 transition-colors">Volver</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
