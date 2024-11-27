import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/users", label: "User Management", requiredAuth: true },
    { path: "/login", label: "Login", requiredAuth: false },
    { path: "/register", label: "Register", requiredAuth: false },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div className="text-white text-2xl font-bold">
              User Management App
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>

            <div className="hidden md:flex space-x-4">
              {navItems.map((item) => {
                if (item.requiredAuth && !isAuthenticated) return null;
                if (!item.requiredAuth && isAuthenticated) return null;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      text-white px-3 py-2 rounded 
                      ${
                        location.pathname === item.path
                          ? "bg-gray-700"
                          : "hover:bg-gray-700"
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {isAuthenticated && (
                <button
                  onClick={() => logout()}
                  className="text-white hover:bg-red-700 px-3 py-2 rounded"
                >
                  Logout
                </button>
              )}
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden mt-4">
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => {
                  if (item.requiredAuth && !isAuthenticated) return null;
                  if (!item.requiredAuth && isAuthenticated) return null;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        text-white px-3 py-2 rounded 
                        ${
                          location.pathname === item.path
                            ? "bg-gray-700"
                            : "hover:bg-gray-700"
                        }
                      `}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  );
                })}

                {isAuthenticated && (
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-white hover:bg-red-700 px-3 py-2 rounded text-left"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-grow">{children}</main>

      <footer className="bg-gray-200 p-4 text-center">
        <p className="text-xs sm:text-sm text-gray-600">
          © {new Date().getFullYear()} User Management App. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Layout;
