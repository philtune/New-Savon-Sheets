export const additives_config = {
	'weight': {
		read_only: true,
		tags: ['weight'],
		get_calculated: (self, calc) => self.get_sibling('list').sum('weight'),
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
				default: 'weight',
				options: [
					'percent_of_oils',
					'weight',
					'custom'
				]
			},
			'percent_of_oils': {
				type: 'percent',
				after_input: (self, calc) => {
					self.get_sibling('calculation_type').input('percent_of_oils');
					self.get_sibling('weight').calculate();
					calc.get_calculated('additives.weight');
					calc.get_calculated('weight');
				}
			},
			'weight': {
				after_input: (self, calc) => {
					self.get_sibling('calculation_type').input('weight');
					calc.get_calculated('additives.weight');
					calc.get_calculated('weight');
				},
				get_calculated: (self, calc) =>
					({
						'custom': () => 0,
						'weight': () => self.value,
						'percent_of_oils': () => self.get_sibling('percent_of_oils').value * calc.getval('oils.weight')
					}[self.get_sibling('calculation_type').value])()
			},
			'custom': {
				type: 'string',
				after_input: (self, calc) => {
					self.get_sibling('calculation_type').input('custom')
				}
			}
		}
	}
};
