<template>
	<view>
		<u-tabbar :list="tabbar" ></u-tabbar>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				value1: 0,
			};
		},
		computed: {
			tabbar() {
				// Accessing the Vuex state
				return this.$store.state.tabbar;
			}
		},
		methods: {
			handleClose() {
				this.show = false
			},
			click1(e) {
				console.log('click1', e);
			},
			change1(e) {
				console.log('change1', e);
			},
		}
	};
</script>