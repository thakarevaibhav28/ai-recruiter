// import { data } from "react-router-dom";
import { api } from "../api";

class AdminApi {
  private _url = {

    LOGIN: "/admin/login",
    ADD_CANDIDATE: "/api/candidate",
    bulk_add_candidate:"/admin/interview/candidates/bulk"
  };

  // admin Login

  login(data: any) {
    return api._post(this._url.LOGIN, data);
  }

  // add Candidate

  addCandidate(data:any){
    return api._post(this._url.ADD_CANDIDATE, data)
  }






 
}

export const adminApi = new AdminApi();
