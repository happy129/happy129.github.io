<template>
  <!--设备锁管理-->
  <div class="member-dev">
    <div class="member-dev-hd">
      <a-form layout="inline" :form="formElement" @submit.prevent="queryListAction(true)">
        <date-range @change="changeDate" ref="rg"/>
        <a-form-item label="会员ID" v-if="false"> <!--需求, 隐藏id查询-->
          <a-input v-model="form.userId"/>
        </a-form-item>
        <a-form-item label="会员账号"> 
          <a-input v-model="form.userName"/>
        </a-form-item>
        <a-form-item label="状态">
          <a-select defaultValue="" v-model="form.isEnabled" @change="changeSelection">
            <a-select-option value="">全部</a-select-option>
            <a-select-option v-for="(item, index) in dictionary.deviceLockStatus" :key="index" :value="item.value">{{item.name}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit">查询</a-button>
        </a-form-item>
      </a-form>
    </div>
    <div class="page-under-table">
      <a-table class="mytable" bordered :columns="table.columns" :dataSource="table.dataSource" :rowKey="e => e.id" :pagination="table.pagination" @change="changePagination">
        <span slot="status" slot-scope="text, records"> {{records.isEnabled === 0 ? '已解锁' : '锁定'}} </span>
        <template slot="operation" slot-scope="text, records" >
          <a-button type="primary" size="small" v-permission="20015" v-show="records.isEnabled === 1" @click="openLock(records)">解锁</a-button>
        </template>
      </a-table>
    </div>
    <!--modal start-->
    <a-modal title="解锁提示" v-model="init.ModalShow" :destroyOnClose="true" :footer="null">
      <a-form layout="inline" class="open-lock" :form="formElement2" @submit.prevent="doOpenLockAction">
        <a-form-item label="用户名">
          <a-input v-model="init.modal.userName" disabled/>
        </a-form-item>
        <a-form-item label="设备">
          <a-input v-model="init.modal.device" disabled/>
        </a-form-item>
        <div class="page-under-table">
          <a-form-item>
            <a-form-item label="谷歌验证码">
              <a-input v-decorator="['googleCode', {initialValue: '', rules: [{  required: userInfo.isGoogleVerficationEnabled===1, message: '请输入谷歌验证码' }]}]"/>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" html-type="submit">确认解锁</a-button>
            </a-form-item>
          </a-form-item>
        </div>
      </a-form>   
    </a-modal>
    <!--modal end-->
  </div>
</template>

<script>
import Vue from "vue";
import { Component, InjectComponents, Lifecycle, State } from "vue-decorators";
import DateRange from '@/components/date-range/DateRange'
import { getUserDeviceLockInfo } from '@api/member';
import moment from "moment"

@Component({ dictionary: "deviceLockStatus" })
@InjectComponents({ DateRange })
export default class MemberDeviceLock extends Vue {
  @State(s => s.auth.userInfo) userInfo;
  table = {
    columns: [
      { title: "ID", dataIndex: "id" },
      { title: "用户", dataIndex: "userName" },
      { title: "UUID", dataIndex: "auxiliaryCode" },
      { title: "ADID", dataIndex: "deviceCode" },
      { title: "开始时间", dataIndex: "openingTime" },
      { title: "解锁时间", dataIndex: "closingTime" },
      { title: "状态", dataIndex: "isEnabled", scopedSlots: {customRender: 'status'} },
      { title: "解锁", dataIndex: "operation", scopedSlots: { customRender: "operation" } }
    ],
    dataSource: [],
    pagination: { total: 0,  current: 1}
  };
  
  form = {
    startTime: '',
    endTime: '',
    userId: '',
    userName: '',
    isEnabled: '',
    pageNo: 1,
    pageSize: 10
  };

  init = {
    ModalShow: false,
    modal: {
      id: '',
      userName: '',
      device: ''
    }
  };

  @Lifecycle created() {
    this.formElement = this.$form.createForm(this);
    this.formElement2 = this.$form.createForm(this);
  }

  @Lifecycle mounted() {
    //this.setInitialDate();
    this.queryListAction();
  }

  setInitialDate() {
    //设置时间
    const d = new Date();
    this.$refs.rg.setDateRangeValues(d);
    this.form.startTime = moment(d).format("YYYY-MM-DD 00:00:00");  
    this.form.endTime = moment(d).format("YYYY-MM-DD 23:59:59");
  }

  changePagination(pagination) {
    this.table.pagination.current = pagination.current;
    this.form.pageNo = pagination.current;
    this.queryListAction();
  }

  changeSelection() {
    this.form.pageNo = 1;
    this.table.pagination.current = 1;
  }

  changeDate(startTime, endTime, datestring, type) {
    if (type === 'start') {
      this.form.startTime = datestring;
    } else {
      this.form.endTime = datestring;
    }
  }

  openLock(item) {
    this.init.modal.userName = item?.userName;
    this.init.modal.device = item?.auxiliaryCode;
    this.init.modal.id = item?.id;
    this.init.ModalShow = true;
  }

  async doOpenLockAction() {
    this.formElement2.validateFields(async (err, values) => {
      if (!err) {
        const res = await this.$service.fetch('/lottery-admin-api/userDeviceLock/closeUserDeviceLock', Object.assign({
          id: this.init.modal.id
        }, values));
        if (res.code !== 1) res.message && this.$message.error(res.message);
        this.init.ModalShow = false;
        this.$notice.success({ message: res.message });
        this.queryListAction();
      }
    });
  }

  resetPagination() {
    this.table.pagination.current = 1
    this.form.pageNo = 1
  }

  async queryListAction(refresh) {
    if (refresh) this.resetPagination();
    const { data: res } = await getUserDeviceLockInfo(this.form);
    if (res?.body?.code === 1 && res?.body?.data?.records instanceof Array) {
      this.table.dataSource = res.body.data.records;
      this.table.pagination.total = res.body.data?.totalCount
    }
  }
}
</script>

<style lang="scss" scoped>
.open-lock /deep/{
  .ant-form-item-label {
    label {
      display: inline-block;
      width: 100px;
      text-align: right;
    }
  }
}
</style>