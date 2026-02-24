
import './App.css'
import { MyCommerceLayout } from './features/commerces/layouts/MyCommerceLayout'
import { MyCommercePage } from './features/commerces/pages/MyCommercePage'

function App() {

  return (
    <MyCommerceLayout>
      <MyCommercePage />
    </MyCommerceLayout>
  )
}

export default App
