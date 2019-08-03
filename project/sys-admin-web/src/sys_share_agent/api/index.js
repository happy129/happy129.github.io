let pre = '/lottery-login-api'
// let pre = ''
const api = {
	// 验证
	auth: {
		login: pre + '/user/shareAgentLogin',
		logout: pre + '/user/logout',
		sign: pre + '/user/getSecret'
	}
}

export default api;