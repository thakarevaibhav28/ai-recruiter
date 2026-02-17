
import type { AxiosResponse } from "axios";



export const handleErrResult = (err: AxiosResponse) => {
  if (err.status === 401) {
        window.location.replace("/admin/login");
  } else if (err.status === 403) {
    window.location.replace("/admin/login");
}
};
