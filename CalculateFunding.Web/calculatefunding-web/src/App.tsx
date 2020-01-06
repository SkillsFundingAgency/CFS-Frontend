import React from 'react';
import {Switch, Route, BrowserRouter} from 'react-router-dom';
import {Home} from "./pages/Home";
import FundingLineStructureContainer from "./containers/FundingLineStructureContainer";
import ViewFundingContainer from "./containers/ViewFundingContainer";
import './App.scss'
import {Footer} from "./components/Footer";
import {Header} from "./components/Header";
import {ViewResults} from "./pages/ViewResults";
import {ViewSpecificationResults} from "./pages/ViewSpecificationResults";

const App: React.FunctionComponent = () => {
  return (
   <BrowserRouter basename="/app">
     <Switch>
       <Route exact path="/" component={Home} />
       <Route path="/FundingLineStructure" component={FundingLineStructureContainer} />
       <Route path="/ViewFunding" component={ViewFundingContainer} />
       <Route path="/results" component={ViewResults} />
       <Route path="/ViewSpecificationResults/:specificationId" component={ViewSpecificationResults} />
       <Route path="*">
            <NoMatch />
          </Route>
     </Switch>
   </BrowserRouter>
  );
};

function NoMatch() {
  return (
      <>
      <Header />>
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
        </>
  );
}

export default App;