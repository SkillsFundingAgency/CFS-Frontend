import "./App.scss";

import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import { getFeatureFlags } from "./actions/FeatureFlagsActions";
import {
  getHasUserConfirmedSkills,
  getUserFundingStreamPermissions,
  userActionGetUser,
} from "./actions/userAction";
import { ConfirmationModal } from "./components/ConfirmationModal";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { LoadingStatus } from "./components/LoadingStatus";
import { AppContextWrapper } from "./context/AppContextWrapper";
import { ErrorContextWrapper } from "./context/ErrorContext";
import { useEffectOnce } from "./hooks/useEffectOnce";
import { CalculationVersionHistory } from "./pages/Calculations/CalculationVersionHistory";
import { CompareCalculationVersions } from "./pages/Calculations/CompareCalculationVersions";
import { CreateAdditionalCalculation } from "./pages/Calculations/CreateAdditionalCalculation";
import { EditCalculation } from "./pages/Calculations/EditCalculation";
import { ConfigurationDownloads } from "./pages/Configuration/ConfigurationDownloads";
import { SelectConfiguration } from "./pages/Configuration/SelectConfiguration";
import { ConfirmSkills } from "./pages/ConfirmSkills";
import { ConfirmDatasetToCreate } from "./pages/Datasets/Create/ConfirmDatasetToCreate";
import { CreateDatasetFromUpload } from "./pages/Datasets/Create/CreateDatasetFromUpload";
import { SelectDatasetTemplateItems } from "./pages/Datasets/Create/SelectDatasetTemplateItems";
import { SelectDatasetTypeToCreate } from "./pages/Datasets/Create/SelectDatasetTypeToCreate";
import { SelectReferenceSpecification } from "./pages/Datasets/Create/SelectReferenceSpecification";
import { SpecifyDatasetDetails } from "./pages/Datasets/Create/SpecifyDatasetDetails";
import { DataRelationships } from "./pages/Datasets/DataRelationships";
import { DatasetHistory } from "./pages/Datasets/DatasetHistory";
import { DownloadDataSchema } from "./pages/Datasets/DownloadDataSchema";
import { ConfirmDatasetToEdit } from "./pages/Datasets/Edit/ConfirmDatasetToEdit";
import { EditDatasetReferencingReleased } from "./pages/Datasets/Edit/EditDatasetReferencingReleased";
import { LoadNewDataSource } from "./pages/Datasets/LoadNewDataSource";
import { ManageData } from "./pages/Datasets/ManageData";
import { ManageDataSourceFiles } from "./pages/Datasets/ManageDataSourceFiles";
import { SelectDataSource } from "./pages/Datasets/Map/SelectDataSource";
import { MapDataSourceFiles } from "./pages/Datasets/MapDataSourceFiles";
import { RunExportToSql } from "./pages/Datasets/SqlDataExport/RunExportToSql";
import { SelectSpecificationForExport } from "./pages/Datasets/SqlDataExport/SelectSpecificationForExport";
import { UpdateDataSourceFile } from "./pages/Datasets/UpdateDataSourceFile";
import { ChangeProfileType } from "./pages/FundingApprovals/ChangeProfileType";
import { ConfirmFunding } from "./pages/FundingApprovals/ConfirmFunding";
import { FundingApprovalSelection } from "./pages/FundingApprovals/FundingApprovalSelection";
import { ProfileHistory } from "./pages/FundingApprovals/ProfileHistory";
import { ProviderFundingOverviewOld } from "./pages/FundingApprovals/ProviderFundingOverviewOld";
import { SpecificationFundingApproval } from "./pages/FundingApprovals/SpecificationFundingApproval";
import { UploadBatch } from "./pages/FundingApprovals/UploadBatch";
import { ViewEditFundingLineProfileOld } from "./pages/FundingApprovals/ViewEditFundingLineProfileOld";
import { ConfirmApprovalOfFunding } from "./pages/FundingManagement/Approvals/ConfirmApprovalOfFunding";
import { ProvidersForFundingApproval } from "./pages/FundingManagement/Approvals/ProvidersForFundingApproval";
import { SelectSpecificationForFundingApproval } from "./pages/FundingManagement/Approvals/SelectSpecificationForFundingApproval";
import { UploadProvidersForFundingApproval } from "./pages/FundingManagement/Approvals/UploadProvidersForFundingApproval";
import FundingManagementHome from "./pages/FundingManagement/FundingManagementHome";
import { ProviderFundingOverview } from "./pages/FundingManagement/ProviderFundingOverview";
import { ConfirmFundingRelease } from "./pages/FundingManagement/Releases/ConfirmFundingRelease";
import { ProvidersForFundingRelease } from "./pages/FundingManagement/Releases/ProvidersForFundingRelease";
import { PurposeOfFundingRelease } from "./pages/FundingManagement/Releases/PurposeOfFundingRelease";
import { SelectSpecificationForFundingRelease } from "./pages/FundingManagement/Releases/SelectSpecificationForFundingRelease";
import { UploadProvidersForRelease } from "./pages/FundingManagement/Releases/UploadProvidersForRelease";
import { ViewEditFundingLineProfile } from "./pages/FundingManagement/ViewEditFundingLineProfile";
import { Home } from "./pages/Home";
import { Admin } from "./pages/Permissions/Admin";
import { FundingStreamPermissionsAdmin } from "./pages/Permissions/FundingStreamPermissionsAdmin";
import { IndividualPermissionsAdmin } from "./pages/Permissions/IndividualPermissionsAdmin";
import { MyPermissions } from "./pages/Permissions/MyPermissions";
import { CreateSpecification } from "./pages/Specifications/CreateSpecification";
import { EditSpecification } from "./pages/Specifications/EditSpecification";
import { EditVariationPoints } from "./pages/Specifications/EditVariationPoints";
import { SelectSpecification } from "./pages/Specifications/SelectSpecification";
import { SpecificationsList } from "./pages/Specifications/SpecificationsList";
import { ViewSpecification } from "./pages/Specifications/ViewSpecification";
import { ViewSpecificationResults } from "./pages/Specifications/ViewSpecificationResults";
import { CloneTemplate } from "./pages/Templates/CloneTemplate";
import { CreateTemplate } from "./pages/Templates/CreateTemplate";
import { EditTemplate } from "./pages/Templates/EditTemplate";
import { ListTemplates } from "./pages/Templates/ListTemplates";
import { ListVersions } from "./pages/Templates/ListVersions";
import { PublishTemplate } from "./pages/Templates/PublishTemplate";
import { ViewCalculationResults } from "./pages/ViewCalculationResults";
import { ViewResults } from "./pages/ViewResults";
import { ViewProviderResults } from "./pages/ViewResults/ViewProviderResults";
import { ViewProvidersByFundingStream } from "./pages/ViewResults/ViewProvidersByFundingStream";
import { ViewProvidersFundingStreamSelection } from "./pages/ViewResults/ViewProvidersFundingStreamSelection";
import { IStoreState } from "./reducers/rootReducer";
import { initialiseAppInsights, setAppInsightsAuthenticatedUser } from "./services/appInsightsService";
import { FeatureFlagsState } from "./states/FeatureFlagsState";
import { Section } from "./types/Sections";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const App: React.FunctionComponent = () => {
  const featureFlagsState: FeatureFlagsState = useSelector<IStoreState, FeatureFlagsState>(
    (state) => state.featureFlags
  );
  const hasConfirmedSkills: boolean | undefined = useSelector(
    (state: IStoreState) => state.userState && state.userState.hasConfirmedSkills
  );

  const username: string = useSelector((state: IStoreState) => state.userState && state.userState.userName);

  const dispatch = useDispatch();

  useEffectOnce(() => {
    dispatch(getHasUserConfirmedSkills());
    dispatch(userActionGetUser());
  });

  useEffect(() => {
    if (username.length > 0) {
      setAppInsightsAuthenticatedUser(username);
    } else {
      initialiseAppInsights();
    }
  }, [username]);

  useEffect(() => {
    if (hasConfirmedSkills) {
      dispatch(getFeatureFlags());
      dispatch(getUserFundingStreamPermissions());
    }
  }, [hasConfirmedSkills]);

  if (hasConfirmedSkills === undefined) {
    return (
      <div>
        <LoadingStatus title={"Loading"} subTitle={"Please wait while the page is loading..."} />
        <Footer />
      </div>
    );
  }
  if (!hasConfirmedSkills) {
    return (
      <BrowserRouter basename="/app">
        <Switch>
          <Route exact path="/">
            <Home featureFlags={featureFlagsState} />
          </Route>
          <Route path="*">
            <ConfirmSkills />
          </Route>
        </Switch>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter
      basename="/app"
      getUserConfirmation={(message, callback) =>
        ConfirmationModal(message, callback, "Leave this page", "Stay on this page")
      }
    >
      <QueryClientProvider client={queryClient}>
        <AppContextWrapper>
          <ErrorContextWrapper>
            <Switch>
              <Route exact path="/">
                <Home featureFlags={featureFlagsState} />
              </Route>

              {datasetRoutes(featureFlagsState)}

              {featureFlagsState.enableNewFundingManagement
                ? fundingManagementRoutes
                : oldFundingApprovalRoutes}

              <Route path="/Results" component={ViewResults} />

              {resultsRoutes}

              <Route path="/SelectSpecification" component={SelectSpecification} />
              <Route path="/SpecificationsList" component={SpecificationsList} />
              <Route path="/ViewSpecificationResults/:specificationId" component={ViewSpecificationResults} />
              <Route path="/ViewSpecification/:specificationId" component={ViewSpecification} />
              <Route path="/ViewCalculationResults/:calculationId" component={ViewCalculationResults} />
              <Route path="/Specifications/CreateSpecification" component={CreateSpecification} />
              <Route
                path="/Specifications/EditSpecification/:specificationId"
                component={EditSpecification}
              />
              <Route path="/Configuration/SelectConfiguration" component={SelectConfiguration} />
              <Route
                path="/Configuration/ConfigurationDownloads/:fundingStreamId/:fundingPeriodId"
                component={ConfigurationDownloads}
              />
              {featureFlagsState.templateBuilderVisible && templateRoutes}
              <Route
                path="/Specifications/CreateAdditionalCalculation/:specificationId"
                component={CreateAdditionalCalculation}
              />
              <Route path="/Specifications/EditCalculation/:calculationId" component={EditCalculation} />
              <Route
                path="/Specifications/EditVariationPoints/:specificationId/:fundingLineId"
                component={EditVariationPoints}
              />
              <Route
                path="/Calculations/CalculationVersionHistory/:calculationId"
                component={CalculationVersionHistory}
              />
              <Route
                path="/Calculations/CompareCalculationVersions/:calculationId/:firstCalculationVersionId/:secondCalculationVersionId"
                component={CompareCalculationVersions}
              />
              {permissionsRoutes}

              <Route path="*">
                <NoMatch />
              </Route>
            </Switch>
            {process.env.NODE_ENV === "development" && featureFlagsState.enableReactQueryDevTool && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          </ErrorContextWrapper>
        </AppContextWrapper>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

const permissionsRoutes = (
  <Route path="/Permissions">
    <Route path="/Permissions/MyPermissions" component={MyPermissions} />
    <Route path="/Permissions/Admin" component={Admin} />
    <Route path="/Permissions/Individual" component={IndividualPermissionsAdmin} />
    <Route path="/Permissions/FundingStream" component={FundingStreamPermissionsAdmin} />
  </Route>
);

const fundingManagementRoutes = (
  <Route path="/FundingManagement">
    <Route path="/FundingManagement" exact={true} component={FundingManagementHome} />
    <Route
      path="/FundingManagement/Approve/Selection"
      exact={true}
      component={SelectSpecificationForFundingApproval}
    />
    <Route
      path="/FundingManagement/Approve/Results/:fundingStreamId/:fundingPeriodId/:specificationId"
      exact={true}
      component={ProvidersForFundingApproval}
    />
    <Route
      path="/FundingManagement/Approve/Confirm/:fundingStreamId/:fundingPeriodId/:specificationId"
      component={ConfirmApprovalOfFunding}
    />
    <Route
      path="/FundingManagement/Approve/UploadBatch/:fundingStreamId/:fundingPeriodId/:specificationId"
      component={UploadProvidersForFundingApproval}
    />
    <Route
      path="/FundingManagement/Release/UploadBatch/:fundingStreamId/:fundingPeriodId/:specificationId"
      exact={true}
      component={UploadProvidersForRelease}
    />
    <Route
      path="/FundingManagement/Release/Results/:fundingStreamId/:fundingPeriodId/:specificationId"
      exact={true}
      component={ProvidersForFundingRelease}
    />
    <Route path="/FundingManagement/Release/Select" component={SelectSpecificationForFundingRelease} />
    <Route
      path="/FundingManagement/Release/Purpose/:fundingStreamId/:fundingPeriodId/:specificationId"
      exact={true}
      component={PurposeOfFundingRelease}
    />
    <Route
      path="/FundingManagement/Release/Confirm/:fundingStreamId/:fundingPeriodId/:specificationId"
      component={ConfirmFundingRelease}
    />
    <Route
      path="/FundingManagement/:actionType/Provider/:providerId/Specification/:specificationId/Version/:specCoreProviderVersionId"
      exact={true}
      sensitive={false}
      component={ProviderFundingOverview}
    />
    <Route
      path="/FundingManagement/:actionType/Provider/:providerId/Specification/:specificationId/Version/:specCoreProviderVersionId/FundingLine/:fundingLineId/:editMode"
      exact={true}
      sensitive={false}
      component={ViewEditFundingLineProfile}
    />
  </Route>
);

const oldFundingApprovalRoutes = (
  <Route path="/Approvals">
    <Route path="/Approvals/Select" component={FundingApprovalSelection} />
    <Route path="/Approvals/FundingApprovalSelection/" component={FundingApprovalSelection} />
    <Route
      path="/Approvals/SpecificationFundingApproval/:fundingStreamId/:fundingPeriodId/:specificationId"
      component={SpecificationFundingApproval}
    />
    <Route
      path="/Approvals/ConfirmFunding/:fundingStreamId/:fundingPeriodId/:specificationId/:mode"
      component={ConfirmFunding}
    />
    <Route
      path="/Approvals/UploadBatch/:fundingStreamId/:fundingPeriodId/:specificationId"
      component={UploadBatch}
    />
    <Route
      exact
      path="/Approvals/ProviderFundingOverview/:specificationId/:providerId/:specCoreProviderVersionId/:fundingStreamId/:fundingPeriodId/:fundingLineId/edit/change-profile-type"
      component={ChangeProfileType}
    />
    <Route
      exact
      path="/Approvals/ProviderFundingOverview/:specificationId/:providerId/:specCoreProviderVersionId/:fundingStreamId/:fundingPeriodId/:fundingLineId/:editMode"
      component={ViewEditFundingLineProfileOld}
    />
    <Route
      exact
      path="/Approvals/ProviderFundingOverview/:specificationId/:providerId/:specCoreProviderVersionId/:fundingStreamId/:fundingPeriodId"
      component={ProviderFundingOverviewOld}
    />
    <Route
      path="/Approvals/ProfilingHistory/:specificationId/:providerId/:providerVersionId/:fundingStreamId/:fundingPeriodId/:fundingLineCode"
      component={ProfileHistory}
    />
  </Route>
);

const resultsRoutes = (
  <Route path="/ViewResults">
    <Route
      path="/ViewResults/ViewProvidersFundingStreamSelection"
      component={ViewProvidersFundingStreamSelection}
    />
    <Route
      path="/ViewResults/ViewProvidersByFundingStream/:fundingStreamId"
      component={ViewProvidersByFundingStream}
    />
    <Route
      path="/ViewResults/ViewProviderResults/:providerId/:fundingStreamId"
      component={ViewProviderResults}
    />
  </Route>
);

const spec2specDatasetRoutes = (
  <Route path="/Datasets">
    <Route
      path="/Datasets/Create/SelectDatasetTypeToCreate/:forSpecId"
      component={SelectDatasetTypeToCreate}
    />
    <Route
      path="/Datasets/Create/SelectReferenceSpecification/:forSpecId"
      component={SelectReferenceSpecification}
    />
    <Route path="/Datasets/Create/SpecifyDatasetDetails/:forSpecId" component={SpecifyDatasetDetails} />
    <Route
      path="/Datasets/Create/SelectDatasetTemplateItems/:forSpecId"
      component={SelectDatasetTemplateItems}
    />
    <Route path="/Datasets/Create/ConfirmDatasetToCreate/:forSpecId" component={ConfirmDatasetToCreate} />
    <Route
      path="/Datasets/:relationshipId/Edit/:specificationId"
      component={EditDatasetReferencingReleased}
    />
    <Route path="/Datasets/:relationshipId/ConfirmEdit/:specificationId" component={ConfirmDatasetToEdit} />
  </Route>
);
export const datasetRoutes = (featureFlags?: FeatureFlagsState) => (
  <Route path="/Datasets">
    <Route path="/Datasets/CreateDataset/:specificationId" component={CreateDatasetFromUpload} />
    <Route path="/Datasets/ManageData" component={ManageData} />
    <Route path="/Datasets/DownloadDataSchema" component={DownloadDataSchema} />
    <Route path="/Datasets/DatasetHistory/:datasetId" component={DatasetHistory} />
    <Route
      path="/Datasets/UpdateDataSourceFile/:fundingStreamId/:datasetId"
      component={UpdateDataSourceFile}
    />
    <Route path="/Datasets/LoadNewDataSource" component={LoadNewDataSource} />
    <Route path="/Datasets/ManageDataSourceFiles" component={ManageDataSourceFiles} />
    <Route path="/Datasets/DataRelationships/:specificationId" component={DataRelationships} />
    <Route path="/Datasets/MapDataSourceFiles" component={MapDataSourceFiles} />
    <Route path="/Datasets/SelectDataSource/:datasetRelationshipId" component={SelectDataSource} />
    <Route path="/Datasets/Export/SelectSpecificationForExport" component={SelectSpecificationForExport} />
    <Route path="/Datasets/Export/RunExportToSql/:specificationId" component={RunExportToSql} />
    {featureFlags?.specToSpec && spec2specDatasetRoutes}
  </Route>
);

const templateRoutes = (
  <Route path="/Templates">
    <Route path="/Templates/List" component={ListTemplates} />
    <Route path="/Templates/:templateId/Edit" component={EditTemplate} />
    <Route path="/Templates/:templateId/Versions/:version" component={EditTemplate} />
    <Route path="/Templates/:templateId/Versions" component={ListVersions} />
    <Route path="/Templates/Create" component={CreateTemplate} />
    <Route path="/Templates/:templateId/Clone/:version" component={CloneTemplate} />
    <Route path="/Templates/Publish/:templateId" component={PublishTemplate} />
  </Route>
);

function NoMatch() {
  return (
    <div>
      <Header location={Section.Home} />
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper govuk-main-wrapper--l" id="main-content" role="main">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <h1 className="govuk-heading-xl">Page not found</h1>
              <p className="govuk-body">If you typed the web address, check it is correct.</p>
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
