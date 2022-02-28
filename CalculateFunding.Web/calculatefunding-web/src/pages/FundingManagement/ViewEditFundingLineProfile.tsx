import { cloneDeep } from "lodash";
import React, { useEffect, useState } from "react";
import { RouteComponentProps, useHistory } from "react-router";

import { BackLink } from "../../components/BackLink";
import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { DateTimeFormatter } from "../../components/DateTimeFormatter";
import { FormattedNumber, NumberType, toDecimal } from "../../components/FormattedNumber";
import { EditableProfileTotal, ProfileEditMode } from "../../components/Funding/EditableProfileTotal";
import { FundingSelectionBreadcrumb } from "../../components/Funding/FundingSelectionBreadcrumb";
import { ProfileHistoryPanel } from "../../components/Funding/ProfileHistoryPanel";
import { ProviderFundingOverviewUri } from "../../components/Funding/ProviderFundingOverviewLink";
import { FundingResultsBreadcrumb } from "../../components/Funding/ProviderFundingSearch/FundingResultsBreadcrumb";
import { LoadingFieldStatus } from "../../components/LoadingFieldStatus";
import { LoadingStatus } from "../../components/LoadingStatus";
import { Main } from "../../components/Main";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { PermissionStatus } from "../../components/PermissionStatus";
import { Title } from "../../components/Title";
import { useSpecificationPermissions } from "../../hooks/Permissions/useSpecificationPermissions";
import { useConfirmLeavePage } from "../../hooks/useConfirmLeavePage";
import { useErrors } from "../../hooks/useErrors";
import { useFundingConfiguration } from "../../hooks/useFundingConfiguration";
import { useFindSpecificationsWithResults } from "../../hooks/useFundingLinePublishedProviderDetails";
import { useSpecificationSummary } from "../../hooks/useSpecificationSummary";
import { applyCustomProfile } from "../../services/publishedProviderFundingLineService";
import { ProfileTotal } from "../../types/FundingLineProfile";
import { Permission } from "../../types/Permission";
import {
  ApplyCustomProfileRequest,
  ProfilePeriodType,
} from "../../types/PublishedProvider/ApplyCustomProfileRequest";
import { FundingLineProfile } from "../../types/PublishedProvider/FundingLineProfile";
import { FundingActionType } from "../../types/PublishedProvider/PublishedProviderFundingCount";
import { Section } from "../../types/Sections";

export interface ViewEditFundingLineProfileProps {
  actionType: Exclude<FundingActionType, FundingActionType.Refresh>;
  editMode?: string;
  providerId: string;
  specificationId: string;
  fundingLineId: string;
  specCoreProviderVersionId: string;
}

export function ViewEditFundingLineProfile({ match }: RouteComponentProps<ViewEditFundingLineProfileProps>) {
  const {
    actionType,
    specificationId,
    fundingLineId,
    providerId,
    specCoreProviderVersionId: providerVersionId,
  } = match.params;

  const { specification, isLoadingSpecification } = useSpecificationSummary(specificationId, (err) =>
    addError({ error: err, description: "Error while loading specification" })
  );

  const fundingStreamId = specification && specification.fundingStreams[0]?.id;
  const fundingPeriodId = specification && specification.fundingPeriod?.id;
  const [hasAcknowledgedHistoricEdit, setHasAcknowledgedHistoricEdit] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<ProfileEditMode>(ProfileEditMode.View);

  const history = useHistory();

  const [fundingLineProfile, setFundingLineProfile] = useState<FundingLineProfile>({
    fundingLineCode: "",
    fundingLineName: "",
    ukprn: "",
    amountAlreadyPaid: 0,
    carryOverAmount: null,
    providerName: "",
    profilePatternKey: "",
    profilePatternName: "",
    profilePatternDescription: "",
    isCustomProfile: false,
    lastUpdatedUser: { id: "", name: "" },
    profileTotals: [],
  });
  const [editedFundingLineProfile, setEditedFundingLineProfile] = useState<FundingLineProfile>({
    fundingLineCode: "",
    fundingLineName: "",
    ukprn: "",
    amountAlreadyPaid: 0,
    carryOverAmount: null,
    providerName: "",
    profilePatternKey: "",
    profilePatternName: "",
    profilePatternDescription: "",
    isCustomProfile: false,
    lastUpdatedUser: { id: "", name: "" },
    profileTotals: [],
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [pageTitle, setPageTitle] = useState<string>();
  const [canEditCustomProfile, setCanEditCustomProfile] = useState<boolean>(false);
  const [canChangeToRuleBasedProfile, setCanChangeToRuleBasedProfile] = useState<boolean>(false);
  const [isContractedProvider, setIsContractedProvider] = useState<boolean>(false);
  const providerFundingOverviewUrl = ProviderFundingOverviewUri({
    actionType: actionType,
    specificationId: specificationId,
    providerId: providerId,
    specCoreProviderVersionId: providerVersionId,
    fundingStreamId: fundingStreamId as string,
    fundingPeriodId: fundingPeriodId as string,
  });

  const { isLoadingFundingLineProfile, refetchFundingLineProfile } = useFindSpecificationsWithResults({
    specificationId,
    providerId,
    fundingLineCode: fundingLineId,
    fundingStreamId,
    fundingPeriodId,
    options: {
      onSuccess: (profile) => {
        profile.fundingLineProfile.profileTotals.forEach(
          (p) =>
            (p.profileRemainingPercentage =
              editMode === ProfileEditMode.EditAll ? p.profilePercentage : p.profileRemainingPercentage)
        );
        setFundingLineProfile(profile.fundingLineProfile);
        setEditedFundingLineProfile(profile.fundingLineProfile);
        setCanEditCustomProfile(profile.enableUserEditableCustomProfiles);
        setCanChangeToRuleBasedProfile(
          actionType === FundingActionType.Approve && profile.enableUserEditableRuleBasedProfiles
        );
        setIsContractedProvider(profile.contractedProvider);
      },
    },
  });

  useEffect(() => {
    if (actionType === FundingActionType.Approve && match.params.editMode === "edit") {
      if (editMode !== ProfileEditMode.EditUnpaid) {
        setEditMode(ProfileEditMode.EditUnpaid);
        setEditMode(ProfileEditMode.EditUnpaid);
        refetchFundingLineProfile();
      }
    } else {
      if (editMode !== ProfileEditMode.View) {
        setEditMode(ProfileEditMode.View);
        setEditMode(ProfileEditMode.View);
        refetchFundingLineProfile();
      }
    }
  }, [match.params.editMode]);

  useEffect(() => {
    const title = `${editMode !== ProfileEditMode.View ? "Edit " : ""}Profile${
      fundingLineProfile ? " for " + fundingLineProfile.fundingLineName : ""
    }`;
    document.title = `${title} - Calculate funding`;
    setPageTitle(title);
  }, [editMode, fundingLineProfile]);

  const { missingPermissions, hasMissingPermissions, isPermissionsFetched } = useSpecificationPermissions(
    match.params.specificationId,
    [Permission.CanApplyCustomProfilePattern]
  );
  useConfirmLeavePage(
    editMode !== ProfileEditMode.View && !isSaving && isDirty,
    "Are you sure you want to leave without saving your changes?"
  );

  const { errors, addError, clearErrorMessages, addValidationErrors } = useErrors();

  const { fundingConfiguration } = useFundingConfiguration(fundingStreamId, fundingPeriodId, (err) =>
    addError({ error: err, description: "Error while loading funding configuration" })
  );

  const isFormValid = (totalAllocationAmount: number, totalAllocationPercent: number) => {
    let isErrors = false;
    if (totalAllocationAmount > profilingAmount && !fundingConfiguration?.enableCarryForward) {
      addError({ error: "Total allocation greater than balance available", fieldName: "totalAllocation" });
      isErrors = true;
    }
    if (totalAllocationPercent > 100 && !fundingConfiguration?.enableCarryForward) {
      addError({ error: "Total must be less than or equal to 100", fieldName: "totalPercent" });
      isErrors = true;
    }
    return !isErrors;
  };

  const handleEditProfileClick = async () => {
    if (editMode === ProfileEditMode.View) {
      clearErrorMessages();
      history.push(`${providerFundingOverviewUrl}/FundingLine/${fundingLineId}/edit`);
    } else {
      if (editMode === ProfileEditMode.EditAll && !hasAcknowledgedHistoricEdit) {
        window.scrollTo(0, 0);
        addError({ error: "You must acknowledge", fieldName: "acknowledge" });
        return;
      }
      try {
        clearErrorMessages(["totalPercent", "totalAllocation"]);
        const totalProfilingAllocationAmount = calculateTotalProfilingAllocationAmount();
        const totalProfilingAllocationPercent = calculateProfilingTotalAllocationPercent();

        if (!isFormValid(totalProfilingAllocationAmount, totalProfilingAllocationPercent)) {
          window.scrollTo(0, 0);
          return;
        }

        setIsSaving(true);

        const carryForwardValue = calculateNewCarryForwardAmount(totalProfilingAllocationAmount);
        const request: ApplyCustomProfileRequest = {
          specificationId: specificationId as string,
          fundingStreamId: fundingStreamId as string,
          fundingPeriodId: fundingPeriodId as string,
          fundingLineCode: fundingLineId,
          providerId: providerId,
          customProfileName: `${providerId}-${fundingStreamId}-${fundingPeriodId}-${fundingLineId}`,
          carryOver: carryForwardValue > 0 ? carryForwardValue : null,
          profilePeriods: editedFundingLineProfile
            ? editedFundingLineProfile.profileTotals.map((pt) => ({
                type: pt.periodType as ProfilePeriodType,
                typeValue: pt.typeValue,
                year: pt.year,
                occurrence: pt.occurrence,
                profiledValue: pt.value,
                distributionPeriodId: pt.distributionPeriodId,
              }))
            : [],
        };

        await applyCustomProfile(request);

        await refetchFundingLineProfile();

        history.push(`${providerFundingOverviewUrl}/FundingLine/${fundingLineId}/view`);
      } catch (err: any) {
        window.scrollTo(0, 0);
        if (err.response.status === 400) {
          const errResponse = err.response.data;
          addValidationErrors({ validationErrors: errResponse, message: "Validation failed" });
        } else {
          addError({ error: err });
        }
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleCancelClick = () => {
    clearErrorMessages();
    history.push(`${providerFundingOverviewUrl}/FundingLine/${fundingLineId}/view`);
  };

  const handleChangeToRuleBasedProfileClick = () => {
    history.push(`${providerFundingOverviewUrl}/FundingLine/${fundingLineId}/edit/change-profile-type`);
  };

  const updateProfileTotal = (instalmentNumber: number, newProfileTotal: ProfileTotal) => {
    if (!editedFundingLineProfile) return;
    const cloneOfFundingLineProfile: FundingLineProfile = cloneDeep(editedFundingLineProfile);
    cloneOfFundingLineProfile.profileTotals = cloneOfFundingLineProfile.profileTotals.map(
      (profile) =>
        (profile.installmentNumber === instalmentNumber ? newProfileTotal : profile) as ProfileTotal
    );
    setEditedFundingLineProfile(cloneOfFundingLineProfile);
  };

  const calculateProfilingTotalAllocationPercent = (): number => {
    if (!editedFundingLineProfile || editedFundingLineProfile.profileTotals.length === 0) return 0;
    const totalPercentage = editedFundingLineProfile.profileTotals
      .filter(
        (p) =>
          p.profileRemainingPercentage !== undefined &&
          (editMode == ProfileEditMode.EditAll ? true : !p.isPaid)
      )
      .map((p) => p.profileRemainingPercentage)
      .reduce((a, c) => (a !== undefined && c !== undefined ? a + c : 0), 0);

    return toDecimal(totalPercentage || 0, 2);
  };

  const calculateTotalProfilingAllocationAmount = (): number => {
    if (!editedFundingLineProfile || editedFundingLineProfile.profileTotals.length === 0) return 0;
    const totalAllocation = editedFundingLineProfile.profileTotals
      .filter((p) => (editMode == ProfileEditMode.EditAll ? true : !p.isPaid))
      .map((p) => p.value)
      .reduce((a, c) => a + c, 0);

    return toDecimal(totalAllocation || 0, 2);
  };

  const calculateTotalPaidAndUnpaidAllocationAmount = (): number => {
    if (!editedFundingLineProfile || editedFundingLineProfile.profileTotals.length === 0) return 0;
    const totalAllocation = editedFundingLineProfile.profileTotals
      .map((p) => p.value)
      .reduce((a, c) => a + c, 0);

    return toDecimal(totalAllocation || 0, 2);
  };

  const calculateNewCarryForwardAmount = (totalUnpaidAllocationAmount: number): number => {
    return toDecimal(profilingAmount - totalUnpaidAllocationAmount || 0, 2);
  };

  const RowItem = (props: { id: string; title: string; children: any }) => {
    return (
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">
          <label id={`${props.id}-label`} htmlFor={props.id}>
            {props.title}
          </label>
        </dt>
        <dd className="govuk-summary-list__value" id={props.id} aria-labelledby={`${props.id}-label`}>
          {props.children}
        </dd>
      </div>
    );
  };

  const handleEditPaid = () => {
    if (isContractedProvider && !hasMissingPermissions) {
      setEditMode(ProfileEditMode.EditAll);
      refetchFundingLineProfile();
    }
  };

  const handleAcknowledgementOfHistoricEditing = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasAcknowledgedHistoricEdit(e.target.checked);
  };

  const remainingAmount =
    fundingLineProfile &&
    fundingLineProfile.remainingAmount !== undefined &&
    fundingLineProfile.remainingAmount !== null
      ? fundingLineProfile.remainingAmount
      : 0;
  const profilingAmount =
    editMode === ProfileEditMode.EditAll &&
    fundingLineProfile &&
    fundingLineProfile.fundingLineAmount !== undefined &&
    fundingLineProfile.fundingLineAmount !== null
      ? fundingLineProfile.fundingLineAmount
      : remainingAmount;
  const totalProfilingAllocationAmount = calculateTotalProfilingAllocationAmount();
  const totalProfilingAllocationPercent = calculateProfilingTotalAllocationPercent();
  const totalAllocationAmount = calculateTotalPaidAndUnpaidAllocationAmount();
  const newCarryForwardAmount = calculateNewCarryForwardAmount(totalProfilingAllocationAmount);

  return (
    <Main location={Section.FundingManagement}>
      <Breadcrumbs>
        <Breadcrumb name="Calculate funding" url="/" />
        <Breadcrumb name="Funding Management" url="/FundingManagement" />
        <FundingSelectionBreadcrumb actionType={actionType} />
        <FundingResultsBreadcrumb
          actionType={actionType}
          specificationId={specificationId}
          specificationName={specification?.name}
          fundingPeriodId={fundingPeriodId}
          fundingStreamId={fundingStreamId}
        />
        <Breadcrumb name={fundingLineProfile.providerName} url={providerFundingOverviewUrl} />
        <Breadcrumb name={pageTitle ?? "Funding Line Profile"} />
      </Breadcrumbs>
      <PermissionStatus requiredPermissions={missingPermissions} hidden={!isPermissionsFetched} />
      <MultipleErrorSummary errors={errors} />

      {isLoadingFundingLineProfile || isLoadingSpecification || isSaving ? (
        <LoadingStatus
          title={`${
            isLoadingFundingLineProfile || isLoadingSpecification ? "Loading" : "Saving"
          } funding line profile`}
        />
      ) : (
        <>
          <Title
            title={pageTitle ?? "Funding line profile"}
            preTitleCaption={`Funding line code: ${fundingLineProfile.fundingLineCode}`}
            titleCaption={fundingLineProfile.providerName}
          >
            <p className="govuk-body-s govuk-!-margin-top-3" data-testid="last-updated-by">
              {`Last updated by ${fundingLineProfile.lastUpdatedUser.name} on `}
              {fundingLineProfile.lastUpdatedDate && (
                <DateTimeFormatter date={fundingLineProfile.lastUpdatedDate} />
              )}
            </p>
          </Title>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
              <dl className="govuk-summary-list govuk-summary-list--no-border">
                <RowItem id={"ukprn"} title={"UKPRN"}>
                  {fundingLineProfile.ukprn}
                </RowItem>

                <RowItem id="total-allocation" title="Total allocation">
                  {fundingConfiguration?.enableCarryForward ? (
                    <FormattedNumber
                      value={fundingLineProfile.carryOverAmount || 0}
                      type={NumberType.FormattedMoney}
                    />
                  ) : (
                    <FormattedNumber
                      value={fundingLineProfile.fundingLineAmount || 0}
                      type={NumberType.FormattedMoney}
                    />
                  )}
                </RowItem>

                <RowItem id="amount-already-paid" title="Instalments processed value">
                  <FormattedNumber
                    value={fundingLineProfile.amountAlreadyPaid || 0}
                    type={NumberType.FormattedMoney}
                  />
                </RowItem>

                <RowItem id="remaining-amount" title="Balance available for profiling">
                  <FormattedNumber value={remainingAmount} type={NumberType.FormattedMoney} />
                </RowItem>
              </dl>
            </div>
            <div className="govuk-grid-column-one-third">
              {editMode === ProfileEditMode.EditUnpaid &&
                isContractedProvider &&
                editedFundingLineProfile.profileTotals.some((p) => p.isPaid) && (
                  <ul className="govuk-list right-align">
                    <li>
                      <button className="govuk-link govuk-link--no-visited-state" onClick={handleEditPaid}>
                        Edit historic instalments
                      </button>
                    </li>
                  </ul>
                )}
            </div>
          </div>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
              <table className="govuk-table govuk-!-margin-top-5" data-testid="data-table">
                <caption className="govuk-table__caption">Profiling instalments</caption>
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
                    <th scope="col" className="govuk-table__header">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  {editedFundingLineProfile.profileTotals
                    .sort((a, b) => a.installmentNumber - b.installmentNumber)
                    .map((p, i) => {
                      return (
                        <tr
                          className="govuk-table__row"
                          key={p.installmentNumber}
                          data-testid="profile-total"
                        >
                          <th scope="row" className="govuk-table__header">
                            {p.actualDate ? (
                              <DateTimeFormatter date={p.actualDate} />
                            ) : (
                              `${p.typeValue} ${p.year}`
                            )}
                          </th>
                          <td className="govuk-table__cell" data-testid={`paid-${i}`}>
                            {p.isPaid ? <strong className="govuk-tag">Processed</strong> : null}
                          </td>
                          <td className="govuk-table__cell" data-testid={`instalment-number-${i}`}>
                            {p.installmentNumber}
                          </td>
                          <EditableProfileTotal
                            index={i}
                            profileTotal={p}
                            remainingAmount={profilingAmount || 0}
                            setProfileTotal={updateProfileTotal}
                            mode={editMode}
                            setIsDirty={setIsDirty}
                            errors={errors}
                            addError={addError}
                            clearErrorMessages={clearErrorMessages}
                          />
                        </tr>
                      );
                    })}
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header">
                      To be carried forward
                    </th>
                    <td className="govuk-table__cell"></td>
                    <td className="govuk-table__cell"></td>
                    <td className="govuk-table__cell"></td>
                    <td className="govuk-table__cell">
                      <strong data-testid="balance-carried-forward">
                        <FormattedNumber value={newCarryForwardAmount} type={NumberType.FormattedMoney} />
                      </strong>
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header">
                      Total allocation
                    </th>
                    <td className="govuk-table__cell"></td>
                    <td className="govuk-table__cell"></td>
                    <td className="govuk-table__cell" id="totalPercent">
                      <div
                        className={`govuk-form-group ${
                          errors.filter((e) => e.fieldName === "totalPercent").length > 0
                            ? "govuk-form-group--error"
                            : ""
                        }`}
                      >
                        {errors.filter((e) => e.fieldName === "totalPercent").length > 0
                          ? errors.map(
                              (error) =>
                                error.fieldName === "totalPercent" && (
                                  <span
                                    key={error.id}
                                    className="govuk-error-message govuk-!-margin-bottom-1"
                                  >
                                    <span className="govuk-visually-hidden">Error:</span> {error.message}
                                  </span>
                                )
                            )
                          : null}
                        <strong data-testid="total-allocation-percent">
                          <FormattedNumber
                            value={totalProfilingAllocationPercent}
                            type={NumberType.FormattedPercentage}
                            decimalPlaces={totalProfilingAllocationPercent === 100 ? 0 : 2}
                          />
                        </strong>
                      </div>
                    </td>
                    <td className="govuk-table__cell" id="totalAllocation">
                      <div
                        className={`govuk-form-group ${
                          errors.filter((e) => e.fieldName === "totalAllocation").length > 0
                            ? "govuk-form-group--error"
                            : ""
                        }`}
                      >
                        {errors.filter((e) => e.fieldName === "totalAllocation").length > 0
                          ? errors.map(
                              (error) =>
                                error.fieldName === "totalAllocation" && (
                                  <span
                                    key={error.id}
                                    className="govuk-error-message govuk-!-margin-bottom-1"
                                  >
                                    <span className="govuk-visually-hidden">Error:</span> {error.message}
                                  </span>
                                )
                            )
                          : null}
                        <strong data-testid="total-allocation-amount">
                          <FormattedNumber value={totalAllocationAmount} type={NumberType.FormattedMoney} />
                        </strong>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {editMode === ProfileEditMode.EditAll &&
            editedFundingLineProfile.profileTotals.some((p) => p.isPaid) && (
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                  <div
                    className={`govuk-form-group ${
                      errors.filter((e) => e.fieldName === "acknowledge").length > 0
                        ? "govuk-form-group--error"
                        : ""
                    }`}
                  >
                    {errors.filter((e) => e.fieldName === "acknowledge").length > 0
                      ? errors.map(
                          (error) =>
                            error.fieldName === "acknowledge" && (
                              <span key={error.id} className="govuk-error-message govuk-!-margin-bottom-1">
                                <span className="govuk-visually-hidden">Error:</span> {error.message}
                              </span>
                            )
                        )
                      : null}
                    <fieldset className="govuk-fieldset" aria-describedby="acknowledgementCheckbox">
                      <legend className="govuk-fieldset__legend">
                        <div className="govuk-warning-text">
                          <span className="govuk-warning-text__icon" aria-hidden="true">
                            !
                          </span>
                          <strong className="govuk-warning-text__text" role="alert">
                            <span className="govuk-warning-text__assistive">Warning</span>
                            You are editing historic instalments
                          </strong>
                        </div>
                      </legend>
                      <div className="govuk-checkboxes">
                        <div className="govuk-checkboxes__item">
                          <input
                            className="govuk-checkboxes__input"
                            id="acknowledgementCheckbox"
                            name="acknowledgementCheckbox"
                            type="checkbox"
                            onChange={handleAcknowledgementOfHistoricEditing}
                            checked={hasAcknowledgedHistoricEdit}
                          />
                          <label
                            className="govuk-label govuk-checkboxes__label"
                            htmlFor="acknowledgementCheckbox"
                          >
                            I acknowledge that I am editing historic instalments and wish to continue
                          </label>
                        </div>
                      </div>
                    </fieldset>
                  </div>
                </div>
              </div>
            )}
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <button
                className="govuk-button govuk-!-margin-right-1"
                disabled={
                  hasMissingPermissions || !canEditCustomProfile || actionType === FundingActionType.Release
                }
                onClick={handleEditProfileClick}
              >
                {editMode !== ProfileEditMode.View ? "Apply profile" : "Edit profile"}
              </button>
              {editMode !== ProfileEditMode.View && (
                <button
                  className="govuk-button govuk-button--secondary govuk-!-margin-right-1"
                  onClick={handleCancelClick}
                  data-testid="cancel-btn"
                >
                  Cancel
                </button>
              )}
              {canChangeToRuleBasedProfile && (
                <button className="govuk-button" onClick={handleChangeToRuleBasedProfileClick}>
                  Change to rule based profile
                </button>
              )}
            </div>
          </div>
          <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              {!!fundingStreamId && !!fundingPeriodId ? (
                <ProfileHistoryPanel
                  specificationId={specificationId}
                  providerId={providerId}
                  providerVersionId={providerVersionId}
                  fundingStreamId={fundingStreamId}
                  fundingPeriodId={fundingPeriodId}
                  fundingLineCode={fundingLineId}
                />
              ) : (
                <LoadingFieldStatus title="Loading..." />
              )}
              <BackLink to={providerFundingOverviewUrl} />
            </div>
          </div>
        </>
      )}
    </Main>
  );
}
