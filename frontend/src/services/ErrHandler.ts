import type { AxiosError } from "axios";

export const handleErrResult = (err: AxiosError) => {
  const status = err.response?.status;

  if (status === 401 || status === 403) {
    const userData = localStorage.getItem("user");

    let role = "";

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        role = parsedUser.role;
      } catch (error) {
        console.error("Invalid user data in localStorage");
      }
    }

    if (role === "admin") {
      window.location.replace("/admin/login");
    } else {
      window.location.replace("/user/login"); // user login route
    }
  }
};