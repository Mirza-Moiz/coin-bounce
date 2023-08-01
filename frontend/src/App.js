import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';

function App() {
  return (
    <div >
      <BrowserRouter>
        <Navbar />

      </BrowserRouter>
    </div>
  );
}

export default App;