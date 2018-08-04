import React, { Component } from 'react';
import { ListGroup, ListGroupItem } from "react-bootstrap";
import { Link } from 'react-router-dom';
import FontAwesome from 'react-fontawesome';

import api from './api';

export default class Home extends Component {

  state = {
    recipes: [],
    isRefreshing: false,
    offset: 0,
  }

  componentDidMount() {
    this.fetchRecipes();
  }

  calculateRequirements() {
    let targets = this.props.targets;

    for (let key of Object.keys(targets)) {
      let { percent, amount } = targets[key];

      let percentNum = percent.match(/(\d+)%/)[1];
      let match = amount.match(/([\d|\\.]+)(.*)/);
      let amountNum = match[1];
      let amountUnit = match[2];

      let requiredAmount = amountNum / percentNum * 100;

      targets[key].required = requiredAmount;
      targets[key].unit = amountUnit;
      targets[key].current = amountNum;

      console.log(requiredAmount)
    }

    this.setState( { targets: targets } );
  }

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

  fetchRecipes(offset) {

    if (!offset) offset = 0;

    this.calculateRequirements();

    let targets = this.props.targets;
    console.log(targets);

    //let folateGrams = targets["Folate"].required * 1000;
    // number, offset: query string params for pagination

    let url = `findByNutrients?offset=${this.state.offset}&`;

    if (!isNaN(targets["Calcium"].required)) url += `mincalcium=${targets["Calcium"].required.toFixed(2)}&`;
    if (!isNaN(targets["Fiber"].required)) url += `minFiber=${targets["Fiber"].required.toFixed(2)}&`;
    url //=+ `minFolate=${folateGrams.toFixed(2)}&`;
    if (!isNaN(targets["Iron"].required)) url +=`miniron=${targets["Iron"].required.toFixed(2)}&`;
    if (!isNaN(targets["Vit.A"].required)) url +=`minVitaminA=${targets["Vit.A"].required.toFixed(2)}&`;
    if (!isNaN(targets["Vit.B12"].required)) url +=`minvitaminb12=${targets["Vit.B12"].required.toFixed(2)}&`;
    if (!isNaN(targets["Vit.C"].required)) url +=`minvitaminc=${targets["Vit.C"].required.toFixed(2)}&`;

    console.log("FETCH:", url);

    api(url)
      .then(res => {
        console.log("RES", res.data);

        this.setState((oldState) => { 
          let recipes = oldState.recipes.concat(res.data)
          return { 
            recipes: recipes,
            offset: offset
          };
        });

        localStorage.setItem('recipes', JSON.stringify(res.data));
      })
 
  }

  handleSignout = () => {
    localStorage.removeItem('email');
    localStorage.removeItem('password');
    localStorage.removeItem('targets');
    window.location.reload();
  }

  handleRefresh = () => {
    this.setState({ isRefreshing: true });
    this.props.onRefresh();
  }

  more = () => {
    console.log('more clicked');
    this.fetchRecipes(this.state.offset + 10);
  }

  render() {
    let listitems = [];
    for (let key of Object.keys(this.props.targets)) {
      let target = this.props.targets[key];

      let style = {
        background: `linear-gradient(90deg, #E9692C ${target.percent}, #fa8a55 ${target.percent})`
      }

      listitems.push(
          <ListGroupItem key={key} style={style}>{key} - <small>{target.amount} ({target.percent})</small></ListGroupItem>
      );
    }

    let recipeitems = [];
    for (let recipe of this.state.recipes) {
      recipeitems.push(
          <ListGroupItem key={recipe.id}><Link to={"/recipe/" + recipe.id}>{recipe.title}</Link></ListGroupItem>
      );
    }

    return (
      <div className="Content">
        <ListGroup className="Targets-group">
          <ListGroupItem className="Targets-title">
            Today's Targets
            <a href="#" title="Sign out" className="signout" onClick={this.handleSignout}>
              <FontAwesome name='sign-out' />
            </a>
            <a href="#" title="Refresh" className="refresh" onClick={this.handleRefresh}>
              { this.state.isRefreshing ? 
              <FontAwesome spin name='refresh' /> :
              <FontAwesome name='refresh' /> }
            </a>
          </ListGroupItem>
          { listitems }
        </ListGroup>
        <ListGroup className="Meals-group">
          <ListGroupItem className="Meals-title">Meals</ListGroupItem>
          { recipeitems }
          <ListGroupItem className="Meals-title"><a href="#" onClick={this.more}>More...</a></ListGroupItem>
        </ListGroup>
      </div>
    );

  }


}