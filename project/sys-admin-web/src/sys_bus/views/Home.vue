<template>
  <div class="home-container">
    <div class="side-menu" :class="{ 'side-close': collapsed }">
      <side-menu title="商户后台" :collapsed="collapsed" />
    </div>
    <div class="main-content" :class="{ 'side-close': collapsed }">
      <div class="main-page-header">
        <TopMenu :name="userName" @toggleSide="toggleSide" />
        <TopNavigator />
      </div>
      <div class="main-page-container">
        <router-view />
      </div>
    </div>
    <messageModal ref="modal" />
  </div>
</template>

<script>
import Vue from 'vue'

import { mapActions, mapState } from "vuex";
import { Component, InjectComponents, WatchExtra,State, Lifecycle,Watch} from 'vue-decorators';
import SideMenu from "@/components/side-menu";
import {TopMenu} from '@/components/top-menu';
import TopNavigator from '@/components/top-navigator';
import messageModal from '@/components/messageModal/messageModal';


@Component
@InjectComponents({ SideMenu, TopMenu,messageModal, TopNavigator })
export default class Home extends Vue {
	constructor() { super(); this.collapsed = false; this.userName = ''; }
	
	@State(e => e.auth.userInfo) userInfo;
	@State(s => s.mqttMessges.systemMessage) systemMessage;

  @Lifecycle created() {
		this._receiveMessage();
		this.userName = this.userInfo?.userName;
  }
	/**接受mqtt的消息  */
	_receiveMessage(){
		this.$mqtt.on("message",(topic, payload) => {
			const jsonStr = payload.toString();
			const data=JSON.parse(jsonStr).body;
			setTimeout(() => {
				if(/withdraw/.test(topic)){this.$store.commit('setWithdraw',this.$store.state.mqttMessges.withdraw+1)};
				if(/offlineRecharge/.test(topic)){this.$store.commit('setOfflineRecharge',this.$store.state.mqttMessges.offlineRecharge+1)};
        if(/systemMessage/.test(topic)){this.$store.commit('setSystemMessage',data)};
			}, 10);
		});
	}
  toggleSide(value) {
    this.collapsed = value === 'menu-fold' ? false : true;
	}
	/** 监听systemMessage */
	@Watch("systemMessage.data") _systemMessage (v, i) {
    this.$refs.modal._getMessage(this.$store.state.mqttMessges.systemMessage)
  }
	/** 监听userInfo */
	@Watch("userInfo") _userInfo(value,oldValue) {
    this.$mqtt.$disconnect();
		if(!value.token)return;
		this.$mqtt.$subscribeTopic(value);
		this.$mqtt.$connect();
  }
}
</script>

<style lang="scss" scoped>
.home-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}
.side-menu {
  position: absolute;
  top: 0;
  left: 0;
  width: 256px;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
  bottom: 0;
  transition: all 0.3s;
  &.side-close {
    width: 80px;
  }
}
.main-content {
  padding-left: 256px;
  height: 100%;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;

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
