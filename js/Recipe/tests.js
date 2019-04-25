import {round} from '../library.js';

export function recipe_tests(run, assert, search, getval) {

	const
		thisOil = i => (prop, return_str) =>
			return_str ?
				`oils.list[${i}].${prop}` :
				getval(`oils.list[${i}].${prop}`),
		eachOil = cb => {
			search('oils.list').collection.forEach((obj, i) =>
				cb(thisOil(i), i)
			);
		},
		testThisOilNaohNeeded = oil =>
			assert(oil('naoh_needed', true), round(
					( oil('oil').naoh_sap || 0 ) *
					oil('weight') /
					getval('settings.naoh_purity') *
					getval('settings.naoh_perc'))
				),
		testThisOilKohNeeded = oil =>
			assert(oil('koh_needed', true), round(
					( oil('oil').koh_sap || 0 ) *
					oil('weight') /
					getval('settings.koh_purity') *
					getval('settings.koh_perc'))
				),
		testAlkaliNeeded = oil => {
			testThisOilNaohNeeded(oil);
			testThisOilKohNeeded(oil);
			let naoh_needed = 0;
			let koh_needed = 0;
			eachOil(oil => {
				naoh_needed += oil('naoh_needed') || 0;
				koh_needed += oil('koh_needed') || 0;
			});
			assert('oils.naoh_needed', round(naoh_needed));
			assert('oils.koh_needed', round(koh_needed));

		},
		thisOilPerc = (index, perc) => {
			let oil = thisOil(index);
			run(oil('percent', true), perc);

			let oils_percent = 0;
			eachOil(oil => {
				oils_percent += oil('percent');
			});
			assert('oils.percent', oils_percent);
			assert(oil('weight', true), getval('oils.weight') * oil('percent'));
		},
		oilsWeight = weight => {
			run('oils.weight', weight);
			assert('oils.weight', weight);
			eachOil(oil =>
				assert(oil('weight', true), getval('oils.weight') * oil('percent'))
			);
		},
		thisOilOilID = (index, oil_id) => {
			let oil = thisOil(index);
			run(oil('oil_id', true), oil_id);
			assert(oil('oil_id', true), oil_id);
			testAlkaliNeeded(oil);
		},
		deleteOil = index => {
			run(() => search('oils.list').delete(index));
			assert(() => search('oils.list').collection[index] === undefined);
			let
				weight = 0,
				percent = 0,
				naoh_needed = 0,
				koh_needed = 0
			;
			eachOil(oil => {
				weight += oil('weight') || 0;
				percent += oil('percent') || 0;
				naoh_needed += oil('naoh_needed') || 0;
				koh_needed += oil('koh_needed') || 0;
			});
			assert('oils.weight', weight);
			assert('oils.percent', percent);
			assert('oils.naoh_needed', naoh_needed);
			assert('oils.koh_needed', koh_needed);
		},
		naohPerc = perc => {
			run('settings.naoh_perc', perc);
			assert('settings.naoh_perc', perc);
			assert('settings.koh_perc', round(1 - getval('settings.naoh_perc')));
			eachOil(oil => {
				testAlkaliNeeded(oil);
			});
		},
		kohPerc = perc => {
			run('settings.koh_perc', perc);
			assert('settings.koh_perc', perc);
			assert('settings.naoh_perc', round(1 - getval('settings.koh_perc')));
			eachOil(oil => {
				testAlkaliNeeded(oil);
				// testThisOilKohNeeded(oil);
			});
		},
		naohPurity = val => {
			run('settings.naoh_purity', val);
			assert('settings.naoh_purity', val);
			let naoh_needed = 0;
			eachOil(oil => {
				testThisOilNaohNeeded(oil);
				naoh_needed += oil('naoh_needed') || 0;
			});
			assert('oils.naoh_needed', round(naoh_needed));
		},
		kohPurity = val => {
			run('settings.koh_purity', val);
			assert('settings.koh_purity', val);
			let koh_needed = 0;
			eachOil(oil => {
				testThisOilKohNeeded(oil);
				koh_needed += oil('koh_needed') || 0;
			});
			assert('oils.koh_needed', round(koh_needed));
		},
		thisOilWeight = (index, weight) => {
			let
				oil = thisOil(index),
				oils_weight = 0,
				naoh_needed = 0,
				koh_needed = 0
			;
			run(oil('weight', true), weight);
			assert(oil('weight', true), weight);
			eachOil(oil => {
				oils_weight += oil('weight') || 0;
				naoh_needed += oil('naoh_needed') || 0;
				koh_needed += oil('koh_needed') || 0;
			});
			if ( oil('oil') ) {
				testAlkaliNeeded(oil);
			}
			assert('oils.naoh_needed', round(naoh_needed));
			assert('oils.koh_needed', round(koh_needed));
			assert(`oils.weight`, round(oils_weight));
			assert(`oils.percent`, 1);
			eachOil(oil => assert(oil('percent', true), round(oil('weight') / getval('oils.weight'))));
		}
	;


	run('settings.cure_days', 6 * 7);
	assert('settings.cure_days', 6 * 7);
	assert(() => getval('made_at').toString() !== getval('cured_at').toString());

	run('made_at', '3/29/19');
	assert(() => getval('made_at').getDate() === 29);
	assert(() => getval('cured_at').getDate() === 10);

	run(() => search('oils.list').add());
	assert(() => search('oils.list').getLength() === 1);

	thisOilWeight(0, 60);

	run(() => search('oils.list').add());
	assert(() => search('oils.list').getLength() === 2);

	thisOilWeight(1, 15);
	oilsWeight(20);
	thisOilPerc(1, .321);
	oilsWeight(50);
	thisOilWeight(0, 20);
	thisOilOilID(0, 1);
	thisOilOilID(1, 0);
	deleteOil(0);

	run(() => search('oils.list').add());
	assert(() => search('oils.list').getLength() === 3);

	thisOilOilID(2, 1);
	naohPurity(.9);
	thisOilWeight(2, 20);
	naohPerc(.9);
	kohPerc(.6);
	kohPurity(.6);

}
