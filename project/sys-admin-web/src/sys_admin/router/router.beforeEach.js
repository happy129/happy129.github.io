import { getToken } from '@/util/auth'
import store from "@store/store";

let permissionUrls = store.state?.auth?.permission?.filter(item => item?.permissionUrl && item?.isEnabled == 1).map(v => v?.permissionUrl) || [];

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
        } else {
            if (permissionUrls.length === 0) {
                permissionUrls = store.state?.auth?.permission?.filter(item => item?.permissionUrl && item?.isEnabled == 1).map(v => v?.permissionUrl) || [];
            }
             // 权限跳转控制, 如果没有权限跳转到首页
             if (permissionUrls && !permissionUrls.includes(to.path) && to.path != "/home" && to.path != "/login") {
                next({ path: '/home' });
            } else {
                next()
            }
        }
        //next();
    }
}