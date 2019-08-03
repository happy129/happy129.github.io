<template>
  <!--报表 注单管理 -->
  <div class="page-container">
    <section class="report-order">
      <div class="mt15">
        <DateSwitch @changeTab="changeTabTime" />
      </div>
      <hr style="border-top:1px solid #eee;" />
      <div class="mt15">
        <a-form layout="inline">
          <!-- <date-range ref="rg" @change="changeDate" title='投注时间' /> -->
          <a-form-item>
            <DateRange title="投注时间" :showTime="true" :defaultDate="true" @current="currentTime" ref="rg" @change="onChange" />
            <!-- <a-range-picker :showTime="{defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]}" @change="onChange" format="YYYY-MM-DD HH:mm:ss"/> -->
          </a-form-item>
          <a-form-item label="彩票类型">
            <a-cascader :options="lotteryCategory" @change="changeLottery" placeholder="选择彩种类型" />
          </a-form-item>
          <a-form-item label="注单状态">
            <a-select v-model="params.orderStatus" style="width:100px;">
              <a-select-option :value="1">待开奖</a-select-option>
              <a-select-option :value="2">结算中</a-select-option>
              <a-select-option :value="3">未中奖</a-select-option>
              <a-select-option :value="4">已中奖</a-select-option>
              <a-select-option :value="-3">系统撤单</a-select-option>
              <a-select-option :value="-2">追停撤单</a-select-option>
              <a-select-option :value="0">撤单受理中</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="投注方式">
            <a-select v-model="params.orderType" style="width:100px;">
              <a-select-option :value="0">普通订单</a-select-option>
              <a-select-option :value="1">追号订单</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="注单来源">
            <a-select v-model="params.clientType" style="width:100px;">
              <a-select-option :value="0">全部</a-select-option>
              <a-select-option :value="1">H5</a-select-option>
              <a-select-option :value="2">andriod</a-select-option>
              <a-select-option :value="3">ios</a-select-option>
              <a-select-option :value="4">pc</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="*玩家账号">
            <a-input v-model="params.userName"></a-input>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="_queryPageBetOrder">查询</a-button>
          </a-form-item>
        </a-form>
      </div>
      <div class="mt15">
        <a-table :rowKey="(r, i) => i" @change="changeTablePagenation" :pagination="paginationParams" :columns="table.columns" :dataSource="table.data">
          <template slot="orderNoTitle"
            ><p>订单号</p>
            <p>投注方式</p></template
          >
          <template slot="orderNo" slot-scope="record, text">
            <p>{{ text.orderNo }}</p>
            <p>{{ text.orderTypeName }}</p>
          </template>
          <template slot="userNameTitle"
            ><p>会员账号</p>
            <p>来源</p></template
          >
          <template slot="userName" slot-scope="record, text">
            <p>{{ text.userName }}</p>
            <p>{{ text.clientType == 1 ? "H5" : text.clientType == 2 ? "andriod" : text.clientType == 3 ? "ios" : text.clientType == 4 ? "pc" : text.clientType }}</p>
          </template>
          <template slot="nickNameTitle"
            ><p>彩种</p>
            <p>期号</p></template
          >
          <template slot="nickName" slot-scope="record, text">
            <p>{{ text.lotteryName }}</p>
            <p>{{ text.issueNo }}</p>
          </template>
          <template slot="playNameTitle"
            ><p>玩法</p>
            <p>下注号码</p></template
          >
          <template slot="playName" slot-scope="record, text">
            <p>{{ text.playName }}</p>
            <p style="width:100px;overflow:hidden;" :title="text.betNumber">{{ text.betNumber }}</p>
          </template>
        </a-table>
      </div>
    </section>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents, Lifecycle } from 'vue-decorators'
import { TabSwitch, DateSwitch } from '@/components/switch'
import XCascader from './components/XCascader'
import moment from "moment";
import DateRange from "@/components/date-range/DateRange";
@Component({methods:{moment}})
@InjectComponents({ TabSwitch, DateSwitch, DateRange, XCascader })
export default class ChatRecord extends Vue {
	lotteryCategory=[];
	/** 表格数据 */		
	table ={
		data:[],
		columns : [
		{dataIndex: 'orderNo',scopedSlots:{customRender: "orderNo",title:"orderNoTitle"}},
		{dataIndex: 'userName',scopedSlots:{customRender: "userName",title:"userNameTitle"}},
		{dataIndex: 'nickName',scopedSlots:{customRender: "nickName",title:"nickNameTitle"} },
		{dataIndex: 'playName',scopedSlots:{customRender: "playName",title:"playNameTitle"}},
		{ title: '开奖号码', dataIndex: 'openNumber'},
		{ title: '下注金额', dataIndex: 'unitPrice'},
		{ title: '中奖金额', dataIndex: 'winAmount'},
		{ title: '盈亏', dataIndex: 'profit'},
		{ title: '状态', dataIndex: 'orderStatusName'},
		{ title: '下注时间', dataIndex: 'createTime'},
	]
	};
	paginationParams={pageNo:1,total:0};
	params={
		pageNo: 1,
		pageSize: 10,
		queryTimeEnd: "",
		queryTimeStart: "",
		lotteryIds:"",//彩票类型
		orderStatus:1,//注单状态
		orderType:0,//投注方式
		clientType:0,//注单来源
		userName:""
	};
	
	currentTime(startTime, endTime) {
    this.params.queryTimeStart = startTime;
    this.params.queryTimeEnd = endTime;
   }
              
	// 切换分页 
	changeTablePagenation(pagination) {
		this.paginationParams.pageNo = pagination.current;
		this._queryPageBetOrder();
	}
	/** 时间查询 */
	onChange(start, end, datestring, type){
		if (type === "start") {
      this.params.queryTimeStart = datestring;
    } else {
      this.params.queryTimeEnd = datestring;
    }
	}
	/** 快捷时间切换 */
	changeTabTime(startDate, endDate){
		this.params.queryTimeStart=startDate;
		this.params.queryTimeEnd=endDate;
		this.$refs.rg.setDateRangeValues(startDate, endDate);
	}
	// 获取彩票列表
  async changeLottery(valueArr) {
		this.params.lotteryIds=valueArr.join(',');
	}

	/** 查询注单记录 */
	async _queryPageBetOrder(){
		if(!this.params.userName) return this.$message.error(`玩家账号必须填写`);
		if(this.params.queryTimeStart.indexOf('Invalid')!==-1){this.params.queryTimeStart=""; this.params.queryTimeEnd="";}
		const res = await this.$service.fetch( "/lottery-api/member/queryPageOrderReport", Object.assign(this.params,this.paginationParams) );
		if (res.code !== 1){
			this.table.data=[];
			this.paginationParams.total=0;
			this.$message.error(res.message);
			return;
		};
		this.table.data=res.data?.records;
		this.paginationParams.total=res.data?.totalCount;
	}

	/** 获取彩票类型 */
	async _queryFrontCategory(){
		const res = await this.$service.fetch( "/config-api/lotteryHall/queryFrontCategory");
		if (res.code !== 1) return res.message && this.$message.error(res.message);
		this.lotteryCategory=res.data.map(item=>{
			item.value=item.id;
			item.label=item.categoryName;
			item.children=item.lotteryList.map(val=>{val.value = val.id;val.label = val.lotteryName;return val;});
			return item;
		});
	}

	@Lifecycle() created(){
		this._queryFrontCategory()
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