
import { adminApi } from '../api/adminApi/adminApi';

class AdminService {
  lobulk_add_candidategin(data: any) {
    return adminApi.bulk_add_candidate(data);
  }

  
}

export const adminService = new AdminService();