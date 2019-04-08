import {Lib} from './library.js';

export function runTests(calc) {
	Lib.unit_tests(calc, [
		[test => test('settings.cure_days').input(6*7),
			assert =>
				assert('settings.cure_days').value === 6*7 &&
				assert('made_at').value.toString() !== assert('cured_at').value.toString()],
		[test => test('made_at').input('3/29/19'),
			assert =>
				assert('made_at').value.getDate() === 29 &&
				assert('cured_at').value.getDate() === 10],

		[test => test('oils_list').add(),
			assert =>
				assert('oils_list').collection.length === 1],
		[test => test('oils_list[0].weight').input(60),
			assert =>
				assert('oils_list[0].weight').value === 60 &&
				assert('oils_list[0].percent').value === 1 &&
				assert('oils_weight').value === 60 &&
				assert('oils_percent').value === 1],
		[test => test('oils_list').add(),
			assert =>
				assert('oils_list').collection.length === 2],
		[test => test('oils_list[1].weight').input(15),
			assert =>
				assert('oils_list[1].weight').value === 15 &&
				assert('oils_weight').value === 15 + 60 &&
				assert('oils_list[0].percent').value === 60 / (15 + 60) &&
				assert('oils_list[1].percent').value === 15 / (15 + 60) &&
				assert('oils_percent').value === 1],
		[test => test('oils_weight').input(20),
			assert =>
				assert('oils_weight').value === 20 &&
				assert('oils_list[0].weight').value === 20 * 0.8 &&
				assert('oils_list[1].weight').value === 20 * 0.2],
		[test => test('oils_list[1].percent').input(.321),
			assert =>
				assert('oils_list[1].percent').value === 0.321 &&
				assert('oils_percent').value === 0.8 + 0.321 &&
				assert('oils_list[1].weight').value === 20 * 0.321],
		[test => test('oils_weight').input(50),
			assert =>
				assert('oils_weight').value === 50 &&
				assert('oils_list[0].weight').value === 0.8 * 50 &&
				assert('oils_list[1].weight').value === 0.321 * 50],
		[test => test('oils_list[0].weight').input(20),
			assert =>
				assert('oils_list[0].weight').value === 20 &&
				assert('oils_weight').value === 20 + 16.05 &&
				assert('oils_list[0].percent').value === 20 / (20 + 16.05) &&
				assert('oils_list[1].percent').value === 16.05 / (20 + 16.05) &&
				assert('oils_percent').value === (20 / (20 + 16.05)) + 16.05 / (20 + 16.05)],
		[test => test('oils_list[0].naoh_sap').input(0.134),
			assert =>
				assert('oils_list[0].naoh_sap').value === 0.134 &&
				assert('oils_list[0].naoh_weight').value === 0.134 * 20 &&
				assert('naoh_weight').value === 0.134 * 20]
	], true);
}