import React, {useEffect, useRef, useState} from "react";
import {getProviderResultsService} from "../../services/providerService";
import {RouteComponentProps, useLocation} from "react-router";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {LoadingStatus} from "../../components/LoadingStatus";
import {SpecificationInformation} from "../../types/Provider/SpecificationInformation";
import {getSpecificationSummaryService} from "../../services/specificationService";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {Tabs} from "../../components/Tabs";
import {DateFormatter} from "../../components/DateFormatter";
import {searchForCalculationsByProviderService} from "../../services/calculationService";
import {Link} from "react-router-dom";
import Pagination from "../../components/Pagination";
import {PublishStatus} from "../../types/PublishStatusModel";
import {NoData} from "../../components/NoData";
import {AdditionalCalculationSearchResultViewModel} from "../../types/Calculations/AdditionalCalculation";
import {Footer} from "../../components/Footer";
import * as QueryString from "query-string";
import {getFundingStreamByIdService} from "../../services/policyService";
import {FundingStream} from "../../types/viewFundingTypes";
import {WarningText} from "../../components/WarningText";
import {useProviderVersion} from "../../hooks/Providers/useProviderVersion";
import {AxiosError} from "axios";
import {useErrors} from "../../hooks/useErrors";
import {FundingLineResults} from "../../components/fundingLineStructure/FundingLineResults";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {AdditionalCalculations} from "../../components/Calculations/AdditionalCalculations";

export interface ViewProviderResultsRouteProps {
    providerId: string;
    fundingStreamId: string;
}

export function ViewProviderResults({match}: RouteComponentProps<ViewProviderResultsRouteProps>) {
    const [providerResults, setProviderResults] = useState<SpecificationInformation[]>();
    const [additionalCalculations, setAdditionalCalculations] = useState<AdditionalCalculationSearchResultViewModel>();
    const [additionalCalculationsSearchTerm, setAdditionalCalculationsSearchTerm] = useState("");
    const [specificationSummary, setSpecificationSummary] = useState<SpecificationSummary>();
    const [isLoadingAdditionalCalculations, setIsLoadingAdditionalCalculations] = useState<boolean>(false);
    const [isLoadingProviderData, setIsLoadingProviderData] = useState<boolean>(true);
    const [selectedSpecificationId, setSelectedSpecificationId] = useState<string>("");
    const [defaultFundingStreamName, setDefaultFundingStreamName] = useState<string>("");
    const location = useLocation();
    const {errors, addError, clearErrorMessages} = useErrors();

    const providerId = match.params.providerId;

    const {providerVersion: providerDetails, isLoadingProviderVersion} = useProviderVersion(
        providerId,
        specificationSummary ? specificationSummary.providerVersionId : "",
        (err: AxiosError) => addError(err.message, "Error while loading provider"));

    useEffect(() => {
        const querystringParams = QueryString.parse(location.search);

        const fetchData = async () => {
            try {
                const response = await getProviderResultsService(providerId);
                const specificationInformation = response.data;
                if (specificationInformation && specificationInformation.length > 0) {
                    const specificationIdQuerystring = querystringParams.specificationId as string;
                    const selectedSpecification = specificationInformation.find((s) =>
                        s.id === specificationIdQuerystring) ?? specificationInformation[0];

                    let specificationId = selectedSpecification.id;

                    if (querystringParams.specificationId) {
                        setSelectedSpecificationId(specificationIdQuerystring);
                        specificationId = specificationIdQuerystring;
                    } else {
                        if (specificationInformation.some((specInformation) =>
                            specInformation.fundingStreamIds != null)) {
                            let selectSpecificationByFundingStream = false;
                            specificationInformation.map((specInfo) => {
                                return specInfo.fundingStreamIds?.map((fundingStreamId) => {
                                    if (fundingStreamId === match.params.fundingStreamId) {
                                        setSelectedSpecificationId(specInfo.id);
                                        specificationId = specInfo.id;
                                        selectSpecificationByFundingStream = true;
                                        return;
                                    }
                                });
                            });

                            if (!selectSpecificationByFundingStream) {
                                const fundingStreamResponse = await getFundingStreamByIdService(match.params.fundingStreamId);
                                const fundingStream = fundingStreamResponse.data as FundingStream;
                                setDefaultFundingStreamName(fundingStream.name);
                            }
                        }
                    }
                    populateSpecification(specificationId);
                    setProviderResults(specificationInformation);
                }
            } catch (err) {
                    if (err.response?.status === 404)
                    {
                        addError("No results found for this provider.");
                    }
                    else
                    {
                        addError(err);
                    }
            } finally {
                setIsLoadingProviderData(false);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        if (!additionalCalculations) return;
        if (additionalCalculations.currentPage !== 0) {
            setIsLoadingAdditionalCalculations(false);
        }
    }, [additionalCalculations]);

    function populateAdditionalCalculations(specificationId: string, status: string, pageNumber: number, searchTerm: string) {
        setIsLoadingAdditionalCalculations(true);
        searchForCalculationsByProviderService({
            specificationId: specificationId,
            status: status,
            pageNumber: pageNumber,
            searchTerm: searchTerm,
            calculationType: "Additional"
        }, providerId)
            .then((response) => {
                setAdditionalCalculations(response.data);
            }).catch((err) => {
                addError(err);
            }).finally(() => {
                setIsLoadingAdditionalCalculations(false);
            });
    }

    function movePage(pageNumber: number) {
        if (!specificationSummary) return;
        populateAdditionalCalculations(specificationSummary.id, "", pageNumber, additionalCalculationsSearchTerm);
    }

    function searchAdditionalCalculations() {
        if (!specificationSummary) return;
        populateAdditionalCalculations(specificationSummary.id, "", 1, additionalCalculationsSearchTerm);
    }

    function setSelectedSpecification(e: React.ChangeEvent<HTMLSelectElement>) {
        const specificationId = e.target.value;
        populateSpecification(specificationId);
    }

    function populateSpecification(specificationId: string) {
        getSpecificationSummaryService(specificationId).then((response) => {
            const result = response.data as SpecificationSummary;
            setSelectedSpecificationId(result.id);
            setSpecificationSummary(response.data);
            populateAdditionalCalculations(result.id, "", 1, additionalCalculationsSearchTerm);
        }).catch((e) => {
            addError(e.message);
        });
    }

    return (
        <div>
            <Header location={Section.Results} />
            <div className="govuk-width-container">
                <Breadcrumbs>
                    <Breadcrumb name={"Calculate funding"} url={"/"} />
                    <Breadcrumb name={"View results"} url={"/Results"} />
                    <Breadcrumb name={"Select funding stream"} url={"/ViewResults/ViewProvidersFundingStreamSelection"} />
                    <Breadcrumb name={"View provider results"} goBack={true} />
                    <Breadcrumb name={providerDetails ? providerDetails.name : "Loading..."} />
                </Breadcrumbs>

                <MultipleErrorSummary errors={errors} />
                <LoadingStatus title={"Loading provider details"} hidden={!isLoadingProviderVersion && !isLoadingProviderData} />

                {providerDetails &&
                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-full">
                            <h1 className="govuk-heading-xl govuk-!-margin-bottom-3">{providerDetails.name}</h1>
                            <span className="govuk-caption-m govuk-!-margin-bottom-4">UKPRN: <strong>{providerDetails.ukprn}</strong></span>
                        </div>
                    </div>
                }

                <WarningText text={`There are no specifications for ${defaultFundingStreamName}`} hidden={defaultFundingStreamName === "" || isLoadingProviderVersion} />
                <NoData hidden={specificationSummary && specificationSummary.id !== "" || true} />

                <div className="govuk-grid-row govuk-!-margin-bottom-6" hidden={isLoadingProviderVersion}>
                    {specificationSummary && providerResults && <div className="govuk-grid-column-two-thirds">
                        <div className="govuk-form-group">
                            <h3 className="govuk-heading-m govuk-!-margin-bottom-1">Specification</h3>
                            <span className="govuk-caption-m govuk-!-margin-bottom-2">Available specifications for all funding streams will be displayed here.</span>
                            <select className="govuk-select" id="sort" name="sort"
                                onChange={setSelectedSpecification}
                                value={selectedSpecificationId !== "" ? selectedSpecificationId : specificationSummary.id}>
                                {providerResults.map(p =>
                                    <option key={p.id} value={p.id}>{p.name}
                                    </option>
                                )}
                            </select>
                        </div>
                        <p className="govuk-body">Funding stream:<span className="govuk-!-margin-left-2 govuk-!-font-weight-bold">{specificationSummary.fundingStreams[0].name}</span>
                        </p>
                        <p className="govuk-body">Funding period:<span className="govuk-!-margin-left-2 govuk-!-font-weight-bold">{specificationSummary.fundingPeriod.name}</span>
                        </p>
                    </div>}
                </div>
                <div className="govuk-grid-row" hidden={isLoadingProviderVersion || isLoadingProviderData}>
                    <div className="govuk-grid-column-full">
                        <Tabs initialTab={"funding-line-structure"}>
                            <ul className="govuk-tabs__list">
                                <Tabs.Tab label="funding-line-structure">Funding line structure</Tabs.Tab>
                                <Tabs.Tab label="additional-calculations">Additional calculations</Tabs.Tab>
                                <Tabs.Tab label="provider-data">Provider data</Tabs.Tab>
                            </ul>
                            <Tabs.Panel label={"funding-line-structure"}>
                                {specificationSummary &&
                                    <FundingLineResults specificationId={specificationSummary.id}
                                        fundingStreamId={specificationSummary.fundingStreams[0].id}
                                        fundingPeriodId={specificationSummary.fundingPeriod.id}
                                        status={specificationSummary.approvalStatus as PublishStatus}
                                        providerId={providerId}
                                        addError={addError}
                                        clearErrorMessages={clearErrorMessages} 
                                        showApproveButton={false} />
                                }
                            </Tabs.Panel>
                            <Tabs.Panel label="additional-calculations">
                                {specificationSummary && <AdditionalCalculations
                                        specificationId={specificationSummary.id}
                                        addError={addError} />
                                }
                            </Tabs.Panel>
                            <Tabs.Panel label={"provider-data"}>
                                {providerDetails &&
                                    <section className="govuk-tabs__panel" id="provider-data">
                                        <h2 className="govuk-heading-l">Provider data</h2>
                                        <div className="govuk-warning-text">
                                            <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                                            <strong className="govuk-warning-text__text">
                                                <span className="govuk-warning-text__assistive">Warning</span>
                                                You are using {providerDetails.name} from the master version.
                                            </strong>
                                        </div>
                                        <h4 className="govuk-heading-m">Establishment details</h4>
                                        <dl className="govuk-summary-list govuk-!-margin-bottom-6 govuk-summary-list--no-border">
                                            <div className="govuk-summary-list__row">
                                                <dt className="govuk-summary-list__key">
                                                    Name
                                                </dt>
                                                <dd className="govuk-summary-list__value">
                                                    {providerDetails.name}
                                                </dd>
                                            </div>
                                            <div className="govuk-summary-list__row">
                                                <dt className="govuk-summary-list__key">
                                                    Number
                                                </dt>
                                                <dd className="govuk-summary-list__value">
                                                    {providerDetails.establishmentNumber}
                                                </dd>
                                            </div>
                                            <div className="govuk-summary-list__row">
                                                <dt className="govuk-summary-list__key">
                                                    UKPRN
                                                </dt>
                                                <dd className="govuk-summary-list__value">
                                                    {providerDetails.ukprn}
                                                </dd>
                                            </div>
                                            <div className="govuk-summary-list__row">
                                                <dt className="govuk-summary-list__key">
                                                    UPIN
                                                </dt>
                                                <dd className="govuk-summary-list__value">
                                                    {providerDetails.upin}
                                                </dd>
                                            </div>
                                            <div className="govuk-summary-list__row">
                                                <dt className="govuk-summary-list__key">
                                                    URN
                                                </dt>
                                                <dd className="govuk-summary-list__value">
                                                    {providerDetails.urn}
                                                </dd>
                                            </div>
                                        </dl>
                                        <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />
                                        <h4 className="govuk-heading-m">Provider details</h4>
                                        <dl className="govuk-summary-list govuk-!-margin-bottom-6 govuk-summary-list--no-border">
                                            <div className="govuk-summary-list__row">
                                                <dt className="govuk-summary-list__key">
                                                    Type
                                                </dt>
                                                <dd className="govuk-summary-list__value">
                                                    {providerDetails.providerType}
                                                </dd>
                                            </div>
                                            <div className="govuk-summary-list__row">
                                                <dt className="govuk-summary-list__key">
                                                    Sub type
                                                </dt>
                                                <dd className="govuk-summary-list__value">
                                                    {providerDetails.providerSubType}
                                                </dd>
                                            </div>
                                            <div className="govuk-summary-list__row">
                                                <dt className="govuk-summary-list__key">
                                                    Phase of education
                                                </dt>
                                                <dd className="govuk-summary-list__value">
                                                    {providerDetails.phaseOfEducation}
                                                </dd>
                                            </div>
                                            <div className="govuk-summary-list__row">
                                                <dt className="govuk-summary-list__key">
                                                    Provider profile type
                                                </dt>
                                                <dd className="govuk-summary-list__value">
                                                    {providerDetails.providerType}
                                                </dd>
                                            </div>
                                        </dl>
                                        <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />
                                        <h4 className="govuk-heading-m">Location details</h4>
                                        <dl className="govuk-summary-list govuk-!-margin-bottom-6 govuk-summary-list--no-border">
                                            <div className="govuk-summary-list__row">
                                                <dt className="govuk-summary-list__key">
                                                    Local authority
                                                </dt>
                                                <dd className="govuk-summary-list__value">
                                                    {providerDetails.authority}
                                                </dd>
                                            </div>
                                            <div className="govuk-summary-list__row">
                                                <dt className="govuk-summary-list__key">
                                                    Local authority code
                                                </dt>
                                                <dd className="govuk-summary-list__value">
                                                    {providerDetails.laCode}
                                                </dd>
                                            </div>
                                            <div className="govuk-summary-list__row">
                                                <dt className="govuk-summary-list__key">
                                                    Town
                                                </dt>
                                                <dd className="govuk-summary-list__value">
                                                    {providerDetails.town}
                                                </dd>
                                            </div>
                                            <div className="govuk-summary-list__row">
                                                <dt className="govuk-summary-list__key">
                                                    Postcode
                                                </dt>
                                                <dd className="govuk-summary-list__value">
                                                    {providerDetails.postcode}
                                                </dd>
                                            </div>
                                            <div className="govuk-summary-list__row">
                                                <dt className="govuk-summary-list__key">
                                                    Region
                                                </dt>
                                                <dd className="govuk-summary-list__value">
                                                    {providerDetails.rscRegionName}
                                                </dd>
                                            </div>
                                            <div className="govuk-summary-list__row">
                                                <dt className="govuk-summary-list__key">
                                                    Region code
                                                </dt>
                                                <dd className="govuk-summary-list__value">
                                                    {providerDetails.rscRegionCode}
                                                </dd>
                                            </div>
                                            <div className="govuk-summary-list__row">
                                                <dt className="govuk-summary-list__key">
                                                    Local government group type
                                                </dt>
                                                <dd className="govuk-summary-list__value">
                                                    {providerDetails.localGovernmentGroupTypeName}
                                                </dd>
                                            </div>
                                            <div className="govuk-summary-list__row">
                                                <dt className="govuk-summary-list__key">
                                                    Local government group type code
                                                </dt>
                                                <dd className="govuk-summary-list__value">
                                                    {providerDetails.localGovernmentGroupTypeCode}
                                                </dd>
                                            </div>
                                            <div className="govuk-summary-list__row">
                                                <dt className="govuk-summary-list__key">
                                                    Country
                                                </dt>
                                                <dd className="govuk-summary-list__value">
                                                    {providerDetails.countryName}
                                                </dd>
                                            </div>
                                            <div className="govuk-summary-list__row">
                                                <dt className="govuk-summary-list__key">
                                                    Country code
                                                </dt>
                                                <dd className="govuk-summary-list__value">
                                                    {providerDetails.localGovernmentGroupTypeCode}
                                                </dd>
                                            </div>
                                        </dl>
                                        <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />
                                        <h4 className="govuk-heading-m">Status details</h4>
                                        <dl className="govuk-summary-list govuk-!-margin-bottom-6 govuk-summary-list--no-border">
                                            <div className="govuk-summary-list__row">
                                                <dt className="govuk-summary-list__key">
                                                    Status
                                                </dt>
                                                <dd className="govuk-summary-list__value">
                                                    {providerDetails.status}
                                                </dd>
                                            </div>
                                            <div className="govuk-summary-list__row">
                                                <dt className="govuk-summary-list__key">
                                                    Date opened
                                                </dt>
                                                <dd className="govuk-summary-list__value">
                                                    {(providerDetails !== undefined) ?
                                                        <DateFormatter date={providerDetails.dateOpened} utc={false} /> : "Unknown"}
                                                </dd>
                                            </div>
                                            <div className="govuk-summary-list__row">
                                                <dt className="govuk-summary-list__key">
                                                    Date closed
                                                </dt>
                                                <dd className="govuk-summary-list__value">
                                                    {(providerDetails !== undefined) ?
                                                        <DateFormatter date={providerDetails.dateClosed} utc={false} /> : "Unknown"}
                                                </dd>
                                            </div>
                                            <div className="govuk-summary-list__row">
                                                <dt className="govuk-summary-list__key">
                                                    Reason establishment opened
                                                </dt>
                                                <dd className="govuk-summary-list__value">
                                                    {providerDetails.reasonEstablishmentOpened}
                                                </dd>
                                            </div>
                                            <div className="govuk-summary-list__row">
                                                <dt className="govuk-summary-list__key">
                                                    Reason establishment closed
                                                </dt>
                                                <dd className="govuk-summary-list__value">
                                                    {providerDetails.reasonEstablishmentClosed}
                                                </dd>
                                            </div>
                                        </dl>
                                        <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />
                                        <h4 className="govuk-heading-m">Trust details</h4>
                                        <dl className="govuk-summary-list govuk-!-margin-bottom-6 govuk-summary-list--no-border">
                                            <div className="govuk-summary-list__row">
                                                <dt className="govuk-summary-list__key">
                                                    Status
                                                </dt>
                                                <dd className="govuk-summary-list__value">
                                                    {providerDetails.trustStatus}
                                                </dd>
                                            </div>
                                            <div className="govuk-summary-list__row">
                                                <dt className="govuk-summary-list__key">
                                                    Name
                                                </dt>
                                                <dd className="govuk-summary-list__value">
                                                    {providerDetails.trustName}
                                                </dd>
                                            </div>
                                            <div className="govuk-summary-list__row">
                                                <dt className="govuk-summary-list__key">
                                                    Code
                                                </dt>
                                                <dd className="govuk-summary-list__value">
                                                    {providerDetails.trustCode}
                                                </dd>
                                            </div>
                                        </dl>
                                        <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />
                                        <h4 className="govuk-heading-m">Payment organisation details</h4>
                                        <dl className="govuk-summary-list govuk-!-margin-bottom-6 govuk-summary-list--no-border">
                                            <div className="govuk-summary-list__row">
                                                <dt className="govuk-summary-list__key">
                                                    Name
                                                </dt>
                                                <dd className="govuk-summary-list__value">
                                                    {providerDetails.paymentOrganisationName}
                                                </dd>
                                            </div>
                                            <div className="govuk-summary-list__row">
                                                <dt className="govuk-summary-list__key">
                                                    Identifier
                                                </dt>
                                                <dd className="govuk-summary-list__value">
                                                    {providerDetails.paymentOrganisationIdentifier}
                                                </dd>
                                            </div>
                                        </dl>
                                    </section>
                                }
                            </Tabs.Panel>
                        </Tabs>
                    </div>
                </div>
            </div>
            &nbsp;
            <Footer />
        </div>
    );
}