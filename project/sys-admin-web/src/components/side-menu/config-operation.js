
export const configOperation = [
  {
    title: '运维管理',
    icon: 'usergroup-add',
    childrens: [
      {
        text: "商户管理",
        router: '/dashboard/platform-manage'
      },
      {
        text: "数据库管理",
        router: '/dashboard/platform-database-manage'
      },
      {
        text: "SQL管理",
        router: '/dashboard/sqlManagement'
      },
      {
        text: "Redis管理",
        router: '/dashboard/redisManagement'
      }
    ]
  }
]