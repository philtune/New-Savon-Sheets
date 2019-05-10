import {round} from "../library.js";

export const settings_config = {
	'weight_unit': {
		type: 'string',
		default: 'mg',
		options: ['mg', 'g', 'oz', 'lb', 'kg']
	},
	'cure_days': {
		type: 'integer',
		test_input: (self, calc) =>
			calc.assert([
				calc.getval('cured_at').getDate(),
				calc.getval('made_at').addDays(self.value).getDate()
			])
	},
	'naoh_percent': {
		type: 'percent',
		default: 1,
		after_input: (self, calc) => {
			calc.invoke('calc_alkali');
		},
		get_calculated: (self, calc) => 1 - calc.watch('settings.koh_percent'),
		test_input: (self, calc) => {
			calc.assert('settings.koh_percent', round(1 - self.value));
			calc.invoke('test_each_oil_naoh_needed');
			calc.invoke('test_each_oil_koh_needed');
		}
	},
	'koh_percent': {
		type: 'percent',
		default: 0,
		after_input: (self, calc) => {
			calc.invoke('calc_alkali');
		},
		get_calculated: (self, calc) => 1 - calc.watch('settings.naoh_percent'),
		test_input: (self, calc) => {
			calc.assert('settings.naoh_percent', round(1 - self.value));
			calc.invoke('test_each_oil_naoh_needed');
			calc.invoke('test_each_oil_koh_needed');
		}
	},
	'naoh_purity': {
		type: 'percent',
		default: 1,
		after_input: (self, calc) => {
			calc.invoke('calc_naoh')
		},
		test_input: (self, calc) => {
			calc.assert('alkali.naoh_needed', round(calc.search('oils.list').sum('naoh_needed')));
		}
	},
	'koh_purity': {
		type: 'percent',
		default: 1,
		after_input: (self, calc) => {
			calc.invoke('calc_koh')
		},
		test_input: (self, calc) => {
			calc.invoke('test_each_oil_koh_needed');
			calc.assert('alkali.koh_needed', round(calc.search('oils.list').sum('koh_needed')));
		}
	},
	'lye_discount': {
		type: 'percent',
		default: .05,
		after_input: (self, calc) => {
			calc.invoke('calc_alkali');
		}
	}
};
