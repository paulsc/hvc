import React, { Component } from "react";
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'

import "./Login.css";


export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "paul167@gmail.com",
      password: "rAUBFof7?i",
      loading: false,
      loginStatus: "",
      loginProgress: "0%",
    };

    this.onLoginComplete = props.onLoginComplete;

    // Create WebSocket connection.
    const socket = new WebSocket('ws://localhost:5000/status');

    socket.addEventListener('error', function (event) {
      console.log('error');
    });

    socket.addEventListener('open', function (event) {
        console.log('Websocket connected');
    });

    socket.addEventListener('message', (event) => {
        let msg = JSON.parse(event.data);
        console.log('Message from server:', msg);
        this.setState({ loginStatus: msg.message, loginProgress: msg.progress });
    });
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

    this.onLoginComplete(body.targets);
  }

  render() {
    const { isLoading } = this.state;

    let buttonCaption = isLoading ?
      (<span><FontAwesomeIcon icon={faCircleNotch} spin /> Login</span>) : 
      "Login";

    let loginStatusStyle = {
      background: `linear-gradient(90deg, #E9692C ${this.state.loginProgress}, #fa8a55 ${this.state.loginProgress})`
    }

    let status = this.state.loginStatus.length > 0 ?
        <div style={loginStatusStyle} className="loginstatus">{ this.state.loginStatus }</div> : '';

    return (
      <div className="Login">
        <img alt="logo" className="logo" src={require('./logo-cropped.png')} />
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
          { status }
         </form>
      </div>
    );
  }
}

// <i class='fa fa-circle-o-notch fa-spin'></i> 