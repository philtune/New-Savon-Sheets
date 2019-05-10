export const liquids_config = {
	'weight': {
		read_only: true,
		tags: ['weight'],
		get_calculated: (self, calc) => self.get_sibling('list').sum('weight'),
	},
	'percent': {
		type: 'percent',
		read_only: true,
		get_calculated: (self, calc) => self.get_sibling('list').sum('percent')
	},
	'list:collection': {
		on_insert: (self, calc) => {},
		test_insert: (self, calc) => {},
		after_remove: (self, calc) => {},
		test_remove: (self, calc) => {},
		fields: {
			'name:string': {},
			'calculation_type': {
				type: 'string',
				default: 'manual',
				options: [
					'manual',
					'percent_of_alkali',
					'percent_of_oils'
				]
			},
			'percent_of_alkali': {
				type: 'percent',
				after_input: (self, calc) => {
					self.get_sibling('calculation_type').input('percent_of_alkali');
					self.get_sibling('weight').calculate();
					calc.get_calculated('liquids.weight');
					calc.get_calculated('weight');
				}
			},
			'percent_of_oils': {
				type: 'percent',
				after_input: (self, calc) => {
					self.get_sibling('calculation_type').input('percent_of_oils');
					self.get_sibling('weight').calculate();
				}
			},
			'weight': {
				after_input: (self, calc) => {
					self.get_sibling('calculation_type').input('manual');
				},
				get_calculated: (self, calc) =>
					({
						'manual': () => self.value,
						'percent_of_alkali': () => self.get_sibling('percent_of_alkali').value * calc.getval('alkali.weight'),
						'percent_of_oils': () => null
					}[self.get_sibling('calculation_type').value])()
			},
			'percent': {
				type: 'percent',
				default: 1,
				after_input: (self, calc) => {
					calc.get_calculated('liquids.percent');
					self.get_sibling('weight').calculate();
				},
				get_calculated: (self, calc) =>
					self.get_sibling('weight').value /
					calc.getval('liquids.weight'),
			}
		}
	}
};
