import React, {useEffect, useState} from "react";
import {RouteComponentProps, useHistory} from "react-router";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {Footer} from "../../components/Footer";
import {getFundingLinePublishedProviderDetails, applyCustomProfile} from "../../services/publishedProviderFundingLineService";
import {Link} from "react-router-dom";
import {FundingLineProfile, FundingLineProfileViewModel} from "../../types/PublishedProvider/FundingLineProfile";
import {LoadingStatus} from "../../components/LoadingStatus";
import {FormattedNumber, NumberType} from "../../components/FormattedNumber";
import {DateTimeFormatter} from "../../components/DateTimeFormatter";
import {PermissionStatus} from "../../components/PermissionStatus";
import {EditableProfileTotal} from "../../components/Funding/EditableProfileTotal";
import {cloneDeep} from "lodash";
import {ApplyCustomProfileRequest, ProfilePeriodType} from "../../types/PublishedProvider/ApplyCustomProfileRequest";
import {ProfileTotal} from "../../types/FundingLineProfile";
import {ProfileHistoryPanel} from "./ProfileHistoryPanel";
import {SpecificationPermissions, useSpecificationPermissions} from "../../hooks/useSpecificationPermissions";
import {useErrors} from "../../hooks/useErrors";

export interface ViewEditFundingLineProfileProps {
    providerId: string;
    fundingStreamId: string;
    fundingPeriodId: string;
    specificationId: string;
    fundingLineId: string;
    specCoreProviderVersionId: string;
}

export function ViewEditFundingLineProfile({match}: RouteComponentProps<ViewEditFundingLineProfileProps>) {
    const fundingStreamId = match.params.fundingStreamId;
    const fundingPeriodId = match.params.fundingPeriodId;
    const specificationId = match.params.specificationId;
    const fundingLineId = match.params.fundingLineId;
    const providerId = match.params.providerId;
    const providerVersionId = match.params.specCoreProviderVersionId;

    const history = useHistory();

    const [fundingLineProfile, setFundingLineProfile] = useState<FundingLineProfile>({
        fundingLineCode: '',
        fundingLineName: '',
        ukprn: '',
        amountAlreadyPaid: 0,
        carryOverAmount: null,
        providerName: '',
        profilePatternKey: '',
        profilePatternName: '',
        profilePatternDescription: '',
        lastUpdatedUser: {id: '', name: '',},
        profileTotalAmount: 0,
        profileTotals: []
    });
    const [editedFundingLineProfile, setEditedFundingLineProfile] = useState<FundingLineProfile>({
        fundingLineCode: '',
        fundingLineName: '',
        ukprn: '',
        amountAlreadyPaid: 0,
        carryOverAmount: null,
        providerName: '',
        profilePatternKey: '',
        profilePatternName: '',
        profilePatternDescription: '',
        lastUpdatedUser: {id: '', name: '',},
        profileTotalAmount: 0,
        profileTotals: []
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [pageTitle, setPageTitle] = useState<string>();
    const [canEditCustomProfile, setCanEditCustomProfile] = useState<boolean>(false);
    const [canChangeToRuleBasedProfile, setCanChangeToRuleBasedProfile] = useState<boolean>(false);

    useEffect(() => {
        getFundingLineProfile();
    }, []);

    useEffect(() => {
        const title = `${isEditMode ? "Edit " : ""}Profile${fundingLineProfile ? " for " + fundingLineProfile.fundingLineName : ""}`;
        document.title = `${title} - Calculate funding`;
        setPageTitle(title);
    }, [isEditMode, fundingLineProfile]);

    const {canApplyCustomProfilePattern, missingPermissions, isPermissionsFetched} =
        useSpecificationPermissions(specificationId, [SpecificationPermissions.CanApplyCustomProfilePattern]);

    const {errors, addError, clearErrorMessages, addValidationErrors} = useErrors();

    const isFormValid = (totalAllocationAmount: number, totalAllocationPercent: number) => {
        let isErrors = false;
        if (totalAllocationAmount > remainingAmount) {
            addError({error: "Total allocation greater than balance available", fieldName: "totalAllocation"});
            isErrors = true;
        }
        if (totalAllocationPercent > 100) {
            addError({error: "Total must be less than or equal to 100", fieldName: "totalPercent"});
            isErrors = true;
        }
        return !isErrors;
    }

    const getFundingLineProfile = async () => {
        try {
            setIsLoading(true);
            const response = await getFundingLinePublishedProviderDetails(specificationId, providerId, fundingStreamId, fundingLineId, fundingPeriodId);
            const profile = response.data as FundingLineProfileViewModel;
            setEditedFundingLineProfile(profile.fundingLineProfile);
            setFundingLineProfile(profile.fundingLineProfile);
            setCanEditCustomProfile(profile.enableUserEditableCustomProfiles);
            setCanChangeToRuleBasedProfile(profile.enableUserEditableRuleBasedProfiles);
        } catch (err) {
            addError({error: err});
        } finally {
            setIsLoading(false);
        }
    }

    const handleEditProfileClick = async () => {
        if (!isEditMode) {
            setIsEditMode(true);
            window.scrollTo(0, 0);
        } else {
            try {
                clearErrorMessages(["totalPercent", "totalAllocation"]);
                const totalUnpaidAllocationAmount = calculateTotalUnpaidAllocationAmount();
                const totalUnpaidAllocationPercent = calculateUnpaidTotalAllocationPercent();

                if (!isFormValid(totalUnpaidAllocationAmount, totalUnpaidAllocationPercent)) {
                    return;
                }

                setIsSaving(true);

                const carryForwardValue = calculateNewCarryForwardAmount(totalUnpaidAllocationAmount);
                const request: ApplyCustomProfileRequest = {
                    fundingStreamId: fundingStreamId,
                    fundingPeriodId: fundingPeriodId,
                    fundingLineCode: fundingLineId,
                    providerId: providerId,
                    customProfileName: `${providerId}-${fundingStreamId}-${fundingPeriodId}-${fundingLineId}`,
                    carryOver: carryForwardValue > 0 ? carryForwardValue - originalCarryForwardAmount : null,
                    profilePeriods: editedFundingLineProfile ? editedFundingLineProfile.profileTotals.map(pt => ({
                        type: pt.periodType as ProfilePeriodType,
                        typeValue: pt.typeValue,
                        year: pt.year,
                        occurrence: pt.occurrence,
                        profiledValue: pt.value,
                        distributionPeriodId: pt.distributionPeriodId
                    })) : []
                };

                await applyCustomProfile(request);
                await getFundingLineProfile();
                setIsEditMode(false);
            } catch (err) {
                if (err.response.status === 400) {
                    const errResponse = err.response.data;
                    addValidationErrors({validationErrors: {errResponse}, message: "Validation failed"});
                } else {
                    addError({error: err});
                }
            } finally {
                setIsSaving(false);
            }
        }
    }

    const handleCancelClick = () => {
        setEditedFundingLineProfile(fundingLineProfile);
        setIsEditMode(false);
    }

    const handleChangeToRuleBasedProfileClick = () => {
        history.push(`/Approvals/ProviderFundingOverview/${specificationId}/${providerId}/${providerVersionId}/${fundingStreamId}/${fundingPeriodId}/${fundingLineId}/change-profile-type`);
    }

    function updateProfileTotal(instalmentNumber: number, newProfileTotal: ProfileTotal) {
        if (!editedFundingLineProfile) return;
        const cloneOfFundingLineProfile: FundingLineProfile = cloneDeep(editedFundingLineProfile);
        cloneOfFundingLineProfile.profileTotals = cloneOfFundingLineProfile.profileTotals.map(
            profile => profile.installmentNumber === instalmentNumber ? newProfileTotal : profile
        );
        setEditedFundingLineProfile(cloneOfFundingLineProfile);
    }

    function calculateUnpaidTotalAllocationPercent(): number {
        if (!editedFundingLineProfile || editedFundingLineProfile.profileTotals.length === 0) return 0;
        const totalPercentage = editedFundingLineProfile.profileTotals
            .filter(p => p.profileRemainingPercentage !== undefined && !p.isPaid)
            .map(p => p.profileRemainingPercentage)
            .reduce((a, c) => (a !== undefined && c !== undefined ? a + c : 0), 0);

        return totalPercentage || 0;
    }

    function calculateTotalUnpaidAllocationAmount(): number {
        if (!editedFundingLineProfile || editedFundingLineProfile.profileTotals.length === 0) return 0;
        const totalAllocation = editedFundingLineProfile.profileTotals
            .filter(p => !p.isPaid)
            .map(p => p.value)
            .reduce((a, c) => a + c, 0);

        return totalAllocation || 0;
    }

    function calculateTotalPaidAndUnpaidAllocationAmount(): number {
        if (!editedFundingLineProfile || editedFundingLineProfile.profileTotals.length === 0) return 0;
        const totalAllocation = editedFundingLineProfile.profileTotals
            .map(p => p.value)
            .reduce((a, c) => a + c, 0);

        return totalAllocation || 0;
    }

    function calculateNewCarryForwardAmount(totalUnpaidAllocationAmount: number): number {
        return remainingAmount - totalUnpaidAllocationAmount;
    }

    function RowItem(props: { id: string, title: string, children: any }) {
        return (
            <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">
                    <label id={`${props.id}-label`} htmlFor={props.id}>{props.title}</label>
                </dt>
                <dd className="govuk-summary-list__value" id={props.id} aria-labelledby={`${props.id}-label`}>
                    {props.children}
                </dd>
            </div>)
    }

    const remainingAmount = fundingLineProfile &&
    fundingLineProfile.remainingAmount !== undefined && fundingLineProfile.remainingAmount !== null ?
        fundingLineProfile.remainingAmount : 0;
    const originalCarryForwardAmount = fundingLineProfile && fundingLineProfile.carryOverAmount !== null ?
        fundingLineProfile.carryOverAmount : 0;
    const totalUnpaidAllocationAmount = calculateTotalUnpaidAllocationAmount();
    const totalUnpaidAllocationPercent = calculateUnpaidTotalAllocationPercent();
    const totalAllocationAmount = calculateTotalPaidAndUnpaidAllocationAmount();
    const newCarryForwardAmount = calculateNewCarryForwardAmount(totalUnpaidAllocationAmount);

    return (
        <div>
            <Header location={Section.Approvals}/>
            <div className="govuk-width-container">
                {isLoading || isSaving ?
                    <LoadingStatus title={`${isLoading ? "Loading" : "Saving"} funding line profile`}/> :
                    <>
                        <Breadcrumbs>
                            <Breadcrumb name="Calculate funding" url={"/"}/>
                            <Breadcrumb name="Approvals"/>
                            <Breadcrumb name="Select specification" url={"/Approvals/Select"}/>
                            <Breadcrumb name={"Funding approval results"} url={`/Approvals/SpecificationFundingApproval/${fundingStreamId}/${fundingPeriodId}/${specificationId}`}/>
                            <Breadcrumb name={fundingLineProfile.providerName} url={`/Approvals/ProviderFundingOverview/${specificationId}/${providerId}/${providerVersionId}/${fundingStreamId}/${fundingPeriodId}`}/>
                            <Breadcrumb name={pageTitle ?? "Funding Line Profile"}/>
                        </Breadcrumbs>
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-full">
                                <PermissionStatus requiredPermissions={missingPermissions} hidden={!isPermissionsFetched}/>
                            </div>
                        </div>
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-full">
                                <MultipleErrorSummary errors={errors}/>
                            </div>
                        </div>
                        <div>
                            <div className="govuk-grid-row govuk-!-margin-bottom-5 govuk-!-margin-top-5">
                                <div className="govuk-grid-column-full">
                                    <h1 className="govuk-heading-xl govuk-!-margin-bottom-2" data-testid="funding-line-name">
                                        {pageTitle}
                                    </h1>
                                    <h3 className="govuk-heading-m govuk-!-margin-bottom-2" data-testid="provider-name">
                                        {fundingLineProfile.providerName}
                                    </h3>
                                    <p className="govuk-body-s" data-testid="last-updated-by">
                                        {`Last updated by ${fundingLineProfile.lastUpdatedUser.name} on `}
                                        {fundingLineProfile.lastUpdatedDate && <DateTimeFormatter date={fundingLineProfile.lastUpdatedDate}/>}
                                    </p>
                                </div>
                            </div>
                            <div className="govuk-grid-row">
                                <div className="govuk-grid-column-full">
                                    <dl className="govuk-summary-list govuk-summary-list--no-border">
                                        <RowItem id={"ukprn"} title={"UKPRN"}>
                                            {fundingLineProfile.ukprn}
                                        </RowItem>

                                        <RowItem id="total-allocation" title="Total allocation">
                                            <FormattedNumber value={fundingLineProfile.totalAllocation || 0} type={NumberType.FormattedMoney}/>
                                        </RowItem>

                                        <RowItem id="amount-already-paid" title="Instalments paid value">
                                            <FormattedNumber value={fundingLineProfile.amountAlreadyPaid || 0} type={NumberType.FormattedMoney}/>
                                        </RowItem>

                                        <RowItem id="remaining-amount" title="Balance available for profiling">
                                            <FormattedNumber value={remainingAmount} type={NumberType.FormattedMoney}/>
                                        </RowItem>
                                    </dl>
                                </div>
                            </div>
                            <div className="govuk-grid-row">
                                <div className="govuk-grid-column-full">
                                    <table className="govuk-table govuk-!-margin-top-5" data-testid="data-table">
                                        <caption className="govuk-table__caption">Profiling instalments</caption>
                                        <thead className="govuk-table__head">
                                        <tr className="govuk-table__row">
                                            <th scope="col" className="govuk-table__header">Instalment month</th>
                                            <th scope="col" className="govuk-table__header">Payment status</th>
                                            <th scope="col" className="govuk-table__header">Instalment number</th>
                                            <th scope="col" className="govuk-table__header">Per cent</th>
                                            <th scope="col" className="govuk-table__header govuk-table__header--numeric">Value</th>
                                        </tr>
                                        </thead>
                                        <tbody className="govuk-table__body">
                                        {editedFundingLineProfile.profileTotals
                                            .sort((a, b) => a.installmentNumber - b.installmentNumber)
                                            .map((p, i) => {
                                                return <tr className="govuk-table__row" key={p.installmentNumber} data-testid="profile-total">
                                                    <th scope="row" className="govuk-table__header">
                                                        {p.actualDate ? <DateTimeFormatter date={p.actualDate}/> : `${p.typeValue} ${p.year}`}
                                                    </th>
                                                    <td className="govuk-table__cell" data-testid={`paid-${i}`}>
                                                        {p.isPaid ? <strong className="govuk-tag">Paid</strong> : null}
                                                    </td>
                                                    <td className="govuk-table__cell" data-testid={`instalment-number-${i}`}>
                                                        {p.installmentNumber}
                                                    </td>
                                                    <EditableProfileTotal
                                                        index={i}
                                                        profileTotal={p}
                                                        remainingAmount={editedFundingLineProfile.remainingAmount || 0}
                                                        setProfileTotal={updateProfileTotal}
                                                        isEditMode={isEditMode}
                                                        errors={errors}
                                                        addError={addError}
                                                        clearErrorMessages={clearErrorMessages}/>
                                                </tr>
                                            })
                                        }
                                        <tr className="govuk-table__row">
                                            <th scope="row" className="govuk-table__header">
                                                To be carried forward
                                            </th>
                                            <td className="govuk-table__cell"></td>
                                            <td className="govuk-table__cell"></td>
                                            <td className="govuk-table__cell"></td>
                                            <td className="govuk-table__cell govuk-table__cell--numeric">
                                                <strong data-testid="balance-carried-forward">
                                                    <FormattedNumber value={newCarryForwardAmount} type={NumberType.FormattedMoney}/>
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
                                                <div className={`govuk-form-group ${errors.filter(e =>
                                                    e.fieldName === "totalPercent").length > 0 ? 'govuk-form-group--error' : ''}`}>
                                                    {errors.filter(e => e.fieldName === "totalPercent").length > 0 ?
                                                        errors.map(error => error.fieldName === "totalPercent" &&
                                                            <span key={error.id} className="govuk-error-message govuk-!-margin-bottom-1">
                                                                    <span className="govuk-visually-hidden">Error:</span> {error.message}
                                                                </span>
                                                        ) : null}
                                                    <strong data-testid="total-allocation-percent">
                                                        <FormattedNumber value={totalUnpaidAllocationPercent} type={NumberType.FormattedPercentage}
                                                                         decimalPlaces={totalUnpaidAllocationPercent === 100 ? 0 : 2}/>
                                                    </strong>
                                                </div>
                                            </td>
                                            <td className="govuk-table__cell govuk-table__cell--numeric" id="totalAllocation">
                                                <div className={`govuk-form-group ${errors.filter(e =>
                                                    e.fieldName === "totalAllocation").length > 0 ? 'govuk-form-group--error' : ''}`}>
                                                    {errors.filter(e => e.fieldName === "totalAllocation").length > 0 ?
                                                        errors.map(error => error.fieldName === "totalAllocation" &&
                                                            <span key={error.id} className="govuk-error-message govuk-!-margin-bottom-1">
                                                                    <span className="govuk-visually-hidden">Error:</span> {error.message}
                                                                </span>
                                                        ) : null}
                                                    <strong data-testid="total-allocation-amount">
                                                        <FormattedNumber value={totalAllocationAmount} type={NumberType.FormattedMoney}/>
                                                    </strong>
                                                </div>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="govuk-grid-row">
                                <div className="govuk-grid-column-two-thirds">
                                    <button className="govuk-button govuk-!-margin-right-1"
                                            disabled={!canApplyCustomProfilePattern || !canEditCustomProfile}
                                            onClick={handleEditProfileClick}>
                                        {isEditMode ? "Apply profile" : "Edit profile"}
                                    </button>
                                    {isEditMode &&
                                    <button className="govuk-button govuk-button--secondary govuk-!-margin-right-1"
                                            onClick={handleCancelClick}
                                            data-testid="cancel-btn">
                                        Cancel
                                    </button>}
                                    {canChangeToRuleBasedProfile &&
                                    <button className="govuk-button"
                                            onClick={handleChangeToRuleBasedProfileClick}>
                                        Change to rule based profile
                                    </button>}
                                </div>
                            </div>
                        </div>
                        <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible"/>
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-two-thirds">
                                <ProfileHistoryPanel
                                    specificationId={specificationId} providerId={providerId} providerVersionId={providerVersionId}
                                    fundingStreamId={fundingStreamId} fundingPeriodId={fundingPeriodId} fundingLineCode={fundingLineId}/>
                                <Link to={`/Approvals/ProviderFundingOverview/${specificationId}/${providerId}/${providerVersionId}/${fundingStreamId}/${fundingPeriodId}`}
                                      className="govuk-back-link">
                                    Back
                                </Link>
                            </div>
                        </div>
                    </>}
            </div>
            <Footer/>
        </div>
    );
}