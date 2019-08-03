<template>
  <!--报表 注单管理 -->
  <div class="page-container chase-order">
    <section>
      <tab-switch :columns="TabColumns" :defaultSelected="TabSelected" @changeTabs="changeTabs"/>
      <div class="mt15">
        <tab-switch :columns="SubTabColumns" :defaultSelected="TabSubSelected" level="2" @changeTabs="changeSubTabs" />
      </div>
      <div class="mt15">
        <date-switch @changeTab="searchByDate" ref="ds"></date-switch>
      </div>
      <div class="mt15">
        <a-form :form="formEl" layout="inline">
          <a-form-item label="起止时间">
            <a-select v-model="params.queryTimeType" defaultValue="1" @change="changeSelect">
              <a-select-option value="createTime">投注时间</a-select-option>
              <a-select-option value="settleTime">开奖时间</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item class="picker">
            <date-range @change="changeDate" ref="rg"/>
          </a-form-item>
          <a-form-item label="用户类型">
            <a-select v-decorator="['userType',{ initialValue: ''}]" style="width:120px;" :allowClear="true" >
              <a-select-option value>全部</a-select-option>
              <a-select-option value="99">正式用户</a-select-option>
              <a-select-option value="0">试玩用户</a-select-option>
              <a-select-option value="-1">内测用户</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="选择玩法" v-if="lotteryPlayId.length > 0">
            <a-select  :dropdownMatchSelectWidth="false"  class="width140" v-model="params.playId" defaultValue="1" :allowClear="true"  @change="changeSelect">
              <a-select-option value>全部</a-select-option>
              <a-select-option v-for="(d, i) in lotteryPlayId" :value="d.id" :key="i" >{{d.typeName}}-{{d.planName}}-{{d.playName}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="注单状态">
            <a-select v-decorator="['chaseStatus',{ initialValue: ''}]" style="width:120px;" :allowClear="true" @change="changeSelect" >
              <a-select-option value>全部</a-select-option>
              <a-select-option v-for="(item, index) in dictionary.chaseStatus" :key="index" :value="item.value" >{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </div>
      <div class="mt15">
        <a-form layout="inline">
          <a-form-item label="用户名">
            <a-input v-model="params.userName"/>
          </a-form-item>
          <a-form-item label="用户ID">
            <a-input v-model="params.userId"/>
          </a-form-item>
          <a-form-item label="追号订单号">
            <a-input v-model="params.orderGroupNo"/>
          </a-form-item>
          <a-form-item label="期号">
            <a-input v-model="params.issueNo"/>
          </a-form-item>
          <a-form-item>
            <a-button @click="submit" type="primary" :loading="init.loading">查询</a-button>
          </a-form-item>
        </a-form>
      </div>
      <div class="mt15">
				<!--  @change="changePagination2" -->
        <a-table :pagination="false" :loading="init.loading" @expand="expand" :rowKey="(e,i) => i" :columns="columns" :dataSource="tableData" >
          <template slot="orderStatus" slot-scope="text, records">
						 <p>{{ getNameByText(dictionary.orderStatus, records.orderStatus) }}</p>
          </template>
          <template slot="betNumber" slot-scope="text, records">
            <a-tooltip :title="records.betNumber">
              <p class="bet-number-wrap">{{records.betNumber}}</p>
            </a-tooltip>
          </template>
          <template slot="clientType" slot-scope="text, records">
            <p>{{ getNameByText(dictionary.clientType,  records.clientType)}}</p>
          </template>
          <template slot="isStopChaseWhenWinning" slot-scope="text, records">
            <p v-if="records.isStopChaseWhenWinning">是</p>
            <p v-else>否</p>
          </template>
          <a-table :rowKey="(ee, ii) => ii" slot="expandedRowRender" slot-scope="r" :columns="innerColumns" 
						:dataSource="r.innerDataSource||[]" :pagination="false" v-if="r.innerDataSource" >
            <template slot="winAmount" slot-scope="text, records">
              <span v-if="records.winAmount > 0" class="g-red bold">{{records.winAmount}}</span>
              <span v-else>{{records.winAmount}}</span>
            </template>
            <template slot="profit" slot-scope="text, records">
              <span class="g-red bold" v-if="parseFloat(records.profit) > 0">+{{records.profit}}</span>
              <span class="g-green" v-else>{{records.profit}}</span>
            </template>
            <template slot="orderStatusS" slot-scope="text, records">
              <p class="g-red bold" v-if="records.orderStatusName==='已中奖'">{{ records.orderStatusName }}</p>
              <p class="g-green" v-else-if="records.orderStatusName==='未中奖'">{{ records.orderStatusName }}</p>
              <p class="g-yellow" v-else>{{ records.orderStatusName }}</p>
            </template>
          </a-table>
        </a-table>
        <div style="text-align:right;padding-top:20px;">
            <a-pagination ref="pagination" @change="changePagination"  :current="pagination.current" :defaultCurrent="pagination.current" :total="pagination.total" />
        </div>
      </div>
    </section>
  </div>
</template>
<script>
import Vue from "vue";
import { Component, Lifecycle, Watch, InjectComponents } from "vue-decorators";
import { TabSwitch, DateSwitch } from "@/components/switch";
import { getToken } from "@/util/auth";
import DateRange from "@/components/date-range/DateRange";
const dictionary = "userType,clientType,betType,orderStatus,chaseStatus";
import { formatDate } from "@/util/date";

@Component({ dictionary })
@InjectComponents({ TabSwitch, DateRange, DateSwitch })
export default class OrderManage extends Vue {
  columns = [
    { title: "追号订单号", dataIndex: "orderGroupNo" },
    { title: "用户名", dataIndex: "userName" },
    { title: "玩法", dataIndex: "playName" },
    {
      title: "下注内容",
      dataIndex: "betNumber",
      scopedSlots: { customRender: "betNumber" }
    },
    { title: "期数", dataIndex: "startIssueNo" },
    { title: "下注时间", dataIndex: "createTime" },
    {
      title: "来源",
      dataIndex: "clientType",
      scopedSlots: { customRender: "clientType" }
    },
    {
      title: "中奖追停",
      dataIndex: "isStopChaseWhenWinning",
      scopedSlots: { customRender: "isStopChaseWhenWinning" }
    },
    {
      title: "状态",
      dataIndex: "chaseStatusName"
    }
  ];
  innerColumns = [
    { title: "商户名称", dataIndex: "platformName" },
    { title: "订单号", dataIndex: "orderNo" },
    { title: "期号", dataIndex: "issueNo" },
    { title: "开奖号码", dataIndex: "openNumber" },
    { title: "下注金额", dataIndex: "orderAmount" },
    { title: "返水比率", dataIndex: "rebateRate" },
    { title: "中奖金额", dataIndex: "winAmount", scopedSlots: { customRender: 'winAmount' } },
    { title: "下注时间", dataIndex: "createTime" },
    { title: "盈亏", dataIndex: "profit" , scopedSlots: { customRender: 'profit' }},
    {
      title: "状态",
      scopedSlots: { customRender: "orderStatusS" }
    }
  ];
  innerData = [];
  tableData = [];
  pagination = {
    current: 1,
    total: 0
  }

  params = {
    queryTimeType: "createTime",
    queryTimeEnd: "",
    queryTimeStart: "",
    issueNo: "",
    playId: "",
    lotteryIds: "",
    orderNo: "",
    pageNo: 1,
    pageSize: 10,
    platformId: "",
    onlyOrderGroup: true,
    orderGroupNo: "",

    userId: "",
    userName: "",
    operateType: 1
  };

  pagination = { total: 0, current: 1 };

  timeType = "投注时间";
  TabSelected = 0;
  platformList = [];
  TabColumns = ["全部"];
  TabSubSelected = 0;
  SubTabColumns = ["全部"];
  dataTable = [];
  selectPlayId = ["全部"];
  queryTimeEnd="";

  init = { loading: false };
	domTotal=0;

  @Lifecycle created() {
    this.$watch("TabSelected", () => this.toFetchQueryByCategoryId(), {
      immediate: true
    });
    this.formEl = this.$form.createForm(this);
  }

  @Lifecycle mounted() {
    this.setInitialDate();
    this.fetchLotteryCategorys();
    //平台名称接口
    this.queryAllPlatform();
    this.queryOrderReport();
  }

  getNameByText(array, text) {
    return array.find(item=>item.value==text)?.name;
  }

  changeSelect() {
    this.pagination.current = 1;
    this.params.pageNo = 1;
  }

  async changeTabs(text) {
    if (text == "全部") {
      this.TabSelected = 0;
      this.SubTabColumns = ["全部"];
      this.params.lotteryIds = "";
      return;
    }
    this.TabSelected = this.TabColumns.findIndex(v => v === text);
    let id = text.id;
    const res = await this.$service.fetch( "/config-admin-api/lottery/queryAllLotteryByCategoryId", { id } );
    if (res.data instanceof Array) {
      this.SubTabColumns = res.data;
      this.SubTabColumns.unshift("全部");
    }
  }

  changeSubTabs(text) {
    if (text == "全部") {
      this.params.lotteryIds = "";
      this.TabSubSelected = 0;
      return;
    }
    this.params.lotteryIds = text.id;
    this.TabSubSelected = this.SubTabColumns.findIndex(v => v === text);
  }

  getTextByType(type, array) {
    return array.find(item => item.value === type)?.name;
  }

  changePagination(current) {
    this.pagination.current =current;
    this.params.pageNo = current;
    this.queryOrderReport(false, false);
  }
	

  setInitialDate() {
    const { startDate, endDate } = this.$refs.ds.getTime();
    this.$refs.rg.setDateRangeValues(startDate, endDate);
    this.params.queryTimeStart = startDate;
    this.params.queryTimeEnd = endDate;
  }

  changeDate(startTime, endTime, datestring, type) {
    if (type === 'start') {
      this.params.queryTimeStart = datestring
    } else {
      this.params.queryTimeEnd = datestring
    }
  }

  searchByDate(startDate, endDate) {
    this.params.queryTimeStart = startDate;
    this.params.queryTimeEnd = endDate;
    this.$refs.rg.setDateRangeValues(startDate, endDate);
  }

  submit() {
		this.pagination.current=2;
		this.domTotal=0;
    this.queryOrderReport(true);
  }

  //展开子集
  async expand(expanded, record) {
    if(expanded) await this.queryChaseGroup(record)
    return expanded;
  }

  async queryChaseGroup(r) {
    await this.$nextTick();
    const params = {
      platformId: r.platformId,
      orderGroupNo: r.orderGroupNo,
      pageNo: 1,
      pageSize: 120,
      userId: r.userId
    };
    const res = await this.$service.fetch( "/lottery-admin-api/orderReport/queryPageOrderReport", params );

// 在数据集合里加入展开列表的数据
    this.tableData.forEach(async d => {
      if (d.orderGroupNo === r.orderGroupNo) {
        if (1 != res.code) d.innerDataSource = [];
        d.innerDataSource = res.data?.records;
        await this.$forceUpdate()
      }
    });
  }

  //查询订单详情
  async queryOrderReport(type, page=true) {
    if (type) this.changeSelect();
    this.formEl.validateFields(async (err, values) => {
      if (err)return;
      this.init.loading = true;
      let params = Object.assign(values, this.params);
      // 判断结束时间是否大于当前时间
      if (page) {
        // 如果结束时间大于当前时间，设置为当前时间
        if (params.queryTimeEnd) {
          const d = new Date(params.queryTimeEnd.replace(/\-/g, '/')).getTime();
          const now = Date.now();
          if (d > now) {
            params.queryTimeEnd = formatDate(new Date());
            // 缓存数据
            this.queryTimeEnd = values.queryTimeEnd;
          }
        }
      } else {
        const d1 = new Date(this.params.queryTimeEnd.replace(/\-/g, '/')).getTime();
        const d2 = new Date(this.queryTimeEnd.replace(/\-/g, '/')).getTime();
        if (d1 < d2) {
          params.queryTimeEnd = this.params.queryTimeEnd
        } else {
          params.queryTimeEnd = this.queryTimeEnd;
        }
      }
      const res = await this.$service.fetch( "/lottery-admin-api/orderReport/queryPageChaseOrderReport", { ...params } );
      this.init.loading = false;
      if (1 != res.code) return this.$message.error(res.message);
      this.tableData = res.data.records || [];
			this.pagination.total = res.data.totalPage * 10;
			this.hidePageNumber(res);
    });
	}

  /** 隐藏页码 */
  hidePageNumber(res){
    if (!res?.data?.totalPage) return;

    setTimeout(() => {
      // 不超过10页直接不用管
      if (res.data.totalPage <= 10) return;
      // 获取第一个元素
      const fristElement = this.$refs.pagination.$el.querySelector(`.ant-pagination-item-1`);
      // 获取分页的最后一个元素
      const lastElement = this.$refs.pagination.$el.querySelector(`.ant-pagination-item-${res.data.totalPage}`);
      // 大于10页第一个元素隐藏
      lastElement.style.display = 'none';
      // 如果当前页码大于10, 点击的跨度不能大于10， 所以首页得隐藏
      if (res.data.pageNo > 10) {
        fristElement.style.display = 'none';
      } else {
        fristElement.style.display = 'inline-block';
      }
    });
  }

  async queryAllPlatform() {
    const res = await this.$service.fetch( "/config-admin-api/platform/queryAllPlatform", {} );
    if (1 != res.code) return this.$message.error(res.message);
    this.platformList = res.data || [];
  }

  async fetchLotteryCategorys() {
    const res = await this.$service.fetch( "/config-admin-api/category/queryAllCategory", {} );
    if (1 != res.code) return this.$message.error(res.message);
    this.lotteryCategoryArrays = res.data || [];
    this.TabColumns = res.data;
    this.TabColumns.unshift("全部");
  }

  /** 查询玩法信息 */

  async toFetchQueryByCategoryId() {
    if (!this.TabSelected)return (this.lotteryPlayId = []);
    const id = this.TabSelected;
    const res = await this.$service.fetch( "/config-admin-api/play/queryAllThirdLevelPlayByCategoryId", { id } );
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.lotteryPlayId = res.data;
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
.width140 > div {
  width: 180px !important;
}
.chase-order {
  overflow: auto !important;
}
.bet-number-wrap {
  max-width: 160px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  height: 18px;
}

/deep/ .picker {
  &.ant-form-item {
    margin-right: 0 !important;
  }
  .ant-form-item {
    margin-right: 0 !important;
  }
  .ant-form-item-children {
    .ant-form-item {
      margin-right: 5px !important;
    }
  }
}
</style>