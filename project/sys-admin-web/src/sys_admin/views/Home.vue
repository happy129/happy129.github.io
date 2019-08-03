<template>
  <div class="home-container">
    <div class="side-menu" :class="{'side-close': collapsed}">
        <side-menu title="总后台" :collapsed="collapsed"/>
    </div>
    <div class="main-content" :class="{'side-close': collapsed}">
        <div class="main-page-header">
          <TopMenuAdmin :name="userName" @toggleSide="toggleSide"/>
          <TopNavigator />
        </div>
        <div class="main-page-container">
          <router-view /> 
        </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents, State, Lifecycle} from 'vue-decorators'
import SideMenu from "@/components/side-menu"
import {TopMenuAdmin} from '@/components/top-menu'
import TopNavigator from '@/components/top-navigator'
@Component
@InjectComponents({ SideMenu, TopMenuAdmin, TopNavigator })
export default class Home extends Vue {

  constructor() {
    super();
    this.collapsed = false;
    this.userName = '';
  }

  @State(e => e.auth.userInfo) userInfo;
   
  @Lifecycle created() {
    this.userName = this.userInfo?.userName;
  } 

  toggleSide(value) {
    this.collapsed = value === 'menu-fold' ? false : true;
  }
}
</script>

<style lang="scss" scoped>
  .home-container {
    position: relative; width: 100%; height: 100%; 
    overflow-x: hidden;   
  }
  .side-menu {
    position: absolute; top: 0; left: 0; width: 256px; 
    box-shadow: 2px 0 6px rgba(0,21,41,.35); bottom: 0;
    transition: all 0.3s;
    &.side-close {
      width: 80px;
    }
  }
  .main-content {
    padding-left: 256px; height: 100%; transition: all 0.3s;
    display: flex; flex-direction: column;

    &.side-close {
      padding-left: 80px;
    }

    .main-page-container {
      flex: 1;
      overflow-y: auto;
      padding: 6px 0 6px 10px;
      background-color: #f2f2f2;
      position: relative;
    }
  }
</style>
