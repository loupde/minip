<template>
	<uni-popup ref="popup" :mask-click="false">
		<view class="uni-popup-dialog">
			<view class="uni-dialog-title">
				<text class="uni-dialog-title-text uni-popup__info">{{titleText}}</text>
			</view>
			<view class="uni-dialog-content">
				<slot></slot>
			</view>
			<view class="uni-dialog-button-group">
				<view class="uni-dialog-button" v-if="showClose" @click="close">
					<text class="uni-dialog-button-text">{{closeText}}</text>
				</view>
				<view class="uni-dialog-button" :class="showClose?'uni-border-left':''" @click="onOk">
					<text class="uni-dialog-button-text uni-button-color">{{okText}}</text>
				</view>
			</view>
		</view>
	</uni-popup>
</template>

<script>
	export default {
		name: "common-dialog",
		props: {
			title: {
				type: String,
				default: ''
			},
			showClose: {
				type: Boolean,
				default: true
			},
			cancelText: {
				type: String,
				default: '取消'
			},
			confirmText: {
				type: String,
				default: '确定'
			},
		},
		data() {
			return {

			};
		},
		computed: {
			okText() {
				return this.confirmText || '确定'
			},
			closeText() {
				return this.cancelText || '关闭'
			},
			placeholderText() {
				return this.placeholder || ''
			},
			titleText() {
				return this.title || '提示'
			}
		},
		methods: {
			open() {
				this.$refs.popup.open()
			},
			onOk() {
				this.$emit('confirm')
				this.close()
			},
			close() {
				this.$refs.popup.close()
			}
		},
	}
</script>

<style lang="scss">
	.uni-popup-dialog {
		width: 300px;
		border-radius: 11px;
		background-color: #fff;
	}

	.uni-dialog-title {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		justify-content: center;
		padding-top: 25px;
	}

	.uni-dialog-title-text {
		font-size: 16px;
		font-weight: 500;
	}

	.uni-dialog-content {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		justify-content: center;
		align-items: center;
		padding: 20px;
	}

	.uni-dialog-content-text {
		font-size: 14px;
		color: #6C6C6C;
	}

	.uni-dialog-button-group {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		border-top-color: #f5f5f5;
		border-top-style: solid;
		border-top-width: 1px;
	}

	.uni-dialog-button {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */

		flex: 1;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		height: 45px;
	}

	.uni-border-left {
		border-left-color: #f0f0f0;
		border-left-style: solid;
		border-left-width: 1px;
	}

	.uni-dialog-button-text {
		font-size: 16px;
		color: #333;
	}

	.uni-button-color {
		color: #007aff;
	}

	.uni-dialog-input {
		flex: 1;
		font-size: 14px;
		border: 1px #eee solid;
		height: 40px;
		padding: 0 10px;
		border-radius: 5px;
		color: #555;
	}

	.uni-popup__success {
		color: #4cd964;
	}

	.uni-popup__warn {
		color: #f0ad4e;
	}

	.uni-popup__error {
		color: #dd524d;
	}

	.uni-popup__info {
		color: #909399;
	}
</style>