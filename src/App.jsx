import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Popup from './Popup';
function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <Popup />
    </div>
  )
}

export default App
