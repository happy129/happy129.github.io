import { getToken } from '@/util/auth'

export default function RouterBeforeEach(to, from, next) {
    const token = getToken();

    if (!token) {
        // 防止无限跳转，导致栈内存溢出
        if (to.path !== '/login') {
            next({path: '/login'})
        } else {
            next()
        }
    } else {
        if (to.path === '/login') {
            return next({path: '/'});
        }
        next();
    }
}