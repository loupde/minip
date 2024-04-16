//引入vue和vuex
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
const store = new Vuex.Store({ //全局变量定义
	state: {
		user: {},
		tabbar: []
	},
	mutations: {
		setUser(state, data) {
			if (data) {
				state.user = data;
				uni.setStorageSync("userInfo", data);
			} else {
				if (uni.getStorageSync('userInfo')) {
					state.user = uni.getStorageSync('userInfo')
				}
			}
		},
		setTabber(state, tabbar) {
			state.tabbar = tabbar;
		}
	}
})
export default store