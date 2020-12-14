import React, {useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {LoadingFieldStatus} from "../../components/LoadingFieldStatus";
import {Footer} from "../../components/Footer";
import {useOptionsForSpecificationsSelectedForFunding} from "../../hooks/FundingApproval/useOptionsForSpecificationsSelectedForFunding";
import {FundingPeriodWithSpecificationSelectedForFunding, FundingStreamWithSpecificationSelectedForFunding} from "../../types/SpecificationSelectedForFunding";
import {useFundingConfiguration} from "../../hooks/useFundingConfiguration";
import {useErrors} from "../../hooks/useErrors";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {useHistory} from "react-router";

export function FundingApprovalSelection() {
    const [selectedFundingStream, setSelectedFundingStream] = useState<FundingStreamWithSpecificationSelectedForFunding>();
    const [selectedFundingPeriod, setSelectedFundingPeriod] = useState<FundingPeriodWithSpecificationSelectedForFunding>();
    const [batchUpload, setBatchUpload] = useState<boolean | undefined>(undefined);
    const history = useHistory();
    const {fundingStreams, isLoadingOptions, isErrorCheckingForOptions, errorCheckingForOptions} =
        useOptionsForSpecificationsSelectedForFunding({
            onError: err => addError(err, "Error while loading selections")
        });
    const {errors, addError, clearErrorMessages} = useErrors();
    const {fundingConfiguration, isLoadingFundingConfiguration} =
        useFundingConfiguration(selectedFundingStream?.id, selectedFundingPeriod?.id,
            err => addError(err, "Error while loading funding configuration"));

    const changeFundingStream = (e: React.ChangeEvent<HTMLSelectElement>) => {
        clearErrorMessages();
        if (fundingStreams) {
            setSelectedFundingStream(fundingStreams.find(stream => stream.id === e.target.value));
            setSelectedFundingPeriod(undefined);
        }
    }

    const changeFundingPeriod = (e: React.ChangeEvent<HTMLSelectElement>) => {
        clearErrorMessages();
        if (selectedFundingStream) {
            setSelectedFundingPeriod(selectedFundingStream.periods.find(period => period.id === e.target.value));
        }
    }

    const proceedToNextStep = () => {
        if (!selectedFundingStream || !selectedFundingPeriod || batchUpload === undefined) return;
        
        history.push(batchUpload ? 
            `/Approvals/UploadBatch/${selectedFundingStream.id}/${selectedFundingPeriod.id}/${selectedFundingPeriod.specifications[0].id}` :
            `/Approvals/SpecificationFundingApproval/${selectedFundingStream.id}/${selectedFundingPeriod.id}/${selectedFundingPeriod.specifications[0].id}`);
    }

    return <div>
        <Header location={Section.Approvals}/>
        <div className="govuk-width-container">
            
            <div className="govuk-grid-row  govuk-!-margin-bottom-9">
                <div className="govuk-grid-column-full">
                    <Breadcrumbs>
                        <Breadcrumb name={"Calculate funding"} url={"/"}/>
                        <Breadcrumb name={"Approvals"}/>
                        <Breadcrumb name={"Select specification"}/>
                    </Breadcrumbs>
                    <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">Select specification</h1>
                    <span className="govuk-caption-xl">You can select the specification and funding period.</span>
                </div>
            </div>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <MultipleErrorSummary errors={errors}/>
                
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
                <>
                    {isLoadingFundingConfiguration && <LoadingFieldStatus title="Checking for approval mode..."/>}
                    {!isLoadingFundingConfiguration && fundingConfiguration && fundingConfiguration.approvalMode &&
                        <>
                            <div className="govuk-radios govuk-radios--inline">
                                <label className="govuk-label govuk-!-margin-bottom-2" htmlFor="file-upload-1">
                                    Select yes if you wish to process a preselected batch of providers
                                </label>
                                <div className="govuk-radios__item">
                                    <input className="govuk-radios__input" 
                                           id="yesUpload" 
                                           name="yesUpload"
                                           aria-label="Approve using an upload of selected providers"
                                           onChange={() => setBatchUpload(true)}
                                           type="radio" />
                                    <label className="govuk-label govuk-radios__label" htmlFor="yesUpload">
                                        Yes
                                    </label>
                                </div>
                                <div className="govuk-radios__item govuk-!-margin-bottom-7">
                                    <input className="govuk-radios__input" 
                                           id="noUpload"
                                           name="noUpload"
                                           aria-label="Approve without an upload"
                                           onClick={() => setBatchUpload(false)}
                                           type="radio" />
                                    <label className="govuk-label govuk-radios__label" htmlFor="noUpload">
                                        No
                                    </label>
                                </div>
                            </div>
                            <div className="govuk-form-group">
                                <label className="govuk-label">
                                    Specification
                                </label>
                                <p className="govuk-heading-s">{selectedFundingPeriod.specifications[0].name}</p>
                                <button className="govuk-button"
                                        type="button"
                                        data-module="govuk-button"
                                        aria-controls="navigation"
                                        aria-label="Continue to upload page"
                                        disabled={!selectedFundingStream || !selectedFundingPeriod || batchUpload === undefined}
                                        onClick={proceedToNextStep}>Continue</button>
                            </div>
                        </>
                    }
                </>
                }
            </div>
            </div>
        </div>
        <Footer/>
    </div>
}