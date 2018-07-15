import React, { Component } from "react";
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'

import "./Login.css";


export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      loading: false,
    };

    this.onLoginComplete = props.onLoginComplete;
  }

  validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = async event => {
    event.preventDefault();
    console.log("Login clicked");

    this.setState({ isLoading: true });

    const response = await fetch(
      `/api/targets?email=${this.state.email}&password=${this.state.password}`);
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);

    this.setState({ isLoading: false });

    this.onLoginComplete(body);
  }

  render() {
    const { isLoading } = this.state;

    let buttonCaption = isLoading ?
      (<span><FontAwesomeIcon icon={faCircleNotch} spin /> Login</span>) : 
      "Login";

    return (
      <div className="Login">
        <form>
          <FormGroup controlId="email" bsSize="large">
            <ControlLabel>Email</ControlLabel>
            <FormControl
              autoFocus
              type="email"
              value={this.state.email}
              onChange={this.handleChange}
            />
          </FormGroup>
          <FormGroup controlId="password" bsSize="large">
            <ControlLabel>Password</ControlLabel>
            <FormControl
              value={this.state.password}
              onChange={this.handleChange}
              type="password"
            />
          </FormGroup>
          <Button
            block
            bsSize="large"
            disabled={isLoading || !this.validateForm()}
            type="submit"
            onClick={!isLoading ? this.handleSubmit : null}
          >
            { buttonCaption }
          </Button>
        </form>
      </div>
    );
  }
}

// <i class='fa fa-circle-o-notch fa-spin'></i> 