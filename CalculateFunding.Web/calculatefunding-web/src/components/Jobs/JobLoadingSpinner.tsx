import React from "react";

import { LoadingFieldStatus } from "../LoadingFieldStatus";
import { LoadingStatusNotifier } from "../LoadingStatusNotifier";

export enum SpinnerDisplaySetting {
  HideSpinner,
  ShowFieldSpinner,
  ShowPageSpinner,
}

export interface SpinnerSettings {
  isLoading?: boolean;
  display: SpinnerDisplaySetting;
  loadingText?: string;
  loadingDescription?: string;
}

const JobLoadingSpinner = ({
  isLoading,
  display,
  loadingText,
  loadingDescription,
}: SpinnerSettings): JSX.Element | null => {
  if (!isLoading) return null;

  const displaySetting = display || SpinnerDisplaySetting.ShowFieldSpinner;

  switch (displaySetting) {
    case SpinnerDisplaySetting.ShowFieldSpinner:
      return (
        <div className=" govuk-!-margin-bottom-4">
          <LoadingFieldStatus title={loadingText?.length ? loadingText : "Checking for running jobs"} />
        </div>
      );
    case SpinnerDisplaySetting.ShowPageSpinner:
      return (
        <div className=" govuk-!-margin-bottom-4">
          <LoadingStatusNotifier
            notifications={[
              {
                title: loadingText?.length ? loadingText : "Checking for running jobs",
                description: loadingDescription,
                isActive: true,
              },
            ]}
          />
        </div>
      );
    default:
      return null;
  }
};
export default JobLoadingSpinner;
