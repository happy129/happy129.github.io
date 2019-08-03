<template>
  <div class="page-container">
    <XTabs @tabClick="tabClick" :isAll="false" ref="xtabs" @getAllGs="getAllGs" />
    <div class="mt15">
      <a-form layout="inline">
        <a-form-item label="商户平台" style="margin:0px 10px;">
          <a-select style="width: 120px" v-model="params.public.platformId" placeholder="请选择">
            <a-select-option v-for="(v, i) of merchantPlatformList" :value="v.id" :key="i">{{ v.platformName }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="投注时间">
          <a-range-picker :showTime="{ defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')] }" @change="onChange" format="YYYY-MM-DD HH:mm:ss" />
        </a-form-item>
        <a-form-item label="会员账号" style="margin:0px 10px;">
          <a-input placeholder="会员账号" v-model="params.public.userName" />
        </a-form-item>
        <div style="display:inline-block;" v-if="!['KY', 'TH'].includes(params.current)">
          <a-form-item label="订单号" style="margin:0px 10px;">
            <a-input placeholder="订单号" v-model="params.public.orderId" />
          </a-form-item>
          <a-form-item label="局号">
            <a-input placeholder="局号" type="text" v-model="params.public.gameCode" />
          </a-form-item>
        </div>

        <div style="display:inline-block;" v-if="['KY', 'TH'].includes(params.current)">
          <a-form-item label="局号" style="margin:0px 10px;">
            <a-input placeholder="局号" type="text" v-model="params.public.gameId" />
          </a-form-item>
          <a-form-item label="桌子号" style="margin:0px 10px;">
            <a-input placeholder="桌子号" type="number" v-model="params.public.tableId" />
          </a-form-item>
          <a-form-item label="椅子号">
            <a-input placeholder="椅子号" type="number" v-model="params.public.chairId" />
          </a-form-item>
        </div>

        <a-form-item>
          <a-button type="primary" @click="_query" ref="btnSave" style="margin-left:10px;">查询</a-button>
        </a-form-item>
      </a-form>
    </div>
    <div class="mt15">
      <a-table :columns="table[params.current]" :dataSource="table.tableData" :pagination="false" :rowKey="e => e.id" class="mytable" bordered>
        <span slot="oderStatus" slot-scope="r, text">{{ dictionary.agOrderStatus.get(text.status + "") }}</span>
      </a-table>
      <div style="display:flex;justify-content:space-between;margin-top:10px;">
        <strong>总下注金额：{{ totalTranferData.totalBetAmount }} 总派彩金额：{{ totalTranferData.totalBonus }} 总有效投注：{{ totalTranferData.totalValidBetAmount }}</strong>
        <a-pagination :current="pagination.pageNo" :total="pagination.total" @change="changePagination" />
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { Component, InjectComponents, Filter, Lifecycle, Watch } from "vue-decorators";
import  XTabs  from "./components/XTabs";
import * as Api from "@api/admin";
import moment from "moment"
const dictionary = "agOrderStatus";
@Component({ dictionary,methods: { moment } })
@InjectComponents({XTabs})
export default class BetRecord extends Vue {
  merchantPlatformList = [];
  totalTranferData={};
	pagination = { total: 0, pageNo: 1,pageSize: 10};
	objApi={
			AG:"/lottery-admin-api/thirdAgOrder/queryPageThirdAgOrder",
			KY:"/lottery-admin-api/thirdKyOrder/queryPageThirdKyOrder",
			TH:"/lottery-admin-api/thirdThOrder/queryPageThirdThOrder",
    };
  sumApi={
			AG:"/lottery-admin-api/thirdAgOrder/queryThirdAgOrderSummary",
			KY:"/lottery-admin-api/thirdKyOrder/queryThirdKyOrderSummary",
			TH:"/lottery-admin-api/thirdThOrder/queryThirdThOrderSummary",
	};
	params={
		current:"",
		public:{
			platformId:"",
			startTime: "",
			endTime: "",
			userName:"",
			gameCode:"",
			orderId:"",
			gameId:"",
			tableId:"",
			chairId:""
		},
		AG:{
			startTime: "",
			endTime: "",
			gameCode: "",
			orderId: "",
			pageNo: 1,
			pageSize: 10,
			platformId: "",
			userName: ""
	},
		KY:{
			startTime: "",
			endTime: "",
			chairId: 0,
			gameId: "",
			pageNo: 1,
			pageSize: 10,
			platformId: "",
			tableId: 0,
			userName: ""
		},
		TH:{
			startTime: "",
			endTime: "",
			chairId: 0,
			gameId: "",
			pageNo: 1,
			pageSize: 10,
			platformId: "",
			tableId: 0,
			userName: ""
		}
	};
  // 表格
  table = {
		tableData:[],
    AG: [
      { title: "商户平台", dataIndex: "platformName" },
      { title: "会员账号", dataIndex: "userName" },
      { title: "游戏账号", dataIndex: "playerName" },
      { title: "订单号", dataIndex: "orderId" },
      { title: "局号", dataIndex: "gameCode" },
      { title: "平台类型", dataIndex: "gamePlatformType" },
      { title: "游戏类型", dataIndex: "gameTypeName" },
      { title: "桌号", dataIndex: "tableCode" },
      { title: "下注玩法", dataIndex: "playTypeName" },
      { title: "开奖结果", dataIndex: "drawResult" },
      { title: "下注金额", dataIndex: "totalBetAmount" },
      { title: "有效投注", dataIndex: "validBetAmount" },
      { title: "派奖金额", dataIndex: "bonus" },
      { title: "会员盈亏", dataIndex: "profit" },
      { title: "订单状态", scopedSlots: {customRender: "oderStatus"}},
      { title: "投注时间", dataIndex: "betTime" },
      { title: "投注IP", dataIndex: "clientIp" }
    ],
    KY: [
      { title: "商户平台", dataIndex: "platformName" },
      { title: "会员账号", dataIndex: "userName" },
      { title: "游戏账号", dataIndex: "accounts" },
      { title: "局号", dataIndex: "gameId" },
      { title: "游戏类型", dataIndex: "kindName" },
      { title: "游戏房间", dataIndex: "roomName" },
      { title: "玩家数量", dataIndex: "playerCount" },
      { title: "桌子号", dataIndex: "tableId" },
      { title: "椅子号", dataIndex: "chairId" },
      { title: "下注金额", dataIndex: "totalBetAmount" },
      { title: "有效投注", dataIndex: "validBetAmount" },
      { title: "盈利", dataIndex: "profit" },
      { title: "抽水", dataIndex: "revenue" },
      { title: "游戏开始时间", dataIndex: "gameStartTime" },
      { title: "游戏结束时间", dataIndex: "gameEndTime" }
		],
		TH: [
      { title: "商户平台", dataIndex: "platformName" },
      { title: "会员账号", dataIndex: "userName" },
      { title: "游戏账号", dataIndex: "accounts" },
      { title: "局号", dataIndex: "gameId" },
      { title: "游戏类型", dataIndex: "kindName" },
      { title: "游戏房间", dataIndex: "roomName" },
      { title: "玩家数量", dataIndex: "playerCount" },
      { title: "桌子号", dataIndex: "tableId" },
      { title: "椅子号", dataIndex: "chairId" },
      { title: "下注金额", dataIndex: "totalBetAmount" },
      { title: "有效投注", dataIndex: "validBetAmount" },
      { title: "盈利", dataIndex: "profit" },
      { title: "抽水", dataIndex: "revenue" },
      { title: "游戏开始时间", dataIndex: "gameStartTime" },
      { title: "游戏结束时间", dataIndex: "gameEndTime" }
    ]
  };
	onChange(date, dateString){
		this.params.public.startTime=dateString[0];//moment(dateString[0]).format('YYYY-MM-DD')+' 00:00:00';
		this.params.public.endTime=dateString[1];//moment(dateString[1]).format('YYYY-MM-DD')+' 23:59:59';
	}
	/** 自动选中二级分类 */
	async getAllGs(){
		await this._getMerchantPlatformList();
		this.$refs.xtabs.changeTab(this.$refs.xtabs.allGs[0].id);
	}
	tabClick(tab){
		if(!tab.subTab.thirdGameCode||this.$constants.ThireGames.THIRE_GAME_ALL.split('|').indexOf(tab.subTab.thirdGameCode)==-1) return this.$message.error(`暂不支持${tab.subTab?.thirdGameCode}游戏;`);
		this.params.current=tab.subTab.thirdGameCode;
		this.params[this.params.current].platformId=this.params.public.platformId;
		this.pagination.pageNo=1;
		this._queryPageThirdAgKyThOrder(this.params[this.params.current],this.objApi[this.params.current]);
	}
	/** 获取所有商户平台 */
	async _getMerchantPlatformList(){
    // const res = await this.$service.fetch('/config-admin-api/platform/queryAllPlatform', {});
    // if (1 != res.code) return;
		// this.merchantPlatformList = res.data||[];
		// this.params.public.platformId=this.merchantPlatformList[0].id;
    let res = await Api.queryAllByList();
    if (res?.data?.body?.code !== 1) return;
    this.merchantPlatformList = res?.data?.body?.data;
    this.params.public.platformId=this.merchantPlatformList[0].id;
	}
	/** 翻页 */
  async changePagination(p, s) {
    this.pagination.pageNo = p;
		this.pagination.pageSize = s;
    this._queryPageThirdAgKyThOrder(this.params[this.params.current],this.objApi[this.params.current]);
    this._queryThAgKyirdKyOrderSummary(this.params[this.params.current],this.sumApi[this.params.current]);
	}
	/** 查询AG 开元 天合 */
  async _queryPageThirdAgKyThOrder(value,url) {
		let res = await this.$service.fetch(url,Object.assign(value,this.pagination));
		if (1!==res.code) return res.message && this.$message.error(res.message);
		this.table.tableData = res.data.records;
		this.pagination.total = res.data.totalCount;
  }
  /** ag 开元 天合 统计 */
  async _queryThAgKyirdKyOrderSummary(value,url) {
		let res = await this.$service.fetch(url,Object.assign(value,this.pagination));
		if (1!==res.code) return res.message && this.$message.error(res.message);
    this.totalTranferData=res.data;
	}
	/** 根据查询条件查询 */
  async _query() {
		if(this.params.public.startTime.indexOf('Invalid')!==-1){
				this.params.public.startTime="";
				this.params.public.endTime="";
		}
		this.pagination.pageNo = 1;
    this._queryPageThirdAgKyThOrder(Object.assign(this.params[this.params.current],this.params.public),this.objApi[this.params.current]);
    this._queryThAgKyirdKyOrderSummary(Object.assign(this.params[this.params.current],this.params.public),this.sumApi[this.params.current]);
	}
}
</script>
<style lang="scss" scoped>
@import "@views/admin/Pop.scss";
.page-container /deep/ {
  .ant-btn-primary {
    margin-right: 5px;
  }
  .tab-switch-list.tab-sty1 {
    padding-top: 10px;
    margin-right: 30px;
    li {
      height: 25px;
      line-height: 25px;
      button {
        height: 100%;
        width: 90px;
        padding: 0px;
      }
    }
  }
  .ant-input:not(.ant-calendar-picker-input) {
    width: 130px;
  }
  .mt15 {
    margin-top: 21px;
  }
  .ant-table-thead {
    th {
      padding: 16px 2px;
    }
  }
  .status-select /deep/ {
    .ant-select-selection {
      width: 100px;
    }
  }
}
</style>