<template>
  <section class="share-wrapper share-setting-wrapper">
    <a-form layout="inline">
      <a-form-item>
        <a-form-item label="状态">
          <a-radio-group v-model="form.isEnabled">
            <a-radio :value="0">关闭</a-radio>
            <a-radio :value="1">开启</a-radio>
          </a-radio-group>
        </a-form-item><br/>
        <a-form-item label="活动对象">
          <a-radio-group v-model="form.userType">
            <a-radio :value="1">正式会员</a-radio>
            <a-radio :value="2">充值用户</a-radio>
          </a-radio-group>
        </a-form-item><br/>
        <a-form-item label="有效时间段">
          <a-range-picker
            :value="[moment(form.beginTime,'YYYY-MM-DD HH:mm:ss'),moment(form.endTime, 'YYYY-MM-DD HH:mm:ss')]"
            format="YYYY-MM-DD HH:mm:ss"
            @change="changeDate"
          />
        </a-form-item><br/>
        <a-form-item label="签到时间段">
          <a-row>
            <a-col>
              <a-time-picker :key="timeKey" :defaultValue="moment(signBeginTime ? signBeginTime : '00:00', 'HH:mm')" @change="changeStartTime" format="HH:mm" placeholder="开始时间" />-
              <a-time-picker :key="timeKey1" :defaultValue="moment(signEndTime ? signEndTime : '00:00', 'HH:mm')" @change="changeEndTime"   format="HH:mm" placeholder="结束时间" />  
            </a-col>
          </a-row>     
        </a-form-item>
      </a-form-item>
      <div class="mt10">
        <a-form-item>
          <a-form-item label="同设备签到次数超过">
            <a-input
              style="display:inline-block;width:80px;"
              placeholder
              v-model.trim="form.sameDeviceSignNum"
            />
          </a-form-item>
          <a-form-item label="次，同IP签到次数超过">
            <a-input style="display:inline-block;width:80px;" placeholder v-model.trim="form.sameIpSignNum"/>
          </a-form-item>
          <a-form-item label="次，领取奖金">
            <a-input style="display:inline-block;width:100px;" placeholder v-model.trim="form.bonus"/>
          </a-form-item>
        </a-form-item>
      </div>
      <div class="page-under-table">
        <a-form-item style="margin-bottom:20px;">
          <a-button
            type="primary"
            v-permission="20203"
            @click="showPormotionDialog({title:'添加奖励金额',sn:'add',data:null})"
          >添加</a-button>
        </a-form-item>
        <a-table
          :rowKey="(r,i)=>i"
          @change="changeTablePagenation"
          :pagination="paginationParams"
          :columns="table.columns"
          :dataSource="form.signSettingItems"
          size="small"
        >
          <template slot="operation" slot-scope="text,record">
            <a-button
              type="primary"
              size="small"
              v-permission="20204"
              @click="showPormotionDialog({title:'修改奖励金额',sn:'edit',data:record})"
            >修改</a-button>
          </template>
        </a-table>
      </div>
      <div class="page-under-table" v-permission="20202">
        <a-form-item>
          <a-form-item label="谷歌验证码">
            <a-input v-model="form.googleCode"/>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="_signRuleSettingSave">保存</a-button>
          </a-form-item>
        </a-form-item>
      </div>
    </a-form>

    <a-modal
      :title="modal.title"
      @ok="enterDialog({title:modal.title,sn:modal.sn})"
      :destroyOnClose="true"
      v-model="modal.showModal"
      :centered="true"
      :confirmLoading="modal.confirmLoading"
      width="30%"
    >
      <a-form layout="inline" :form="vform">
        <a-form-item label="有效投注">
          <!-- <a-input style=" width: 230px;" v-model.trim="signSettingItems.validBetAmount" /> -->
					<a-input style="width: 230px;" @change="changeInputValue" type="number" :min="0" v-decorator="['validBetAmount', {initialValue: signSettingItems.validBetAmount, rules: [{required: true, message: '请输入有效投注'}]} ]" />
        </a-form-item>
        <a-input-group compact>
          <a-form-item style="margin-bottom:20px;" label="奖励金额">
						<!-- v-model.trim="signSettingItems.minBonus" -->
            <a-input
							type="number"
							:min="0"
              style=" width: 140px; text-align: center"
							v-decorator="['minBonus', {initialValue: signSettingItems.minBonus, rules: [{required: true, message: '请输入最小金额以及最大金额'}]} ]"
              placeholder="金额最小值"
              @change="changeInputValue"
            />
            <a-input
              style=" width: 30px; border-left: 0; pointer-events: none; backgroundColor: #fff"
              placeholder="~"
              disabled
            />
						<!-- v-model.trim="signSettingItems.maxBonus" -->
            <a-input
              style="width: 140px; text-align: center; border-left: 0"
							type="number"
							:min="0"
							v-decorator="['maxBonus', {initialValue: signSettingItems.maxBonus, rules: [{required: true, message: '请输入最小金额以及最大金额'}]} ]"
              placeholder="金额最大值"
              @change="changeInputValue"
            />
          </a-form-item>
        </a-input-group>
      </a-form>
    </a-modal>
  </section>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, State } from "vue-decorators";
import moment from "moment";
import * as Api from "@api/activity";
import { Message } from "ant-design-vue";

@Component({ methods: { moment }, formOptions: "id" })
export default class ShareSetting extends Vue {
  @State(s => s.auth.userInfo) userInfo;
  // 表格
  table = {
    dataSource: [],
    columns: [
      { title: "ID", dataIndex: "id" },
      { title: "有效投注", dataIndex: "validBetAmount" },
      { title: "奖励金额", dataIndex: "_minAndMax" },
      {
        title: "操作",
        dataIndex: "operation",
        scopedSlots: { customRender: "operation" }
      }
    ]
  };
  paginationParams = { pageNo: 1, total: 0 };
  timeKey = 1;
  timeKey1 = 3;
  signBeginTime = "";
  signEndTime = "";

  form = {
    beginTime: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
    endTime: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
    bonus: 0, //赠送金额
    isEnabled: 0,
    sameDeviceSignNum: 0,
    sameIpSignNum: 0,
    signSettingItems: [],
    userType: 1,
    googleCode: ""
  };
  signSettingItems = {
    validBetAmount: "",
    minBonus: "",
    maxBonus: "",
    _minAndMax: ""
  };
  // 弹窗里面用到的数据
  modal = {
    title: "",
    showModal: false,
    confirmLoading: false,
    sn: "",
    data: null
  };
  /* 公共显示modal */
  showPormotionDialog(obj) {
    this.signSettingItems = { validBetAmount: "", minBonus: "", maxBonus: "" };
    this.modal.title = obj.title;
    this.modal.showModal = true;
    this.modal.sn = obj.sn;
    if (obj.data) {
      this.signSettingItems = obj.data;
    }
  }
  changeDate(arr, dateString) {
    this.form.beginTime = dateString[0];
    this.form.endTime = dateString[1];
  }
  changeInputValue(e) {
    const { value } = e.target;
    e.target.value = value.replace(/[-|+|*|\/]/, '');
  }

  changeStartTime(time, timestring) {
    this.signBeginTime = timestring;
  }

  changeEndTime(time, timestring) {
    this.signEndTime = timestring;
  }

  async enterDialog() {
		const form = await this.vform.validate();
		if (form.errors) return;

		this.signSettingItems = Object.assign(this.signSettingItems, form.values);

    if (this.modal.sn == "add") {
      //如果是确认
      this.form.signSettingItems.push({
        ...this.signSettingItems,
        _minAndMax:
          this.signSettingItems.minBonus + "-" + this.signSettingItems.maxBonus,
        id: this.form.signSettingItems.length
          ? this.form.signSettingItems.length + 1
          : 1
      });
      this.modal.showModal = false;
      return;
    }
    if (this.modal.sn == "edit") {
      this.form.signSettingItems.map((item, i) => {
        item = this.signSettingItems;
        item._minAndMax = item.minBonus + "-" + item.maxBonus;
        return item;
      });
      this.modal.showModal = false;
      return;
    }
  }
  // 切换分页
  changeTablePagenation(pagination) {
    this.form.pageNo = pagination.current;
    this.paginationParams.pageNo = pagination.current;
    this._firstRechargeGivenQueryDetail();
  }
  /* 保存数据 */
  async _signRuleSettingSave() {
    if (!this.form.signSettingItems.length)
      return Message.error(`奖励金额不能为空！`);
    let arr = this.form.signSettingItems.slice();
    arr.map((item, i) => {
      delete item._minAndMax;
      delete item.id;
      return item;
    });
    let { data: req } = await Api.signRuleSettingSave({
      ...this.form,
      signSettingItems: arr,
      signBeginTime: this.signBeginTime,
      signEndTime: this.signEndTime
    });
    if (req?.body?.code === 1) {
      Message.success(req.body.message);
      this._signRuleSettingQuery();
    }
  }

  async _signRuleSettingQuery() {
    let { data: res } = await Api.signRuleSettingQuery({});
    if (res?.body?.code === 1) {
      this.form = res.body.data;
      this.form.signSettingItems.map((item, i) => {
        item.id = i + 1;
        item._minAndMax = item.minBonus + "-" + item.maxBonus;
        return item;
      });
      this.signBeginTime = res.body.data?.signBeginTime || '';
      this.signEndTime = res.body.data?.signEndTime || '';
      this.timeKey ++;
      this.timeKey1 ++;
    }
	}

  @Lifecycle() created() {
    this._signRuleSettingQuery();
  }
}
</script>


<style lang="scss">
.share-setting-wrapper {
  .ant-form-item-label > label {
    display: inline-block;
    text-align: right;
  }
}
</style>