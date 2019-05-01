import {round} from '../library.js';

export function recipe_tests(assert, search, getval) {

	const
		thisOil = i => (prop, return_str) =>
			return_str ?
				`oils.list[${i}].${prop}` :
				getval(`oils.list[${i}].${prop}`),
		testAlkaliNeeded = oil => {
			assert(oil('naoh_needed', true), round(
				( oil('oil').naoh_sap || 0 ) *
				oil('weight') /
				getval('settings.naoh_purity') *
				getval('settings.naoh_perc'))
			);
			assert(oil('koh_needed', true), round(
				( oil('oil').koh_sap || 0 ) *
				oil('weight') /
				getval('settings.koh_purity') *
				getval('settings.koh_perc'))
			);

		}
	;

	// TODO: make immutable?

	search('settings.cure_days').input(6*7);
	search('made_at').input('3/29/19');
	search('oils.list').add();
	search('oils.list[0].weight').input(60); testAlkaliNeeded(thisOil(0));
	search('oils.list').add();
	search('oils.list[0].oil_id').input(1); testAlkaliNeeded(thisOil(0));
	search('oils.list[1].weight').input(15); testAlkaliNeeded(thisOil(1));
	search('oils.weight').input(20);
	search('oils.list[1].percent').input(.321);
	search('oils.weight').input(50);
	search('oils.list[0].weight').input(20); testAlkaliNeeded(thisOil(0));
	search('oils.list[1].oil_id').input(0); testAlkaliNeeded(thisOil(1));
	search('oils.list').delete(0);
	search('oils.list').add();
	search('oils.list[2].oil_id').input(1); testAlkaliNeeded(thisOil(2));
	search('settings.naoh_purity').input(.82);
	search('oils.list[2].weight').input(20); testAlkaliNeeded(thisOil(2));
	search('settings.naoh_perc').input(.9); search('oils.list').each((obj, i) => testAlkaliNeeded(thisOil(i)));
	search('settings.koh_perc').input(.6); search('oils.list').each((obj, i) => testAlkaliNeeded(thisOil(i)));
	search('settings.koh_purity').input(.6);

}
