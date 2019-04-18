import {updateDOM} from './library.js';
import {Recipe} from './Recipe/recipe.js';
import {runTests} from './Recipe/tests.js';

window.calc = Recipe;
window.updateDOM = updateDOM;

updateDOM();

runTests(Recipe);

