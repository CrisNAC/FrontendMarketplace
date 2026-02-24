
import './App.css'
import { MyCommerceLayout } from './features/commerces/layouts/MyCommerceLayout'
import { MyCommercePage } from './features/commerces/pages/MyCommercePage'
//import PriceComparisonPage from './features/commerces/pages/PriceComparisonPage.jsx'

function App() {

  return (
    <MyCommerceLayout>
      <MyCommercePage />
    </MyCommerceLayout>
  )
}

export default App
