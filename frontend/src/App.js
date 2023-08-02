import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './components/pages/Home';
import Footer from './components/Footer/Footer';

import styles from './App.module.css';

function App() {
  return (
    <div className={styles.container}>
      <BrowserRouter>
        <div className={styles.layout}>

          <Navbar />
          <div>

            <Routes>
              <Route path="/" exact element={<div className={styles.main}>
                < Home /></div>} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;