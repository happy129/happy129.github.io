
export const menuListAdmin = [
  {
    title: '商户管理',
    icon: 'usergroup-add',
    childrens: [
      {
        text: "商户管理",
        router: '/dashboard/businessManage'
      },
      {
        text: "佣金模式",
        router: '/dashboard/businessCommissionModel'
      },
      {
        text: "商户域名管理",
        router: '/dashboard/bussinessDomainManage'
      }
    ]
  },
  {
    title: '彩票管理',
    icon: 'pie-chart',
    childrens: [
      { text: "彩种分类", router: '/lottery_management/lottery_category' },
      { text: "时间盘口类型", router: '/lottery_management/time_tray_type' },
      { text: "玩法赔率", router: '/lottery_management/play_odds' },
      { text: "彩种管理", router: '/lottery_management/lottery' },
      { text: "开奖号码", router: '/lottery_management/opennos' },
      { text: "六合盘口", router: '/lottery_management/liuhe_handicap' },
      { text: "开奖号码来源", router: '/lottery_management/opennos_source' },
    ]
  },
  {
    title: '财务模块',
    icon: 'dollar',
    childrens: [
      { text: "第三方充值渠道", router: '/finance/thirdPartyIn' },
      { text: "第三方提款渠道", router: '/finance/thirdPartyOut' },
      { text: "银行管理", router: '/finance/banks' }
    ]
  },
  {
    title: '报表管理',
    icon: 'bar-chart',
    childrens: [
      { text: "注单管理", router: '/order_management/order_mng' },
      { text: "追号注单", router: '/order_management/chase_order' },
      { text: "游戏项目汇总", router: '/order_management/game_project' },
      { text: "平台彩票盈亏", router: '/order_management/lottery_profit' },
      { text: "平台第三方盈亏", router: '/order_management/third_profit' },
    ]
  },
  {
    title: '第三方游戏',
    icon: 'shop',
    childrens: [
      {
        text: "游戏管理",
        router: '/third/gameManage'
      },
      {
        text: "转换记录",
        router: '/third/changeRecord'
      },
      {
        text: "注单记录",
        router: '/third/betRecord'
      }
    ]
  },
  {
    title: '版本管理',
    icon: 'code',
    childrens: [
      { text: "商户版本", router: '/version_management/version_mng' }
    ]
  },
  {
    title: '管理员',
    icon: 'cluster',
    childrens: [
      {
        text: "子账号管理",
        router: '/admin/subaccount'
      },
      {
        text: "操作日志",
        router: '/admin/operationLog'
      },
      {
        text: "登录日志",
        router: '/admin/loginLog'
      }
    ]
  },
  {
    title: '商户会员',
    icon: 'user-add',
    childrens: [
      { text: "商户会员统计", router: '/merchant_management/merchantMembershipStatistics' },
      { text: "商户会员列表", router: '/merchant_management/merchantMemberList' },
    ]
  },
  {
    title: '配置管理',
    icon: 'setting',
    childrens: [
      { text: "配置管理", router: '/config_management/configSetting' },
      { text: "字典管理", router: '/config_management/dictionaryManagement' },
      { text: "快捷入口管理", router: '/config_management/quickEntry' },
      { text: "CDN管理与配置", router: '/config_management/cdnManagement' },
    ]
  },
  {
    title: "消息管理",
    icon: 'message'
  }
]