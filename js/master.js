import {Lib} from './library.js';
import {generated_calc} from './generated.js';
import {runTests} from './tests.js';

Lib.insertHTML('#output2', Lib.colorCode(Lib.jsonify(generated_calc.fields)));

runTests(generated_calc);

