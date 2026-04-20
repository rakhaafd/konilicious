import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import api from "../../../utils/api";

export default function AdminLoginPage({ setIsLoggedIn, setUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const { data } = await api.post("/auth/login", { email, password });

      const loggedInUser = data.user || data.data || null;
      if (!loggedInUser || loggedInUser.role !== "admin") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.setItem("isLoggedIn", "false");
        setIsLoggedIn(false);
        setUser(null);
        setError("invalid credentials");
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      setUser(loggedInUser);
      setIsLoggedIn(true);
      navigate("/admin");
    } catch (error) {
      setError(error?.response?.data?.message || "Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Admin Login</h1>
        <p className="text-gray-500 mb-6">Masuk menggunakan akun admin.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@email.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan password"
            required
          />

          {error && (
            <div className="text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <Button type="submit" variant="secondary" fullWidth disabled={loading}>
            {loading ? "Memproses..." : "Masuk Admin"}
          </Button>
        </form>
      </div>
    </div>
  );
}
