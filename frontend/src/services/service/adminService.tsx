
import { adminApi } from '../api/adminApi/adminApi';

class AdminService {
  login(data: any) {
    return adminApi.login(data);
  }
  bulk_add_candidate(data: any) {
    return adminApi.bulk_add_candidate(data);
  }

  // add candidate 
  addCandidate(data:any){
    return adminApi.addCandidate(data)
  }

  //create assessment template
  createAssessmentTemplate(data:any){
    return adminApi.createAssessmentTemplate(data)
  }

  //ge t all assesments
  getAssesments(){
    return adminApi.getAssesments()
  }

  //get all candidates
  getAllCandidate(){
    return adminApi.getAllCandidate()
  }

  //send invites
  sendInvites(assessmentId:any, data:any){
    return adminApi.sendInvites(assessmentId, data)
  }

  //generate and invite candidates
  generateAndInvite(data:any){
    return adminApi.generateAndInvite(data)
  }

}

export const adminService = new AdminService();