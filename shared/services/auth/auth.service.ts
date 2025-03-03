import { ICsrfTokenData, IEmailCheckData, IEmailCheckResponse } from "types";
import { APIService } from "../api";
import { API_BASE_URL } from "../../constants";

/**
 * Service class for handling authentication-related operations
 * Provides methods for user authentication, password management, and session handling
 * @extends {APIService}
 */
export class AuthService extends APIService {
  /**
   * Creates an instance of AuthService
   * Initializes with the base API URL
   */
  constructor(BASE_URL?: string) {
    super(BASE_URL || API_BASE_URL);
  }

  async login(email: string, password: string) {
    return this.post("/users/login/", {
      email: email,
      password: password,
    })
      .then((response) => {
        console.log(response);

        const token = response?.data?.token;

        if (token) {
          localStorage.setItem("token", token);
        }

        return response?.data;
      })
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async register(data: {
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    password: string;
    avatar: string;
  }) {
    const formData = new FormData();
    formData.append("first_name", data.first_name);
    formData.append("last_name", data.last_name);
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("avatar", data.avatar);

    return this.post("/users/register/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then((response) => {
        console.log(response);

        const token = response?.data?.token;

        if (token) {
          localStorage.setItem("token", token);
        }

        return response?.data;
      })
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Requests a CSRF token for form submission security
   * @returns {Promise<ICsrfTokenData>} Object containing the CSRF token
   * @throws {Error} Throws the complete error object if the request fails
   * @remarks This method uses the validateStatus: null option to bypass interceptors for unauthorized errors.
   */
  async requestCSRFToken(): Promise<ICsrfTokenData> {
    return this.get("/auth/get-csrf-token/", { validateStatus: null })
      .then((response) => response.data)
      .catch((error) => {
        throw error;
      });
  }

  /**
   * Checks if an email exists in the system
   * @param {IEmailCheckData} data - Email data to verify
   * @returns {Promise<IEmailCheckResponse>} Response indicating email status
   * @throws {Error} Throws response data if the request fails
   */
  async emailCheck(data: IEmailCheckData): Promise<IEmailCheckResponse> {
    return this.post("/auth/email-check/", data, { headers: {} })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Sends a password reset link to the specified email address
   * @param {{ email: string }} data - Object containing the email address
   * @returns {Promise<any>} Response from the password reset request
   * @throws {Error} Throws response object if the request fails
   */
  async sendResetPasswordLink(data: { email: string }): Promise<any> {
    return this.post(`/auth/forgot-password/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  /**
   * Sets a new password using a reset token
   * @param {string} token - CSRF token for form submission security
   * @param {{ password: string }} data - Object containing the new password
   * @returns {Promise<any>} Response from the password update request
   * @throws {Error} Throws response data if the request fails
   */
  async setPassword(token: string, data: { password: string }): Promise<any> {
    return this.post(`/auth/set-password/`, data, {
      headers: {
        "X-CSRFTOKEN": token,
      },
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Generates a unique code for magic link authentication
   * @param {{ email: string }} data - Object containing the email address
   * @returns {Promise<any>} Response containing the generated unique code
   * @throws {Error} Throws response data if the request fails
   */
  async generateUniqueCode(data: { email: string }): Promise<any> {
    return this.post("/auth/magic-generate/", data, { headers: {} })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Performs user sign out by submitting a form with CSRF token
   * Creates and submits a form dynamically to handle the sign-out process
   * @param {string} baseUrl - Base URL for the sign-out endpoint
   * @returns {Promise<any>} Resolves when sign-out is complete
   * @throws {Error} Throws error if CSRF token is not found
   */
  async signOut(baseUrl: string): Promise<any> {
    await this.requestCSRFToken().then((data) => {
      const csrfToken = data?.csrf_token;

      if (!csrfToken) throw Error("CSRF token not found");

      const form = document.createElement("form");
      const element1 = document.createElement("input");

      form.method = "POST";
      form.action = `${baseUrl}/auth/sign-out/`;

      element1.value = csrfToken;
      element1.name = "csrfmiddlewaretoken";
      element1.type = "hidden";
      form.appendChild(element1);

      document.body.appendChild(form);

      form.submit();
    });
  }
}
