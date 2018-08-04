import React, { Component } from 'react';
import { ListGroup, ListGroupItem, FormControl, Form } from "react-bootstrap";
import { Link } from 'react-router-dom';
import FontAwesome from 'react-fontawesome';

import api from './api';

const nutrientMappings = {
  "Calcium": { apiKey: "mincalcium", unit: "mg" },
  "Fiber": { apiKey: "minFiber", unit: "g"},
  // "Folate": "minFolate",
  "Iron": { apiKey: "miniron", unit: "mg"},
  "Vit.A": { apiKey: "minVitaminA", unit: "IU"},
  "Vit.B12": { apiKey: "minvitaminb12", unit: "µg"},
  "Vit.C": { apiKey: "minvitaminc", unit: "mg"},
}

export default class Home extends Component {

  state = {
    recipes: [],
    isRefreshing: false,
    isRecipesRefreshing: false,
    offset: 0,
    fetchUrl: null,
    form: {},
  }

  componentDidMount() {
    this.calculateRequirements(() => {
      this.fetchRecipes();
    });
  }

  calculateRequirements(callback) {
    let targets = this.props.targets;
    let form = {};

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

      console.log(key, requiredAmount)
      if (key != "Folate") { // had an issue with folate
        form[key] = requiredAmount.toFixed(1);
      }
    }

    this.setState( { targets: targets, form: form }, callback );
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
    let url = `findByNutrients?offset=${this.state.offset}&`;
    for (let key of Object.keys(this.state.form)) {
      let apiKey = nutrientMappings[key].apiKey;
      url += `${apiKey}=${this.state.form[key]}&`
    }
    console.log("FETCH", url);

    api(url)
      .then(res => {
        console.log("RES", res.data);

        this.setState((oldState) => { 

          let recipes;
          if (offset != 0) {
            recipes = oldState.recipes.concat(res.data)
          }
          else {
            recipes = res.data;
          }

          return { 
            recipes: recipes,
            offset: offset,
            isRecipesRefreshing: false
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

  handleRecipeRefresh = () => {
    this.setState({ isRecipesRefreshing: true });
    this.fetchRecipes();
  }

  handleChange = (e) => {
    let key = e.currentTarget.name;
    let value = e.currentTarget.value;
    this.setState(oldState => {
      let newForm = Object.assign({}, oldState.form);
      newForm[key] = value;
      return { 
        form: newForm,
        offset: 0
      };
    });
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

    const renderFormItem = (key) => {

      if (!key) return;
      let target = this.props.targets[key].required;
      if (!target) return;
      target = target.toFixed(1);
      let unit = nutrientMappings[key].unit;

      return (
          <ListGroupItem style={{display: 'flex'}}>
            <span style={{flexGrow: 1}}>{key} min: </span>
            <FormControl name={key} type="text" value={this.state.form[key]} onChange={this.handleChange} /> 
            <span style={{ width: '50px', paddingLeft: '10px' }}>{unit}</span>
          </ListGroupItem>
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
          <ListGroupItem className="Meals-title">
            Search filters
         </ListGroupItem>
          <Form inline>
              { renderFormItem("Fiber") }
              { renderFormItem("Iron") }
              { renderFormItem("Calcium") }
              { renderFormItem("Vit.A") }
              { renderFormItem("Vit.C") }
              { renderFormItem("Vit.B12") }
          </Form>
          <ListGroupItem className="Meals-title">
            Results
            <a href="#" title="Refresh" className="refresh" onClick={this.handleRecipeRefresh}>
              { this.state.isRecipesRefreshing ? 
              <FontAwesome spin name='refresh' /> :
              <FontAwesome name='refresh' /> }
            </a>
          </ListGroupItem>
          { recipeitems }
          <ListGroupItem className="Meals-title"><a href="#" onClick={this.more}>More...</a></ListGroupItem>
        </ListGroup>
      </div>
    );

  }


}