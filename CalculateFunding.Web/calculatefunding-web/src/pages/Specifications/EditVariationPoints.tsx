import React, { useEffect, useState } from "react";
import { RouteComponentProps, useHistory } from "react-router";

import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { LoadingStatus } from "../../components/LoadingStatus";
import { Main } from "../../components/Main";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { useErrors } from "../../hooks/useErrors";
import { useSpecificationSummary } from "../../hooks/useSpecificationSummary";
import { useProfileVariationPointers } from "../../hooks/Variation/useProfileVariationPointers";
import { getProfilePatternsForFundingLine } from "../../services/profilingService";
import { setProfileVariationPointersService } from "../../services/specificationService";
import { ProfilingInstallments } from "../../types/ProviderProfileTotalsForStreamAndPeriod";
import { Section } from "../../types/Sections";
import {
  FundingLineProfileVariationPointer,
  ProfileVariationPointer,
} from "../../types/Specifications/ProfileVariationPointer";

export interface EditVariationPointsRouteProps {
  specificationId: string;
  fundingLineId: string;
}

export function EditVariationPoints({ match }: RouteComponentProps<EditVariationPointsRouteProps>) {
  const specificationId = match.params.specificationId;
  const fundingLineId = match.params.fundingLineId;

  const [currentProfileVariationPointer, setCurrentProfileVariationPointer] =
    useState<FundingLineProfileVariationPointer>();
  const [futureProfilingInstalments, setFutureProfilingInstalments] = useState<ProfilingInstallments[]>([]);
  const [selectedInstalment, setSelectedInstalment] = useState<string>("");
  const [isLoadingInstalments, setIsLoadingInstalments] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { errors, addError, clearErrorMessages } = useErrors();
  const { specification, isLoadingSpecification } = useSpecificationSummary(specificationId, (err) =>
    addError({
      error: err,
      description: "Error while loading specification",
    })
  );
  const { profileVariationPointers, isLoadingVariationManagement } = useProfileVariationPointers({
    specificationId,
    enabled: !!specificationId?.length,
    onSuccess: () => clearErrorMessages(),
    onError: (err) =>
      addError({
        error: err.message,
        description: "Error while loading available funding lines",
      }),
  });
  const history = useHistory();

  useEffect(() => {
    if (!specification || !profileVariationPointers) return;

    const loadProfileVariationPointerData = async () => {
      try {
        clearErrorMessages();
        setIsLoadingInstalments(true);

        const currentPointer = profileVariationPointers.find((p) => p.fundingLineId === fundingLineId);
        setCurrentProfileVariationPointer(currentPointer);
        const installments = (
          await getProfilePatternsForFundingLine(
            specification.fundingStreams[0].id,
            specification.fundingPeriod.id,
            fundingLineId
          )
        ).data as ProfilingInstallments[];

        if (installments && installments.length > 0) {
          if (currentPointer && currentPointer.profileVariationPointer !== null) {
            const currentYear = currentPointer.profileVariationPointer.year;
            const currentMonthNumber = getMonthNumber(currentPointer.profileVariationPointer.typeValue);
            const currentInstallmentNumber = currentPointer.profileVariationPointer.occurrence;
            const futureInstallments = installments.filter(
              (i) =>
                i.installmentYear > currentYear ||
                (i.installmentYear === currentYear &&
                  getMonthNumber(i.installmentMonth) > currentMonthNumber) ||
                (i.installmentYear === currentYear &&
                  getMonthNumber(i.installmentMonth) === currentMonthNumber &&
                  i.installmentNumber > currentInstallmentNumber)
            );

            if (futureInstallments && futureInstallments.length > 0) {
              setFutureProfilingInstalments(futureInstallments);
            }
          } else {
            setFutureProfilingInstalments(installments);
          }
        }
      } catch (err: any) {
        addError({ error: err, description: "Error while retrieving profile variation pointers" });
      } finally {
        setIsLoadingInstalments(false);
      }
    };

    loadProfileVariationPointerData();
  }, [specification, fundingLineId, profileVariationPointers]);

  function getMonthNumber(monthName: string) {
    return (
      [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
      ].indexOf(monthName.toLowerCase()) + 1
    );
  }

  function setFutureInstallment(e: React.ChangeEvent<HTMLSelectElement>) {
    const newValue = e.target.value;
    setSelectedInstalment(newValue);
  }

  async function setProfileVariationPointers() {
    try {
      if (selectedInstalment.length > 0 && specification && futureProfilingInstalments) {
        setIsSaving(true);
        const installmentParts = selectedInstalment.split("-");
        const profileVariationPointersFutureInstallment: ProfileVariationPointer[] = [
          {
            fundingLineId: fundingLineId,
            fundingStreamId: specification.fundingStreams[0].id,
            typeValue: installmentParts[1],
            periodType:
              currentProfileVariationPointer?.profileVariationPointer?.periodType ??
              futureProfilingInstalments[0].periodType,
            year: parseInt(installmentParts[0], 10),
            occurrence: parseInt(installmentParts[2], 10),
          },
        ];
        const updateProfileVariationPointersResponse = await setProfileVariationPointersService(
          specificationId,
          profileVariationPointersFutureInstallment
        );
        if (updateProfileVariationPointersResponse.status === 200) {
          setIsSaving(false);
          history.push(`/ViewSpecification/${specificationId}`);
        } else {
          throw "An invalid response was received. Try refreshing the page.";
        }
      }
    } catch (err: any) {
      setIsSaving(false);
      addError({ error: err, description: "Error while updating profile variation pointer" });
    }
  }

  const isLoading: boolean = isLoadingInstalments || isLoadingVariationManagement || isLoadingSpecification;

  return (
    <Main location={Section.Specifications}>
      <Breadcrumbs>
        <Breadcrumb name="Home" url="/" />
        <Breadcrumb name={"View specifications"} url={"/SpecificationsList"} />
        <Breadcrumb
          name={specification ? specification.name : ""}
          url={`/ViewSpecification/${specificationId}`}
        />
        <Breadcrumb name={"Edit specification"} />
      </Breadcrumbs>
      <MultipleErrorSummary errors={errors} />
      {isLoading || isSaving ? (
        <LoadingStatus title={`${isLoading ? "Loading" : "Saving"} installment variation`} />
      ) : (
        <div className="govuk-width-container">
          <div className="govuk-main-wrapper">
            <fieldset className="govuk-fieldset">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                <h1 className="govuk-fieldset__heading">Variation occurrence</h1>
              </legend>
              {currentProfileVariationPointer && futureProfilingInstalments ? (
                <div className="govuk-form-group">
                  <div className="govuk-grid-column-two-thirds">
                    <div className="govuk-form-group">
                      <table className="govuk-table">
                        <caption className="govuk-table__caption">Installment variation</caption>
                        <thead className="govuk-table__head">
                          <tr className="govuk-table__row">
                            <th scope="col" className="govuk-table__header app-custom-class">
                              Funding line
                            </th>
                            <th scope="col" className="govuk-table__header app-custom-class">
                              Current installment
                            </th>
                            <th scope="col" className="govuk-table__header app-custom-class">
                              Future installment
                            </th>
                          </tr>
                        </thead>
                        <tbody className="govuk-table__body">
                          <tr className="govuk-table__row">
                            <th scope="row" className="govuk-table__header">
                              {currentProfileVariationPointer.fundingLineId}
                            </th>
                            <td className="govuk-table__cell">
                              {currentProfileVariationPointer.profileVariationPointer === null ? (
                                "Initial allocation"
                              ) : (
                                <span>
                                  {`${currentProfileVariationPointer.profileVariationPointer.typeValue} ${currentProfileVariationPointer.profileVariationPointer.year}`}
                                  <br />
                                  {`Installment ${currentProfileVariationPointer.profileVariationPointer.occurrence}`}
                                </span>
                              )}
                            </td>
                            <td className="govuk-table__cell">
                              <div className="govuk-form-group">
                                {futureProfilingInstalments.length > 0 ? (
                                  <select
                                    className="govuk-select"
                                    value={selectedInstalment}
                                    onChange={setFutureInstallment}
                                    data-testid="select"
                                  >
                                    <option value=""></option>
                                    {futureProfilingInstalments.map((installment, installmentIndex) => (
                                      <option
                                        key={`installment-${installmentIndex}`}
                                        value={`${installment.installmentYear}-${installment.installmentMonth}-${installment.installmentNumber}`}
                                      >
                                        {installment.installmentMonth} {installment.installmentYear}{" "}
                                        installment {installment.installmentNumber}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="govuk-body">None available</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    {futureProfilingInstalments.length > 0 ? (
                      <div className="govuk-form-group">
                        <button
                          className="govuk-button govuk-!-margin-right-1"
                          data-module="govuk-button"
                          onClick={setProfileVariationPointers}
                        >
                          Save and continue
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </fieldset>
          </div>
        </div>
      )}
    </Main>
  );
}
