import axios from 'axios';

const HOST = "https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes";

let api = (endpoint) => {

    let options = { 
        headers: { 
        'X-Mashape-Key': 'mvssYDjJFymsh8SiUfaGlG6eWEbTp18YlzbjsnW4j8I5tDInOg',
        'Accept': 'application/json'
        }
    }

    let url = `${HOST}/${endpoint}`;

    /*
    if (endpoint.indexOf('information') !== -1) {
        url = `/recipeinfo.json`;
    }

    if (endpoint.indexOf('findByNutrients') !== -1) {
        url = `findbynutrients.json`;
    }
    */

    console.log('requesting...', url);
    return axios.get(url, options);
}

export default api;