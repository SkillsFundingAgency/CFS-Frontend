import { Reducer } from "redux";

import { IJobObserverActions, JobObserverActionEvent } from "../actions/jobObserverActions";
import { JobObserverState } from "../states/JobObserverState";

const initialState: JobObserverState = {
  jobFilter: undefined,
};

export const reduceJobObserverState: Reducer<JobObserverState, IJobObserverActions> = (
  state: JobObserverState = initialState,
  action: IJobObserverActions
): JobObserverState => {
  switch (action.type) {
    case JobObserverActionEvent.UPSERT_JOB_FILTER:
      return { ...state, jobFilter: action.payload };
    case JobObserverActionEvent.CLEAR_JOB_FILTER:
      return { ...initialState };
    default:
      return state;
  }
};
