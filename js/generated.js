const oils = {
	0: {
		name: 'Olive Oil',
		naoh_sap: 0.134,
		koh_sap: 0.188
	},
	1: {
		name: 'Coconut Oil',
		naoh_sap: 0.178,
		koh_sap: 0.257
	}
};

export const generated_config = {
	fields: {
		'settings:object': {
			'cure_days': {
				input: (val, helper) => helper.calculate('cured_at')
			},
		},
		'made_at:date': {
			input: (val, helper) => helper.calculate('cured_at')
		},
		'*cured_at:date': {
			calculated: helper =>
				helper.value('made_at').addDays(helper.value('settings.cure_days'))
		},
		'oils:object': {
			'list:array': {
				on_delete: helper => {
					helper.calculate('oils.weight');
					helper.calculate('oils.percent');
					helper.calculate('naoh_weight');
					return null
				},
				fields: {
					'oil_id': {
						input: (val, helper) => {
							helper.self('oil_name').calculate();
							helper.self('naoh_sap').calculate();
							helper.self('naoh_weight').calculate();
							helper.self('koh_sap').calculate();
							helper.self('koh_weight').calculate();
							helper.calculate('naoh_weight');
						}
					},
					'*oil_name': {
						calculated: helper =>
							oils[helper.self('oil_id').value].name
					},
					'*naoh_sap': {
						calculated: helper =>
							oils[helper.self('oil_id').value].naoh_sap
					},
					'*koh_sap': {
						calculated: helper =>
							oils[helper.self('oil_id').value].koh_sap
					},
					'weight': {
						input: (val, helper) => {
							helper.self('naoh_weight').calculate();
							helper.calculate('oils.weight');
							helper.calculate('oils.list', 'percent');
							helper.calculate('oils.percent');
						},
						calculated: helper =>
							helper.value('oils.weight') * helper.self('percent').value
					},
					'percent': {
						input: (val, helper) => {
							helper.calculate('oils.percent');
							helper.self('weight').calculate();
						},
						calculated: helper =>
							helper.self('weight').value /
							helper.value('oils.weight')
					},
					'*naoh_weight': {
						calculated: helper =>
							helper.self('naoh_sap').value * helper.self('weight').value
					},
					'*koh_weight': {
						calculated: helper =>
							helper.self('koh_sap').value * helper.self('weight').value
					}
				}
			},
			'weight': {
				input: (val, helper) => {
					helper.calculate('oils.list', 'weight');
				},
				calculated: helper =>
					helper.sum('oils.list', 'weight')
			},
			'*percent': {
				calculated: helper =>
					helper.sum('oils.list', 'percent')
			}
		},
		'*naoh_weight': {
			calculated: helper =>
				helper.sum('oils.list', 'naoh_weight')
		},
		'*koh_weight': {
			calculated: helper =>
				helper.sum('oils.list', 'koh_weight')
		}
	}
};
