import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as action from "../../actions/jobObserverActions";
import { IStoreState } from "../../reducers/rootReducer";
import { JobObserverState } from "../../states/JobObserverState";
import {
  JobNotification,
  JobSubscription,
  MonitorFallback,
  MonitorMode,
} from "../../types/Jobs/JobSubscriptionModels";
import { AddJobSubscription } from "./useJobSubscription";

export interface UseJobObserverResult {
  monitorObservedJob: (
    onCompleted: (notification: JobNotification) => void
  ) => Promise<JobSubscription | undefined>;
  clearJobObserver: () => void;
  observedJobSubscription: JobSubscription | undefined;
  isObserving: boolean;
}

export const useJobObserver = ({
  addSub,
  removeSub,
  jobNotifications,
  onError,
}: {
  addSub: (request: AddJobSubscription) => Promise<JobSubscription>;
  removeSub: (id: string) => void;
  jobNotifications: JobNotification[];
  onError: (error: any) => void;
}): UseJobObserverResult => {
  const jobObserverState: JobObserverState = useSelector<IStoreState, JobObserverState>(
    (state) => state.jobObserverState
  );
  const [observedJobSubscription, setObservedJobSubscription] = useState<JobSubscription>();
  const [isObserving, setIsObserving] = useState<boolean>(false);
  const [onCompleted, setHandleJobComplete] = useState<(notification: JobNotification) => void>();
  const dispatch = useDispatch();

  const getJobObserver = () => {
    return jobObserverState;
  };

  const clearJobObserver = () => {
    dispatch(action.clearJobObserverState());
  };

  const monitorObservedJob = async (onCompleted: (notification: JobNotification) => void) => {
    const jobToObserve = getJobObserver();

    if (!observedJobSubscription && jobToObserve.jobFilter) {
      setIsObserving(true);
      const subscription = await addSub({
        filterBy: jobToObserve.jobFilter,
        monitorMode: MonitorMode.SignalR,
        monitorFallback: MonitorFallback.Polling,
        onError: onError,
      });
      setObservedJobSubscription(subscription);
      setHandleJobComplete(() => onCompleted);

      return subscription;
    }
    return undefined;
  };

  const handleObservedJobNotification = (notification: JobNotification | undefined) => {
    if (
      !onCompleted ||
      !observedJobSubscription ||
      !notification?.latestJob ||
      notification.subscription.id !== observedJobSubscription.id
    )
      return;

    const observedJob = notification.latestJob;
    if (!observedJob || observedJob.isActive) return;
    if (observedJob.isComplete) {
      onCompleted(notification);
      removeSub(observedJobSubscription.id);
      setIsObserving(false);
    }
  };

  useEffect(() => {
    handleObservedJobNotification(
      jobNotifications.find((n) => n.subscription.id === observedJobSubscription?.id)
    );
  }, [jobNotifications]);

  return {
    clearJobObserver,
    monitorObservedJob,
    observedJobSubscription,
    isObserving,
  };
};
