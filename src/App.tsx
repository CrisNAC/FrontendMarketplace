
import './App.css'
//import { MyCommerceLayout } from './features/commerces/layout/MyCommerceLayout'
//import { MyCommercePage } from './features/commerces/pages/MyCommercePage'
import { VistaComercioLayout } from './features/commerces/layout/VistaComercioLayout'
//import { VistaComercioPage } from './features/commerces/pages/VistaComercioPage'
import { BusquedaPage } from './features/commerces/pages/BusquedaPage'

function App() {

  return (
    //<MyCommerceLayout>
      //<MyCommercePage />
    //</MyCommerceLayout>
    //<VistaComercioLayout>
      //<VistaComercioPage />
    //</VistaComercioLayout>
    <VistaComercioLayout>
      <BusquedaPage query="Celular" />
    </VistaComercioLayout>
  )
}

export default App
