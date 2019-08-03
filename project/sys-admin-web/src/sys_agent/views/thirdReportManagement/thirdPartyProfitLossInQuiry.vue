<template>
  <!--报表 注单管理 -->
  <div class="page-container">
    <section class="report-order">
      <div class="mt15">
        <DateSwitch @changeTab="changeTabTime"/>
      </div>
			<hr style="border-top:1px solid #eee;"/>
      <div class="mt15">
        <a-form layout="inline">
					<a-form-item>
						<DateRange title="结算时间" ref="rg" @change="onChange"/>
            <!-- <a-range-picker :defaultValue="valueTime"  @change="onChange" format="YYYY-MM-DD HH:mm:ss"/> -->
          </a-form-item>
					<a-form-item label="会员账号">
            <a-input v-model.trim="params.userName"></a-input>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" :loading="loading" @click="_query">查询</a-button>
          </a-form-item>
        </a-form>
      </div>
      <div class="mt15">
				<!-- @click="_jumpDetail(item,'remove')" -->
			<a-button v-if="table.parentIds.length" style="margin-bottom:10px;" type="default" @click="_jumpDetail('back')">返回</a-button><div style="display:none;">&emsp;<span v-for="(item,i) in table.parentJson" :key="i">{{item.userName}}></span></div>
		  <a-table bordered :rowKey="(r, i) => i" :pagination="false" :columns="table.columns" :dataSource="table.data">
				<template slot="userName" slot-scope="value, rows">
            <a v-if="rows.directChildNum" @click="_jumpDetail(rows)">{{value}}-{{rows.userId}}</a>
            <span v-else>{{value}}</span>
        </template>
				<template slot="validBetAmount1" slot-scope="value, rows">
            <span>{{rows.agOrderProfitSummaryRespVO.validBetUserNum}}/{{rows.agOrderProfitSummaryRespVO.validBetAmount}}</span>
        </template>
				<template slot="rebateAmount1" slot-scope="value, rows">
            <span>{{rows.agOrderProfitSummaryRespVO.rebateAmount}}</span>
        </template>
				<template slot="profit1" slot-scope="value, rows">
            <span>{{rows.agOrderProfitSummaryRespVO.profit}}</span>
        </template>
				<template slot="validBetAmount2" slot-scope="value, rows">
            <span>{{rows.cardOrderProfitSummaryRespVO.validBetUserNum}}/{{rows.cardOrderProfitSummaryRespVO.validBetAmount}}</span>
        </template>
				<template slot="rebateAmount2" slot-scope="value, rows">
            <span>{{rows.cardOrderProfitSummaryRespVO.rebateAmount}}</span>
        </template>
				<template slot="profit2" slot-scope="value, rows">
            <span>{{rows.cardOrderProfitSummaryRespVO.profit}}</span>
        </template>
      </a-table>
			<div style="text-align:right;padding-top:20px;">
      		<a-pagination :current="pagination.pageNo" :total="pagination.total"  @change="changePagination" />
    	</div>
	  </div>
    </section>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents, Lifecycle } from 'vue-decorators'
import { DateSwitch } from '@/components/switch'
import moment from "moment";
import DateRange from "@/components/date-range/DateRange";
@Component({methods:{moment}})
@InjectComponents({
	DateSwitch,
	DateRange
})
export default class ChatRecord extends Vue {
	buttonloading = false;
	loading=false;
	valueTime=[];
	/** 表格数据 */		
	table = {
		data:[],
		columns: [
		{title: '会员账号',dataIndex: 'userName',scopedSlots: { customRender:"userName"}},
		{title: '直属上级',dataIndex: 'parentName'},
		{title: '真人汇总',
		children: [
			{ title: '有效投注人数/金额',scopedSlots: { customRender:"validBetAmount1"}},
			{ title: '会员返水',scopedSlots: { customRender:"rebateAmount1"}},
			{ title: '盈亏', scopedSlots: { customRender:"profit1"}}
	],
	},
			{title: '棋牌汇总',children: [
			{ title: '有效投注人数/金额', scopedSlots: { customRender:"validBetAmount2"}},
			{ title: '会员返水',scopedSlots: { customRender:"rebateAmount2"}},
			{ title: '盈亏',scopedSlots: { customRender:"profit2"}}]
		},
		{title: '总有效投注',dataIndex: 'validBetAmount'},
		{title: '总盈亏',dataIndex: 'profit'},
		],
		parentIds:[],
		parentJson:[]
	};
	pagination={ pageNo: 1, total:0 };
	params={ pageNo: 1, pageSize: 10, endTime: "", parentId:"", startTime: "", userName: ""};
	// 切换分页 
	changePagination(p) {
		this.pagination.pageNo = p;
		this._queryPageOrderReport();
	}
	changeTabTime(startDate, endDate){
		this.params.startTime=startDate;
		this.params.endTime=endDate;
		this.$refs.rg.setDateRangeValues(startDate, endDate);
	}
	/** 跳转到第三方 */
	async _jumpDetail(row){
		if(row==="back"){
			if(this.table.parentIds.length>2){
				this.params.userName="";
				this.params.parentId=this.table.parentJson[this.table.parentJson.length-2].userId;
				this.table.parentIds=this.table.parentIds.slice(0,this.table.parentIds.length-2);
				this.table.parentJson=this.table.parentJson.slice(0,this.table.parentJson.length-2);
				await this._queryPageOrderReport();
				return;
			}
			if(this.table.parentIds.length<=1){
				if(this.params.userName){
					this.params.parentId="";this.table.parentIds=[];this.table.parentJson=[];await this._queryPageOrderReport();
					return;
				}
				this.params.userName="";
				this.params.parentId=this.table.parentJson[this.table.parentJson.length-1].userId;
				await this._queryPageOrderReport();
				this.params.userName=this.table.parentJson[0].userName;
				return;
			}
			return;
		}
			this.params.userName="";this.params.parentId=row.userId;
			if(this.table.parentIds.indexOf(row.userId)===-1){this.table.parentIds.push(row.userId);this.table.parentJson.push(row);}
			await this._queryPageOrderReport();
	}
	onChange(start, end, datestring, type) {
    if (type === "start") {
      this.params.startTime = datestring
    } else {
      this.params.endTime = datestring
    }
		// this.params.startTime=moment(dateString[0]).format('YYYY-MM-DD')+' 00:00:00';
		// this.params.endTime=moment(dateString[1]).format('YYYY-MM-DD')+' 23:59:59';
	}

	_query(){
		this.params.parentId="";
		this._queryPageOrderReport();
	}
	/** 查询第三方盈亏 */
	async _queryPageOrderReport(){
		if(this.params.startTime.indexOf('Invalid')!==-1){ this.params.startTime=""; this.params.endTime="";return this.$message.error(`查询时间不能为空`) };
		if(this.params.startTime===""||this.params.endTime===""){return this.$message.error(`查询时间不能为空`) };
		this.loading=true;
		const res = await this.$service.fetch( "/lottery-api/thirdOrder/queryPageOrderReport", Object.assign(this.params,{}) );
		this.loading=false;
		if (res.code !== 1){
			this.table.data=[];
			this.pagination.total=0;
			this.$message.error(res.message);
			return;
		}
		this.table.data=res.data?.records;
		this.pagination.total=res.data?.totalCount;
	}
	@Lifecycle() created(){}
}
</script>

<style lang="scss" scoped>
.page-container {
	.report-order {
		height: 100%;
		overflow-y: auto;
	}
}
.report-order-text {
  margin: 15px 0;

  span {
    margin-right: 10px;
  }
}
</style>