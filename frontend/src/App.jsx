import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppHeader from './components/AppHeader';
import Home from './pages/Home';
import './App.css'

function App() {
 
  return (
      <BrowserRouter>
          <AppHeader /> {/*  Inside the BrowserRouter */}
          <Routes>
              <Route path="/" element={<Home />} />
          </Routes>
      </BrowserRouter>
  )
}

export default App
