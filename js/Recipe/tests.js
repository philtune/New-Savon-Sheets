import {round} from "../library.js";

export const tests = search => {
	let time = Date.now();

	// TODO: make immutable?
	search('settings.cure_days').input(6*7);
	search('made_at').input('3/29/19');
	search('oils.list').add();
	search('oils.list[0].weight').input(60);
	search('oils.list').add();
	search('oils.list[0].oil_id').input(1);
	search('oils.list[1].weight').input(15);
	search('oils.weight').input(20);
	search('oils.list[1].percent').input(.321);
	search('oils.weight').input(50);
	search('oils.list[0].weight').input(20);
	search('oils.list[1].oil_id').input(0);
	search('oils.list').delete(0);
	search('oils.list').add();
	search('oils.list[2].oil_id').input(1);
	search('settings.naoh_purity').input(.82);
	search('oils.list[2].weight').input(20);
	search('settings.naoh_perc').input(.9);
	search('settings.koh_perc').input(.6);
	search('settings.koh_purity').input(.6);

	console.warn('%c all tests took '+(Date.now()-time)+'ms ', 'background: #666; color: #fff');

};