import React from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";


function Layout({ children }) {

  return (
    <div className="bg-purple-100 m-0 p-0">
      <Navbar />
       <div>{children}</div>
      <Footer />
    </div>
  );
}

export default Layout;
