import React, {useEffect} from 'react';
import {useSelector, useDispatch} from "react-redux";
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import {IStoreState} from './reducers/rootReducer';
import {FeatureFlagsState} from './states/FeatureFlagsState';
import {getHasUserConfirmedSkills, getUserFundingStreamPermissions} from "./actions/userAction";
import './App.scss'
import {Footer} from "./components/Footer";
import {Section} from "./types/Sections";
import {Home} from "./pages/Home";
import {Header} from "./components/Header";
import {ViewResults} from "./pages/ViewResults";
import {ViewCalculationResults} from "./pages/ViewCalculationResults";
import {ProviderFundingOverview} from "./pages/FundingApprovals/ProviderFundingOverview";
import {CreateSpecification} from "./pages/Specifications/CreateSpecification";
import {CreateDataset} from "./pages/Datasets/CreateDataset";
import {EditSpecification} from "./pages/Specifications/EditSpecification";
import {ListTemplates} from "./pages/Templates/ListTemplates";
import {PublishTemplate} from "./pages/Templates/PublishTemplate";
import {EditTemplate} from "./pages/Templates/EditTemplate";
import {CreateTemplate} from "./pages/Templates/CreateTemplate";
import {CloneTemplate} from "./pages/Templates/CloneTemplate";
import {ListVersions} from "./pages/Templates/ListVersions";
import {SelectSpecification} from "./pages/Specifications/SelectSpecification";
import {SpecificationsList} from "./pages/Specifications/SpecificationsList";
import {ViewSpecificationResults} from "./pages/Specifications/ViewSpecificationResults";
import {ViewSpecification} from "./pages/Specifications/ViewSpecification";
import {CreateAdditionalCalculation} from "./pages/Calculations/CreateAdditionalCalculation";
import {ManageData} from "./pages/Datasets/ManageData";
import {EditVariationPoints} from "./pages/Specifications/EditVariationPoints";
import {CalculationVersionHistory} from "./pages/Calculations/CalculationVersionHistory";
import {FundingApprovalSelection} from "./pages/FundingApprovals/FundingApprovalSelection";
import {getFeatureFlags} from "./actions/FeatureFlagsActions";
import {DownloadDataSchema} from "./pages/Datasets/DownloadDataSchema";
import {DatasetHistory} from "./pages/Datasets/DatasetHistory";
import {UpdateDataSourceFile} from "./pages/Datasets/UpdateDataSourceFile";
import {LoadNewDataSource} from "./pages/Datasets/LoadNewDataSource";
import {ManageDataSourceFiles} from "./pages/Datasets/ManageDataSourceFiles";
import {SpecificationFundingApproval} from "./pages/FundingApprovals/SpecificationFundingApproval";
import {MapDataSourceFiles} from "./pages/Datasets/MapDataSourceFiles";
import {ViewProvidersFundingStreamSelection} from "./pages/ViewResults/ViewProvidersFundingStreamSelection";
import {ViewProvidersByFundingStream} from "./pages/ViewResults/ViewProvidersByFundingStream";
import {DataRelationships} from "./pages/Datasets/DataRelationships";
import {SelectDataSource} from "./pages/Datasets/SelectDataSource";
import {SelectDataSourceExpanded} from "./pages/Datasets/SelectDataSourceExpanded";
import {ViewProviderResults} from "./pages/ViewResults/ViewProviderResults";
import {ConfirmationModal} from "./components/ConfirmationModal";
import {ConfirmSkills} from "./pages/ConfirmSkills";
import {LoadingStatus} from "./components/LoadingStatus";
import {CompareCalculationVersions} from "./pages/Calculations/CompareCalculationVersions";
import {ViewFundingLineProfile} from "./pages/FundingApprovals/ViewFundingLineProfile";
import {ChangeProfileType} from "./pages/FundingApprovals/ChangeProfileType";
import {
    QueryCache,
    ReactQueryCacheProvider,
} from "react-query";
import {ReactQueryDevtools} from "react-query-devtools";
import {ProfileHistory} from './pages/FundingApprovals/ProfileHistory';
import {EditCalculation} from "./pages/Calculations/EditCalculation";
import {ConfirmFunding} from "./pages/FundingApprovals/ConfirmFunding";
import {RefreshSql} from "./pages/Datasets/RefreshSql";
import {UploadBatch} from "./pages/FundingApprovals/UploadBatch";

const queryCache = new QueryCache();

const App: React.FunctionComponent = () => {
    const featureFlagsState: FeatureFlagsState = useSelector<IStoreState, FeatureFlagsState>(state => state.featureFlags);
    const hasConfirmedSkills: boolean | undefined = useSelector((state: IStoreState) => state.userState && state.userState.hasConfirmedSkills);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getHasUserConfirmedSkills());
    }, []);

    useEffect(() => {
        if (hasConfirmedSkills) {
            dispatch(getFeatureFlags());
            dispatch(getUserFundingStreamPermissions());
        }
    }, [hasConfirmedSkills]);

    if (hasConfirmedSkills === undefined) {
        return (
            <div>
                <LoadingStatus title={"Loading"}
                               subTitle={"Please wait while the page is loading..."}/>
                <Footer/>
            </div>
        );
    }
    if (hasConfirmedSkills === true) {
        return (
            <BrowserRouter basename="/app"
                           getUserConfirmation={(message, callback) => ConfirmationModal(message, callback, 'Leave this page', 'Stay on this page')}>
                <ReactQueryCacheProvider queryCache={queryCache}>
                    <Switch>
                        <Route exact path="/"><Home featureFlags={featureFlagsState}/></Route>
                        <Route path="/Approvals/Select" component={FundingApprovalSelection}/>
                        <Route path="/Approvals/FundingApprovalSelection/" component={FundingApprovalSelection}/>
                        <Route path="/Approvals/SpecificationFundingApproval/:fundingStreamId/:fundingPeriodId/:specificationId" component={SpecificationFundingApproval}/>
                        <Route path="/Approvals/ConfirmFunding/:fundingStreamId/:fundingPeriodId/:specificationId/:mode" component={ConfirmFunding}/>
                        <Route path="/Approvals/UploadBatch/:fundingStreamId/:fundingPeriodId/:specificationId" component={UploadBatch}/>
                        <Route path="/Results/" component={ViewResults}/>
                        <Route path="/ViewResults/ViewProvidersFundingStreamSelection" component={ViewProvidersFundingStreamSelection}/>
                        <Route path="/ViewResults/ViewProvidersByFundingStream/:fundingStreamId" component={ViewProvidersByFundingStream}/>
                        <Route path="/ViewResults/ViewProviderResults/:providerId/:fundingStreamId" component={ViewProviderResults}/>
                        <Route path="/SelectSpecification" component={SelectSpecification}/>
                        <Route path="/SpecificationsList" component={SpecificationsList}/>
                        <Route path="/ViewSpecificationResults/:specificationId" component={ViewSpecificationResults}/>
                        <Route path="/ViewSpecification/:specificationId" component={ViewSpecification}/>
                        <Route path="/ViewCalculationResults/:calculationId" component={ViewCalculationResults}/>
                        <Route path="/Approvals/ProviderFundingOverview/:specificationId/:providerId/:specCoreProviderVersionId/:fundingStreamId/:fundingPeriodId/:fundingLineId/change-profile-type"
                               component={ChangeProfileType}/>
                        <Route path="/Approvals/ProviderFundingOverview/:specificationId/:providerId/:specCoreProviderVersionId/:fundingStreamId/:fundingPeriodId/:fundingLineId"
                               component={ViewFundingLineProfile}/>
                        <Route path="/Approvals/ProviderFundingOverview/:specificationId/:providerId/:specCoreProviderVersionId/:fundingStreamId/:fundingPeriodId"
                               component={ProviderFundingOverview}/>
                        <Route path="/Approvals/ProfilingHistory/:specificationId/:providerId/:providerVersionId/:fundingStreamId/:fundingPeriodId/:fundingLineCode" component={ProfileHistory}/>
                        <Route path="/Datasets/CreateDataset/:specificationId" component={CreateDataset}/>
                        <Route path="/Datasets/ManageData" component={ManageData}/>
                        <Route path="/Datasets/DownloadDataSchema" component={DownloadDataSchema}/>
                        <Route path="/Datasets/DatasetHistory/:datasetId" component={DatasetHistory}/>
                        <Route path="/Datasets/UpdateDataSourceFile/:fundingStreamId/:datasetId" component={UpdateDataSourceFile}/>
                        <Route path="/Datasets/LoadNewDataSource" component={LoadNewDataSource}/>
                        <Route path="/Datasets/ManageDataSourceFiles" component={ManageDataSourceFiles}/>
                        <Route path="/Datasets/DataRelationships/:specificationId" component={DataRelationships}/>
                        <Route path="/Datasets/MapDataSourceFiles" component={MapDataSourceFiles}/>
                        <Route path="/Datasets/SelectDataSource/:datasetRelationshipId" component={SelectDataSource}/>
                        <Route path="/Datasets/SelectDataSourceExpanded/:specificationId/:datasetId/:relationshipId"
                               component={SelectDataSourceExpanded}/>
                        <Route path="/Datasets/RefreshSql" component={RefreshSql} />
                        <Route path="/Specifications/CreateSpecification" component={CreateSpecification}/>
                        <Route path="/Specifications/EditSpecification/:specificationId" component={EditSpecification}/>
                        {featureFlagsState.templateBuilderVisible && <Route path="/Templates/List" component={ListTemplates}/>}
                        {featureFlagsState.templateBuilderVisible && <Route path="/Templates/:templateId/Edit" component={EditTemplate}/>}
                        {featureFlagsState.templateBuilderVisible && <Route path="/Templates/:templateId/Versions/:version" component={EditTemplate}/>}
                        {featureFlagsState.templateBuilderVisible && <Route path="/Templates/:templateId/Versions" component={ListVersions}/>}
                        {featureFlagsState.templateBuilderVisible && <Route path="/Templates/Create" component={CreateTemplate}/>}
                        {featureFlagsState.templateBuilderVisible && <Route path="/Templates/:templateId/Clone/:version" component={CloneTemplate}/>}
                        {featureFlagsState.templateBuilderVisible && <Route path="/Templates/Publish/:templateId" component={PublishTemplate}/>}
                        <Route path="/Specifications/CreateAdditionalCalculation/:specificationId" component={CreateAdditionalCalculation}/>
                        <Route path="/Specifications/EditCalculation/:calculationId" component={EditCalculation}/>
                        <Route path="/Specifications/EditVariationPoints/:specificationId" component={EditVariationPoints}/>
                        <Route path="/Calculations/CalculationVersionHistory/:calculationId" component={CalculationVersionHistory}/>
                        <Route path="/Calculations/CompareCalculationVersions/:calculationId/:firstCalculationVersionId/:secondCalculationVersionId" component={CompareCalculationVersions}/>
                        <Route path="*">
                            <NoMatch/>
                        </Route>
                    </Switch>
                    {process.env.NODE_ENV === 'development' && featureFlagsState.enableReactQueryDevTool &&
                    <ReactQueryDevtools initialIsOpen={false}/>
                    }
                </ReactQueryCacheProvider>
            </BrowserRouter>
        );
    } else {
        return <BrowserRouter basename="/app">
            <Switch>
                <Route exact path="/"><Home featureFlags={featureFlagsState}/></Route>
                <Route path="*">
                    <ConfirmSkills/>
                </Route>
            </Switch>
        </BrowserRouter>
    }
};

function NoMatch() {
    return (
        <div>
            <Header location={Section.Home}/>
            <div className="govuk-width-container">
                <main className="govuk-main-wrapper govuk-main-wrapper--l" id="main-content" role="main">
                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-two-thirds">
                            <h1 className="govuk-heading-xl">Page not found</h1>
                            <p className="govuk-body">
                                If you typed the web address, check it is correct.
                            </p>
                            <p className="govuk-body">
                                If you pasted the web address, check you copied the entire address.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
            <Footer/>
        </div>
    );
}

export default App;
