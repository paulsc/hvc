import React, { Component } from 'react';
import { ListGroup, ListGroupItem } from "react-bootstrap";

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

        let info = this.state.information;

        return (
            <div className="Content">
                <ListGroup className="Meals-group">
                    <ListGroupItem className="Meals-title">
                        {info.title}
                    </ListGroupItem>
                    <ListGroupItem>
                        <a href={info.sourceUrl}>
                            <img style={{width: '100%'}} src={info.image} /> 
                        </a>
                    </ListGroupItem>
                    <ListGroupItem>
                        Vegetarian: {info.vegetarian ? 'yes' : 'no'}
                    </ListGroupItem>
                    <ListGroupItem>
                        Vegan: {info.vegan ? 'yes' : 'no'}
                    </ListGroupItem>
                    <ListGroupItem>
                        <a href={info.sourceUrl} alt="link" tareget="blank">Recipe</a>
                        &nbsp; | &nbsp;
                        <a href={info.spoonacularSourceUrl} alt="link" tareget="blank">Spoonacular Page</a>
                    </ListGroupItem>
                    <ListGroupItem>
                    </ListGroupItem>
                </ListGroup>
 
            </div>
        );

    }

}