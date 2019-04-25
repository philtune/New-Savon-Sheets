import {Recipe} from './Recipe/Recipe.class.js';

const recipe = new Recipe();

window.calc = recipe.calc;

recipe.runTests();
