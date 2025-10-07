import React from "react";
import { Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import TourDetailPage from "./pages/TourDetailPage";
import CreateTourPage from "./pages/CreateTourPage";
import Tours from "./pages/Tours";
import Me from "./pages/Me";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />}></Route>
        <Route path="/CreateTourPage" element={<CreateTourPage />}></Route>
        <Route path="/Tours" element={<Tours />}></Route>
        <Route path="/Tours/:slug" element={<TourDetailPage />}></Route>
        <Route path="/Me" element={<Me />}></Route>
      </Routes>
    </div>
  );
};

export default App;
