import { Outlet } from "react-router-dom";
import NavBar from "./Navbar"

function AuthLayout() {
  return (
    <>
      <NavBar />

      <main className="page-content">
        <Outlet />
      </main>
    </>
  );
}

export default AuthLayout;