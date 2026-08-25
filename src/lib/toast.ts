import Swal from "sweetalert2";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3500,
  timerProgressBar: true,
  didOpen: (t) => {
    t.onmouseenter = Swal.stopTimer;
    t.onmouseleave = Swal.resumeTimer;
  },
});

export const toast = {
  success: (title: string, text?: string) =>
    Toast.fire({ icon: "success", title, text }),
  error: (title: string, text?: string) =>
    Toast.fire({ icon: "error", title, text }),
  info: (title: string, text?: string) =>
    Toast.fire({ icon: "info", title, text }),
  warning: (title: string, text?: string) =>
    Toast.fire({ icon: "warning", title, text }),
};

export async function confirmDialog(
  title: string,
  text: string,
  confirmText = "Haan, karo",
  cancelText = "Ruko"
): Promise<boolean> {
  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#f26b31",
    cancelButtonColor: "#6b7280",
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    customClass: {
      popup: "rounded-2xl font-inter text-sm",
      title: "text-gray-800 font-bold text-base",
      htmlContainer: "text-gray-500 text-sm",
      confirmButton: "rounded-lg px-5 py-2 text-sm font-semibold",
      cancelButton: "rounded-lg px-5 py-2 text-sm font-semibold",
    },
  });
  return result.isConfirmed;
}
