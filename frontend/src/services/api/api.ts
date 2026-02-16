import axios from "axios";
import type {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";



import { handleErrResult } from '../ErrHandler';
import { EventEmitter } from '../../utils/EventEmitter';
import { Base_Url } from "../../utils/constants";


interface IApi {
  _get<T = any>(url: string, config?: InternalAxiosRequestConfig): Promise<T>;
  _post<T = any>(
    url: string,
    data?: any,
    config?: InternalAxiosRequestConfig
  ): Promise<T>;
  _postFormData<T = any>(
    url: string,
    formData: FormData,
    config?: InternalAxiosRequestConfig
  ): Promise<T>;
  _putFormData<T = any>(
    url: string,
    formData: FormData,
    config?: InternalAxiosRequestConfig
  ): Promise<T>;

  _put<T = any>(url: string, data?: any): Promise<T>;
  _patch<T = any>(url: string, data?: any): Promise<T>;
  _delete<T = any>(url: string, data?: any): Promise<T>;
}
let apiCallCount = 0;
class Api implements IApi {
  // _hostName: string = "http://13.233.116.88:9000/api/";
  // _hostName: string = 'http://192.168.1.26:2000/api/"';
  _hostName: string = `${Base_Url}`;



  _axios: AxiosInstance = axios.create({
    // withCredentials: true,
    baseURL: this._hostName,
    headers: {
      // ✅ Fixed: Check both sessionStorage and sessionStorage for token
      Authorization: `Bearer ${sessionStorage.getItem("auth_token") || sessionStorage.getItem("auth_token") || ""}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  constructor() {
    this._axios.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (apiCallCount === 0) {
          EventEmitter.dispatch("setLoading", true);
        }
        apiCallCount++;
        // ✅ Fixed: Check both sessionStorage and sessionStorage for token
        const token = sessionStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      function (err) {
        return Promise.reject(err);
      }
    );
  }

  refreshAxiosInstance() {
    // ✅ Fixed: Check both sessionStorage and sessionStorage for token
    const token = sessionStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
    this._axios = axios.create({
      baseURL: this._hostName,
      headers: {
        Authorization: `Bearer ${token || ""}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
  }




  //   refreshAxiosInstance() {
  //     this._axios = axios.create({
  //       baseURL: this._hostName,
  //       headers: {
  //         Authorization: Bearer ${sessionStorage.getItem("token")},
  //         Accept: "application/json",
  //         "Content-Type": "application/json",
  //       },
  //     });
  //   }

  private _handleResult<T>(result: AxiosResponse<T>) {
    apiCallCount--;
    if (apiCallCount <= 0) {
      EventEmitter.dispatch("setLoading", false);
      apiCallCount = 0;
    }

    return { ...result.data, status: result.status };
  }

  private _handleError(err: AxiosError) {
    apiCallCount--;
    if (apiCallCount <= 0) {
      EventEmitter.dispatch("setLoading", false);
      apiCallCount = 0;
    }
    if (err.response) {
      handleErrResult(err.response);
    } else if (err.request) {
      console.error(`err.req: ${err.request}`);
    } else {
      console.error(`err.message: ${err.message}`);
    }
    return Promise.reject(err);
  }

  _get<T = any>(url: string, config?: InternalAxiosRequestConfig): Promise<T> {
    return this._axios
      .get(`${url}`, config || { data: {} })
      .then(this._handleResult)
      .catch(this._handleError);
  }

  _post<T = any>(
    url: string,
    data?: any,
    config?: InternalAxiosRequestConfig
  ): Promise<T> {
    return this._axios
      .post(`${url}`, data || {}, config || {})
      .then(this._handleResult)
      .catch(this._handleError);
  }

  _postFormData<T = any>(
    url: string,
    formData: FormData,
    config?: InternalAxiosRequestConfig
  ): Promise<T> {
    // ✅ Fixed: Check both sessionStorage and sessionStorage for token
    const token = sessionStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
    return this._axios
      .post(`${url}`, formData, {
        ...config,
        headers: {
          ...config?.headers,
          Authorization: `Bearer ${token || ""}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then(this._handleResult)
      .catch(this._handleError);
  }

  _putFormData<T = any>(
    url: string,
    formData: FormData,
    config?: InternalAxiosRequestConfig
  ): Promise<T> {
    // ✅ Fixed: Check both sessionStorage and sessionStorage for token
    const token = sessionStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
    return this._axios
      .put(`${url}`, formData, {
        ...config,
        headers: {
          ...config?.headers,
          Authorization: `Bearer ${token || ""}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then(this._handleResult)
      .catch(this._handleError);
  }


  _put<T = any>(url: string, data?: any): Promise<T> {
    return this._axios
      .put(`${url}`, data || {})
      .then(this._handleResult)
      .catch(this._handleError);
  }

  _patch<T = any>(url: string, data?: any): Promise<T> {
    return this._axios
      .patch(`${url}`, data || {})
      .then(this._handleResult)
      .catch(this._handleError);
  }

  _delete<T = any>(url: string, data?: any): Promise<T> {
    return this._axios
      .delete(`${url}`, {
        headers: {
          "Content-Type": "application/json;",
        },
        data: data || {},
      })
      .then(this._handleResult)
      .catch(this._handleError);
  }
}

const api = new Api();
export { api };