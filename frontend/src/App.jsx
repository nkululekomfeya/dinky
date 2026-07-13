import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppHeader from './components/AppHeader';
import Home from './pages/Home';
import './App.css'
import GaugeList from './pages/GaugeList';

function App() {
 
  return (
      <BrowserRouter>
          <AppHeader /> {/*  Inside the BrowserRouter */}
          <Routes>
              <Route path="/" element={<Home />} />;
              <Route path="/gauges" element={<GaugeList />} />
          </Routes>
      </BrowserRouter>
  )
}

export default App
