import React from "react";
import { Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import CreateTourPage from "./pages/CreateTourPage";
import Tours from "./pages/Tours";
import { Toaster, toast } from "react-hot-toast";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />}></Route>
        <Route path="/CreateTourPage" element={<CreateTourPage />}></Route>
        <Route path="/Tours" element={<Tours />}></Route>
      </Routes>
    </div>
  );
};

export default App;
