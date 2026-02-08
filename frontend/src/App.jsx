import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import HomePage from "./pages/HomePage";
import Tours from "./pages/Tours";
import TourDetailPage from "./pages/TourDetailPage";
import Me from "./pages/Me";
import { setAuthToken } from "../utils/authService";

const App = () => {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuthToken(token);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/Tours" element={<Tours />} />
        <Route path="/Tours/:slug" element={<TourDetailPage />} />
        <Route path="/Me" element={<Me />} />
      </Routes>
    </Router>
  );
};

export default App;
