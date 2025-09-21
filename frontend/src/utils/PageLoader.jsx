import React from "react";
import "./PageLoader.css";

export default function PageLoader({ loading }) {
  return (
    <div className={`preloader ${loading ? "" : "hidden"}`}>
      <div className="loader"></div>
    </div>
  );
}
