import React, {useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Link} from "react-router-dom";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {LoadingFieldStatus} from "../../components/LoadingFieldStatus";
import {Footer} from "../../components/Footer";
import {useOptionsForSpecificationsSelectedForFunding} from "../../hooks/FundingApproval/useOptionsForSpecificationsSelectedForFunding";
import {FundingPeriodWithSpecificationSelectedForFunding, FundingStreamWithSpecificationSelectedForFunding} from "../../types/SpecificationSelectedForFunding";
import {ErrorSummary} from "../../components/ErrorSummary";

export function FundingApprovalSelection() {
    const [selectedFundingStream, setSelectedFundingStream] = useState<FundingStreamWithSpecificationSelectedForFunding>();
    const [selectedFundingPeriod, setSelectedFundingPeriod] = useState<FundingPeriodWithSpecificationSelectedForFunding>();
    const {fundingStreams, isLoadingOptions, isErrorCheckingForOptions, errorCheckingForOptions} = useOptionsForSpecificationsSelectedForFunding();

    function changeFundingStream(e: React.ChangeEvent<HTMLSelectElement>) {
        if (fundingStreams) {
            setSelectedFundingStream(fundingStreams.find(stream => stream.id === e.target.value));
            setSelectedFundingPeriod(undefined);
        }
    }

    function changeFundingPeriod(e: React.ChangeEvent<HTMLSelectElement>) {
        if (selectedFundingStream) {
            setSelectedFundingPeriod(selectedFundingStream.periods.find(period => period.id === e.target.value));
        }
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
                {isErrorCheckingForOptions &&
                <ErrorSummary title={"There was a problem"} error={errorCheckingForOptions} suggestion={"Please try again"}/>
                }
                <div className="govuk-grid-row  govuk-!-margin-bottom-9">
                    <div className="govuk-grid-column-full">
                        <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">Select specification</h1>
                        <span className="govuk-caption-xl">You can select the specification and funding period.</span>
                    </div>
                </div>
                {!isErrorCheckingForOptions &&
                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="sort">
                        Funding stream
                    </label>
                    {!isLoadingOptions && fundingStreams && fundingStreams.length > 0 ?
                        <select className="govuk-select" id="funding-streams" name="sort"
                                onChange={changeFundingStream} data-testid={"funding-stream-dropdown"}>
                            <option>Please select</option>
                            {fundingStreams.map((fs, index) => <option key={index} value={fs.id}>{fs.name}</option>)}
                        </select>
                        :
                        <LoadingFieldStatus title={"Loading..."}/>
                    }
                </div>}
                {!isLoadingOptions && selectedFundingStream &&
                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="sort">
                        Funding period
                    </label>
                    <select className="govuk-select"
                            id="funding-periods"
                            data-testid={"funding-period-dropdown"}
                            onChange={changeFundingPeriod}>
                        <option>Please select</option>
                        {selectedFundingStream.periods.map((fp, index) =>
                            <option key={index} value={fp.id}>{fp.name}</option>)}
                    </select>
                </div>
                }
                {selectedFundingStream && selectedFundingPeriod && selectedFundingPeriod.specifications.length > 0 &&
                <div className="govuk-form-group">
                    <label className="govuk-label">
                        Specification
                    </label>
                    <h3 className="govuk-heading-m">{selectedFundingPeriod.specifications[0].name}</h3>
                    <Link to={`/Approvals/SpecificationFundingApproval/${selectedFundingStream.id}/${selectedFundingPeriod.id}/${selectedFundingPeriod.specifications[0].id}`}
                          data-testid={"view-funding-link"}
                          className="govuk-button"
                          data-module="govuk-button">
                        View funding
                    </Link>
                </div>
                }
            </div>
        </div>
        <Footer/>
    </div>
}