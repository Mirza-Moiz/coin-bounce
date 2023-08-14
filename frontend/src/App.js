import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from './pages/Home/Home';
import Footer from "./components/Footer/Footer";

import styles from "./App.module.css";
import Error from "./pages/Error/Error";

function App() {
  return (
    <div className={styles.container}>
      <BrowserRouter>
        <div className={styles.layout}>
          <Navbar />
          <div>
            <Routes>
              <Route
                path="/"
                exact
                element={
                  <div className={styles.main}>
                    <Home />
                  </div>
                }
              />
              <Route
                path="crypto"
                exact
                element={
                  <div className={styles.main}>
                    <h1>Crypto Page</h1>
                  </div>
                }
              />

              <Route
                path="blogs"
                exact
                element={
                  <div className={styles.main}>
                    <h1>Blogs Page</h1>
                  </div>
                }
              />

              <Route
                path="blog/:id"
                exact
                element={
                  <div className={styles.main}>
                    <h1>Blog Page</h1>
                  </div>
                }
              />

              <Route
                path="blog-update/:id"
                exact
                element={
                  <div className={styles.main}>
                    <h1>Update Blog Page</h1>
                  </div>
                }
              />

              <Route
                path="submit"
                exact
                element={
                  <div className={styles.main}>
                    <h1>Add Blog Page</h1>
                  </div>
                }
              />

              <Route
                path="signup"
                exact
                element={
                  <div className={styles.main}>
                    <h1>SignUp page</h1>
                  </div>
                }
              />

              <Route
                path="login"
                exact
                element={
                  <div className={styles.main}>
                    <h1>Login page</h1>
                  </div>
                }
              />

              <Route
                path="*"
                element={
                  <Error />

                }
              />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
