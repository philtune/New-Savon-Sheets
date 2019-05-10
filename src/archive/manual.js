manual_calc = {
	fields: {
		oils: {
			id: 'oils',
			type: 'object',
			fields: {
				list: {
					id: 'oils.list',
					type: 'array',
					collection: [],
					add: function() {
						const collection = this.collection;
						const index = collection.length;
						const id = 'oils.list['+collection.length+']';
						let item = {
							id: id,
							type: 'object',
							fields: {
								weight: {
									id: id+'.weight',
									type: 'input',
									value: 0,
									input: function(val) {
										this.value = val;
										manual_calc.fields.oils.fields.weight.calculate();
									},
									calculate: function() {
										const percent = item.fields.percent.value;
										const total_weight = manual_calc.fields.oils.fields.weight.value;
										this.value = percent * total_weight;
										return this.value;
									}
								},
								percent: {
									id: id+'.percent',
									type: 'input',
									value: 0,
									input: function(val) {
										this.value = val;
										manual_calc.fields.oils.fields.percent.calculate();
										item.fields.weight.calculate();
									},
									calculate: function() {
										const weight = item.fields.weight.value;
										const total_weight = manual_calc.fields.oils.fields.weight.value;
										this.value = weight / total_weight;
										return this.value;
									}
								}
							}
						};
						collection.push(item);
						return item;
					},
					delete: function(index) {
						delete this.collection[index];
					},
					sum: function(key) {
						let result = 0;
						Lib.each(this.collection, function(i, item) {
							result += item.fields[key].value;
						});
						return result;
					},
					calculate: function(key) {
						let result = 0;
						Lib.each(this.collection, function(i, item) {
							result += item.fields[key].calculate();
						});
						return result;
					}
				},
				weight: {
					id: 'oils.weight',
					type: 'input',
					value: 0,
					input: function(val) {
						this.value = val;
						manual_calc.fields.oils.fields.list.calculate('weight');
					},
					calculate: function() {
						this.value = manual_calc.fields.oils.fields.list.sum('weight');
						manual_calc.fields.oils.fields.percent.value = manual_calc.fields.oils.fields.list.calculate('percent');
						return this.value;
					}
				},
				percent: {
					id: 'oils.percent',
					type: 'input',
					value: 0,
					calculate: function() {
						this.value = manual_calc.fields.oils.fields.list.sum('percent');
						return this.value;
					}
				}
			}
		}
	}
};
