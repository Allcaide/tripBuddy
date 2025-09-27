import React from "react";
import { useTours } from "../hooks/ToursHooks";
import ToursGrid from "../components/ToursGrid"; // ← IMPORTA O TOURSGRID
import Navbar from "../components/Navbar";

function Tours() {
  const { tours, loading, error } = useTours();

  return (
    <div>
      <Navbar />
      <ToursGrid tours={tours} loading={loading} error={error} />
    </div>
  );
}

export default Tours;
