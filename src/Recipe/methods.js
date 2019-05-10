import {round} from "../library.js";

export const methods = {

	getThisOilNaohNeeded: (calc, self) =>
		( self.get_sibling('oil').value.naoh_sap || 0 ) *
		self.get_sibling('weight').value /
		calc.getval('settings.naoh_purity') *
		calc.getval('settings.naoh_percent'),

	getThisOilKohNeeded: (calc, self) =>
		( self.get_sibling('oil').value.koh_sap || 0 ) *
		self.get_sibling('weight').value /
		calc.getval('settings.koh_purity') *
		calc.getval('settings.koh_percent'),

	calculateAlkali(calc) {
		calc.get_calculated('alkali.naoh_needed');
		calc.get_calculated('alkali.koh_needed');
		calc.get_calculated('alkali.weight');
		calc.get_calculated('weight');
	},

	testAlkali(calc) {
		calc.assert('alkali.naoh_needed', round(calc.search('oils.list').sum('naoh_needed')));
		calc.assert('alkali.koh_needed', round(calc.search('oils.list').sum('koh_needed')));
		calc.assert('alkali.weight', round(calc.getval('alkali.naoh_needed')+calc.getval('alkali.koh_needed')));
	},

	calc_naoh(calc) {
		calc.search('oils.list').calculate_collection('naoh_needed');
		calc.get_calculated('alkali.naoh_needed');
	},

	calc_koh(calc) {
		calc.search('oils.list').calculate_collection('koh_needed');
		calc.get_calculated('alkali.koh_needed');
	},

	calc_alkali(calc) {
		calc.invoke('calc_naoh');
		calc.invoke('calc_koh');
	},

	test_each_oil_naoh_needed(calc) {
		calc.search('oils.list').each(self =>
			calc.assert(self.findkey('naoh_needed'), round(calc.invoke('getThisOilNaohNeeded', self)))
		);
	},

	test_each_oil_koh_needed(calc) {
		calc.search('oils.list').each(self =>
			calc.assert(self.findkey('koh_needed'), round(calc.invoke('getThisOilKohNeeded', self)))
		);
	}

};
