"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminLayout from "../../../components/AdminLayout";
import {
  FaSearch,
  FaUserEdit,
  FaTrash,
  FaUserPlus,
  FaUserCog,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaTimes,
  FaCheck,
  FaEye,
  FaDownload,
} from "react-icons/fa";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { FAMILIES } from "../../../lib/auth";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [filterRole, setFilterRole] = useState("all");
  const [filterFamily, setFilterFamily] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [newUserMode, setNewUserMode] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    displayName: "",
    family: "",
    role: "member",
    email: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersSnapshot = await getDocs(
        query(collection(db, "members"), orderBy("createdAt", "desc"))
      );

      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = [...users].sort((a, b) => {
    // For timestamps, convert to Date objects
    if (sortConfig.key === "createdAt") {
      const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt);
      const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt);
      return sortConfig.direction === "asc" ? aTime - bTime : bTime - aTime;
    }

    // For string comparisons
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Apply filters and search
  const filteredUsers = sortedUsers.filter((user) => {
    // Filter by role
    if (filterRole !== "all" && user.role !== filterRole) {
      return false;
    }

    // Filter by family
    if (filterFamily !== "all" && user.family !== filterFamily) {
      return false;
    }

    // Search by username, displayName, or email
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      const username = user.username?.toLowerCase() || "";
      const displayName = user.displayName?.toLowerCase() || "";
      const email = user.email?.toLowerCase() || "";

      return (
        username.includes(lowerSearch) ||
        displayName.includes(lowerSearch) ||
        email.includes(lowerSearch)
      );
    }

    return true;
  });

  const handleUserUpdate = async () => {
    if (!editedUser) return;

    try {
      await updateDoc(doc(db, "members", editedUser.id), {
        displayName: editedUser.displayName,
        family: editedUser.family,
        role: editedUser.role,
      });

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === editedUser.id ? { ...user, ...editedUser } : user
        )
      );

      // Exit edit mode
      setEditMode(false);
      setSelectedUser({ ...selectedUser, ...editedUser });
      setEditedUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user: " + error.message);
    }
  };

  const handleUserDelete = async (userId) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteDoc(doc(db, "members", userId));

      // Update local state
      setUsers(users.filter((user) => user.id !== userId));
      setSelectedUser(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user: " + error.message);
    }
  };

  const handleCreateUser = async () => {
    // In a real application, you would implement user creation logic here
    // This would typically involve creating a Firebase auth account and a Firestore document
    alert(
      "User creation would be implemented here with Firebase Auth integration"
    );
    setNewUserMode(false);
  };

  // Format date from Firestore timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const exportUsers = () => {
    // Prepare CSV content
    const headers = [
      "Username",
      "Display Name",
      "Family",
      "Role",
      "Created At",
    ];
    const rows = filteredUsers.map((user) => [
      user.username || "",
      user.displayName || "",
      user.family || "",
      user.role || "",
      formatDate(user.createdAt),
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "anglican-members.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">User Management</h1>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setNewUserMode(true)}
              className="btn-primary flex items-center text-sm"
            >
              <FaUserPlus className="mr-2" />
              New User
            </button>

            <button
              onClick={exportUsers}
              className="btn-outline flex items-center text-sm"
            >
              <FaDownload className="mr-2" />
              Export Users
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by username, name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md w-full"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-outline flex items-center justify-center md:w-auto"
          >
            <FaFilter className="mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gray-50 p-4 rounded-lg mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Family
                </label>
                <select
                  value={filterFamily}
                  onChange={(e) => setFilterFamily(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2"
                >
                  <option value="all">All Families</option>
                  {FAMILIES.map((family) => (
                    <option key={family} value={family}>
                      {family}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  setFilterRole("all");
                  setFilterFamily("all");
                }}
                className="btn-outline mr-2"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="btn-primary"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("username")}
                    >
                      <div className="flex items-center">
                        Username
                        {sortConfig.key === "username" &&
                          (sortConfig.direction === "asc" ? (
                            <FaSortAmountUp className="ml-1" size={12} />
                          ) : (
                            <FaSortAmountDown className="ml-1" size={12} />
                          ))}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("displayName")}
                    >
                      <div className="flex items-center">
                        Display Name
                        {sortConfig.key === "displayName" &&
                          (sortConfig.direction === "asc" ? (
                            <FaSortAmountUp className="ml-1" size={12} />
                          ) : (
                            <FaSortAmountDown className="ml-1" size={12} />
                          ))}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("family")}
                    >
                      <div className="flex items-center">
                        Family
                        {sortConfig.key === "family" &&
                          (sortConfig.direction === "asc" ? (
                            <FaSortAmountUp className="ml-1" size={12} />
                          ) : (
                            <FaSortAmountDown className="ml-1" size={12} />
                          ))}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("role")}
                    >
                      <div className="flex items-center">
                        Role
                        {sortConfig.key === "role" &&
                          (sortConfig.direction === "asc" ? (
                            <FaSortAmountUp className="ml-1" size={12} />
                          ) : (
                            <FaSortAmountDown className="ml-1" size={12} />
                          ))}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("createdAt")}
                    >
                      <div className="flex items-center">
                        Created
                        {sortConfig.key === "createdAt" &&
                          (sortConfig.direction === "asc" ? (
                            <FaSortAmountUp className="ml-1" size={12} />
                          ) : (
                            <FaSortAmountDown className="ml-1" size={12} />
                          ))}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.username || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.displayName || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.family || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {user.role || "member"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setEditMode(false);
                            }}
                            className="text-primary-600 hover:text-primary-800 mr-3"
                          >
                            <FaEye className="inline" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setEditedUser({ ...user });
                              setEditMode(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 mr-3"
                          >
                            <FaUserEdit className="inline" />
                          </button>
                          <button
                            onClick={() => handleUserDelete(user.id)}
                            className="text-red-600 hover:text-red-800"
                            disabled={user.role === "admin"}
                            title={
                              user.role === "admin"
                                ? "Cannot delete admin users"
                                : "Delete user"
                            }
                          >
                            <FaTrash
                              className={`inline ${
                                user.role === "admin" ? "opacity-30" : ""
                              }`}
                            />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-gray-500 text-sm">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </>
        )}
      </div>

      {/* User Details/Edit Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto"
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">
                {editMode ? "Edit User" : "User Details"}
              </h2>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setEditMode(false);
                  setEditedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6">
              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={editedUser.username}
                      disabled
                      className="w-full p-2 border rounded-md bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Username cannot be changed
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={editedUser.displayName || ""}
                      onChange={(e) =>
                        setEditedUser({
                          ...editedUser,
                          displayName: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Family
                    </label>
                    <select
                      value={editedUser.family || ""}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, family: e.target.value })
                      }
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">-- Select Family --</option>
                      {FAMILIES.map((family) => (
                        <option key={family} value={family}>
                          {family}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      value={editedUser.role || "member"}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, role: e.target.value })
                      }
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setEditedUser(null);
                      }}
                      className="btn-outline"
                    >
                      Cancel
                    </button>

                    <button onClick={handleUserUpdate} className="btn-primary">
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Username
                      </h3>
                      <p className="font-medium">
                        {selectedUser.username || "N/A"}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Display Name
                      </h3>
                      <p>{selectedUser.displayName || "N/A"}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Family
                      </h3>
                      <p>{selectedUser.family || "N/A"}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Role
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedUser.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {selectedUser.role || "member"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Created
                      </h3>
                      <p>{formatDate(selectedUser.createdAt)}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        User ID
                      </h3>
                      <p className="font-mono text-xs">{selectedUser.id}</p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setSelectedUser(null);
                      }}
                      className="btn-outline"
                    >
                      Close
                    </button>

                    <button
                      onClick={() => {
                        setEditedUser({ ...selectedUser });
                        setEditMode(true);
                      }}
                      className="btn-primary"
                    >
                      Edit User
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* New User Modal */}
      {newUserMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg max-w-lg w-full"
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Create New User</h2>
              <button
                onClick={() => setNewUserMode(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) =>
                      setNewUser({ ...newUser, username: e.target.value })
                    }
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={newUser.displayName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, displayName: e.target.value })
                    }
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter display name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Family
                  </label>
                  <select
                    value={newUser.family}
                    onChange={(e) =>
                      setNewUser({ ...newUser, family: e.target.value })
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">-- Select Family --</option>
                    {FAMILIES.map((family) => (
                      <option key={family} value={family}>
                        {family}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <p className="text-sm text-gray-500 mt-2">
                  Note: A password will be generated and sent to the user's
                  email.
                </p>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setNewUserMode(false)}
                    className="btn-outline"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleCreateUser}
                    className="btn-primary"
                    disabled={
                      !newUser.username || !newUser.email || !newUser.family
                    }
                  >
                    Create User
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
}
