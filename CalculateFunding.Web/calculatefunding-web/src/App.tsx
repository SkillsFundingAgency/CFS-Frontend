import React from 'react';
import {HashRouter, Switch, Route} from 'react-router-dom';
import {Home} from "./components/Home";

const App: React.FunctionComponent = () => {
  return (
   <HashRouter>
     <Switch>
       <Route exact={true} path="/" component={Home} />
     </Switch>
   </HashRouter>
  );
};

export default App;