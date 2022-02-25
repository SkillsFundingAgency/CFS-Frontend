import { uniq, uniqBy } from "ramda";
import * as React from "react";

import { shouldUpdateNotification } from "../../helpers/jobSubscriptionUtilities";
import { JobNotification, JobSubscription } from "../../types/Jobs/JobSubscriptionModels";

export interface NotificationsParams {
  subs: JobSubscription[];
  notify: (input: JobNotification | JobNotification[]) => void;
}

export interface NotificationsResult {
  notifications: JobNotification[];
  addNotification: (input: JobNotification | JobNotification[]) => void;
  clearAllNotifications: () => void;
}

export const useNotifications = ({ notify }: NotificationsParams): NotificationsResult => {
  const [notifications, setNotifications] = React.useState<JobNotification[]>([]);

  const addNotification = (input: JobNotification | JobNotification[]) => {
    mergeNotifications(Array.isArray(input) ? input : [input]);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const mergeNotifications = (newNotifications: JobNotification[]) => {
    if (newNotifications.length === 0) return;

    // filter out any without actual latest job and ensure it is unique by job id
    const newOnes = uniqBy(
      (n) => n.latestJob?.jobId,
      newNotifications.filter((nn) => nn.latestJob?.jobId)
    );
    setNotifications((existingOnes) => {
      const existingNotificationSubIds = uniq(existingOnes.map((n) => n.subscription.id));

      // notifications that will be updated/replaced
      const matchingNewOnes = newOnes.filter((n) => existingNotificationSubIds.includes(n.subscription.id));

      // notifications which are the first for their respective subscriptions
      const nonMatchingNewOnes = newOnes.filter(
        (n) => !existingNotificationSubIds.includes(n.subscription.id)
      );
      notify(nonMatchingNewOnes);

      // notifications we have already that won't be updated/replaced
      const nonMatchingExistingOnes = existingOnes.filter(
        (n) => !matchingNewOnes.some((x) => x.subscription.id === n.subscription.id)
      );

      // add in the notifications that are not replacements
      let output: JobNotification[] = [...nonMatchingNewOnes, ...nonMatchingExistingOnes];

      // add notifications that need to be replaced with latest version
      matchingNewOnes.forEach((matchingNewOne) => {
        const existingOne = existingOnes.find((n) => n.subscription.id === matchingNewOne.subscription.id);
        // add new one or keep existing one
        if (!existingOne || (!!existingOne && shouldUpdateNotification(existingOne, matchingNewOne))) {
          // add new one instead of existing
          output = [...output, matchingNewOne];
          notify(matchingNewOne);
        } else {
          output = [...output, existingOne];
        }
      });

      return output;
    });
  };

  return { addNotification, clearAllNotifications, notifications };
};
