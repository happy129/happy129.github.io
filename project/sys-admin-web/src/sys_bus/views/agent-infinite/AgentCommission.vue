<template>
  <div class="crown-wrapper">

    <div class="game-select">
        <ul class="game-select-ul">
          <li><a :class="{active: init.thirdPlatformCode == ''}" href="javascript:;" @click="init.thirdPlatformCode='';getList(true)">彩票</a></li>
          <li v-for="(item, index) in dsstore.thirdGames.records" :key="index">
            <a :class="{active: init.thirdPlatformCode == item.thirdGameCode}" href="javascript:;"  @click="init.thirdPlatformCode=item.thirdGameCode;getList(true)">{{item.thirdGameName}}</a>
          </li>
        </ul>
    </div>  

    <div class="line-code-form mt10">
      <a-form layout="inline" :form="vform" @submit.prevent="getList(true)">
        <a-form-item class="picker-area">
          <DateRange @change="changeDate"/>
        </a-form-item>
        <a-form-item label="会员账号">
          <a-input v-decorator="['userName']"/>
        </a-form-item>
        <a-form-item>
          <a-button type="primary"  :loading="init.loading" html-type="submit">查询</a-button>
        </a-form-item>
      </a-form>
    </div>

    <a-table class="mytable mt10" bordered :loading="init.loading" :columns="table.columns" :rowKey="(e, i) => i" :dataSource="table.dataSource" :pagination="table.pagination" @change="changePagination"> 
      <template slot="agentCommission" slot-scope="text, record">
        <a href="javascript:;" class="g-blue bold" @click.prevent="showAgentDetail(record)">{{record.agentBetAmount}}/{{record.receivableAgentCommission}}</a>
      </template>
      <template slot="directCommission" slot-scope="text, record">
        <a href="javascript:;" class="g-blue bold" @click.prevent="showDirectDetail(record)">{{record.directBetAmount}}/{{record.receivableDirectCommission}}</a>
      </template>
    </a-table>

    <a-modal title="代理业绩/佣金" v-model="init.showModal" :width="640"  :footer="null" :destroyOnClose="true" :maskClosable="false">
       <a-table size="small" bordered :dataSource="table.dataSource1" :rowKey="(e,i) => i" :pagination="table.pagination1" :columns="table.columns1" @change="changeTablePagination1"></a-table>
    </a-modal>

    <a-modal title="直推业绩/佣金" v-model="init.showModal2" :width="640"  :footer="null" :destroyOnClose="true" :maskClosable="false">
       <a-table size="small" bordered :dataSource="table.dataSource2" :rowKey="(e,i) => i" :pagination="table.pagination2" :columns="table.columns2" @change="changeTablePagination2"></a-table>
    </a-modal>

  </div>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, Watch } from "vue-decorators";
import DateRange from "@/components/date-range/DateRange";
import { TabSwitch } from "@/components/switch"


const dsstore = {
   thirdGames: { url: '/config-admin-api/thirdGameQuota/queryPagePlatformThirdGameConfig', params: { pageNo: 1, pageSize: 100} },
}

@Component({ formOptions: "id", dsstore })
@InjectComponents({ DateRange, TabSwitch })
export default class AgentCrown extends Vue {
  table = {
    key: 1,
    columns: [
      { title: "日期", dataIndex: "summaryDay" },
      { title: "会员账号", dataIndex: "userName" },
      { title: "自身佣金等级", dataIndex: "betAmountLevel"},
      { title: "返佣比例", dataIndex: "commissionRate" },
      { title: "总业绩", dataIndex: "betAmount" },
      { title: "代理业绩 / 佣金", scopedSlots: { customRender: 'agentCommission' }},
      { title: "直推业绩 / 佣金",  scopedSlots: { customRender: 'directCommission' }},
      { title: "总佣金", dataIndex: "commission"}
    ],

    columns1: [
      { title: "会员账号", dataIndex: "userName" },
      { title: "佣金等级", dataIndex: "betAmountLevel" },
      { title: "返佣比例", dataIndex: "commissionRate" },
      { title: "代理业绩", dataIndex: "agentBetAmount" },
      { title: "代理贡献佣金", dataIndex: "contributiveAgentCommission" }
    ],

    columns2: [
      { title: "会员账号", dataIndex: "userName" },
      { title: "有效打码量", dataIndex: "betAmount" },
      { title: "贡献佣金", dataIndex: "contributiveDirectCommission" }
    ],
    dataSource: [],
    dataSource1: [],
    dataSource2: [],

    pagination: {total: 0, current: 1},
    pagination1: {total: 0, current: 1},
    pagination2: {total: 0, current: 1}
  };

  init = {
    loading: false,
    showModal: false,
    showModal2: false,
    thirdPlatformCode: "",
    query: { pageNo: 1, pageSize: 10,  startTime: "", endTime: ""},
    agentParam: { pageNo: 1, pageSize: 10, parentId: "", summaryDay: "" },
    directAgentParam: { pageNo: 1, pageSize: 10, parentId: "", summaryDay: "" }
  };

  @Lifecycle mounted() {
    this.getList();
  }

  @Watch('init.showModal', { immidiate: true}) closeModal(news) {
    if (news === false) {
      this.init.agentParam.pageNo = 1;
      this.table.pagination1.total = 0
      this.table.pagination1.current = 1;
    }
  }

  @Watch('init.showModal2', { immidiate: true}) closeModal2(news) {
    if (news === false) {
      this.init.directAgentParam.pageNo = 1;
      this.table.pagination2.current = 1;
      this.table.pagination2.total = 0;
    }
  }

  // 代理业绩、佣金查询
  async showAgentDetail(record) {
    this.init.showModal = true;
    this.init.agentParam.parentId = record.id;
    this.init.agentParam.summaryDay = record.summaryDay;
    this.init.agentParam.thirdPlatformCode = this.init.thirdPlatformCode;
    this.getAgentlist();
  }

  // 直推业绩、佣金
  async showDirectDetail(record) {
    this.init.showModal2 = true;
    this.init.directAgentParam.parentId = record.id;
    this.init.directAgentParam.summaryDay = record.summaryDay;
    this.init.directAgentParam.thirdPlatformCode = this.init.thirdPlatformCode;
    this.getDirectList();
  }

  changeTablePagination2(pagination) {
    this.table.pagination2.current = pagination.current;
    this.init.directAgentParam.pageNo = pagination.current;
    this.getDirectList();
  }

  async getDirectList() {
    const res = await this.$service.fetch("/lottery-admin-api/commissionSummary/queryPageDirectCommissionSummary", this.init.directAgentParam);
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.code == 1 && res.data?.records instanceof Array) {
      this.table.dataSource2 = res.data.records;
      this.table.pagination2.total = res.data.totalCount;
    } else {
      this.table.dataSource2 = [];
      this.table.pagination2.total = 0;
    }
  }


  changeTablePagination1(pagination) {
    this.table.pagination1.current = pagination.current;
    this.init.agentParam.pageNo = pagination.current;
    this.getAgentlist();
  }

  async getAgentlist() {
    const res = await this.$service.fetch("/lottery-admin-api/commissionSummary/queryPageAgentCommissionSummary", this.init.agentParam);
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.code == 1 && res.data?.records instanceof Array) {
      this.table.dataSource1 = res.data.records;
      this.table.pagination1.total = res.data.totalCount;
    } else {
      this.table.dataSource1 = [];
      this.table.pagination1.total = 0;
    }
  }

  changePagination(pagination) {
    this.table.pagination.current = pagination.current;
    this.init.query.pageNo = pagination.current;
    this.getList();
  }

  resetPagination() {
    this.table.key = Math.random();
    this.table.pagination.current = 1;
    this.init.query.pageNo = 1;
  }

  changeDate(startTime, endTime, datestring, type) {
    if (type === "start") {
      this.init.query.startTime = datestring
    } else {
      this.init.query.endTime = datestring
    }
  }

  async getList(refresh) {
    if (refresh) this.resetPagination(); 
    const form = await this.vform.validate();
    // 加入平台code 
    form.values.thirdPlatformCode = this.init.thirdPlatformCode;

    const values = this.$trimValues(form.values);
    const params = Object.assign(this.init.query, values);

    this.init.loading = true;
    const res = await this.$service.fetch('/lottery-admin-api/commissionSummary/queryPageCommissionSummary',  Object.assign(params, this.init.query));
    this.init.loading = false;

    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.code === 1 &&  res.data?.records instanceof Array) {
      this.table.dataSource = res.data.records;
      this.table.pagination.total = res.data?.totalCount;
    } else {
      this.table.dataSource = [];
      this.table.pagination.total = 0;
    }
  } 
  
}
</script>

<style lang="scss" scoped>
.crown-wrapper {
    background-color: #fff;
    min-height: 100%;
    padding: 10px;
}

.date-select /deep/{
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  .ant-form-item {
    margin-right: 0;
  }
  .select-timer-area {
    display: flex;
    font-size: 14px;
    align-items: center;
  }
  .btn-1 {
    button {
      padding: 6px 12px;
    }
  }
}
.picker-area /deep/{
  .ant-form-item {
      margin-right: 0;
  }
}

.mytab-switch /deep/{
  li {
    margin-right: 10px;
    button {
      padding: 7px 24px;
    }
  }
}

.game-select-ul {
  display: flex;
  width: 100%;
  border-bottom: 1px solid #009688;
  li {
    margin-right: 10px;
    a {
      display: block;
      padding: 5px 20px;
      text-decoration: none;

      &.active {
        background-color: #009688;
        color: #fff;
      }
    }
  }
}
</style>