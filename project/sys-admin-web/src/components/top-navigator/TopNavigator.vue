<template>
  <div class="common-navigator">
    <div class="navigator-left">
      <a-icon type="double-left" @click="clickIcon('left')"/>
      <a-icon type="home" @click="$router.push('/home')"/>
    </div>
    <div class="navigator-center">
      <ul class="navigator-item-list" ref="ul">
        <li
          v-for="(item, index) in navList"
          :key="index"
          :class="{'active': item.path === $route.path}"
        >
          <router-link :to="item.path">
            <span>{{item.title}}</span>
          </router-link>
          <a-icon type="close" @click.stop="closeIcon(item.path)"/>
        </li>
      </ul>
    </div>
    <div class="navigator-right">
      <a-icon type="double-right" @click="clickIcon('right')"/>
      <a-dropdown>
        <a class="ant-dropdown-link dropdown-navigator" href="#">
          <a-icon type="down"/>
        </a>
        <a-menu slot="overlay">
          <a-menu-item>
            <a href="javascript:;" @click="closeTagsByType('current')">关闭当前标签</a>
          </a-menu-item>
          <a-menu-item>
            <a href="javascript:;" @click="closeTagsByType('others')">关闭其他标签</a>
          </a-menu-item>
          <a-menu-item>
            <a href="javascript:;" @click="closeTagsByType('all')">关闭所有标签</a>
          </a-menu-item>
        </a-menu>
      </a-dropdown>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { Component, State, Mutation } from "vue-decorators";

@Component
export default class TopNavigator extends Vue {
  constructor() {
    super();
    this.currentSelected = "home";
    this.times = 0;
  }

  @State(state => state.visitedNavigator) navList;
  @State(state => state.currentPage) currentPage;
  @Mutation("setVisitedNavigator") setVisitedNavigator;
  @Mutation("setCurrentPage") setCurrentPage;

  clickIcon(type) {
    // 给每个li设定的最小宽度
    let scrollWidth = 100;
    let el = this.$refs.ul;
    const calcNumber = Math.floor(el.offsetWidth / scrollWidth);
    // 如果没有滚动，点击的时候不做任何动作
    if (calcNumber > this.navList.length) return;
    // 点击左侧
    if (type === "left") {
      if (this.times === 0) {
        this.times = 1;
      } else {
        // 如果一直点击左侧，发现已经滚动到最后一个了，再次点击左右的箭头， 不做任何动作
        if (this.times >= this.navList.length - calcNumber)  return;
        this.times++;
      }
      el.style.transform = `translate3D(-${scrollWidth * this.times}px, 0, 0)`;
      // 点击右侧
    } else {
      if (Math.abs(this.times) > 0) {
        this.times = this.times < 0 ? this.times + 1 : (this.times - 1) * -1;
      } else {
        this.times = 0;
      }
      el.style.transform = `translate3D(${scrollWidth * this.times}px, 0, 0)`;
    }
  }

  // 关闭当前标签
  closeIcon(path) {
    // store中存的列表
    let navigator = this.navList.slice();
    // 总长度
    let originalLength = navigator.length;
    // 当前点击的标签在导航中的位置
    let currentPathIndex = navigator.findIndex(item => item.path == path);
    // 要跳转的页面
    let routerPath = "";

    if (currentPathIndex === originalLength -1) {
      // 在最后一个位置
      routerPath = currentPathIndex - 1 < 0 ? '/home' : navigator[currentPathIndex - 1]?.path;
    } else if (currentPathIndex == 0) {
      // 在第一个位置
      routerPath = originalLength >= 2 ? navigator[1]?.path : '/home';
    } else {
      // 在中间位置
      routerPath = navigator[currentPathIndex + 1]?.path;
    }
    const setNavigator = navigator.filter(v => v.path !== path);
    this.setVisitedNavigator(setNavigator);
    this.setCurrentPage(routerPath);
    this.$router.push(routerPath);
  }
  
  closeTagsByType(type) {
    let navigator = this.navList.slice();
    let routerPath = "";
    let currentPage = this.currentPage;

    if (type === "current") {
      this.closeIcon(currentPage);
      return;
    } else if (type === "others") {
      navigator = navigator.filter(v => v.path === currentPage);
      routerPath = navigator[0]?.path;
    } else {
      navigator = [];
      routerPath = "/home"
    }

    this.setVisitedNavigator(navigator);
    this.setCurrentPage(routerPath);
    this.$router.push(routerPath);
  }
}
</script>


