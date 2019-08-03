<template>
  <div class="page-container">
      <div class="mt15">
       <TabSwitch :columns="TabColumns" :defaultSelected="TabSelected" @changeTabs="changeTabs" />
      </div>
			<hr style="border-top:1px solid #eee;"/>
      <div class="mt15">
        <a-form layout="inline">
					<a-form-item label="交易时间">
					<a-range-picker :disabledDate="disabledDate" :showTime="{defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]}" @change="onChange" format="YYYY-MM-DD HH:mm:ss"/>
          </a-form-item>
					<a-form-item label="会员账号">
            <a-input v-model="init.userName"></a-input>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="_queryAll">查询</a-button>
          </a-form-item>
        </a-form>
      </div>
      <div class="mt15">
		  <a-table :rowKey="(r, i) => i" :pagination="false" :columns="table.columns" :dataSource="table.data">
				<template slot="agentBetAmount" slot-scope="r, t">
					<a @click="_queryPageAgentCommissionSummary(t)">{{r+'/'+t.receivableAgentCommission}}</a>
				</template>
				<template slot="directBetAmount" slot-scope="r, t">
					<a @click="_queryPageDirectCommissionSummary(t)">{{r+'/'+t.receivableDirectCommission}}</a>
				</template>
      </a-table>
			<div style="display:flex;justify-content:space-between;margin-top:10px;">
					<strong>天数：{{table.statistics.days||0}}&emsp;佣金：{{table.statistics.commission||0}}</strong>
					<a-pagination :current="pagination.pageNo" :total="pagination.total" @change="changeTablePagenation"/>
				</div>
	  </div>
		<a-modal :title="table.title" :footer="null" v-model="table.agentBetAmount.table1">
      <a-table :rowKey="(r, i) => i" @change="changeTablePagenation1" :pagination="table.agentBetAmount.pagination" :columns="table.agentBetAmount.columns" :dataSource="table.agentBetAmount.data"></a-table>
    </a-modal>
		<a-modal :title="table.title" :footer="null" v-model="table.directBetAmount.table2">
      <a-table :rowKey="(r, i) => i" @change="changeTablePagenation2" :pagination="table.directBetAmount.pagination" :columns="table.directBetAmount.columns" :dataSource="table.directBetAmount.data"></a-table>
    </a-modal>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents, Lifecycle } from 'vue-decorators'
import TabSwitch  from './components/TabSwitch'
import XCascader from './components/XCascader'
import moment from "moment";
@Component({methods: { moment } })
@InjectComponents({
	TabSwitch,
	XCascader
})
export default class ChatRecord extends Vue {
	TabColumns = [];
	TabSelected=0;
	buttonloading = false;
	/** 表格数据 */		
	table={
		title:"",
		data:[],
		statistics:{},
		agentBetAmount:{
			table1:false,
			data:[],
			details:{},
			pagination:{ pageNo: 1, total:0 },
			columns:[
				{title: '会员账号',dataIndex: 'userName'},
				{title: '佣金等级',dataIndex: 'betAmountLevel'},
				{title: '返佣比例',dataIndex: 'commissionRate'},
				{title: '代理业绩',dataIndex: 'agentBetAmount'},
				{title: '代理贡献佣金',dataIndex: 'contributiveAgentCommission'},
				]
		},
		directBetAmount:{
			table2:false,
			data:[],
			details:{},
			pagination:{ pageNo: 1, total:0 },
			columns:[
				{title: '会员账号',dataIndex: 'userName'},
				{title: '有效打码量',dataIndex: 'betAmount'},
				{title: '贡献佣金',dataIndex: 'contributiveDirectCommission'},
				]
		},
		columns : [
		{title: '日期',dataIndex: 'summaryDay'},
		{title: '会员账号',dataIndex: 'userName'},
		{title: '自身佣金等级',dataIndex: 'betAmountLevel'},
		{title: '返佣比例',dataIndex: 'commissionRate'},
		{title: '总业绩',dataIndex: 'betAmount'},
		{title: '代理业绩/佣金',dataIndex: 'agentBetAmount',scopedSlots: { customRender: "agentBetAmount" }},
		{title: '直推业绩/佣金',dataIndex: 'directBetAmount',scopedSlots: { customRender: "directBetAmount" }},
		{title: '总佣金',dataIndex: 'commission'},
	]
	};
	pagination={ pageNo: 1, total:0 };
	init={ endTime: "", pageNo: 1, pageSize: 10, startTime: "", thirdPlatformCode: "", userName: "" };
	// 切换分页 
	changeTablePagenation(p) {
		this.pagination.pageNo = p;
		this._queryPageCommissionSummary();
	}
	changeTablePagenation1(p){
		this.table.agentBetAmount.pagination.pageNo = p.current;
		this._queryPageAgentCommissionSummary(this.table.agentBetAmount.details);
	}
	changeTablePagenation2(p){
		this.table.directBetAmount.pagination.pageNo=p.current;
		this._queryPageDirectCommissionSummary(this.table.directBetAmount.details);
	}

	onChange(startDate, dateString){
		this.init.startTime=moment(dateString[0]).format('YYYY-MM-DD')+' 00:00:00';
		this.init.endTime=moment(dateString[1]).format('YYYY-MM-DD')+' 23:59:59';
	}
	/* 禁用时间 */
	disabledDate(startValue,todayValue) {
		// console.log(moment(startValue).format('YYYY-MM-DD'),moment(todayValue).format('YYYY-MM-DD'))
    // return moment(startValue).valueOf()<moment(todayValue).valueOf()-(1000*60*60*24*45);
  };
	async changeTabs(obj,i) {
		this.TabSelected=i;
		this.pagination.pageNo=1;
		this.init.thirdPlatformCode=obj.thirdGameCode;
		this._queryPageCommissionSummary();
  }

	changeDate(startTime, endTime) {
		this.init.startTime = startTime
		this.init.endTime = endTime
	}
	/** 根据条件查询代理佣金列表 */
	_queryAll(){
		this._queryPageCommissionSummary();
	}
	
	/** 获取彩票代理佣金列表查询 */
	async _queryPageCommissionSummary(){
		if(this.init.startTime.indexOf('Invalid')!==-1){ this.init.startTime=""; this.init.endTime=""; }
		const res = await this.$service.fetch( "/lottery-api/commissionSummary/queryPageCommissionSummary", Object.assign(this.init,this.pagination) );
		if (res.code !== 1){
			this.table.data=[];
			this.pagination.total=0;
			this.table.statistics={};
			this.$message.error(res.message);
			return res.message
		}
		this.table.statistics=res.data;
		this.table.data=this.table.statistics.pageRecords.records;
		this.pagination.total=this.table.statistics.pageRecords.totalCount;
	}
	/** 获取tab数据 */
		async _queryAllLotteryType(obj){
		const res = await this.$service.fetch( "/lottery-api/member/queryAllLotteryType");
		if (res.code !== 1) return res.message && this.$message.error(res.message);
		this.TabColumns=res.data.map(item=>{
			return {thirdGameName:item.thirdGameName,thirdGameCode:item.thirdGameCode,name:item.thirdGameName}
		})
		this.TabColumns.unshift({agentDescAddress:"",isEnabled:1,thirdGameCode:"",thirdGameName:"彩票",name:"彩票"});
	}
	/** 点击显示代理业绩列表 */
	async _queryPageAgentCommissionSummary(obj){
		this.table.agentBetAmount.table1=true;
		this.table.agentBetAmount.details=obj;
		this.table.title="代理业绩/佣金";
		const res = await this.$service.fetch( "/lottery-api/commissionSummary/queryPageAgentCommissionSummary", Object.assign({
		pageSize:10,
		parentId: this.table.agentBetAmount.details.id,
		summaryDay: this.table.agentBetAmount.details.summaryDay,
		thirdPlatformCode:this.init.thirdPlatformCode
		},this.table.agentBetAmount.pagination));
		if (res.code !== 1) return res.message && this.$message.error(res.message);
		this.table.agentBetAmount.data=res.data.records;
		this.table.agentBetAmount.pagination.total=res.data.totalCount;
	}
	/** 点击显示直推业绩列表 */
	async _queryPageDirectCommissionSummary(obj){
		this.table.directBetAmount.table2=true;
		this.table.directBetAmount.details=obj;
		this.table.title="直推业绩/佣金";
		const res = await this.$service.fetch( "/lottery-api/commissionSummary/queryPageDirectCommissionSummary", Object.assign({
		pageSize:10,
		parentId: this.table.directBetAmount.details.id,
		summaryDay: obj.summaryDay,
		thirdPlatformCode: this.init.thirdPlatformCode,
		userId: 0
		},this.table.directBetAmount.pagination) );
		if (res.code !== 1) return res.message && this.$message.error(res.message);
		this.table.directBetAmount.data=res.data.records;
		this.table.directBetAmount.pagination.total=res.data.totalCount;
	}

	@Lifecycle() created(){
		this._queryPageCommissionSummary();
		this._queryAllLotteryType();
	}
}
</script>

<style lang="scss" scoped>

.report-order-text {
  margin: 15px 0;

  span {
    margin-right: 10px;
  }
}
</style>