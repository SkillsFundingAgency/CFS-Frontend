import React, {useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {
    getFundingPeriodsByFundingStreamIdService, getFundingStreamsForSelectedSpecifications,
    getSpecificationsSelectedForFundingByPeriod
} from "../../services/specificationService";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {FundingPeriod, FundingStream} from "../../types/viewFundingTypes";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {Link} from "react-router-dom";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {LoadingFieldStatus} from "../../components/LoadingFieldStatus";
import {Footer} from "../../components/Footer";

export function FundingApprovalSelection() {

    const initialSpecificationState = {
        isSelectedForFunding: false,
        fundingStreams: [],
        id: "",
        providerVersionId: "",
        description: "",
        name: "",
        approvalStatus: "",
        fundingPeriod: {
            id: "",
            name: ""
        }
    };

    const [fundingStreams, setFundingStreams] = useState<FundingStream[]>([]);
    const [selectedFundingStream, setSelectedFundingStream] = useState<string>("");
    const [selectedFundingPeriod, setSelectedFundingPeriod] = useState<string>("");
    const [selectedSpecification, setSelectedSpecification] = useState<SpecificationSummary>(initialSpecificationState);
    const [fundingPeriods, setFundingPeriods] = useState<FundingPeriod[]>([]);

    const [loadingState, setLoadingState] = useState({
        specification: {
            loading: false,
            loaded: false,
            data: false
        }
    });


    useEffectOnce(() => {
        getFundingStreamsForSelectedSpecifications().then((result) => {
            setFundingStreams(result.data as FundingStream[]);
        })
    });

    function populateFundingPeriod(fundingStream: string) {
        if (fundingStream === "") {
            setFundingPeriods([]);
            setSelectedSpecification(initialSpecificationState)
        } else {
            getFundingPeriodsByFundingStreamIdService(fundingStream).then((result) => {
                setFundingPeriods(result.data as FundingPeriod[])
            });
        }
    }

    function populateSpecification(fundingPeriod: string) {
        if (fundingPeriod !== "") {
            setLoadingState(prevState => {
                return {
                    ...prevState,
                    specification: {
                        loading: true,
                        loaded: false,
                        data: false
                    }
                }
            });
            getSpecificationsSelectedForFundingByPeriod(fundingPeriod).then((result) => {
                if (result.data.length > 0) {
                    setSelectedSpecification(result.data[0] as SpecificationSummary)
                }
                setLoadingState(prevState => {
                    return {
                        ...prevState,
                        specification: {
                            loading: false,
                            loaded: true,
                            data: result.data.length > 0
                        }
                    }
                })
            });
        }
    }

    function changeFundingStream(e: React.ChangeEvent<HTMLSelectElement>) {
        const fundingStream = e.target.value;
        setSelectedFundingStream(fundingStream)
        populateFundingPeriod(fundingStream)
    }


    function changeFundingPeriod(e: React.ChangeEvent<HTMLSelectElement>) {
        const fundingPeriod = e.target.value;
        setSelectedFundingPeriod(fundingPeriod)
        populateSpecification(fundingPeriod)
    }

    return <div>
        <Header location={Section.Approvals}/>
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"}/>
                <Breadcrumb name={"Select specification"}/>
            </Breadcrumbs>

            <div className="govuk-main-wrapper">
                <div className="govuk-grid-row  govuk-!-margin-bottom-9">
                    <div className="govuk-grid-column-full">
                        <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">Select specification</h1>
                        <span className="govuk-caption-xl">You can select the specification and funding period.</span>
                    </div>
                </div>
                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="sort">
                        Funding stream
                    </label>
                    <select className="govuk-select" id="funding-streams" name="sort"
                            onChange={(e) => changeFundingStream(e)}>
                        <option></option>
                        {fundingStreams.map((fs, index) => <option key={index} value={fs.id}>{fs.name}</option>)}
                    </select>
                </div>
                <div className="govuk-form-group" hidden={fundingPeriods.length === 0}>
                    <label className="govuk-label" htmlFor="sort">
                        Funding period
                    </label>
                    <select className="govuk-select" id="funding-periods" name="sort" disabled={fundingPeriods.length === 0}
                            onChange={(e) => changeFundingPeriod(e)}>
                        <option value=""></option>
                        {fundingPeriods.map((fp, index) => <option key={index} value={fp.id}>{fp.name}</option>)}
                    </select>
                </div>
                <LoadingFieldStatus title="Loading specifications" hidden={!loadingState.specification.loading}/>
                <div className="govuk-form-group" hidden={!(loadingState.specification.loaded && !loadingState.specification.data) || loadingState.specification.loading}>
                    <label className="govuk-label">
                        Specification
                    </label>
                    <div className="govuk-error-summary">
                        <span className="govuk-body-m">There are no specifications available for the selection</span>
                    </div>
                </div>
                <div className="govuk-form-group" hidden={!(loadingState.specification.loaded && loadingState.specification.data) || loadingState.specification.loading}>

                    <label className="govuk-label">
                        Specification
                    </label>
                    <h3 className="govuk-heading-m">{selectedSpecification.name}</h3>

                    <Link to={`/approvals/FundingApprovalResults/${selectedFundingStream}/${selectedFundingPeriod}/${selectedSpecification.id}`}
                          className="govuk-button" data-module="govuk-button">
                        View funding
                    </Link>

                </div>
            </div>
        </div>
        <Footer/>
    </div>
}