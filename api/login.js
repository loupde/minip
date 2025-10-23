import request from '@/utils/request'

// 登录方法
export function login(code) {
	return request({
		url: `/wx/user/wx0f5e071bf4d5e0b4/login`,
		headers: {
			isToken: false
		},
		method: 'get',
		params: {
			code
		}
	})
}

// 注册方法
export function register(data) {
	return request({
		url: '/register',
		headers: {
			isToken: false
		},
		method: 'post',
		data: data
	})
}

// 获取用户详细信息
export function getInfo() {
	return request({
		url: `/wx/user/test/info`,
		'method': 'get'
	})
}

// 退出方法
export function logout() {
	return request({
		'url': '/logout',
		'method': 'post'
	})
}

// 获取验证码
export function getCodeImg() {
	return request({
		'url': '/captchaImage',
		headers: {
			isToken: false
		},
		method: 'get',
		timeout: 20000
	})
}