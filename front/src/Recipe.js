import React, { Component } from 'react';

import api from './api';

export default class Recipe extends Component {

    state = {
        information: {}  
    }

    componentDidMount() {
        let id = this.props.match.params.id;
        console.log('ID', id);

        api(`${id}/information`)
            .then((info) => {
                this.setState({ information: info.data });
            })
    }

    render() {
        console.log('INFO', this.state.information);

        return (
            <div>{this.state.information.title}</div>
        );

    }

}