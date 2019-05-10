import {Recipe} from './Recipe/Recipe.js';

const recipe = window.recipe = new Recipe({
	log_all: true
});
recipe.runTests(search => {
	search('made_at').input('1/05/19');
	search('settings.lye_discount').input(.08);
	search('settings.cure_days').input(42);
	search('oils.weight')
		.input(50)
		.get_sibling('list').insert_item()
			.find('percent').input(.36)
			.get_sibling('oil_id').input(0)
		.parent.parent.insert_item()
			.find('percent').input(.28)
			.get_sibling('oil_id').input(1)
		.parent.parent.insert_item()
			.find('percent').input(.24)
			.get_sibling('oil_id').input(2)
		.parent.parent.insert_item()
			.find('percent').input(.08)
			.get_sibling('oil_id').input(3)
		.parent.parent.insert_item()
			.find('percent').input(.04)
			.get_sibling('oil_id').input(4);
	search('liquids.list')
		.insert_item()
			.find('name').input('Rain Water')
			.get_sibling('percent_of_alkali').input(1.8);
	search('additives.list')
		.insert_item()
			.find('name').input('Lovespell FO')
			.get_sibling('percent_of_oils').input('1/16')
		.parent.parent.insert_item()
			.find('name').input('test')
			.get_sibling('custom').input('1 tsp');
});

const recipe2 = window.recipe2 = new Recipe();
recipe2.load('recipe#dvf');


// search('settings.cure_days').input(6*7);
// search('made_at').input('3/29/19');
// const oil0 = search('oils.list').insert_item();
// oil0.find('weight').input(60);
// const oil1 = search('oils.list').insert_item();
// oil0.find('oil_id').input(1);
// oil1.find('weight').input(15);
// search('oils.weight').input(20);
// oil1.find('percent').input(.321);
// search('oils.weight').input(50);
// oil0.find('weight').input(20);
// oil1.find('oil_id').input(0);
// oil0.remove();
// const oil2 = search('oils.list').insert_item();
// oil2.find('oil_id').input(1);
// search('settings.naoh_purity').input(.82);
// oil2.find('weight').input(20);
// search('settings.naoh_percent').input(.9);
// search('settings.koh_percent').input(.6);
// search('settings.koh_purity').input(.6);

