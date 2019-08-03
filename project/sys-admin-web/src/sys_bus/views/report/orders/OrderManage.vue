<template>
  <!--报表 注单管理 -->
  <section class="report-order">
    <template v-if="type != 'modal'">
      <tab-switch :columns="TabColumns" :defaultSelected="TabSelected" @changeTabs="changeTabs"/>
    </template>
    <div class="mt15" v-if="type != 'modal'">
      <tab-switch :columns="SubTabColumns" :defaultSelected="TabSubSelected" level="2" @changeTabs="changeSubTabs" />
    </div>
    <div class="mt15" v-show="type != 'modal'">
      <date-switch @changeTab="searchByDate" ref="ds"></date-switch>
    </div>
    <div class="mt15">
      <a-form :form="formEl" layout="inline">
        <a-form-item label="起止时间">
          <a-select v-model="params.queryTimeType" defaultValue="1">
            <a-select-option value="createTime">投注时间</a-select-option>
            <a-select-option value="settleTime">开奖时间</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item class="picker">
          <date-range @change="changeDate" ref="rg"  />
        </a-form-item>
        <a-form-item label="用户类型">
          <a-select v-decorator="['userType',{ initialValue: ''}]" style="width:100px;" :allowClear="true" @change="changeSelection">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="99">正式用户</a-select-option>
            <a-select-option value="0">试玩用户</a-select-option>
            <a-select-option value="-1">内测用户</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="选择玩法" v-if="lotteryPlayId.length > 0">
          <a-select style="width:120px;" v-model="params.playId"  :dropdownMatchSelectWidth="false" :allowClear="true"  @change="changeSelection">
            <a-select-option value="">全部</a-select-option>
            <a-select-option v-for="(d, i) in lotteryPlayId" :value="d.id" :key="i" >{{d.typeName}}-{{d.planName}}-{{d.playName}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="注单状态">
          <a-select v-decorator="['orderStatus',{ initialValue: ''}]" style="width:120px;" :allowClear="true"  @change="changeSelection">
            <a-select-option value="">全部</a-select-option>
            <a-select-option v-for="(item, index) in dictionary.orderStatus" :key="index" :value="item.value" >{{item.name}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="注单类型">
          <a-select v-decorator="['orderType',{ initialValue: ''}]" style="width:120px;" :allowClear="true"  @change="changeSelection">
            <a-select-option value="">全部</a-select-option>
            <a-select-option v-for="(item, index) in dictionary.orderType" :key="index" :value="item.value" >{{item.name}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="注单来源">
          <a-select v-decorator="['clientType',{ initialValue: ''}]" style="width:100px;" :allowClear="true"  @change="changeSelection">
            <a-select-option value="">全部</a-select-option>
            <a-select-option v-for="(item, index) in dictionary.clientType" :key="index" :value="item.value" >{{item.name}}</a-select-option>
          </a-select>
        </a-form-item>
         <a-form-item label="用户名">
            <a-input v-model="params.userName"/>
          </a-form-item>
          <a-form-item label="用户ID">
            <a-input v-model="params.userId"/>
          </a-form-item>
          <a-form-item label="订单号">
            <a-input v-model="params.orderNo"/>
          </a-form-item>
          <a-form-item label="期号">
            <a-input v-model="params.issueNo"/>
          </a-form-item>
          <a-form-item>
            <a-button @click="submit" type="primary" :loading="init.loading">查询</a-button>
          </a-form-item>
      </a-form>
    </div>

    <div class="g-gray-border mt15">
      <p class="report-order-text" v-if="init.showTotal">
        总投注：
        <span class="g-red bold">{{ $tools.toFixed(totalData.totalOrderAmount, 3) }}</span>
        有效投注：
        <span class="g-green bold">{{ $tools.toFixed(totalData.validOrderAmount, 3) }}</span>
        中奖总额：
        <span class="g-blue bold">{{ $tools.toFixed(totalData.totalWinAmount, 3) }}</span>
        返点总额：
        <span class="g-yellow bold">{{ $tools.toFixed(totalData.totalRebateAmount, 3) }}</span>
        盈亏：
        <span class="g-green bold">{{ $tools.toFixed(totalData.totalProfit, 3) }}</span>
        总用户：
        <span class="g-green bold">{{totalData.userCount}}</span>
        充值用户：<span class="g-green bold">{{totalData.payUserCount}}</span>
      </p>
      <div class="mt15">
				<!-- @change="changePagination" :pagination="null" -->
        <a-table class="mytable" :loading="init.loading" :rowKey="(e,i) => i" :columns="columns" @change="changePagination2" :dataSource="tableData" :pagination="false" :size="type==='modal' ? 'small': 'default'">
          <template slot="orderNo"> <p>订单号</p> <p>注单类型</p> </template>
          <p slot="index1" slot-scope="text,records,index">{{index}}</p>
					<template slot="id" slot-scope="text, records" >
            <a href="javascript:;" class="g-blue bold" @click="$btns.includes(20164) && showBetInfo(records)" v-permission.link="20164">{{records.orderNo}}</a>
            <p>{{ getNameByClientType(records.orderType,  dictionary.orderType) }}</p>
          </template>
          <template slot="userName"> <p>用户名</p> <p>来源</p> </template>
          <template slot="clientType" slot-scope="text, records">
            <p>{{records.userName}}</p>
            <p> {{ getNameByClientType(records.clientType, dictionary.clientType) }}</p>
          </template>
          <template slot="lottery"> <p>彩种</p> <p>期号</p> </template>
          <template slot="issueNo" slot-scope="text, records">
            <p>{{records.lotteryName}}</p>
            <p>{{records.issueNo}}</p>
          </template>
          <template slot="playId"> <p>玩法</p> <p>下注号码</p> </template>
          <template slot="betNumber" slot-scope="text, records">
            <p>{{records.playName}}</p>
            <p :title="records.betNumber" class="bet-numbers">{{records.awardItems ? records.awardItems : records.betNumber}}</p>
          </template>
          <template slot="orderStatus" slot-scope="text, records">
            <p class="g-red">
              <span v-if="records.orderStatus==4" class="g-red bold">{{dictionary.orderStatus.filter(item=>item.value==records.orderStatus)[0].name}}</span>
              <span v-else-if="records.orderStatus==3" class="g-green bold">{{dictionary.orderStatus.filter(item=>item.value==records.orderStatus)[0].name}}</span>
              <span v-else class="g-yellow">{{dictionary.orderStatus.filter(item=>item.value==records.orderStatus)[0].name}}</span>
            </p>
          </template>
          <template slot="openNumber" slot-scope="text, records">
            <p class="open-number" :title="records.openNumber">{{records.openNumber?records.openNumber:''}}</p>
          </template>
          <template slot="winAmount" slot-scope="text, records">
            <span class="g-red">
              <span class="g-red bold" v-if="records.winAmount > 0"> +{{ records.openNumber ? records.winAmount : '' }} </span>
              <span class="g-green bold" v-else>{{ records.openNumber ? records.winAmount : '' }} </span>
            </span>
          </template>
          <template slot="profit" slot-scope="text, records">
            <span class="g-red">
               <span class="g-red bold" v-if="records.profit > 0"> +{{ records.openNumber ? records.profit : '' }} </span>
               <span class="g-green bold" v-else> {{ records.openNumber ? records.profit : '' }} </span>
            </span>
          </template>
          <template slot="orderAmount"  slot-scope="text, records">
            {{ $tools.toFixed(records.orderAmount, 3) }}
          </template>
        </a-table>
        <div style="text-align:right;padding-top:20px;">
            <a-pagination ref="pagination" @change="changePagination"  :current="init.pagination.current" :defaultCurrent="init.pagination.current" :total="init.pagination.total" />
        </div>
      </div>
    </div>
    <!--注单详情-->
    <a-modal title="注单详情"  v-model="init.ModalShow" :width="600" :footer="null" :destroyOnClose="true" :bodyStyle="{padding: '15px', maxHeight: '600px', overflow: 'auto'}">
      <div class="modal-info">
        <div class="modal-info-left">
          <ul>  
              <li>
                <span>订单号</span>
                <span>{{init.ModalInfo.orderNo}}</span>
              </li>
              <li>
                <span>期号</span>
                <span>{{init.ModalInfo.issueNo}}</span>
              </li>
              <li>
                <span>用户</span>
                <span>{{init.ModalInfo.userName}}</span>
              </li>
              <li>
                <span>彩种</span>
                <span>{{init.ModalInfo.lotteryName}}</span>
              </li>
              <li>
                <span>投注注数</span>
                <span>{{init.ModalInfo.betCount}}</span>
              </li>
              <li>
                <span>单注金额</span>
                <span>{{init.ModalInfo.unitPrice}}</span>
              </li>
              <li>
                <span>中奖金额</span>
                <span class="g-red">
                  <b class="g-red" v-if="init.ModalInfo.winAmount > 0">+{{init.ModalInfo.openNumber ? init.ModalInfo.winAmount: ''}} </b>
                  <b class="g-green" v-else>{{init.ModalInfo.openNumber ? init.ModalInfo.winAmount: ''}} </b>
                </span>
              </li>
              <li>
                <span>状态</span>
                <span class="g-red">
                  <b v-if="init.ModalInfo.orderStatus==4" class="g-red">{{getNameByClientType(init.ModalInfo.orderStatus, dictionary.orderStatus)}}</b>
                  <b v-else-if="init.ModalInfo.orderStatus==3" class="g-green">{{getNameByClientType(init.ModalInfo.orderStatus, dictionary.orderStatus)}}</b>
                  <b v-else class="g-yellow">{{getNameByClientType(init.ModalInfo.orderStatus, dictionary.orderStatus)}}</b>
                </span>
              </li>
              <li>
                <span>客户端</span>
                <span>{{getNameByClientType(init.ModalInfo.clientType, dictionary.clientType)}}</span>
              </li>
              <li>
                <span>开奖号码</span>
                <span>{{init.ModalInfo.openNumber}}</span>
              </li>
          </ul>
        </div>
        <div class="modal-info-right">
           <ul>  
              <li>
                <span>下注时间</span>
                <span>{{init.ModalInfo.createTime}}</span>
              </li>
              <li>
                <span>开奖时间</span>
                <span v-show="init.ModalInfo.orderStatus == 4 || init.ModalInfo.orderStatus == 3">{{init.ModalInfo.settleTime}}</span>
              </li>
              <li>
                <span>玩法</span>
                <span>{{init.ModalInfo.playName}}</span>
              </li>
              <li>
                <span>倍数</span>
                <span>{{init.ModalInfo.betTimes}}</span>
              </li>
              <li>
                <span>投注总额</span>
                <span>{{init.ModalInfo.orderAmount}}</span>
              </li>
              <li>
                <span>盈亏</span>
                <span class="g-red">
                  <b class="g-red" v-if="init.ModalInfo.profit > 0">+{{init.ModalInfo.openNumber ? init.ModalInfo.profit : ''}} </b>
                  <b class="g-green" v-else>{{init.ModalInfo.openNumber ? init.ModalInfo.profit : ''}} </b>
                </span>
              </li>
              <li>
                <span>销售返点</span>
                <span>{{init.ModalInfo.rebateRate}}</span>
              </li>
              <li>
                <span>下注号码</span>
                <span>{{init.ModalInfo.awardItems ? init.ModalInfo.awardItems : init.ModalInfo.betNumber}}</span>
              </li>
          </ul>
        </div>
      </div>
      <div class="inner-table">
        <table class="tabler-order">
          <thead>
            <tr>
              <th>玩法</th>
              <th>可中奖项</th>
              <th>返点</th>
              <th>赔率</th>
              <th>中奖注数</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in lotteryDetails" :key="index">
              <td>{{item.playName}}</td>
              <td>{{item.awardItem}}</td>
              <td>{{item.rebate}}</td>
              <td>{{item.maxOdds}}</td>
              <td>{{item.counts}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </a-modal>
  </section>
</template>
<script>

import Vue from "vue";
import { Component, Lifecycle, Watch, InjectComponents, Prop } from "vue-decorators";
import { TabSwitch, DateSwitch } from "@/components/switch";
import { close, closeSync } from "fs";
import DateRange from "@/components/date-range/DateRange";
import moment from "moment"
import { formatDate } from "@/util/date";

const dictionary = "userType,clientType,betType,orderStatus,orderType";

@Component({ dictionary })
@InjectComponents({ TabSwitch, DateRange, DateSwitch })
export default class OrderManage extends Vue {
  columns = [
			//  { title: "序号", dataIndex: "index1" },
    { dataIndex: "name", scopedSlots: { customRender: "id", title: "orderNo" } },
    { dataIndex: "name1", scopedSlots: { customRender: "clientType", title: "userName" } },
    { scopedSlots: { customRender: "issueNo", title: "lottery" } },
    { scopedSlots: { customRender: "betNumber", title: "playId" } },
    { title: "开奖号码", dataIndex: "openNumber", scopedSlots: { customRender: "openNumber" } },
    { title: "下注金额", dataIndex: "orderAmount", sorter: true, scopedSlots: { customRender: "orderAmount" }  },
    { title: "中奖金额", dataIndex: "winAmount", sorter: true, scopedSlots: { customRender: "winAmount" } },
    { title: "返水比率", dataIndex: "rebateRate", sorter: true },
    { title: "盈亏", dataIndex: "profit", sorter: true, scopedSlots: { customRender: "profit" } },
    { title: "状态", dataIndex: "orderStatus", scopedSlots: { customRender: "orderStatus" } },
		{ title: "下注时间", dataIndex: "createTime",sorter: true  },
	
  ];
  tableData = [];

  params = {
		queryTimeStart: "",
		queryTimeEnd: "",
  	queryTimeType:'createTime',
    issueNo: "",
    playId: "",
    lotteryIds: "",
    orderNo: "",
    pageNo: 1,
    pageSize: 10,
    platformId: '',
    userId: "",
    userName: "",
    operateType: 1,
    sortFieldName: '',
    sortOrder: ''
  };

  TabSelected = 0;
  platformList = [];
  TabColumns = ["全部"];
  TabSubSelected = 0;
  SubTabColumns = ["全部"];
  dataTable = [];
  selectPlayId = ["全部"];
  totalData = {};
  // 点击注单详情，获取彩票返点信息
  lotteryDetails=[];
  // 选择的彩种id
  selectedLotteryId = 0;
  // select options
  lotteryPlayId = [];
  // 查询结束时间
  queryTimeEnd = '';

  init = {
    ModalShow: false,
    showTotal: true,
    loading: false,
    ModalInfo: {},
    pagination: {
      total: 0,
      current: 1
    }
  };
	domTotal=0;
  // 从彩种热度点查看，展示出弹窗
  @Prop({type: String}) type;
  @Prop({type: [String, Number]}) queryId;
  @Prop({type: [String, Number]}) playId;
  @Prop({type: String }) queryStartTime;
  @Prop({type: String}) queryEndTime;
	
	changePagination2(current, filters, sorter) {
    // // 点击排序
    if (sorter.order) {
      switch(sorter.order) {
        case "ascend":
          this.params.sortFieldName = sorter?.field;
          this.params.sortOrder = 'asc';
          break;
        case "descend":
          this.params.sortFieldName = sorter?.field;
          this.params.sortOrder = 'desc';
          break;
      }
    } else {
      this.params.sortFieldName = '';
      this.params.sortOrder = '';
    }
    this.queryOrderReport(false, false);
	}
	
  changePagination(current) {
    this.init.pagination.current = current;
    this.params.pageNo = current;
    this.queryOrderReport(false, false);
  }

  async changeTabs(text) {
    if (text == "全部") {
      this.TabSelected = 0;
      this.SubTabColumns = ["全部"];
      this.params.lotteryIds = "";
      return;
    }
    let id = text?.id;
    this.selectedLotteryId = id;
    this.TabSelected = this.TabColumns.findIndex(v => v === text);
    const res = await this.$service.fetch( "/config-admin-api/lottery/queryAllLotteryByCategoryId", { id: id });
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data instanceof Array) {
      this.SubTabColumns = res.data;
      this.params.lotteryIds = res.data.map(item => item.id).join(',');
      this.TabSubSelected = 0;
      this.SubTabColumns.unshift("全部");
    }
    // 选择彩种后清空陪注单玩法
    this.params.playId="";
    this.getPlays();
  }

  async getPlays() {
    let id = "";
    if (this.type !== 'modal') {
      id = this.selectedLotteryId;
    } else {
      id = this.queryId;
    }
    const res = await this.$service.fetch("/config-admin-api/play/queryAllThirdLevelPlayByCategoryId", { id });
    if (1 != res.code) return res.message && this.$message.error(res.message);
    if (res.data instanceof Array) {
      this.lotteryPlayId = res.data;
    }
  }

  changeSubTabs(text) {
    if (text == "全部") {
      this.params.lotteryIds = this.SubTabColumns.map(item => item.id).filter(item => item).join(',');
      this.TabSubSelected = 0;
      return;
    }
    this.params.lotteryIds = text.id;
    this.TabSubSelected = this.SubTabColumns.findIndex(v => v === text);
  }

  @Lifecycle created() {
    this.formEl = this.$form.createForm(this);
  }

  @Lifecycle async mounted() {
     // 把值灌进去
    this.setInitialDate();
		/** 如果当前页面大于10页 隐藏最后一页 */
    if (this.type == 'modal') {
      this.params.lotteryIds = this.queryId;
      this.params.playId = this.playId;
      this.params.queryTimeStart = this.queryStartTime;
      this.params.queryTimeEnd = this.queryEndTime;
      if (this.params.queryTimeStart &&  this.params.queryTimeEnd) {
        const startDate = new Date(this.params.queryTimeStart.replace('-', '/'));
        const endDate = new Date(this.params.queryTimeEnd.replace('-', '/'));
        this.$refs.rg.setDateRangeValues(startDate, endDate);
      }
    }

    //平台名称接口
    this.fetchLotteryCategorys();
    this.queryAllPlatform();
    this.queryOrderReport();
    //this.betOrderSummary();
  }

  async betOrderSummary(queryParam) {
    this.formEl.validateFields(async (err, values) => {
      if (err) {
        return;
      }
      let params = Object.assign(values, this.params, queryParam);
      const res = await this.$service.fetch( "/lottery-admin-api/orderReport/queryBetOrderReportSummary", { ...params } );
      if (1 != res.code) return this.$message.error(res.message);
      // 所有都是0的话，就不展示汇总
      if (typeof res.data === "object") {
        this.init.showTotal = Object.values(res.data).some(item => item != 0 );
        if (!this.init.showTotal) {
          this.init.ModalInfo = res?.data;
        }
        this.totalData = res.data
      }
    });
  }

  getNameByClientType(type, array) {
    return array.find(item => item.value == type)?.name;
  }

  changeSelection() {
    this.params.pageNo = 1;
    this.init.pagination.current = 1;
  }

  setInitialDate() {
    const {startDate, endDate} = this.$refs.ds.getTime();
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
    this.params.queryTimeStart = startDate
    this.params.queryTimeEnd = endDate
    //this.changeDate(startDate, endDate);
    this.$refs.rg.setDateRangeValues(startDate, endDate);
  }

  submit() {
		this.init.pagination.current=1;
		this.domTotal=0;
    this.queryOrderReport(true);
    //this.betOrderSummary();
  }

  // 获取注单详情
  async showBetInfo(records) {
    this.init.ModalShow = true;
    this.init.ModalInfo = records;
    // 获取注单详情内的彩票信息
    const res = await this.$service.fetch('/config-admin-api/oddsConfig/queryOddsConfigByIds', {
      lotteryId: records?.lotteryId,
      platformId: records?.platformId,
      playId: records?.playId
    });
    if (res.code !== 1) return;
      let winCounts = records.winLevel ? records.winLevel.split('$') : [];
      if (winCounts.length > 0) {
        winCounts = winCounts.filter(item => item);
      }

      const result = res.data?.map((v, index) => ({...v, counts: +winCounts[index] || '--' }));
      this.lotteryDetails = result;
      // if (res.data?.length === winCounts.length) {
      //   const result = res.data.map((item, index) => {
      //     return {
      //       ...item, 
      //       counts: winCounts[index]
      //     }
      //   });
      //   this.lotteryDetails = result;
      // } else {
      //   const result = res.data?.map(v => ({...v, counts: '--'}));
      //   this.lotteryDetails = result;
      // }
    // }
  }

  //查询订单详情
  async queryOrderReport(type, page=true) {
    if (type) this.changeSelection();
    this.formEl.validateFields(async (err, values) => {
      if (err)  return
      let params = Object.assign(values, this.params);
      if (page) {
        // 如果结束时间大于当前时间，设置为当前时间
        if (params.queryTimeEnd) {
          const d = new Date(params.queryTimeEnd.replace(/\-/g, '/')).getTime();
          const now = Date.now();
          if (d > now) {
            params.queryTimeEnd = formatDate(new Date());
            // 缓存数据
            this.queryTimeEnd = params.queryTimeEnd;
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
      if (this.queryEndTime !== undefined) {
        params.queryTimeEnd = this.queryEndTime;
      }
      this.init.loading = true;
      const res = await this.$service.fetch( "/lottery-admin-api/orderReport/queryPageOrderReport", { ...params } );
      this.init.loading = false;
			if (1 != res.code) return this.$message.error(res.message);
      // 业务处理
      this.tableData = res.data.records || [];
			this.init.pagination.total = res.data?.totalPage * 10;
			this.hidePageNumber(res);
      // 查询汇总
      this.betOrderSummary(params);
    });
  }

  /** 隐藏页码 */
  hidePageNumber(res){
    /** 判断如果当前分页大于10页就隐藏最后一页 */
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
    // 业务处理
    this.lotteryCategoryArrays = res.data || [];
    this.TabColumns = res.data;
    this.TabColumns.unshift("全部");
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

.modal-info {
  display: flex;
  justify-content: space-between;
  .modal-info-left, .modal-info-right {
    width: 50%;
    ul {
      li {
        margin-bottom: 20px 
      }
    }
    span {
      position: relative;
      &:first-child {
        width: 70px;
        display: inline-block;
        text-align: right;
        margin-right: 10px;
        font-weight: bold;

        &::after {
          content: '：'
        }
      }
    }
  }
}

/deep/ .picker{
  &.ant-form-item {
    margin-right: 0 !important;
  }
  .ant-form-item {
     margin-right: 0 !important;
  }
  .ant-form-item-children{
    .ant-form-item {
      margin-right: 5px !important;
    }
  }
}

.open-number {
  width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hiddenText{
		width: 140px;
		text-overflow: ellipsis;
		overflow: hidden;
	}
  .bet-numbers {
    width: 140px;
    text-overflow: ellipsis;
		overflow: hidden;
    white-space: nowrap;
  }

.tabler-order {
  width: 100%;
  border: 1px solid #cecece;
  border-collapse: collapse;
  text-align: center;
  th {
    padding: 10px;
    border: 1px solid #cecece;
    background-color: #f1f1f1;
  }
  td {
    padding: 5px;
    border: 1px solid #cecece
  }
}

</style>