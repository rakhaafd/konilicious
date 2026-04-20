import { useState } from "react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { showAlert } from "../../components/SweetAlert";
import api from "../../utils/api";

export default function AuthPage({ mode, setPage, setIsLoggedIn, setUser }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const isMasuk = mode === "login" || mode === "masuk";

  return (
    <div className="max-w-sm mx-auto mt-20 px-8 py-10 border border-gray-100 rounded-3xl shadow-lg">
      <h2 className="text-center font-bold text-2xl mb-7">
        {isMasuk ? "Masuk" : "Daftar"}
      </h2>

      {!isMasuk && (
        <Input
          className="mb-4"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      )}

      <Input
        className="mb-4"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        className="mb-6"
        placeholder="Password"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
      />

      <Button
        variant="secondary"
        fullWidth
        size="md"
        onClick={async () => {
          try {
            const endpoint = isMasuk
              ? "/auth/login"
              : "/auth/register";

            const body = isMasuk
              ? { email, password: pass }
              : { username, email, password: pass };

            const { data } = await api.post(endpoint, body);

            if (isMasuk) {
              if (data.token) {
                localStorage.setItem("token", data.token);
              }
              setUser(data.user || data.data || data);
              setIsLoggedIn(true);
              setPage("beranda");
            } else {
              await showAlert({
                title: "Pendaftaran Berhasil",
                text: "Silakan login dengan akun yang sudah dibuat.",
                icon: "success",
              });
              setPage("login");
            }
          } catch (error) {
            console.error(error);
            await showAlert({
              title: "Proses Gagal",
              text: error?.response?.data?.message || "Error connecting to server.",
              icon: "error",
            });
          }
        }}
      >
        {isMasuk ? "Masuk" : "Daftar"}
      </Button>

      <p className="text-center text-sm text-gray-400 mt-4">
        {isMasuk ? "Belum punya akun? " : "Sudah punya akun? "}
        <span
          className="text-secondary font-bold cursor-pointer hover:underline"
          onClick={() => setPage(isMasuk ? "register" : "login")}
        >
          {isMasuk ? "Daftar" : "Masuk"}
        </span>
      </p>
    </div>
  );
}
