const ble = {
	init: function(key) {
		return new Promise((resolve, reject) => {
			uni.openBluetoothAdapter({
				success(res) {
					//console.log('初始化蓝牙成功',res)
					uni.getBluetoothAdapterState({ //检测蓝牙是否打开 //获取本机蓝牙适配器状态
						//蓝牙的匹配状态
						success: (res) => {
							console.log(
								'本机设备的蓝牙已打开'
							)
							resolve(res)
						},
						fail(error) {
							reject(
								"查看手机蓝牙(安卓蓝牙定位)是否打开"
							)
						},
					});
					uni.getLocation({
						timeout: 3,
						success: function(res) {
							console.log('位置信息：', res);

						},
						fail: function(err) {
							console.log('getLocation', err)
							//reject('此功能需要获取您的地理位置，请确认位置信息是否打开')
						}
					});
				},
				fail(err) {
					console.log('初始化蓝牙失败')
					reject("请打开蓝牙")
				}
			})
		})
	},
	get: function(key) {
		let storageData = uni.getStorageSync(storageKey) || {}
		return storageData[key] || ""
	},
	remove: function(key) {
		let storageData = uni.getStorageSync(storageKey) || {}
		delete storageData[key]
		uni.setStorageSync(storageKey, storageData)
	},
	clean: function() {
		uni.removeStorageSync(storageKey)
	}
}

export default ble