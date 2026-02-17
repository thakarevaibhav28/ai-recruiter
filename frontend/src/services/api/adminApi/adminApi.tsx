// import { data } from "react-router-dom";
import { api } from "../api";

class AdminApi {
  private _url = {

    LOGIN: "/admin/login",
    ADD_CANDIDATE: "/api/candidate",
    bulk_add_candidate:"/admin/interview/candidates/bulk",
    CREATE_ASESMENT_TEMPLATE:"/admin/assessment/template",  
  };

  // admin Login

  login(data: any) {
    return api._post(this._url.LOGIN, data);
  }

  // add Candidate

  addCandidate(data:any){
    return api._post(this._url.ADD_CANDIDATE, data)
  }

  // bulk add candidate
  bulk_add_candidate(data:any){
    return api._postFormData(this._url.bulk_add_candidate, data)
  }
 
  //create assessment template
  createAssessmentTemplate(data:any){
    return api._post(this._url.CREATE_ASESMENT_TEMPLATE, data)
  }





 
}

export const adminApi = new AdminApi();
