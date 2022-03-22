import { AxiosError } from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import { RouteComponentProps, useHistory } from "react-router";

import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { PreviewProfileModal } from "../../components/Funding/PreviewProfileModal";
import { LoadingStatus } from "../../components/LoadingStatus";
import { Main } from "../../components/Main";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { PermissionStatus } from "../../components/PermissionStatus";
import { useProviderVersion } from "../../hooks/Providers/useProviderVersion";
import { useErrors } from "../../hooks/useErrors";
import { IStoreState } from "../../reducers/rootReducer";
import {
  assignProfilePatternKeyToPublishedProvider,
  getAllProfilePatterns,
} from "../../services/profilingService";
import { getFundingLinePublishedProviderDetails } from "../../services/publishedProviderFundingLineService";
import { FundingStreamPermissions } from "../../types/FundingStreamPermissions";
import { FundingStreamPeriodProfilePattern } from "../../types/ProviderProfileTotalsForStreamAndPeriod";
import { FundingLineProfileViewModel } from "../../types/PublishedProvider/FundingLineProfile";
import { Section } from "../../types/Sections";

export interface ChangeProfileTypePropsOld {
  providerId: string;
  fundingStreamId: string;
  fundingPeriodId: string;
  specificationId: string;
  fundingLineId: string;
  specCoreProviderVersionId: string;
}

enum PatternType {
  National = "National",
  RuleBased = "RuleBased",
  Custom = "Custom",
}

export function ChangeProfileTypeOld({ match }: RouteComponentProps<ChangeProfileTypePropsOld>) {
  const {
    fundingStreamId,
    fundingPeriodId,
    specificationId,
    fundingLineId,
    providerId,
    specCoreProviderVersionId: providerVersionId,
  } = match.params;
  const permissions: FundingStreamPermissions[] = useSelector(
    (state: IStoreState) => state.userState.fundingStreamPermissions
  );
  const { errors, addError, clearErrorMessages } = useErrors();

  const history = useHistory();

  const { data: profilePatterns, isFetching: isFetchingProfilePatterns } = useQuery<
    FundingStreamPeriodProfilePattern[],
    AxiosError
  >(
    `profile-patterns-${fundingStreamId}-${fundingPeriodId}`,
    async () => (await getAllProfilePatterns(fundingStreamId, fundingPeriodId)).data,
    {
      onError: (err) => addError({ error: err, description: "Error while loading profile patterns" }),
      refetchOnWindowFocus: false,
    }
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

  const { data: fundingLineProfileViewModel, isFetching: isFetchingFundingLineProfile } = useQuery<
    FundingLineProfileViewModel,
    AxiosError
  >(
    `provider-profiling-pattern-for-spec-${specificationId}-provider-${providerId}-stream-${fundingStreamId}-period-${fundingPeriodId}`,
    async () =>
      (
        await getFundingLinePublishedProviderDetails(
          specificationId,
          providerId,
          fundingStreamId,
          fundingLineId,
          fundingPeriodId
        )
      ).data,
    {
      onError: (err) => addError({ error: err, description: "Error while loading funding line profile" }),
      refetchOnWindowFocus: false,
    }
  );

  const fundingLineProfile = fundingLineProfileViewModel
    ? fundingLineProfileViewModel.fundingLineProfile
    : undefined;

  const [canChangeProfileType, setCanChangeProfileType] = useState<boolean>(false);
  const [missingPermissions, setMissingPermissions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [profilePatternKey, setProfilePatternKey] = useState<string | null | undefined>();
  const [patternType, setPatternType] = useState<PatternType | undefined>();
  const [ruleBasedPatternKey, setRuleBasedPatternKey] = useState<string | undefined>(undefined);
  const [validated, setValidated] = useState<boolean>(false);
  const [missingData, setMissingData] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [noRuleBasedPatterns, setNoRuleBasedPatterns] = useState<boolean>(false);
  const [previewProfilePatternKey, setPreviewProfilePatternKey] = useState<string | null | undefined>();

  const isPageLoading =
    isFetchingProfilePatterns || isFetchingProviderVersion || isFetchingFundingLineProfile;
  const providerName = providerVersion && providerVersion.name ? providerVersion.name : "Unknown provider";
  const fundingLineName =
    fundingLineProfile && fundingLineProfile.fundingLineName
      ? fundingLineProfile.fundingLineName
      : "Unknown funding line name";

  const redirectToFundingLineProfile = () => {
    history.push(
      `/Approvals/ProviderFundingOverview/${specificationId}/${providerId}/${providerVersionId}/${fundingStreamId}/${fundingPeriodId}/${fundingLineId}/edit`
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
        fundingStreamId,
        fundingPeriodId,
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

  const getNationalPattern: FundingStreamPeriodProfilePattern | undefined = useMemo(() => {
    if (!profilePatterns) return undefined;
    const nationalPattern = profilePatterns.filter(
      (pp) => pp.fundingLineId === fundingLineId && pp.profilePatternKey === null
    );
    if (nationalPattern.length === 1) {
      return nationalPattern[0];
    }
    if (nationalPattern.length > 1) {
      addError({ error: "More than one national profile found for this funding line." });
      setMissingData(true);
    }
    return undefined;
  }, [profilePatterns]);

  const getNationalPatternName = () => {
    return getNationalPattern && getNationalPattern.profilePatternDisplayName !== null
      ? getNationalPattern.profilePatternDisplayName
      : "National";
  };

  const getNationalPatternDescription = () => {
    return getNationalPattern && getNationalPattern.profilePatternDescription !== null
      ? getNationalPattern.profilePatternDescription
      : "";
  };

  const getRuleBasedPatterns: FundingStreamPeriodProfilePattern[] = useMemo(() => {
    if (!profilePatterns) return [];
    const ruleBasedPatterns = profilePatterns.filter(
      (pp) => pp.fundingLineId === fundingLineId && pp.profilePatternKey !== null
    );
    if (ruleBasedPatterns.length > 0) {
      return ruleBasedPatterns;
    }
    setNoRuleBasedPatterns(true);
    setMissingData(true);
    return [];
  }, [profilePatterns]);

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
    if (!fundingLineProfile || fundingLineProfile.profilePatternKey === undefined) return;
    if (fundingLineProfile.isCustomProfile) {
      setPatternType(PatternType.Custom);
    } else {
      if (fundingLineProfile.profilePatternKey === null) {
        setPatternType(PatternType.National);
      } else {
        setPatternType(PatternType.RuleBased);
        setRuleBasedPatternKey(fundingLineProfile.profilePatternKey);
      }
    }
    setProfilePatternKey(fundingLineProfile.profilePatternKey);
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
        <Breadcrumb name="Calculate funding" url={"/"} />
        <Breadcrumb name="Approvals" />
        <Breadcrumb name="Select specification" url={"/Approvals/Select"} />
        <Breadcrumb
          name={"Funding approval results"}
          url={`/Approvals/SpecificationFundingApproval/${fundingStreamId}/${fundingPeriodId}/${specificationId}`}
        />
        <Breadcrumb
          name={providerName}
          url={`/Approvals/ProviderFundingOverview/${specificationId}/${providerId}/${providerVersionId}/${fundingStreamId}/${fundingPeriodId}`}
        />
        <Breadcrumb
          name={fundingLineName}
          url={`/Approvals/ProviderFundingOverview/${specificationId}/${providerId}/${providerVersionId}/${fundingStreamId}/${fundingPeriodId}/${fundingLineId}/view`}
        />
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
              {getNationalPattern && (
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
                    {getNationalPatternName()}
                    <span className="govuk-hint">{getNationalPatternDescription()}</span>
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
                            {getRuleBasedPatterns.map((rbp) => {
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
          fundingStreamId={fundingStreamId}
          fundingPeriodId={fundingPeriodId}
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
