import { Routes, Route } from 'react-router-dom';
import AppHeader from './components/AppHeader';
import Home from './pages/Home';
import './App.css'
import GaugeList from './pages/GaugeList';
import AddGauge from './pages/AddGauge';
import GaugeDetail from './pages/GaugeDetail';

function App() {
 
  return (
      <>
          <AppHeader /> {/*  Inside the BrowserRouter */}
          <Routes>
              <Route path="/" element={<GaugeList />} />;
              <Route path="/gauges/new" element={<AddGauge />} />;
              <Route path="/gauges/:id" element={<GaugeDetail />} />;
              <Route path="/gauges" element={<GaugeList />} />
          </Routes>
      </>
  )
}

export default App
