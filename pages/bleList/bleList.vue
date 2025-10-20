<template>
	<view class="content">
		<view class="record">
			<view class="item" v-for="(item, index) in contentList" :key="index">
				{{ item }}
			</view>
		</view>
		<textarea style="width: 100%; height: 50px" v-model="debugMsg" focus placeholder="请输入调试信息" clearable />
		<button style="margin-top: 10px;" @click="sendMsg">
			发送
		</button>
		<commonDialog ref="dialog" title='选择设备' :showClose="false" confirm-text="重新搜索" @confirm="searchBlue">
			<view v-if="Object.keys(deviceHistoryMap).length > 0" class="device-list">
				<view class="device-item" v-for="(key,index) in Object.keys(deviceHistoryMap)"
					@click="selectDevice(key)">
					{{ key }}
				</view>
			</view>
			<view v-else>未发现蓝牙设备</view>
		</commonDialog>
	</view>
</template>
<script>
	import ble from '@/utils/ble'
	import tool from '@/utils/tool'
	import commonDialog from '@/components/common-dialog'
	export default {
		components: {
			commonDialog
		},
		data() {
			return {
				debugMsg: undefined,
				contentList: [],
				deviceStatus: '扫描中',
				searchDeviceTimeOut: undefined,
				deviceList: [], //搜索到的设备
				deviceHistoryMap: {},
				device: [], //搜索到的设备
				deviceId: '', //设备id
				serverList: [], //服务
				serviceId: '00001405-0000-1000-8000-00805F9B34FB',
				characteristics: [], //特征值
				characteristicId: '', //特征值uuid
				notifyCharacteristicId: '00002AF0-0000-1000-8000-00805F9B34FB',
				writeId: '00002AF1-0000-1000-8000-00805F9B34FB', //可写
				carVin: undefined,
				queryParams: {
					vin: undefined, //'LWLEMCTS7RL015942',
					list: []
				},
				result: undefined,
				partsList: undefined,
				serialNumber: 0,
				sendCmdList: [],
				lastSendTime: 0,
				heartBeatID: undefined,
				localBLEOpen: true,
				readVinCmd: undefined,
				notifyStarted: false
			}
		},
		onLoad() {
			this.openBlue()
		},
		onShow: function() {
			console.log('index Show')
			const that = this
			uni.onBluetoothAdapterStateChange(res => {
				console.log('onBluetoothAdapterStateChange', res)
				if (!res.available) {
					that.localBLEOpen = false
					uni.showToast({
						title: '蓝牙已关闭',
						icon: 'none'
					});
					that.deviceStatus = '蓝牙已关闭'
					clearTimeout(that.heartBeatID)
				} else {
					if (that.localBLEOpen === false && getToken()) {
						that.localBLEOpen = true
						that.searchBlue()
					}
				}
			});
		},
		onHide: function() {
			//log.writeLog('app页面隐藏')
			console.log('index Hide')
		},
		destroyed() {
			if (this.deviceId) {
				uni.closeBLEConnection({
					deviceId: this.deviceId
				})
			}
		},
		methods: {
			getCurrentTime() {
				const now = new Date();
				const hours = this.padNumber(now.getHours());
				const minutes = this.padNumber(now.getMinutes());
				const seconds = this.padNumber(now.getSeconds());
				const time = `${hours}:${minutes}:${seconds}`
				console.log(time)
				return time
			},
			padNumber(num) {
				return num < 10 ? '0' + num : num;
			},
			sendMsg() {
				// const msg = this.msg;
				// this.updateHeartBeat()
				// this.contentList.push(`${this.getCurrentTime()} send:${msg}`)

				// log.writeLog(`send -->:${msg}`)
				console.log('debugMsg', this.debugMsg)
				const len = this.debugMsg.length
				const arr = []
				let index = 2
				let lastIndex = 0
				do {
					const count = Math.ceil(len / 2)
					arr.push(this.debugMsg.substr(lastIndex, 2))
					lastIndex = index
					index += 2
				} while (arr.length < Math.ceil(len / 2))
				//console.log('arr', arr)

				const buffer = new ArrayBuffer(arr.length)
				const dataView = new DataView(buffer)
				for (let i = 0; i < arr.length; i++) {
					dataView.setUint8(i, `0x${arr[i]}`)
				}
				const _this = this
				console.log('buffer', this.bufferToHex(buffer))
				//console.log('deviceId', _this.deviceId)
				//console.log('serviceId', _this.serviceId)
				//console.log('writeId', _this.writeId)
				uni.writeBLECharacteristicValue({
					deviceId: _this.deviceId,
					serviceId: _this.serviceId,
					characteristicId: _this.writeId,
					value: buffer, //自定义内容buffer
					success(res) {
						console.log('写入成功', res)
					},
					fail(err) {
						uni.hideLoading()
						uni.showToast({
							icon: 'error',
							title: '读取vin失败'
						})
						console.log('写入失败', err)
						// log.writeLog('写入失败:', JSON.stringify(err))
					}
				})
			},
			handleQuery(vin) {
				this.readVinCmd = undefined
				uni.showLoading({
					mask: true,
					title: '获取服务器指令'
				})
				const deviceNo = '0001'
				const that = this
				getPartsList({
					vin
				}).then((res) => {
					//console.log('getPartsList', res)
					that.partsList = res.partsList
					var cmdHeader = '2323fe'
					const arr = []
					that.partsList.forEach(item => {
						try {

							const sendId = item.sendId.substring(2)
							const recId = item.receiveId.substring(2)
							//console.log('sendId', sendId)
							const commands = item.sendCommand
							const cmdType = sendId.startsWith('0000') ? '01' : '02' //01-标准帧，02-扩展帧
							const cmd = commands[0].command
							const cmdCount = '01' //询问车辆命令条数
							const cmdLen = parseFloat(commands[0].length).toString(16)
							const cmdLenStr = cmdLen.length < 2 ? `0${cmdLen}` : cmdLen
							const number = that.generateSerialNumberStr()
							//18dafa00 预留
							const cmdContent =
								`${cmdHeader}${deviceNo}${number}${cmdType}${sendId}${cmdCount}${cmdLenStr}${cmd}${recId}00`
							console.log('res cmd content', cmdContent)
							item.number = number
							item.cmdContent = cmdContent
							item.version = ''
							if (item.partsCategoryCode === 'VIN_STORE_DEVICE') {
								that.readVinCmd = cmdContent
							} else {
								arr.push(item)
							}
						} catch (e) {
							uni.hideLoading()
							console.log('send e', e)
						}
					})
					if (!that.readVinCmd) {
						uni.showToast({
							icon: "error",
							title: "未查询到vin指令"
						});
						return
					}
					that.handleReadVin()
					that.sendCmdList = arr
					// that.sendCmdAsync(arr)
				}).finally(() => {
					uni.hideLoading()
				})
			},
			async sendCmdAsync(arr) {
				uni.showLoading({
					mask: true,
					title: '读取版本中...'
				})
				const that = this
				for (let i = 0; i < arr.length; i++) {
					const item = arr[i]
					that.sendMsg(item.cmdContent)
					await that.checkAnswer(item.number)
				}
				this.queryParams.list = that.sendCmdList
				console.log('compare params', this.queryParams)
				uploadComparePartsVersion(this.queryParams).then((res) => {
					that.result = res
					if (res.compareResult === 2) {
						uni.vibrateLong()
					}
				}).finally(() => {
					uni.hideLoading()
				})
			},
			checkAnswer(number) {
				const that = this
				return new Promise((resolve, reject) => {
					let timeoutID = undefined
					const t = setInterval(() => {
						that.sendCmdList.forEach(item => {
							if (item.number === number && item.version) {
								clearInterval(t);
								clearTimeout(timeoutID);
								console.log('ble checkAnswer', item.version)
								resolve(item.version)
							}
						})
					}, 200)
					timeoutID = setTimeout(() => {
						clearInterval(t);
						console.log('ble read timeout')
						resolve('')
					}, 50000)
				})
			},
			generateSerialNumberStr() {
				const result = this.serialNumber
				this.serialNumber++
				if (this.serialNumber > 99) {
					this.serialNumber = 0
				}
				return result < 10 ? `0${result}` : `${result}`
			},
			async openBlue() { //初始化蓝牙
				const that = this
				try {
					await ble.init();
					uni.getConnectedBluetoothDevices({
						success(res) {
							res.devices.forEach((item) => {
								uni.closeBLEConnection({
									deviceId: item.deviceId
								})
							})
						}
					})
					that.searchBlue()
					uni.onBLEConnectionStateChange(function(res) {
						// 该方法回调中可以用于处理连接意外断开等异常情况
						const msg = `device ${res.deviceId} state has changed, connected: ${res.connected}`
						console.log(msg)
						if (res.connected) {
							clearTimeout(that.searchDeviceTimeOut)
							uni.stopBluetoothDevicesDiscovery()
							that.deviceId = res.deviceId
							//that.getBLEDeviceServices()
						}
						if (res.connected === false) {
							// log.writeLog(msg)
							console.log('断开连接', that.deviceId)
							uni.closeBLEConnection({
								deviceId: that.deviceId,
							})
							that.deviceId = undefined
							that.deviceStatus = '断开连接'
							clearTimeout(that.heartBeatID)
							if (that.localBLEOpen && getToken()) {
								that.searchBlue()
							}
						}
					})
				} catch (error) {
					const show = error.includes('地理位置')
					uni.showModal({
						title: '提示',
						content: error,
						showCancel: show,
						cancelText: show ? '去打开' : '',
						confirmText: '已经打开',
						success: res => {
							if (!res.confirm) {
								uni.showModal({
									title: '需要打开定位',
									showCancel: false
								})
							}
							return
							that.openBlue()
						},
						fail() {

						}
					});
				}
			},
			searchBlue() { //搜索监听蓝牙

				console.log('开始搜索设备')
				uni.getConnectedBluetoothDevices({
					success(res) {
						res.devices.forEach((item) => {
							uni.closeBLEConnection({
								deviceId: item.deviceId
							})
						})
					}
				})
				const that = this
				if (that.deviceStatus === '搜索中') return
				that.deviceStatus = '搜索中'
				that.searchDeviceTimeOut = setTimeout(function() {
					that.notFoundDevice()
				}, 15 * 1000);
				uni.startBluetoothDevicesDiscovery({
					allowDuplicatesKey: false, //允许重复上报同一个设备
					success: (res) => {
						console.log('搜索蓝牙成功', res);
						//监听寻找到新设备的事件
						that.onBluetoothDeviceFound();
					},
					fail(err) {
						console.log('搜索失败')
						console.error(err)
					}
				})
			},
			notFoundDevice() {
				if (this.deviceStatus === '已连接') return
				uni.stopBluetoothDevicesDiscovery()
				this.$refs.dialog?.open()
				this.deviceStatus = '扫描中'
				// console.log('notFoundDevice', this.deviceHistoryMap)
			},
			selectDevice(key) {
				this.$refs.dialog?.close()
				const device = this.deviceHistoryMap[key]
				// console.log('selectDevice', device)
				this.deviceId = device.deviceId
				this.deviceName = key
				this.createBlue()
			},
			onBluetoothDeviceFound() { // 获取设备列表
				const that = this
				that.deviceHistoryMap = {}
				uni.onBluetoothDeviceFound((res) => {
					that.device = res.devices.filter(d => d.name != "")
					// console.log('onBluetoothDeviceFound', that.device)
					that.device.forEach((item) => { //搜索指定设备
						//记录
						console.log('found device name:', item.name)
						if (item.name.startsWith('FW-')) {
							// that.deviceId = item.deviceId
							that.deviceHistoryMap[item.name] = item;
						}
					})
					if (Object.keys(that.deviceHistoryMap).length > 0) {
						that.$refs.dialog?.open()
					}

					//开始连接
					// console.log('found device:', that.deviceId)
					// if (that.deviceId) {
					// 	console.log('开始连接 device:', that.deviceId)
					// 	clearTimeout(that.searchDeviceTimeOut)
					// 	that.createBlue()
					// } else {
					// 	that.deviceStatus = '扫描中'
					// }
				})
			},
			createBlue() { //连接蓝牙
				let that = this;
				if (that.deviceStatus === '连接中' || that.deviceStatus === '已连接') {
					uni.stopBluetoothDevicesDiscovery()
					return
				}
				that.deviceStatus = '连接中'
				console.log('createBlue device:', that.deviceId)
				// console.log('连接蓝牙', that.deviceId)
				that.$refs.dialog.close()
				uni.stopBluetoothDevicesDiscovery()
				uni.createBLEConnection({
					deviceId: that.deviceId,
					timeout: 3000,
					success(res) {
						console.log(res, '连接成功')
						that.getBLEDeviceServices()
						// setTimeout(function() {
						// 	uni.setBLEMTU({
						// 		deviceId: that.deviceId,
						// 		mtu: 512,
						// 		success(res) {
						// 			console.log('setBLEMTU', res)
						// 		},
						// 		fail(err) {
						// 			console.log('setBLEMTU err', err)
						// 		}
						// 	})
						// }, 2000)
					},
					fail(res) {
						console.log('蓝牙连接失败', res)
						if (res.errMsg.includes('already')) {
							clearTimeout(that.searchDeviceTimeOut)
							that.deviceStatus = '已连接'
							that.updateHeartBeat()
							uni.stopBluetoothDevicesDiscovery()
						} else {
							// log.writeLog(`蓝牙连接失败:${JSON.stringify(res)}`)
							uni.showToast({
								icon: "error",
								title: "蓝牙连接失败"
							});
							that.searchBlue()
						}

					},
					computed(res) {
						//设备获取完成之后  停止搜索
						// uni.stopBluetoothDevicesDiscovery({
						// 	success(res) {
						// 		console.log('停止搜索蓝牙', res)
						// 	}
						// })
					}
				});

			},
			//获取蓝牙设备所有服务(service)。
			getBLEDeviceServices() {
				const _this = this;
				console.log(_this.deviceId);
				setTimeout(() => {
					uni.getBLEDeviceServices({
						// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
						deviceId: _this.deviceId,
						success: res => { //此时需要循环遍历每个serviceId获取到特征值，但是在厂商中只有6e4开头获取到的特征值才能操作蓝牙
							console.log('获取蓝牙设备所有服务serviceId:', JSON.stringify(res.services));
							_this.serverList = res.services;
							let found = undefined
							_this.serverList.forEach((item) => {
								if (item.uuid === _this.serviceId) {
									found = item.uuid
								}
							})
							if (found) {
								_this.getBLEDeviceCharacteristics(); //获取设备特征
							} else {
								_this.searchBlue()
								uni.showToast({
									title: '连接失败',
									icon: 'fail'
								})
							}
						},
						fail: res => {
							console.log(res);
						}
					});
				}, 1000);
			},
			getBLEDeviceCharacteristics() { //获取设备特征
				var that = this
				console.log("进入特征");
				setTimeout(() => {
					uni.getBLEDeviceCharacteristics({
						// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
						deviceId: that.deviceId,
						// 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
						serviceId: that.serviceId,
						success: (res) => {
							console.log('获取特征成功')
							setTimeout(() => {
								that.notifyBLECharacteristicValueChange()
							}, 200);
						},
						fail: (res) => {
							console.log(res)
						}
					})

				}, 200)
			},
			updateHeartBeat() {
				const that = this
				if (that.heartBeatID) {
					clearTimeout(that.heartBeatID)
				}
				that.heartBeatID = setTimeout(() => {
					that.sendMsg('1234')
				}, 10 * 1000)
			},
			// 启用 notify 功能
			notifyBLECharacteristicValueChange() {
				const that = this
				that.deviceStatus = '已连接'
				that.updateHeartBeat()
				if (that.notifyStarted) return
				console.log("启用notify", that.notifyCharacteristicId);
				that.notifyStarted = true
				uni.notifyBLECharacteristicValueChange({
					state: true,
					deviceId: that.deviceId,
					serviceId: that.serviceId,
					characteristicId: that.notifyCharacteristicId,
					success: function(res) {
						console.log("启用notify成功", res.errMsg);
						uni.showToast({
							title: '连接成功'
						})
						setTimeout(() => { //接收消息的方法
							that.onBLECharacteristicValueChange();
						}, 1000);
					},
					fail: function(res) {
						uni.showToast({
							title: '连接失败',
							icon: 'fail'
						})
						that.searchBlue()
						console.log("启用notify失败", res);
					},
				});
			},
			//监听设备返回数据的接收
			onBLECharacteristicValueChange() {
				const that = this;
				uni.onBLECharacteristicValueChange((res) => {
					// 结果里有个value值，该值为 ArrayBuffer 类型
					console.log('返回原始数据', res.value)
					let resHex = that.ab2hex(res.value)
					that.contentList.push(`${that.getCurrentTime()} rec:${resHex}`)
					// log.writeLog(`rec -->:${resHex}`)
					console.log('16进制', resHex)
					// if (resHex.length === 50) { //vin
					// 	// 最后将16进制转换为ascii码，就能看到对应的结果 字母 数字
					// 	const resultHex = resHex.substring(14, resHex.length - 2)
					// 	console.log('vin', resultHex)
					// 	const result = tool.hexCharCodeToStr(resultHex)
					// 	console.log('vin encode', result)
					// 	that.carVin = result
					// 	if (that.carVin !== that.queryParams.vin) {
					// 		uni.vibrateLong()
					// 		uni.hideLoading()
					// 		return
					// 	}
					// 	that.sendCmdAsync(that.sendCmdList)
					// 	// that.handleQuery(that.queryParams.vin)
					// 	return
					// }
					// const resultHex = resHex.substring(10, resHex.length - 2)
					// const number = resultHex.substr(0, 2)
					// const version = resultHex.substring(4, resultHex.lastIndex)
					// console.log('获取version', version)
					// //获取信息
					// that.sendCmdList.forEach(item => {
					// 	if (item.number === number) {
					// 		item.version = version
					// 		//item.version = tool.hexCharCodeToStr(version)
					// 	}
					// })

				});
			},
			ab2hex(buffer) { //接收转换
				// ArrayBuffer转16进度字符串示例
				const hexArr = Array.prototype.map.call(new Uint8Array(buffer), function(bit) {
					return ('00' + bit.toString(16)).slice(-2);
				});
				return hexArr.join('');
				console.log(hexArr)
			},
			//字符串转ArrayBuff
			strToArrayBuffer(str) {
				// 首先将字符串转为16进制
				let val = str
				for (let i = 0; i < str.length; i++) {
					if (val === '') {
						val = str.charCodeAt(i).toString(16)
					} else {
						val += ',' + str.charCodeAt(i).toString(16)
					}
				}
				console.log(val)
				// 将16进制转化为ArrayBuffer
				return new Uint8Array(val.match(/[\da-f]{2}/gi).map(function(h) {
					return parseInt(h, 16)
				})).buffer
			},
			//字符串转16进制码
			str_to_hex(str) {
				var hexCharCode = [];
				for (var i = 0; i < str.length; i++) {
					hexCharCode.push((str.charCodeAt(i)).toString(16));
				}
				hexCharCode = hexCharCode.join("");
				return hexCharCode;
			},
			bufferToHex(buffer) {
				let hexArr = Array.prototype.map.call(
					new Uint8Array(buffer),
					function(byte) {
						return ('00' + byte.toString(16)).slice(-2);
					}
				);
				return hexArr.join('');
			},
		}
	}
</script>

<style lang="scss">
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100vh;
	}

	.form-content {
		text-align: center;
		margin: 20rpx auto;
		width: 80%;

		.input-item {
			margin-top: 30rpx;
			background-color: #f5f6f7;
			height: 40px;
			border-radius: 20px;

			.icon {
				font-size: 38rpx;
				margin-left: 10px;
				color: #999;
			}

			.search {
				font-size: 38rpx;
				margin-right: 10px;
				color: #999;
			}

			.input {
				width: 100%;
				font-size: 14px;
				line-height: 20px;
				text-align: left;
				padding-left: 15px;
			}

		}

	}

	.device-list {
		max-height: 300rpx;
		width: 80%;
		overflow-y: scroll;
	}

	.device-item {
		padding: 20rpx 0;
		border-bottom: 1px solid rgba(196, 196, 196, 0.5);
	}

	.info {
		background-color: black;
		width: 80%;
		margin-top: 20rpx;
		border-radius: 10rpx;
		padding: 20rpx;

		.title {
			color: #fff;
			font-size: 40rpx;
		}
	}

	.record {
		background-color: black;
		width: 80%;
		margin-top: 20rpx;
		border-radius: 10rpx;
		padding: 20rpx;
		word-break: break-word;
		min-height: 100rpx;
		max-height: 400rpx;
		overflow-y: scroll;

		.item {
			color: white;
			word-break: break-word;
		}
	}

	.result {
		background-color: black;
		width: 80%;
		overflow-y: scroll;
		word-break: break-word;
		margin: 20rpx 0;
		border-radius: 10rpx;
		padding: 20rpx;
		display: flex;
		flex-direction: column;

		.title {
			color: #fff;
			font-size: 40rpx;
		}

		.result-list {
			overflow-y: scroll;
			scrollbar-color: auto;
			scrollbar-color: rebeccapurple green;

			.compare {
				.parts-name {
					margin-top: 20rpx;
					width: 100%;
					display: flex;
					align-content: center;
					justify-content: space-between;

					.name {
						color: #fff;
						font-size: 30rpx;
					}

					.success {
						color: green;
						font-size: 30rpx;
					}

					.fail {
						color: red;
						font-size: 30rpx;
					}
				}
			}
		}
	}

	.item {
		margin-top: 10rpx;
		width: 100%;
		display: flex;
		align-content: center;
		justify-content: space-between;

		.key {
			color: #ABB7CA;
			font-size: 30rpx;
		}

		.value {
			color: #fff;
			max-width: 70%;
			font-size: 30rpx;
		}
	}
</style>