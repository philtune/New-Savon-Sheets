export function getHelper(field_calc, registry) {
	const helper = {
		search: key => {
			if ( registry.hasOwnProperty(key) ) {
				return registry[key];
			}
			return null;
		},
		self: field_calc,
		getParent: _ => field_calc.getParent(),
		getSiblings: _ => field_calc.getParent().children,
		getSibling: key => field_calc.getParent().children[key],
		value: key => helper.search(key).value,
		sum: (array_key, key) => helper.search(array_key).sum(key),
		closest_array: _ => field_calc.closest_array,
		calculate: (array_key, key) =>
			( undefined !== key ) ?
				helper.search(array_key).array_calculate(key) :
				helper.search(array_key).calculate(),
		invoke: key => {

		}
	};
	return helper;
}