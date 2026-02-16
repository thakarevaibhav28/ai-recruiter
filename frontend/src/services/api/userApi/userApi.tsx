import { api } from "../api";

class UserApi {
  private _url = {
    // Login API
    LOGIN: "/customer/login",
    LOGIN_OTP_VERIFY: "/customer/verify-otp",
    RESEND_LOGIN_OTP: "/customer/resend-otp",
    LOCATION: "/location/nearest-by-pincode",

    // Profile API
    PROFILE_INFO: "/customer/profile-info",
    UPDATE_PROFILE_INFO: "/customer/update-profile",
    UPLOAD_IMAGE: "/images/upload",

    // Categories API
    CATEGORY_LIST: "/categories/list",
    CATEGORY_ITEMS: "/categories/items",
    FILTER_WITH_SIDE_BAR: "/categories/filters",
    FILTER_ITEMS: "/items/filters-items",

    // Coupons
    COUPONS: "/coupons",

    // Items & Cart API
    ITEMS: "/items",
    SIDEBAR_FILTER: "/items/filters",
    ADD_TO_CART: "/cart/add",
    GET_CART: "/cart/list",
    UPDATE_CART: "/cart/update",
    REMOVE_CART: "/cart/remove",

    // For logged-in user cart
    MERGE_CART: "/cart/merge",
    // GET_LOGGED_IN_CART: "/cart/list",

    MERGE_WISHLIST: "/wishlist/merge",

    // Wishlist API
    ADD_WISHLIST: "/wishlist/add",
    // GET_WISHLIST: "/wishlist",

    //CUSTOM ADDRESS
    LIST_OF_ADDRESS: "/address/list",
    CUSTOM_ADDRESS: "/address/add",
    GET_WISHLIST: "/wishlist/list",
    REMOVE_FROM_WISHLIST: "/wishlist/remove",
    UPDATE_ADDRESS: "/address/update",

    //Top rated items
    TOP_RATED_ITEMS: "/items/top-rated",

    //Similar Products
    SIMILAR_PRODUCTS: "/items/similar",

    // Might Like Products
    MIGHT_LIKE_PRODUCTS: "/items/recommended",

    //Order Details
    ORDER_DETAILS: "/orders/details",

    //Search Items
    SEARCH_ITEMS: "/search",
    RECENT_SEARCHES: "/search/recent",
    CLEAR_SEARCHES: "/search/clear",

    FILTERED_ITEMS: "/categories/filtered",

    GET_NOTIFICATION: "/user/notifications",
    UNREAD_NOTIFICATION: "/user/notifications/unread-count",
    READ_SINGLE_NOTIFICATION: "/user/notifications/read",
    READ_ALL_NOTIFICATIONS: "/user/notifications/read-all",
    DELETE_SINGLE_NOTIFICATION: "/user/notifications",
    DELETE_ALL_NOTIFICATIONS: "/user/notifications",

    HOME_DATA: "/web/home",

    GET_STORE_PICKUP_SLOTS: "/stores/pickup-slots",
    CHANGE_PICKUP_SLOT: "/orders/change-pickup-slot",

  };

  // Location
  postLocation = (data: any) => api._post(this._url.LOCATION, data);

  // Login
  postLogIn = (data: any) => api._post(this._url.LOGIN, data);
  postLogInVerifyOTP = (data: any) =>
    api._post(this._url.LOGIN_OTP_VERIFY, data);
  postResendLogInOTP = (data: any) =>
    api._post(this._url.RESEND_LOGIN_OTP, data);

  // Profile
  getProfile_Info = (id: any) => api._get(`${this._url.PROFILE_INFO}/${id}`);
  putUpdate_Info = (data: any) => api._put(this._url.UPDATE_PROFILE_INFO, data);
  postUploadImage = (data: any) =>
    api._postFormData(this._url.UPLOAD_IMAGE, data);

  // Categories
  getCategoryFilter = (category: any) =>
    api._get(`${this._url.CATEGORY_LIST}/${category}`);

  getCategoryList( page: number = 1,
  limit: number = 10,
  skip: number = (page - 1) * limit,
  search?: string,
  status?: boolean){
  let url = `${this._url.CATEGORY_LIST}?page=${page}&limit=${limit}&skip=${skip}`;
  if (search && search.trim()) url += `&search=${encodeURIComponent(search)}`;
  if (status !== undefined) url += `&status=${encodeURIComponent(status)}`;
  return api._get(url);
}
  // getCategoryItems = (category: any, skip: any) =>
  //   api._get(`${this._url.CATEGORY_ITEMS}/${category}?skip=${skip}`);

  getCategoryItems = (category: string, skip: number) =>
  api._get(`${this._url.CATEGORY_ITEMS}/${encodeURIComponent(category)}?skip=${skip}`);

  // getFilterWithSidebar = (category: any) =>
  //   api._get(`${this._url.FILTER_WITH_SIDE_BAR}?category=${category}`);

  getFilterWithSidebar = (category: string) =>
  api._get(`${this._url.FILTER_WITH_SIDE_BAR}?category=${encodeURIComponent(category)}`);
  
  getFilter = () =>
    api._get(`${this._url.FILTER_ITEMS}?isFeatured=true&page=1&limit=10`);

  // Coupons
  getCoupons = () => api._get(this._url.COUPONS);

  // Items
  getItemsById = (_id: any) => api._get(`${this._url.ITEMS}/${_id}`);
  getItems = () => {
    return api._get(this._url.ITEMS);
  };

  // Cart
  postAddToCart = (data: any) => api._post(this._url.ADD_TO_CART, data);
  getCartItems = (cartId: string) =>
    api._get(`${this._url.GET_CART}?cartId=${cartId}`); //For guest-user
  getLoggedInCart = (customerId: string) =>
    api._get(`${this._url.GET_CART}?customerId=${customerId}`); // For logged-in user

  putCartItems = (data: any) => api._put(this._url.UPDATE_CART, data);
  deleteCartItems = (data: any) => {
    return api._post(this._url.REMOVE_CART, data);
  };
  postMergeCart = (data: any) => api._post(this._url.MERGE_CART, data);

  postMergeWishList = (data: any) => api._post(this._url.MERGE_WISHLIST, data);
  // Wishlist
  postWishList = (data: any) => api._post(this._url.ADD_WISHLIST, data);
  // getWishList = () => api._get(this._url.GET_WISHLIST);
  getWishList = (customerId: string) =>
    api._get(`${this._url.GET_WISHLIST}?customerId=${customerId}`);
  getWishlistWithId = (wishlistId: string) =>
    api._get(`${this._url.GET_WISHLIST}?wishlistId=${wishlistId}`); // For guest users wishlist
  removeFromWishlist = (data: any) => {
    // For guest users
    if (data.wishlistId && !data.customerId) {
      return api._delete(
        `${this._url.REMOVE_FROM_WISHLIST}?wishlistId=${data.wishlistId}&itemId=${data.itemId}`,
        {}
      );
    }

    // For logged-in users
    return api._delete(
      `${this._url.REMOVE_FROM_WISHLIST}?customerId=${data.customerId}&itemId=${data.itemId}`,
      {}
    );
    // return api._delete(this._url.REMOVE_FROM_WISHLIST, { itemId: data.itemId });
  };

  // Custom Address
  getAddress = () => api._get(this._url.LIST_OF_ADDRESS);
  postAddress = (data: any) => api._post(this._url.CUSTOM_ADDRESS, data);

  // Top rated items
  getTopRatedItems = () => api._get(this._url.TOP_RATED_ITEMS);

  // Similar Products
  getSimilarProducts = (id: any) =>
    api._get(`${this._url.SIMILAR_PRODUCTS}/${id}`);

  // Might Like Products
  getMightLikeProducts = (id: any) =>
    api._get(`${this._url.MIGHT_LIKE_PRODUCTS}/${id}`);

  // Order Details
  getOrderDetails = (id: any) => api._get(`${this._url.ORDER_DETAILS}/${id}`);

  updateAddress = (id: any, data: any) =>
    api._put(`${this._url.UPDATE_ADDRESS}/${id}`, data);

  getSearchItems = (query: string) =>
    api._get(`${this._url.SEARCH_ITEMS}?q=${query}`);

  getRecentSearches = () => {
    return api._get(this._url.RECENT_SEARCHES);
  }

  clearSearches = () => {
    return api._delete(this._url.CLEAR_SEARCHES);
  }



getFilteredItems = async (category: string, body: any) => {
  try {
    const response = await api._post(
      // `${this._url.FILTERED_ITEMS}?category=${category}`,
      `${this._url.FILTERED_ITEMS}?category=${encodeURIComponent(category)}`,

      body 
    );
    return response;
  } catch (error) {
    console.error("Error in getFilteredItems service:", error);
    throw error;
  }
};

// Notifications 
getNotifications = () => api._get(this._url.GET_NOTIFICATION);

markNotificationAsRead = (notificationId: string) => {
  return api._patch(`${this._url.READ_SINGLE_NOTIFICATION}/${notificationId}`);
}

markAllNotificationsAsRead = () => {
  return api._patch(this._url.READ_ALL_NOTIFICATIONS);
}

deleteNotification = (notificationId: string) => {
  return api._delete(`${this._url.DELETE_SINGLE_NOTIFICATION}/${notificationId}`)
}

deleteAllNotifications = () => {
  return api._delete(this._url.DELETE_ALL_NOTIFICATIONS);
}

unreadNotificationCount = () => {
  return api._get(this._url.UNREAD_NOTIFICATION);
}

getHomeData = () => {
  return api._get(this._url.HOME_DATA);
}

getStorePickupSlots = (storeId: string, date?: string) => {
  let url = `${this._url.GET_STORE_PICKUP_SLOTS}/${storeId}`;
  if (date) {
    url += `?date=${encodeURIComponent(date)}`;
  }
  return api._get(url);
}

// ✅ Added: Change pickup slot for an order
changePickupSlot = (orderId: string, data: { pickup_date: string; pickup_slot: string }) => 
  api._patch(`${this._url.CHANGE_PICKUP_SLOT}/${orderId}`, data);
}

export const userApi = new UserApi();
