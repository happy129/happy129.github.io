<template>
  <!--报表 注单管理 -->
  <div class="page-container">
    <section class="report-order">
      <div class="mt15">
       <TabSwitch :columns="TabColumns" :defaultSelected="TabSelected" @changeTabs="changeTabs" />
      </div>
			<hr style="border-top:1px solid #eee;"/>
      <div class="mt15">
        <a-form layout="inline">
						<a-form-item label="交易时间">
            <a-range-picker :showTime="{defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]}" @change="onChange" format="YYYY-MM-DD HH:mm:ss"/>
          </a-form-item>
					<a-form-item label="会员账号">
            <a-input v-model.trim="params.userName"></a-input>
          </a-form-item>
					<a-form-item label="局号" v-if="params.thirdGameCode=='TH'||params.thirdGameCode=='KY'">
            <a-input v-model.trim="params.orderNo"></a-input>
          </a-form-item>
					<a-form-item label="订单号" v-if="params.thirdGameCode=='AG'">
            <a-input v-model.trim="params.orderNo"></a-input>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="_queryPageThirdOrder">查询</a-button>
          </a-form-item>
        </a-form>
      </div>
      <div class="mt15">
		  <a-table :rowKey="(r, i) => i" :pagination="false" :columns="table[table['currentColumns']]" :dataSource="table.data">
				<template slot="status" slot-scope="r, text">
					<span>{{r==1?`已结算`:r==0?`未结算`:r==8?`取消订单`:r==-9?`取消`:r==2?`下注中`:r==4?`撤单`:r}}</span>
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
import TabSwitch  from '../memberCentreManagement/components/TabSwitch'
import XCascader from '../memberCentreManagement/components/XCascader'
import DateRange from "@/components/date-range/DateRange"
import moment from "moment";
import { error } from 'util';
import axios from "axios";
@Component({methods:{moment}})
@InjectComponents({
	TabSwitch,
	DateSwitch,
	DateRange,
	XCascader
})
export default class ChatRecord extends Vue {
	TabColumns = [];
	TabSelected=0;
	/** 表格数据 */		
	table ={
		currentColumns:"columns",
		data:[],
		columns: [
		{title: '会员账号',dataIndex: 'userName'},
		{title: '游戏账号',dataIndex: 'playerName'},
		{title: '订单号',dataIndex: 'orderId'},
		{title: '局号',dataIndex: 'gameCode'},
		{title: '平台类型',dataIndex: 'gamePlatformType'},
		{title: '游戏类型',dataIndex: 'gameCategory'},
		{title: '桌号',dataIndex: 'tableCode'},
		{title: '下注玩法',dataIndex: 'playTypeName'},
		{title: '开奖结果',dataIndex: 'drawResult'},
		{title: '下注金额',dataIndex: 'totalBetAmount'},
		{title: '有效投注',dataIndex: 'validBetAmount'},
		{title: '派奖金额',dataIndex: 'bonus'},
		{title: '会员盈亏',dataIndex: 'profit'},
		{title: '订单状态',dataIndex: 'status',scopedSlots: { customRender: "status" }},
		{title: '投注时间',dataIndex: 'betTime'},
		{title: '投注IP',dataIndex: 'clientIp'},
	],
	thkyColumns: [
		{title: '会员账号',dataIndex: 'userName'},
		{title: '游戏账号',dataIndex: 'playerName'},
		{title: '局号',dataIndex: 'orderId'},
		{title: '游戏类型',dataIndex: 'kindName'},
		{title: '房间名称',dataIndex: 'roomName'},
		{title: '玩家数量',dataIndex: 'playerCount'},
		{title: '桌子号',dataIndex: 'tableId'},
		{title: '椅子号',dataIndex: 'chairId'},
		{title: '下注金额',dataIndex: 'totalBetAmount'},
		{title: '有效投注',dataIndex: 'validBetAmount'},
		{title: '盈利',dataIndex: 'profit',scopedSlots: { customRender: "profit"}},
		{title: '抽水',dataIndex: 'revenue'},
		{title: '游戏开始时间',dataIndex: 'gameStartTime'},
		{title: '游戏结束时间',dataIndex: 'gameEndTime'},
	]
	}
	pagination={pageNo: 1, total:0 };
	params={ pageNo: 1, pageSize: 10,orderNo:"",userName:"",thirdGameCode:"", startTime:"", endTime: ""};

	// 切换分页 
	changePagination(p) {
		this.pagination.pageNo = p;
		this._queryPageThirdOrder();
	}
	changeTabTime(startDate, endDate){
		this.params.startTime=startDate;this.params.endTime=endDate;
	}

	async changeTabs(obj,i) {
		this.TabSelected=i;this.pagination.pageNo=1;this.params.thirdGameCode=obj.thirdGameCode;
		this._queryPageThirdOrder();
	}
	
	onChange(startTime, dateString ) {
		this.params.startTime=moment(dateString[0]).format('YYYY-MM-DD')+' 00:00:00';
		this.params.endTime=moment(dateString[1]).format('YYYY-MM-DD')+' 23:59:59';
	}
	
	changeDate(startTime, endTime) {
		this.params.startTime = startTime;this.params.endTime = endTime;
	}

	/** 获取注单记录 */
	async _queryPageThirdOrder(){
		if(this.params.startTime.indexOf('Invalid')!==-1){ this.params.startTime=""; this.params.endTime=""; }
		let res;
		if(this.params.thirdGameCode==="AG"){
			res = await this.$service.fetch("/lottery-api/thirdOrder/queryPageThirdAgOrder", Object.assign(this.params,this.pagination));
		}else{
			res = await this.$service.fetch("/lottery-api/thirdOrder/queryPageThirdOrder", Object.assign(this.params,this.pagination));
		}
		if (res.code !== 1){
			this.table.data=[];this.pagination.total=0;this.$message.error(res.message);
			return;
		}
		this.table.data=res.data?.records;this.pagination.total=res.data?.totalCount;
		if(/TH|KY/g.test(this.params.thirdGameCode))return this.table.currentColumns="thkyColumns";
		this.table.currentColumns="columns";
	}

	/** 获取tab数据 */
		async _queryAllLotteryType(obj){
		const res = await this.$service.fetch( "/lottery-api/member/queryAllLotteryType");
		if (res.code !== 1) return res.message && this.$message.error(res.message);
		this.TabColumns=res.data.map(item=>{
			return {thirdGameName:item.thirdGameName,thirdGameCode:item.thirdGameCode,name:item.thirdGameName}
		})
		this.params.thirdGameCode=res.data[0].thirdGameCode;
	}
	@Lifecycle() created(){
		this._queryAllLotteryType();
	}
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