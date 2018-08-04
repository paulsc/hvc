import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import './App.css';
import Home from './Home'
import { Login } from './Login';
import Recipe from './Recipe';

class App extends Component {

  state = {
    isLoggedIn: false,
    email: '',
    password: '',
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

  componentDidMount = () => {
    if (localStorage.getItem('email')) {
      let targets = JSON.parse(localStorage.getItem('targets'));
      this.setState({ isLoggedIn: true, targets: targets });
    }
  }

  onLoginComplete = (targets) => {
    console.log("Login complete! Targets:");
    console.log(targets);
    localStorage.setItem('targets', JSON.stringify(targets));
    this.setState({ targets: targets });
    this.setState({ isLoggedIn: true });
  }

  handleSignout = () => {
    console.log('Sign out.');
  }

  render() {
    return this.state.isLoggedIn ? 
      this.renderLoggedIn() : 
      <Login onLoginComplete={this.onLoginComplete} 
        autoLoginEmail={this.state.email} 
        autoLoginPassword={this.state.password}
      />;
  }

  onRefresh = () => {
    console.log('onrefresh()')
    let email = localStorage.getItem('email');
    let password = localStorage.getItem('password');
    this.setState({ isLoggedIn: false, email: email, password: password });
  }

  renderLoggedIn() {

    let home = 
      routeProps => 
        <Home {...routeProps} 
          targets={this.state.targets}
          onRefresh={this.onRefresh}
        />

    return (
      <Router>
        <Switch>
          <Route path="/recipe/:id" component={Recipe} />
          <Route path="/" component={home} />
        </Switch>
      </Router>
    );
  }

}

export default App;
