export function getHelper(field_calc, registry) {
	const helper = {
		search: id => {
			if ( registry.hasOwnProperty(id) ) {
				return registry[id];
			}
			return null;
		},
		self: key => field_calc.parent[key],
		value: id => helper.search(id).value,
		sum: (id, key) => helper.search(id).sum(key),
		calculate: (id, key) =>
			( undefined !== key ) ?
				helper.search(id).array_calculate(key) :
				helper.search(id).calculate()
	};
	return helper;
}