/**
 *  商户后台路由  
 */
import { HomeView, RouteView } from '@/components/layouts';
import Home from '@views/Home';
import Login from '@views/user/Login';
import Vue from 'vue';
import Router from 'vue-router';
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
      children: [
        {
          path: '/home',
          name: 'homePage',
          meta: { keepAlive: true},
          component: HomeView
        },
        
				/* 第三方游戏 */
				{
					path: '/third',         
					name: 'third',
					meta: { keepAlive: true },
					component: RouteView,
					children: [
						{ path: '/third/betRecord', name: 'betRecord', component: () => import('@views/third/BetRecord')},
						{ path: '/third/creditManagement', name: 'creditManagement', component: () => import('@views/third/creditManagement')},
						{ path: '/third/changeRecord', name: 'changeRecord', component: () => import('@views/third/ChangeRecord')},
						{ path: '/third/gameManage', name: 'gameManage', component: () => import('@views/third/GameManage')},
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
						{ path: 'editName', name: 'editName', component: () => import('@views/admin/EditName')}
					]
				},

        {
          path: '/dashboard',
          name: 'businessHome',
          meta: { keepAlive: false },
          component: RouteView,
          redirect: '/dashboard/businessManage',
          children: [
            { path: '/dashboard/businessManage', name: 'BussinessManage', component: () => import('@views/bussiness/BussinessManage') },
            { path: '/dashboard/businessCommissionModel', name: 'businessCommissionModel', component: () => import('@views/bussiness/BusinessCommissionModel') },
            { path: '/dashboard/bussinessServerMange', name: 'bussinessServerMange', component: () => import('@views/bussiness/BussinessServerMange') },
            { path: '/dashboard/bussinessServiceManage', name: 'bussinessServiceManage', component: () => import('@views/bussiness/BussinessServiceManage') },
            { path: '/dashboard/bussinessDomainManage', name: 'bussinessDomainManage', component: () => import('@views/bussiness/BussinessDomainManage') }
          ]
        },
        {
          path: '/version_management',
          meta: "verisonManage",
          meat: {keepAlive: false},
          component: RouteView,
          redirect: '/version_management/version_mng',
          children: [
            {path: '/version_management/version_mng', name: "versionMng", component: () => import('@views/version_management/version_mng')}
          ]
        },

        /** 彩票管理 */
        {
          path: '/lottery_management',
          name: 'lottery_management',
          meta: { keepAlive: true },
          component: Vue.extend({ name: 'LotteryManagement', render() { return (<RouterView class="lottery_management"/>); }}),
          children: [
            /** 彩种分类 */
            { path: 'lottery_category', name: 'lottery_category', component: () => import('@views/lottery_management/LotteryCategory') },
            /** 时间盘口类型 */
            { path: 'time_tray_type', name: 'time_tray_type', component: () => import('@views/lottery_management/TimeTrayType') },
            /** 玩法赔率 */
            { path: 'play_odds', name: 'play_odds', component: () => import('@views/lottery_management/PlayOdds') },
            /** 彩票管理 */
            { path: 'lottery', name: 'lottery', component: () => import('@views/lottery_management/Lottery') },
            /** 开奖号码 */
            { path: 'opennos', name: 'opennos', component: () => import('@views/lottery_management/Opennos') },
            /** 六合盘口 */
            { path: 'liuhe_handicap', name: 'liuhe_handicap', component: () => import('@views/lottery_management/LiuheHandicap') },
            /** 开奖号码来源 */
            { path: 'opennos_source', name: 'opennos_source', component: () => import('@views/lottery_management/OpennosSource') },
          ]
        },
        
        /** 财务模块 */
        {
         path: '/finance',
         name: 'finance',
         meta: { keepAlive: false },
         component:RouteView,
         children: [
           /** 第三方充值渠道 */
           { path: 'thirdPartyIn', name: 'thirdPartyIn', component: () => import('@views/finance/ThirdPartyIn') },
           /** 第三方提款渠道 */
           { path: 'thirdPartyOut', name: 'thirdPartyOut', component: () => import('@views/finance/ThirdPartyOut') },
           /** 银行管理 */
           { path: 'banks', name: 'banks', component: () => import('@views/finance/Banks') },
             /** 扫码支付配置 */
             { path: 'scanningcodepay', name: 'scanningcodepay', component: () => import('@views/finance/ScanningCodePay') },
         ]

   },
        
         /** 注单查询 */
         {
          path: '/order_management',
          name: 'order_management',
          meta: { keepAlive: true },
          component:RouteView,
          children: [
            /** 注单管理 */
            { path: 'order_mng', name: 'order_mng', component: () => import('@views/order_management/OrderMng') },
            /** 追号注单 */
            { path: 'chase_order', name: 'chase_order', component: () => import('@views/order_management/ChaseOrder') },
            /** 游戏项目汇总 */
            { path: 'game_project', name: 'game_project', component: () => import('@views/order_management/GameProject') },
            /** 平台彩票盈亏 */
            { path: 'lottery_profit', name: 'lottery_profit', component: () => import('@views/order_management/LotteryProfit') },
            /** 平台第三方盈亏 */
            { path: 'third_profit', name: 'third_profit', component: () => import('@views/order_management/ThirdProfit') },
          ]

    },
    /** 配置管理 */
        {
          path: '/config_management',
          name: 'config_management',
          meta: { keepAlive: true },
          component:RouteView,
          children: [
            { path: 'configSetting', name: 'configSetting', component: () => import('@views/config_management/ConfigManage') },
            { path: 'dictionaryManagement', name: 'dictionaryManagement', component: () => import('@views/config_management/dictionaryManagement') },
            { path: 'quickEntry', name: 'quickEntry', component: () => import('@views/config_management/quickEntry') },
            { path: 'cdnManagement', name: 'cdnManagement', component: () => import('@views/config_management/CdnManagement')},
          ]
        },
		/** 商户会员统计 */
		{
			path: '/merchant_management',
			name: 'merchant_management',
			meta: { keepAlive: true },
			component:RouteView,
			children: [
			{ path: 'merchantMembershipStatistics', name: 'merchantMembershipStatistics', component: () => import('@views/merchant_management/merchantMembershipStatistics') },
			{ path: 'merchantMemberList', name: 'merchantMemberList', component: () => import('@views/merchant_management/merchantMemberList') },
			]
			},
		/** 消息管理 */	
		{
				path: '/message_management',
				name: 'message_management',
				meta: { keepAlive: true },
				component:RouteView,
				children: [
					{ path: '/message_management/messageManagement', name: 'messageManagement', component: () => import('@views/message_management/messageManagement')},
					{ path: '/message_management/messageType', name: 'messageType', component: () => import('@views/message_management/messageType')},
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
