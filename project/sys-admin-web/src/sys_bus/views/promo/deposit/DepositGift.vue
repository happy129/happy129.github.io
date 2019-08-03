<template>
  <section class="deposit-wrapper">
    <a-form layout="inline">
      <date-switch @changeTab="changeTabTime" />
      <div class="mt15">
        <a-form-item class="sign-reset" label="赠送时间">
          <DateRange title='' @change="changeDate" ref="rg"/>
        </a-form-item>
        <a-form-item label="用户名">
          <a-input placeholder="请输入用户名" v-model.trim="form.userName"/>
        </a-form-item>
        <a-form-item>
			<div>
				<a-button @click='reset'>重置</a-button>&nbsp;
        <a-button type='primary' :loading="loading" @click="_firstRechargeGivenQueryDetail(true)">查询</a-button>
			</div>
        </a-form-item>
      </div>
    </a-form>
    <div class="g-gray-border mt15">
      <div class="mt15">
        <div class="deposit-rebate-total">
          充值金额：<span class="g-green bold">{{ summary.totalRechargeAmount || '0.00'}}</span>，
          赠送礼金：<span class="g-blue bold">{{ summary.totalGivenAmount || '0.00'}}</span>，
          赠送人数：<span class="g-yellow bold">{{ summary.totalGivenCount || '0'}}</span>
        </div>

        <div class="mt15">
          <a-table class="mytable" :loading="loading" :rowKey="(r,i)=>i" @change="changeTablePagenation" :pagination="paginationParams" :columns="table.columns" :dataSource="table.dataSource">
            <template slot="operation" slot-scope="text,record">
              <a-button v-permission="20190" type='primary' size='small' @click="showPormotionDialog({title:'首充赠送详情',data:record})">详情</a-button>
            </template>
          </a-table>
        </div>
      </div>
    </div>

  </section>
</template>

<script>
import Vue from 'vue'
import { Component,Computed, InjectComponents, Lifecycle } from 'vue-decorators'
import { DateSwitch } from '@/components/switch'
import * as Api from '@api/activity';
import {Message} from 'ant-design-vue';
import DateRange from '@/components/date-range/DateRange'

@Component()
@InjectComponents({ DateSwitch, DateRange })
export default class DepositTotal extends Vue {
  // 表格
  table = {
    rowSelection: {},
    dataSource: [],
    columns: [
      {title: '用户名', dataIndex: 'userName'},
      {title: '充值订单号', dataIndex: 'transactionNo'},
      {title: '充值金额', dataIndex: 'rechargeAmount'},
      {title: '赠送金额', dataIndex: 'giveAmount'},
      {title: '赠送时间', dataIndex: 'createTime'},
    ]
  }
  // 弹窗里面用到的数据
  loading = false;
	form={beginTime: "",endTime: "",pageNo:1,pageSize:10, userId:"",userName:"" }

	paginationParams={ pageNo: 1, total:0 };

  summary = {};
// 切换分页 
  changeTablePagenation(pagination) {
	this.form.pageNo = pagination.current;
	this.paginationParams.pageNo = pagination.current;
	this._firstRechargeGivenQueryDetail();
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


resetPagination() {
  this.form.pageNo = 1;
  this.paginationParams.pageNo = 1;
}

/* 获取首充列表 */
async _firstRechargeGivenQueryDetail(reset){
    if (reset) this.resetPagination();
    this.loading = true;
    let { data: req } =	await Api.firstRechargeGivenQueryDetail(this.form);
    this.loading = false;
		  if (req?.body?.code == 1 &&req?.body?.data) {
			   this.table.dataSource=req.body.data.records
			   this.paginationParams.total=req.body.data.totalCount;
		   }
	}

  async getSummary() {
    const res = await this.$service.fetch('/lottery-admin-api/firstRechargeGiving/queryPageFirstRechargeGivingItemSummary', this.form);
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.summary = res.data || {};
  }

	@Lifecycle() async  created(){
    await this._firstRechargeGivenQueryDetail();
    this.getSummary();
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