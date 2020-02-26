import Vue from "vue";
import Vuex from "./vuex";

Vue.use(Vuex);

const store = new Vuex.Store({
	modules: {
		a: {
			state: { age: 'a100' }
		},
		b: {
			state: { age: 'b100' },
			modules: {
				c: {
					state: {
						age: 'c100'
					}
				}
			}
		}
	},
	state: {
		age: 10
	},
	mutations: {
		syncChange(state, payload) {
			state.age += payload;
		}
	},
	actions: {
		asyncChange({ commit }, payload) {
			setTimeout(() => {
				commit("syncChange", payload);
			}, 1000);
		}
	},
	getters: {
		myAge(state) {
			return state.age + 20;
		}
	}
});
store.registerModule('d', {
	state: {
		age: 'd100'
	}
});
export default store;