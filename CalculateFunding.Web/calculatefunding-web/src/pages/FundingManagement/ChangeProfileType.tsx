import { AxiosError } from "axios";
import { FundingSelectionBreadcrumb } from "components/Funding/FundingSelectionBreadcrumb";
import { ProviderFundingOverviewUri } from "components/Funding/ProviderFundingOverviewLink";
import { FundingResultsBreadcrumb } from "components/Funding/ProviderFundingSearch/FundingResultsBreadcrumb";
import { useAllProfilePatterns } from "hooks/FundingApproval/useAllProfilePatterns";
import { useSpecificationSummary } from "hooks/useSpecificationSummary";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RouteComponentProps, useHistory } from "react-router";
import { FundingActionType } from "types/PublishedProvider/PublishedProviderFundingCount";

import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { PreviewProfileModal } from "../../components/Funding/PreviewProfileModal";
import { LoadingStatus } from "../../components/LoadingStatus";
import { Main } from "../../components/Main";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { PermissionStatus } from "../../components/PermissionStatus";
import { useProviderVersion } from "../../hooks/Providers/useProviderVersion";
import { useErrors } from "../../hooks/useErrors";
import { useFindSpecificationsWithResults } from "../../hooks/useFundingLinePublishedProviderDetails";
import { IStoreState } from "../../reducers/rootReducer";
import { assignProfilePatternKeyToPublishedProvider } from "../../services/profilingService";
import { FundingStreamPermissions } from "../../types/FundingStreamPermissions";
import { FundingStreamPeriodProfilePattern } from "../../types/ProviderProfileTotalsForStreamAndPeriod";
import { Section } from "../../types/Sections";

export interface ChangeProfileTypeProps {
  providerId: string;
  fundingStreamId: string;
  fundingPeriodId: string;
  specificationId: string;
  fundingLineId: string;
  providerVersionId: string;
  actionType: Exclude<FundingActionType, FundingActionType.Refresh>;
}

enum PatternType {
  National = "National",
  RuleBased = "RuleBased",
  Custom = "Custom",
}

export function ChangeProfileType({ match }: RouteComponentProps<ChangeProfileTypeProps>) {
  const { specificationId, fundingLineId, providerId, providerVersionId, actionType } = match.params;
  const permissions: FundingStreamPermissions[] = useSelector(
    (state: IStoreState) => state.userState.fundingStreamPermissions
  );
  const { errors, addError, clearErrorMessages } = useErrors();

  const history = useHistory();

  const { specification, isLoadingSpecification } = useSpecificationSummary(specificationId, (err) =>
    addError({ error: err, description: "Error while loading specification" })
  );

  const fundingStreamId = specification && specification.fundingStreams[0]?.id;
  const fundingPeriodId = specification && specification.fundingPeriod?.id;

  const { profilePatterns, isLoadingProfilePatterns } = useAllProfilePatterns(
    fundingStreamId as string,
    fundingPeriodId as string,
    (err) => addError({ error: err, description: "Error while loading profile patterns" })
  );

  const { providerVersion, isFetchingProviderVersion } = useProviderVersion(
    providerId,
    providerVersionId,
    (err: AxiosError) => addError({ error: err, description: "Error while loading provider" }),
    {
      onSettled: (data) => {
        if (data?.providerId !== providerId) {
          addError({ error: "Provider version could not be found" });
        }
        if (!data?.name?.length) {
          addError({ error: "Provider version name could not be found" });
        }
      },
    }
  );

  const { fundingLineProfile, isLoadingFundingLineProfile } = useFindSpecificationsWithResults({
    specificationId,
    providerId,
    fundingLineCode: fundingLineId,
    fundingStreamId,
    fundingPeriodId,
    options: {
      onError: (err) => addError({ error: err, description: "Error while loading funding line profile" }),
    },
  });

  const [canChangeProfileType, setCanChangeProfileType] = useState<boolean>(false);
  const [missingPermissions, setMissingPermissions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [profilePatternKey, setProfilePatternKey] = useState<string | null | undefined>();
  const [patternType, setPatternType] = useState<PatternType | undefined>();
  const [ruleBasedPatternKey, setRuleBasedPatternKey] = useState<string | undefined>(undefined);
  const [validated, setValidated] = useState<boolean>(false);
  const [missingData, setMissingData] = useState<boolean>(false);
  const [nationalPattern, setNationalPattern] = useState<FundingStreamPeriodProfilePattern | undefined>(
    undefined
  );
  const [showModal, setShowModal] = useState<boolean>(false);
  const [noRuleBasedPatterns, setNoRuleBasedPatterns] = useState<boolean>(false);
  const [previewProfilePatternKey, setPreviewProfilePatternKey] = useState<string | null | undefined>();
  const providerFundingOverviewUrl = ProviderFundingOverviewUri({
    actionType: actionType,
    specificationId: specificationId,
    providerId: providerId,
    specCoreProviderVersionId: providerVersionId,
    fundingStreamId: fundingStreamId as string,
    fundingPeriodId: fundingPeriodId as string,
  });

  const isPageLoading =
    isLoadingProfilePatterns ||
    isFetchingProviderVersion ||
    isLoadingFundingLineProfile ||
    isLoadingSpecification;
  const providerName = providerVersion && providerVersion.name ? providerVersion.name : "Unknown provider";
  const fundingLineName =
    fundingLineProfile && fundingLineProfile.fundingLineProfile.fundingLineName
      ? fundingLineProfile.fundingLineProfile.fundingLineName
      : "Unknown funding line name";

  const redirectToFundingLineProfile = () => {
    history.push(
      `/FundingManagement/${actionType}/Provider/${providerId}/Specification/${specificationId}/Version/${providerVersionId}/FundingLine/${fundingLineId}/edit`
    );
  };

  const isValidForm = () => {
    setValidated(true);
    if (!patternType) {
      addError({ error: "No pattern type selected" });
      return false;
    }
    if (patternType === PatternType.RuleBased && (!profilePatternKey || profilePatternKey.length === 0)) {
      addError({ error: "A rule based pattern must be selected" });
      return false;
    }
    return true;
  };

  const handleApplyClick = async () => {
    try {
      clearErrorMessages();
      if (!isValidForm() || profilePatternKey === undefined) return;
      setIsSaving(true);
      await assignProfilePatternKeyToPublishedProvider(
        fundingStreamId as string,
        fundingPeriodId as string,
        providerId,
        fundingLineId,
        profilePatternKey
      );
      redirectToFundingLineProfile();
    } catch (error: any) {
      if (error.response.status === 304) {
        redirectToFundingLineProfile();
      } else {
        addError({ error: error.message });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelClick = () => {
    redirectToFundingLineProfile();
  };

  const handleProfilePatternSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value as PatternType;
    setPatternType(newValue);
    setRuleBasedPatternKey(undefined);
    if (newValue === PatternType.National) {
      setProfilePatternKey(null);
    }
    setValidated(false);
  };

  const handleRuleBasedPatternChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setRuleBasedPatternKey(newValue);
    setProfilePatternKey(newValue);
  };

  const handlePreviewProfile = (key: string | null) => {
    clearErrorMessages(["preview-profile"]);
    setPreviewProfilePatternKey(key);
  };

  const nationalPatterns: FundingStreamPeriodProfilePattern[] =
    profilePatterns?.filter((pp) => pp.fundingLineId === fundingLineId && pp.profilePatternKey === null) ??
    [];

  useEffect(() => {
    if (nationalPatterns.length === 1) {
      setNationalPattern(nationalPatterns[0]);
      return;
    }
    if (nationalPatterns.length > 1) {
      addError({ error: "More than one national profile found for this funding line." });
      setMissingData(true);
    }
  }, [nationalPatterns]);

  const nationalPatternName = () => {
    return nationalPattern && nationalPattern.profilePatternDisplayName !== null
      ? nationalPattern.profilePatternDisplayName
      : "National";
  };

  const nationalPatternDescription = () => {
    return nationalPattern && nationalPattern.profilePatternDescription !== null
      ? nationalPattern.profilePatternDescription
      : "";
  };

  const ruleBasedPatterns: FundingStreamPeriodProfilePattern[] =
    profilePatterns?.filter((pp) => pp.fundingLineId === fundingLineId && pp.profilePatternKey !== null) ??
    [];

  useEffect(() => {
    if (ruleBasedPatterns.length > 0) {
      return;
    }
    setNoRuleBasedPatterns(true);
    setMissingData(true);
  }, [ruleBasedPatterns]);

  useEffect(() => {
    setMissingPermissions([]);
    const fundingStreamPermission = permissions.find((p) => p.fundingStreamId === fundingStreamId);
    if (!fundingStreamPermission || !fundingStreamPermission.canApplyCustomProfilePattern) {
      setMissingPermissions(["apply custom profile pattern"]);
    } else {
      setCanChangeProfileType(true);
    }
  }, [permissions]);

  useEffect(() => {
    if (!fundingLineProfile || fundingLineProfile.fundingLineProfile.profilePatternKey === undefined) return;
    if (fundingLineProfile.fundingLineProfile.isCustomProfile) {
      setPatternType(PatternType.Custom);
    } else {
      if (fundingLineProfile.fundingLineProfile.profilePatternKey === null) {
        setPatternType(PatternType.National);
      } else {
        setPatternType(PatternType.RuleBased);
        setRuleBasedPatternKey(fundingLineProfile.fundingLineProfile.profilePatternKey);
      }
    }
    setProfilePatternKey(fundingLineProfile.fundingLineProfile.profilePatternKey);
  }, [fundingLineProfile]);

  useEffect(() => {
    if (previewProfilePatternKey !== undefined) {
      setShowModal(true);
    }
  }, [previewProfilePatternKey]);

  useEffect(() => {
    clearErrorMessages();

    if (!fundingStreamId?.length) {
      addError({ error: "Undefined funding stream id" });
    }
    if (!fundingPeriodId?.length) {
      addError({ error: "Undefined funding period id" });
    }
    if (!providerId?.length) {
      addError({ error: "Undefined provider id" });
    }
    if (!providerVersionId?.length) {
      addError({ error: "Undefined provider version id" });
    }
    if (!fundingLineId?.length) {
      addError({ error: "Undefined funding line id" });
    }
  }, [fundingStreamId, providerId, providerVersionId, fundingLineId, fundingPeriodId]);

  return (
    <Main location={Section.FundingManagement}>
      <Breadcrumbs>
        <Breadcrumb name="Home" url="/" />
        <Breadcrumb name="Funding Management" url="/FundingManagement" />
        <FundingSelectionBreadcrumb actionType={actionType} />
        <FundingResultsBreadcrumb
          actionType={actionType}
          specificationId={specificationId}
          specificationName={specification?.name}
          fundingPeriodId={fundingPeriodId}
          fundingStreamId={fundingStreamId}
        />
        <Breadcrumb name={providerName ?? "Provider"} url={providerFundingOverviewUrl} />
        <Breadcrumb name="Change profile type" />
      </Breadcrumbs>
      <PermissionStatus requiredPermissions={missingPermissions} hidden={isPageLoading} />
      <MultipleErrorSummary errors={errors} />
      {isPageLoading || isSaving ? (
        <LoadingStatus title={`${isPageLoading ? "Loading profile patterns" : "Saving profile pattern"}`} />
      ) : (
        <>
          <div className="govuk-grid-row govuk-!-margin-bottom-5 govuk-!-margin-top-5">
            <div className="govuk-grid-column-two-thirds">
              <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">Change profile type</h1>
            </div>
            {noRuleBasedPatterns && (
              <div className="govuk-inset-text">
                {`No rule based patterns are available. ${fundingLineName} is using the national pattern.`}
              </div>
            )}
          </div>
          <div className="govuk-form-group">
            <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
              <h4 className="govuk-heading-s">Select pattern type</h4>
            </legend>
            <span id="rule-based-hint" className="govuk-hint">
              Select one option.
            </span>
            <div className="govuk-radios govuk-radios--conditional" data-module="govuk-radios">
              {nationalPattern && (
                <div className="govuk-radios__item">
                  <input
                    className="govuk-radios__input"
                    name="national"
                    type="radio"
                    data-aria-controls="national-pattern"
                    value={PatternType.National}
                    checked={patternType === PatternType.National}
                    onChange={handleProfilePatternSelected}
                    aria-labelledby="national-type"
                  />
                  <label className="govuk-label govuk-radios__label" htmlFor="national" id="national-type">
                    {nationalPatternName()}
                    <span className="govuk-hint">{nationalPatternDescription()}</span>
                    <button className="govuk-link" onClick={() => handlePreviewProfile(null)}>
                      Preview profile
                    </button>
                  </label>
                </div>
              )}
              <div className="govuk-form-group">
                <fieldset className="govuk-fieldset" aria-describedby="rule-based-hint">
                  <div className="govuk-radios govuk-radios--conditional" data-module="govuk-radios">
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        name="rule-based"
                        type="radio"
                        aria-controls="rule-based-pattern"
                        aria-expanded={patternType === PatternType.RuleBased}
                        value={PatternType.RuleBased}
                        checked={patternType === PatternType.RuleBased}
                        onChange={handleProfilePatternSelected}
                        aria-labelledby="rule-based-type"
                        disabled={noRuleBasedPatterns}
                      />
                      <label
                        className="govuk-label govuk-radios__label"
                        htmlFor="rule-based"
                        id="rule-based-type"
                      >
                        Rule based
                      </label>
                    </div>
                    <div className="govuk-radios__conditional" hidden={patternType !== PatternType.RuleBased}>
                      <div
                        className={`govuk-form-group ${
                          validated && !ruleBasedPatternKey ? "govuk-form-group--error" : ""
                        }`}
                      >
                        <fieldset className="govuk-fieldset">
                          <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                            <h4 className="govuk-heading-s">Select rule based pattern</h4>
                          </legend>
                          {validated && !ruleBasedPatternKey && (
                            <span className="govuk-error-message">
                              <span className="govuk-visually-hidden">Error:</span>A rule based pattern must
                              be selected
                            </span>
                          )}
                          <div className="govuk-radios govuk-radios--small">
                            {ruleBasedPatterns.map((rbp) => {
                              const patternKey = rbp.profilePatternKey;
                              if (patternKey === undefined || patternKey === null) return <></>;
                              return (
                                <div className="govuk-radios__item" key={rbp.id}>
                                  <input
                                    className="govuk-radios__input"
                                    name={rbp.id}
                                    type="radio"
                                    value={patternKey}
                                    checked={ruleBasedPatternKey === patternKey}
                                    onChange={handleRuleBasedPatternChange}
                                    aria-labelledby={`${rbp.id}-rule-based-label`}
                                  />
                                  <label
                                    className="govuk-label govuk-radios__label"
                                    htmlFor={rbp.id}
                                    id={`${rbp.id}-rule-based-label`}
                                  >
                                    {rbp.profilePatternDisplayName && rbp.profilePatternDisplayName !== null
                                      ? rbp.profilePatternDisplayName
                                      : "Unknown name"}
                                    <span className="govuk-hint">
                                      {rbp.profilePatternDescription && rbp.profilePatternDescription !== null
                                        ? rbp.profilePatternDescription
                                        : "Unknown description"}
                                    </span>
                                    <button
                                      className="govuk-link"
                                      onClick={() => handlePreviewProfile(patternKey)}
                                    >
                                      Preview profile
                                    </button>
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        </fieldset>
                      </div>
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>
          </div>
          <div>
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-two-thirds">
                <button
                  className="govuk-button govuk-!-margin-right-1"
                  onClick={handleApplyClick}
                  disabled={!canChangeProfileType || isSaving || missingData}
                >
                  Apply
                </button>
                <button className="govuk-button govuk-button--secondary" onClick={handleCancelClick}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {previewProfilePatternKey !== undefined && (
        <PreviewProfileModal
          specificationId={specificationId}
          fundingStreamId={fundingStreamId as string}
          fundingPeriodId={fundingPeriodId as string}
          providerId={providerId}
          fundingLineId={fundingLineId}
          previewProfilePatternKey={previewProfilePatternKey}
          addError={addError}
          showModal={showModal}
          toggleModal={setShowModal}
          setPreviewProfilePatternKey={setPreviewProfilePatternKey}
        />
      )}
    </Main>
  );
}
