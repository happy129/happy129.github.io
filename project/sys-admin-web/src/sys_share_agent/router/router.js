/**
 *  分分彩控制路由  
 */

import Vue from 'vue'
import Router from 'vue-router'
import Login from '@views/user/Login'
import { RouteView } from '@/components/layouts'
import Home from '@views/Home'
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
        { path: '/home', name: 'homePage', meta: { keepAlive: true}, component: () => import("@views/user/HomeView") },
        // 数据汇总
        { path: '/usercenter/total', name: 'Total', meta: { keepAlive: true }, component: () => import("@views/user-center/TotalQuery") },
        // 用户数据查询
        { path: '/usercenter/user-data-query', name: 'Total', meta: { keepAlive: true }, component: () => import("@views/user-center/UserDataQuery") },
        // 彩票注单查询
        { path: '/usercenter/lottery-query', name: 'LotteryQuery', meta: { keepAlive: true }, component: () => import("@views/user-center/LotteryQuery") },
        // 第三方注单查询
        { path: '/usercenter/third-order-query', name: 'ThirdOrderQuery', meta: { keepAlive: true }, component: () => import("@views/user-center/ThirdOrderQuery") },
        // 第三方投注统计
        { path: '/usercenter/third-bet-query', name: 'ThirdBetQuery', meta: { keepAlive: true }, component: () => import("@views/user-center/ThirdBetQuery") },
        // 充值查询
        { path: '/usercenter/deposit-query', name: 'DepositQuery', meta: { keepAlive: true }, component: () => import("@views/user-center/DepositQuery") },
        // 提现查询
        { path: '/usercenter/withdraw-query', name: 'WithdrawQuery', meta: { keepAlive: true }, component: () => import("@views/user-center/WithdrawQuery") }
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
