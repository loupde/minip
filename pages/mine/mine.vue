<template>
	<view>
		<!-- <u-navbar fixed placeholder :border-bottom="false" title="个人中心">
			<view slot="left"></view>
		</u-navbar> -->

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