<template>

  <div class="member-report-container">
    <div class="member-date-switch">
      <DateSwitch class="date-switch-item" @changeTab="changeTable"/>
    </div>

    <a-form :form="vform" class="mt10"  @submit.prevent="getList(true)" layout="inline">
      <a-form-item class="bet-time" label="投注时间">
        <DateRange title='' :defaultDate="true" @current="current" ref="rg" @change="changeDate"/>
      </a-form-item>
      <a-form-item label="会员账号">
        <a-input v-decorator="['userName']"/>
      </a-form-item>
      <a-form-item>
        <a-button :loading="init.loading" html-type="submit" type="primary">查询</a-button>
      </a-form-item>
    </a-form>

    <a-table class="mytable mt10" 
      bordered 
      :loading="init.loading" 
      :rowKey="(e, i) => i"  
      :columns="table.columns" 
      :dataSource="table.dataSource" 
      :pagination="false"
      @change="changeTabSort">

      <template slot="index" slot-scope="text, record, item">
        {{ parseInt(item) + 1  * parseInt(init.query.pageNo - 1) * parseInt(init.query.pageSize) + 1 }}
      </template>
    </a-table>

    <div style="text-align:right;padding-top:20px;">
      <a-pagination ref="pagination" @change="changePagination"  :current="table.pagination.current" :defaultCurrent="table.pagination.current" :total="table.pagination.total" />
    </div>

  </div>

</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents, Lifecycle } from 'vue-decorators'
import { TabSwitch, DateSwitch } from "@/components/switch";
import DateRange from "@/components/date-range/DateRange";
import { formatDate } from "@/util/date";

@Component({ formOptions: 'id' })
@InjectComponents({ DateSwitch, DateRange })
export default class MemberAccountChange extends Vue {
  table = {
    columns: [
      { title: "排行", scopedSlots: { customRender: "index" }  },
      { title: "会员账号", dataIndex: "userName" },
      { title: "余额", dataIndex: "balance", sorter: true  },
      { title: "用户出入盈亏", dataIndex: "totalIncomeAmount", sorter: true  },
      { title: "充值金额", dataIndex: "totalRechargeAmount", sorter: true  },
      { title: "提现金额", dataIndex: "totalWithdrawAmount", sorter: true  },
      { title: "礼金", dataIndex: "totalCashgiftAmount", sorter: true }
    ],
    dataSource: [],
    pagination: { total: 0, current: 1 }
  };

  init = {
    loading: false,
    query: { pageNo: 1, pageSize: 10, startTime: "", endTime: "", sortList: []}
  }

  @Lifecycle mounted() {
    this.getList();
  }

  changeTable(startTime, endTime) {
    this.init.query.startTime = startTime;
    this.init.query.endTime = endTime;
    this.$refs.rg.setDateRangeValues(startTime, endTime);
  }

  changePagination(pagination) {
    this.table.pagination.current = pagination;
    this.init.query.pageNo = pagination;
    this.getList(false, false);
  }

  changeTabSort(pagination, filters, sorter) {
    // this.table.pagination.current = pagination.current;
    // this.init.query.pageNo = pagination.current;

    const sortParams = {
      sortField: "",
      sortOrder: ""
    };

    // 点击排序
     if (sorter.order) {
      switch(sorter.order) {
        case "ascend":
            sortParams.sortField = sorter.field;
            sortParams.sortOrder = "asc"
          break;
        case "descend":
            sortParams.sortField = sorter.field;
            sortParams.sortOrder = "desc"
          break;
      }
    } else {
      sortParams.sortField = "balance";
      sortParams.sortOrder = "desc"
    }
    
    // 设定排序
    this.init.query.sortList[0] = sortParams;

    this.getList(false, false);
  }

  changeDate(start, end, datestring, type) {
    if (type === "start") {
      this.init.query.startTime = datestring
    } else {
      this.init.query.endTime = datestring
    }
  }

  resetPagination() {
    this.table.pagination.current = 1;
    this.init.query.pageNo = 1;
  }

  changeOrderType(type) {
    this.init.query.sortList = [{
      sortField: type,
      sortOrder: "desc"
    }];
  }

  current(start, end) {
    this.init.query.startTime = start;
    this.init.query.endTime = end;
  }

  endTime = ""; 

  async getList(refresh,  page=true) {
    if (refresh) this.resetPagination(); 

    if (this.init.query.sortList.length === 0) {
      this.init.query.sortList.push({
        sortField: "totalRechargeAmount",
        sortOrder: "desc"
      });
    }

    const form = await this.vform.validate();
    const values = this.$trimValues(form.values);
    const params = Object.assign(this.init.query, values);


    if (page) {
      // 如果结束时间大于当前时间，设置为当前时间
      if (params.endTime) {
        const d = new Date(params.endTime.replace(/\-/g, '/')).getTime();
        const now = Date.now();
        if (d > now) {
          params.endTime = formatDate(new Date());
          // 缓存数据
          this.endTime = params.endTime;
        }
      }
    } else {
      const d1 = new Date(this.init.query.endTime.replace(/\-/g, '/')).getTime();
      const d2 = new Date(this.endTime.replace(/\-/g, '/')).getTime();
      if (d1 < d2) {
        params.endTime = this.init.query.endTime
      } else {
        params.endTime = this.endTime;
      }
    }

    this.init.loading = true;
    const res = await this.$service.fetch('/lottery-admin-api/user/outInAccounts', params);
    this.init.loading = false;

    if (res.code !== 1) {
      this.table.dataSource = [];
      this.table.pagination.total = 0;
      return res.message && this.$message.error(res.message);
    }
    if (res.code === 1 &&  res.data?.records instanceof Array) {
      this.table.dataSource = res.data.records;
      this.table.pagination.total = res.data?.totalCount;
      this.hidePageNumber(res);
    } else {
      this.table.dataSource = [];
      this.table.pagination.total = 0;
    }
  }

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

}
</script>


<style lang="scss" scoped>
/deep/ .date-switch-item {
  li {
    button {
      padding: 6px 12px !important;
    }
  }
}

/deep/ .bet-time {
  .ant-form-item {
    margin-right: 0;
  }
}

.member-order-list {
  margin-top: 20px;
  ul {
    border-bottom: 1px solid #e7e7e7;
    display: flex;
    width: 100%;
    flex-wrap: wrap;

    li {
      padding: 2px 10px;
      font-size: 13px;
      cursor: pointer;
      &.active {
        background-color: #009688;
        color: #fff;
      }
    }
  }
}
</style>