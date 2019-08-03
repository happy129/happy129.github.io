<template>
  <section>
    <a-form class="myform" layout="inline">
      <a-form-item label="帐变类型">
        <a-cascader :options="init.gameCategory" @change="changeData" :loadData="loadData" placeholder="选择游戏帐变类型" changeOnSelect/>
      </a-form-item>
      <a-form-item class="qr-range">
        <DateRange :showTime="true" title="时间" @change="changeDate" ref="rg"/>
      </a-form-item>
      <a-form-item label="会员账号">
        <a-input v-model="init.query.userName" />
      </a-form-item>
      <a-form-item>
        <a-checkbox :checked="init.query.includeTryUser" @change="(e) => init.query.includeTryUser = e.target.checked">
          试玩用户
        </a-checkbox>
      </a-form-item>
      <a-form-item>
        <a-checkbox :checked="init.query.includeTestUser" @change="(e) => init.query.includeTestUser = e.target.checked">
          内测用户
        </a-checkbox>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" :loading="init.loading" @click="getList(true)">查询</a-button>
      </a-form-item>
    </a-form>
    <div class="page-under-table">
       <a-table 
          :key="table.key"
          class="mytable"
          bordered
          :loading="init.loading"
          :columns="table.columns" :dataSource="table.dataSource"
          :pagination="false"
          :rowKey="(e, i) => i"
          @change="changePagination2"
      >
        <template slot="businessType" slot-scope="text,record">
          {{ getTextById(dictionary.walletLogTypeFund, record.businessType) }}
        </template>
        <template slot="businessSubType" slot-scope="text,record">
          {{ getTextById(dictionary.walletLogSubType, record.businessSubType) }}
        </template>
       </a-table>
    </div>
    <div style="text-align:right;padding-top:20px;">
      <a-pagination ref="pagination" @change="changePagination"  :current="table.pagination.current" :defaultCurrent="table.pagination.current" :total="table.pagination.total" />
    </div>
  </section>
</template>
<script>
import Vue from 'vue'
import { Component, Lifecycle, InjectComponents} from 'vue-decorators'
import DateRange from "@/components/date-range/DateRange"
import moment  from "moment";
import { formatDate } from "@/util/date";

@Component({ dictionary: "walletLogSubType,walletLogTypeFund,walletLogTypeGame" })
@InjectComponents({ DateRange })
export default class Game extends Vue {
  table = {
    key: 1,
    columns: [
      { title: 'ID',  dataIndex: 'id'},
      { title: '会员账号', dataIndex: 'userName'}, 
      { title: '帐变类型', dataIndex: 'businessType', scopedSlots: { customRender: "businessType" }}, 
      { title: '帐变方式', dataIndex: 'businessSubType', scopedSlots: { customRender: "businessSubType" }}, 
      { title: '交易金额', dataIndex: 'transactionAmount'}, 
      { title: '当前余额', dataIndex: 'postBalance'},
      { title: '期初余额', dataIndex: 'preBalance'},
      { title: '交易时间',  dataIndex: 'createTime', sorter: true }
    ],
    dataSource: [],
    pagination: { total: 0, current: 1 }
  };

  init = {
    query: {
      pageNo: 1,
      pageSize: 10,
      queryTimeStart: "",
      queryTimeEnd: "",
      businessType: "",
      businessSubType: "",
      userName: "",
      sortList: [
        {
          sortField: "createTime",
          sortOrder: "desc"
        }
      ],
      includeTestUser: false,
      includeTryUser: false,
      lotteryId: "",
      lotteryCategoryId: "",
      // 帐变类型|0:全部帐变|1:游戏帐变|2:资金帐变
      walletLogType: "2"
    },
    loading: false,
    modalShow: false,
    lotteryCategory: [],
    gameCategory: [],
  }

  @Lifecycle mounted() {
    this.setInititalDate();
    this.getBussinessType();
    this.getAllLotteryList();
    this.getList();
  }

  getTextById(array, id) {
    return array.find(item => item.value == id)?.name;
  }

    // 设置初始化时间
  setInititalDate() {
    const d = new Date();
    // this.$refs.rg.setDateRangeValues(d);
    this.init.query.queryTimeStart = moment(d).format("YYYY-MM-DD 00:00:00");  
    this.init.query.queryTimeEnd = moment(d).format("YYYY-MM-DD 23:59:59");
  }

  changeDate(start, end, datestring, type) {
    if (type === "start") {
      this.init.query.queryTimeStart = datestring
    } else {
      this.init.query.queryTimeEnd = datestring
    }
  }

  // 排序
  changePagination2(current, filters, sorter) {
    // // 点击排序
    if (sorter.order) {
      switch(sorter.order) {
        case "ascend":
          this.init.query.sortList[0].sortField = sorter?.field;
          this.init.query.sortList[0].sortOrder = 'asc';
          break;
        case "descend":
          this.init.query.sortList[0].sortField = sorter?.field;
          this.init.query.sortList[0].sortOrder = 'desc';
          break;
      }
    } else {
      this.init.query.sortList[0].sortField = '';
      this.init.query.sortList[0].sortOrder = '';
    }
    this.getList(false, false);
  }

  changePagination(pagination) {
    this.table.pagination.current = pagination;
    this.init.query.pageNo = pagination;
    this.table.key = Math.random();
    // this.hidePageNumber();
    this.getList(false, false);
  }

  // 重置分页
  resetPagination() {
    this.table.pagination.current = 1;
    this.init.query.pageNo = 1;
    this.table.key = Math.random();
  }

  // 选择彩票列表
  changeLottery(value) {
    this.init.query.lotteryId = value[1] ? value[1] : "";
    this.init.query.lotteryCategoryId = this.init.gameCategory.find(item => item.value == value[0])?.value;
  }

  // 获取彩票列表
  async loadLotteryData(selectedOptions) {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;
    const res = await this.$service.fetch("/config-admin-api/lottery/queryAllLotteryByCategoryId", { id: targetOption.value });
    targetOption.loading = false;
    if (res.code === 1 && res.data instanceof Array) {
      targetOption.children = res.data.map(item => {
        return {
          value: item.id,
          label: item.lotteryName
        }
      });
      // targetOption.children.unshift({
      //   value: "",
      //   label: "全部"
      // });
      this.init.lotteryCategory = [...this.init.lotteryCategory];
    }
  }

  changeData(value) {
    this.init.query.businessType = this.init.gameCategory.find(item => item.value == value[0])?.extra;
    this.init.query.businessSubType = value[1] ? value[1] : "";
  }

  async loadData(selectedOptions) {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;
    const res = await this.$service.fetch("/lottery-admin-api/walletLog/queryAllBusinessSubType", { businessTypeId: targetOption.value });
    targetOption.loading = false;
    if (res.code === 1 && res.data instanceof Array) {
      targetOption.children = res.data.map(item => {
        return {
          value: item.value,
          label: item.name
        }
      });
      targetOption.children.unshift({
        value: "",
        label: "全部"
      });
      this.init.gameCategory = [...this.init.gameCategory];
    }
  }

  async getAllLotteryList() {
    const res = await this.$service.fetch("/config-admin-api/category/queryAllCategory");
    const result = [];
    if (res.code === 1 && res.data instanceof Array) {
       res.data.forEach(item => {
        result.push({
          value: item.id,
          label: item.categoryName,
          isLeaf: false
        });
      });
    }
    result.unshift({
      value: "",
      label: "全部"
    });
    this.init.lotteryCategory = result;
  }

  async getBussinessType() {
    const res = await this.$service.fetch("/lottery-admin-api/walletLog/queryAllBusinessType", { walletLogType: 1 });
    const result = [];
    if (res.code === 1 && res.data instanceof Array) {
      res.data.forEach(item => {
        result.push({
          value: item.id,
          label: item.name,
          extra: item.value,
          isLeaf: false
        });
      });
    }
    result.unshift({
      value: "",
      label: "全部"
    });
    this.init.gameCategory = result;
  }

  async getList(refresh, page=true) {
    if (refresh) this.resetPagination(); 
    const params = {};  
    for (let [key, value] of Object.entries(this.init.query)) {
      if (typeof value === "boolean") {
        value = value === true ? 1 : 0;
      }
      params[key] = value;
    }

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
      const d1 = new Date(this.init.query.queryTimeEnd.replace(/\-/g, '/')).getTime();
      const d2 = new Date(this.queryTimeEnd.replace(/\-/g, '/')).getTime();
      if (d1 < d2) {
        params.queryTimeEnd = this.init.query.queryTimeEnd
      } else {
        params.queryTimeEnd = this.queryTimeEnd;
      }
    }

    this.init.loading = true;
    const res = await this.$service.fetch('/lottery-admin-api/walletLog/queryPageWalletLog', params);
    this.init.loading = false;

    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.code === 1 &&  res.data?.records instanceof Array) {
      this.table.dataSource = res.data.records;
      this.table.pagination.total = res.data?.totalCount;
      this.hidePageNumber(res); 
    } else {
      this.table.dataSource = [];
      this.table.pagination.total = 0;
    }
  }

  /** 隐藏页码 */
  hidePageNumber(res){
    /** 判断如果当前分页大于10页就隐藏最后一页 */
  //   if((this.table.pagination.total/10)<=10)return;
  //   if(!+this.domTotal){
  //     setTimeout(()=>{
  //       this.domTotal=this.$refs.pagination.$el.querySelectorAll('.ant-pagination-next')[0].previousSibling.getAttribute('title');
  //       if(+this.domTotal > 10 && this.table.pagination.current<=2){
  //         this.$refs.pagination.$el.querySelectorAll('.ant-pagination-next')[0].previousSibling.style="display:none";
  //       }
  //     },500);
  //   }

  //   if(this.domTotal!=0){
  //     if(+this.domTotal > 10 && +this.domTotal - (+this.table.pagination.current)<=10)return this.$refs.pagination.$el.querySelectorAll('.ant-pagination-next')[0].previousSibling.removeAttribute('style');
  //     this.$refs.pagination.$el.querySelectorAll('.ant-pagination-next')[0].previousSibling.style="display:none";

  //     if(+this.domTotal > 10 && +this.table.pagination.current<=10)return this.$refs.pagination.$el.querySelectorAll('.ant-pagination-prev')[0].nextSibling.removeAttribute('style');
  //     this.$refs.pagination.$el.querySelectorAll('.ant-pagination-prev')[0].nextSibling.style="display:none";
  //   }
  // }
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
.myform /deep/ {
    .ant-form-item {
      margin-bottom: 2px;
    }
  }
 
.qr-range /deep/{
  .ant-form-item {
    margin-right: 0;
  }
}
</style>
