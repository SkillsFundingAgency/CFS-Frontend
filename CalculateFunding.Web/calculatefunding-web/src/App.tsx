import React from 'react';
import {Switch, Route, BrowserRouter} from 'react-router-dom';
import {Home} from "./pages/Home";
import ViewFundingContainer from "./containers/ViewFundingContainer";

const App: React.FunctionComponent = () => {
  return (
   <BrowserRouter>
     <Switch>
       <Route path="/" component={Home} />
       <Route path="/ViewFunding" component={ViewFundingContainer} />
     </Switch>
   </BrowserRouter>
  );
};

export default App;