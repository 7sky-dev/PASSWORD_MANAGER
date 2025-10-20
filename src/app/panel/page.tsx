"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Terminal,
  LogOut,
  Shield,
  Key,
  PlusCircle,
  Search,
  Eye,
  EyeOff,
  Copy,
  Edit3,
  Trash2,
  Globe,
  Mail,
  CreditCard,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  Activity,
  X,
  Lock,
} from "lucide-react";

type PasswordItem = {
  id: string | number;
  title: string;
  username: string;
  password: string;
  url: string;
  category: string;
  strength: string;
  lastModified: string | Date;
  icon: React.ComponentType<{ className?: string }>;
};

export default function PanelPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState<{
    [key: string]: boolean;
  }>({});
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    username: "",
    password: "",
    url: "",
    category: "personal",
  });
  const [showPasswordInModal, setShowPasswordInModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [passwords, setPasswords] = useState<PasswordItem[]>([]);
  const [editingPassword, setEditingPassword] = useState<PasswordItem | null>(
    null
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "work":
        return Globe;
      case "personal":
        return Mail;
      case "finance":
        return CreditCard;
      case "device":
        return Smartphone;
      default:
        return Key;
    }
  };

  const calculatePasswordStrength = (password: string): string => {
    if (password.length < 6) return "weak";
    if (password.length < 12) return "medium";
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const strength = [hasUpper, hasLower, hasNumber, hasSpecial].filter(
      Boolean
    ).length;
    return strength >= 3 ? "strong" : "medium";
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "strong":
        return "text-green-400 bg-green-400/10 border-green-400/30";
      case "medium":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
      case "weak":
        return "text-red-400 bg-red-400/10 border-red-400/30";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/30";
    }
  };

  const fetchPasswords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/passwords", {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to fetch passwords");
      }

      const data = await res.json();
      const mapped: PasswordItem[] = (data.passwords || []).map(
        (p: {
          id: string | number;
          title: string;
          username: string;
          password: string;
          url: string;
          category: string;
          strength?: string;
          lastModified: string | Date;
        }) => ({
          id: p.id,
          title: p.title,
          username: p.username,
          password: p.password,
          url: p.url,
          category: p.category,
          strength: p.strength || calculatePasswordStrength(p.password || ""),
          lastModified: p.lastModified,
          icon: getCategoryIcon(p.category),
        })
      );
      setPasswords(mapped);
    } catch (err: unknown) {
      console.error("fetchPasswords error:", err);
      setError(
        (err instanceof Error ? err.message : null) ||
          "An error occurred while fetching passwords."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPasswords();
  }, [fetchPasswords]);

  const handleLogout = () => {
    const logout = async () => {
      try {
        const res = await fetch("/api/logout", {
          method: "POST",
        });

        if (!res.ok) {
          throw new Error("Failed to log out");
        }

        setPasswords([]);
        setEditingPassword(null);

        window.location.href = "/login";
      } catch (err) {
        console.error("Logout error:", err);
      }
    };

    logout();
  };

  const togglePasswordVisibility = (id: string | number) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleAddPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/passwords", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to add password");
      }

      await fetchPasswords();

      setFormData({
        title: "",
        username: "",
        password: "",
        url: "",
        category: "personal",
      });
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding password:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to add password. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPasswords = passwords.filter((password) => {
    const matchesSearch =
      password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      password.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || password.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: passwords.length,
    strong: passwords.filter((p) => p.strength === "strong").length,
    weak: passwords.filter((p) => p.strength === "weak").length,
    recent: passwords.filter(
      (p) =>
        new Date(p.lastModified) >
        new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
    ).length,
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white font-mono">
        <div className="text-center">
          <Terminal className="w-12 h-12 text-green-400 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-300">Loading passwords...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white font-mono p-4">
        <div className="max-w-xl text-center bg-gray-900/60 border border-red-600/30 p-6 rounded-lg">
          <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">Error</h2>
          <p className="text-sm text-gray-300 mb-4">{error}</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => fetchPasswords()}
              className="px-4 py-2 bg-green-500 rounded text-black font-semibold"
            >
              Retry
            </button>
            <button
              onClick={() => setError(null)}
              className="px-4 py-2 bg-gray-800 rounded border border-gray-700 text-gray-300"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="relative min-h-screen flex flex-col text-white font-mono">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-950 to-black"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 via-transparent to-gray-800/20"></div>
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(34 197 94) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      {/* Add Password Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border-2 border-green-400/30 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-400/20 border border-green-400/30 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-green-400">
                    Add New Password
                  </h2>
                  <p className="text-xs text-gray-400">
                    Securely store your credentials
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddPassword} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Gmail Account"
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 transition-all"
                />
              </div>

              {/* Username/Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username / Email
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="e.g., user@example.com"
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswordInModal ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Enter a strong password"
                    className="w-full px-4 py-2.5 pr-12 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordInModal(!showPasswordInModal)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700/50 rounded transition-colors"
                  >
                    {showPasswordInModal ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-xs text-gray-400">Strength:</span>
                    <span
                      className={`text-xs px-2 py-1 border rounded ${getStrengthColor(
                        calculatePasswordStrength(formData.password)
                      )}`}
                    >
                      {calculatePasswordStrength(formData.password)}
                    </span>
                  </div>
                )}
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                  placeholder="https://example.com"
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 transition-all"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 transition-all"
                >
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                  <option value="finance">Finance</option>
                  <option value="device">Device</option>
                </select>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-black font-semibold rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      <span>Add Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Password Modal */}
      {editingPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          {" "}
          <div className="bg-gray-900 border-2 border-blue-400/30 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {" "}
            {/* Modal Header */}{" "}
            <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
              {" "}
              <div className="flex items-center space-x-3">
                {" "}
                <div className="w-10 h-10 bg-blue-400/20 border border-blue-400/30 rounded-lg flex items-center justify-center">
                  {" "}
                  <Lock className="w-5 h-5 text-blue-400" />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <h2 className="text-xl font-bold text-blue-400">
                    Edit Password
                  </h2>{" "}
                  <p className="text-xs text-gray-400">
                    Update your stored credentials
                  </p>{" "}
                </div>{" "}
              </div>{" "}
              <button
                onClick={() => setEditingPassword(null)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
              >
                {" "}
                <X className="w-5 h-5 text-gray-400" />{" "}
              </button>{" "}
            </div>{" "}
            {/* Modal Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updatedPassword = {
                  id: editingPassword.id,
                  title: formData.get("title"),
                  username: formData.get("username"),
                  password: formData.get("password"),
                  url: formData.get("url"),
                  category: formData.get("category"),
                };

                try {
                  const res = await fetch(`/api/passwords`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedPassword),
                  });

                  if (!res.ok) throw new Error("Failed to update password");

                  const updated = await res.json();

                  setPasswords((prev) =>
                    prev.map((pwd) =>
                      pwd.id === editingPassword.id
                        ? { ...pwd, ...updated.password }
                        : pwd
                    )
                  );

                  setEditingPassword(null);
                } catch (err) {
                  console.error(err);
                }
              }}
              className="p-6 space-y-5"
            >
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingPassword.title}
                  required
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username / Email
                </label>
                <input
                  type="text"
                  name="username"
                  defaultValue={editingPassword.username}
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswordInModal ? "text" : "password"}
                    name="password"
                    required
                    defaultValue={editingPassword.password}
                    className="w-full px-4 py-2.5 pr-12 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordInModal(!showPasswordInModal)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700/50 rounded transition-colors"
                  >
                    {showPasswordInModal ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  name="url"
                  defaultValue={editingPassword.url}
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  name="category"
                  defaultValue={editingPassword.category}
                  required
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
                >
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                  <option value="finance">Finance</option>
                  <option value="device">Device</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingPassword(null)}
                  className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-black font-semibold rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="relative z-10 bg-gray-900/80 backdrop-blur-xl border-b border-green-400/20 px-4 sm:px-6 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center space-x-2 sm:space-x-3 select-none min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-green-400 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/20 flex-shrink-0">
            <Terminal className="w-4 h-4 sm:w-6 sm:h-6 text-green-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-xl font-bold text-green-400 tracking-widest truncate">
              PASSWORD_MANAGER
            </h1>
            <p className="text-xs text-gray-400 hidden sm:block">
              Password Management System
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700/50 select-none">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-300">Online</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg transition-all duration-200 cursor-pointer shadow-lg"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/60 border border-gray-700/50 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wider">
                  Total Passwords
                </p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-gray-900/60 border border-gray-700/50 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wider">
                  Strong Passwords
                </p>
                <p className="text-2xl font-bold text-green-400">
                  {stats.strong}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-gray-900/60 border border-gray-700/50 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wider">
                  Weak Passwords
                </p>
                <p className="text-2xl font-bold text-red-400">{stats.weak}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </div>
          <div className="bg-gray-900/60 border border-gray-700/50 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wider">
                  Recently Updated
                </p>
                <p className="text-2xl font-bold text-yellow-400">
                  {stats.recent}
                </p>
              </div>
              <Activity className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Security Tips */}
        <div className="bg-gray-900/40 border border-gray-700/30 backdrop-blur-sm rounded-lg p-6 mt-8">
          <div className="flex items-start space-x-3">
            <Shield className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-2">
                Security Recommendations
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
                <div className="space-y-2">
                  <p className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Use unique passwords for each account</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Enable two-factor authentication</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span>Update weak passwords regularly</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span>Review and audit your passwords monthly</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search passwords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 transition-all duration-200"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["all", "work", "personal", "finance", "device"].map(
                (category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-2 text-xs uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer ${
                      selectedCategory === category
                        ? "bg-green-400/20 text-green-400 border border-green-400/30"
                        : "bg-gray-800/30 text-gray-400 border border-gray-700/30 hover:bg-gray-700/50"
                    }`}
                  >
                    {category}
                  </button>
                )
              )}
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black font-semibold px-4 py-2 rounded-lg shadow-lg transition-all duration-200 flex items-center space-x-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Password</span>
          </button>
        </div>

        {/* Passwords Grid */}
        <div className="grid gap-4">
          {filteredPasswords.length === 0 ? (
            <div className="bg-gray-900/40 border border-gray-700/30 backdrop-blur-sm rounded-lg p-8 text-center">
              <Key className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No passwords found</p>
              <p className="text-gray-500 text-sm mt-2">
                Try adjusting your search or add a new password
              </p>
            </div>
          ) : (
            filteredPasswords.map((password) => {
              const IconComponent = password.icon;
              return (
                <div
                  key={password.id}
                  className="bg-gray-900/40 border border-gray-700/30 backdrop-blur-sm hover:bg-gray-900/60 transition-all duration-300 group rounded-lg shadow-lg hover:shadow-xl hover:shadow-green-500/5"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex items-center gap-3 sm:gap-4 sm:items-start">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-800/50 rounded-lg flex items-center justify-center border border-gray-700/50 flex-shrink-0">
                          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0 sm:hidden">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-base font-semibold text-white truncate">
                              {password.title}
                            </h3>
                            <span
                              className={`text-xs px-2 py-1 border rounded whitespace-nowrap ${getStrengthColor(
                                password.strength
                              )}`}
                            >
                              {password.strength}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="hidden sm:flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-white truncate">
                            {password.title}
                          </h3>
                          <span
                            className={`text-xs px-2 py-1 border rounded whitespace-nowrap ${getStrengthColor(
                              password.strength
                            )}`}
                          >
                            {password.strength}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <span className="text-sm text-gray-400 sm:w-20 font-medium">
                              Username:
                            </span>
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-sm text-gray-300 flex-1 truncate">
                                {password.username || "Not set"}
                              </span>
                              {password.username && (
                                <button
                                  onClick={() =>
                                    copyToClipboard(password.username)
                                  }
                                  className="p-2 hover:bg-green-500/20 hover:border-green-400/50 border border-transparent rounded-md sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 cursor-pointer"
                                  aria-label="Copy username"
                                  title="Copy username"
                                >
                                  <Copy className="w-4 h-4 text-gray-400 hover:text-green-400 transition-colors duration-200" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <span className="text-sm text-gray-400 sm:w-20 font-medium">
                              Password:
                            </span>
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-sm text-gray-300 flex-1 font-mono break-all sm:truncate">
                                {visiblePasswords[password.id]
                                  ? password.password
                                  : "•".repeat(password.password.length)}
                              </span>
                              <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300">
                                <button
                                  onClick={() =>
                                    togglePasswordVisibility(password.id)
                                  }
                                  className="cursor-pointer p-2 hover:bg-blue-500/20 hover:border-blue-400/50 border border-transparent rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                                  aria-label={
                                    visiblePasswords[password.id]
                                      ? "Hide password"
                                      : "Show password"
                                  }
                                  title={
                                    visiblePasswords[password.id]
                                      ? "Hide password"
                                      : "Show password"
                                  }
                                >
                                  {visiblePasswords[password.id] ? (
                                    <EyeOff className="w-4 h-4 text-gray-400 hover:text-blue-400 transition-colors duration-200" />
                                  ) : (
                                    <Eye className="w-4 h-4 text-gray-400 hover:text-blue-400 transition-colors duration-200" />
                                  )}
                                </button>
                                <button
                                  onClick={() =>
                                    copyToClipboard(password.password)
                                  }
                                  className="cursor-pointer p-2 hover:bg-green-500/20 hover:border-green-400/50 border border-transparent rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20"
                                  aria-label="Copy password"
                                  title="Copy password"
                                >
                                  <Copy className="w-4 h-4 text-gray-400 hover:text-green-400 transition-colors duration-200" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {password.url && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <span className="text-sm text-gray-400 sm:w-20 font-medium">
                                URL:
                              </span>
                              <a
                                href={password.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-green-400 hover:text-green-300 truncate flex-1 hover:underline focus:outline-none focus:ring-2 focus:ring-green-400/50 rounded transition-all duration-200"
                                title={password.url}
                              >
                                {password.url}
                              </a>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-gray-700/30">
                            <span className="text-xs text-gray-500 order-2 sm:order-1">
                              Last modified:{" "}
                              {new Date(
                                password.lastModified
                              ).toLocaleDateString()}
                            </span>
                            <div className="flex gap-1 order-1 sm:order-2 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300">
                              <button
                                className="cursor-pointer p-2 hover:bg-blue-500/20 hover:border-blue-400/50 border border-transparent rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                                aria-label="Edit password"
                                title="Edit password"
                                onClick={() => setEditingPassword(password)}
                              >
                                <Edit3 className="w-4 h-4 text-gray-400 hover:text-blue-400 transition-colors duration-200" />
                              </button>
                              <button
                                className="cursor-pointer p-2 hover:bg-red-500/20 hover:border-red-400/50 border border-transparent rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20"
                                aria-label="Delete password"
                                title="Delete password"
                              >
                                <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400 transition-colors duration-200" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900/60 backdrop-blur border-t border-gray-700/30 px-6 py-4">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <p>PASSWORD_MANAGER - Encrypted Password Manager</p>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>All data encrypted with AES-256</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
