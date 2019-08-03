/**
 *  分分彩控制路由  
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
        { path: '/ffc/control', name: 'Control', meta: { keepAlive: true}, component: () => import("@views/lottery/Control") },
        { path: '/ffc/research', name: 'Research', meta: { keepAlive: true}, component: () => import("@views/lottery/Research") },
        { path: '/ffc/total', name: 'TotalData', meta: { keepAlive: true}, component: () => import("@views/lottery/TotalData") }
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
