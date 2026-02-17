
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


}

export const adminService = new AdminService();