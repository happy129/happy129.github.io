/**
 *  代理后台  
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
				{path: '/home', name: 'homePage', meta: { keepAlive: true},component: HomeView},
				{
          path: "/memberCentreManagement",
          name: "memberCentreManagement",
          meta: { keepAlive: true },
          redirect: '/memberCentreManagement/bettingQuiry',
          component: RouteView,
          children: [
            { path: "/memberCentreManagement/bettingQuiry", name: 'bettingQuiry', component: () => import('@views/memberCentreManagement/bettingQuiry') },
            { path: "/memberCentreManagement/memberCommissionQuiry", name: 'memberCommissionQuiry', component: () => import('@views/memberCentreManagement/memberCommissionQuiry') },
            { path: "/memberCentreManagement/rechargeWithdrawalRecord", name: 'rechargeWithdrawalRecord', component: () => import('@views/memberCentreManagement/rechargeWithdrawalRecord') },
            { path: "/memberCentreManagement/superiorQuiry", name: 'superiorQuiry', component: () => import('@views/memberCentreManagement/superiorQuiry') },
            { path: "/memberCentreManagement/manualDepositInquiry", name: 'manualDepositInquiry', component: () => import('@views/memberCentreManagement/manualDepositInquiry') },
          ]
				},
				{
          path: "/thirdReportManagement",
          name: "thirdReportManagement",
          meta: { keepAlive: true }, 
          redirect: '/thirdReportManagement/thirdPartyProfitLossInQuiry',
          component: RouteView,
          children: [
            { path: "/thirdReportManagement/thirdPartyProfitLossInQuiry", name: 'thirdPartyProfitLossInQuiry', component: () => import('@views/thirdReportManagement/thirdPartyProfitLossInQuiry') },
            { path: "/thirdReportManagement/thirdPartyProfitLossInRecord", name: 'thirdPartyProfitLossInRecord', component: () => import('@views/thirdReportManagement/thirdPartyProfitLossInRecord') },
          ]
				},
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
