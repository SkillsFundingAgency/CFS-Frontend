import "../../styles/PreviewProfileModal.scss";

import React, { useEffect, useState } from "react";

import { ErrorProps } from "../../hooks/useErrors";
import { previewProfile } from "../../services/profilingService";
import { ProfileTotal } from "../../types/FundingLineProfile";
import { DateTimeFormatter } from "../DateTimeFormatter";
import { FormattedNumber, NumberType } from "../FormattedNumber";
import { LoadingStatus } from "../LoadingStatus";

export interface PreviewProfileModalProps {
  specificationId: string;
  providerId: string;
  fundingStreamId: string;
  fundingPeriodId: string;
  fundingLineId: string;
  previewProfilePatternKey: string | null;
  showModal: boolean;
  toggleModal: React.Dispatch<React.SetStateAction<boolean>>;
  addError: (error: ErrorProps) => void;
  setPreviewProfilePatternKey: React.Dispatch<React.SetStateAction<string | null | undefined>>;
}

export function PreviewProfileModal({
  specificationId,
  providerId,
  fundingLineId,
  fundingPeriodId,
  fundingStreamId,
  previewProfilePatternKey,
  showModal,
  toggleModal,
  addError,
  setPreviewProfilePatternKey,
}: PreviewProfileModalProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profileTotals, setProfileTotals] = useState<ProfileTotal[]>([]);

  useEffect(() => {
    async function getPreviewProfile() {
      try {
        const data: ProfileTotal[] = (
          await previewProfile(
            specificationId,
            fundingStreamId,
            fundingPeriodId,
            providerId,
            fundingLineId,
            previewProfilePatternKey
          )
        ).data;
        setProfileTotals(data);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        addError({
          error: "Could not retrieve preview data. Please try again.",
          fieldName: "preview-profile",
        });
        toggleModal(false);
        setPreviewProfilePatternKey(undefined);
      }
    }

    getPreviewProfile();
  }, [previewProfilePatternKey]);

  const handleClose = () => {
    toggleModal(false);
  };

  const modalDisplayStyle = {
    display: showModal ? "block" : "none",
  };

  return (
    <div id="preview-profile-modal" className="modal" style={modalDisplayStyle} role="dialog">
      <div className="modal-content">
        <div className="modal-header">
          <svg
            aria-hidden="true"
            focusable="false"
            className="govuk-header__logotype-crown"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 132 97"
            height="30"
            width="36"
          >
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M25 30.2c3.5 1.5 7.7-.2 9.1-3.7 1.5-3.6-.2-7.8-3.9-9.2-3.6-1.4-7.6.3-9.1 3.9-1.4 3.5.3 7.5 3.9 9zM9 39.5c3.6 1.5 7.8-.2 9.2-3.7 1.5-3.6-.2-7.8-3.9-9.1-3.6-1.5-7.6.2-9.1 3.8-1.4 3.5.3 7.5 3.8 9zM4.4 57.2c3.5 1.5 7.7-.2 9.1-3.8 1.5-3.6-.2-7.7-3.9-9.1-3.5-1.5-7.6.3-9.1 3.8-1.4 3.5.3 7.6 3.9 9.1zm38.3-21.4c3.5 1.5 7.7-.2 9.1-3.8 1.5-3.6-.2-7.7-3.9-9.1-3.6-1.5-7.6.3-9.1 3.8-1.3 3.6.4 7.7 3.9 9.1zm64.4-5.6c-3.6 1.5-7.8-.2-9.1-3.7-1.5-3.6.2-7.8 3.8-9.2 3.6-1.4 7.7.3 9.2 3.9 1.3 3.5-.4 7.5-3.9 9zm15.9 9.3c-3.6 1.5-7.7-.2-9.1-3.7-1.5-3.6.2-7.8 3.7-9.1 3.6-1.5 7.7.2 9.2 3.8 1.5 3.5-.3 7.5-3.8 9zm4.7 17.7c-3.6 1.5-7.8-.2-9.2-3.8-1.5-3.6.2-7.7 3.9-9.1 3.6-1.5 7.7.3 9.2 3.8 1.3 3.5-.4 7.6-3.9 9.1zM89.3 35.8c-3.6 1.5-7.8-.2-9.2-3.8-1.4-3.6.2-7.7 3.9-9.1 3.6-1.5 7.7.3 9.2 3.8 1.4 3.6-.3 7.7-3.9 9.1zM69.7 17.7l8.9 4.7V9.3l-8.9 2.8c-.2-.3-.5-.6-.9-.9L72.4 0H59.6l3.5 11.2c-.3.3-.6.5-.9.9l-8.8-2.8v13.1l8.8-4.7c.3.3.6.7.9.9l-5 15.4v.1c-.2.8-.4 1.6-.4 2.4 0 4.1 3.1 7.5 7 8.1h.2c.3 0 .7.1 1 .1.4 0 .7 0 1-.1h.2c4-.6 7.1-4.1 7.1-8.1 0-.8-.1-1.7-.4-2.4V34l-5.1-15.4c.4-.2.7-.6 1-.9zM66 92.8c16.9 0 32.8 1.1 47.1 3.2 4-16.9 8.9-26.7 14-33.5l-9.6-3.4c1 4.9 1.1 7.2 0 10.2-1.5-1.4-3-4.3-4.2-8.7L108.6 76c2.8-2 5-3.2 7.5-3.3-4.4 9.4-10 11.9-13.6 11.2-4.3-.8-6.3-4.6-5.6-7.9 1-4.7 5.7-5.9 8-.5 4.3-8.7-3-11.4-7.6-8.8 7.1-7.2 7.9-13.5 2.1-21.1-8 6.1-8.1 12.3-4.5 20.8-4.7-5.4-12.1-2.5-9.5 6.2 3.4-5.2 7.9-2 7.2 3.1-.6 4.3-6.4 7.8-13.5 7.2-10.3-.9-10.9-8-11.2-13.8 2.5-.5 7.1 1.8 11 7.3L80.2 60c-4.1 4.4-8 5.3-12.3 5.4 1.4-4.4 8-11.6 8-11.6H55.5s6.4 7.2 7.9 11.6c-4.2-.1-8-1-12.3-5.4l1.4 16.4c3.9-5.5 8.5-7.7 10.9-7.3-.3 5.8-.9 12.8-11.1 13.8-7.2.6-12.9-2.9-13.5-7.2-.7-5 3.8-8.3 7.1-3.1 2.7-8.7-4.6-11.6-9.4-6.2 3.7-8.5 3.6-14.7-4.6-20.8-5.8 7.6-5 13.9 2.2 21.1-4.7-2.6-11.9.1-7.7 8.8 2.3-5.5 7.1-4.2 8.1.5.7 3.3-1.3 7.1-5.7 7.9-3.5.7-9-1.8-13.5-11.2 2.5.1 4.7 1.3 7.5 3.3l-4.7-15.4c-1.2 4.4-2.7 7.2-4.3 8.7-1.1-3-.9-5.3 0-10.2l-9.5 3.4c5 6.9 9.9 16.7 14 33.5 14.8-2.1 30.8-3.2 47.7-3.2z"
            ></path>
          </svg>
          <button className="govuk-button" onClick={handleClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          {isLoading ? (
            <LoadingStatus title="Loading preview..." />
          ) : (
            <>
              <h2 className="govuk-heading-m">Pattern name</h2>
              <table className="govuk-table govuk-!-margin-top-5">
                <caption className="govuk-table__caption">Profiling installments</caption>
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th scope="col" className="govuk-table__header">
                      Instalment
                    </th>
                    <th scope="col" className="govuk-table__header">
                      Payment status
                    </th>
                    <th scope="col" className="govuk-table__header">
                      Instalment number
                    </th>
                    <th scope="col" className="govuk-table__header">
                      Per cent
                    </th>
                    <th scope="col" className="govuk-table__header govuk-table__header--numeric">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  {profileTotals
                    .sort((a, b) => a.installmentNumber - b.installmentNumber)
                    .map((pt) => (
                      <tr key={`installment-${pt.installmentNumber}`} className="govuk-table__row">
                        <th scope="row" className="govuk-table__header">
                          <DateTimeFormatter date={pt.actualDate as Date} />
                        </th>
                        <td className="govuk-table__cell">
                          {pt.isPaid ? <strong className="govuk-tag">Paid</strong> : null}
                        </td>
                        <td className="govuk-table__cell">{pt.installmentNumber}</td>
                        <td className="govuk-table__cell">
                          <FormattedNumber
                            value={pt.profileRemainingPercentage}
                            type={NumberType.FormattedPercentage}
                          />
                        </td>
                        <td className="govuk-table__cell govuk-table__cell--numeric">
                          <FormattedNumber value={pt.value} type={NumberType.FormattedMoney} />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </>
          )}
          <button className="govuk-button" data-module="govuk-button" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
