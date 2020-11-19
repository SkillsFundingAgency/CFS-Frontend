import React, {useEffect, useMemo, useState} from "react";
import {useSelector} from "react-redux";
import {RouteComponentProps, useHistory} from "react-router";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {Footer} from "../../components/Footer";
import {Header} from "../../components/Header";
import {LoadingStatus} from "../../components/LoadingStatus";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {PermissionStatus} from "../../components/PermissionStatus";
import {IStoreState} from "../../reducers/rootReducer";
import {FundingStreamPermissions} from "../../types/FundingStreamPermissions";
import {Section} from "../../types/Sections";
import {PreviewProfileModal} from "../../components/Funding/PreviewProfileModal";
import {useErrors} from "../../hooks/useErrors";
import {useQuery} from "react-query";
import {assignProfilePatternKeyToPublishedProvider, getAllProfilePatterns} from "../../services/profilingService";
import {FundingStreamPeriodProfilePattern} from "../../types/ProviderProfileTotalsForStreamAndPeriod";
import {AxiosError} from "axios";
import {FundingLineProfile} from "../../types/FundingLineProfile";
import {getFundingLinePublishedProviderDetails} from "../../services/fundingLineDetailsService";
import {useProviderVersion} from "../../hooks/Providers/useProviderVersion";

export interface ChangeProfileTypeProps {
    providerId: string;
    fundingStreamId: string;
    fundingPeriodId: string;
    specificationId: string;
    fundingLineId: string;
    providerVersionId: string;
}

enum PatternType {
    National = "National",
    RuleBased = "RuleBased"
}

export function ChangeProfileType({match}: RouteComponentProps<ChangeProfileTypeProps>) {
    const permissions: FundingStreamPermissions[] = useSelector((state: IStoreState) => state.userState.fundingStreamPermissions);
    const {errors, addErrorMessage, clearErrorMessages} = useErrors();
    const fundingStreamId = match.params.fundingStreamId;
    const fundingPeriodId = match.params.fundingPeriodId;
    const specificationId = match.params.specificationId;
    const fundingLineId = match.params.fundingLineId;
    const providerId = match.params.providerId;
    const providerVersionId = match.params.providerVersionId;

    let history = useHistory();

    const {data: profilePatterns, isFetching: isFetchingProfilePatterns} =
        useQuery<FundingStreamPeriodProfilePattern[], AxiosError>(`profile-patterns-${fundingStreamId}-${fundingPeriodId}`,
            async () => (await getAllProfilePatterns(fundingStreamId, fundingPeriodId)).data,
            {onError: err => addErrorMessage(err.message, "Error while loading profile patterns")});

    const {providerVersion, isFetchingProviderVersion} = useProviderVersion(providerId, providerVersionId,
        (err: AxiosError) => addErrorMessage(err.message, "Error while loading provider"));

    const {data: fundingLineProfile, isFetching: isFetchingFundingLineProfile} =
        useQuery<FundingLineProfile, AxiosError>(`provider-profiling-pattern-for-spec-${specificationId}-provider-${providerId}-stream-${fundingStreamId}`,
            async () => (await getFundingLinePublishedProviderDetails(specificationId, providerId, fundingStreamId, fundingLineId)).data,
            {onError: err => addErrorMessage(err.message, "Error while loading funding line profile")});

    const [canChangeProfileType, setCanChangeProfileType] = useState<boolean>(false);
    const [missingPermissions, setMissingPermissions] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [profilePatternKey, setProfilePatternKey] = useState<string | null | undefined>();
    const [patternType, setPatternType] = useState<PatternType | undefined>();
    const [ruleBasedPatternKey, setRuleBasedPatternKey] = useState<string | undefined>();
    const [validated, setValidated] = useState<boolean>(false);
    const [missingData, setMissingData] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [previewProfilePatternKey, setPreviewProfilePatternKey] = useState<string | null | undefined>();

    useEffect(() => {
        setMissingPermissions([]);
        const fundingStreamPermission = permissions.find(p => p.fundingStreamId === fundingStreamId);
        if (!fundingStreamPermission || !fundingStreamPermission.canApplyCustomProfilePattern) {
            setMissingPermissions(["apply custom profile pattern"]);
        } else {
            setCanChangeProfileType(true);
        }
    }, [permissions]);

    useEffect(() => {
        if (!fundingLineProfile || fundingLineProfile.profilePatternKey === undefined) return;
        if (fundingLineProfile.profilePatternKey === null) {
            setPatternType(PatternType.National);
            setProfilePatternKey(null);
            setRuleBasedPatternKey(undefined);
        } else {
            setPatternType(PatternType.RuleBased);
            setProfilePatternKey(fundingLineProfile.profilePatternKey);
            setRuleBasedPatternKey(fundingLineProfile.profilePatternKey);
        }
    }, [fundingLineProfile]);

    const isPageLoading = isFetchingProfilePatterns || isFetchingProviderVersion || isFetchingFundingLineProfile;
    const providerName = providerVersion && providerVersion.name ? providerVersion.name : "Unknown provider";
    const fundingLineName = fundingLineProfile && fundingLineProfile.fundingLineName ?
        fundingLineProfile.fundingLineName : "Unknown funding line name";

    const redirectToFundingLineProfile = () => {
        history.push(`/Approvals/ProviderFundingOverview/${specificationId}/${providerId}/${providerVersionId}/${fundingStreamId}/${fundingPeriodId}/${fundingLineId}`);
    }

    const isValidForm = () => {
        setValidated(true);
        if (!patternType) {
            addErrorMessage("No pattern type selected");
            return false;
        }
        if (patternType === PatternType.RuleBased && (!profilePatternKey || profilePatternKey.length === 0)) {
            addErrorMessage("A rule based pattern must be selected");
            return false;
        }
        return true;
    }

    const handleApplyClick = async () => {
        try {
            clearErrorMessages();
            if (!isValidForm() || profilePatternKey === undefined) return;
            setIsSaving(true);
            await assignProfilePatternKeyToPublishedProvider(
                fundingStreamId, fundingPeriodId, providerId, fundingLineId, profilePatternKey);
            redirectToFundingLineProfile();
        } catch (error) {
            if (error.response.status === 304) {
                redirectToFundingLineProfile();
            } else {
                addErrorMessage(error.message);
            }
        } finally {
            setIsSaving(false);
        }
    }

    const handleCancelClick = () => {
        redirectToFundingLineProfile();
    }

    const handleProfilePatternSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value as PatternType;
        setPatternType(newValue);
        setRuleBasedPatternKey(undefined);
        if (newValue === PatternType.National) {
            setProfilePatternKey(null);
        }
        setValidated(false);
    }

    const handleRuleBasedPatternChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setRuleBasedPatternKey(newValue);
        setProfilePatternKey(newValue);
    }

    useEffect(() => {
        if (previewProfilePatternKey !== undefined) {
            setShowModal(true);
        }
    }, [previewProfilePatternKey]);

    const handlePreviewProfile = (key: string | null) => {
        clearErrorMessages(["preview-profile"]);
        setPreviewProfilePatternKey(key);
    }

    const getNationalPattern: FundingStreamPeriodProfilePattern | undefined = useMemo(() => {
        if (!profilePatterns) return undefined;
        const nationalPattern = profilePatterns.filter(pp => pp.fundingLineId === fundingLineId && pp.profilePatternKey === null);
        if (nationalPattern.length === 1) {
            return nationalPattern[0];
        }
        if (nationalPattern.length > 1) {
            addErrorMessage("More than one national profile found for this funding line.");
            setMissingData(true);
        }
        if (nationalPattern.length === 0) {
            addErrorMessage("No national profile pattern found for this funding line.");
            setMissingData(true);
        }
        return undefined;
    }, [profilePatterns]);

    const getNationalPatternName = () => {
        return getNationalPattern &&
            getNationalPattern.profilePatternDisplayName !== null ? getNationalPattern.profilePatternDisplayName : "National";
    }

    const getNationalPatternDescription = () => {
        return getNationalPattern &&
            getNationalPattern.profilePatternDescription !== null ? getNationalPattern.profilePatternDescription : "";
    }

    const getRuleBasedPatterns: FundingStreamPeriodProfilePattern[] = useMemo(() => {
        if (!profilePatterns) return [];
        const ruleBasedPatterns = profilePatterns.filter(pp => pp.fundingLineId === fundingLineId && pp.profilePatternKey !== null);
        if (ruleBasedPatterns.length > 0) {
            return ruleBasedPatterns;
        }
        addErrorMessage("No rule based profile patterns found for this funding line.");
        setMissingData(true);
        return [];
    }, [profilePatterns]);

    return (
        <div>
            <Header location={Section.Approvals} />
            <div className="govuk-width-container">
                {isPageLoading || isSaving ?
                    <LoadingStatus title={`${isPageLoading ? "Loading profile patterns" : "Saving profile pattern"}`} /> :
                    <>
                        <Breadcrumbs>
                            <Breadcrumb name="Calculate funding" url={"/"} />
                            <Breadcrumb name="Approvals" />
                            <Breadcrumb name="Select specification" url={"/Approvals/Select"} />
                            <Breadcrumb name={"Funding approval results"} url={`/Approvals/SpecificationFundingApproval/${fundingStreamId}/${fundingPeriodId}/${specificationId}`} />
                            <Breadcrumb name={providerName} url={`/Approvals/ProviderFundingOverview/${specificationId}/${providerId}/${providerVersionId}/${fundingStreamId}/${fundingPeriodId}`} />
                            <Breadcrumb name={fundingLineName} url={`/Approvals/ProviderFundingOverview/${specificationId}/${providerId}/${providerVersionId}/${fundingStreamId}/${fundingPeriodId}/${fundingLineId}`} />
                            <Breadcrumb name="Change profile type" />
                        </Breadcrumbs>
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-full">
                                <PermissionStatus requiredPermissions={missingPermissions} hidden={isPageLoading} />
                            </div>
                        </div>
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-full">
                                <MultipleErrorSummary errors={errors} />
                            </div>
                        </div>
                        <div className="govuk-grid-row govuk-!-margin-bottom-5 govuk-!-margin-top-5">
                            <div className="govuk-grid-column-two-thirds">
                                <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">Change profile type</h1>
                            </div>
                        </div>
                        <div className="govuk-form-group">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                <h4 className="govuk-heading-s">Select pattern type</h4>
                            </legend>
                            <span id="rule-based-hint" className="govuk-hint">
                                Select one option.
                            </span>
                            <div className="govuk-radios govuk-radios--conditional" data-module="govuk-radios">
                                <div className="govuk-radios__item">
                                    <input className="govuk-radios__input" name="national"
                                        type="radio" data-aria-controls="national-pattern" value={PatternType.National}
                                        checked={patternType === PatternType.National} onChange={handleProfilePatternSelected} aria-labelledby="national-type" />
                                    <label className="govuk-label govuk-radios__label" htmlFor="national" id="national-type">
                                        {getNationalPatternName()}
                                        <span className="govuk-hint">
                                            <strong>Description:</strong> {getNationalPatternDescription()}
                                        </span>
                                        <button className="govuk-link" onClick={e => handlePreviewProfile(null)}>Preview profile</button>
                                    </label>
                                </div>
                                <div className="govuk-form-group">
                                    <fieldset className="govuk-fieldset" aria-describedby="rule-based-hint">
                                        <div className="govuk-radios govuk-radios--conditional" data-module="govuk-radios">
                                            <div className="govuk-radios__item">
                                                <input className="govuk-radios__input" name="rule-based"
                                                    type="radio" aria-controls="rule-based-pattern" aria-expanded={patternType === PatternType.RuleBased}
                                                    value={PatternType.RuleBased} checked={patternType === PatternType.RuleBased}
                                                    onChange={handleProfilePatternSelected} aria-labelledby="rule-based-type" />
                                                <label className="govuk-label govuk-radios__label" htmlFor="rule-based" id="rule-based-type">
                                                    Rule based
                                                </label>
                                            </div>
                                            <div className="govuk-radios__conditional" hidden={patternType !== PatternType.RuleBased}>
                                                <div className={`govuk-form-group ${validated && !ruleBasedPatternKey ? "govuk-form-group--error" : ""}`}>
                                                    <fieldset className="govuk-fieldset">
                                                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                                                            <h4 className="govuk-heading-s">Select rule based pattern</h4>
                                                        </legend>
                                                        {validated && !ruleBasedPatternKey && <span className="govuk-error-message">
                                                            <span className="govuk-visually-hidden">Error:</span>
                                                            A rule based pattern must be selected
                                                        </span>}
                                                        <div className="govuk-radios govuk-radios--small">
                                                            {getRuleBasedPatterns.map(rbp => {
                                                                const patternKey = rbp.profilePatternKey;
                                                                if (patternKey === undefined || patternKey === null) return <></>;
                                                                return <div className="govuk-radios__item" key={rbp.id}>
                                                                    <input className="govuk-radios__input" name={rbp.id} type="radio"
                                                                        value={patternKey} checked={ruleBasedPatternKey === patternKey}
                                                                        onChange={handleRuleBasedPatternChange} aria-labelledby={`${rbp.id}-rule-based-label`}
                                                                    />
                                                                    <label className="govuk-label govuk-radios__label" htmlFor={rbp.id} id={`${rbp.id}-rule-based-label`}>
                                                                        {rbp.profilePatternDisplayName && rbp.profilePatternDisplayName !== null ?
                                                                            rbp.profilePatternDisplayName : "Unknown name"}
                                                                        <span className="govuk-hint">{rbp.profilePatternDescription && rbp.profilePatternDescription !== null ?
                                                                            rbp.profilePatternDescription : "Unknown description"}</span>
                                                                        <button className="govuk-link" onClick={e => handlePreviewProfile(patternKey)}>Preview profile</button>
                                                                    </label>
                                                                </div>
                                                            }
                                                            )}
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
                                    <button className="govuk-button govuk-!-margin-right-1" onClick={handleApplyClick}
                                        disabled={!canChangeProfileType || isSaving || missingData}>
                                        Apply
                                    </button>
                                    <button className="govuk-button govuk-button--secondary" onClick={handleCancelClick}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>}
            </div>
            {previewProfilePatternKey !== undefined && <PreviewProfileModal
                specificationId={specificationId}
                fundingStreamId={fundingStreamId}
                fundingPeriodId={fundingPeriodId}
                providerId={providerId}
                fundingLineId={fundingLineId}
                previewProfilePatternKey={previewProfilePatternKey}
                addErrorMessage={addErrorMessage}
                showModal={showModal}
                toggleModal={setShowModal}
                setPreviewProfilePatternKey={setPreviewProfilePatternKey}
            />}
            <Footer />
        </div>
    )
}