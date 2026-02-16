
import { adminApi } from '../api/adminApi/adminApi';

class AdminService {
  login(data: any) {
    return adminApi.login(data);
  }

}


export const adminService = new AdminService();