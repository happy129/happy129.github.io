/**
 *  商户后台路由  
 */

import Vue from 'vue'
import Router from 'vue-router'
import Home from '@views/Home'
import Login from '@views/user/Login'
import { RouteView, HomeView } from '@/components/layouts'
import RouterBeforeEach from "./router.beforeEach";

Vue.use(Router)

const router = new Router({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      redirect: '/home',
      meta: { keepAlive: true},
      children: [
        { path: '/home', name: 'homePage', meta: { keepAlive: true}, component: HomeView },
        { path: '/dashboard/platform-manage', name: 'platform', meta: { keepAlive: true}, component: () => import("@views/bus/BussinessManage") },
        { path: '/dashboard/platform-database-manage', name: 'database', meta: { keepAlive: true}, component: () => import("@views/bus/DatabaseManage") },
        { path: "/dashboard/sqlManagement", name: 'SqlManagement',meta: { keepAlive: true}, component: () => import('@views/sqlCentreManagement/SqlManagement') },
        { path: "/dashboard/redisManagement", name: 'SqlManagement',meta: { keepAlive: true}, component: () => import('@views/redisManagement/redisManagement') },
      ]
    },
    /* 登录页面 */
    {
      path: '/login',                     
      name: 'login',
      component: Login
    }
  ]
});


router.beforeEach(RouterBeforeEach);



export default router;
