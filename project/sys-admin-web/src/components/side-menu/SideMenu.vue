<template>
  <div class="side-layout">
    <div class="logo">
      <router-link to="/">
        <img src="@/assets/logo.png">
        <h1>{{title}}</h1>
      </router-link>
    </div>
    <a-menu
      :key="defaultKey"
      mode="inline"
      theme="dark"
      :openKeys="openKeys"
      :inlineCollapsed="collapsed"
      @openChange="onOpenChange"
      :defaultSelectedKeys="defaultSelectedKeys"
    >
      <a-sub-menu v-for="(item, index) in mList" :key="`sub${index}`">
        <span slot="title">
          <a-icon :type="item.iconClass"/>
          <span>{{item.permissionName}}</span>
        </span>
        <template v-if="item.childrens.length > 0">
          <a-menu-item
            v-for="(elem, i) in item.childrens"
            :key="`menu${index}${i}`"
            @click="addPathAction(elem.permissionUrl, elem.permissionName)"
          >{{elem.permissionName}}</a-menu-item>
        </template>
      </a-sub-menu>
    </a-menu>
  </div>
</template>

<script>
import Vue from "vue";
import {
  Component,
  Prop,
  State,
  Mutation,
  Computed,
  Lifecycle,
  Watch
} from "vue-decorators";
import { menuList } from "./config";
import { menuListAdmin } from "./config-admin";
import { configOperation } from "./config-operation";
import { setTimeout } from "timers";
import agentMeunData from "./agentMeunData";

@Component
export default class SideMenu extends Vue {
  constructor() {
    super();
    this.mList = [];
    this.openKeys = [];
    this.defaultSelectedKeys = [];
    this.defaultKey = 1;
  }
  @Computed rootSubmenuKeys() {
    return new Array(this.mList.length).fill("").map((v, i) => `sub${i}`);
  }
  // 是否折叠， 默认是不折叠
  @Prop({ type: Boolean, default: false }) collapsed;
  // 系统名称
  @Prop({ type: String }) title;
  // 获取全局访问过的导航文件
  @State(state => state.visitedNavigator) navigators;
  // 获取权限列表
  @State(state => state.auth.permission) permission;
  // 修改store中navigator的状态
  @Mutation("setVisitedNavigator") setVisitedNavigator;
  @Mutation("setCurrentPage") setCurrentPage;
  // 监听路由的改变，动态展开左侧导航
  @Watch("$route") async changeRouter(to, from) {
    const toPath = to.path;
    let index = 0, subIndex = 0;
    outer: for (var i = 0; i < this.mList.length; i++) {
      for (var j = 0; j < this.mList[i].childrens.length; j++) {
        if (this.mList[i].childrens[j].permissionUrl == toPath) {
          index = i; subIndex = j;
          break outer;
        }
      }
    }
    this.onOpenChange([`sub${index}`]);
    this.defaultSelectedKeys = [`menu${index}${subIndex}`];
    // 延迟200毫秒执行动画
    await this.delay(240);
    // 强制更新组件，组件的defaultKey不是响应式的
    this.defaultKey += this.defaultKey;
  }

  @Lifecycle created() {
    if (process.env.VUE_APP_TYPE === "sys_agent") {
      this.combineMenulist(agentMeunData);
    } else if (process.env.VUE_APP_TYPE === "sys_share_agent") {
      this.combineMenulist([
        {
          id: 10001,
          parentId: 0,
          isEnabled: 1,
          permissionName: "用户数据管理",
          permissionUrl: "",
          permissionType: 0
        },
        {
          id: 10002,
          parentId: 10001,
          isEnabled: 1,
          permissionName: "数据汇总",
          permissionUrl: "/usercenter/total",
          sortOrder: 1,
          permissionType: 0
        },
        {
          id: 10003,
          parentId: 10001,
          isEnabled: 1,
          permissionName: "用户数据查询",
          permissionUrl: "/usercenter/user-data-query",
          sortOrder: 2,
          permissionType: 0
        },
        {
          id: 10004,
          parentId: 10001,
          isEnabled: 3,
          permissionName: "彩票注单查询",
          permissionUrl: "/usercenter/lottery-query",
          sortOrder: 3,
          permissionType: 0
        },
        {
          id: 10005,
          parentId: 10001,
          isEnabled: 1,
          permissionName: "第三方注单查询",
          permissionUrl: "/usercenter/third-order-query",
          sortOrder: 4,
          permissionType: 0
        },
        {
          id: 10006,
          parentId: 10001,
          isEnabled: 1,
          permissionName: "第三方投注统计",
          permissionUrl: "/usercenter/third-bet-query",
          sortOrder: 5,
          permissionType: 0
        },
        {
          id: 10007,
          parentId: 10001,
          isEnabled: 1,
          permissionName: "充值查询",
          permissionUrl: "/usercenter/deposit-query",
          sortOrder: 6,
          permissionType: 0
        },
        {
          id: 10008,
          parentId: 10001,
          isEnabled: 1,
          permissionName: "提现查询",
          permissionUrl: "/usercenter/withdraw-query",
          sortOrder: 7,
          permissionType: 0
        }
      ])
    }  else {
      if (this.permission.length) {
        this.combineMenulist(this.permission);
      }
    }
  }

  // 拼装数组，把一级导航跟二级导航拆分出来
  combineMenulist(array) {
    //防止后端出现脏数据 直接返回null
    array = array.filter(item => item);
    // 过滤掉标签页
    array = array.filter(item => item.permissionType != 1);
    // 提取一级标签页
    const levelOne = array
      .slice(0)
      .filter(item => item.parentId == 0)
      .map(item => {
        return { ...item, childrens: [] };
      })
      .sort((prev, next) => {
        // 根据sortOrder进行排序
        return prev.sortOrder - next.sortOrder;
      });
    // 提取二级标签
    const levelTwo = array.slice(0).filter(item => item.parentId != 0);
    // 添加children
    for (let i = 0; i < levelOne.length; i++) {
      for (let j = 0; j < levelTwo.length; j++) {
        if (levelOne[i].id == levelTwo[j].parentId) {
          levelOne[i].childrens.push(levelTwo[j]);
        }
      }
    }
    // 从config里面拿到icon根据一级导航进行对应
    let icons = {};
    // process.env.VUE_APP_TYPE === '1' ? menuList : menuListAdmin;

    switch (process.env.VUE_APP_TYPE) {
      case "sys_bus":
        icons = menuList;
        break;
      case "sys_admin":
        icons = menuListAdmin;
        break;
      // 如果只有一个菜单，默认展开
      case "sys_operation_maintenance":
      case "sys_operation":
      case "sys_ffc":
      case "sys_share_agent":
        icons = configOperation;
        this.openKeys = ["sub0"];
        break;
      default:
        icons = menuList;
    }

    levelOne.forEach(item => {
      // 设定一个问号的icon,后面如果有的话会进行替换
      item.iconClass = "question-circle";
      // 对二级菜单进行排序
      item.childrens = item.childrens.sort((prev, next) => {
        return prev.sortOrder - next.sortOrder;
      });
      for (let i = 0; i < icons.length; i++) {
        if (icons[i].title == item.permissionName) {
          item.iconClass = icons[i].icon;
          break;
        }
      }
    });
    this.mList = levelOne;
  }

  delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }
  // 路由跳转前的操作
  addPathAction(path, title) {
    if (!path) return;
    const navi = this.navigators.slice(0);
    const includePath = navi.every(item => item.path !== path);

    if (includePath) {
      navi.push({ path, title });
      this.setVisitedNavigator(navi);
    }
    this.setCurrentPage(path);
    this.$router.push(path);
  }
  // 始终保持只有一个是展开的
  onOpenChange(openKeys) {
    const latestOpenKey = openKeys.find(
      key => this.openKeys.indexOf(key) === -1
    );
    if (this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      this.openKeys = openKeys;
    } else {
      this.openKeys = latestOpenKey ? [latestOpenKey] : [];
    }
  }
}
</script>

<style lang="scss" scoped>
.side-layout /deep/ {
  .ant-menu-submenu-inline {
    border-bottom: 1px solid #313131;
  }
}
</style>