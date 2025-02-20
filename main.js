import App from './App'

// #ifndef VUE3
import Vue from 'vue'
// uview
import uView from "uview-ui";
Vue.use(uView)
// vuex
import store from './store/index.js'
Vue.prototype.$store = store

import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
	...App,
	store
})
app.$mount()

// #endif

// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
export function createApp() {
	const app = createSSRApp(App)
	return {
		app
	}
}
// #endif