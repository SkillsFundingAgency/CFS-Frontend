import { useDispatch } from "react-redux";

import * as action from "../../actions/jobObserverActions";
import { JobMonitoringFilter } from "../../types/Jobs/JobMonitoringFilter";

export const useAddJobObserver = (): {
  addJobObserver: (params: Partial<JobMonitoringFilter>) => void;
} => {
  const dispatch = useDispatch();

  const addJobObserver = (params: Partial<JobMonitoringFilter>) => {
    const jobMonitoringFilter: JobMonitoringFilter = {
      ...params,
    };
    dispatch(action.upsertJobObserverState(jobMonitoringFilter));
  };

  return { addJobObserver };
};
