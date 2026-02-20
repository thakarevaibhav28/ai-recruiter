import { api } from "../api";

class UserApi {
  private _url = {
    // Login API
    CANDIDATE_LOGIN: "/candidate/login", // add id of candidate in URL
    ADHAR_VEFIFICATION: "/candidate",
    SELFIE_VERIFICATION: "/candidate",
    INTERVIEW_INSTRUCTION: "/candidate/assessment/template",
    GET_ALL_MCQS: "/candidate/interview/",
    SINGLE_SUBMIT: "/candidate/interview",
    FINAL_SUBMIT: "/candidate/interview",
  };

  // CANDIATE LOGIN
  CandidateLogin(id: string, data: any) {
    return api._post(`${this._url.CANDIDATE_LOGIN}/${id}`, data);
  }

  // Adhar verification
  AdharVerification(id: string, data: any) {
    return api._putFormData(
      `${this._url.ADHAR_VEFIFICATION}/${id}/upload-aadharCard`,
      data,
    );
  }

  // selfie verification
  SelfieVerification(id: string, data: any) {
    return api._putFormData(
      `${this._url.SELFIE_VERIFICATION}/${id}/upload-photo`,
      data,
    );
  }

  // /assessment/template/:id
  InterviewInstruction(id: string) {
    return api._get(`${this._url.INTERVIEW_INSTRUCTION}/${id}`);
  }

  // get all mcqs for candidate
  GetAllMcqs(id: string) {
    return api._get(`${this._url.GET_ALL_MCQS}${id}`);
  }

  // single submit mcq answer
  SingleSubmit(id: string, data: any) {
    return api._post(`${this._url.SINGLE_SUBMIT}/${id}/answer`, data);
  }

  // final submit mcq answer
  FinalSubmit(id: string, data: any) {
    return api._post(`${this._url.FINAL_SUBMIT}/${id}/submit`, data);
  }
}
export const userApi = new UserApi();
