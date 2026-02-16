// import { data } from "react-router-dom";
import { api } from "../api";

class AdminApi {
  private _url = {
    LOGIN: "/admin/login",
    FORGOT_PASSWORD: "/admin/forgot-password",
    OTP: "/admin/verify-otp",
    RESET_PASSWORD: "/admin/reset-password",
    DASHBOARD: "/admin/dashboard/",
    PRODUCTS: "/admin/products/",
    // Coupon Api
    CREATE_COUPON: "/coupons/create",
    GET_COUPON: "/coupons",
    UPDATE_COUPON: "/coupons/update",
    // UPLOAD_IMAGE: "/images/upload",
    // Users Api
    LIST_USERS: "/users/list",
    CREATE_USER: "/users/create",
    UPDATE_USER: "/users/update", // append /:id when calling
    DELIVERY_BOY: "/users/delivery-boys",

    // Menu
    GETMENU_LIST: "/menu/list",
    CREATE_MENU: "/menu/create",

    // Change Password
    CHANGE_PASSWORD: "/admin/change-password",

    // Item APIs
    UPLOAD_ITEM: "/items/upload-excel",
    UPDATE_ITEM: "/items/update",
    GET_ALL_ITEMS: "/items",

    // Category APIs
    UPLOAD_CATEGORY: "/categories/upload-excel",
    UPDATE_CATEGORY: "/categories/update",
    GET_ALL_CATEGORY: "/categories/list",

    // Order Api
    GET_ORDER: "/orders",
    UPDATE_ORDER_STATUS: "/orders/status",
    STORE_ORDER_STATUS: "/orders/update-store-status",
    ASSIGN_DELIVERY_BOY: "/orders/assign",
    GET_STORE_LIST: "/stores",
    ASSIGN_STORE: "/orders/assign-store", 
    GET_MANAGER_ORDER_LIST: "/orders/manager-orders",

    //Delivery Boy APIs
    GET_ALL_DELIVERY: "/orders/delivery-boy",
    POST_STATUS_UPDATE: "/orders/status",
    POST_DELIVERY_BOY_PROFILE: "/users/update",

    GET_BRANDS: "/brands",
    UPLOAD_BRANDS: "/brands/upload",

    POST_REFUND: "/orders/refund",

    //Customer
    CUSTOMER_LIST: "/customers",
    CUSTOMER_DETAIL: "/customers/",

    //Notification
    GET_NOTIFICATION: "/admin/notifications",
    READ_SINGLE_NOTIFICATION: "/admin/notifications/read",
    READ_ALL_NOTIFICATIONS: "/admin/notifications/read-all",
    DELETE_ALL_NOTIFICATION: "/admin"
  };

  login(data: any) {
    return api._post(this._url.LOGIN, data);
  }

  forgotPassword(data: any) {
    return api._post(this._url.FORGOT_PASSWORD, data);
  }

  verifyOtp(data: any) {
    return api._post(this._url.OTP, data);
  }

  resetPassword(data: any) {
    return api._post(this._url.RESET_PASSWORD, data);
  }

  getDashboard() {
    return api._get(this._url.DASHBOARD);
  }

  getProducts() {
    return api._get(this._url.PRODUCTS);
  }

  createCoupon(data: any) {
    return api._post(this._url.CREATE_COUPON, data);
  }

  getCouponList(data: any) {
    return api._get(this._url.GET_COUPON, data);
  }

  updateCoupon(id: string, data: any) {
    return api._put(`${this._url.UPDATE_COUPON}/${id}`, data);
  }
  //upload image
//   uploadImage(data: FormData, type: string, categoryId: string) {
//   return api._postFormData(
//     `${this._url.UPLOAD_IMAGE}?type=${type}&categoryId=${categoryId}`,
//     data
//   );
// }

  // Users
  getUsers() {
    return api._get(this._url.LIST_USERS);
  }
  createUser(data: any) {
    return api._post(this._url.CREATE_USER, data);
  }
  updateUser(id: string, data: any) {
    return api._put(`${this._url.UPDATE_USER}/${id}`, data);
  }
  getDeliveryBoys() {
    return api._get(this._url.DELIVERY_BOY);
  }
  getmenuList() {
    return api._get(this._url.GETMENU_LIST);
  }

  createMenu(data: any) {
    return api._post(this._url.CREATE_MENU, data);
  }

  changePassword(id: string, data: any) {
    return api._post(`${this._url.CHANGE_PASSWORD}/${id}`, data);
  }

  // items api
  uploadItem(data: any) {
    return api._postFormData(this._url.UPLOAD_ITEM, data);
  }

  updateItem(id: string, data: any) {
    return api._put(`${this._url.UPDATE_ITEM}/${id}`, data);
  }

  getAllItems(
    page: number,
    limit: number,
    skip: number,
    search?: string,
    category?: string,
    status?: string,
    priceRange?: string
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      skip: skip.toString(),
    });

    if (search) params.append("search", search);
    if (category) params.append("category", category);
    if (status) params.append("status", status);
    if (priceRange) params.append("priceRange", priceRange);

    return api._get(`${this._url.GET_ALL_ITEMS}?${params.toString()}`);
  }

  // category api
  uploadCategory(data: any) {
    return api._postFormData(this._url.UPLOAD_CATEGORY, data);
  }

  updateCategory(id: string, data: any) {
    return api._put(`${this._url.UPDATE_CATEGORY}/${id}`, data);
  }

  // adminervice.ts
  getAllCategory(
    page: number = 1,
    limit: number = 10,
    skip: number = (page - 1) * limit,
    search?: string,
    status?: boolean
  ) {
    let url = `${this._url.GET_ALL_CATEGORY}?page=${page}&limit=${limit}&skip=${skip}`;
    if (search && search.trim()) url += `&search=${encodeURIComponent(search)}`;
    if (status !== undefined) url += `&status=${encodeURIComponent(status)}`;
    return api._get(url);
  }

  // Order api
  getOrder(
    page: number = 1,
    limit: number = 10,
    date?: string,
    status?: string,
    payment?: string,
    searchText?: string
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (date) params.append("date", date);
    if (status) params.append("status", status);
    if (payment) params.append("payment", payment);
    if (searchText) params.append("searchText", searchText);

    return api._get(`${this._url.GET_ORDER}?${params.toString()}`);
  }

  getStoreList() {
    return api._get(`${this._url.GET_STORE_LIST}`)
  }
async assignStore(data: any) {
  return api._post(`${this._url.ASSIGN_STORE}`, data);
}

managerOrderList(
  page: number = 1,
  limit: number = 10,
  date?: string,
  status?: string,
  payment?: string,
  searchText?: string
) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (date) params.append("date", date);
  if (status) params.append("status", status);
  if (payment) params.append("payment", payment);
  if (searchText) params.append("searchText", searchText);

  return api._get(`${this._url.GET_MANAGER_ORDER_LIST}?${params.toString()}`);
}

  
  updateOrderStatus(data: any) {
    return api._patch(`${this._url.UPDATE_ORDER_STATUS}`, data);
  }

  storeOrderStatus(data: any) {
    return api._post(`${this._url.STORE_ORDER_STATUS}`, data);
  }

  assignDeliveryBoy(orderId: string, data: any) {
    return api._patch(`${this._url.ASSIGN_DELIVERY_BOY}/${orderId}`, data);
  }

  getAllDeliveryofBoy(id: any) {
    return api._get(`${this._url.GET_ALL_DELIVERY}/${id}`, id);
  }

  postStatusUpdate(orderId: string, data: any) {
    return api._patch(`${this._url.POST_STATUS_UPDATE}/${orderId}`, data);
  }
  postDeliveryBoyProfile(id: string, data: any) {
    return api._put(`${this._url.POST_DELIVERY_BOY_PROFILE}/${id}`, data);
  }

  // get brands
  getBrands(
    page: number = 1,
    limit: number = 10,
    skip: number = (page - 1) * limit,
    search?: string,
    status?: boolean
  ) {
    let url = `${this._url.GET_BRANDS}?page=${page}&limit=${limit}&skip=${skip}`;
    if (search && search.trim()) url += `&search=${encodeURIComponent(search)}`;
    if (status !== undefined) url += `&status=${encodeURIComponent(status)}`;
    return api._get(url);
  }

  uploadBrands(data: any) {
    return api._postFormData(`${this._url.UPLOAD_BRANDS}`, data);
  }

  postRefund(data: any) {
    return api._post(this._url.POST_REFUND, data);
  }

  // Customer APIs
  getCustomerList() {
    return api._get(this._url.CUSTOMER_LIST);
  }
  

  getCustomerDetail(id: string) {
    return api._get(`${this._url.CUSTOMER_DETAIL}${id}`);
  }

  //Notification
  getNotifications = () => api._get(this._url.GET_NOTIFICATION);

  markNotificationAsRead = (notificationId: string) => {
  return api._put(`${this._url.READ_SINGLE_NOTIFICATION}/${notificationId}`);
}

markAllNotificationsAsRead = () => {
  return api._put(this._url.READ_ALL_NOTIFICATIONS)
}

deleteAllNotification = () => {
  return api._delete(`${this._url.DELETE_ALL_NOTIFICATION}`)
}
}

export const adminApi = new AdminApi();
