<template>
  <div class="page-container">
    <section class="report-heat">
			   <div class="mt15">
        <date-switch  ref="ds" @changeTab="changeTab"></date-switch>
      </div>  
      <div class="mt15">
        <a-form layout="inline">
          <date-range  ref="rg" @change="changeDate"/>
						<a-form-item label="平台名称">
  					<a-select  :dropdownMatchSelectWidth="false" v-model="init.query.platformId">
              <a-select-option value="">全部</a-select-option>
  						<a-select-option v-for="(item, k) in init.platformList" :value="item.id" :key="k">{{item.platformName}}
  						</a-select-option>
  					</a-select>
  				</a-form-item>
          <a-form-item>
            <a-button type="primary" @click.prevent="getLotteryListByLotteryId(true)">查询</a-button>
          </a-form-item>
        </a-form>
      </div>
      <div class="page-under-table">
        <a-table :columns="table.columns" :dataSource="table.dataSource" :rowKey="(e, i) => i" :pagination="false">
          <template slot="operate">
            <a-button type="primary" @click="init.visible = true" size="small">查看</a-button>
          </template>
        </a-table>
          <div style="text-align:right;padding-top:20px;">
              <a-pagination ref="pagination" @change="changePagination"  :current="table.pagination.current" :defaultCurrent="table.pagination.current" :total="table.pagination.total" />
          </div>
       </div>
      <a-modal title="查看注单详情" width="60%" v-model="init.visible">
      </a-modal>
    </section>
  </div>
</template>

<script>
import Vue from "vue";
import { Component, InjectComponents, Lifecycle } from "vue-decorators";
import { TabSwitch, DateSwitch } from "@/components/switch";
import DateRange from '@/components/date-range/DateRange';
import { formatDate } from "@/util/date";

@Component
@InjectComponents({ TabSwitch, DateSwitch,DateRange })
export default class ReportHeat extends Vue {
  table = {
    columns: [
      { title: "商户名称", dataIndex: "playName" },
      { title: "人数", dataIndex: "userCount" },
      { title: "投注总额", dataIndex: "totalOrderAmount" },
      { title: "有效注数", dataIndex: "validOrderCount" },
      { title: "有效投注", dataIndex: "validOrderAmount" },
      { title: "中奖金额", dataIndex: "totalWinAmount" },
      { title: "返点金额", dataIndex: "totalRebateAmount" },
      { title: "未开注数", dataIndex: "unopenedOrderCount" },
      { title: "未开金额", dataIndex: "unopenedOrderAmount" },
      { title: "撤单金额", dataIndex: "cancelledOrderAmount" },
      { title: "盈亏", dataIndex: "totalProfit" },
      { title: "盈利率", dataIndex: "profitRate"}
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
		platformList:[],
		query: {
      pageNo: 1,
      pageSize: 10,
      createTimeStart: '',
      createTimeEnd: '',
      platformId: 1,
      lotteryId: ''
		}
  }
  queryTimeEnd="";
  setInitialDate() {
      const {
          startDate,
          endDate
      } = this.$refs.ds.getTime();
      this.$refs.rg.setDateRangeValues(startDate, endDate);
      this.init.query.createTimeStart = startDate;
      this.init.query.createTimeEnd = endDate;
  }
  changePagination(pagination) {
    this.table.pagination.current = pagination;
    this.init.query.pageNo = pagination;
    this.getLotteryListByLotteryId();
  }
  
  async changeTabs(item) {
    this.list.defaultSelect = this.list.tabColumns.findIndex(v => v.id === item.id);
    // 根据彩种获取分类
    const res = await this.$service.fetch('/config-admin-api/lottery/queryAllLotteryByCategoryId', { id: item.id });
    if (res?.code !== 1) return res.message && this.$message.error(res.message);
    if (res?.data && Array.isArray(res?.data)) {
      this.list.subTabColumns = res.data;
      this.init.query.lotteryId = res.data && res.data[0]?.id;
    }
	}
	//查询平台接口
		async queryAllPlatform() {
	// 请求参数，不用管api上的header
	const res = await this.$service.fetch('/config-admin-api/platform/queryAllPlatform', {});
	if (1 != res.code) return this.$message.error(res.message);
	this.init.platformList = res.data || [];
	this.init.query.platformId = res.data[0].id
	}
  changeTab(startTime, endTime) {
    //this.changeDate(startTime, endTime)
    this.init.query.createTimeStart = startTime;
    this.init.query.createTimeEnd = endTime;
    
		this.$refs.rg.setDateRangeValues(startTime, endTime);
	}

  // 选中子分类
  changeSubTabs(item) {
    this.list.defaultSubSelect = this.list.subTabColumns.findIndex(v => v.id === item.id);
    this.init.query.lotteryId = item.id;
  }
	
	changeDate(startTime, endTime, datestring, type) {
    if (type === 'start') {
      this.init.query.createTimeStart = datestring;
    } else {
      this.init.query.createTimeEnd = datestring;
    }
	}
    /** 隐藏页码 */
    hidePageNumber(res){
        /** 判断如果当前分页大于10页就隐藏最后一页 */
        if (!res?.data?.totalRows) return;

        setTimeout(() => {
            // 不超过10页直接不用管
            if (res.data.totalRows <= 10) return;
            // 获取第一个元素
            const fristElement = this.$refs.pagination.$el.querySelector(`.ant-pagination-item-1`);
            // 获取分页的最后一个元素
            const lastElement = this.$refs.pagination.$el.querySelector(`.ant-pagination-item-${res.data.totalRows}`);
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

	@Lifecycle mounted() {
		this.getLotteryList();
		this.queryAllPlatform();
		this.setInitialDate();
	}

	// 获得彩种列表
	async getLotteryList() {
	    const res = await this.$service.fetch('/config-admin-api/category/queryAllCategory', {});
        if (res.code !== 1) return res.message && this.$message.error(res.message);
        if (res?.data && Array.isArray(res?.data)) {
          // res.data.unshift({ categoryName: '全部', id: 0});
          this.list.tabColumns = res.data;
        }
        this.getLotteryListByLotteryId(false);
        }

  // 查询彩种热度列表
  async getLotteryListByLotteryId(page=true) {
      // 判断选择时间是否大于当前时间
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
    const res = await this.$service.fetch('/lottery-admin-api/orderReport/queryPagePlatformSummary', this.init.query);
    if (res?.code !== 1) return res.message && this.$message.error(res.message);
    this.hidePageNumber(res);
    if (res?.data?.list && res?.data?.list instanceof Array) {
      this.table.dataSource = res?.data?.list;
      this.table.pagination.total = res?.data?.totalRows;
    } else {
      this.table.dataSource = [];
    }
  }

}
</script>

<style lang="scss" scoped>
.page-container {
  overflow-y: auto;
}
</style>