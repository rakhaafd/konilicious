import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Input from "../../../components/Input";
import Button from "../../../components/Button"
import { showAlert } from "../../../components/SweetAlert";
import api from "../../../utils/api";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/auth/register", { username, email, password: pass });
      await showAlert({
        title: "Pendaftaran Berhasil",
        text: "Silakan masuk menggunakan akun yang baru dibuat.",
        icon: "success",
      });
      navigate("/login");
    } catch (error) {
      console.error(error);
      await showAlert({
        title: "Pendaftaran Gagal",
        text: error?.response?.data?.message || "Gagal terhubung ke server.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl">
        <div className="text-center mb-8">
          <h1 className="brand text-4xl text-secondary mb-5">Konilicious.</h1>
          <h2 className="text-3xl font-bold text-gray-800">Register</h2>
          <p className="text-gray-500 mt-2">Jadi bagian dari kami!</p>
        </div>

        <form onSubmit={handleRegister}>
          <Input
            className="mb-4"
            label="Username"
            placeholder="Masukkan username Anda"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <Input
            className="mb-4"
            label="Email"
            placeholder="Masukkan email Anda"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            className="mb-6"
            label="Password"
            type={showPass ? "text" : "password"}
            placeholder="Buat password yang kuat"
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
            {loading ? "Memproses..." : "Daftar"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Sudah punya akun?{" "}
          <span
            className="text-secondary font-bold cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            Masuk di sini
          </span>
        </p>
      </div>
    </div>
  );
}
