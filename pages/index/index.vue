<template>
	<view class="content">
		<u-swiper :list="list1"></u-swiper>
		<u-action-sheet :actions="list" :title="title" :show="show" round closeOnClickOverlay
			closeOnClickAction></u-action-sheet>
		<u-button @click="show = true">打开ActionSheet</u-button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				list1: [
					'https://cdn.uviewui.com/uview/swiper/swiper1.png',
					'https://cdn.uviewui.com/uview/swiper/swiper2.png',
					'https://cdn.uviewui.com/uview/swiper/swiper3.png',
				],
				title: '标题',
				list: [{
						name: '选项一',
						subname: "选项一描述",
						// color: '#ffaa7f',
						fontSize: '20',
						disabled: false
					},
					{
						name: '选项二禁用',
						disabled: false
					},
				],
				show: false
			}
		},
		onLoad() {

		},
		methods: {

		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
</style>