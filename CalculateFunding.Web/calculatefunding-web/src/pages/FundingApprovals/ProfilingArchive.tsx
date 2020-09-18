import React, {useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {RouteComponentProps} from "react-router";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {getSpecificationSummaryService} from "../../services/specificationService";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {getProviderByIdAndVersionService} from "../../services/providerService";
import {ProviderSummary} from "../../types/ProviderSummary";
import {getProfileArchiveService} from "../../services/publishService";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {ProfileArchiveViewModel} from "../../types/Profiling/ProfileArchiveViewModel";
import {AccordianPanel} from "../../components/AccordianPanel";
import {FormattedNumber, NumberType} from "../../components/FormattedNumber";
import {LoadingStatus} from "../../components/LoadingStatus";
import {Footer} from "../../components/Footer";
import {Link} from "react-router-dom";

export interface ProfilingArchiveRouteProps {
    specificationId: string;
    providerId: string;
    providerVersionId: string;
    fundingStreamId: string;
    fundingPeriodId: string;
}

export function ProfilingArchive({match}: RouteComponentProps<ProfilingArchiveRouteProps>) {

    const [autoExpand, setAutoExpand] = useState(false);
    const [isLoadingProfileArchive, setIsLoadingProfileArchive] = useState(false);
    const [specificationSummary, setSpecificationSummary] = useState<SpecificationSummary>({
        fundingPeriod: {
            name: "",
            id: ""
        },
        approvalStatus: "",
        name: "",
        description: "",
        providerVersionId: "",
        id: "",
        fundingStreams: [
            {
                id: "",
                name: ""
            }
        ],
        isSelectedForFunding: false,
    });
    const [providerSummary, setProvider] = useState<ProviderSummary>({
        authority: "",
        countryCode: "",
        countryName: "",
        crmAccountId: "",
        dateClosed: undefined,
        dateOpened: undefined,
        dfeEstablishmentNumber: "",
        establishmentNumber: "",
        id: "",
        laCode: "",
        legalName: "",
        localGovernmentGroupTypeCode: undefined,
        localGovernmentGroupTypeName: undefined,
        name: "", navVendorNo: "",
        phaseOfEducation: "",
        postcode: "",
        providerId: "",
        providerProfileIdType: "",
        providerSubType: "",
        providerType: "",
        providerVersionId: "",
        reasonEstablishmentClosed: "",
        reasonEstablishmentOpened: "",
        rscRegionCode: "",
        rscRegionName: "",
        status: "",
        successor: "",
        town: "",
        trustCode: "",
        trustName: "",
        trustStatus: "",
        ukprn: "",
        upin: "",
        urn: ""
    });
    const [profileArchive, setProfileArchive] = useState<ProfileArchiveViewModel[]>([{
        name: "",
        version: {
            version: 0,
            date: new Date(),
            profiletotals: [{
                isPaid: false,
                occurrence: 0,
                typeValue: "",
                value: 0,
                year: 0
            }]
        }
    }]);

    useEffectOnce(() => {
        setIsLoadingProfileArchive(true);
        getSpecificationSummaryService(match.params.specificationId).then((response) => {
            if (response.status === 200) {
                const result = response.data as SpecificationSummary;
                setSpecificationSummary(result);

                getProviderByIdAndVersionService(match.params.providerId, result.providerVersionId).then((response) => {
                    if (response.status === 200) {
                        setProvider(response.data as ProviderSummary);
                    }
                });

                getProfileArchiveService(result.fundingStreams[0].id, result.fundingPeriod.id, match.params.providerId).then((response) => {
                    setProfileArchive(response.data as ProfileArchiveViewModel[]);
                    setIsLoadingProfileArchive(false);
                })
            }
        })
    });

    const approvalResultsPath = `/Approvals/SpecificationFundingApproval/${match.params.fundingStreamId}/${match.params.fundingPeriodId}/${match.params.specificationId}`;
    return <div>
        <Header location={Section.Results}/>
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"}/>
                <Breadcrumb name={"Approvals"}/>
                <Breadcrumb name={"Select specification"} url={"/Approvals/Select"} />
                <Breadcrumb name={"Funding approval results"} url={approvalResultsPath}/>
                <Breadcrumb name={"Provider funding overview"} />
            </Breadcrumbs>
            <div className="govuk-main-wrapper">
                <h1 className="govuk-heading-xl">Previous payment profiles</h1>

                <div className="govuk-grid-row govuk-!-margin-bottom-5">
                    <div className="govuk-grid-column-two-thirds">
                        <span className="govuk-caption-m">Provider name</span>
                        <h1 className="govuk-heading-m govuk-!-margin-bottom-2">{providerSummary.name}</h1>
                        <span className="govuk-caption-m">Specification</span>
                        <h1 className="govuk-heading-m">{specificationSummary.name}</h1>
                        <span className="govuk-caption-m">Funding period</span>
                        <h1 className="govuk-heading-m">{specificationSummary.fundingPeriod.name}</h1>
                        <span className="govuk-caption-m">Funding stream</span>
                        <h1 className="govuk-heading-m">{specificationSummary.fundingStreams[0].name}</h1>
                    </div>
                </div>
                <LoadingStatus title={"Loading profile archive"} hidden={!isLoadingProfileArchive} subTitle={"Please wait whilst the profile archive is loading"}/>
                <div className="govuk-accordion" data-module="govuk-accordion" id="accordion-default "
                     hidden={profileArchive.length === 0 || isLoadingProfileArchive}>
                    <div className="govuk-accordion__controls">
                        <button type="button" className="govuk-accordion__open-all"
                                onClick={() => setAutoExpand(!autoExpand)}>{autoExpand ? "Close" : "Open"} all<span
                            className="govuk-visually-hidden"> sections</span></button>

                    </div>
                    {profileArchive.map((pa, index) =>
                        <AccordianPanel id={pa.name} expanded={false} title={pa.name} autoExpand={autoExpand} key={index} boldSubtitle={""} subtitle={""}>
                            <div id={"accordion-default-content-" + index} key={index}
                                 className="govuk-accordion__section-content">
                                <span className="govuk-caption-m">Total allocation for 2019 to 2020</span>
                                <h3 className="govuk-heading-m govuk-!-margin-bottom-2">£28,500,000</h3>
                                <span className="govuk-caption-m">Previous allocation value</span>
                                <h3 className="govuk-heading-m">£26,000,000</h3>
                                <table className="govuk-table">
                                    <caption className="govuk-table__caption">Profiling installments</caption>
                                    <thead className="govuk-table__head">
                                    <tr className="govuk-table__row">
                                        <th scope="col" className="govuk-table__header">Installment month</th>
                                        <th scope="col" className="govuk-table__header">Installment number</th>
                                        <th scope="col"
                                            className="govuk-table__header govuk-table__header--numeric">Value
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="govuk-table__body">
                                    {pa.version.profiletotals.map((pt, pindex) =>
                                        <tr className="govuk-table__row" key={pindex}>
                                            <th scope="row" className="govuk-table__header">{pt.typeValue} {pt.year}
                                                <span hidden={!pt.isPaid}><strong className="govuk-tag">Paid</strong></span>
                                            </th>
                                            <td className="govuk-table__cell">{pt.occurrence}</td>
                                            <td className="govuk-table__cell govuk-table__cell--numeric"><FormattedNumber value={pt.value} type={NumberType.FormattedMoney}/></td>
                                        </tr>)}
                                    </tbody>
                                </table>
                            </div>
                        </AccordianPanel>
                    )}
                </div>

                <Link to={approvalResultsPath} className="govuk-button" data-module="govuk-button">
                    Back
                </Link>
            </div>
        </div>
        <Footer/>
    </div>
}
