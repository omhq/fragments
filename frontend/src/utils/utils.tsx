import toast from "react-hot-toast";

export const toaster = (message: string, type: string) => {
  const toastConfig = {
    duration: 3000,
    position: 'bottom-right',
    style: {},
    className: 'text-sm rounded-md text-gray-600 bg-white dark:text-white dark:bg-gray-600'
  };

  if (type === "error") {
    toast.error(message, toastConfig as any);
  }

  if (type === "success") {
    toast.success(message, toastConfig as any);
  }
}

export const truncateStr = (str: string, length: number) => {
  if (str.length > length) {
    return str.slice(0, length) + '...'
  }

  return str
}