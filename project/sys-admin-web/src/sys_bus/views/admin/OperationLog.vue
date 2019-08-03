<template>
  <div class="page-container">
    
    <date-switch @changeTab="changeTab" :cleanButton="true" @cleanSelected="cleanSelected"></date-switch>
    

    <a-form class="mt10" layout="inline">
      <a-form-item label="操作时间：">
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
      <a-form-item label="选择模块" style="margin-left:20px;">
        <a-select v-model="moduleType" style="width:140px">
          <a-select-option value="">全部</a-select-option>
          <a-select-option v-for="(item, index) in dictionary.platformSystemModule" :key="index" :value="item.value">{{item.name}}</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="用户名：" style="margin-left:20px;margin-right:20px;">
        <a-input v-model="adminName"></a-input>
      </a-form-item>

      <a-form-item label="关键字：">
        <a-input v-model="keyWords"></a-input>
      </a-form-item>

      <a-form-item>
        <a-button type="primary" @click="submit" style="margin-left:20px;">查询</a-button>
      </a-form-item>
    </a-form>

    <br>

    <a-table :columns="columns" :dataSource="tableData" :pagination="pagination"  @change="changePagination" :rowKey="e=>e.id" class="mytable" bordered>
      <template slot="moduleType" slot-scope="text, record">
        {{ $getText(record.moduleType,  dictionary.platformSystemModule) }}
      </template>
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

const dictionary = "platformSystemModule";

@Component({ dictionary })
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
    this.keyWords = ""
  }
  moduleType = "";
  keyWords = "";
  adminName = "";
  pagination = { total: 0, current: 1 };
  pageSize = 10;
  columns = [
    { title: "ID", dataIndex: "id" },
    { title: "操作员", dataIndex: "adminName" },
    { title: "操作模块", scopedSlots: { customRender: 'moduleType' }},
    { title: "操作内容", dataIndex: "operateDescription" },
    { title: "操作时间", dataIndex: "createTime" },
    { title: "操作IP", dataIndex: "operateIp" }
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
      keyWords: this.keyWords,
      moduleType: this.moduleType
    };

    let res = await Api.adminOperateLogList(p);

    if (res?.data?.body?.code === 1) {
      this.tableData = res?.data?.body?.data?.records;
      this.pagination.total = res?.data?.body?.data?.totalCount;
    }
  }

  @Lifecycle() async mounted() {
    await this.getData()
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
