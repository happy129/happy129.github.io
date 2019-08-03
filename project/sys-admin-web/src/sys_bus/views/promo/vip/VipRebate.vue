<template>
  <section class="deposit-wrapper">
    <a-form layout="inline">
      <date-switch @changeTab="changeTabTime"/>
      <div class="mt15">
        <a-form-item class="sign-reset" label="发放时间">
          <!-- <a-range-picker v-model="defaultValueTime" format="YYYY-MM-DD HH:mm:ss"/> -->
          <DateRange title @change="changeDate" ref="rg"/>
        </a-form-item>
        <a-form-item label="用户名">
          <a-input placeholder="请输入用户名" v-model.trim="form.userName"/>
        </a-form-item>
        <!-- <a-form-item label="用户ID"> 需求隐藏
          <a-input placeholder="请输入用户ID" v-model.trim="form.userId"/>
        </a-form-item>-->
        <a-form-item>
          <div>
            <a-button @click="reset">重置</a-button>&nbsp;
            <a-button type="primary" :loading="loading" @click="_vipRebateQueryTotalByPage(true)">查询</a-button>
          </div>
        </a-form-item>
      </div>
    </a-form>
    <div class="g-gray-border mt15">
      <div class="mt15">
        <div class="mt15">
          <a-table
            :rowKey="(r,i)=>i"
						:loading="loading"
            @change="changeTablePagenation"
            :pagination="paginationParams"
            :columns="table.columns"
            :dataSource="table.dataSource"
            size="small"
          >
            <template slot="isSent" slot-scope="text, record">{{record.isSent === 1 ? '已发送' : '待发送'}}</template>
            <template slot="operation" slot-scope="text,record">
              <a-button
                v-permission="20214" 
                type="primary"
                size="small"
                @click="showPormotionDialog({title:'VIP返水详情',data:record})"
              >详情</a-button>
            </template>
          </a-table>
        </div>
      </div>
    </div>

    <a-modal
      :title="modal.title"
      @ok="modal.showModal=false"
      :destroyOnClose="true"
      v-model="modal.showModal"
      :centered="true"
      :confirmLoading="modal.confirmLoading"
      :maskClosable="false"
      :footer="null"
      width="50%"
    >
      <a-table
        :rowKey="(r,i)=>i"
        @change="changeTablePagenationDetail"
        :pagination="paginationParamsDetail"
        :columns="tableDetail.columns"
        :dataSource="tableDetail.dataSource"
        size="small"
      >
        <template slot="gameType" slot-scope="text, record">
          {{  $getText(record.gameType, gamesType)  }}
        </template>
        <template slot="rebateRate" slot-scope="text, record"> {{record.rebateRate}}% </template>
        <template slot="isSent" slot-scope="text, record">{{record.isSent === 1 ? '已发送' : '待发送'}}</template>
      </a-table>
    </a-modal>
  </section>
</template>

<script>
import Vue from "vue";
import { Component, Computed, InjectComponents, Lifecycle } from "vue-decorators";
import { DateSwitch } from "@/components/switch";
import DateRange from "@/components/date-range/DateRange";
import * as Api from "@api/activity";
import { Message } from "ant-design-vue";
import moment from "moment";


@Component({ methods: { moment } })
@InjectComponents({ DateSwitch, DateRange })
export default class DepositTotal extends Vue {
  // 表格
  table = {
    rowSelection: {},
    dataSource: [],
    columns: [
      { title: "用户名", dataIndex: "userName" },
      { title: "统计区间", dataIndex: "_beginDayAndEndDay" },
      { title: "有效投注", dataIndex: "validBetAmount" },
      { title: "等级", dataIndex: "vipLevel" },
      { title: "返水金额", dataIndex: "rebateAmount" },
      {
        title: "状态",
        dataIndex: "isSent",
        scopedSlots: { customRender: "isSent" }
      },
      { title: "发放时间", dataIndex: "sendTime" },
      {
        title: "操作",
        dataIndex: "operation",
        scopedSlots: { customRender: "operation" }
      }
    ]
  };
  tableDetail = {
    rowSelection: {},
    dataSource: [],
    columns: [
      { title: "来源类型", scopedSlots: { customRender: "gameType" } },
      { title: "有效投注", dataIndex: "validBetAmount" },
      { title: "返水比例", scopedSlots: { customRender: "rebateRate" } },
      { title: "返水金额", dataIndex: "rebateAmount" }
    ]
  };
  // 弹窗里面用到的数据
  modal = { title: "", showModal: false, confirmLoading: false };
  form = {
    beginTime: "",
    endTime: "",
    pageNo: 1,
    pageSize: 10,
    userId: "",
    userName: ""
  };
  formDetail = {
    beginDay: "",
    endDay: "",
    pageNo: 1,
    pageSize: 10,
    userId: ""
  };
  paginationParams = { pageNo: 1, total: 0 };
  paginationParamsDetail = { pageNo: 1, total: 0 };
	defaultValueTime = [];
	loading = false;

  //游戏类型|0:彩票A盘|1:彩票B盘||2:体育|3:真人|4:棋牌|5:电子(当type=1时有效)
  gamesType = [
    { value: 0, name: '彩票A盘' },
    { value: 1, name: '彩票B盘' },
    { value: 2, name: '体育' },
    { value: 3, name: '真人' },
    { value: 4, name: '棋牌' },
    { value: 5, name: '电子' }
  ]


  changeDate(startTime, endTime, datestring, type) {
    if (type === "start") {
      this.form.beginTime = datestring;
    } else {
      this.form.endTime = datestring;
    }
  }

  /* 公共显示modal */
  showPormotionDialog(obj) {
    this.modal.title = obj.title;
    this.modal.showModal = true;
    this._vipRebateQueryDetailByPage(obj);
  }

  reset() {
    this.defaultValueTime = [];
    this.form.userName = "";
    this.form.userId = "";
    this.form.beginTime = "";
    this.form.endTime = "";
    this.$refs.rg.clear();
  }

  /* 模态框内table分页 */
  changeTablePagenationDetail(pagination) {
    this.formDetail.pageNo = pagination.current;
    this.paginationParams.pageNo = pagination.current;
    this._firstRechargeGivenQueryDetail();
  }

  changeDate(startTime, endTime, datestring, type) {
    if (type === "start") {
      this.form.beginTime = datestring;
    } else {
      this.form.endTime = datestring;
    }
  }

  // 切换分页
  changeTablePagenation(pagination) {
    this.form.pageNo = pagination.current;
    this.paginationParams.pageNo = pagination.current;
    this._vipRebateQueryTotalByPage();
  }

  changeTabTime(startDate, endDate) {
    this.form.beginTime = startDate;
    this.form.endTime = endDate;
    this.$refs.rg.setDateRangeValues(startDate, endDate);
  }

  resetPagination() {
    this.form.pageNo = 1;
    this.paginationParams.pageNo = 1;
  }

  /* 获取首充列表 */
  async _vipRebateQueryTotalByPage(reset) {
    // this.form.beginTime=this.defaultValueTime.length?this.defaultValueTime[0].format('YYYY-MM-DD hh:mm:ss'):"";
    // this.form.endTime=this.defaultValueTime.length?this.defaultValueTime[1].format('YYYY-MM-DD hh:mm:ss'):"";
    if (reset) this.resetPagination();
		this.loading = true;
		let { data: req } = await Api.vipRebateQueryTotalByPage(this.form);
		this.loading = false;
    if (req?.body?.code == 1 && req?.body?.data) {
      this.table.dataSource = req.body.data.records.map((item, i) => {
        item._beginDayAndEndDay = item.beginDay + "~" + item.endDay;
        return item;
      });
      this.paginationParams.total = req.body.data.totalCount;
    }
  }

  /* 获取首充详情列表 */
  async _vipRebateQueryDetailByPage(obj) {
    let { data: req } = await Api.vipRebateQueryDetailByPage({
      ...this.formDetail,
      beginDay: obj.data.beginDay,
      endDay: obj.data.endDay,
      userId: obj.data.userId
    });
    if (req?.body?.code === 1 && req?.body?.data) {
      this.tableDetail.dataSource = req.body.data.records;
    }
  }

  @Lifecycle() created() {
    this._vipRebateQueryTotalByPage();
  }
}
</script>

<style lang="scss" scoped>
/deep/ .sign-reset {
  .ant-form-item {
    margin-right: 0;
  }
}
</style>