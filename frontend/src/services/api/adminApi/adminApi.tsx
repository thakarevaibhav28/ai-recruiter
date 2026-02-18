// import { data } from "react-router-dom";
import { api } from "../api";

class AdminApi {
  private _url = {
    LOGIN: "/admin/login",
    ADD_CANDIDATE: "admin/create/candidate",
    BULK_ADD_CANDIDATE: "/admin/candidates/bulk",
    CREATE_ASESMENT_TEMPLATE: "/admin/assessment/template",
    GET_ASSESMENTS: "/admin/assessment/mcq/list",
    GET_CANDIDATES: "/admin/candidates",
    SEND_INVITES: "/admin/assessment/:assessmentId/invite",
    GENERATE_AND_INVITE: "/admin/assessment/send-invites",
    GENERATE_AI_INTERVIEW: "/admin/interview/template",
    SEND_AI_INVITES: "/admin/interview/send-invites",
    GET_DRAFT: "/admin/interviews/list",
    DELETE_CANDIDATE:"/admin/candidate",
    GET_ME: "/admin/me"
  };

 
  login = (data: any) => {
    return api._post(this._url.LOGIN, data);
  };

  // bulk add candidate
  bulk_add_candidate(data: any) {
    return api._postFormData(this._url.BULK_ADD_CANDIDATE, data);
  }

  //create assessment template
  createAssessmentTemplate(data: any) {
    return api._post(this._url.CREATE_ASESMENT_TEMPLATE, data);
  }

  //get all assesments
  getAssesments() {
    return api._get(this._url.GET_ASSESMENTS);
  }

  // create candiate
  addCandidate(data:any){
    return api._post(this._url.ADD_CANDIDATE,data)
  }


  //get all candidates
  getAllCandidate() {
    return api._get(this._url.GET_CANDIDATES);
  }

  // update Candidate 
  updateCandidate(id:string, data:any){
    return api._patch(`${this._url.DELETE_CANDIDATE}/${id}`, data )
  }

  //send invites
  sendInvites(assessmentId: any, data: any) {
    const url = this._url.SEND_INVITES.replace(":assessmentId", assessmentId);
    return api._post(url, data);
  }

  //Ggenerate and invite candidates
  generateAndInvite(data: any) {
    return api._post(this._url.GENERATE_AND_INVITE, data);
  }

  getDraft() {
    return api._get(this._url.GET_DRAFT);
  }
   generateAIInterview(data: any) {
    return api._postFormData(this._url.GENERATE_AI_INTERVIEW, data);
  }

  sendInvitations(data: any) {
    return api._post(this._url.SEND_AI_INVITES, data);
  }
 getMe(){
    return api._get(this._url.GET_ME);
  };
}

export const adminApi = new AdminApi();
