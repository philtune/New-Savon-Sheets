import {round} from "../library.js";

export const oils_config = {
	'weight': {
		tags: ['weight'],
		after_input: (self, calc) => calc.search('oils.list').calculate_collection('weight'),
		get_calculated: (self, calc) => calc.search('oils.list').sum('weight'),
		test_input: (self, calc) => {
			calc.search('oils.list').each(oil => {
				calc.assert(oil.findkey('weight'), round(calc.getval('oils.weight') * oil.childval('percent')))
			});
		}
	},
	'*percent:percent': {
		get_calculated: (self, calc) => calc.search('oils.list').sum('percent')
	},
	'list:collection': {
		on_insert: (self, calc) => {},
		test_insert: (self, calc) => {},
		after_remove: (self, calc) => {
			calc.get_calculated('oils.weight');
			calc.get_calculated('oils.percent');
			calc.get_calculated('additives.weight');
			calc.invoke('calculateAlkali');
			calc.get_calculated('weight');
		},
		test_remove: (self, calc) => {
			calc.assert('oils.weight', round(calc.search('oils.list').sum('weight')));
			calc.assert('oils.percent', round(calc.search('oils.list').sum('percent')));
			calc.invoke('testAlkali');
		},
		fields: {
			'oil_id:integer': {
				after_input: (self, calc) => {
					self.get_sibling('oil').calculate();
					self.get_sibling('naoh_needed').calculate();
					self.get_sibling('koh_needed').calculate();
					calc.invoke('calculateAlkali');
				},
				test_input: (self, calc) => {
					calc.assert(() => typeof self.get_sibling('oil').value === 'object');
					calc.assert(self.get_sibling('naoh_needed').registry_key, round(calc.invoke('getThisOilNaohNeeded', self)));
					calc.assert(self.get_sibling('koh_needed').registry_key, round(calc.invoke('getThisOilKohNeeded', self)));
				}
			},
			'*oil:foreign': {
				get_calculated: (self, calc) => OilOptions[self.get_sibling('oil_id').value]
			},
			'weight': {
				tags: ['weight'],
				after_input: (self, calc) => {
					calc.get_calculated('oils.weight');
					calc.search('oils.list').calculate_collection('percent');
					calc.get_calculated('oils.percent');
					self.get_sibling('naoh_needed').calculate();
					self.get_sibling('koh_needed').calculate();
					calc.invoke('calculateAlkali');
					calc.get_calculated('weight');
				},
				get_calculated: (self, calc) =>
					calc.getval('oils.weight') *
					self.get_sibling('percent').value,
				test_input: (self, calc) => {
					calc.search('oils.list').each(oil => {
						calc.assert(oil.findkey('percent'), round(oil.childval('weight') / calc.getval('oils.weight')));
					});
					calc.assert(`oils.percent`, 1);
					calc.assert('oils.weight', round(calc.search('oils.list').sum('weight')));
					calc.invoke('testAlkali');
					calc.assert(self.get_sibling('naoh_needed').registry_key, round(calc.invoke('getThisOilNaohNeeded', self)));
					calc.assert(self.get_sibling('koh_needed').registry_key, round(calc.invoke('getThisOilKohNeeded', self)));
				}
			},
			'percent': {
				type: 'percent',
				after_input: (self, calc) => {
					calc.get_calculated('oils.percent');
					self.get_sibling('weight').calculate();
				},
				get_calculated: (self, calc) =>
					self.get_sibling('weight').value /
					calc.getval('oils.weight'),
				test_input: (self, calc) => {
					calc.assert(self.get_sibling('weight').registry_key, round(calc.getval('oils.weight') * self.get_sibling('percent').value));
					calc.assert('oils.percent', round(calc.search('oils.list').sum('percent')));
				}
			},
			'*naoh_needed': {
				tags: ['weight'],
				get_calculated: (self, calc) => calc.invoke('getThisOilNaohNeeded', self)
			},
			'*koh_needed': {
				tags: ['weight'],
				get_calculated: (self, calc) => calc.invoke('getThisOilKohNeeded', self)
			}
		}
	}
};
