// import { data } from "react-router-dom";
import { api } from "../api";

class AdminApi {
  private _url = {


    LOGIN: "/admin/login",
    ADD_CANDIDATE: "/admin/candidate",
    bulk_add_candidate:"/admin/interview/candidates/bulk",
    CREATE_ASESMENT_TEMPLATE:"/admin/assessment/template",  
    GET_ASSESMENTS:"/admin/assessment/mcq/list",
    GET_CANDIDATES:"/admin/candidates",
    SEND_INVITES:"/admin/assessment/:assessmentId/invite",
    GENERATE_AND_INVITE:"/admin//assessment/send-invites",
    GET_ALL_CANDIDATE: "/admin/candidates",

  };

  login =(data:any)=>{
    return api._post(this._url.LOGIN,data)
  }
  bulk_add_candidate=(data:any)=>{
    return api._postFormData(this._url.bulk_add_candidate,data)
  }

  // bulk add candidate
  bulk_add_candidate(data:any){
    return api._postFormData(this._url.bulk_add_candidate, data)
  }
 
  //create assessment template
  createAssessmentTemplate(data:any){
    return api._post(this._url.CREATE_ASESMENT_TEMPLATE, data)
  }

  //get all assesments
  getAssesments(){
    return api._get(this._url.GET_ASSESMENTS)
  }


  //get all candidates
  getAllCandidate(){
    return api._get(this._url.GET_CANDIDATES)
  }

//send invites
  sendInvites(assessmentId:any, data:any){
    const url = this._url.SEND_INVITES.replace(":assessmentId", assessmentId);
    return api._post(url, data)
  }

  //Ggenerate and invite candidates
  generateAndInvite(data:any){
    return api._post(this._url.GENERATE_AND_INVITE, data)
  }

 

}

export const adminApi = new AdminApi();
