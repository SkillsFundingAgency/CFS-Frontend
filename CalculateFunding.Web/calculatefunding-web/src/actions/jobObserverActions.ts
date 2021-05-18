import { JobMonitoringFilter } from '../hooks/Jobs/useJobMonitor';
import { ActionCreator } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { JobObserverState } from '../states/JobObserverState';

export enum JobObserverActionEvent {
  UPSERT_JOB_FILTER = 'upsertJobFilter',
  CLEAR_JOB_FILTER = 'clearJobFilter',
}

export type IJobObserverActions = IClearJobObserverAction | IUpsertJobObserverAction;

export interface IClearJobObserverAction {
  type: JobObserverActionEvent.CLEAR_JOB_FILTER;
}
export interface IUpsertJobObserverAction {
  type: JobObserverActionEvent.UPSERT_JOB_FILTER;
  payload: JobMonitoringFilter
}


export const upsertJobObserverState: ActionCreator<ThunkAction<Promise<any>, JobObserverState, unknown, IJobObserverActions>> =
  (data: JobMonitoringFilter) => {
    return async (dispatch) => {
      dispatch({
        type: JobObserverActionEvent.UPSERT_JOB_FILTER,
        payload: data
      });
    }
  };

export const clearJobObserverState: ActionCreator<ThunkAction<Promise<any>, JobObserverState, unknown, IJobObserverActions>> =
  () => {
    return async (dispatch) => {
      dispatch({
        type: JobObserverActionEvent.CLEAR_JOB_FILTER
      });
    }
  };
