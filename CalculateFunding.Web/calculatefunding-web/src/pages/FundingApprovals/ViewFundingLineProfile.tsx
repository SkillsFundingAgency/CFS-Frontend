import React, {useEffect, useState} from "react";
import {RouteComponentProps, useHistory} from "react-router";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {Footer} from "../../components/Footer";
import {ErrorMessage} from "../../types/ErrorMessage";
import {getFundingLinePublishedProviderDetails, applyCustomProfile} from "../../services/publishedProviderFundingLineService";
import {Link} from "react-router-dom";
import {FundingLineProfile, FundingLineProfileViewModel} from "../../types/PublishedProvider/FundingLineProfile";
import {LoadingStatus} from "../../components/LoadingStatus";
import {FormattedNumber, NumberType} from "../../components/FormattedNumber";
import {useSelector} from "react-redux";
import {FundingStreamPermissions} from "../../types/FundingStreamPermissions";
import {IStoreState} from "../../reducers/rootReducer";
import {DateFormatter} from "../../components/DateFormatter";
import {PermissionStatus} from "../../components/PermissionStatus";
import {EditableProfileTotal} from "../../components/Funding/EditableProfileTotal";
import {cloneDeep} from "lodash";
import {ApplyCustomProfileRequest, ProfilePeriodType} from "../../types/PublishedProvider/ApplyCustomProfileRequest";
import {ProfileTotal} from "../../types/FundingLineProfile";
import {ProfileHistoryPanel} from "./ProfileHistoryPanel";

export interface ViewFundingLineProfileProps {
    providerId: string;
    fundingStreamId: string;
    fundingPeriodId: string;
    specificationId: string;
    fundingLineId: string;
    specCoreProviderVersionId: string;
}

export function ViewFundingLineProfile({match}: RouteComponentProps<ViewFundingLineProfileProps>) {
    const permissions: FundingStreamPermissions[] = useSelector((state: IStoreState) => state.userState.fundingStreamPermissions);
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
        lastUpdatedUser: {id: '', name: '', },
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
        lastUpdatedUser: {id: '', name: '', },
        profileTotalAmount: 0,
        profileTotals: []
    });
    const [errors, setErrors] = useState<ErrorMessage[]>([]);
    const [missingPermissions, setMissingPermissions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [hasPermission, setHasPermission] = useState<boolean>(false);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [canEditCustomProfile, setCanEditCustomProfile] = useState<boolean>(false);
    const [canChangeToRuleBasedProfile, setCanChangeToRuleBasedProfile] = useState<boolean>(false);

    useEffect(() => {
        getFundingLineProfile();
    }, []);

    useEffect(() => {
        setMissingPermissions([]);
        const fundingStreamPermission = permissions.find(p => p.fundingStreamId === fundingStreamId);
        if (!fundingStreamPermission || !fundingStreamPermission.canApplyCustomProfilePattern) {
            setMissingPermissions(["apply custom profile pattern"]);
        } else {
            setHasPermission(true);
        }
    }, [permissions]);

    const isFormValid = (totalAllocationAmount: number, totalAllocationPercent: number) => {
        let isErrors = false;
        if (totalAllocationAmount > remainingAmount) {
            addErrorMessage("Total allocation greater than balance available", "totalAllocation");
            isErrors = true;
        }
        if (totalAllocationPercent > 100) {
            addErrorMessage("Total must be less than or equal to 100", "totalPercent");
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
        }
        catch (err) {
            addErrorMessage(err.message);
        }
        finally {
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
                addErrorMessage(err.message);
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

    function addErrorMessage(errorMessage: string, fieldName?: string) {
        const errorCount: number = errors.length;
        const error: ErrorMessage = {id: errorCount + 1, fieldName: fieldName, message: errorMessage};
        setErrors(errors => [...errors, error]);
    }

    function clearErrorMessages(fieldNames?: string[]) {
        if (errors.length > 0) {
            if (fieldNames === undefined) {
                setErrors([]);
            } else {
                setErrors(errors.filter(e => !e.fieldName || (e.fieldName && !fieldNames.includes(e.fieldName))));
            }
        }
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

    const fundingLineName = fundingLineProfile && fundingLineProfile.fundingLineName ?
        fundingLineProfile.fundingLineName : "Missing funding line name";
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
            <Header location={Section.Approvals} />
            <div className="govuk-width-container">
                {isLoading || isSaving ?
                    <LoadingStatus title={`${isLoading ? "Loading" : "Saving"} funding line profile`} /> :
                    <>
                        <Breadcrumbs>
                            <Breadcrumb name="Calculate funding" url={"/"} />
                            <Breadcrumb name="Approvals" />
                            <Breadcrumb name="Select specification" url={"/Approvals/Select"} />
                            <Breadcrumb name={"Funding approval results"} url={`/Approvals/SpecificationFundingApproval/${fundingStreamId}/${fundingPeriodId}/${specificationId}`} />
                            <Breadcrumb name={fundingLineProfile.providerName} url={`/Approvals/ProviderFundingOverview/${specificationId}/${providerId}/${providerVersionId}/${fundingStreamId}/${fundingPeriodId}`} />
                            <Breadcrumb name={fundingLineName} />
                        </Breadcrumbs>
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-full">
                                <PermissionStatus requiredPermissions={missingPermissions} hidden={isLoading} />
                            </div>
                        </div>
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-full">
                                <MultipleErrorSummary errors={errors} />
                            </div>
                        </div>
                        <div>
                            <div className="govuk-grid-row govuk-!-margin-bottom-5 govuk-!-margin-top-5">
                                <div className="govuk-grid-column-two-thirds">
                                    <h1 className="govuk-heading-xl govuk-!-margin-bottom-2" data-testid="funding-line-name">{fundingLineName}</h1>
                                    <h3 className="govuk-heading-m govuk-!-margin-bottom-2" data-testid="provider-name">{fundingLineProfile.providerName}</h3>
                                    <p className="govuk-body-s"><span data-testid="ukprn">{`UKPRN: ${fundingLineProfile.ukprn}`}</span></p>
                                    <br />
                                    <p className="govuk-body-s" data-testid="last-updated-by">
                                        {`Last updated by ${fundingLineProfile.lastUpdatedUser.name} on `}
                                        {fundingLineProfile.lastUpdatedDate && <DateFormatter date={fundingLineProfile.lastUpdatedDate} utc={false} />}
                                    </p>
                                </div>
                            </div>
                            <div className="govuk-grid-row">
                                <div className="govuk-grid-column-two-thirds">
                                    <span className="govuk-caption-m">Total allocation</span>
                                    <h2 className="govuk-heading-m govuk-!-margin-bottom-2" data-testid="total-allocation">
                                        <FormattedNumber value={fundingLineProfile.totalAllocation || 0} type={NumberType.FormattedMoney} />
                                    </h2>
                                    <span className="govuk-caption-m">Instalments paid value</span>
                                    <h2 className="govuk-heading-m govuk-!-margin-bottom-2" data-testid="amount-already-paid">
                                        <FormattedNumber value={fundingLineProfile.amountAlreadyPaid} type={NumberType.FormattedMoney} />
                                    </h2>
                                    <span className="govuk-caption-m">Balance available for profiling</span>
                                    <h2 className="govuk-heading-m govuk-!-margin-bottom-2" data-testid="remaining-amount">
                                        <FormattedNumber value={remainingAmount} type={NumberType.FormattedMoney} />
                                    </h2>
                                    <span className="govuk-caption-m">Balance to be carried forward</span>
                                    <h2 className="govuk-heading-m govuk-!-margin-bottom-2" data-testid="balance-carried-forward">
                                        <FormattedNumber value={originalCarryForwardAmount} type={NumberType.FormattedMoney} />
                                    </h2>
                                </div>
                            </div>
                            <div className="govuk-grid-row">
                                <div className="govuk-grid-column-full">
                                    <table className="govuk-table govuk-!-margin-top-5" data-testid="data-table">
                                        <caption className="govuk-table__caption">Profiling instalments</caption>
                                        <thead className="govuk-table__head">
                                            <tr className="govuk-table__row">
                                                <th scope="col" className="govuk-table__header">Instalment</th>
                                                <th scope="col" className="govuk-table__header">Payment status</th>
                                                <th scope="col" className="govuk-table__header">Instalment number</th>
                                                <th scope="col" className="govuk-table__header">Per cent</th>
                                                <th scope="col" className="govuk-table__header govuk-table__header--numeric">Value</th>
                                            </tr>
                                        </thead>
                                        <tbody className="govuk-table__body">
                                            {editedFundingLineProfile.profileTotals
                                                .sort((a, b) => a.installmentNumber - b.installmentNumber)
                                                .map((p, i) => (
                                                    <tr className="govuk-table__row" key={p.installmentNumber} data-testid="profile-total">
                                                        <th scope="row" className="govuk-table__header">
                                                            {p.actualDate && <DateFormatter date={p.actualDate} />}
                                                        </th>
                                                        <td className="govuk-table__cell" data-testid={`paid-${i}`}>{p.isPaid ? <strong className="govuk-tag">Paid</strong> : null}</td>
                                                        <td className="govuk-table__cell" data-testid={`instalment-number-${i}`}>{p.installmentNumber}</td>
                                                        <EditableProfileTotal
                                                            index={i}
                                                            profileTotal={p}
                                                            remainingAmount={editedFundingLineProfile.remainingAmount || 0}
                                                            setProfileTotal={updateProfileTotal}
                                                            isEditMode={isEditMode}
                                                            errors={errors}
                                                            addErrorMessage={addErrorMessage}
                                                            clearErrorMessages={clearErrorMessages} />
                                                    </tr>))}
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
                                                                decimalPlaces={totalUnpaidAllocationPercent === 100 ? 0 : 2} />
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
                                                            <FormattedNumber value={totalAllocationAmount} type={NumberType.FormattedMoney} />
                                                        </strong>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr className="govuk-table__row">
                                                <th scope="row" className="govuk-table__header">
                                                    To be carried forward
                                                </th>
                                                <td className="govuk-table__cell"></td>
                                                <td className="govuk-table__cell"></td>
                                                <td className="govuk-table__cell"></td>
                                                <td className="govuk-table__cell govuk-table__cell--numeric">
                                                    <strong data-testid="balance-carried-forward-2">
                                                        <FormattedNumber value={newCarryForwardAmount} type={NumberType.FormattedMoney} />
                                                    </strong>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="govuk-grid-row">
                                <div className="govuk-grid-column-two-thirds">
                                    {canEditCustomProfile && <button className="govuk-button govuk-!-margin-right-1" disabled={!hasPermission}
                                        onClick={handleEditProfileClick} data-testid="edit-profile-btn">
                                        {isEditMode ? "Apply profile" : "Edit profile"}
                                    </button>}
                                    {isEditMode && <button className="govuk-button govuk-button--secondary govuk-!-margin-right-1" onClick={handleCancelClick} data-testid="cancel-btn">
                                        Cancel
                                    </button>}
                                    {canChangeToRuleBasedProfile &&
                                        <button className="govuk-button" onClick={handleChangeToRuleBasedProfileClick}>Change to rule based profile</button>}
                                </div>
                            </div>
                        </div>
                        <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-two-thirds">
                                <ProfileHistoryPanel
                                    specificationId={specificationId} providerId={providerId} providerVersionId={providerVersionId}
                                    fundingStreamId={fundingStreamId} fundingPeriodId={fundingPeriodId} fundingLineCode={fundingLineId} />
                                <Link to={`/Approvals/ProviderFundingOverview/${specificationId}/${providerId}/${providerVersionId}/${fundingStreamId}/${fundingPeriodId}`}
                                    className="govuk-back-link">
                                    Back
                                </Link>
                            </div>
                        </div>
                    </>}
            </div>
            <Footer />
        </div>
    );
}