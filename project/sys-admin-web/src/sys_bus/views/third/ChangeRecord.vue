<template>
  <div class="page-container">
    <XTabs
      @tabClick="tabClick"
      :isAll="false"
      ref="xtabs"
      @getAllGs="getAllGs"
    />
    <div class="mt15">
      <a-form layout="inline" :form="form">
        <a-form-item label="转账时间">
          <a-range-picker
            :showTime="{
              defaultValue: [
                moment('00:00:00', 'HH:mm:ss'),
                moment('23:59:59', 'HH:mm:ss')
              ]
            }"
            allowClear
            @change="onChange"
            format="YYYY-MM-DD HH:mm:ss"
          />
        </a-form-item>
        <!-- <a-form-item label="商户平台" style="margin-left:10px;margin-right:20px;">
          <a-select style="width: 120px" v-model="params.platformId" placeholder="请选择" >
            <a-select-option v-for="(v, i) of merchantPlatformList" :value="v.id" :key="i" >{{v.platformName}}</a-select-option>
          </a-select>
        </a-form-item> -->
        <a-form-item label="会员账号">
          <a-input v-model.trim="params.userName" />
        </a-form-item>
        <a-form-item label="订单号" style="margin-left:20px;margin-right:20px;">
          <a-input v-model="params.transactionNo" />
        </a-form-item>
        <a-form-item label="转账状态" class="status-select">
          <a-select v-model="params.status">
            <a-select-option :value="''">全部</a-select-option>
            <a-select-option
              v-for="(v, i) of changeStatusList"
              :value="v.value"
              :key="i"
              >{{ v.name }}</a-select-option
            >
          </a-select>
        </a-form-item>
        <a-form-item style="margin-left:10px;">
          <a-button type="primary" ref="btnSave" @click="_query">查询</a-button>
        </a-form-item>
      </a-form>
    </div>
    <div class="mt15">
      <a-table
        :columns="table.columns"
        :dataSource="tableData"
        :pagination="false"
        :rowKey="e => e.id"
        class="mytable"
        bordered
      >
        <template slot="status" slot-scope="r, t">{{
          dictionary.thirdTransferStatus.get(t.status)
        }}</template>
        <template slot="codeAndId" slot-scope="r, t">{{
          t.thirdGameUserName
        }}</template>
        <template slot="transferType" slot-scope="r, t">{{
          r == -1
            ? `AK钱包→${t.thirdGameName}`
            : r == 1
            ? `AK钱包←${t.thirdGameName}`
            : ""
        }}</template>
      </a-table>
      <div style="display:flex;justify-content:space-between;margin-top:10px;">
        <strong
          >总转入金额：{{
            totalTranferData.totalTranferInAmount
          }}
          总转出金额：{{ totalTranferData.totalTranferOutAmount }}</strong
        >
        <a-pagination
          :current="pagination.pageNo"
          :total="pagination.total"
          @change="changePagination"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { Component, InjectComponents, Computed, Lifecycle, Watch } from "vue-decorators";
import { TabSwitch } from "@/components/switch";
import * as Api from "@api/admin";
import moment from "moment";
import XTabs from "./XTabs"
const dictionary = "walletType,thirdTransferStatus";

@Component({ dictionary: 'thirdTransferStatus',methods: { moment }  })
@InjectComponents({
	TabSwitch,
	XTabs
})
export default class ChangeRecord extends Vue {
  @Computed() changeStatusList() {
   return this.dictionary.thirdTransferStatus.reduce((ca, cu) => { ca.push({ name: cu.name, value: cu.value }); return ca; }, []);
  }
  totalTranferData={};
  merchantPlatformList = [];
  pagination = {total:0,pageNo:1,pageSize:10 };
  table = {
    columns: [
      { title: "商户名称", dataIndex: "platformName" },
      { title: "会员账号", dataIndex: "userName" },
      { title: "游戏账号", scopedSlots: { customRender: "codeAndId" } },
      { title: "转账过程", dataIndex: "transferType", scopedSlots: { customRender: "transferType" } },
      { title: "转账状态", dataIndex: "status", scopedSlots: { customRender: "status" } },
      { title: "转账时间", dataIndex: "createTime" },
      { title: "订单号", dataIndex: "transactionNo" },
      { title: "转账前余额", dataIndex: "walletPreBalance" },
      { title: "转账金额", dataIndex: "transferAmount" },
      { title: "转账后余额", dataIndex: "walletPostBalance" },
			{ title: "备注", dataIndex: "remark" },
    ]
	};
	tableData = [];
	params={
		startTime:"",
		endTime: "",
		thirdGameCode:"",
		platformId:"",
		status:"",
		thirdTransactionNo:"",
		transactionNo:"",
		userName:""
	}
	/** 自动选中二级分类 */
	getAllGs(){
		this.$refs.xtabs.changeTab(this.$refs.xtabs.allGs[0].id);
	}
	tabClick(tab){
		this.params.thirdGameCode="";
		this.params.thirdGameCode=tab.subTab?.thirdGameCode;
		if(!tab.subTab?.thirdGameCode||this.$constants.ThireGames.THIRE_GAME_ALL.split('|').indexOf(tab.subTab.thirdGameCode)==-1) return this.$message.error(`暂不支持${tab.subTab?.thirdGameCode}游戏;`);
		this._queryPageThirdTransferRecord();
	}

	onChange(date, dateString){ 
		this.params.startTime= dateString[0];//moment(dateString[0]).format('YYYY-MM-DD')+' 00:00:00';
		this.params.endTime= dateString[1];//moment(dateString[1]).format('YYYY-MM-DD')+' 23:59:59';
	}

  async changePagination(p, s) {
    this.pagination.pageNo = p;
    this.pageSize = s;
    await this._queryPageThirdTransferRecord();
  }
	
	_query(){
		this.pagination.pageNo=1;
    this._queryPageThirdTransferRecord();
    this._queryTransferRecordSummary();
	}

	/** 查询分页转账信息 */
  async _queryPageThirdTransferRecord() {
		/** 清空时间查询时会有bug,兼容处理 */
		if(this.params.startTime.indexOf('Invalid')!==-1){
				this.params.startTime="";
				this.params.endTime="";
		}
		this.params.platformId=this.platformId;
		let res = await this.$service.fetch("/lottery-admin-api/thirdTransferRecord/queryPageThirdTransferRecord",Object.assign(this.params,this.pagination));
		if (1!==res.code) return res.message && this.$message.error(res.message);
		this.tableData = res.data.records;
		this.pagination.total = res.data.totalCount;
	}

  /** 获取统计信息 */
  async _queryTransferRecordSummary() {
		let res = await this.$service.fetch("/lottery-admin-api/thirdTransferRecord/queryTransferRecordSummary",Object.assign(this.params,this.pagination));
    if (1!==res.code) return res.message && this.$message.error(res.message);
    this.totalTranferData=res.data;
	}

  @Lifecycle() async created() {
    this.form = this.$form.createForm(this);
    this._queryTransferRecordSummary();
	}
}
</script>
<style lang="scss" scoped>
@import "@views/admin/Pop.scss";
.page-container /deep/ {
  position: relative;
  height: 100%;
  .ant-btn-primary {
    margin-right: 5px;
  }
  .tab-switch-list.tab-sty1 {
    float: left;
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
  .status-select /deep/ {
    .ant-select-selection {
      width: 100px;
    }
  }

  .ant-tabs-nav-wrap {
    height: 26px;
    border-bottom: solid 2px #009688;
    .ant-tabs-nav .ant-tabs-tab-active {
      color: white;
      background-color: #009688;
    }
    .ant-tabs-ink-bar.ant-tabs-ink-bar-animated {
      display: none !important;
    }
    .ant-tabs-nav .ant-tabs-tab {
      padding: 3px 15px;
    }
  }
}
</style>