<template>
  <div class="member-info">
    <a-form layout="inline" :form="formElement" @submit.prevent="updateMemberInfo">
      <div class="member-info-input">
        <div class="mt5">
          <a-form-item label="用户名">
            <a-input v-model="initFormData.userName" :disabled="true" />
          </a-form-item>
          <a-form-item label="余额">
            <a-input v-model="initFormData.balance" :disabled="true" />
          </a-form-item>
        </div>
        <div class="mt5">
          <a-form-item label="账户类型">
            <a-input v-model="accountType" :disabled="true" />
          </a-form-item>
          <a-form-item label="总充值金额">
            <a-input v-model="initFormData.totalRechargeAmount" :disabled="true" />
          </a-form-item>
        </div>
        <div class="mt5">
          <a-form-item label="VIP等级">
            <a-input v-model="initFormData.vipLevel" :disabled="true" />
          </a-form-item>
          <a-form-item label="提款总额">
            <a-input v-model="initFormData.totalWithdrawAmount" :disabled="true" />
          </a-form-item>
        </div>
        <div class="mt5">
          <a-form-item label="推广码">
            <a-input v-model="initFormData.userCode" :disabled="true" />
          </a-form-item>
          <a-form-item label="有效投注">
            <a-input v-model="initFormData.totalValidBetAmount" :disabled="true" />
          </a-form-item>
        </div>
        <div class="mt5">
          <a-form-item label="注册udid">
            <a-input v-model="initFormData.deviceCode" :disabled="true" />
          </a-form-item>
          <a-form-item label="总投注">
            <a-input v-model="initFormData.totalBetAmount" :disabled="true" />
          </a-form-item>
        </div>
        <div class="mt5">
          <a-form-item label="注册广告ID">
            <a-input v-model="initFormData.auxiliaryCode" :disabled="true" />
          </a-form-item>
          <a-form-item label="注册来源">
            <a-input v-model="registerClientType" :disabled="true" />
          </a-form-item>
        </div>
        <div class="mt5">
          <a-form-item label="登录密码">
            <a-input placeholder="不修改为空" v-decorator="['password', { initialValue: '' }]" />
          </a-form-item>
          <a-form-item label="注册时间">
            <a-input v-model="initFormData.registerTime" :disabled="true" />
          </a-form-item>
        </div>
        <div class="mt5">
          <a-form-item label="支付密码">
            <a-input placeholder="不修改为空" v-decorator="['payPassword', { initialValue: '' }]" />
          </a-form-item>
          <a-form-item label="注册IP">
            <a-input v-model="initFormData.registerIp" :disabled="true" />
          </a-form-item>
        </div>
        <div class="mt5">
          <a-form-item label="昵称">
            <a-input v-decorator="['nickName', { initialValue: initFormData.nickName }]" />
          </a-form-item>
          <a-form-item label="上一次登录">
            <a-input v-model="initFormData.lastLoginTime" :disabled="true" />
          </a-form-item>
        </div>
        <div class="mt5">
          <a-form-item label="真实姓名">
            <a-input v-model="initFormData.realName" :disabled="true" />
          </a-form-item>
          <a-form-item label="最后登录">
            <a-input v-model="initFormData.lastLoginTime" :disabled="true" />
          </a-form-item>
        </div>
        <div class="mt5">
          <a-form-item label="绑定手机">
            <a-input v-decorator="['mobile', { initialValue: initFormData.mobile }]" />
          </a-form-item>
          <a-form-item label="登录客户端">
            <a-input v-model="clientTypeName" :disabled="true" />
          </a-form-item>
        </div>
        <div class="mt5">
          <a-form-item label="备注">
            <a-textarea v-decorator="['remark', { initialValue: initFormData.remark }]" :rows="3" :autosize="false" />
          </a-form-item>
          <a-form-item>
            <div class="member-info-last">
              <a-form-item label="登录IP">
                <a-input v-model="initFormData.loginIp" :disabled="true" />
              </a-form-item>
            </div>
            <div class="member-info-last">
              <a-form-item label="离线时间">
                <a-input v-model="initFormData.offlineTime" :disabled="true" />
              </a-form-item>
            </div>
          </a-form-item>
        </div>
        <div class="mt5">
          <a-form-item label="微信或qq">
            <a-input v-decorator="['wechatOrQQ', { initialValue: initFormData.wechatOrQQ }]" />
          </a-form-item>
        </div>
      </div>
      <div class="member-info-switch">
        <div class="mt5">
          <div class="member-info-ft">
            <a-form-item label="投注限制">
              <a-switch checkedChildren="允许" unCheckedChildren="禁止" :checked="switchChecked.isBetEnabled == 1" @change="checked => changeSwitch(checked, 'isBetEnabled')" />
            </a-form-item>
            <a-form-item label="聊天限制">
              <a-switch checkedChildren="允许" unCheckedChildren="禁止" :checked="switchChecked.isChatEnabled == 1" @change="checked => changeSwitch(checked, 'isChatEnabled')" />
            </a-form-item>
          </div>
          <div class="member-info-ft">
            <a-form-item label="登录限制">
              <a-switch checkedChildren="允许" unCheckedChildren="禁止" :checked="switchChecked.isLoginEnabled == 1" @change="checked => changeSwitch(checked, 'isLoginEnabled')" />
            </a-form-item>
            <a-form-item label="聊天室红包">
              <a-switch checkedChildren="允许" unCheckedChildren="禁止" :checked="switchChecked.isSendRedEnvelopeEnabled == 1" @change="checked => changeSwitch(checked, 'isSendRedEnvelopeEnabled')" />
            </a-form-item>
          </div>
          <div class="member-info-ft">
            <a-form-item label="充值限制">
              <a-switch checkedChildren="允许" unCheckedChildren="禁止" :checked="switchChecked.isRechargeEnabled == 1" @change="checked => changeSwitch(checked, 'isRechargeEnabled')" />
            </a-form-item>
            <a-form-item label="返佣功能">
              <a-switch checkedChildren="允许" unCheckedChildren="禁止" :checked="switchChecked.isReturnCommissionEnabled == 1" @change="checked => changeSwitch(checked, 'isReturnCommissionEnabled')" />
            </a-form-item>
          </div>
          <div class="member-info-ft-last">
            <a-form-item label="提款限制">
              <a-switch checkedChildren="允许" unCheckedChildren="禁止" :checked="switchChecked.isWithdrawEnabled == 1" @change="checked => changeSwitch(checked, 'isWithdrawEnabled')" />
            </a-form-item>
          </div>
        </div>
      </div>
      <div class="page-under-table">
        <a-form-item>
          <a-form-item label="谷歌验证码">
            <a-input v-decorator="['googleCode', { rules: [{ required: userInfo.isGoogleVerficationEnabled === 1, message: '请输入谷歌验证码' }] }]" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit">保存</a-button>
          </a-form-item>
        </a-form-item>
      </div>
    </a-form>
  </div>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle, Prop, State, Computed } from "vue-decorators";
import * as Api from '@api/member';
import md5 from "md5";

@Component({ dictionary: 'userType,clientType' })
export default class MemberInfo extends Vue {
  @State(s => s.auth.userInfo) userInfo;
  //config = config;
  initFormData = {};
  
  switchChecked = {
    isBetEnabled: 1,
    isChatEnabled: 1,
    isLoginEnabled: 1,
    isGiveGiftEnabled: 1,
    isRechargeEnabled: 1,
    isReturnCommissionEnabled: 1,
    isWithdrawEnabled: 1,
    // 额外参数
		isOpenChatRoomEnabled: 0,
		isRebateEnabled: 0,
		isSendRedEnvelopeEnabled: 1,
		isSnatchRedEnvelopeEnabled: 0
  };

  @Prop({ type: Number }) userId;

  @Lifecycle created() {
    this.formElement = this.$form.createForm(this);
  }

  @Computed accountType() {
    return  this.$getText(this.initFormData.userType, this.dictionary.userType);  
  }

  @Computed clientTypeName() {
    return this.$getText(this.initFormData.loginClientType, this.dictionary.clientType);
  }

  @Computed registerClientType() {
    let obj={ 1:"APP端注册", 2:"分享页面注册", 3:"H5注册", 4:"PC端注册"}
    return obj[this.initFormData.sourceType];
  }

  @Lifecycle mounted() {
    this.getMemberInfo();
  }

  changeSwitch(checked, item) {
    this.switchChecked[item] = checked ? 1 : 0;
  }

  async getMemberInfo() {
    const { data: response } = await Api.getUserInfoById({
      id: this.userId
    });
    if (response?.body?.code === 1 && typeof response?.body?.data  === 'object') {
      this.initFormData = response.body.data;

      for (let [key, value] of Object.entries(response.body.data)) {
        Object.keys(this.switchChecked).forEach(item => {
          if (item === key) {
            this.switchChecked[key] = value;
          }
        }); 
      }
    }
  }

  updateMemberInfo() {
    this.formElement.validateFields((err, values) => {
        if (!err) {
          const formData = Object.assign({ id: this.initFormData.id }, this.switchChecked, values);
          if (formData.password !== "") {
            formData.password = md5(formData.password);
          }
          if (formData.payPassword !== "") {
            formData.payPassword = md5(formData.payPassword);
          }
          this.updateMemberInfoAction(formData);
        }
    })
  }

  async updateMemberInfoAction(data) {
    const { data: response } = await Api.editUserInfoById(data);
    
    if ( response?.body?.code === 1 ) {
      this.getMemberInfo();
      this.$emit("close");
      this.$notice.success({ message: response?.body?.message });
    }
  }
}
</script>

<style lang="scss" scroped>
.member-info-input {
  .mt5 {
    display: flex;
    justify-content: space-between;
    .ant-form-item-label {
      label {
        width: 100px;
        display: inline-block;
        text-align: right;
      }
    }
    .ant-input {
      width: 250px;
    }
  }
  .member-info-last {
    .ant-form-item {
      margin-right: 0;
    }
  }
}
.member-info-switch {
  .mt5 {
    display: flex;
    justify-content: space-between;
  }
}
.member-info-ft-last {
  .ant-form-item {
    width: 130px;
  }
}
.member-info {
  .page-under-table {
    display: flex;
    justify-content: center;
    align-content: center;
  }
}
</style>
