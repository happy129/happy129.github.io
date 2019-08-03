<template>
  <div class="page-container">
    <section class="report-heat">
      <tab-switch :defaultSelected="list.defaultSelect" :columns="list.tabColumns" @changeTabs="changeTabs"/>
      <div class="mt15">
        <tab-switch :defaultSelected="list.defaultSubSelect" :columns="list.subTabColumns" level="2" @changeTabs="changeSubTabs" />
      </div>
      <div class="mt15">
        <a-form layout="inline">
          <date-range @change="changeDate" ref="dg"/>
          <a-form-item>
            <a-button type="primary" @click.prevent="getLotteryListByLotteryId(true)" :loading="init.loading">查询</a-button>
          </a-form-item>
        </a-form>
      </div>
      <div class="page-under-table">
        <a-table class="mytable" bordered  :loading="init.loading" :columns="table.columns" :dataSource="table.dataSource" :rowKey="(e, i) => i" :pagination="false">
          <template slot="operate" slot-scope="text, records">
            <a-button v-permission="20173" type="primary" @click="showModal(records)" size="small">查看</a-button>
          </template>
        </a-table>
        <div style="text-align:right;padding-top:20px;">
          <a-pagination ref="pagination" @change="changePagination"  :current="table.pagination.current" :defaultCurrent="table.pagination.current" :total="table.pagination.total" />
        </div>
       </div>
    </section>

    <a-modal title="查看注单详情" v-model="init.ModalShow" :footer="null" :destroyOnClose="true" :width="1360">
      <order-manage :queryId="init.queryId" :type="init.orderManageType" :playId="init.playId" :queryStartTime="init.query.createTimeStart" :queryEndTime="init.query.createTimeEnd"/>
    </a-modal>
  </div>
</template>

<script>
import Vue from "vue";
import { Component, InjectComponents, Lifecycle } from "vue-decorators";
import { TabSwitch } from "@/components/switch";
import DateRange from '@/components/date-range/DateRange';
import OrderManage from '@views/report/orders/OrderManage';
import { getDateByText } from "@/util/helper";
import { formatDate } from "@/util/date";

@Component
@InjectComponents({ TabSwitch, DateRange, OrderManage })
export default class ReportHeat extends Vue {
  table = {
    columns: [
      { title: "玩法名称", dataIndex: "playName" },
      { title: "总注数", dataIndex: "totalOrderCount" },
      { title: "有效投注", dataIndex: "validOrderCount" },
      { title: "总投注额", dataIndex: "totalOrderAmount" },
      { title: "有效投注额", dataIndex: "validOrderAmount" },
      { title: "未开奖金额", dataIndex: "unopenedOrderAmount" },
      { title: "撤单金额", dataIndex: "cancelledOrderAmount" },
      { title: "中奖金额", dataIndex: "totalWinAmount" },
      { title: "返水金额", dataIndex: "totalRebateAmount" },
      { title: "盈亏", dataIndex: "totalProfit" },
      { title: "总用户", dataIndex: "userCount" },
      { title: "操作", dataIndex: "operate", scopedSlots: { customRender: "operate" } }
    ],
    dataSource: [],
    pagination: {total: 0, current: 1}
	};
	
	list = {
      tabColumns: [],
      subTabColumns: [],
      defaultSelect: 0,
      defaultSubSelect: 0
	};

	init = {
      visible: false,
      query: {
      pageNo: 1,
      pageSize: 10,
      createTimeStart: '',
      createTimeEnd: '',
      lotteryId: '',
      platformId: ""
    },
    ModalShow: false,
    queryId: "",
    playId: "",
    orderManageType: "modal",
    // loading 
    loading: false
  }
  queryTimeEnd="";

  @Lifecycle activated() {
    this.init.query.platformId = this.platformId; 
  }

  @Lifecycle created() {
    this.init.query.platformId = this.platformId; 
  }

  showModal(item) {
    this.init.queryId = item.lotteryId;
    this.init.playId = item.groupValue;
    this.init.ModalShow = true;
  }

  changePagination(pagination) {
    this.table.pagination.current = pagination;
    this.init.query.pageNo = pagination;
    this.getLotteryListByLotteryId(false, false);
  }
  
  async changeTabs(item) {
    if (item.id === "")  this.init.query.lotteryId = "";
    this.list.defaultSelect = this.list.tabColumns.findIndex(v => v.id === item.id);
    // 根据彩种获取分类
    const res = await this.$service.fetch('/config-admin-api/lottery/queryAllLotteryByCategoryId', { id: item.id });
    if (res?.code !== 1 && item.id !== "") return res.message  &&this.$message.error(res.message);
    if (res?.data && Array.isArray(res?.data)) {
      this.init.query.lotteryId = res.data.map(item => item.id).join(',');
      res.data.unshift({categoryName: '全部', id: ""});
      this.list.subTabColumns = res.data;
    }
  }
  // 选中子分类
  changeSubTabs(item) {
    if (item.categoryName === "全部") {
      this.init.query.lotteryId = this.list.subTabColumns.map(v => v.id).filter(v => v).join(',');
    } else {
      this.init.query.lotteryId = item.id;
    }
    this.list.defaultSubSelect = this.list.subTabColumns.findIndex(v => v.id === item.id);
  }
	
	changeDate(startTime, endTime, datestring, type) {
    if (type === 'start') {
      this.init.query.createTimeStart = datestring
    } else {
      this.init.query.createTimeEnd = datestring
    }
	}

	@Lifecycle mounted() {
    this.setInitialDate();
		this.getLotteryList();
  }
  
  setInitialDate() {
    const {startDate, endDate} = getDateByText("今天");
    this.init.query.createTimeStart = startDate;
    this.init.query.createTimeEnd = endDate
    this.$refs.dg.setDateRangeValues(startDate, endDate);
  }

	// 获得彩种列表
	async getLotteryList() {
		const res = await this.$service.fetch('/config-admin-api/category/queryAllCategory', {});
    if (res.code !== 1) res.message && this.$message.error(res.message);
    if (res?.data && Array.isArray(res?.data)) {
      res.data.unshift({ categoryName: '全部', id: ""});
      this.list.tabColumns = res.data;
    }
    
    // 根据彩种获取子类
    await this.changeTabs({id: ""});

    this.getLotteryListByLotteryId();
	}

  // 查询彩种热度列表
  async getLotteryListByLotteryId(reset, page=true) {
    if (reset) {
      this.table.pagination.current = 1;
      this.init.query.pageNo = 1;
    }
    // 判断结束时间是否大于当前时间
    if (page) {
      // 如果结束时间大于当前时间，设置为当前时间
      if (this.init.query.createTimeEnd) {
        const d = new Date(this.init.query.createTimeEnd.replace(/\-/g, '/')).getTime();
        const now = Date.now();
        if (d > now) {
          this.init.query.createTimeEnd = formatDate(new Date());
          // 缓存数据
          this.queryTimeEnd = this.init.query.createTimeEnd;
        }
      }
    } else {
      const d1 = new Date(this.init.query.createTimeEnd.replace(/\-/g, '/')).getTime();
      const d2 = new Date(this.queryTimeEnd.replace(/\-/g, '/')).getTime();
      if (d1 < d2) {
        this.init.query.createTimeEnd = this.init.query.createTimeEnd;
      } else {
        this.init.query.createTimeEnd = this.queryTimeEnd;
      }
    }
    this.init.loading = true;
    const res = await this.$service.fetch('/lottery-admin-api/orderReport/playStat', this.init.query);
    this.init.loading = false;
    if (res?.code !== 1) return res.message && this.$message.error(res.message);
    this.hidePageNumber(res);
    if (res?.data?.list && res?.data?.list instanceof Array) {
      this.table.dataSource = res?.data?.list || [];
      this.table.pagination.total = res?.data?.totalRows || 0;
    }
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

}
</script>

<style lang="scss" scoped>
.page-container {
  overflow-y: auto;
}
</style>