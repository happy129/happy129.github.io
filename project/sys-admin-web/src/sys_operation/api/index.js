let pre = '/config-admin-api'
// let pre = ''
const api = {
	// 验证
	auth: {
		login: pre + '/admin/login',
		logout: pre + '/admin/logout',
		sign: pre + '/system/getSecret'
	}
}

export default api;