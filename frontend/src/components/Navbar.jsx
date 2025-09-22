import React from "react";
import { Link } from "react-router";

const Navbar = () => {
  return (
    <div className="navbar shadow-sm bg-white/10 sticky z-10 backdrop-blur top 3 mt -3 rounded-md">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl">
          🧳 tripBuddy
        </Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
          </li>
          <li>
            <Link to="/Tours" className="hover:text-primary">
              Tours
            </Link>
          </li>
          <li>
            <Link to="/CreateTourPage" className="btn btn-primary btn-sm">
              Create Tour
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
