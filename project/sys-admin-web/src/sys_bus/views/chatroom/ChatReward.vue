<template>
  <!--报表 注单管理 -->
  <div class="page-container">
    <section class="report-order">
      <div class="mt15">
        <date-switch ref="ds" @changeTab="searchByDate"></date-switch>
      </div>
      <div class="mt15">
        <a-form layout="inline">
          <date-range ref="rg" @change="changeDate"/>
          <a-form-item label="设备来源状态">
            <a-select v-model="params.clientType" defaultValue>
              <a-select-option value>全部</a-select-option>
              <a-select-option value="1">Android</a-select-option>
              <a-select-option value="2">IOS</a-select-option>
              <a-select-option value="3">H5</a-select-option>
              <a-select-option value="4">PC</a-select-option>
            </a-select>
          </a-form-item>
          <br>
          <div class="mt15">
            <a-form-item label="赞赏用户名">
              <a-input v-model="params.giveUserName"/>
            </a-form-item>
            <!-- <a-form-item label="赞赏用户ID">
						<a-input v-model="params.giveUserId"/>
            </a-form-item>-->
            <a-form-item label="被赞赏用户名">
              <a-input v-model="params.receiveUserName"/>
            </a-form-item>
            <!-- <a-form-item label="被赞赏用户ID">
						<a-input v-model="params.receiveUserId"/>
            </a-form-item>-->
            <a-form-item>
              <a-button @click="submit" type="primary">查询</a-button>
            </a-form-item>
          </div>
        </a-form>
      </div>
      <div class="mt15">
        <p>
          <em>赞赏用户数：{{shareCount.giveUserCount}}</em>
          <em>被赞赏用户数:{{shareCount.receiveUserCount}}</em>
          <em>赞赏总数:{{shareCount.shareGiveCount}}</em>
          <em>赞赏金额:{{shareCount.shareGiveAmount}}</em>
        </p>
      </div>
      <a-table
        class="mytable mt10"
        bordered
        @change="changeTablePagenation"
        :columns="columns"
        :rowKey="(e,i)=>i"
        :dataSource="tableData"
        :pagination="pagination"
      >
        <template slot="clientType" slot-scope="text, record">
          <span v-show="record.clientType == 4">PC</span>
          <span v-show="record.clientType == 1">Android</span>
          <span v-show="record.clientType == 2">IOS</span>
          <span v-show="record.clientType == 3">H5</span>
        </template>
      </a-table>
    </section>
  </div>
</template>

<script>
import Vue from "vue";
import * as Api from "@api/chatroom";
import DateRange from "@/components/date-range/DateRange";
import { Component, InjectComponents, Lifecycle } from "vue-decorators";
import { TabSwitch, DateSwitch } from "@/components/switch";

@Component
@InjectComponents({
  TabSwitch,
  DateRange,
  DateSwitch
})
export default class ChatReward extends Vue {
  shareCount = {};
  pagination = { total: 0, current: 1 };
  columns = [
    {
      title: "赞赏用户",
      dataIndex: "giveUserName"
    },
    {
      title: "打赏金额",
      dataIndex: "giveAmount"
    },
    {
      title: "被赞赏用户",
      dataIndex: "receiveUserName"
    },
    {
      title: "打赏时间",
      dataIndex: "createTime"
    },
    {
      title: "打赏设备来源",
      scopedSlots: {
        customRender: "clientType"
      }
    }
  ];
  tableData = [];
  @Lifecycle created() {
    this.shareGivePage();
    this.shareGivePageCount();
  }
  params = {
    pageSize: 10,
    pageNo: 1,
    beginTime: "",
    endTime: "",
    // giveUserId:"",
    clientType: "",
    giveUserName: "",
    // receiveUserId:"",
    receiveUserName: ""
  };
  @Lifecycle mounted() {
    this.setInitialDate();
  }
  setInitialDate() {
    const { startDate, endDate } = this.$refs.ds.getTime();
    this.$refs.rg.setDateRangeValues(startDate, endDate);
    this.params.beginTime = startDate;
    this.params.endTime = endDate;
  }
  changeDate(startTime, endTime) {
    this.params.beginTime = startTime;
    this.params.endTime = endTime;
  }
  // 切换分页
  changeTablePagenation(pagination) {
    this.pagination.current = pagination.current;
    this.params.pageNo = pagination.current;
    this.shareGivePage();
   // this.shareGivePageCount();
  }
  searchByDate(startTime, endTime) {
    this.changeDate(startTime, endTime);
    this.$refs.rg.setDateRangeValues(startTime, endTime);
  }
  async shareGivePage(reset) {
    if (reset) {
      this.pagination.current = 1;
      this.params.pageNo = 1;
    }
    const { data: response } = await Api.shareGivePage(this.params);
    if (
      response?.body?.code === 1 &&
      response?.body?.data?.records instanceof Array
    ) {
      this.tableData = response.body.data.records;
			this.pagination.total = response.body.data.totalCount;
			this.shareGivePageCount();
    } else {
			this.tableData = [];
			this.pagination.total = 1;
		}
  }
  async shareGivePageCount() {
    const { data: response } = await Api.shareGivePageCount(this.params);
    if (response?.body?.code === 1) {
      this.shareCount = response.body.data;
    }
  }
  async submit() {
    this.shareGivePage(true);
  }
}
</script>

<style lang="scss">
em {
  font-style: normal;
  display: inline-block;
  margin-right: 20px;
}
.report-order-text {
  margin: 15px 0;

  span {
    margin-right: 10px;
  }
}
</style>