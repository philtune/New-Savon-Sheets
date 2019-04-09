import {unit_tests} from './library.js';

export function runTests(calc) {
	unit_tests(calc, [
		[
			test => test('settings.cure_days').input(6*7),
			assert =>
				assert('settings.cure_days').value === 6*7 &&
				assert('made_at').value.toString() !== assert('cured_at').value.toString()
		],[
			test => test('made_at').input('3/29/19'),
			assert =>
				assert('made_at').value.getDate() === 29 &&
				assert('cured_at').value.getDate() === 10
		],[
			test => test('oils.list').add(),
			assert =>
				assert('oils.list').collection.length === 1
		],[
			test => test('oils.list[0].weight').input(60),
			assert =>
				assert('oils.list[0].weight').value === 60 &&
				assert('oils.list[0].percent').value === 1 &&
				assert('oils.weight').value === assert('oils.list[0].weight').value &&
				assert('oils.percent').value === 1
		],[
			test => test('oils.list').add(),
			assert =>
				assert('oils.list').collection.length === 2
		],[
			test => test('oils.list[1].weight').input(15),
			assert =>
				assert('oils.list[1].weight').value === 15 &&
				assert('oils.weight').value === assert('oils.list[1].weight').value + assert('oils.list[0].weight').value &&
				assert('oils.list[0].percent').value === assert('oils.list[0].weight').value / assert('oils.weight').value &&
				assert('oils.list[1].percent').value === assert('oils.list[1].weight').value / assert('oils.weight').value &&
				assert('oils.percent').value === 1
		],[
			test => test('oils.weight').input(20),
			assert =>
				assert('oils.weight').value === 20 &&
				assert('oils.list[0].weight').value === assert('oils.weight').value * assert('oils.list[0].percent').value &&
				assert('oils.list[1].weight').value === assert('oils.weight').value * assert('oils.list[1].percent').value
		],[
			test => test('oils.list[1].percent').input(.321),
			assert =>
				assert('oils.list[1].percent').value === 0.321 &&
				assert('oils.percent').value === assert('oils.list[0].percent').value + assert('oils.list[1].percent').value &&
				assert('oils.list[1].weight').value === assert('oils.weight').value * assert('oils.list[1].percent').value
		],[
			test => test('oils.weight').input(50),
			assert =>
				assert('oils.weight').value === 50 &&
				assert('oils.list[0].weight').value === assert('oils.list[0].percent').value * assert('oils.weight').value &&
				assert('oils.list[1].weight').value === assert('oils.list[1].percent').value * assert('oils.weight').value
		],[
			test => test('oils.list[0].weight').input(20),
			assert =>
				assert('oils.list[0].weight').value === 20 &&
				assert('oils.weight').value === assert('oils.list[0].weight').value + assert('oils.list[1].weight').value &&
				assert('oils.list[0].percent').value === assert('oils.list[0].weight').value / assert('oils.weight').value &&
				assert('oils.list[1].percent').value === assert('oils.list[1].weight').value / assert('oils.weight').value &&
				assert('oils.percent').value === assert('oils.list[0].percent').value + assert('oils.list[1].percent').value
		],[
			test => test('oils.list[0].oil_id').input(1),
			assert =>
				assert('oils.list[0].oil_id').value === 1 &&
				assert('oils.list[0].naoh_sap').value === 0.178 &&
				assert('oils.list[0].naoh_weight').value === assert('oils.list[0].naoh_sap').value * assert('oils.list[0].weight').value &&
				assert('naoh_weight').value === assert('oils.list[0].naoh_weight').value
		],[
			test => test('oils.list[1].oil_id').input(0),
			assert =>
				assert('oils.list[1].oil_id').value === 0 &&
				assert('oils.list[1].naoh_sap').value === 0.134 &&
				assert('oils.list[1].naoh_weight').value === assert('oils.list[1].naoh_sap').value * assert('oils.list[1].weight').value &&
				assert('naoh_weight').value === assert('oils.list[0].naoh_weight').value + assert('oils.list[1].naoh_weight').value
		],[
			test => test('oils.list').delete(0),
			assert =>
				assert('oils.weight').value === assert('oils.list[1].weight').value &&
				assert('oils.percent').value === assert('oils.list[1].percent').value &&
				assert('naoh_weight').value === assert('oils.list[1].naoh_weight').value
		],[
			test => test('oils.list').add(),
			assert =>
				assert('oils.list').collection.length === 3
		],[
			test => test('oils.list[2].oil_id').input(1),
			assert =>
				assert('oils.list[2].oil_id').value === 1 &&
				assert('oils.list[2].naoh_sap').value === 0.178 &&
				assert('oils.list[2].naoh_weight').value === assert('oils.list[2].naoh_sap').value * assert('oils.list[2].weight').value &&
				assert('naoh_weight').value === assert('oils.list[1].naoh_weight').value + assert('oils.list[2].naoh_weight').value
		],[
			test => test('oils.list[2].weight').input(20),
			assert =>
				assert('oils.list[2].weight').value === 20 &&
				assert('oils.weight').value === assert('oils.list[2].weight').value + assert('oils.list[1].weight').value &&
				assert('oils.list[2].percent').value === assert('oils.list[2].weight').value / assert('oils.weight').value &&
				assert('oils.list[1].percent').value === assert('oils.list[1].weight').value / assert('oils.weight').value &&
				assert('oils.percent').value === assert('oils.list[2].percent').value + assert('oils.list[1].percent').value
		]
	], true);
}