import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import './App.css';
import Home from './Home'
import Login from './Login';
import Recipe from './Recipe';

class App extends Component {

  state = {
    isLoggedIn: false,
    /*
    targets: {
      "Calcium" : {percent: "2%", amount: "15.2mg"},
      "Fiber" : {percent: "8%", amount: "3.1g"},
      "Folate" : {percent: "6%", amount: "25.9µg"},
      "Iron" : {percent: "10%", amount: "0.8mg"},
      "Vit.A" : {percent: "3%", amount: "75.5IU"},
      "Vit.B12" : {percent: "37%", amount: "0.9µg"},
      "Vit.C" : {percent: "11%", amount: "10.3mg"}
    }
    */
   }

  onLoginComplete = (targets) => {
    console.log("Login complete! Targets:");
    console.log(targets);
    this.setState({ targets: targets });
    this.fetchRecipes();
  }

  handleSignout = () => {
    console.log('Sign out.');
  }

  render() {
    return this.state.isLoggedIn ? 
      this.renderLoggedIn() : 
      <Login onLoginComplete={this.onLoginComplete} />;
  }

  renderLoggedIn() {
    return (
      <Router>
        <Switch>
          <Route path="/recipe/:id" component={Recipe} />
          <Route path="/" component={routeProps => <Home {...routeProps} targets={this.state.targets}/>} />
        </Switch>
      </Router>
    );
  }

}

export default App;
