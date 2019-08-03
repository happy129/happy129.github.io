<template>
  <div class="layout-header">
    <div class="toggle-icon">
      <a-icon :type="icon" @click="toggleSide"/>
    </div>
    <div class="layout-user-wrap">
      <div  v-if="isShowMessage" class="current-member-count">
        <a-dropdown>
          <a class="ant-dropdown-link" href="javascript:;">当前在线人数：<span class="g-yellow bold">{{onlinePersons.PC+onlinePersons.H5+onlinePersons.IOS+onlinePersons.Android}}</span> </a>
          <a-menu slot="overlay">
            <a-menu-item>
              <a href="javascript:;">PC: {{onlinePersons.PC}}</a>
            </a-menu-item>
            <a-menu-item>
              <a href="javascript:;">H5: {{onlinePersons.H5}}</a>
            </a-menu-item>
            <a-menu-item>
              <a href="javascript:;">IOS: {{onlinePersons.IOS}}</a>
            </a-menu-item>
            <a-menu-item>
              <a href="javascript:;">Android: {{onlinePersons.Android}}</a>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </div>
      <div  v-if="isShowMessage" class="layout-hd-ico-right" style="cursor:pointer;" @click="$router.push({name:'payment-manage',query:{status:'-2'}})">
        <a-badge :count="msg.pay" :numberStyle="{boxShadow: 'none', height: '12px', lineHeight: '12px', fontSize: '10px', padding: '0 4px'}" ><a-icon type="download" />&nbsp;充</a-badge>
      </div>
      <div  v-if="isShowMessage" class="layout-hd-ico-right" style="cursor:pointer;" @click="$router.push({name:'paymentout-manage',query:{status:'-2'}})">
        <a-badge :count="msg.withdraw" :numberStyle="{boxShadow: 'none', height: '12px', lineHeight: '12px', fontSize: '10px', padding: '0 4px'}"><a-icon type="upload"/>&nbsp;提</a-badge>
      </div>
      <div  v-if="isShowMessage" class="user-avatar layout-hd-ico-right">
				<a-dropdown>
					<a class="ant-dropdown-link" href="javascript:;"><a-icon type="setting" />&nbsp;消息设置</a>
          <a-menu slot="overlay" class="msgConfig">
            <a-menu-item>
              <div style="height:40px;line-height:40px;">声音提示：<div class="dropdownContainer" @click.stop="onChange('audio')"></div><a-switch v-model="checkeds.audio"/></div>
            </a-menu-item>
						<a-menu-item>
              <div style="border-bottom:1px solid #ddd;"></div>
            </a-menu-item>
            <a-menu-item>
              <div style="height:40px;line-height:40px;">页面提示：<div class="dropdownContainer" style="top:80px;" @click.stop="onChange('page')"></div><a-switch v-model="checkeds.page"/></div>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </div>
      <div class="user-avatar">
        <a-dropdown>
          <a class="ant-dropdown-link" href="javascript:;">{{name}}<a-icon type="caret-down"/></a>
          <a-menu slot="overlay" >
            <a-menu-item>
              <a href="javascript:;" @click="updatePassword">修改密码</a>
            </a-menu-item>
            <a-menu-item>
              <a href="javascript:;" @click="logoutAction">退出</a>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </div>
    </div>
    <!-- show modify password dialog-->
    <a-modal title="修改密码" v-model="visible" :confirmLoading="confirmLoading" :destroyOnClose="true" :footer="null" :width="440" >
      <a-form class="modify-password" :form="formModifyPassword" @submit.prevent="modiyPassword">
        <a-form-item label="账号" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
          <a-input v-decorator="['account', { initialValue: form.account }]" :disabled="true"/>
        </a-form-item>
        <a-form-item label="昵称" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
          <a-input v-decorator="['nickname', { initialValue: form.nickname}]" :disabled="true"/>
        </a-form-item>
        <a-form-item label="旧密码" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
          <a-input type="password" v-decorator="['originPassword', {rules: [{ required: true, message: '请输入旧密码' }]}]" />
        </a-form-item>
        <a-form-item label="新密码" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
          <a-input type="password" v-decorator="['password', {rules: [{ required: true, pattern:/^[a-z0-9]{6,12}$/, message: '6-12码英文数字夹杂并且符合0~9及a~z字元'}]}]"/>
        </a-form-item>
        <a-form-item label="确认新密码" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
          <a-input type="password" v-decorator="['rePassword', {rules: [{ required: true, pattern:/^[a-z0-9]{6,12}$/, message: '6-12码英文数字夹杂并且符合0~9及a~z字元'}]}]" />
        </a-form-item>
        <div class="modify-btn">
          <a-button type="primary" html-type="submit" :loading="loading">提交</a-button>
        </div>
      </a-form>
    </a-modal>
		<audio id="pay" ref="pay" src="/static/pay.wav" style="display: none;" controls="controls"></audio>
		<audio id="withdraw" ref="withdraw" src="/static/withdraw.wav" style="display: none;" controls="controls"></audio>
  </div>
</template>

<script>
import Vue from "vue";
import Cookie from "js-cookie";
import { Component, Prop, State, Mutation, Lifecycle, Action,Watch } from "vue-decorators";
import { Notification } from "ant-design-vue";
import { removeToken } from "@/util/auth";
import md5 from "md5"

@Component
export default class TopMenu extends Vue {
  constructor() {
    super();
    this.icon = "menu-fold";
    this.visible = false;
    this.confirmLoading = false;
    this.init = { id: "" };
    this.loading = false;
		this.form = { account: "", nickname: "" };
		this.onlinePersons={ PC:0, H5:0, IOS:0, Android:0 };
		this.checkeds={ audio:false, page:false };
    this.msg={pay:0,withdraw:0}
    this.timer=null;
  }
  @Prop({ type: String }) name;
  @State(e => e.auth.userInfo) userInfo;
  @Action("auth/Logout") Logout;
  @Mutation('setVisitedNavigator') setVisitedNavigator;
  @Mutation('auth/updateUserInfo') updateUserInfo;

  // 部分后台不需要显示会员信息等，通过传参取消
  @Prop({ type: Boolean, default: true }) isShowMessage;

  

  toggleSide() {
    this.icon = this.icon === "menu-fold" ? "menu-unfold" : "menu-fold";
    this.$emit("toggleSide", this.icon);
  }
  // 登出操作
  logoutAction() {
    this.Logout().then(res => {
      //if (res?.data?.body?.code === 1) 
      this.$router.push("/login");
    });
  }
  updatePassword() {
    this.visible = true;
  }

  // 确认修改密码
  modiyPassword() {
    this.formModifyPassword.validateFields(async (err, values) => {
      if (!err) {
        this.loading = true;
        // 判断是否是前台修改密码
        const isFrontEnd = process.env.VUE_APP_TYPE === 'sys_share_agent' || process.env.VUE_APP_TYPE === 'sys_agent';
        // 前台调用接口地址跟后台调用的接口地址不一样
        const requestUrl = isFrontEnd ? '/lottery-api/user/editPassword' : '/config-admin-api/admin/editOwnPassword';

        let res = {};

        if (isFrontEnd) {
          // 前台调用接口参数也不一致
          res = await this.$service.fetch(
            requestUrl,
            {
              auxiliaryCode: "PC",
              deviceCode: "PC",
              confirmNewPassword: md5(values?.rePassword),
              newPassword: md5(values?.password),
              oldPassword: md5(values?.originPassword)
            }
          );
        } else {
          // 后台调用
          // values.rePassword = md5(values.rePassword);
          // values.password =  md5(values?.password);
          // values.originPassword = md5(values.originPassword);

          res = await this.$service.fetch(
            requestUrl,
            Object.assign(this.init, values)
          );
        }
  
        this.loading = false;
        if (res.code !== 1) return res.message && this.$message.error(res.message);
        this.visible = false;
        this.$modal.confirm({
          title: "提示",
          content: "修改密码成功，请重新登录",
          onOk: () => {
            // 移除token
            removeToken();
            // 清除用户信息
            this.updateUserInfo({});
            // 清除选中的导航
            this.setVisitedNavigator([]);
            this.$router.push("/login");
          }
        });
      }
    });
	}
	onChange(sn){
		if(sn==='audio'){
			localStorage.audio=!this.checkeds.audio;
			return this.checkeds.audio=!this.checkeds.audio;
		}
		localStorage.page=!this.checkeds.page;
		return this.checkeds.page=!this.checkeds.page;
	}
	async _getOnlineUserCount(){
    const res = await this.$service.fetch("/config-admin-api/platform/getOnlineUserCount");
		if (1 !== res.code) return res.message && this.$message.error(res.message);
		this.onlinePersons.PC=res.data.pcUserCount;
		this.onlinePersons.H5=res.data.h5UserCount;
		this.onlinePersons.IOS=res.data.iosUserCount;
		this.onlinePersons.Android=res.data.androidUserCount;
	}
	/** 获取线下充值待处理的数量  */
	async _getOfflineRechageAndWithdrawCount(){
		const res = await this.$service.fetch("/lottery-admin-api/rechargeRecord/getOfflineRechageCount");
		if (1 !== res.code) return res.message && this.$message.error(res.message);
		this.msg.pay=res.data.waitDealRechargeCount;
		this.msg.withdraw=res.data.waitDealWithdrawCount;
  }
  
	/** 获取10s消息 */
	async _auto10sGetMessage(sn){
    await this.$nextTick();
    clearInterval(this.timer);
		this.timer=setInterval(()=>{
			if(this.checkeds.audio){
				if(this.$store.state.mqttMessges.withdraw){this.$refs.withdraw.play();}
				if(this.$store.state.mqttMessges.offlineRecharge){this.$refs.pay.play();} 
			}
			if(this.checkeds.page){
				this.$store.state.mqttMessges.withdraw && Notification.success({ message: '提示', description: `您有【${this.$store.state.mqttMessges.withdraw}】条新的提现订单需要处理`,duration:4 });
				this.$store.state.mqttMessges.offlineRecharge && Notification.success({ message:'提示', description: `您有【${this.$store.state.mqttMessges.offlineRecharge}】条新的充值订单需要处理`,duration:4 });
			}
			this.$store.commit('setWithdraw',0);
      this.$store.commit('setOfflineRecharge',0);
      this._getOnlineUserCount();
		},30*1000)
  }
  @Lifecycle beforeDestroy() {
    console.log('销毁定时器',this.timer)
    window.clearInterval(this.timer);
  }
  @Lifecycle created() {
		this.checkeds.audio=localStorage.audio==='true'?true:false;
		this.checkeds.page=localStorage.page==='true'?true:false;
		this.init.id = this.userInfo?.adminId;
    this.form.account = this.userInfo?.userName;
		this.form.nickname = this.userInfo?.nickName;
    this.formModifyPassword = this.$form.createForm(this);
    if (this.isShowMessage) {
      this._getOnlineUserCount();
      this._auto10sGetMessage();
      this._getOfflineRechageAndWithdrawCount();
    }
  }
  
}
</script>


<style lang="scss" scoped>
.modify-password /deep/ {
  .ant-row {
    margin-bottom: 4px;
  }
  .modify-btn {
    margin-top: 20px;
    text-align: right;
  }
}
.dropdownContainer{position:absolute;top:20px;right:0;width:120px;height:20px;z-index:999;}
</style>