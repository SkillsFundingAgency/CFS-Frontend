import React, {useEffect, useState} from "react";
import {RouteComponentProps} from "react-router";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {Footer} from "../../components/Footer";
import {ErrorMessage} from "../../types/ErrorMessage";
import {getFundingLinePublishedProviderDetails} from "../../services/publishedProviderFundingLineService";
import {Link} from "react-router-dom";
import {FundingLineProfile} from "../../types/PublishedProvider/FundingLineProfile";
import {LoadingStatus} from "../../components/LoadingStatus";
import {FormattedNumber, NumberType} from "../../components/FormattedNumber";
import {useSelector} from "react-redux";
import {FundingStreamPermissions} from "../../types/FundingStreamPermissions";
import {IStoreState} from "../../reducers/rootReducer";
import {DateFormatter} from "../../components/DateFormatter";

export interface ViewFundingLineProfileProps {
    providerId: string;
    fundingStreamId: string;
    fundingPeriodId: string;
    specificationId: string;
    fundingLineId: string;
    providerVersionId: string;
}

export function ViewFundingLineProfile({match}: RouteComponentProps<ViewFundingLineProfileProps>) {
    const permissions: FundingStreamPermissions[] = useSelector((state: IStoreState) => state.userState.fundingStreamPermissions);
    const fundingStreamId = match.params.fundingStreamId;
    const fundingPeriodId = match.params.fundingPeriodId;
    const specificationId = match.params.specificationId;
    const fundingLineId = match.params.fundingLineId;
    const providerId = match.params.providerId;
    const providerVersionId = match.params.providerVersionId;

    const [fundingLineProfile, setFundingLineProfile] = useState<FundingLineProfile>();
    const [errors, setErrors] = useState<ErrorMessage[]>([]);
    const [missingPermissions, setMissingPermissions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    function addErrorMessage(errorMessage: string, fieldName?: string) {
        const errorCount: number = errors.length;
        const error: ErrorMessage = {id: errorCount + 1, fieldName: fieldName, message: errorMessage};
        setErrors(errors => [...errors, error]);
    }

    useEffect(() => {
        const getFundingLineProfile = async () => {
            try {
                setIsLoading(true);
                const response = await getFundingLinePublishedProviderDetails(specificationId, providerId, fundingStreamId, fundingLineId);
                setFundingLineProfile(response.data as FundingLineProfile);
            }
            catch (err) {
                addErrorMessage(err.message);
            }
            finally {
                setIsLoading(false);
            }
        }

        getFundingLineProfile();
    }, []);

    useEffect(() => {
        setMissingPermissions([]);
        const fundingStreamPermission = permissions.find(p => p.fundingStreamId === fundingStreamId);
        if (!fundingStreamPermission || !fundingStreamPermission.canEditProfilePattern) {
            setMissingPermissions(["edit profile pattern"]);
        }
    }, [permissions]);

    return (
        <div>
            <Header location={Section.Approvals} />
            <div className="govuk-width-container">
                {!fundingLineProfile || isLoading ? <LoadingStatus title="Loading funding line profile" /> :
                    <>
                        <Breadcrumbs>
                            <Breadcrumb name="Calculate funding" url={"/"} />
                            <Breadcrumb name="Approvals" />
                            <Breadcrumb name="Select specification" url={"/Approvals/Select"} />
                            <Breadcrumb name={"Funding approval results"} url={`/Approvals/SpecificationFundingApproval/${fundingStreamId}/${fundingPeriodId}/${specificationId}`} />
                            <Breadcrumb name={fundingLineProfile.providerName} url={`/Approvals/ProviderFundingOverview/${specificationId}/${providerId}/${providerVersionId}/${fundingStreamId}/${fundingPeriodId}`} />
                            <Breadcrumb name={fundingLineProfile.fundingLineName || "Missing funding line name"} />
                        </Breadcrumbs>
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-full">
                                <MultipleErrorSummary errors={errors} />
                            </div>
                        </div>
                        <div>
                            <div className="govuk-grid-row govuk-!-margin-bottom-5 govuk-!-margin-top-5">
                                <div className="govuk-grid-column-two-thirds">
                                    <h1 className="govuk-heading-xl govuk-!-margin-bottom-2" data-testid="funding-line-name">{fundingLineProfile.fundingLineName || "Missing funding line name"}</h1>
                                    <h3 className="govuk-heading-m govuk-!-margin-bottom-2" data-testid="provider-name">{fundingLineProfile.providerName}</h3>
                                    <p className="govuk-body-s"><span data-testid="ukprn">{`UKPRN: ${fundingLineProfile.ukprn}`}</span></p>
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
                                        <FormattedNumber value={fundingLineProfile.totalAllocation} type={NumberType.FormattedMoney} />
                                    </h2>
                                    <span className="govuk-caption-m">Instalments paid value</span>
                                    <h2 className="govuk-heading-m govuk-!-margin-bottom-2" data-testid="amount-already-paid">
                                        <FormattedNumber value={fundingLineProfile.amountAlreadyPaid} type={NumberType.FormattedMoney} />
                                    </h2>
                                    <span className="govuk-caption-m">Balance available for profiling</span>
                                    <h2 className="govuk-heading-m govuk-!-margin-bottom-2" data-testid="remaining-amount">
                                        <FormattedNumber value={fundingLineProfile.remainingAmount} type={NumberType.FormattedMoney} />
                                    </h2>
                                    <span className="govuk-caption-m">Balance to be carried forward</span>
                                    <h2 className="govuk-heading-m govuk-!-margin-bottom-2" data-testid="balance-carried-forward">
                                        <FormattedNumber value={fundingLineProfile.carryOverAmount} type={NumberType.FormattedMoney} />
                                    </h2>
                                </div>
                            </div>
                            <div className="govuk-grid-row">
                                <div className="govuk-grid-column-full">
                                    <table className="govuk-table govuk-!-margin-top-5">
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
                                            {fundingLineProfile.profileTotals
                                                .sort((a, b) => a.installmentNumber - b.installmentNumber)
                                                .map(p => (
                                                    <tr className="govuk-table__row" key={p.installmentNumber} data-testid="profile-total">
                                                        <th scope="row" className="govuk-table__header">
                                                            {p.actualDate && <DateFormatter date={p.actualDate} />}
                                                        </th>
                                                        <td className="govuk-table__cell">{p.isPaid ? <strong className="govuk-tag">Paid</strong> : null}</td>
                                                        <td className="govuk-table__cell">{p.installmentNumber}</td>
                                                        <td className="govuk-table__cell">
                                                            <FormattedNumber value={p.profileRemainingPercentage} type={NumberType.FormattedPercentage} decimalPlaces={0} />
                                                        </td>
                                                        <td className="govuk-table__cell govuk-table__cell--numeric">
                                                            <FormattedNumber value={p.value} type={NumberType.FormattedMoney} />
                                                        </td>
                                                    </tr>))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-two-thirds">
                                <Link to={`/Approvals/ProviderFundingOverview/${specificationId}/${providerId}/${providerVersionId}/${fundingStreamId}/${fundingPeriodId}`} className="govuk-back-link">
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