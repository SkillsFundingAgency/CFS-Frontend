import React from 'react';
import {Switch, Route, BrowserRouter} from 'react-router-dom';
import {Home} from "./pages/Home";
import FundingLineStructureContainer from "./containers/FundingLineStructureContainer";
import ViewFundingContainer from "./containers/ViewFundingContainer";

const App: React.FunctionComponent = () => {
  return (
   <BrowserRouter basename="/app">
     <Switch>
       <Route exact path="/" component={Home} />
       <Route path="/FundingLineStructure" component={FundingLineStructureContainer} />
       <Route path="/ViewFunding" component={ViewFundingContainer} />
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
      <h3>
        No match for this path
      </h3>
    </div>
  );
}

export default App;