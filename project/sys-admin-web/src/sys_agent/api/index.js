let pre = '/lottery-login-api'

// let pre = ''
const api = {
	// 验证
	auth: {
		login: pre + '/user/unlimitedAgentLogin',
		logout: pre + '/user/logout',
		sign: pre + '/system/getSecret'
	}
}

export default api;