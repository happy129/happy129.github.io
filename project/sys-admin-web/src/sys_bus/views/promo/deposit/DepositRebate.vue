<template>
  <section class="deposit-wrapper">
    <a-form layout="inline">
      <date-switch @changeTab="changeTabTime"/>
      <div class="mt15">
        <a-form-item class="sign-reset" label="赠送时间">
          <DateRange title='' @change="changeDate" ref="rg"/>
        </a-form-item>
        <a-form-item label="用户名">
          <a-input placeholder="请输入用户名" v-model.trim="form.userName"/>
        </a-form-item>
        <a-form-item>
          <div>
            <a-button @click="reset">重置</a-button>&nbsp;
            <a-button :loading="loading" type="primary" @click="_firstRechargeRebateQueryTotal(true)">查询</a-button>
          </div>
        </a-form-item>
      </div>
    </a-form>
    <div class="g-gray-border mt15">
      <div class="mt15">
        <!-- <div class="deposit-rebate-total">
          总礼金：<span class="g-green bold">90928303</span>，已领取：<span class="g-blue bold">3,631,976.000</span>，未领取：<span class="g-yellow bold">80000</span>
        </div> -->
        <div class="mt15">
          <a-table
            :rowKey="(r,i)=>i"
            :loading="loading" 
            @change="changeTablePagenation"
            :pagination="paginationParams"
            :columns="table.columns"
            :dataSource="table.dataSource"
            class="mytable"
          >
            <template slot="isSent" slot-scope="text,record">
              <span>{{record.isSent == 0 ? "待发送" : "已发送"}}</span>
            </template>
            <template slot="operation" slot-scope="text,record">
              <a-button
                type="primary"
                size="small"
                v-permission="20193"
                @click="showPormotionDialog({title:'首充礼金返水详情',data:record})"
              >详情</a-button>
            </template>
          </a-table>
        </div>
      </div>
    </div>

    <a-modal
      :title="modal.title"
      @ok="activityOk()"
      :destroyOnClose="true"
      v-model="modal.showModal"
      :centered="true"
      :confirmLoading="modal.confirmLoading"
      :width="560"
    >
      <a-table
        :rowKey="(r,i)=>i"
        @change="changeTablePagenationDetail"
        :pagination="paginationParamsDetail"
        :columns="tableDetail.columns"
        :dataSource="tableDetail.dataSource"
        size="small"
      >
        <template slot="rebateRate" slot-scope="text, record">{{ record.rebateRate }}%</template>
      </a-table>
    </a-modal>
  </section>
</template>

<script>
import Vue from "vue";
import {
  Component,
  Computed,
  InjectComponents,
  Lifecycle
} from "vue-decorators";
import { DateSwitch } from "@/components/switch";
import * as Api from "@api/activity";
import { Message } from "ant-design-vue";
import DateRange from '@/components/date-range/DateRange'

@Component()
@InjectComponents({
  DateSwitch,
  DateRange
})
export default class DepositTotal extends Vue {
  // 表格
  table = {
    rowSelection: {},
    dataSource: [],
    columns: [
      { title: "用户名", dataIndex: "userName" },
      { title: "统计时间", dataIndex: "summaryDay" },
      { title: "有效投注", dataIndex: "validBetAmount" },
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
      { title: "来源彩种", dataIndex: "lotteryName" },
      { title: "有效投注", dataIndex: "betCount" },
      { title: "返水比例", scopedSlots: { customRender: "rebateRate" } },
      { title: "返水金额", dataIndex: "rebateAmount" }
    ]
  };
  // 弹窗里面用到的数据
  modal = { title: "", showModal: false, confirmLoading: false };

  loading = false;

  form = {
    beginTime: "",
    endTime: "",
    isSent: "",
    pageNo: 1,
    pageSize: 10,
    userId: "",
    userName: ""
  };
  formDetail = { pageNo: 1, pageSize: 10, userId: "", userName: "" };

  paginationParams = { pageNo: 1, total: 0 };
	paginationParamsDetail = { pageNo: 1, total: 0 };
	
	userId = "";

  changeTablePagenationDetail(pagination) {
		this.paginationParamsDetail.current = pagination.current;
		this.formDetail.pageNo = pagination.current;
		this._firstRechargeRebateQueryDetail();
	}
  // 切换分页
  changeTablePagenation(pagination) {
    this.form.pageNo = pagination.current;
    this.paginationParams.pageNo = pagination.current;
    this._firstRechargeRebateQueryTotal();
  }

  reset() {
    this.form.userName = "";
    this.form.userId = ""
    this.form.beginTime = '';
    this.form.endTime = '';
    this.$refs.rg.clear();
  }

	changeTabTime(startDate, endDate){
		this.form.beginTime=startDate;
    this.form.endTime=endDate;
    this.$refs.rg.setDateRangeValues(startDate, endDate);
	}

  changeDate(startTime, endTime, datestring, type) {
    if (type === "start") {
      this.form.beginTime = datestring
    } else {
      this.form.endTime = datestring
    }
  }

  /* 公共显示modal */
  showPormotionDialog(obj) {
    this.modal.title = obj.title;
		this.modal.showModal = true;
		this.userId = obj.data.userId;
    this._firstRechargeRebateQueryDetail(obj.data);
  }

  resetPagination() {
    this.form.pageNo = 1;
    this.paginationParams.pageNo = 1;
  }

  /* 获取首充列表 */
  async _firstRechargeRebateQueryTotal(reset) {
    if (reset) this.resetPagination();

    this.loading = true;
    let { data: req } = await Api.firstRechargeRebateQueryTotal(this.form);
    this.loading = false;
    if (req?.body?.code == 1 && req?.body?.data) {
      this.table.dataSource = req.body.data.records;
      this.paginationParams.total = req.body.data.totalCount;
    }
  }

  /* 获取首充详情列表 */
  async _firstRechargeRebateQueryDetail(param) {
    let { data: res } = await Api.firstRechargeRebateQueryDetail({
      ...this.formDetail,
      userId: this.userId,
      summaryDay: param?.summaryDay
    });
    if (res?.body?.code === 1 && res?.body?.data) {
			this.tableDetail.dataSource = res.body?.data?.records;
			this.paginationParamsDetail.total = res.body?.data?.totalCount
    } else {
			this.tableDetail.dataSource = []
			this.paginationParamsDetail.total = 1
		}
  }

  @Lifecycle() created() {
    this._firstRechargeRebateQueryTotal();
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