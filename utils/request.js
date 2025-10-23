import {
	getToken,
	removeToken
} from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import {
	toast,
	showConfirm,
	tansParams
} from '@/utils/common'
// import log from '@/utils/log'
let timeout = 10000
const baseUrl = 'http://10.235.18.53:8080'

const request = config => {
	// 是否需要设置 token
	const isToken = (config.headers || {}).isToken === false
	config.header = config.header || {}
	if (getToken() && !isToken) {
		config.header['Authorization'] = getToken() // 'Bearer ' + 
	}
	// get请求映射params参数
	if (config.params) {
		let url = config.url + '?' + tansParams(config.params)
		url = url.slice(0, -1)
		config.url = url
	}
	// log.writeLog(`${config.method} url:${config.url}`)
	if (config.data) {
		// log.writeLog(`data:${JSON.stringify(config.data)}`)
		console.log('body ===>', config.data)
	}
	return new Promise((resolve, reject) => {
		uni.request({
				method: config.method || 'get',
				timeout: config.timeout || timeout,
				url: config.baseUrl || baseUrl + config.url,
				data: config.data,
				header: config.header,
				dataType: 'json'
			}).then(response => {
				const {
					statusCode,
					errMsg,
					data
				} = response
				// log.writeLog("res:", JSON.stringify(response))
				console.log('res', response)
				// if (error) {
				// 	toast('后端接口连接异常')
				// 	reject('后端接口连接异常')
				// 	return
				// }
				const code = statusCode || 200
				const msg = data.message || errorCode[code] || errorCode['default']
				if (code === 401) {
					removeToken()
					reject('无效的会话，或者会话已过期，请重新登录。')
					showConfirm('登录状态已过期，您可以继续留在该页面，或者重新登录?').then(res => {
						if (res.confirm) {
							// store.dispatch('LogOut').then(res => {
							uni.reLaunch({
								url: '/pages/login/login'
							})
							// })
						}
					})
					return
				} else if (code === 500) {
					toast(msg)
					reject('500')
				} else if (code !== 200) {
					//toast(msg)
					uni.showModal({
						title: '提示',
						content: msg,
						showCancel: false,
						confirmText: '确定',
					});
					reject(code)
				}
				if (data.data) {
					resolve(data.data)
				} else {
					uni.showModal({
						title: '提示',
						content: data.message,
						showCancel: false,
						confirmText: '确定',
					});
					reject(data.message)
				}
			})
			.catch(error => {
				console.log('request error', error)
				let {
					message
				} = error
				if (message === 'Network Error') {
					message = '后端接口连接异常'
				} else if (message.includes('timeout')) {
					message = '系统接口请求超时'
				} else if (message.includes('Request failed with status code')) {
					message = '系统接口' + message.substr(message.length - 3) + '异常'
				}
				// toast(message)
				uni.showModal({
					title: '提示',
					content: msg,
					showCancel: false,
					confirmText: '确定',
				});
				reject(error)
			})
	})
}

export default request