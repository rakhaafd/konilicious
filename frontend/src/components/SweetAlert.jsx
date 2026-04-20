import Swal from "sweetalert2";

export const showAlert = ({
  title = "Info",
  text = "",
  icon = "info",
  confirmButtonText = "OK",
} = {}) =>
  Swal.fire({
    title,
    text,
    icon,
    confirmButtonText,
    confirmButtonColor: "#e00013",
  });

export const showConfirm = async ({
  title = "Konfirmasi",
  text = "Apakah kamu yakin?",
  icon = "warning",
  confirmButtonText = "Ya",
  cancelButtonText = "Batal",
} = {}) => {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: "#e00013",
    cancelButtonColor: "#6b7280",
  });

  return result.isConfirmed;
};