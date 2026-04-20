import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Input from "../../../components/Input";
import Button from "../../../components/Button"
import { showAlert } from "../../../components/SweetAlert";
import api from "../../../utils/api";

export default function LoginPage({ setIsLoggedIn, setUser }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await api.post("/auth/login-user", { email, password: pass });
      const loggedInUser = data.user || data.data || data;

      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      setUser(loggedInUser);
      setIsLoggedIn(true);
      navigate("/");
    } catch (error) {
      console.error(error);
      await showAlert({
        title: "Login Gagal",
        text: error?.response?.data?.message || "Email atau password salah.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl">
        <div className="text-center mb-8">
          <h1 className="brand text-4xl text-secondary mb-5">Konilicious.</h1>
          <h2 className="text-3xl font-bold text-gray-800">Masuk</h2>
          <p className="text-gray-500 mt-2">Selamat Datang Kembali</p>
        </div>

        <form onSubmit={handleLogin}>
          <Input
            className="mb-4"
            label="Email"
            placeholder="Masukkan email Anda"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
          />

          <Input
            className="mb-6"
            label="Password"
            type={showPass ? "text" : "password"}
            placeholder="Masukkan password Anda"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            required
            rightIcon={showPass ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            onRightIconClick={() => setShowPass(!showPass)}
          />

          <Button
            variant="secondary"
            fullWidth
            size="lg"
            type="submit"
            disabled={loading}
          >
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Belum punya akun?{" "}
          <span
            className="text-secondary font-bold cursor-pointer hover:underline"
            onClick={() => navigate("/register")}
          >
            Daftar di sini
          </span>
        </p>
      </div>
    </div>
  );
}
