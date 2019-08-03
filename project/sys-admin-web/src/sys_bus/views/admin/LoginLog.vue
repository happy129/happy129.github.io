<template>
  <div class="page-container">
    <date-switch @changeTab="changeTab" :cleanButton="true" @cleanSelected="cleanSelected"></date-switch>

    <a-form class="mt10" layout="inline">
      <a-form-item label="登录时间：">
        <a-date-picker
          :disabledDate="disabledStartDate"
          format="YYYY-MM-DD 00:00:00"
          v-model="startValue"
          placeholder="开始时间"
          @openChange="handleStartOpenChange"
        />-
        <a-date-picker
          :disabledDate="disabledEndDate"
          format="YYYY-MM-DD 23:59:59"
          placeholder="结束时间"
          v-model="endValue"
          :open="endOpen"
          @openChange="handleEndOpenChange"
        />
      </a-form-item>

      <a-form-item label="用户名：" style="margin-left:20px;margin-right:20px;">
        <a-input v-model="adminName"></a-input>
      </a-form-item>

      <a-form-item label="登陆结果：">
        <a-dropdown>
          <a-menu slot="overlay" @click="handleMenuClick">
            <a-menu-item :key="i" v-for="(v, i) of dropDownList" :value="v">
              <a-icon type="user"/>
              {{v}}
            </a-menu-item>
          </a-menu>
          <a-button style="margin-left: 8px">
            {{dropDownValue}}
            <a-icon type="down"/>
          </a-button>
        </a-dropdown>
      </a-form-item>
      <a-form-item style="margin-left:20px;">
        <a-button type="primary" @click="submit">查询</a-button>
      </a-form-item>
    </a-form>

    <br>

    <a-table
      :columns="columns"
      :dataSource="tableData"
      :pagination="pagination"
      :rowKey="e=> e.id"
      class="mytable"
      bordered
      @change="changePagination"
    >
      <span slot="id" slot-scope="text, records" :class="records.status === 1 ? '':'g-red'">{{records.id}}</span>
      <span slot="adminName" slot-scope="text, records" :class="records.status === 1 ? '':'g-red'">{{records.adminName}}</span>
      <span slot="createTime" slot-scope="text, records" :class="records.status === 1 ? '':'g-red'">{{records.createTime}}</span>
      <span slot="ip" slot-scope="text, records" :class="records.status === 1 ? '':'g-red'">{{records.ip}}</span>
      <span slot="browserInfo" slot-scope="text, records" :class="records.status === 1 ? '':'g-red'">{{records.browserInfo}}</span>
      <span slot="systemName" slot-scope="text, records" :class="records.status === 1 ? '':'g-red'">{{records.systemName}}</span>
      <span slot="status" slot-scope="text, records" :class="records.status === 1 ? '':'g-red'">{{records.status === 1 ? '登录成功' : '登录失败'}}</span>
    </a-table>

    <!-- <div class="page-bottom-box">
      <a-pagination
        :current="pagination.current"
        size="small"
        :total="pagination.total"
        showSizeChanger
        showQuickJumper
        @change="changePagination"
        @showSizeChange="showSizeChange"
      />
    </div> -->
  </div>
</template>
<script>
import Vue from "vue";
import { Component, InjectComponents, Lifecycle, Watch } from "vue-decorators";
import moment from "moment";
import * as Api from "@api/admin";
import {DateSwitch} from "@/components/switch"

@Component()
@InjectComponents({DateSwitch})
export default class LoginLog extends Vue {
  @Watch("startValue") b(c, o) {
    this.createStartTime = moment(c).format("YYYY-MM-DD") + " 00:00:00";
    if (null === c) this.createStartTime = "";
  }

  @Watch("endValue") c(c, o) {
    this.createEndTime =  moment(c).format("YYYY-MM-DD") + " 23:59:59";
    if (null === c) this.createEndTime = "";
  }
  
  createStartTime = moment(new Date()).format("YYYY-MM-DD") + " 00:00:00";
  createEndTime =  moment(new Date()).format("YYYY-MM-DD") + " 23:59:59";
  tableData = [];
  
  startValue = moment(
    moment(new Date()).format("YYYYMMDD") + "000000",
    "YYYYMMDDhhmmss"
  );
  endValue = moment(
    moment(new Date()).format("YYYYMMDD") + "235959",
    "YYYYMMDDhhmmss"
  );
  endOpen = false;

  changeTab(startDate, endDate) {
    this.createStartTime = startDate
    this.createEndTime = endDate
    this.startValue = moment(startDate)
    this.endValue = moment(endDate)
  }

  cleanSelected() {
    this.createStartTime = ""
    this.createEndTime = ""
    this.startValue = null
    this.endValue = null
    this.adminName = ""
    this.status = ""
  }

  adminName = "";
  pagination = { total: 0, current: 1 };
  pageSize = 10;
  status = "";
  dropDownValue = "全部";
  dropDownList = ["全部", "登录成功", "登录失败"];
  handleMenuClick(e) {
    let v = e.item.value;
    let vv = v === "登录成功" ? 1 : v === "登录失败" ? 0 : "";
    this.status = vv;
    this.dropDownValue = v;
  }
  columns = [
    { title: "ID", dataIndex: "id", scopedSlots: { customRender: "id" } },
    { title: "用户名", dataIndex: "adminName", scopedSlots: { customRender: "adminName" } },
    { title: "登录时间", dataIndex: "createTime", scopedSlots: { customRender: "createTime" } },
    { title: "登录IP", dataIndex: "ip", scopedSlots: { customRender: "ip" } },
    { title: "浏览器", dataIndex: "browserInfo", scopedSlots: { customRender: "browserInfo" } },
    { title: "系统", dataIndex: "systemName", scopedSlots: { customRender: "systemName" } },
    {
      title: "操作信息",
      dataIndex: "status",
      scopedSlots: { customRender: "status" }
    }
  ];
  
  disabledStartDate(startValue) {
    const endValue = this.endValue;
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  }
  disabledEndDate(endValue) {
    const startValue = this.startValue;
    if (!endValue || !startValue) {
      return false;
    }
    return startValue.valueOf() >= endValue.valueOf();
  }
  handleStartOpenChange(open) {
    if (!open) {
      this.endOpen = true;
    }
  }
  handleEndOpenChange(open) {
    this.endOpen = open;
  }
  async changePagination(pagination) {
    this.pagination.current = pagination.current;
    this.pageSize = pagination.pageSize;
    await this.getData();
  }
  async showSizeChange(page, pageSize) {
    this.pagination.current = page;
    this.pageSize = pageSize;
    await this.getData();
  }
  async submit() {
    this.pagination.current = 1
    await this.getData();
  }

  async getData() {
    let p = await {
      adminName: this.adminName,
      startTime: this.createStartTime,
      endTime: this.createEndTime,
      pageNo: this.pagination.current,
      pageSize: this.pageSize,
      status: this.status
    };

    let res = await Api.adminLoginLogList(p);

    if (res?.data?.body?.code === 1) {
      this.tableData = res?.data?.body?.data?.records;
      this.pagination.total = res?.data?.body?.data?.totalCount;
    }
  }

  @Lifecycle() mounted() {
    this.getData()
  }
}
</script>
<style lang="scss" scoped>
@import "@views/admin/Pop.scss";
.ant-radio-button-wrapper {
  margin: 8px 5px;
  width: 58px;
  height: 22px;
  line-height: 22px;
  padding: 0px;
  text-align: center;
}
</style>
