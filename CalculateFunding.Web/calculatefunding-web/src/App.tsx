import React from 'react';
import {Switch, Route, BrowserRouter} from 'react-router-dom';
import {Home} from "./pages/Home";
import ViewFundingContainer from "./containers/ViewFundingContainer";

const App: React.FunctionComponent = () => {
  return (
   <BrowserRouter>
     <Switch>
       <Route exact={true} path="/" component={Home} />
       <Route exact={true} path="/ViewFunding" component={ViewFundingContainer} />
     </Switch>
   </BrowserRouter>
  );
};

export default App;