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
        {
          path: '/home',
          name: 'homePage',
          meta: { keepAlive: true},
          component: HomeView
        },
        /* 会员中心 */
        {
          path: "/dashboard",
          name: "dashboard",
          meta: { keepAlive: true }, 
          redirect: '/dashboard/memberGroupManage',
          component: RouteView,
          children: [
            {
              path: "/dashboard/memberGroupManage",
              name: 'member',
              component: () => import('@views/member/MemberGroupManage') 
            },
            {
              path: '/dashboard/memberManage',
              name: 'memberManage',
              component: () => import('@views/member/MemberManage')
            },
            {
              path: '/dashboard/memberReport',
              name: 'memberReport',
              component: () => import('@views/member/MemberReport')
            },
            {
              path: '/dashboard/memberLog',
              name: 'memberLog',
              component: () => import('@views/member/MemberLog')
            },
            {
              path: '/dashboard/memberReportIgnore',
              name: 'memberReportIgnore',
              component: () => import('@views/member/MemberReportIgnore')
            }
          ]
        },
        /* 代理中心 */
        {
          path: "/agent",
          name: "agent",
          meta: { keepAlive: true },
          component: RouteView,
          children: [
            // 无限代理配置
            { path: "/agent-infinite/setting", name: "AgentSetting", component: () => import('@views/agent-infinite/AgentSetting') },
            // 无限代理排线码
            { path: "/agent-infinite/line-code", name: "AgentLineCode", component: () => import('@views/agent-infinite/AgentLineCode') },
            // 代理佣金
            { path: "/agent-infinite/commission", name: "AgentCommission", component: () => import('@views/agent-infinite/AgentCommission') },
            // 所有上级代理
            { path: "/agent-infinite/higheragent", name: "AgentHigher", component: () => import('@views/agent-infinite/AgentHigher') },
            // 皇冠用户查询
            { path: "/agent-infinite/crown", name: "AgentCrown", component: () => import('@views/agent-infinite/AgentCrown') },
          ]
        },
        /* 运营管理 */
        {
          path: '/operate',
          name: 'operate',
          meta: {keepAlive: true},
          component: RouteView
        },
        /* 财务管理 */
        {
          path: '/finance',
          name: 'finance',
          meta: {keepAlive: true},
          component: RouteView,
          children: [
            // 入款设置
            { path: "/finance/payment-setting", name: "payment-setting", component: () => import('@views/finance/PaymentSetting') },
            // 入款管理
            { path: "/finance/payment-manage", name: "payment-manage", component: () => import('@views/finance/PaymentManage') },
            // 出款设置
            { path: "/finance/paymentout-setting", name: "paymentout-setting", component: () => import('@views/finance/PaymentOutSetting') },
            // 出款管理
            { path: "/finance/paymentout-manage", name: "paymentout-manage", component: () => import('@views/finance/payment-out-manage/PaymentOutManage') },
            // 手工加减款
            { path: "/finance/manual-deposit", name: "manual-deposit", component: () => import('@views/finance/ManualDeposit') },
            // 账变记录
            { path: "/finance/accountchange-record", name: "accountchange-record", component: () => import('@views/finance/AccountchangeRecord')},
            // 财务核查
            { path: "/finance/finance-check", name: "finance-check", component: () => import("@views/finance/FinanceCheck") },
            // 手工加减款
            { path: "/finance/membership-bank-information", name: "membership-bank-information", component: () => import('@views/finance/membership-bank-information/MenbershipBankInformation') },
             // 财务报表
            { path: '/finance/finance-report', name: 'finance-report-child', component: () => import("@views/finance/FinancialStatement") },
             // 不可提额度管理
            { path: "/finance/noquota-management", name: "noquota-management", component: () => import("@views/finance/NotqutoManagement") },
             // 账目汇总
            { path: "/finance/accountSummary", name: "accountSummary", component: () => import("@views/finance/AccountSummary")}
          ]
        },
        /* 报表管理 */
        {
          path: '/report',
          name: 'report',
          meta: {keepAlive: true},
          component: RouteView,
          children: [
            { path: '/report/orders', name: 'orders', component: () => import('@views/report/ReportOrders') },
            { path: '/report/chase', name: 'chase', component: () => import('@views/report/ReportChase') },
            { path: '/report/heat', name: 'heat', component: () => import('@views/report/ReportHeat') },
            { path: '/report/totalGame', name: 'totalGame', component: () => import('@views/report/ReportTotalGame') },
            { path: '/report/giftRecord', name: 'giftRecord', component: () => import('@views/report/ReportGiftRecord') },
          ]
        },
        /* 彩票管理 */
        {
          path: '/lottery',
          name: 'lottery',
          meta: { keepAlive: true },
          component: RouteView,
          children: [
            { path: '/lottery/drawResult', name: 'drawResult', component: () => import('@views/lottery/LotteryDrawResult')},
            { path: '/lottery/liuhe', name: 'liuhe', component: () => import('@views/lottery/LotteryLiuHe')},
            { path: '/lottery/setting', name: 'setting', component: () => import('@views/lottery/LotterySetting')},
            { path: '/lottery/oddsSetting', name: 'oddsSetting', component: () => import('@views/lottery/LotteryOddsSetting')},
            { path: '/lottery/betLimit', name: 'betLimit', component: () => import('@views/lottery/LotteryBetLimit')},
          ]
        },
        /* 活动管理 */
        {
          path: '/promo',
          name: 'promo',
          meta: { keepAlive: true },
          component: RouteView,
          children: [
            { path: '/promo/list', name: 'promoList', component: () => import('@views/promo/PromoList')},
            { path: '/promo/type', name: 'promoType', component: () => import('@views/promo/PromoType')},
            { path: '/promo/deposit', name: 'promoDeposit', component: () => import('@views/promo/PromoDeposit')},
            { path: '/promo/share', name: 'promoShare', component: () => import('@views/promo/PromoShare')},
            { path: '/promo/sign', name: 'promoSign', component: () => import('@views/promo/PromoSign')},
            { path: '/promo/vip', name: 'promoVip', component: () => import('@views/promo/PromoVip')}
          ]
				},
				/* 公告管理 */
				{
          path: '/notice',         
          name: 'notice',
          meta: { keepAlive: false },
          component: RouteView,
          children: [
            { path: '/notice/manage', name: 'noticeManage', component: () => import('@views/notice/NoticeManage')},
            { path: '/notice/realtime', name: 'noticeRealtime', component: () => import('@views/notice/NoticeRealtime')},
            { path: '/notice/message', name: 'noticeMessage', component: () => import('@views/notice/NoticeMessage')},
            { path: '/notice/slideShow', name: 'noticeS+ideShow', component: () => import('@views/notice/NoticeSlideShow')},
          ]
				},
				/* 第三方游戏 */
				{
					path: '/third',         
					name: 'third',
					meta: { keepAlive: true },
					component: RouteView,
					children: [
						{ path: '/third/betRecord', name: 'betRecord', component: () => import('@views/third/BetRecord')},
						{ path: '/third/changeRecord', name: 'changeRecord', component: () => import('@views/third/ChangeRecord')},
						{ path: '/third/gameManage', name: 'gameManage', component: () => import('@views/third/GameManage')},
						{ path: '/third/backwaterManagement', name: 'backwaterManagement', component: () => import('@views/third/backwaterManagement')},
					]
				},
				/* 第三方游戏                                                                                            */
				{
					path: '/chatroom',         
					name: 'chatroom',
					meta: { keepAlive: false },
					component: RouteView,
					children: [
						{ path: '/chatroom/chatNotice', name: 'chatNotice', component: () => import('@views/chatroom/ChatNotice')},
						{ path: '/chatroom/chatRecord', name: 'chatRecord', component: () => import('@views/chatroom/ChatRecord')},
						{ path: '/chatroom/chatRedPacket', name: 'chatRedPacket', component: () => import('@views/chatroom/ChatRedPacket')},
						{ path: '/chatroom/chatReward', name: 'chatReward', component: () => import('@views/chatroom/ChatReward')},
						{ path: '/chatroom/chatSetting', name: 'chatSetting', component: () => import('@views/chatroom/ChatSetting')},
						{ path: '/chatroom/chatStopWords', name: 'chatStopWords', component: () => import('@views/chatroom/ChatStopWords')},
					]
        },
        {
          path: '/product',
          name: 'product',
          meta: {keepAlive: false},
          component: RouteView,
          children: [
            {
              path: 'conf',
              name: 'conf',
              component: () => import('@views/product/ProductSetting')
            },
            {
              path: 'cashSettings',
              name: 'cashSettings',
              component: () => import('@views/product/CashSettings')
            },
            {
              path: 'hallLotteryClass',
              name: 'hallLotteryClass',
              component: () => import('@views/product/HallLotteryClass')
            },
            {
              path: 'commonquestions',
              name: 'commonquestions',
              component: () => import('@views/product/CommonProblems')
            },
            {
              path: 'onlineservice',
              name: 'onlineservice',
              component: () => import('@views/product/OnlineService')
            },
            {
              path: 'limitaccess',
              name: 'limitaccess',
              component: () => import('@views/product/LimitAccess')
            }
          ]
        },
				/**管理员 */
				{
					path: '/admin',         
					name: 'admin',
					meta: { keepAlive: false },
					component: RouteView,
					children: [
            // 子账号管理
            { path: 'subaccount', name: 'subaccount', component: () => import('@views/admin/Subaccount')},
            // 操作日志
            { path: 'operationLog', name: 'operationLog', component: () => import('@views/admin/OperationLog')},
            // 登录日志
						{ path: 'loginLog', name: 'loginLog', component: () => import('@views/admin/LoginLog')},
            // 会员真实姓名修改
            { path: 'editName', name: 'editName', component: () => import('@views/admin/EditName')},
            // 代理后台授权
            { path: 'agent-permission', name: 'agentPermission', component: () => import('@views/admin/AgentPermission') }
					]
        },
        /**充值报表 */
				{
					path: '/rechargeReport',         
					name: 'operationalAnalysis',
					meta: { keepAlive: false },
					component: RouteView,
					children: [
            // 充值报表
            { path: 'rechargeReport', name: 'rechargeReport', component: () => import('@views/recharge_report/RechargeReport')},
					]
				},
				{
					path: '/message_management',
					name: 'message_management',
					meta: { keepAlive: true },
					component:RouteView,
					children: [
						{ path: '/message_management/messageList', name: 'messageManagement', component: () => import('@views/message_management/messageList')},
					]
				}
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
