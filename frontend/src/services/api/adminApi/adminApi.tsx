// import { data } from "react-router-dom";
import { api } from "../api";

class AdminApi {
  private _url = {
    bulk_add_candidate:"/interview/candidates/bulk"
  };

  bulk_add_candidate=(data:any)=>{
    return api._postFormData(this._url.bulk_add_candidate,data)
  }
}

export const adminApi = new AdminApi();
