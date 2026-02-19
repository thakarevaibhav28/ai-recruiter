// import { data } from "react-router-dom";
import { api } from "../api";

class AdminApi {
  private _url = {
    LOGIN: "/admin/login",
    ADD_CANDIDATE: "admin/create/candidate",
    BULK_ADD_CANDIDATE: "/admin/candidates/bulk",
    CREATE_ASESMENT_TEMPLATE: "/admin/assessment/template",
    UPDATE_ASESMENT_TEMPLATE: "/admin/assessment/template",
    GET_ASSESMENTS: "/admin/assessment/mcq/list",
    GET_CANDIDATES: "/admin/candidates",
    SEND_INVITES: "/admin/assessment/:assessmentId/invite",
    GENERATE_AND_INVITE: "/admin/assessment/send-invites",
    CREATE_AI_TEMPLATE: "/admin/interview/template",
    UPDATE_AI_TEMPLATE: "/admin/interview/template",
    SEND_AI_INVITES: "/admin/interview/send-invites",
    GET_AI: "/admin/interviews/list",
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
    return api._postFormData(this._url.CREATE_ASESMENT_TEMPLATE, data);
  }
  updateAssessmentTemplate(id: string, data: any) {
    return api._putFormData(`${this._url.UPDATE_ASESMENT_TEMPLATE}/${id}/update`, data);
  }


  getAssesments(id?: string) {
  if (id) {
      return api._get(`${this._url.GET_ASSESMENTS}/?id=${id}`);
  }
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
  updateAITemplate(id: string, data: any) {
    return api._put(`${this._url.UPDATE_AI_TEMPLATE}/${id}/update`, data);
  }


  getDraft(id?:string) {
    if(id){
      return api._get(`${this._url.GET_AI}/?id=${id}`);
    }
    return api._get(this._url.GET_AI);
  }



   generateAIInterview(data: any) {
    return api._postFormData(this._url.CREATE_AI_TEMPLATE, data);
  }

  sendInvitations(data: any) {
    return api._post(this._url.SEND_AI_INVITES, data);
  }
 getMe(){
    return api._get(this._url.GET_ME);
  };
}

export const adminApi = new AdminApi();
