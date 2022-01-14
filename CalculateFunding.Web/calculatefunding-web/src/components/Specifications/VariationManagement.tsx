import { AxiosError } from "axios";
import * as React from "react";
import { useState } from "react";
import { useQuery } from "react-query";

import { useErrorContext } from "../../context/ErrorContext";
import { useProfileVariationPointers } from "../../hooks/Variation/useProfileVariationPointers";
import { getAvailableFundingLinePeriods } from "../../services/publishService";
import { mergeProfileVariationPointersService } from "../../services/specificationService";
import { AvailableVariationPointerFundingLine } from "../../types/Publishing/AvailableVariationPointerFundingLine";
import { ProfileVariationPointer } from "../../types/Specifications/ProfileVariationPointer";
import ProfilePatternSelector from "../Funding/ProfilePatternSelector";
import { LoadingStatusNotifier } from "../LoadingStatusNotifier";
import { NoData } from "../NoData";

export interface VariationManagementProps {
  specificationId: string;
  fundingPeriodId: string;
  fundingStreamId: string;
}

export function VariationManagement({ specificationId, fundingStreamId }: VariationManagementProps) {
  const { addErrorToContext: addError, clearErrorsFromContext: clearErrorMessages } = useErrorContext();
  const [updatedPointers, setUpdatedPointers] = useState<ProfileVariationPointer[] | undefined>();

  const { profileVariationPointers, isFetchingVariationManagement } = useProfileVariationPointers({
    specificationId,
    enabled: !!specificationId?.length,
    onSuccess: () => clearErrorMessages(),
    onError: (err) =>
      addError({
        error: err.message,
        description: "Error while loading available funding lines",
      }),
  });
  const {
    data: availableFundingLines,
    isFetching: isFetchingAvailableFundingLines,
    refetch,
  } = useQuery<AvailableVariationPointerFundingLine[], AxiosError>(
    `available-funding-periods-${specificationId}`,
    async () => (await getAvailableFundingLinePeriods(specificationId)).data,
    {
      enabled: !!specificationId?.length,
      onError: (err) =>
        addError({
          error: err.message,
          description: "Error while loading available funding lines",
        }),
    }
  );

  function setPointer(pattern: string, pointer: AvailableVariationPointerFundingLine) {
    const splitPattern = pattern.split("-");

    const pointerPattern: ProfileVariationPointer = {
      fundingLineId: pointer.fundingLineCode,
      fundingStreamId: fundingStreamId,
      typeValue: splitPattern[1],
      year: parseInt(splitPattern[0]),
      periodType: "CalendarMonth",
      occurrence: parseInt(splitPattern[2]),
    };

    const updatedCollection = updatedPointers === undefined ? [] : updatedPointers;
    const i = updatedCollection.findIndex((x) => x.fundingLineId == pointerPattern.fundingLineId, 0);
    if (i > -1) {
      updatedPointers?.splice(i, 1);
    }

    updatedCollection?.push(pointerPattern);
    setUpdatedPointers(updatedCollection);
  }

  async function updatePointers(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    clearErrorMessages();
    e.preventDefault();
    try {
      if (updatedPointers) {
        await mergeProfileVariationPointersService(specificationId, updatedPointers).then(() => {
          refetch();
        });
      }
    } catch (e: any) {
      addError({
        error: e,
        description: "Error while trying to update variation pointers",
      });
    }
  }

  const haveDataToShow: boolean =
    !!profileVariationPointers &&
    profileVariationPointers.length > 0 &&
    !isFetchingVariationManagement &&
    !isFetchingAvailableFundingLines;

  return (
    <section className="govuk-tabs__panel" id="variation-management">
      <LoadingStatusNotifier
        notifications={[
          {
            isActive: isFetchingVariationManagement,
            title: "Loading variation management",
            description: "Please wait whilst variation management is loading",
          },
          {
            isActive: isFetchingAvailableFundingLines,
            title: "Loading available funding lines",
            description: "Please wait",
          },
        ]}
      />
      {!haveDataToShow ? (
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full" hidden={haveDataToShow}>
            <NoData excludeSearchTips={true} />
          </div>
        </div>
      ) : (
        <>
          <div className="govuk-grid-column-full">
            <h2 className="govuk-heading-l">Variations</h2>
            <p className="govuk-body">Set the instalment from which a variation should take effect.</p>
          </div>
          <div className="govuk-grid-column-two-thirds">
            <h4 className="govuk-heading-s">Instalment variation</h4>
            <form>
              <table className="govuk-table">
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th className="govuk-table__header">Funding line</th>
                    <th className="govuk-table__header">Currently set instalment</th>
                    <th className="govuk-table__header">Future instalment</th>
                  </tr>
                </thead>
                <tbody className="govuk__body">
                  {availableFundingLines &&
                    availableFundingLines.map((pointer, index) => {
                      const period = pointer.selectedPeriod;
                      return (
                        <tr className="govuk-table__row" key={index}>
                          <td className="govuk-table__header">
                            {pointer.fundingLineName} ({pointer.fundingLineCode})
                          </td>
                          <td className="govuk-table__header">
                            {" "}
                            {!period ? (
                              "Initial allocation"
                            ) : (
                              <span>{`${period.period} ${period.year} Instalment ${period.occurrence}`}</span>
                            )}
                          </td>
                          <td className="govuk-table__cell">
                            <ProfilePatternSelector
                              profilePatternList={pointer.periods}
                              pointer={pointer}
                              callback={setPointer}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  <tr>
                    <td colSpan={2}>
                      <button
                        className={"govuk-button govuk-!-margin-right-2"}
                        onClick={(e) => updatePointers(e)}
                      >
                        Save
                      </button>
                      <button className={"govuk-button govuk-button--secondary"} type={"reset"}>
                        Reset future instalments
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </form>
          </div>
        </>
      )}
    </section>
  );
}
