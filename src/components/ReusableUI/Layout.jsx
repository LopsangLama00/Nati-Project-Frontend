import { Outlet } from "react-router-dom";
import NavBar from "./Navbar"
import Footer from "./Footer"

function Layout() {
  return (
    <>
      <NavBar />

      <main className="page-content">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default Layout;