<template>
  <section class="deposit-wrapper">
    <a-form layout="inline">
      <date-switch @changeTab="changeTabTime" />
      <div class="mt15">
				<a-form-item class="sign-reset" label="统计时间">
          <DateRange title='' @change="changeDate" ref="rg"/>
        </a-form-item>
        <a-form-item label="用户名">
          <a-input placeholder="请输入用户名" v-model.trim="form.userName"/>
        </a-form-item>
        <!-- <a-form-item label="用户ID"> 需求隐藏
          <a-input placeholder="请输入用户ID" v-model.trim="form.userId"/>
        </a-form-item> -->
        <a-form-item>
			<div>
				<a-button @click='reset'>重置</a-button>&nbsp;
				<a-button :loading="loading" type='primary' @click="_shareRebateQueryTotalByPage(true)">查询</a-button>
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
          <a-table :loading="loading" :rowKey="(r,i)=>i" @change="changeTablePagenation" :pagination="paginationParams" :columns="table.columns" :dataSource="table.dataSource"  size="small">
            <template slot="operation" slot-scope="text,record">
              <a-button v-permission="20199" type='primary' size='small' @click="showPormotionDialog({title:'分享返水详情',data:record})">详情</a-button>
            </template>
          </a-table>
        </div>
      </div>
    </div>

    <a-modal :title="modal.title" @ok="modal.showModal=false" :destroyOnClose="true" v-model="modal.showModal" :centered="true" :confirmLoading="modal.confirmLoading" width="60%">
      <a-form layout="inline">
        <div class="mt15 queryContainer">
          <a-form-item label="">
            <a-input placeholder="来源用户名" v-model="formDetail.sourceUserName"/>
          </a-form-item>
          <a-form-item label="">
            <a-input placeholder="来源用户ID" v-model="formDetail.sourceUserId"/>
          </a-form-item>
         <a-form-item label="">
            <a-select defaultValue="" v-model="formDetail.gameType" style="width: 120px">
              <a-select-option :value="item" v-for='(item,i) in Object.keys(seletions).sort()' :key="i">{{seletions[item]}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button type='primary' @click="_shareRebateQueryDetailByPage">查询</a-button>
          </a-form-item>
        </div>
      </a-form>
      <a-table :rowKey="(r,i)=>i" @change="changeTablePagenationDetail" :pagination="paginationParamsDetail" :columns="tableDetail.columns" :dataSource="tableDetail.dataSource" size="small">  
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
import DateRange from '@/components/date-range/DateRange'

@Component
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
      {title: '用户名', dataIndex: 'userName'},
      {title: '统计时间', dataIndex: 'summaryDay'},
      {title: '有效投注', dataIndex: 'validBetAmount'},
      {title: '返水金额', dataIndex: 'rebateAmount'},
      {title: '状态', dataIndex: '_isSent'},
      {title: '发放时间', dataIndex: 'sendTime'},
      {title: '操作', dataIndex: 'operation', scopedSlots: {customRender: 'operation'}}
    ]
  }

	tableDetail = {
		rowSelection: {},
		dataSource: [],
		columns: [
		{title: '来源用户', dataIndex: 'sourceUserName'},
		{title: '来源类型', dataIndex: '_gameType'},
		{title: '有效投注', dataIndex: 'validBetAmount'},
		{title: '返水比例', dataIndex: 'rebateRate'},
		{title: '返水金额', dataIndex: 'rebateAmount'},
		]
	}
  // 弹窗里面用到的数据
	modal = { title:"", showModal: false, confirmLoading: false };
	form={beginTime: "",endTime: "",pageNo:1,pageSize:10, userId:"",userName:"" }
	formDetail={gameType: "", pageNo: 1, pageSize: 10, sourceUserId: "", sourceUserName: "", userId:""}
	
	paginationParams={ pageNo: 1, total:0 };
	paginationParamsDetail={ pageNo: 1, total:0,obj:null };

	seletions={0:"彩票A盘",1:"彩票B盘",2:"体育",3:"真人",4:"棋牌",5:"电子","":"全部"};

	loading = false;

/* 模态框内table分页 */
	changeTablePagenationDetail(pagination){
		this.formDetail.pageNo = pagination.current;
		this.paginationParamsDetail.pageNo = pagination.current;
		this._shareRebateQueryDetailByPage();
	}
// 切换分页 
  changeTablePagenation(pagination) {
	this.form.pageNo = pagination.current;
	this.paginationParams.pageNo = pagination.current;
	this._shareRebateQueryTotalByPage();
	}

	changeDate(startTime, endTime, datestring, type) {
    if (type === "start") {
      this.form.beginTime = datestring
    } else {
      this.form.endTime = datestring
    }
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


/* 公共显示modal */
	showPormotionDialog(obj) {
		this.modal.title=obj.title;
		this.modal.showModal = true;
		this.paginationParamsDetail.obj=obj;
		this._shareRebateQueryDetailByPage(obj?.data)
	}

resetPagination() {
  this.form.pageNo = 1;
  this.paginationParams.pageNo = 1;
}

/* 获取首充列表 */
async _shareRebateQueryTotalByPage(reset){
    if (reset) this.resetPagination();
		this.loading = true;
		let { data: req } =	await Api.shareRebateQueryTotalByPage(this.form);
		this.loading = false;
		  if (req?.body?.code == 1 &&req?.body?.data) {
			   this.table.dataSource=req.body.data.records.map((item,i)=>{
				   item._isSent=item.isSent==0?'待发送':'已发送';
				   return item;
			   });
			   this.paginationParams.total=req.body.data.totalCount;
		   }
	}


/* 获取首充详情列表 */
async _shareRebateQueryDetailByPage(obj){
    console.log(obj);
		let { data: req } =	await Api.shareRebateQueryDetailByPage({
			...this.formDetail,
      userId: this.paginationParamsDetail.obj.data.userId,
      summaryDay: obj.summaryDay
		});
		  if (req?.body?.code=== 1&&req?.body?.data) {
				this.tableDetail.dataSource= req.body.data.records.map((item,i)=>{
					item._gameType=this.seletions[item.gameType]
					return item;
				});
				this.paginationParamsDetail.total=req.body.data.totalCount;
		  }
	}


	@Lifecycle() created(){
		this._shareRebateQueryTotalByPage();
	}

  
}
</script>

<style lang="scss" scoped>
.queryContainer{
	margin-top:0;
	margin-bottom:10px;
}
/deep/ .sign-reset {
  .ant-form-item {
    margin-right: 0;
  }
}
</style>