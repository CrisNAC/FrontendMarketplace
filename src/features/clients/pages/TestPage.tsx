const TestPage = () => (
  <div className="p-10 text-center">
    <h1 className="text-3xl font-bold">Bienvenido al Marketplace</h1>
    <p className="mt-4">Navega a <a href="/login" className="text-blue-500 underline">Login/Registro</a></p>
    <p className="mt-4">Navega a <a href="/comparar" className="text-blue-500 underline">Comparar Precios</a></p>
    <p className="mt-4">Navega a <a href="/perfil" className="text-blue-500 underline">Mi Perfil</a></p>
    <p className="mt-4">Navega a <a href="/producto-detalle/:id" className="text-blue-500 underline">Detalle de Producto</a></p>
    <p className="mt-4">Navega a <a href="/comercio" className="text-blue-500 underline">Mi Comercio (Dashboard)</a></p>
    <p className="mt-4">Navega a <a href="/admin/dashboard" className="text-blue-500 underline">Mi Panel de Admin</a></p>
    <p className="mt-4">Navega a <a href="/perfil-comercio" className="text-blue-500 underline">Perfil comercio</a></p>
    <p className="mt-4">Navega a <a href="/comercio/productos/1" className="text-blue-500 underline">Ver Producto Comercio (ID 1)</a></p>
    <p className="mt-4">Navega a <a href="/comercio/productos/nuevo" className="text-blue-500 underline">Crear Producto Comercio</a></p>
    <p className="mt-4">Navega a <a href="/pedidos" className="text-blue-500 underline">Ver pedidos</a></p>
    <p className="mt-4">Navega a <a href="/homepage" className="text-blue-500 underline">Homepage</a></p>
    <p className="mt-4">Navega a <a href="/busqueda" className="text-blue-500 underline">Busqueda</a></p>
    <p className="mt-4">Navega a <a href="/comentarios" className="text-blue-500 underline">Comentarios</a></p>
    <p className="mt-4">Navega a <a href="/crear-comercio" className="text-blue-500 underline">Crear Comercio</a></p>
    <p className="mt-4">Navega a <a href="/mi-perfil" className="text-blue-500 underline">Editar Perfil</a></p>
    <p className="mt-4">Navega a <a href="/cambiar-contrasena" className="text-blue-500 underline">Cambiar Contraseña</a></p>
    <p className="mt-4">Navega a <a href="/carrito" className="text-blue-500 underline">Carrito de Compras</a></p>
    <p className="mt-4">Navega a <a href="/cart" className="text-blue-500 underline">Carrito de Compras</a></p>
    <p className="mt-4">Navega a <a href="/admin/reviews" className="text-blue-500 underline">Reclamos</a></p>
    <p className="mt-4">Navega a <a href="/admin/claims" className="text-blue-500 underline">Reclamos</a></p>
    <p className="mt-4">Navega a <a href="/comercio/claims" className="text-blue-500 underline">Reclamos Comercio</a></p>

  </div>
);

export default TestPage;