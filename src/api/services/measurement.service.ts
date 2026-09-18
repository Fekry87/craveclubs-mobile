import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { PaginatedResponseType } from '../../types/api.types';
import {
  MeasurementDayInterface,
  MeasurementProgressInterface,
  MeasurementInterface,
  MeasurementOptionsInterface,
  MeasurementPayload,
} from '../../types/models.types';

interface ValidationErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * القياس — timed swims a coach records during a session. The options are the
 * club's SWIM_TYPE and DISTANCE skills (managed in the portal's Skills page);
 * every route answers 403 when the club does not have the Skills feature.
 */
export const measurementService = {
  async getOptions(): Promise<MeasurementOptionsInterface> {
    const { data } = await apiClient.get<MeasurementOptionsInterface>(
      ENDPOINTS.COACH.MEASUREMENT_OPTIONS,
    );
    return data;
  },

  /** Every measurement of the session, newest first. */
  async getForSession(sessionId: number): Promise<MeasurementInterface[]> {
    const { data } = await apiClient.get<{ data: MeasurementInterface[] }>(
      ENDPOINTS.COACH.SESSION_MEASUREMENTS(sessionId),
    );
    return data.data;
  },

  async record(
    sessionId: number,
    payload: MeasurementPayload,
  ): Promise<MeasurementInterface> {
    const { data } = await apiClient.post<MeasurementInterface>(
      ENDPOINTS.COACH.SESSION_MEASUREMENTS(sessionId),
      payload,
    );
    return data;
  },

  /** The signed-in swimmer's times, one entry per training day, newest first. */
  async getMine(
    page: number = 1,
    perPage: number = 15,
  ): Promise<PaginatedResponseType<MeasurementDayInterface>> {
    const { data } = await apiClient.get<PaginatedResponseType<MeasurementDayInterface>>(
      ENDPOINTS.SWIMMER.MEASUREMENTS,
      { params: { page, per_page: perPage } },
    );
    return data;
  },

  /** Weekly pace-per-50m averages by stroke, for the progress chart. */
  async getProgress(): Promise<MeasurementProgressInterface> {
    const { data } = await apiClient.get<MeasurementProgressInterface>(
      ENDPOINTS.SWIMMER.MEASUREMENTS_PROGRESS,
    );
    return data;
  },

  async remove(sessionId: number, measurementId: number): Promise<void> {
    await apiClient.delete(
      ENDPOINTS.COACH.SESSION_MEASUREMENT(sessionId, measurementId),
    );
  },
};

/**
 * The server's own sentence for a refused measurement (422 field messages:
 * swimmer not in the session, session not started, option no longer offered);
 * anything else gets a generic line — raw server errors never reach the screen.
 */
export const describeMeasurementError = (err: unknown): string => {
  const response = (err as { response?: { status?: number; data?: ValidationErrorBody } })
    .response;
  if (response?.status === 422) {
    const first = Object.values(response.data?.errors ?? {})[0]?.[0];
    if (first) return first;
    if (response.data?.message) return response.data.message;
  }
  if (response?.status === 403) {
    return 'Measurements are not enabled for this club.';
  }
  if (response?.status === 404) {
    return "This session isn't available anymore.";
  }
  return "We couldn't save this time. Check your connection and try again.";
};
