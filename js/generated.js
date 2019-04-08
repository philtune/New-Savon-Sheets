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
		'oils_list:array': {
			on_delete: helper => {
				return null
			},
			fields: {
				'naoh_sap': {
					input: (val, helper) => {
						helper.self('naoh_weight').calculate();
						helper.calculate('naoh_weight');
					}
				},
				'weight': {
					input: (val, helper) => {
						helper.self('naoh_weight').calculate();
						helper.calculate('oils_weight');
						helper.calculate('oils_list', 'percent');
						helper.calculate('oils_percent');
					},
					calculated: helper =>
						helper.value('oils_weight') * helper.self('percent').value
				},
				'percent': {
					input: (val, helper) => {
						helper.calculate('oils_percent');
						helper.self('weight').calculate();
					},
					calculated: helper =>
						helper.self('weight').value /
						helper.value('oils_weight')
				},
				'*naoh_weight': {
					calculated: helper =>
						helper.self('naoh_sap').value * helper.self('weight').value
				}
			}
		},
		'oils_weight': {
			input: (val, helper) => {
				helper.calculate('oils_list', 'weight');
			},
			calculated: helper =>
				helper.sum('oils_list', 'weight')
		},
		'*oils_percent': {
			calculated: helper =>
				helper.sum('oils_list', 'percent')
		},
		'*naoh_weight': {
			calculated: helper =>
				helper.sum('oils_list', 'naoh_weight')
		}
	}
};
