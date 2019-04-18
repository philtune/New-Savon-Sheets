import {round} from '../library.js';

export function runTests(calc) {
	calc.runTests((run, assert, search)=>{
		run(_=>search('settings.cure_days').input(6*7));
		assert(_=>search('made_at').value.toString() !== search('cured_at').value.toString());

		run(_=>search('made_at').input('3/29/19'));
		assert(_=>search('made_at').value.getDate() === 29);
		assert(_=>search('cured_at').value.getDate() === 10);

		run(_=>search('oils.list').add());
		assert(_=>search('oils.list').collection.length === 1);

		run(_=>search('oils.list[0].weight').input(60));
		assert('oils.list[0].weight', 60);
	});
	calc.unit_tests({
		3:[
			test => test('oils.list[0].weight').input(60),
			assert =>
				assert('oils.list[0].weight').value === 60
				&& assert('oils.list[0].percent').value === 1
				&& assert('oils.weight').value === assert('oils.list[0].weight').value
				&& assert('oils.percent').value === 1
		],
		4:[
			test => test('oils.list').add(),
			assert =>
				assert('oils.list').collection.length === 2
		],
		5:[
			test => test('oils.list[1].weight').input(15),
			assert =>
				assert('oils.list[1].weight').value === 15
				&& assert('oils.weight').value === assert('oils.list[1].weight').value + assert('oils.list[0].weight').value
				&& assert('oils.list[0].percent').value === assert('oils.list[0].weight').value / assert('oils.weight').value
				&& assert('oils.list[1].percent').value === assert('oils.list[1].weight').value / assert('oils.weight').value
				&& assert('oils.percent').value === 1
		],
		6:[
			test => test('oils.weight').input(20),
			assert =>
				assert('oils.weight').value === 20
				&& assert('oils.list[0].weight').value === assert('oils.weight').value * assert('oils.list[0].percent').value
				&& assert('oils.list[1].weight').value === assert('oils.weight').value * assert('oils.list[1].percent').value
		],
		7:[
			test => test('oils.list[1].percent').input(.321),
			assert =>
				assert('oils.list[1].percent').value === 0.321
				&& assert('oils.percent').value === assert('oils.list[0].percent').value + assert('oils.list[1].percent').value
				&& assert('oils.list[1].weight').value === assert('oils.weight').value * assert('oils.list[1].percent').value
		],
		8:[
			test => test('oils.weight').input(50),
			assert =>
				assert('oils.weight').value === 50
				&& assert('oils.list[0].weight').value === assert('oils.list[0].percent').value * assert('oils.weight').value
				&& assert('oils.list[1].weight').value === assert('oils.list[1].percent').value * assert('oils.weight').value
		],
		9:[
			test => test('oils.list[0].weight').input(20),
			assert =>
				assert('oils.list[0].weight').value === 20
				&& assert('oils.weight').value === assert('oils.list[0].weight').value + assert('oils.list[1].weight').value
				&& assert('oils.list[0].percent').value === round(assert('oils.list[0].weight').value / assert('oils.weight').value)
				&& assert('oils.list[1].percent').value === round(assert('oils.list[1].weight').value / assert('oils.weight').value)
				&& assert('oils.percent').value === assert('oils.list[0].percent').value + assert('oils.list[1].percent').value
		],
		10:[
			test => test('oils.list[0].oil_id').input(1),
			assert =>
				assert('oils.list[0].oil_id').value === 1
				&& assert('oils.list[0].naoh_needed').value === assert('oils.list[0].oil').value.naoh_sap * assert('oils.list[0].weight').value / assert('settings.naoh_purity').value
				&& assert('oils.naoh_needed').value === assert('oils.list[0].naoh_needed').value
				&& assert('oils.koh_needed').value === assert('oils.list[0].koh_needed').value
		],
		11:[
			test => test('oils.list[1].oil_id').input(0),
			assert =>
				assert('oils.list[1].oil_id').value === 0
				&& assert('oils.list[1].naoh_needed').value === round(assert('oils.list[1].oil').value.naoh_sap * assert('oils.list[1].weight').value / assert('settings.naoh_purity').value)
				&& assert('oils.list[1].koh_needed').value === round(assert('oils.list[1].oil').value.koh_sap * assert('oils.list[1].weight').value)
				&& assert('oils.naoh_needed').value === round(assert('oils.list[0].naoh_needed').value + assert('oils.list[1].naoh_needed').value)
				&& assert('oils.koh_needed').value === round(assert('oils.list[0].koh_needed').value + assert('oils.list[1].koh_needed').value)
		],
		12:[
			test => test('oils.list').delete(0),
			assert =>
				assert('oils.weight').value === assert('oils.list[1].weight').value
				&& assert('oils.percent').value === assert('oils.list[1].percent').value
				&& assert('oils.naoh_needed').value === assert('oils.list[1].naoh_needed').value
				&& assert('oils.koh_needed').value === assert('oils.list[1].koh_needed').value
		],
		13:[
			test => test('oils.list').add(),
			assert =>
				assert('oils.list').collection.length === 3
		],
		14:[
			test => test('oils.list[2].oil_id').input(1),
			assert =>
				assert('oils.list[2].oil_id').value === 1
				&& assert('oils.list[2].naoh_needed').value === assert('oils.list[2].oil').value.naoh_sap * assert('oils.list[2].weight').value / assert('settings.naoh_purity').value
				&& assert('oils.naoh_needed').value === assert('oils.list[1].naoh_needed').value + assert('oils.list[2].naoh_needed').value
				&& assert('oils.koh_needed').value === assert('oils.list[1].koh_needed').value + assert('oils.list[2].koh_needed').value
		],
		15:[
			test => test('settings.naoh_purity').input(.9),
			assert =>
				assert('oils.list[1].naoh_needed').value === assert('oils.list[1].oil').value.naoh_sap * assert('oils.list[1].weight').value / assert('settings.naoh_purity').value
				&& assert('oils.list[2].naoh_needed').value === assert('oils.list[2].oil').value.naoh_sap * assert('oils.list[2].weight').value / assert('settings.naoh_purity').value
				&& assert('oils.naoh_needed').value === assert('oils.list[1].naoh_needed').value + assert('oils.list[2].naoh_needed').value
		],
		16:[
			test => test('oils.list[2].weight').input(20),
			assert =>
				assert('oils.list[2].weight').value === 20
				&& assert('oils.weight').value === assert('oils.list[2].weight').value + assert('oils.list[1].weight').value
				&& assert('oils.list[2].percent').value === round(assert('oils.list[2].weight').value / assert('oils.weight').value)
				&& assert('oils.list[1].percent').value === round(assert('oils.list[1].weight').value / assert('oils.weight').value)
				&& assert('oils.percent').value === assert('oils.list[2].percent').value + assert('oils.list[1].percent').value
				&& assert('oils.list[2].naoh_needed').value === round(assert('oils.list[2].oil').value.naoh_sap * assert('oils.list[2].weight').value / assert('settings.naoh_purity').value)
				&& assert('oils.list[2].koh_needed').value === round(assert('oils.list[2].oil').value.koh_sap * assert('oils.list[2].weight').value)
				&& assert('oils.naoh_needed').value === round(assert('oils.list[1].naoh_needed').value + assert('oils.list[2].naoh_needed').value)
				&& assert('oils.koh_needed').value === round(assert('oils.list[1].koh_needed').value + assert('oils.list[2].koh_needed').value)
		],
		17:[
			test => test('settings.naoh_perc').input(0.9)
		],
		18:[
			test => test('settings.koh_perc').input(0.6)
		],
	}, true);
}