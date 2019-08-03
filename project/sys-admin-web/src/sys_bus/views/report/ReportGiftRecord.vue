<template>
  <div class="page-container">
    <div class="mt15">
      <date-switch @changeTab="changeTab" ref="ds"></date-switch>
    </div>
    <div class="mt15">
      <a-form layout="inline" :form="vform" @submit.prevent="getDataList(true)">
				<date-range @change="changeDate" ref="rg" />
        <a-form-item label="活动类型:">
          <a-select  v-decorator="['activityType', {initialValue: ''}]" style="width: 100px;" @change="changeSelected">
            <a-select-option value="">全部</a-select-option>
            <template v-if="dictionary.activityType">
              <a-select-option v-for="(item, index) in dictionary.activityType" :key="index" :value="item.value">{{item.name}}</a-select-option>
            </template>
          </a-select>
        </a-form-item>
        <a-form-item label="礼金类型">
          <a-select v-decorator="['cashgiftType', {initialValue: ''}]" style="width: 100px;" @change="changeSelected">
            <a-select-option value="">全部</a-select-option>
            <template v-if="dictionary.cashgiftType">
              <a-select-option v-for="(item, index) in dictionary.cashgiftType" :key="index" :value="item.value">{{item.name}}</a-select-option>
            </template>
          </a-select>
        </a-form-item>
        <a-form-item label="用户名">
          <a-input v-decorator="['userName']"/>
        </a-form-item>
        <a-form-item label="用户ID">
          <a-input v-decorator="['userId']"/>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type='submit' :loading="init.loading">查询</a-button>
        </a-form-item>
      </a-form>
    </div>
    <div class="g-gray-border mt15">
      <p class="report-order-text">
        总礼金:
        <span class="g-red bold">{{init.total.allCashgiftSum}}</span>
        用户人数:
        <span class="g-green bold">{{init.total.allUserCount}}</span>
        VIP返水:
        <span class="g-blue bold">{{init.total.vipBackWaterSum}}</span>
        VIP礼金：
        <span class="g-yellow bold">{{init.total.vipCashgiftSum}}</span>
        分享礼金：
        <span class="g-green bold">{{init.total.shareCashgiftSum}}</span>
        分享返水：
        <span class="g-green bold">{{init.total.shareBackWaterSum}}</span>
        首充返水：
        <span class="g-green bold">{{init.total.rechargeBackWaterSum}}</span>
        签到礼金：
        <span class="g-green bold">{{init.total.signCashgiftSum}}</span>
      </p>
    </div>
    <a-table class="mytable" bordered :loading="init.loading" :columns="table.columns" :dataSource="table.dataSource" :rowKey="e => e.id" :pagination="false"  @change="changeTablePagenation">
      <span slot="cashgiftType" slot-scope="text, records">{{getText(records.cashgiftType, dictionary.cashgiftType)}}</span>
      <span slot="activityType" slot-scope="text, records">{{getText(records.activityType, dictionary.activityType)}}</span>
      <span slot="rebateRate" slot-scope="text, records">{{records.rebateRate == 0 ? '0.00' : records.rebateRate}}%</span>
      <span slot="time" slot-scope="text, records"> {{records.beginDay}} - {{records.endDay}}</span>
    </a-table>
    <div style="text-align:right;padding-top:20px;">
      <a-pagination ref="pagination" @change="changeTablePagenation"  :current="table.pagination.current" :defaultCurrent="table.pagination.current" :total="table.pagination.total" />
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { Component, InjectComponents, Lifecycle } from "vue-decorators";
import { TabSwitch, DateSwitch } from "@/components/switch";
import DateRange from '@/components/date-range/DateRange';
import { formatDate } from "@/util/date";

@Component({ dictionary: 'cashgiftType,activityType', formOptions: 'id'})
@InjectComponents({ TabSwitch, DateSwitch, DateRange })
export default class ReportGiftRecord extends Vue {
  table = {
    columns: [
      { title: "订单号", dataIndex: 'transactionNo',},
      { title: "活动类型", dataIndex: "activityType" , scopedSlots: { customRender: "activityType" } },
      { title: "礼金类型", dataIndex: "cashgiftType", scopedSlots: { customRender: "cashgiftType" }},
      { title: "用户名", dataIndex: "userName" },
      { title: "统计区间", dataIndex: "time",  scopedSlots: { customRender: "time" } },
      { title: "有效统计", dataIndex: "validBetAmount" },
      { title: "返水比例", dataIndex: "rebateRate",  scopedSlots: { customRender: "rebateRate" } },
      { title: "礼金金额", dataIndex: "cashgift" },
      { title: "备注", dataIndex: "remark" },
      { title: "发放时间", dataIndex: "createTime" }
    ],
    dataSource: [],
    pagination: { total: 0, current: 1}
	};
    //缓存时间
    queryTimeEnd = "";
	init = {
		params: {
			createStartTime: '',
      createEndTime: '',
      pageNo: 1,
      pageSize: 10,
      platformId: ""
    },
    total: {},
    loading: false
  };

	@Lifecycle mounted() {
    this.init.params.platformId = this.platformId;
    
    this.setInitialDate();
		this.getDataList();
  }

  changeSelected() {
    this.init.params.pageNo = 1;
    this.table.pagination.current = 1;
  }

  setInitialDate() {
    const {startDate, endDate} = this.$refs.ds.getTime();
    this.$refs.rg.setDateRangeValues(startDate, endDate);
    this.init.params.startTime = startDate;
    this.init.params.endTime = endDate;
  }

  changeTablePagenation(pagination) {
    this.table.pagination.current = pagination;
    this.init.params.pageNo = pagination;
    this.getDataList(false, false);
  }

  // 点击日期刷新纪录
  changeTab(startTime, endTime) {
    this.init.params.startTime = startTime ;
    this.init.params.endTime = endTime;
    //this.getDataList();
    this.$refs.rg.setDateRangeValues(startTime, endTime);
  }

	changeDate(startTime, endTime, datestring, type) {
    if (type === 'start') {
      this.init.params.startTime = datestring
    } else {
      this.init.params.endTime = datestring
    }
  }
  
  getText(id, arr) {
    return arr ? arr.find(item => item.value == id)?.name : '全部'; 
  }

  resetPagination() {
    this.table.pagination.current = 1;
    this.init.params.pageNo = 1;
  }

  async getDataList(reset, page=true) {
    if (reset) this.resetPagination();
    const form = await this.vform.validate();
    if (form.errors) return;
    this.init.loading = true;
    // 设置平台id
    this.init.params.platformId = this.platformId;
    // 判断选择时间是否大于当前时间
    if (page) {
      // 如果结束时间大于当前时间，设置为当前时间
      if (this.init.params.endTime) {
        const d = new Date(this.init.params.endTime.replace(/\-/g, '/')).getTime();
        const now = Date.now();
        if (d > now) {
          this.init.params.endTime = formatDate(new Date());
          // 缓存数据
          this.queryTimeEnd = this.init.params.endTime;
        }
      }
    } else {
      const d1 = new Date(this.init.params.endTime.replace(/\-/g, '/')).getTime();
      const d2 = new Date(this.queryTimeEnd.replace(/\-/g, '/')).getTime();
      if (d1 < d2) {
        this.init.params.endTime = this.init.params.endTime;
      } else {
        this.init.params.endTime = this.queryTimeEnd;
      }
    }
    const res = await this.$service.fetch("/lottery-admin-api/cashgiftRecord/queryPageCashgiftRecord", Object.assign(form.values, this.init.params));
    this.hidePageNumber(res);
    this.init.loading = false;
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.table.dataSource = res?.data?.records;
    this.table.pagination.total = res?.data?.totalCount;

    // 查询汇总
    const response = await this.$service.fetch("/lottery-admin-api/cashgiftRecord/queryCashgiftRecordSummary", Object.assign(form.values, this.init.params));
    if (response.code !== 1) return response.message && this.$message.error(response.message);
    this.init.total = response.data;
  }

  /** 隐藏页码 */
  hidePageNumber(res){
    if (!res?.data?.totalPage) return;

    setTimeout(() => {
      // 不超过10页直接不用管
      if (res.data.totalPage <= 10) return;
      // 获取第一个元素
      const fristElement = this.$refs.pagination.$el.querySelector(`.ant-pagination-item-1`);
      // 获取分页的最后一个元素
      const lastElement = this.$refs.pagination.$el.querySelector(`.ant-pagination-item-${res.data.totalPage}`);
      // 大于10页第一个元素隐藏
      lastElement.style.display = 'none';
      // 如果当前页码大于10, 点击的跨度不能大于10， 所以首页得隐藏
      if (res.data.pageNo > 10) {
        fristElement.style.display = 'none';
      } else {
        fristElement.style.display = 'inline-block';
      }
    });
  }
}
</script>

<style>
.report-order-text {
  margin: 15px 0;
}
</style>