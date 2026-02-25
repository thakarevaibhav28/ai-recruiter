import { adminApi } from "../api/adminApi/adminApi";

class AdminService {
  login(data: any) {
    return adminApi.login(data);
  }
  bulk_add_candidate(data: any) {
    return adminApi.bulk_add_candidate(data);
  }

  // add candidate
  addCandidate(data: any) {
    return adminApi.addCandidate(data);
  }

  //create assessment template
  createAssessmentTemplate(data: any) {
    return adminApi.createAssessmentTemplate(data);
  }
  updateAssessmentTemplate(id: string, data: any) {
    return adminApi.updateAssessmentTemplate(id, data);
  }
  updateAITemplate(id: string, data: any) {
    return adminApi.updateAITemplate(id, data);
  }

  //get all assesments
  getAssesments(id?: string) {
    return adminApi.getAssesments(id);
  }
  //get all candidates
  getAllCandidate(page: any, limit: any, status: any) {
    return adminApi.getAllCandidate(page, limit, status);
  }

  getCandidateProfile(id: string) {
    return adminApi.getCandidateProfile(id);
  }
  // update candidate status
  updateCandidate(id: string, data: any) {
    return adminApi.updateCandidate(id, data);
  }

  //send invites
  sendInvites(assessmentId: any, data: any) {
    return adminApi.sendInvites(assessmentId, data);
  }

  //generate and invite candidates
  generateAndInvite(data: any) {
    return adminApi.generateAndInvite(data);
  }
  //create AI interview
  generateAIInterview(data: any) {
    return adminApi.generateAIInterview(data);
  }
  sendInvitations(data: any) {
    return adminApi.sendInvitations(data);
  }
  getDraft(id?: string) {
    return adminApi.getDraft(id);
  }
  getMe() {
    return adminApi.getMe();
  }
  analyzeJD(data: any) {
    return adminApi.analyzeJD(data);
  }
  analyzeResume(data: any) {
    return adminApi.analyzeResume(data);
  }

  generateMCQ(data: any, id?: string) {
    return adminApi.generateMCQ(data, id);
  }

  // get total schedule
  getTotalSchedule() {
    return adminApi.getTotalSchedule();
  }
  reScheduleInterview(type: string, interviewId: string, data: any) {
    return adminApi.reScheduleInterview(type, interviewId, data);
  }
  cancleInterview(type: string, interviewId: string, data: any) {
    return adminApi.cancleInterview(type, interviewId, data);
  }

  getTopPerformance(examType:string){
    return adminApi.getTopPerformance(examType)
  }
  getScore(examType:string){
    return adminApi.getScore(examType)
  }

  // get top AI performance
  getTopAIPerformance() {
    return adminApi.getTopAIPerformance();    
  }
}

export const adminService = new AdminService();
