import React, { Component } from 'react';
import { ListGroup, ListGroupItem } from "react-bootstrap";

import './App.css';
import axios from 'axios';
import Login from './Login';

// COLOR SCHEME: http://paletton.com/#uid=30i0u0kpYtfg6Dwlavqtrolwjjk

const HOST = "https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes";

class App extends Component {

  state = {
    recipes: [],
    targets: {
      "Calcium" : {percent: "2%", amount: "15.2mg"},
      "Fiber" : {percent: "8%", amount: "3.1g"},
      "Folate" : {percent: "6%", amount: "25.9µg"},
      "Iron" : {percent: "10%", amount: "0.8mg"},
      "Vit.A" : {percent: "3%", amount: "75.5IU"},
      "Vit.B12" : {percent: "37%", amount: "0.9µg"},
      "Vit.C" : {percent: "11%", amount: "10.3mg"}
    }
  }

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

  componentDidMount() {
    // https://market.mashape.com/spoonacular/recipe-food-nutrition#search-recipes-by-nutrients
    /*
    'maxAlcohol=50&maxCaffeine=50&maxcalcium=50&maxCalories=250&maxCarbs=100&'
    'maxcholesterol=50&maxcholine=50&maxcopper=50&maxFat=20&maxFiber=50&maxfluoride=50&'
    'maxFolate=50&maxFolicAcid=50&maxIodine=50&maxiron=50&maxmagnesium=50&maxmanganese=50&'
    'maxphosphorus=50&maxpotassium=50&maxProtein=100&maxSaturatedFat=50&maxSelenium=50&'
    'maxsodium=50&maxSugar=50&maxVitaminA=50&maxvitaminb1=50&maxvitaminb12=50&maxvitaminb2=50&'
    'maxvitaminb3=50&maxvitaminb5=50&maxvitaminb6=50&maxvitaminc=50&maxvitamind=50&maxvitamine=50&'
    'maxvitamink=50&maxzinc=50&'
    
    'minAlcohol=0&mincaffeine=0&mincalcium=0&minCalories=0&minCarbs=0&'
    'mincholesterol=0&mincholine=0&mincopper=0&minFat=5&minFiber=0&minfluoride=0&minFolate=0&'
    'minFolicAcid=0&minIodine=0&miniron=0&minmagnesium=0&minmanganese=0&minphosphorus=0&'
    'minpotassium=0&minProtein=0&minSaturatedFat=0&minSelenium=0&minsodium=0&minSugar=0&'
    'minVitaminA=0&minvitaminb1=0&minvitaminb12=0&minvitaminb2=0&minvitaminb3=0&minvitaminb5=0&'
    'minvitaminb6=0&minvitaminc=0&minvitamind=0&minvitamine=0&minvitamink=0&minzinc=0&'

    'number=10&offset=0&random=false'
    */
  
    this.api('findByNutrients?maxAlcohol=50')
      .then(res => {

        console.log("RES", res);

        let calls = res.data.map(recipe => this.api(`${recipe.id}/information`) );
        console.log(calls);

        this.setState({ recipes: res.data });
      })
  }

  api(endpoint) {
    let options = { 
      headers: { 
        'X-Mashape-Key': 'mvssYDjJFymsh8SiUfaGlG6eWEbTp18YlzbjsnW4j8I5tDInOg',
        'Accept': 'application/json'
      }
    }

    let url = `${HOST}/${endpoint}`;

    if (endpoint.indexOf('information') !== -1) {
      url = `recipeinfo.json`;
    }
    else if (endpoint.indexOf('findByNutrients') !== -1) {
      url = `findbynutrients.json`;
    }

    console.log('requesting...', url);
    return axios.get(url, options);
  }

  onLoginComplete = (targets) => {
    console.log("Login complete! Targets:");
    console.log(targets);
    this.setState({ targets: targets });
  }

  render() {
    let hasTargets = Object.keys(this.state.targets).length > 0;

    return hasTargets ? 
      this.renderLoggedIn() : 
      <Login onLoginComplete={this.onLoginComplete} />;
  }

  renderLoggedIn() {

    let listitems = [];
    for (let key of Object.keys(this.state.targets)) {
      let target = this.state.targets[key];

      let style = {
        background: `linear-gradient(90deg, #FFA87F ${target.percent}, #ffffff ${target.percent})`
      }

      listitems.push(
          <ListGroupItem key={key} style={style}>{key} - {target.amount} ({target.percent})</ListGroupItem>
      );
    }

    let recipeitems = [];
    for (let recipe of this.state.recipes) {
      recipeitems.push(
          <ListGroupItem key={recipe.id}>{recipe.title}</ListGroupItem>
      );
    }

    return (
      <div className="Content">
        <ListGroup>
          <ListGroupItem className="Targets-title">Today's Targets</ListGroupItem>
          { listitems }
        </ListGroup>
        <ListGroup>
          <ListGroupItem className="Meals-title">Meals</ListGroupItem>
          { recipeitems }
        </ListGroup>
      </div>
    );

  }

  renderRecipes() {

    let recipes = this.state.recipes.map(recipe => {
      return (<div key={"recipe-" + recipe.id}>{recipe.title}</div>);
    });

    return (
      <div className="App">
        <div className="App-header">
          <div className="App-title"></div>
        </div>
        {recipes}
      </div>
    );
  }
}

export default App;
