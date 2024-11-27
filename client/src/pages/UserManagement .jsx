import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/api";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "registration_time",
    direction: "desc",
  });

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;

    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (user) =>
          user.status === statusFilter ||
          (statusFilter === "active" && !user.status)
      );
    }

    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    setFilteredUsers(result);
  }, [users, searchTerm, statusFilter, sortConfig]);

  const fetchUsers = async () => {
    try {
      const data = await authService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError("Failed to fetch users");
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
      }
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id));
    }
  };

  const handleUpdateStatus = async (status) => {
    if (selectedUsers.length === 0) {
      setError("Please select users");
      return;
    }

    try {
      await authService.updateUserStatus(selectedUsers, status);
      fetchUsers();
      setSelectedUsers([]);
      setSuccessMessage(
        `Successfully ${status} ${selectedUsers.length} user(s)`
      );
    } catch (err) {
      setError("Failed to update user status");
    }
  };
  const handleDeleteUsers = async () => {
    if (selectedUsers.length === 0) {
      setError("Please select users");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedUsers.length} user(s)?`
      )
    ) {
      return;
    }

    try {
      await authService.deleteUsers(selectedUsers);
      fetchUsers();
      setSelectedUsers([]);
      setSuccessMessage(`Successfully deleted ${selectedUsers.length} user(s)`);
    } catch (err) {
      setError("Failed to delete users");
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    let successTimeout, errorTimeout;

    if (successMessage) {
      successTimeout = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    }

    if (error) {
      errorTimeout = setTimeout(() => {
        setError("");
      }, 3000);
    }

    return () => {
      if (successTimeout) clearTimeout(successTimeout);
      if (errorTimeout) clearTimeout(errorTimeout);
    };
  }, [successMessage, error]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 relative">
      {successMessage && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{successMessage}</span>
          </div>
        </div>
      )}
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-4 sm:mb-0">
            User Management
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Logout
          </button>
        </div>
        {error && (
          <div className="fixed top-4 right-4 z-50">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded px-3 py-2 w-full sm:w-64 mb-2 sm:mb-0"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded px-3 py-2 w-full sm:w-auto"
              >
                <option value="all">All Users</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => handleUpdateStatus("blocked")}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded w-full sm:w-auto"
              >
                Block Selected
              </button>
              <button
                onClick={() => handleUpdateStatus("active")}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full sm:w-auto"
              >
                Activate Selected
              </button>
              <button
                onClick={handleDeleteUsers}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded w-full sm:w-auto"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedUsers.length === filteredUsers.length &&
                      filteredUsers.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th
                  className="p-4 text-left cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  Name
                  {sortConfig.key === "name" && (
                    <span>{sortConfig.direction === "asc" ? " ▲" : " ▼"}</span>
                  )}
                </th>
                <th
                  className="p-4 text-left cursor-pointer"
                  onClick={() => handleSort("email")}
                >
                  Email
                  {sortConfig.key === "email" && (
                    <span>{sortConfig.direction === "asc" ? " ▲" : " ▼"}</span>
                  )}
                </th>
                <th
                  className="p-4 text-center cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  Status
                  {sortConfig.key === "status" && (
                    <span>{sortConfig.direction === "asc" ? " ▲" : " ▼"}</span>
                  )}
                </th>
                <th
                  className="p-4 text-center cursor-pointer"
                  onClick={() => handleSort("last_login")}
                >
                  Last Login
                  {sortConfig.key === "last_login" && (
                    <span>{sortConfig.direction === "asc" ? " ▲" : " ▼"}</span>
                  )}
                </th>
                <th
                  className="p-4 text-center cursor-pointer"
                  onClick={() => handleSort("registration_time")}
                >
                  Registration Time
                  {sortConfig.key === "registration_time" && (
                    <span>{sortConfig.direction === "asc" ? " ▲" : " ▼"}</span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-4 text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b hover:bg-gray-50 transition duration-150"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleUserSelect(user.id)}
                      />
                    </td>
                    <td className="p-4">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`
                          px-3 py-1 rounded-full text-xs 
                          ${
                            user.status === "blocked"
                              ? "bg-red-200 text-red-800"
                              : "bg-green-200 text-green-800"
                          }
                        `}
                      >
                        {user.status || "Active"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleString()
                        : "Never"}
                    </td>
                    <td className="p-4 text-center">
                      {new Date(user.registration_time).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-gray-600">
          Total Users: {filteredUsers.length} / {users.length}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
