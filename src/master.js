import {Recipe} from './Recipe/Recipe.js';
import {recipe_tests} from "./Recipe/recipe_tests.js";

const recipe = window.recipe = new Recipe({
	log_all: true,
	getInputs: () => document.querySelectorAll('[data-input]'),
	getOutputs: () => document.querySelectorAll('[data-output]')
}).after_load(recipe => {
	recipe.runTests(recipe_tests);
});

const recipe2 = window.recipe2 = new Recipe();
recipe2.load('recipe#dvf');
