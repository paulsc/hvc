import React, { Component } from "react";
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'

import "./Login.css";


class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: this.props.autoLoginEmail,
      password: this.props.autoLoginPassword,
      loading: false,
      loginStatus: "Food for the hasi.",
      loginProgress: "0%",
    };

    this.onLoginComplete = props.onLoginComplete;

    // Create WebSocket connection.
    let url = 'ws://' + window.location.host + '/status';
    if (window.location.host.indexOf('localhost') !== -1) {
      url = 'ws://localhost:5000/status';
    }
    const socket = new WebSocket(url);

    socket.addEventListener('error', function (event) {
      console.log('ws error', event);
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

  componentDidMount() {
    console.log('LOGIN DID MOUNT');
    if (this.state.email) {
      this.handleSubmit();
    }
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
    if (event) {
      event.preventDefault();
    }

    console.log("Login clicked");

    this.setState({ isLoading: true });

    const body = await getTargets(this.state.email, this.state.password);

    this.setState({ isLoading: false });

    if (body.error === "login invalid") {
      console.log("Login invalid.");
      return;
    }

    // login success
    localStorage.setItem("email", this.state.email);
    localStorage.setItem("password", this.state.password);

    this.onLoginComplete(body.targets);
  }

  render() {
    const { isLoading } = this.state;

    let buttonCaption = isLoading ?
      (<span><FontAwesomeIcon icon={faCircleNotch} spin /> Login</span>) : 
      "Login";

    let loginStatusStyle = {
      background: `linear-gradient(90deg, rgb(154, 50, 0, 0.7) ${this.state.loginProgress}, rgb(250, 138, 85, 0.7) ${this.state.loginProgress})`
    }

    //let status = this.state.loginStatus.length > 0 ?
    let status = <div style={loginStatusStyle} className="loginstatus">{ this.state.loginStatus }</div>;

    return (
      <div className="Login">
        <img alt="logo" className="logo" src={require('./logo-cropped.png')} />
        <form>
          { status }
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

let getTargets = async (email, password) => {
  const response = await fetch(
    `/api/targets?email=${email}&password=${password}`);
  const body = await response.json();
  if (response.status !== 200) throw Error(body.message);
  return body;
}


export { Login, getTargets }