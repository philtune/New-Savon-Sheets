export const recipe_tests = (assert, _) => {
	const
		cure_days = _.search('settings.cure_days'),
		made_at = _.search('made_at'),
		oils_percent = _.search('oils.percent'),
		oils_list = _.search('oils.list'),
		liquids_list = _.search('liquids.list'),
		additives_list = _.search('additives.list')
	;

	made_at.input('1/05/19');
	assert(() =>
		made_at.value.toString() === new _.Date(_.Date.parse('1/05/19')).toString()
	)(() =>
		_.search('cured_at').value.getDate() === _.Date.addDays(made_at.value, cure_days.value).getDate()
	);

	_.search('settings.lye_discount').input('.08');
	assert(() =>
		_.search('settings.lye_discount').value === 0.08
	);

	cure_days.input('42');
	assert(() =>
		cure_days.value === 42
	)(() =>
		_.search('cured_at').value.getDate() === _.Date.addDays(made_at.value, cure_days.value).getDate()
	);

	_.search('oils.weight').input('50');
	assert(() =>
		_.search('oils.weight').value === 50
	);

	const oil1 = oils_list.insert_item();
	assert(() =>
		oils_list.getLength() === 1
	);

	oil1.find('percent').input('.36');
	assert(() =>
		oil1.find('weight').value === 18
	)(() =>
		oils_percent.value === 0.36
	);

	oil1.find('oil_id').input('0');
	assert(() =>
		JSON.stringify(oil1.find('oil').value) === JSON.stringify({
			name: 'Olive Oil',
			naoh_sap: 0.135,
			koh_sap: 0.189
		})
	)(() =>
		oil1.find('naoh_needed').value === 2.43
	)(() =>
		oil1.find('koh_needed').value === 0
	);

	const oil2 = oils_list.insert_item();
	assert(() =>
		oils_list.getLength() === 2
	);

	oil2.find('percent').input('.28');
	assert(() =>
		oil2.find('weight').value === 14.000000000000002
	)(() =>
		oils_percent.value === 0.64
	);

	oil2.find('oil_id').input('1');
	assert(() =>
		JSON.stringify(oil2.find('oil').value) === JSON.stringify({
			name: 'Coconut Oil',
			naoh_sap: 0.183,
			koh_sap: 0.257
		})
	)(() =>
		oil2.find('naoh_needed').value === 2.5620000000000003
	)(() =>
		oil2.find('koh_needed').value === 0
	);

	const oil3 = oils_list.insert_item();
	assert(() =>
		oils_list.getLength() === 3
	);

	oil3.find('percent').input('.24');
	assert(() =>
		oil3.find('weight').value === 12
	)(() =>
		oils_percent.value === 0.88
	);

	oil3.find('oil_id').input('2');
	assert(() =>
		JSON.stringify(oil3.find('oil').value) === JSON.stringify({
			name: 'Palm Oil',
			naoh_sap: 0.144,
			koh_sap: 0.202
		})
	)(() =>
		oil3.find('naoh_needed').value === 1.7279999999999998
	)(() =>
		oil3.find('koh_needed').value === 0
	);

	const oil4 = oils_list.insert_item();
	assert(() =>
		oils_list.getLength() === 4
	);

	oil4.find('percent').input('.08');
	assert(() =>
		oil4.find('weight').value === 4
	)(() =>
		oils_percent.value === 0.96
	);

	oil4.find('oil_id').input('3');
	assert(() =>
		JSON.stringify(oil4.find('oil').value) === JSON.stringify({
			name: 'Shea Butter',
			naoh_sap: 0.128,
			koh_sap: 0.180
		})
	)(() =>
		oil4.find('naoh_needed').value === 0.512
	)(() =>
		oil4.find('koh_needed').value === 0
	);

	const oil5 = oils_list.insert_item();
	assert(() =>
		oils_list.getLength() === 5
	);

	oil5.find('percent').input('.04');
	assert(() =>
		oil5.find('weight').value === 2
	)(() =>
		oils_percent.value === 1
	);

	oil5.find('oil_id').input('4');
	assert(() =>
		JSON.stringify(oil5.find('oil').value) === JSON.stringify({
			name: 'Castor Oil',
			naoh_sap: 0.128,
			koh_sap: 0.180
		})
	)(() =>
		oil5.find('naoh_needed').value === 0.256
	)(() =>
		oil5.find('koh_needed').value === 0
	);

	const liquid1 = liquids_list.insert_item();
	assert(() =>
		liquids_list.getLength() === 1
	);

	liquid1.find('name').input('Rain Water');
	liquid1.find('percent_of_alkali').input('1.8');

	const additive1 = additives_list.insert_item();
	assert(() =>
		additives_list.getLength() === 1
	);

	additive1.find('name').input('Lovespell FO');
	additive1.find('percent_of_oils').input('1/16');
	const additive2 = additives_list.insert_item();
	assert(() =>
		additives_list.getLength() === 2
	);

	additive2.find('name').input('test');
	additive2.find('custom').input('1 tsp');
};

function otherTests() {
	const tests = {
		'settings.naoh_percent.test_input': helper => {
			helper.assert('settings.koh_percent', 1 - helper.self.value);
			helper.invoke('test_each_oil_naoh_needed');
			helper.invoke('test_each_oil_koh_needed');
		},
		'settings.koh_percent.test_input': helper => {
			helper.assert('settings.naoh_percent', 1 - helper.self.value);
			helper.invoke('test_each_oil_naoh_needed');
			helper.invoke('test_each_oil_koh_needed');
		},
		'settings.naoh_purity.test_input': helper => {
			helper.assert('alkali.naoh_needed', helper.search('oils.list').sum('naoh_needed'));
		},
		'settings.koh_purity.test_input': helper => {
			helper.invoke('test_each_oil_koh_needed');
			helper.assert('alkali.koh_needed', helper.search('oils.list').sum('koh_needed'));
		},
		'oils.weight.test_input': helper => {
			helper.search('oils.list').each(oil => {
				helper.assert(oil.findkey('weight'), helper.getval('oils.weight') * oil.childval('percent'));
			});
		},
		'oils.list.#abc.weight.test_input': helper => {
			helper.search('oils.list').each(oil => {
				helper.assert(oil.findkey('percent'), oil.childval('weight') / helper.getval('oils.weight'));
			});
			helper.assert(`oils.percent`, 1);
			helper.assert('oils.weight', helper.search('oils.list').sum('weight'));
			helper.invoke('testAlkali');
			helper.assert(helper.get_sibling('naoh_needed').registry_key, helper.invoke('getThisOilNaohNeeded', helper.self));
			helper.assert(helper.get_sibling('koh_needed').registry_key, helper.invoke('getThisOilKohNeeded', helper.self));
		},
		'oils.list.test_remove': helper => {
			helper.assert('oils.weight', helper.search('oils.list').sum('weight'));
			helper.assert('oils.percent', helper.search('oils.list').sum('percent'));
			helper.invoke('testAlkali');
		}
	};

	const methods = {
		test_each_oil_koh_needed: helper => {
			helper.search('oils.list').each(self => {
				helper.assert(self.findkey('koh_needed'), helper.invoke('getThisOilKohNeeded', self));
			});
		},

		test_each_oil_naoh_needed: helper => {
			helper.search('oils.list').each(self =>
				helper.assert(self.findkey('naoh_needed'), round(helper.invoke('getThisOilNaohNeeded', self)))
			);
		},

		testAlkali: helper => {
			helper.assert('alkali.naoh_needed', round(helper.search('oils.list').sum('naoh_needed')));
			helper.assert('alkali.koh_needed', round(helper.search('oils.list').sum('koh_needed')));
			helper.assert('alkali.weight', round(helper.getval('alkali.naoh_needed') + helper.getval('alkali.koh_needed')));
		},

		getThisOilNaohNeeded: (helper, this_oil) =>
			( this_oil.find('oil').value.naoh_sap || 0 ) *
			this_oil.find('weight').value /
			helper.getval('settings.naoh_purity') *
			helper.getval('settings.naoh_percent'),

		getThisOilKohNeeded: (helper, this_oil) =>
			( this_oil.find('oil').value.koh_sap || 0 ) *
			this_oil.find('weight').value /
			helper.getval('settings.koh_purity') *
			helper.getval('settings.koh_percent')
	};
}

function scrap(search) {
	search('settings.cure_days').input(6*7);
	search('made_at').input('3/29/19');
	const oil0 = search('oils.list').insert_item();
	oil0.find('weight').input(60);
	const oil1 = search('oils.list').insert_item();
	oil0.find('oil_id').input(1);
	oil1.find('weight').input(15);
	search('oils.weight').input(20);
	oil1.find('percent').input(.321);
	search('oils.weight').input(50);
	oil0.find('weight').input(20);
	oil1.find('oil_id').input(0);
	oil0.remove();
	const oil2 = search('oils.list').insert_item();
	oil2.find('oil_id').input(1);
	search('settings.naoh_purity').input(.82);
	oil2.find('weight').input(20);
	search('settings.naoh_percent').input(.9);
	search('settings.koh_percent').input(.6);
	search('settings.koh_purity').input(.6);
}