// import { data } from "react-router-dom";
import { api } from "../api";

class AdminApi {
  private _url = {
    LOGIN: "/admin/login",
    
  };

  login(data: any) {
    return api._post(this._url.LOGIN, data);
  }

 
}

export const adminApi = new AdminApi();
