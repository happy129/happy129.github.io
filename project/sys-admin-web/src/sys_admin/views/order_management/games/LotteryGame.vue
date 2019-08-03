<template>
  <div class="report-wrapper">
    <a-table :columns="table.columns" :dataSource="table.dataSource" :pagination="false" class="components-table-demo-nested" :rowKey="(e, i) => i">
      <template slot="expandedRowRender" slot-scope="params">
         <a-table v-if="params.normalSummary.length > 0" :columns="table.columns2" :dataSource="params.normalSummary" class="table-item1"  :rowKey="(e, i) => `${i}_${Math.random()}`"  
          :pagination="false" :showHeader="false"> 
          <span slot="title1" class="g-blue bold">普通投注</span>
        </a-table>
        <a-table v-if="params.chaseSummary.length > 0" :columns="table.columns2" :dataSource="params.chaseSummary"  class="table-item2"   :rowKey="(e, i) => `${i}_${Math.random()}`"  
          :pagination="false" :showHeader="false"> 
          <span slot="title1" class="g-green bold">追号投注</span>
        </a-table>
      </template>
    </a-table>
    <div style="text-align:right;padding-top:20px;">
      <a-pagination ref="pagination" @change="changePagination"  :current="table.pagination.current" :defaultCurrent="table.pagination.current" :total="table.pagination.total" />
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle, Prop } from "vue-decorators";
import { formatDate } from "@/util/date";

@Component
export default class LotteryGame extends Vue {
	// 从父组件里面传过来的查询条件xxxxxxxx
	@Prop({ type: Object, default: () => {}}) options;

  table = {
    columns: [
      { title: "游戏名称", dataIndex: "playName", width: '120px'},
      { title: "人数", dataIndex: "userCount", width: '100px' },
      { title: "投注总额", dataIndex: "totalOrderAmount", width: '100px'  },
      { title: "有效注数", dataIndex: "validOrderCount", width: '100px'  },
      { title: "有效投注金额", dataIndex: "validOrderAmount", width: '140px' },
      { title: "中奖金额", dataIndex: "totalWinAmount", width: '100px' },
      { title: "返点金额", dataIndex: "totalRebateAmount", width: '100px' },
      { title: "未开奖注数", dataIndex: "unopenedOrderCount" , width: '160px'},
      { title: "未开奖金额", dataIndex: "unopenedOrderAmount" , width: '160px' },
      { title: "撤单金额", dataIndex: "cancelledOrderAmount" , width: '100px'},
      { title: "盈亏", dataIndex: "totalProfit" , width: '100px'},
      { title: "盈利率", dataIndex: "profitRate", width: '120px'}
    ],
    dataSource: [],
    innerDataSource: [],
    pagination: { current: 1, total: 0},
    columns2: [
      { title: "游戏名称", dataIndex: "title1",  width: '120px', scopedSlots: { customRender: "title1" }},
      { title: "人数", dataIndex: "userCount", width: '100px' },
      { title: "投注总额", dataIndex: "totalOrderAmount", width: '100px' },
      { title: "有效注数", dataIndex: "validOrderCount", width: '100px' },
      { title: "有效投注金额", dataIndex: "validOrderAmount", width: '140px' },
      { title: "中奖金额", dataIndex: "totalWinAmount" , width: '100px'},
      { title: "返点金额", dataIndex: "totalRebateAmount", width: '100px'  },
      { title: "未开奖注数", dataIndex: "unopenedOrderCount", width: '160px' },
      { title: "未开奖金额", dataIndex: "unopenedOrderAmount", width: '160px' },
      { title: "撤单金额", dataIndex: "cancelledOrderAmount", width: '100px' },
      { title: "平台盈亏", dataIndex: "totalProfit" , width: '100px'},
      { title: "盈利率", dataIndex: "profitRate", width: '120px'}
    ]
	};
  // 初始化结束时间
  queryTimeEnd="";
	
  @Lifecycle mounted() {
		this.getList();
  }

  changeSelection() {
    this.table.pagination.current = 1;
    this.table.pagination.pageNo = 1;
  }

  changePagination(pagination) {
    this.table.pagination.current = pagination;
    this.$emit('updatePageNo', pagination);
    this.getList();
  }
	
	async getList(page=true) {
    // 判断选择时间是否大于当前时间
    if (page) {
      // 如果结束时间大于当前时间，设置为当前时间
      if (this.options.createTimeEnd) {
        const d = new Date(this.options.createTimeEnd.replace(/\-/g, '/')).getTime();
        const now = Date.now();
        if (d > now) {
          this.options.createTimeEnd = formatDate(new Date());
          // 缓存数据
          this.queryTimeEnd = this.options.createTimeEnd;
        }
      }
    } else {
      const d1 = new Date(this.options.createTimeEnd.replace(/\-/g, '/')).getTime();
      const d2 = new Date(this.queryTimeEnd.replace(/\-/g, '/')).getTime();
      if (d1 < d2) {
        this.options.createTimeEnd = this.options.createTimeEnd;
      } else {
        this.options.createTimeEnd = this.queryTimeEnd;
      }
    }
    const res = await this.$service.fetch('/lottery-admin-api/orderReport/search/lotteryStat', this.options);
    // this.hidePageNumber(res);
    if (res.code !== 1) return res.message && this.$message.error(res.message);
		if (res?.data?.list instanceof Array) {
      // 对报表中的数据进行保留三位小数
      // const array = ['validOrderAmount',  'totalWinAmount', 'totalRebateAmount', 'unopenedOrderCount', 'unopenedOrderAmount', 'totalProfit', 'cancelledOrderAmount']

      // res.data.list.forEach(item => {
      //     array.forEach(elem => {
      //       if (typeof item.normalSummary === 'object' && item.normalSummary !== null) {
      //         item.normalSummary[elem] = parseFloat(item.normalSummary[elem], 10).toFixed(3);
      //       }
      //       if (typeof item.chaseSummary === 'object' && item.chaseSummary !== null) {
      //         item.chaseSummary[elem] = parseFloat(item.chaseSummary[elem], 10).toFixed(3);
      //       }
      //       if (typeof item.lotterySummary === 'object' && item.lotterySummary !== null) {
      //         item.lotterySummary[elem] = parseFloat(item.lotterySummary[elem], 10).toFixed(3);
      //       }
      //     });
      // });

      this.table.dataSource = res.data.list.map(item => {
        return {
          ...item?.lotterySummary,
          lotteryId: item?.lotteryId,
          normalSummary: item?.normalSummary !==null ? [item?.normalSummary] : [],
          chaseSummary: item?.chaseSummary !== null ? [item?.chaseSummary] : []
        }
      });

      this.table.pagination.total = res.data.totalRows
    }
  }

  /** 隐藏页码 */
  hidePageNumber(res){
    if (!res?.data?.totalPage) return;

    setTimeout(() => {
      // 不超过10页直接不用管
      if (res.data.totalPage <= 5) return;
      // 获取第一个元素
      const fristElement = this.$refs.pagination.$el.querySelector(`.ant-pagination-item-1`);
      // 获取分页的最后一个元素
      const lastElement = this.$refs.pagination.$el.querySelector(`.ant-pagination-item-${res.data.totalPage}`);
      // 大于10页第一个元素隐藏
      lastElement.style.display = 'none';
      // 如果当前页码大于10, 点击的跨度不能大于10， 所以首页得隐藏
      if (res.data.pageNo > 5) {
        fristElement.style.display = 'none';
      } else {
        fristElement.style.display = 'inline-block';
      }
    });
  }
  
}
</script>

<style lang="scss" scoped>
.page-container-report {
  overflow-y: auto; height: 100%;
}

.report-wrapper /deep/ {
  .table-item1 {
    margin: 0 0 16px !important;
  }
  .table-item2 {
     margin: -16px 0 -1px !important;
  }
  .ant-table-expanded-row {
    > td {
      padding: 0;
    }
  }
}

</style>

