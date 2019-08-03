<template>
  <section class="deposit-wrapper">
    <a-form layout="inline">
      <date-switch @changeTab="changeTabTime" />
      <div class="mt15">
        <a-form-item label="用户名">
          <a-input placeholder="请输入用户名" v-model.trim="form.userName"/>
        </a-form-item>
        <a-form-item label="用户ID">
          <a-input placeholder="请输入用户ID" v-model.trim="form.userId"/>
        </a-form-item>
        <a-form-item>
			<div>
				<a-button @click='()=>{this.form.userName="";this.form.userId=""}'>重置</a-button>&nbsp;
				<a-button type='primary' :loading="loading" @click="_firstRechargeGivenQueryTotal(true)">查询</a-button>
			</div>
		</a-form-item>
      </div>
    </a-form>
    <div class="g-gray-border mt15">
      <div class="mt15">
        <div class="deposit-rebate-total">
          总礼金：<span class="g-green bold">{{summary.totalGivenAmount||0}}</span>，
					已领取：<span class="g-blue bold">{{summary.totalReceivedAmount||0}}</span>，
					未领取：<span class="g-yellow bold">{{summary.totalNotReceivedAmount||0}}</span>
        </div>
        <div class="mt15">
			<!-- :rowSelection="table.rowSelection" -->
          <a-table class="mytable" :loading="loading" :rowKey="(r,i)=>i" @change="changeTablePagenation" :pagination="paginationParams" :columns="table.columns" :dataSource="table.dataSource">
            <template slot="operation" slot-scope="text,record">
              <a-button v-permission="20190" type='primary' size='small' @click="showPormotionDialog({title:'首充赠送详情',data:record})">详情</a-button>
            </template>
          </a-table>
        </div>
      </div>
    </div>

	<a-modal :title="modal.title" @ok="modal.showModal=false" :destroyOnClose="true" v-model="modal.showModal" :centered="true" :confirmLoading="modal.confirmLoading" width="50%">
     <a-table :rowKey="(r,i)=>i" @change="changeTablePagenationDetail" :pagination="paginationParamsDetail" :columns="tableDetail.columns" :dataSource="tableDetail.dataSource"  size="small">
            <template slot="operation">
              <a-button type='primary' size='small'>详情</a-button>
            </template>
          </a-table>
    </a-modal>



  </section>
</template>

<script>
import Vue from 'vue'
import { Component,Computed, InjectComponents, Lifecycle } from 'vue-decorators'
import { DateSwitch } from '@/components/switch'
import * as Api from '@api/activity';
import {Message} from 'ant-design-vue';

@Component
@InjectComponents({
  DateSwitch
})
export default class DepositTotal extends Vue {
  // 表格
  table = {
    rowSelection: {},
    dataSource: [],
    columns: [
			{title: 'ID', dataIndex: 'userId'},
      {title: '用户名', dataIndex: 'userName'},
      {title: '总金额', dataIndex: 'totalGivenAmount'},
      {title: '已领取', dataIndex: 'totalReceivedAmount'},
      {title: '状态', dataIndex: '_status'},
      {title: '更新时间', dataIndex: 'updateTime'},
      {title: '操作', dataIndex: 'operation', scopedSlots: {customRender: 'operation'}}
    ]
  }

	tableDetail = {
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
	modal = { title:"", showModal: false, confirmLoading: false };
	loading = false;
	form={beginTime: "",endTime: "",pageNo:1,pageSize:10, userId:"",userName:"" }
	formDetail={beginTime: "", endTime: "", pageNo: 1, pageSize: 10, userId:"", userName: "" }
	paginationParams={ pageNo: 1, total:0 };
	paginationParamsDetail={ pageNo: 1, total:0 };

	// 统计
	summary = {};

/* 模态框内table分页 */
	changeTablePagenationDetail(pagination){
		this.formDetail.pageNo = pagination.current;
		this.paginationParams.pageNo = pagination.current;
		this._firstRechargeGivenQueryDetail();
	}
// 切换分页 
  changeTablePagenation(pagination) {
	this.form.pageNo = pagination.current;
	this.paginationParamsDetail.pageNo = pagination.current;
	this._firstRechargeGivenQueryTotal();
	}


	changeTabTime(startDate, endDate){
		this.form.beginTime=startDate;
		this.form.endTime=endDate;
	}

	async getSummary() {
		const res = await this.$service.fetch("/lottery-admin-api/firstRechargeGiving/firstRechargeGivingSummary", this.form);
		if (res.code !== 1) return res.message && this.$message.error(res.message);
		this.summary = res.data||{};
	}


/* 公共显示modal */
	showPormotionDialog(obj) {
		this.modal.title=obj.title;
		this.modal.showModal = true;
		this._firstRechargeGivenQueryDetail(obj)
	}

/* 获取首充列表 */
async _firstRechargeGivenQueryTotal(reset){
		if (reset) this.resetPagination();
		
		this.loading = true;
		let { data: req } =	await Api.firstRechargeGivenQueryTotal(this.form);
		this.loading = false;
		  if (req?.body?.code == 1 &&req?.body?.data) {
			   this.table.dataSource=req.body.data.records.map((item,i)=>{
				   item._status=item.totalReceivedAmount>=item.totalGivenAmount?'已领取完':'未领取完';
				   return item;
			   });
			   this.paginationParams.total=req.body.data.totalCount;
		   }
	}

resetPagination() {
  this.form.pageNo = 1;
  this.paginationParams.pageNo = 1;
}

/* 获取首充详情列表 */
async _firstRechargeGivenQueryDetail(obj){	
		let { data: req } =	await Api.firstRechargeGivenQueryDetail({
			...this.formDetail,
			userId:obj.data.userId
		});
		  if (req?.body?.code=== 1&&req?.body?.data) {
			this.tableDetail.dataSource= req.body.data.records;
		   }
	}


	@Lifecycle() async created(){
		await this._firstRechargeGivenQueryTotal();
		this.getSummary();
	}

  
}
</script>
