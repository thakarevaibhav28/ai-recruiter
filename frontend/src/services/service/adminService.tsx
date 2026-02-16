
import { adminApi } from '../api/adminApi/adminApi';

class AdminService {
  login(data: any) {
    return adminApi.login(data);
  }

  forgotPassword(data: any) {
    return adminApi.forgotPassword(data);
  }

  verifyOtp(data: any) {
    return adminApi.verifyOtp(data);
  }

  resetPassword(data: any) {
    return adminApi.resetPassword(data);
  }

  getDashboard() {
    return adminApi.getDashboard();
  }

  getProducts() {
    return adminApi.getProducts();
  }

  createCoupon(data: any) {
    return adminApi.createCoupon(data);
  }

  getCouponList(discountType?: string) {
    return adminApi.getCouponList(discountType);
  }

  updateCoupon(id: string, data: any) {
    return adminApi.updateCoupon(id, data);
  }

// uploadImage(data: FormData, type: string, categoryId: string) {
//   return adminApi.uploadImage(data, type, categoryId);
// }
    // Users
    getUsers() {
      return adminApi.getUsers();
    }

    createUser(data:any){
      return adminApi.createUser(data);
    }

    updateUser(id: string, data: any){
      return adminApi.updateUser(id, data)
    }
     getDeliveryBoys() {
      return adminApi.getDeliveryBoys()
     }
    getmenuList() {
      return adminApi.getmenuList();
    }
    createMenu(data:any) {
      return adminApi.createMenu(data)
    }

    changePassword(id: string, data: any) {
      return adminApi.changePassword(id, data)
    }

    // Items Api
    uploadItem(data: any) {
    return adminApi.uploadItem(data);
  }

  updateItem(id: string, data: any) {
    return adminApi.updateItem(id, data);
  }

 getAllItems(page: number, limit: number, skip: number, search?: string, category?: string, status?: string, priceRange?: string) {
  return adminApi.getAllItems(page, limit, skip, search, category, status, priceRange);
}


  // Category API
  uploadCategory(data: any) {
    return adminApi.uploadCategory(data)
  }
  updateCategory(id:string, data: any) {
    return adminApi.updateCategory(id, data);
  }
 getAllCategory(
  page: number = 1,
  limit: number = 10,
  skip: number = (page - 1) * limit,
  search?: string,
  status?: boolean
) {
  return adminApi.getAllCategory(page, limit, skip, search, status);
}

getOrder(
  page: number = 1,
  limit: number = 10,
  date?: string,
  status?: string,
  payment?: string,
  searchText?: string
) {
  return adminApi.getOrder(page, limit, date, status, payment, searchText);
}
  
getStoreList() {
  return adminApi.getStoreList();
}

assignStore( data: any) {
  return adminApi.assignStore(data);
}

managerOrderList(
  page: number = 1,
  limit: number = 10,
  date?: string,
  status?: string,
  payment?: string,
  searchText?: string
) {
  return adminApi.managerOrderList(page, limit, date, status, payment, searchText);
}


  updateOrderStatus( data: any) {
  return adminApi.updateOrderStatus( data);
}

storeOrderStatus( data: any) {
  return adminApi.storeOrderStatus( data );
}

assignDeliveryBoy(orderId: string, data: any) {
  return adminApi.assignDeliveryBoy(orderId, data);
}

getAllDeliveryofBoy(id:any){
  return adminApi.getAllDeliveryofBoy(id);
}
postStatusUpdate(orderId: string, data: { status: string }) {
  return adminApi.postStatusUpdate(orderId, data);
}
postDeliveryBoyProfile(id: string, data: any) {
  return adminApi.postDeliveryBoyProfile(id, data);
}

// get brands
getBrands(
  page: number = 1,
  limit: number = 10,
  skip: number = (page - 1) * limit,
  search?: string,
  status?: boolean
) {
  return adminApi.getBrands(page, limit, skip, search,status);
}

uploadBrands(data:any) {
  return adminApi.uploadBrands(data)
}

postRefund(data: any) {
    return adminApi.postRefund(data);
  }


  getCustomerList() {
    return adminApi.getCustomerList();
  }

  getCustomerDetail(id: string) {
    return adminApi.getCustomerDetail(id);
  }

  // Notification
  getNotifications() {
    return adminApi.getNotifications()
  }

 markNotificationAsRead = (notificationId: string) => {
     return adminApi.markNotificationAsRead(notificationId);
   }; 

   markAllNotificationsAsRead = () => {
    return adminApi.markAllNotificationsAsRead();
   }

   deleteAllNotification = () => {
    return adminApi.deleteAllNotification();
   }
}


export const adminService = new AdminService();