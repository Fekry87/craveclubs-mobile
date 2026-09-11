import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import {
  LoginRequestType,
  LoginResponseType,
  AuthMeResponseType,
  DeleteAccountResponseType,
  ReactivateAccountRequestType,
  ReactivateAccountResponseType,
  DeletionStatusResponseType,
  ChangePasswordRequestType,
  ChangePasswordResponseType,
} from '../../types/api.types';

export const authService = {
  async login(credentials: LoginRequestType): Promise<LoginResponseType> {
    const { data } = await apiClient.post<LoginResponseType>(
      ENDPOINTS.AUTH.LOGIN,
      credentials,
    );
    return data;
  },

  async changePassword(
    payload: ChangePasswordRequestType,
  ): Promise<ChangePasswordResponseType> {
    const { data } = await apiClient.post<ChangePasswordResponseType>(
      ENDPOINTS.AUTH.CHANGE_PASSWORD,
      payload,
    );
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
  },

  async getMe(): Promise<AuthMeResponseType> {
    const { data } = await apiClient.get<AuthMeResponseType>(
      ENDPOINTS.AUTH.ME,
    );
    return data;
  },

  async deleteAccount(): Promise<DeleteAccountResponseType> {
    const { data } = await apiClient.post<DeleteAccountResponseType>(
      ENDPOINTS.ACCOUNT.DELETE,
    );
    return data;
  },

  async reactivateAccount(
    credentials: ReactivateAccountRequestType,
  ): Promise<ReactivateAccountResponseType> {
    const { data } = await apiClient.post<ReactivateAccountResponseType>(
      ENDPOINTS.ACCOUNT.REACTIVATE,
      credentials,
    );
    return data;
  },

  async getDeletionStatus(email: string): Promise<DeletionStatusResponseType> {
    const { data } = await apiClient.get<DeletionStatusResponseType>(
      ENDPOINTS.ACCOUNT.DELETION_STATUS,
      { params: { email } },
    );
    return data;
  },
};
