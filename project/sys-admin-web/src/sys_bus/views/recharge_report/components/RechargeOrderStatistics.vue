<template>
  <div class="page-wrapper-1">
    <div>
      <a-form layout="inline" :form="form">
        <!-- <a-form-item label="统计时间">
          <a-range-picker :key="key" allowClear @change="onChange" :showTime="{defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]}" format="YYYY-MM-DD HH:mm:ss" />
        </a-form-item> -->
        <a-form-item>
          <DateRange :defaultDate="true" :showTime="true" @current="setCurrent" title="统计时间" @change="changeDate" ref="rg"/>
        </a-form-item>
        <a-form-item label="支付渠道" style="margin:0px 10px;">
          <a-select style="width:150px;" v-model="params.thirdPaymentId" placeholder="请选择">
            <a-select-option :value="``">全部</a-select-option>
            <a-select-option v-for="(d, i) in thirdPaymentIdAndNameList" :value="d.id" :key="i">{{d.paymentChannelName}}</a-select-option>
          </a-select>
        </a-form-item>
				<!-- v-permission="10141" -->
        <a-form-item style="margin-left:10px;">
          <a-button type="primary" ref="btnSave" @click="_query">查询</a-button>
        </a-form-item>
      </a-form>
    </div>
    <div class="mt15">
      <a-table :columns="table.columns" @change="handleTableChange" :dataSource="table.data" :pagination="false" :rowKey="(e,i) => i" class="mytable" bordered></a-table>
      <div style="text-align:right;padding-top:20px;">
        <a-pagination :current="pagination.pageNo" showSizeChanger :pageSizeOptions="['10', '20', '30', '40', '50', '100']" @showSizeChange="onShowSizeChange"  :total="pagination.total" @change="changePagination" />
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { Component, InjectComponents, Computed, Lifecycle, Watch } from "vue-decorators";
import DateRange from "@/components/date-range/DateRange"
import moment from "moment"

@Component({methods:{moment}})
@InjectComponents({ DateRange })
export default class ChangeRecord extends Vue {
  thirdPaymentIdAndNameList=[];
  pagination = {total:0,pageNo:1,pageSize:10 };
  table = {
		data:[],
    columns: [
      { title: "支付渠道", dataIndex: "thirdPaymentName" },
      { title: "支付方式", dataIndex: "paymentName" },
      { title: "充值成功订单",sorter: true, dataIndex: "successCount" },
      { title: "充值失败订单", dataIndex: "failCount" },
      { title: "充值未处理订单", dataIndex: "unprocessedCount" },
      { title: "充值订单总数", dataIndex: "totalCount" },
      { title: "成功率",sorter: true, dataIndex: "successRate" },
      { title: "iOS成功率", dataIndex: "iosSuccessRate" },
      { title: "Android成功率", dataIndex: "androidSuccessRate" },
      { title: "H5成功率", dataIndex: "h5SuccessRate" },
      { title: "PC成功率", dataIndex: "pcSuccessRate" },
			// { title: "操作", scopedSlots: { customRender: "operate" } }
    ]
  };
  
  params={sortList:[{sortField: "successCount",sortOrder: "asc"}],statTimeEnd:"",statTimeStart:"",thirdPaymentId:""};
  
	// onChange(date, dateString){
	// 	this.params.statTimeStart=moment(dateString[0]).format('YYYY-MM-DD')+' 00:00:00';
	// 	this.params.statTimeEnd=moment(dateString[1]).format('YYYY-MM-DD')+' 23:59:59';
  // }

  setCurrent(startTime, endTime) {
    this.params.statTimeStart = startTime;
    this.params.statTimeEnd = endTime;
  }

  changeDate(startTime, endTime, datestring, type) {
    if (type === "start") {
      this.params.statTimeStart = datestring
    } else {
      this.params.statTimeEnd = datestring
    }
  }

  onShowSizeChange(current, pageSize){
    this.pagination.pageSize=pageSize;
    this._queryRechargeOrderSummary();
  }

  /* 表格点击排序 */
  handleTableChange (pagination, filters, sorter) {
    if (sorter.order) {
      if(sorter.order=="ascend"){this.params.sortList[0].sortField = sorter?.field; this.params.sortList[0].sortOrder = 'asc'};
      if(sorter.order=="descend"){this.params.sortList[0].sortField = sorter?.field; this.params.sortList[0].sortOrder = 'desc'};
    }else{
      this.params.sortList[0].sortField = 'successCount';this.params.sortList[0].sortOrder = 'asc';
    }
    this._queryRechargeOrderSummary();
  }

  async changePagination(p, s) {
    this.pagination.pageNo = p;
    this.pageSize = s;
    await this._queryRechargeOrderSummary();
  }
	_query(){
		this.pagination.pageNo=1;
		this._queryRechargeOrderSummary();
	}
	/** 分页查询充值订单统计 */
  async _queryRechargeOrderSummary() {
		let res = await this.$service.fetch("/lottery-admin-api/rechargeReport/queryRechargeOrderSummary",Object.assign(this.params,this.pagination));
		if (1!==res.code) return res.message && this.$message.error(res.message);
		this.table.data = res.data.records;
		this.pagination.total = res.data.totalCount;
	}
	/** 查询第三方支付渠道名称 */
  async _querySummaryThirdPaymentIdAndNameList() {
		let res = await this.$service.fetch("/config-admin-api/thirdPayment/querySummaryThirdPaymentIdAndNameList");
    if (1!==res.code) return res.message && this.$message.error(res.message);
    this.thirdPaymentIdAndNameList=res.data;
	}
  @Lifecycle() async created() {
		this.form = this.$form.createForm(this);
    this._queryRechargeOrderSummary();
    this._querySummaryThirdPaymentIdAndNameList();
	}
}
</script>
<style lang="scss" scoped>
.page-wrapper /deep/ {
  position: relative;
  min-height: 100%;
}
</style>