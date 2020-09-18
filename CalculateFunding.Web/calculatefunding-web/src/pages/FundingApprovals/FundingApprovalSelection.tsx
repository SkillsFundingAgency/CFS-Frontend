import React, {useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {
    getFundingPeriodsByFundingStreamIdService,
    getFundingStreamsForSelectedSpecifications,
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
    const [isLoadingSpecification, setIsLoadingSpecification] = useState<boolean>(false);
    const [isLoadingStreams, setIsLoadingStreams] = useState<boolean>(true);
    const [isLoadingPeriods, setIsLoadingPeriods] = useState<boolean>(false);

    useEffectOnce(() => {
        getFundingStreamsForSelectedSpecifications()
            .then((result) => setFundingStreams(result.data))
            .finally(() => setIsLoadingStreams(false));
    });

    function populateFundingPeriods(fundingStream: string) {
        setSelectedSpecification(initialSpecificationState);
        if (fundingStream === "") {
            setFundingPeriods([]);
        } else {
            setIsLoadingPeriods(true);
            getFundingPeriodsByFundingStreamIdService(fundingStream)
                .then((result) => setFundingPeriods(result.data as FundingPeriod[]))
                .finally(() => setIsLoadingPeriods(false));
        }
    }

    function populateSpecification(fundingPeriod: string) {
        if (fundingPeriod !== "") {
            setIsLoadingSpecification(true);
            getSpecificationsSelectedForFundingByPeriod(fundingPeriod)
                .then((result) => {
                    if (result.data.length > 0) {
                        setSelectedSpecification(result.data[0])
                    }
                })
                .finally(() => setIsLoadingSpecification(false));
        }
    }

    function changeFundingStream(e: React.ChangeEvent<HTMLSelectElement>) {
        const fundingStream = e.target.value;
        setSelectedFundingStream(fundingStream);
        setSelectedFundingPeriod("");
        setSelectedSpecification(initialSpecificationState);
        populateFundingPeriods(fundingStream)
    }

    function changeFundingPeriod(e: React.ChangeEvent<HTMLSelectElement>) {
        const fundingPeriod = e.target.value;
        setSelectedFundingPeriod(fundingPeriod);
        populateSpecification(fundingPeriod)
    }

    return <div>
        <Header location={Section.Approvals}/>
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"}/>
                <Breadcrumb name={"Approvals"}/>
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
                    {isLoadingStreams ?
                        <LoadingFieldStatus title={"Loading..."}/>
                        :
                        <select className="govuk-select" id="funding-streams" name="sort" 
                                onChange={changeFundingStream} data-testid={"funding-stream-dropdown"}>
                            <option></option>
                            {fundingStreams.map((fs, index) => <option key={index} value={fs.id}>{fs.name}</option>)}
                        </select>
                    }
                </div>
                {!isLoadingStreams && selectedFundingStream.length > 0 && 
                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="sort">
                        Funding period
                    </label>
                    {isLoadingPeriods ?
                        <LoadingFieldStatus title={"Loading..."}/>
                        :
                        <select className="govuk-select"
                                id="funding-periods"
                                data-testid={"funding-period-dropdown"}
                                onChange={changeFundingPeriod}>
                            <option value=""></option>
                            {fundingPeriods.map((fp, index) => <option key={index} value={fp.id}>{fp.name}</option>)}
                        </select>
                    }
                </div>
                }
                {selectedFundingStream.length > 0 && selectedFundingPeriod.length > 0 && !isLoadingPeriods &&
                <div className="govuk-form-group">
                    <label className="govuk-label">
                        Specification
                    </label>
                    {isLoadingSpecification &&
                    <LoadingFieldStatus title={"Loading..."}/>
                    }
                    {!isLoadingSpecification && (!selectedSpecification || selectedSpecification.name.length === 0) &&
                    <div className="govuk-error-summary">
                        <span className="govuk-body-m" data-testid={"no-specification"}>No specification exists for your selections</span>
                    </div>
                    }
                    {!isLoadingSpecification && selectedSpecification && selectedSpecification.name.length > 0 &&
                    <>
                        <h3 className="govuk-heading-m">{selectedSpecification.name}</h3>
                        <Link to={`/Approvals/SpecificationFundingApproval/${selectedFundingStream}/${selectedFundingPeriod}/${selectedSpecification.id}`}
                              data-testid={"view-funding-link"}
                              className="govuk-button" 
                              data-module="govuk-button">
                            View funding
                        </Link>
                    </>
                    }
                </div>
                }
            </div>
        </div>
        <Footer/>
    </div>
}