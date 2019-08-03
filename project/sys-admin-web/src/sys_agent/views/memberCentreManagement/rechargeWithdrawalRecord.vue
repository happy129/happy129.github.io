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
						<DateRange title="交易时间"   ref="rg" @change="onChange"/>
					<!-- <a-range-picker :showTime="{defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]}" @change="onChange" format="YYYY-MM-DD HH:mm:ss"/> -->
          </a-form-item>
          <a-form-item label="交易类型">
            <a-select v-model="params.operateType">
              <a-select-option :value="0">全部</a-select-option>
              <a-select-option :value="1">充值</a-select-option>
              <a-select-option :value="2">提现</a-select-option>
            </a-select>
          </a-form-item>
					<a-form-item label="会员账号">
            <a-input v-model="params.userName"></a-input>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="_queryPageRechargeAndWithdrawRecord">查询</a-button>
          </a-form-item>
        </a-form>
      </div>
      <div class="mt15">
		  <a-table :rowKey="(r, i) => i" @change="changePagenation" :pagination="paginationParams" :columns="table.columns" :dataSource="table.data">
				<template slot="tradeType" slot-scope="record, text">
					{{record==1?'充值':record==2?'提现':'未知'}}
			</template>
      </a-table>
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
@InjectComponents({DateSwitch,DateRange })
export default class ChatRecord extends Vue {
	/** 表格数据 */		
	table = {
		data:[],
		columns :[
		{title: '会员账号',dataIndex: 'userName'},
		{title: '上级代理账号',dataIndex: 'parentUserName'},
		{title: '交易类别',dataIndex: 'tradeType',scopedSlots: { customRender: "tradeType" }},
		{title: '金额',dataIndex: 'tradeAmount'},
		{title: '交易时间',dataIndex: 'tradeTime'},
		]
	};
	paginationParams={ pageNo: 1, total:0,pageSize:10 };
	params={endTime:"",operateType:0,startTime:"",userName:""};
	// 切换分页 
	changePagenation(pagination) {
		this.paginationParams.pageNo = pagination.current;
		this._queryPageRechargeAndWithdrawRecord();
	}
	/** 时间菜单选择 */
	changeTabTime(startDate, endDate){
		this.params.startTime=startDate;
		this.params.endTime=endDate;
		this.$refs.rg.setDateRangeValues(startDate, endDate);
	}
	/** 时间查询 */
	onChange(start, end, datestring, type){
		if (type === "start") {
      this.params.startTime = datestring;
    } else {
      this.params.endTime = datestring;
    }
	}
	/* 充值提现记录列表查询 */
	async _queryPageRechargeAndWithdrawRecord(){
		if(this.params.startTime.indexOf('Invalid')!==-1){
				this.params.startTime="";
				this.params.endTime="";
		}
		const res = await this.$service.fetch( "/lottery-api/member/queryPageRechargeAndWithdrawRecord", Object.assign(this.params,this.paginationParams) );
		if (res.code !== 1){
			this.table.data=[];
			this.paginationParams.total=0;
			this.$message.error(res.message);
			return res.message;
		} 
		this.table.data=res.data.records;
		this.paginationParams.total=res.data.totalCount;
	}

	@Lifecycle() created(){
		// this._queryPageRechargeAndWithdrawRecord();
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