import { Link, useNavigate } from "react-router-dom";

function Navbar() {

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const handleLogout = () => {

    localStorage.removeItem("token");

    navigate("/login");
  };

  return (

    <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">

      <h1 className="text-2xl font-bold">
        CampusPulse AI
      </h1>

      <div className="flex gap-4 items-center">

        {!token ? (
          <>
            <Link to="/login">
              Login
            </Link>

            <Link to="/register">
              Register
            </Link>
          </>
        ) : (
          <button
            onClick={handleLogout}
            className="bg-red-500 px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        )}

      </div>

    </nav>
  );
}

export default Navbar;