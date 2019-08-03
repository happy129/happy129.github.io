

export const menuList = [
    {
        title: '会员管理',
        icon:  'usergroup-add',
        childrens: [
            {
                text: "会员组管理",
                router: '/dashboard/memberGroupManage'
            },
            {
                text: "会员管理",
                router: '/dashboard/memberManage'
            },
            {
                text: "会员日志",
                router: '/dashboard/memberLog'
            },
            {
                text: "报表忽略",
                router: '/dashboard/memberReportIgnore'
            }
        ]
    },
    {
        title: '财务管理',
        icon:  'dollar',
        childrens: [
            {
                text: "入款设置",
                router: '/finance/payment-setting'
            },
            {
                text: "入款管理",
                router: '/finance/payment-manage'
            },
            {
                text: "出款设置",
                router: '/finance/paymentout-setting'
            },
            {
                text: "出款管理",
                router: '/finance/paymentout-manage'
            },
            {
                text: "手工加减款",
                router: '/finance/manual-deposit'
            },
            {
                text: "账变记录",
                router: '/finance/accountchange-record'
            },
            {
                text: "财务核查",
                router: "/finance/finance-check"
            },
            {
                text: "财务报表",
                router: "/finance/finance-report"
            },
            {
                text: "会员银行信息",
                router: '/finance/membership-bank-information'
            }
        ]
    },
    {
        title: '报表管理',
        icon:  'bar-chart',
        childrens: [
            {
                text: "注单管理",
                router: '/report/orders'
            },
            {
                text: "追号报表",
                router: '/report/chase'
            },
            {
                text: "彩种热度",
                router: '/report/heat'
            },
            {
                text: '游戏项目汇总',
                router: '/report/totalGame'
            },
            {
                text: '礼金记录',
                router: '/report/giftRecord'
            }
        ]
    },
    {
        title: '活动管理',
        icon:  'gift',
        childrens: [
            {
                text: "活动列表",
                router: '/promo/list'
            },
            {
                text: "活动类型列表",
                router: '/promo/type'
            }, 
            {
                text: "首充优惠活动",
                router: '/promo/deposit'
            },
            {
                text: "分享优惠活动",
                router: "/promo/share"
            },
            {
                text: "签到活动",
                router: "/promo/sign"
            },
            {
                text: "VIP活动",
                router: "/promo/vip"
            }
        ]
		},
		{
			title: '公告管理',
			icon:  'pushpin',
			childrens: [
					{
							text: "公告管理",
							router: '/notice/manage'
					},
					{
							text: "实时通知",
							router: '/notice/realtime'
					}, 
					{
							text: "站内信",
							router: '/notice/message'
					},
					{
							text: "轮播图",
							router: "/notice/slideShow"
					}
			]
	},
    {
        title: '代理中心（无限代）',
        icon:  'share-alt'
    },
    {
        title: '彩票管理',
        icon:  'pie-chart',
        childrens: [
            {
                text: "开奖结果",
                router: '/lottery/drawResult'
            },
            {
                text: "六合盘口",
                router: '/lottery/liuhe'
            },
            {
                text: "彩种设置",
                router: '/lottery/setting'
            },
            {
                text: "赔率设置",
                router: '/lottery/oddsSetting'
            },
            {
                text: "玩法下注限额",
                router: '/lottery/betLimit'
            },
        ]
    },
    {
        title: '第三方游戏',
        icon:  'shop',
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
        title: '聊天室管理',
        icon:  'aliwangwang',
        childrens: [
            {
                text: "聊天室设置",
                router: '/chatroom/chatSetting'
            },
            {
                text: "聊天记录",
                router: '/chatroom/chatRecord'
            },
            {
                text: "聊天室红包",
                router: '/chatroom/chatRedPacket'
            },
            {
                text: "聊天室赞赏",
                router: '/chatroom/chatReward'
            },
            {
                text: "聊天室屏蔽词",
                router: '/chatroom/chatStopWords'
            },
            {
                text: "聊天室公告",
                router: '/chatroom/chatNotice'
            }
        ]
    },
    {
        title: '产品管理',
        icon:  'project',
        childrens: [
            {
                text: "产品配置",
                router: '/product/conf'
            },
            {
                text: "提现设置",
                router: '/product/cashSettings'
            },
            {
                text: "大厅彩种分类",
                router: '/product/hallLotteryClass'
            },
            {
                text: '常见问题管理',
                router: '/product/commonquestions'
            },
            {
                text: '在线客服',
                router: '/product/onlineservice'
            },
            {
                text: '限制访问',
                router: '/product/limitaccess'
            }
        ]
    },
    {
        title: "消息管理",
        icon: 'message'
    },
    {
        title: '管理员',
        icon:  'cluster',
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
            },
            {
                text: "会员真实姓名修改",
                router: '/admin/editName'
            }
        ]
    }
]