import {Lib} from './library.js';
import {generated_config} from './generated.js';
import {runTests} from './tests.js';
import {Calculr} from "./Calculr/Calculr.js";

const generated_calc = new Calculr(generated_config);
window.calc = generated_calc;

Lib.insertHTML('#output2', Lib.colorCode(Lib.jsonify(generated_calc.field_set)));

runTests(generated_calc);

