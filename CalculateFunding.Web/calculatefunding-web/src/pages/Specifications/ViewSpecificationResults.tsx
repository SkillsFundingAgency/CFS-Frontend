import * as React from "react"
import {Footer} from "../../components/Footer";
import {Header} from "../../components/Header";
import {Tabs} from "../../components/Tabs";
import {RouteComponentProps} from "react-router";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {useErrors} from "../../hooks/useErrors";
import {AdditionalCalculations} from "../../components/Calculations/AdditionalCalculations";
import {FundingLineResults} from "../../components/fundingLineStructure/FundingLineResults";
import {PublishStatus} from "../../types/PublishStatusModel";
import {DownloadableReports} from "../../components/Reports/DownloadableReports";
import {useSpecificationSummary} from "../../hooks/useSpecificationSummary";
import {LoadingStatus} from "../../components/LoadingStatus";

export interface ViewSpecificationResultsRoute {
    specificationId: string
}

export function ViewSpecificationResults({match}: RouteComponentProps<ViewSpecificationResultsRoute>) {
    const {errors, addErrorMessage, addError, clearErrorMessages} = useErrors();
    const specificationId = match.params.specificationId;
    const { specification, isLoadingSpecification } =
        useSpecificationSummary(specificationId, err =>
            addErrorMessage(err.message, "Error while loading specification"));

    return <div>
        <Header location={Section.Results}/>
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"}/>
                <Breadcrumb name={"View results"} url={"/results"}/>
                <Breadcrumb name={"Select specification"} url={"/SelectSpecification"}/>
                <Breadcrumb name={specification ? specification.name : ""}/>
            </Breadcrumbs>

            <MultipleErrorSummary errors={errors}/>
            <LoadingStatus title={"Loading specification"} hidden={!isLoadingSpecification} />
            <div className="govuk-main-wrapper" hidden={isLoadingSpecification}>
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <h1 className="govuk-heading-xl">{specification !== undefined ? specification.name : ""}</h1>
                        <h2 className="govuk-caption-xl">{specification !== undefined ? specification.fundingPeriod.name : ""}</h2>
                    </div>
                </div>
                <div className="govuk-grid-row govuk-!-padding-top-5">
                    <div className="govuk-grid-column-full" hidden={isLoadingSpecification}>
                        <Tabs initialTab="fundingline-structure">
                            <ul className="govuk-tabs__list">
                                <Tabs.Tab label="fundingline-structure">Funding line structure</Tabs.Tab>
                                <Tabs.Tab label="additional-calculations">Additional Calculations</Tabs.Tab>
                                <Tabs.Tab label="downloadable-reports">Downloadable Reports</Tabs.Tab>
                            </ul>
                            <Tabs.Panel label="fundingline-structure">
                                {specification !== undefined && specification.fundingStreams.length > 0 ?
                                    <FundingLineResults
                                        specificationId={specification.id}
                                        fundingStreamId={specification.fundingStreams[0].id}
                                        fundingPeriodId={specification.fundingPeriod.id}
                                        status={specification.approvalStatus as PublishStatus}
                                        addError={addError}
                                        clearErrorMessages={clearErrorMessages} /> : ""}
                            </Tabs.Panel>
                            <Tabs.Panel label="additional-calculations">
                                <AdditionalCalculations specificationId={specificationId} addError={addErrorMessage}/>
                            </Tabs.Panel>
                            <Tabs.Panel label="downloadable-reports">
                                <DownloadableReports
                                    fundingPeriodId={specification !== undefined ? specification.fundingPeriod.id : ""}
                                    specificationId={specificationId}
                                />
                            </Tabs.Panel>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
        <Footer/>
    </div>
}