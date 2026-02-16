import { userApi } from "../api/userApi/userApi";

class UserService {
  postLogIn = (data: any) => userApi.postLogIn(data);
  postLogInVerifyOTP = (data: any) => userApi.postLogInVerifyOTP(data);
  postResendLogInOTP = (data: any) => userApi.postResendLogInOTP(data);

  // Location
  postLocation = (data: any) => userApi.postLocation(data);

  // Profile
  getProfile_Info = (id: any) => userApi.getProfile_Info(id);
  putUpdate_Info = (data: any) => userApi.putUpdate_Info(data);
  postUploadImage = (data: any) => userApi.postUploadImage(data);

  // Categories
  getCategoryList  ( page: number = 1,
  limit: number = 10,
  skip: number = (page - 1) * limit,
  search?: string,
  status?: boolean) {
    return userApi.getCategoryList(page, limit, skip, search, status);
  }


  getCategoryItems = (category: any, skip: any) =>
    userApi.getCategoryItems(category, skip);
  getCategoryFilter = (category: any) => userApi.getCategoryFilter(category);
  getFilterWithSidebar = (category: any) =>
    userApi.getFilterWithSidebar(category);
  getFilter = () => userApi.getFilter();

  // Items
  getItemsById = (_id: any) => userApi.getItemsById(_id);
  getItems() {
    return userApi.getItems();
  }

  // Coupons
  getCoupons = () => userApi.getCoupons();

  // Cart
  postAddToCart = (data: any) => userApi.postAddToCart(data);
  getCartItems = (cartId: string) => userApi.getCartItems(cartId);
  putCartItems = (data: any) => userApi.putCartItems(data);
  deleteCartItems = (data: any) => userApi.deleteCartItems(data);
  getLoggedInCart = (data: any) => userApi.getLoggedInCart(data);

  // For logged-in user cart
  postMergeCart = (data: any) => userApi.postMergeCart(data);
  postMergeWishList = (data: any) => userApi.postMergeWishList(data);

  // Wishlist
  postWishList = (data: any) => userApi.postWishList(data);
  getWishList = (data: any) => userApi.getWishList(data);

  // Custom Address
  getAddress = () => userApi.getAddress();
  postAddress = (data: any) => userApi.postAddress(data);
  getWishlistWithId = (wishlistId: string) =>
    userApi.getWishlistWithId(wishlistId); // For guest users
  removeFromWishlist = (data: any) => userApi.removeFromWishlist(data);

  // Top rated items
  getTopRatedItems = () => userApi.getTopRatedItems();

  //Similar Product
  getSimilarProducts = (_id: any) => userApi.getSimilarProducts(_id);

  // Might Like Products
  getMightLikeProducts = (_id: any) => userApi.getMightLikeProducts(_id);


  // Order Details
  getOrderDetails = (orderId: any) => userApi.getOrderDetails(orderId);

  updateAddress = (id:any,data:any) => userApi.updateAddress(id,data)

  getSearchItems = (query: string) => userApi.getSearchItems(query);

  getRecentSearches = () => {
    return userApi.getRecentSearches();
  }
  clearSearches = () => {
    return userApi.clearSearches();
  }

  getFilteredItems =  (category: string, body?: any) => {
   return userApi.getFilteredItems(category, body);
  };

  // Notifications
  getNotifications = () => userApi.getNotifications();
  
  markNotificationAsRead = (notificationId: string) => {
    return userApi.markNotificationAsRead(notificationId);
  };
  
  markAllNotificationAsRead = () => {
    return userApi.markAllNotificationsAsRead();
  };
  
  deleteNotification = (notificationId: string) => {
    return userApi.deleteNotification(notificationId);
  }

  deleteAllNotifications = () => {
    return userApi.deleteAllNotifications();
  }

  unreadNotificationCount = () => {
    return userApi.unreadNotificationCount();
  }

  getHomeData = () => {
    return userApi.getHomeData();
  }

  getStorePickupSlots = (storeId: string, date?: string) => {
    return userApi.getStorePickupSlots(storeId, date);
  }

  // ✅ Added: Change pickup slot for an order
  changePickupSlot = (orderId: string, data: { pickup_date: string; pickup_slot: string }) => {
    return userApi.changePickupSlot(orderId, data);
  }
};


export const userService = new UserService();
