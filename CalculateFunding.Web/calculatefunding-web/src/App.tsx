import React, { useEffect } from 'react';
import { useSelector } from "react-redux";
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Home } from "./pages/Home";
import './App.scss'
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { ViewResults } from "./pages/ViewResults";
import { ViewCalculationResults } from "./pages/ViewCalculationResults";
import { ProviderFundingOverview } from "./pages/ProviderFundingOverview";
import { CreateSpecification } from "./pages/Specifications/CreateSpecification";
import { CreateDatasetPage } from "./pages/CreateDatasetPage";
import { EditSpecification } from "./pages/Specifications/EditSpecification";
import { ListTemplates } from "./pages/Templates/ListTemplates";
import { PublishTemplate } from "./pages/Templates/PublishTemplate";
import { EditTemplate } from "./pages/Templates/EditTemplate";
import {CreateTemplate} from "./pages/Templates/CreateTemplate";
import {CloneTemplate} from "./pages/Templates/CloneTemplate";
import {ListVersions} from "./pages/Templates/ListVersions";
import { Section } from "./types/Sections";
import { SelectSpecification } from "./pages/Specifications/SelectSpecification";
import { SpecificationsList } from "./pages/Specifications/SpecificationsList";
import { ViewSpecificationResults } from "./pages/Specifications/ViewSpecificationResults";
import { ViewSpecification } from "./pages/Specifications/ViewSpecification";
import { CreateAdditionalCalculation } from "./pages/Calculations/CreateAdditionalCalculation";
import { EditAdditionalCalculation } from "./pages/Calculations/EditAdditionalCalculation";
import { EditTemplateCalculation } from "./pages/Calculations/EditTemplateCalculation";
import { ManageData } from "./pages/Datasets/ManageData";
import { Approvals } from "./pages/Approvals";
import { EditVariationPoints } from "./pages/Specifications/EditVariationPoints";
import { CalculationVersionHistory } from "./pages/Calculations/CalculationVersionHistory";
import { FundingApprovalSelection } from "./pages/FundingApprovals/FundingApprovalSelection";
import { useDispatch } from "react-redux";
import { getFeatureFlags } from "./actions/FeatureFlagsActions";
import { getUserFundingStreamPermissions } from "./actions/UserPermissionsActions";
import { IStoreState } from './reducers/rootReducer';
import { FeatureFlagsState } from './states/FeatureFlagsState';
import {DownloadDataSchema} from "./pages/Datasets/DownloadDataSchema";
import {DatasetHistory} from "./pages/Datasets/DatasetHistory";
import {UpdateDataSourceFile} from "./pages/Datasets/UpdateDataSourceFile";
import {LoadNewDataSource} from "./pages/Datasets/LoadNewDataSource";
import {ManageDataSourceFiles} from "./pages/Datasets/ManageDataSourceFiles";
import {FundingApprovalResults} from "./pages/FundingApprovals/FundingApprovalResults";
import {MapDataSourceFiles} from "./pages/Datasets/MapDataSourceFiles";
import { initialiseAxios } from './services/axiosInterceptor';
import {ViewProvidersFundingStreamSelection} from "./pages/ViewResults/ViewProvidersFundingStreamSelection";
import {ViewProvidersByFundingStream} from "./pages/ViewResults/ViewProvidersByFundingStream";
import {DataRelationships} from "./pages/Datasets/DataRelationships";
import {ProfilingArchive} from "./pages/FundingApprovals/ProfilingArchive";
import {SelectDataSource} from "./pages/Datasets/SelectDataSource";
import {SelectDataSourceExpanded} from "./pages/Datasets/SelectDataSourceExpanded";
import {ViewProviderResults} from "./pages/ViewResults/ViewProviderResults";

const App: React.FunctionComponent = () => {
    const featureFlagsState: FeatureFlagsState = useSelector<IStoreState, FeatureFlagsState>(state => state.featureFlags);
    const dispatch = useDispatch();

    const initialise = () => {
        dispatch(getFeatureFlags());
        dispatch(getUserFundingStreamPermissions());
    }

    initialiseAxios();

    useEffect(() => {
        initialise();
    }, []);
    
    return (
        <BrowserRouter basename="/app">
            <Switch>
                <Route exact path="/"><Home featureFlags={featureFlagsState} /></Route>
                <Route path="/ViewFunding" component={FundingApprovalSelection} />
                <Route path="/Approvals/FundingApprovalSelection/" component={FundingApprovalSelection} />
                <Route path="/Approvals/FundingApprovalResults/:fundingStreamId/:fundingPeriodId/:specificationId" component={FundingApprovalResults} />
                <Route path="/Results/" component={ViewResults} />
                <Route path="/ViewResults/ViewProvidersFundingStreamSelection" component={ViewProvidersFundingStreamSelection} />
                <Route path="/ViewResults/ViewProvidersByFundingStream/:fundingStreamId" component={ViewProvidersByFundingStream} />
                <Route path="/ViewResults/ViewProviderResults/:providerId" component={ViewProviderResults} />
                <Route path="/SelectSpecification" component={SelectSpecification} />
                <Route path="/SpecificationsList" component={SpecificationsList} />
                <Route path="/ViewSpecificationResults/:specificationId" component={ViewSpecificationResults} />
                <Route path="/ViewSpecification/:specificationId" component={ViewSpecification} />
                <Route path="/ViewCalculationResults/:calculationId" component={ViewCalculationResults} />
                <Route path="/FundingApprovals/ProviderFundingOverview/:specificationId/:providerId/:providerVersionId" component={ProviderFundingOverview} />
                <Route path="/FundingApprovals/ProfilingArchive/:specificationId/:providerId/:providerVersionId" component={ProfilingArchive} />  
				<Route path="/Datasets/CreateDataset/:specificationId" component={CreateDatasetPage} />
                <Route path="/Datasets/ManageData" component={ManageData} />
                <Route path="/Datasets/DownloadDataSchema" component={DownloadDataSchema} />
                <Route path="/Datasets/DatasetHistory/:datasetId" component={DatasetHistory} />
                <Route path="/Datasets/UpdateDataSourceFile/:fundingStreamId/:datasetId" component={UpdateDataSourceFile} />
                <Route path="/Datasets/LoadNewDataSource" component={LoadNewDataSource} />
                <Route path="/Datasets/ManageDataSourceFiles" component={ManageDataSourceFiles} />
                <Route path="/Datasets/DataRelationships/:specificationId" component={DataRelationships} />
                <Route path="/Datasets/MapDataSourceFiles" component={MapDataSourceFiles} />
                <Route path="/Datasets/SelectDataSource/:specificationId" component={SelectDataSource} />
                <Route path="/Datasets/SelectDataSourceExpanded/:specificationId/:datasetId" component={SelectDataSourceExpanded} />
                <Route path="/Specifications/CreateSpecification" component={CreateSpecification} />
                <Route path="/Specifications/EditSpecification/:specificationId" component={EditSpecification} />
                {featureFlagsState.templateBuilderVisible && <Route path="/Templates/List" component={ListTemplates} />}
                {featureFlagsState.templateBuilderVisible && <Route path="/Templates/:templateId/Edit" component={EditTemplate} />}
                {featureFlagsState.templateBuilderVisible && <Route path="/Templates/:templateId/Versions/:version" component={EditTemplate} />}
                {featureFlagsState.templateBuilderVisible && <Route path="/Templates/Create" component={CreateTemplate} />}
                {featureFlagsState.templateBuilderVisible && <Route path="/Templates/:templateId/Clone/:version" component={CloneTemplate} />}
                {featureFlagsState.templateBuilderVisible && <Route path="/Templates/Publish/:templateId" component={PublishTemplate} />}
                {featureFlagsState.templateBuilderVisible && <Route path="/Templates/:templateId/Versions" component={ListVersions} />}
                <Route path="/Specifications/CreateAdditionalCalculation/:specificationId" component={CreateAdditionalCalculation} />
                <Route path="/Specifications/EditAdditionalCalculation/:calculationId" component={EditAdditionalCalculation} />
                <Route path="/Specifications/EditTemplateCalculation/:calculationId/:fundingLineItem" component={EditTemplateCalculation} />
                <Route path="/Specifications/EditVariationPoints/:specificationId" component={EditVariationPoints} />
                <Route path="/Calculations/CalculationVersionHistory/:calculationId" component={CalculationVersionHistory} />
                <Route path="/Approvals" component={Approvals} />
                <Route path="*">
                    <NoMatch />
                </Route>
            </Switch>
        </BrowserRouter>
    );
};

function NoMatch() {
    return (
        <div>
            <Header location={Section.Home} />
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
            <Footer />
        </div>
    );
}

export default App;
