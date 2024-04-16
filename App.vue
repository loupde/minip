<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
			const tabbar = [{
					iconPath: "/static/tab_1.png",
					selectedIconPath: "/static/tab_01.png",
					text: '首页',
					count: 2,
					isDot: true,
					pagePath: "/pages/index/index"
				},
				{
					iconPath: "/static/tab_3.png",
					selectedIconPath: "/static/tab_03.png",
					text: '我的',
					midButton: false,
					pagePath: "/pages/mine/mine"
				}
			]
			this.$store.commit("setTabber",tabbar)
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	@import "@/uni_modules/uview-ui/index.scss";
	/*每个页面公共css */
</style>
