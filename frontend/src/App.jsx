import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import WelcomePage from "./pages/WelcomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import RecommendationsPage from "./pages/RecommendationsPage.jsx";

function App() {
  const token = localStorage.getItem("token");
  const location = useLocation();

  const backgroundImage = token
    ? "url('/movies-image.jpg')"
    : "none";

  return (
    /*  BLACK BASE LAYER */
    <div className="relative min-h-screen overflow-hidden bg-black">
      
      {/*  Animated Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={backgroundImage}
          className="absolute inset-0 bg-black bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
        />
      </AnimatePresence>

      {/*  Page Content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            
            {/*  Welcome */}
            <Route
              path="/"
              element={
                token ? (
                  <Navigate to="/recommendations" />
                ) : (
                  <PageWrapper>
                    <WelcomePage />
                  </PageWrapper>
                )
              }
            />

            {/*  Login */}
            <Route
              path="/login"
              element={
                token ? (
                  <Navigate to="/recommendations" />
                ) : (
                  <PageWrapper>
                    <LoginPage />
                  </PageWrapper>
                )
              }
            />

            {/*  Signup */}
            <Route
              path="/signup"
              element={
                token ? (
                  <Navigate to="/recommendations" />
                ) : (
                  <PageWrapper>
                    <SignupPage />
                  </PageWrapper>
                )
              }
            />

            {/*  Recommendations */}
            <Route
              path="/recommendations"
              element={
                token ? (
                  <PageWrapper>
                    <RecommendationsPage />
                  </PageWrapper>
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            {/*  Catch-all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------------- PAGE ANIMATION WRAPPER ---------------- */
function PageWrapper({ children }) {
  return (
    <motion.div
      className="min-h-screen"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

export default App;
