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
          <a-form-item label="类型">
            <a-select v-model="params.type" style="width:100px;">
              <a-select-option :value="0">全部</a-select-option>
              <a-select-option :value="2">人工汇款</a-select-option>
              <a-select-option :value="3">彩金派送</a-select-option>
              <a-select-option :value="4">返水派送</a-select-option>
              <a-select-option :value="5">其他</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="查询方式">
            <a-select v-model="params.operateType">
              <a-select-option :value="0">代理线查询</a-select-option>
              <a-select-option :value="1">单个会员查询</a-select-option>
            </a-select>
          </a-form-item>
					<a-form-item label="会员账号">
            <a-input v-model="params.userName"></a-input>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="_query">查询</a-button>
          </a-form-item>
        </a-form>
      </div>
      <div class="mt15">
		  <a-table :rowKey="(r, i) => i" :pagination="false" :columns="table.columns" :dataSource="table.data">
				<template slot="rechargeType" slot-scope="record, text">
					<!-- |2:人工汇款|3:彩金派送|4:返水派送|5:其它 -->
					{{record==2?'人工汇款':record==3?'彩金派送':record==4?'返水派送':record==5?'其它':record}}
			</template>
      </a-table>
				<div style="display:flex;justify-content:space-between;margin-top:10px;">
					<strong>人工汇款：{{table.statistics.manualDepositAmount||0}}&emsp;彩金派送：{{table.statistics.sendGiftAmount||0}}&emsp;返水派送：{{table.statistics.sendRebateAmount||0}}&emsp;其他：{{table.statistics.otherAmount||0}}</strong>
					<a-pagination :current="pagination.pageNo" :total="pagination.total" @change="changeTablePagenation"/>
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
@InjectComponents({DateSwitch,DateRange })
export default class ChatRecord extends Vue {
	/** 表格数据 */		
	table = {
		statistics:{},
		data:[],
		columns :[
		{title: '会员账号',dataIndex: 'userName'},
		{title: '上级代理账号',dataIndex: 'parentName'},
		{title: '交易类别',dataIndex: 'rechargeType',scopedSlots: { customRender: "rechargeType" }},
		{title: '金额',dataIndex: 'amount'},
		{title: '交易时间',dataIndex: 'createTime'},
		]
	};
	pagination={ pageNo: 1, total:0,pageSize:10 };
	params={endTime:"",operateType:0,type:0,startTime:"",userName:""};
	// 切换分页 
	changeTablePagenation(p) {
		this.pagination.pageNo = p;
		this._queryPageManualDeposit();
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
	_query(){
		this.pagination.pageNo = 1;
		this._queryPageManualDeposit();
	}
	/* 充值提现记录列表查询 */
	async _queryPageManualDeposit(){
		if(this.params.startTime.indexOf('Invalid')!==-1){ this.params.startTime=""; this.params.endTime=""; }
		const res = await this.$service.fetch( "/lottery-api/manualchange/queryPageManualDeposit", Object.assign(this.params,this.pagination) );
		if (res.code !== 1){
			this.table.data=[];
			this.pagination.total=0;
			this.table.statistics={};
			this.$message.error(res.message);
			return res.message;
		}
		this.table.statistics=res.data;
		this.table.data=this.table.statistics.pageRecords.records;
		this.pagination.total=this.table.statistics.pageRecords.totalCount;
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