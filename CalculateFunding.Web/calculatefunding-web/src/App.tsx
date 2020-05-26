import React, { useEffect } from 'react';
import { useSelector } from "react-redux";
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Home } from "./pages/Home";
import ViewFundingContainer from "./containers/ViewFundingContainer";
import './App.scss'
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { ViewResults } from "./pages/ViewResults";
import { ViewCalculationResults } from "./pages/ViewCalculationResults";
import { ProviderFundingOverview } from "./pages/ProviderFundingOverview";
import { CreateSpecification } from "./pages/Specifications/CreateSpecification";
import { CreateDatasetPage } from "./pages/CreateDatasetPage";
import { EditSpecification } from "./pages/Specifications/EditSpecification";
import { Templates } from "./pages/Templates";
import { TemplateBuilder } from "./pages/TemplateBuilder";
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

const App: React.FunctionComponent = () => {
    const featureFlagsState: FeatureFlagsState = useSelector<IStoreState, FeatureFlagsState>(state => state.featureFlags);
    const dispatch = useDispatch();

    const initialise = () => {
        dispatch(getFeatureFlags());
        dispatch(getUserFundingStreamPermissions());
    }

    useEffect(() => {
        initialise();
    }, []);

    return (
        <BrowserRouter basename="/app">
            <Switch>
                <Route exact path="/"><Home featureFlags={featureFlagsState} /></Route>
                <Route path="/ViewFunding" component={ViewFundingContainer} />
                <Route path="/Approvals/FundingApprovalSelection/" component={FundingApprovalSelection} />
                <Route path="/results" component={ViewResults} />
                <Route path="/SelectSpecification" component={SelectSpecification} />
                <Route path="/SpecificationsList" component={SpecificationsList} />
                <Route path="/ViewSpecificationResults/:specificationId" component={ViewSpecificationResults} />
                <Route path="/ViewSpecification/:specificationId" component={ViewSpecification} />
                <Route path="/ViewCalculationResults/:calculationId" component={ViewCalculationResults} />
                <Route path="/FundingApprovals/ProviderFundingOverview/:specificationId/:providerId/:providerVersionId" component={ProviderFundingOverview} />
                <Route path="/Datasets/CreateDataset/:specificationId" component={CreateDatasetPage} />
                <Route path="/Datasets/ManageData" component={ManageData} />
                <Route path="/Datasets/DownloadDataSchema" component={DownloadDataSchema} />
                <Route path="/Datasets/DatasetHistory/:datasetId" component={DatasetHistory} />
                <Route path="/Specifications/CreateSpecification" component={CreateSpecification} />
                <Route path="/Specifications/EditSpecification/:specificationId" component={EditSpecification} />
                {featureFlagsState.templateBuilderVisible && <Route path="/Templates" component={Templates} />}
                {featureFlagsState.templateBuilderVisible && <Route path="/TemplateBuilder/:templateId" component={TemplateBuilder} />}
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
