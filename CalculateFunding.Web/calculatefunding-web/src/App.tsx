import React from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import {Home} from "./pages/Home";
import ViewFundingContainer from "./containers/ViewFundingContainer";
import './App.scss'
import {Footer} from "./components/Footer";
import {Header} from "./components/Header";
import {ViewResults} from "./pages/ViewResults";
import {ViewSpecificationResults} from "./pages/ViewSpecificationResults";
import {ViewCalculationResults} from "./pages/ViewCalculationResults";
import {ViewSpecification} from "./pages/ViewSpecification";
import {SelectSpecification} from "./pages/SelectSpecification";
import {ProviderFundingOverview} from "./pages/ProviderFundingOverview";
import {SpecificationsList} from "./pages/SpecificationsList";
import {CreateSpecification} from "./pages/Specifications/CreateSpecification";
import {CreateDatasetPage} from "./pages/CreateDatasetPage";
import {Section} from "./types/Sections";

const App: React.FunctionComponent = () => {
  return (
   <BrowserRouter basename="/app">
     <Switch>
       <Route exact path="/" component={Home} />
       <Route path="/ViewFunding" component={ViewFundingContainer} />
       <Route path="/results" component={ViewResults} />
       <Route path="/SelectSpecification" component={SelectSpecification} />
       <Route path="/SpecificationsList" component={SpecificationsList} />
       <Route path="/ViewSpecificationResults/:specificationId" component={ViewSpecificationResults} />
       <Route path="/ViewSpecification/:specificationId" component={ViewSpecification} />
       <Route path="/ViewCalculationResults/:calculationId" component={ViewCalculationResults} />
       <Route path="/FundingApprovals/ProviderFundingOverview/:specificationId/:providerId/:providerVersionId" component={ProviderFundingOverview} />
       <Route path="/Datasets/CreateDataset/:specificationId" component={CreateDatasetPage} />
       <Route path="/Specifications/CreateSpecification" component={CreateSpecification} />
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
      <Header location={Section.Home} />>
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