// import { data } from "react-router-dom";
import { api } from "../api";

class AdminApi {
  private _url = {
    LOGIN :"/admin/login",
    bulk_add_candidate:"/admin/interview/candidates/bulk"
  };

  login =(data:any)=>{
    return api._post(this._url.LOGIN,data)
  }
  bulk_add_candidate=(data:any)=>{
    return api._postFormData(this._url.bulk_add_candidate,data)
  }
}

export const adminApi = new AdminApi();
