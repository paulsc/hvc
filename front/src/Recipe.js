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

        let recipes = JSON.parse(localStorage.getItem('recipes'));
        let meta;
        for (let result of recipes) {
            if (result.id == this.props.match.params.id) {
                meta = result;
                delete(meta.image);
                delete(meta.imageType);
                delete(meta.id);
                delete(meta.title);
                break;
            }
        }

        let metaitems = [];

        console.log('META', meta);
        for (let key in meta) {
            metaitems.push(
                <ListGroupItem key={key}>{capitalize(key)}: {meta[key]}</ListGroupItem>
            )
        }

        return (
            <div className="Content">
                <ListGroup className="Meals-group">
                    <ListGroupItem className="Meals-title">
                        {info.title}
                    </ListGroupItem>
                    <ListGroupItem>
                        <a href={info.sourceUrl}>
                            <img style={{width: '100%'}} alt='pic' src={info.image} /> 
                        </a>
                    </ListGroupItem>
                    <ListGroupItem>
                        Vegetarian: {info.vegetarian ? 'yes' : 'no'}
                    </ListGroupItem>
                    <ListGroupItem>
                        Vegan: {info.vegan ? 'yes' : 'no'}
                    </ListGroupItem>
                    { metaitems }
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

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
