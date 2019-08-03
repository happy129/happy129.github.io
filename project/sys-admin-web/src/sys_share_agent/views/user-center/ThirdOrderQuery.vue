<template>
  <div class="crown-wrapper">
    <div class="platforms">
      <a-button :type="`${init.selected == 'AG' ? 'primary': 'default'}`" @click="init.selected = 'AG'">AG视讯</a-button>&nbsp;
      <a-button :type="`${init.selected == 'KY' ? 'primary': 'default'}`" @click="init.selected = 'KY'">开元棋牌</a-button>&nbsp;
      <a-button :type="`${init.selected == 'TH' ? 'primary': 'default'}`" @click="init.selected = 'TH'">天合棋牌</a-button>
    </div>
    <a-form layout="inline" class="query-form" :form="vform" @submit.prevent="getList(true)">
      <div class="query-item-1">
        <div class="quick-picker">
          <DateRange title="投注时间" ref="rg" @change="changeDate"/>
        </div>
        <div class="quick-select-area">
          <span>快捷选时：</span><DateSwitch @changeTab="changeQuickTime" className="btn-1"/>
        </div>
      </div>
      <div class="query-item-1">
        <a-form-item label="游戏类型">
          <a-select v-if="init.selected == 'AG'" v-decorator="['gameTypeCode']" style="width:120px;">
             <a-select-option value="">全部</a-select-option>
             <a-select-option v-for="(item, index) in dictionary.agGameCategory" :key="index" :value="item.value">{{item.name}}</a-select-option>
          </a-select>
          <a-select v-else v-decorator="['kindId']" style="width:120px;">
            <a-select-option value="">全部</a-select-option>
            <template v-if="init.selected == 'KY'">
              <a-select-option  v-for="(item, index) in dictionary.kyGameTypeList" :key="index" :value="item.value">{{item.name}}</a-select-option>
            </template>
            <template v-else>
              <a-select-option v-for="(item, index) in dictionary.thGameTypeList" :key="index" :value="item.value">{{item.name}}</a-select-option>
            </template>
          </a-select>
        </a-form-item>
        <a-form-item label="游戏局号">
          <a-input v-decorator="['gameId']"/>
        </a-form-item>
        <a-form-item label="用户名">
          <a-input v-decorator="['userName']"/>
        </a-form-item>
        <a-form-item>
          <a-button :loading="init.loading" html-type="submit" type="primary">查询</a-button>
        </a-form-item>
      </div>
    </a-form>



     <a-table 
       v-if=" init.selected == 'AG'"
       class="mytable mt10" bordered 
       :loading="init.loading" :columns="table.columns" :rowKey="(e, i) => i" 
       :dataSource="table.dataSource" :pagination="table.pagination" @change="changePagination">
       <template slot="betResult" slot-scope="text, record">
          <p>庄：{{ record.bankerPoint }}</p>
          <p>闲：{{ record.playerPoint }}</p>
       </template>
    </a-table>


     <a-table 
       v-else
       class="mytable mt10" bordered 
       :loading="init.loading" :columns="table.columns1" :rowKey="(e, i) => i" 
       :dataSource="table.dataSource" :pagination="table.pagination" @change="changePagination">
       <template slot="playTypeName"> <p>桌号</p> <p>椅子号</p> </template>
       <template slot="gameName">
         {{ init.selected == 'KY' ?  '开元' : '天合' }}账号
       </template>
       <template slot="playNameData" slot-scope="t, record">
         <p>{{ record.tableId }}</p>
         <p>{{ record.chairId }}</p>
       </template>
       <template slot="accounts" slot-scope="t, record">
         {{ record.accounts }}
       </template>
    </a-table>

  </div>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, Watch } from "vue-decorators";
import DateRange from "@/components/date-range/DateRange";
import { DateSwitch } from "@/components/switch"

@Component({ formOptions: "id", dictionary: 'kyGameTypeList,thGameTypeList,agGameCategory' })
@InjectComponents({ DateRange, DateSwitch })
export default class LotteryQuery extends Vue {
  table = {
    key: 1,
    // AG
    columns: [
      { title: "订单号", dataIndex: "orderId" },
      { title: "游戏局号", dataIndex: "gameCode" },
      { title: "用户名", dataIndex: "userName" },
      { title: "游戏类型", dataIndex: "gameTypeName" },
      { title: "桌号", dataIndex: "tableCode" },
      { title: "下注内容", dataIndex: "playTypeName" },
      { title: "结果", scopedSlots: { customRender: 'betResult' } },
      { title: "投注金额", dataIndex: "totalBetAmount", sorter: true },
      { title: "有效投注", dataIndex: "validBetAmount", sorter: true}, 
      { title: "中奖", dataIndex: "getProfit"},
      { title: "用户盈亏", dataIndex: "profit", sorter: true },
      { title: "订单状态", dataIndex: "status"},
      { title: "投注时间", dataIndex: "betTime", sorter: true}
    ],
    // 棋牌
    columns1: [
      { title: "游戏局号", dataIndex: "gameId" },
      { title: "用户名", dataIndex: "userName" },
      { scopedSlots: { title: 'gameName', customRender: "accounts" }},
      { title: "游戏类型", dataIndex: "kindName" },
      { title: "房间类型", dataIndex: "roomName" },
      { scopedSlots: { title: 'playTypeName',   customRender: 'playNameData'} },
      { title: "玩家数量", dataIndex: 'playerCount' },
      { title: "投注金额", dataIndex: "totalBetAmount" , sorter: true},
      { title: "有效投注", dataIndex: "validBetAmount", sorter: true },
      { title: "用户盈亏", dataIndex: "profit", sorter: true },
      { title: "抽水", dataIndex: "revenue" },
      { title: "游戏开始时间", dataIndex: "gameStartTime", sorter: true},
      { title: "游戏结束时间", dataIndex: "gameEndTime", sorter: true}
    ],

    dataSource: [],
    pagination: { total: 0, current: 1}
  };

  init = {
    loading: false,
    selected: 'AG',
    query: { pageNo: 1, pageSize: 10, startTime: "",  endTime: "",  sortList: []}
  };

  @Lifecycle mounted() {
    this.vform.setValue('gameTypeCode', '');
    this.vform.setValue('kindId', '');
  }

  @Watch('init.selected') changeGameType() {
    this.vform.setValue('gameTypeCode', '');
    this.vform.setValue('kindId', '');
    this.getList(true);
  }

  changeDate(start, end, datestring, type) {
    if (type === "start") {
      this.init.query.startTime = datestring
    } else {
      this.init.query.endTime = datestring
    }
  }

  changePagination(pagination, filters, sorter) {
    this.table.pagination.current = pagination.current;
    this.init.query.pageNo = pagination.current;

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
        sortParams.sortField = "totalBetAmount";
        sortParams.sortOrder = "desc"
      }

    // 设定排序
    this.init.query.sortList[0] = sortParams;

    this.getList(false, false);
  }

  changeQuickTime(startTime, endTime) {
    this.init.query.startTime = startTime;
    this.init.query.endTime = endTime;
    this.$refs.rg.setDateRangeValues(startTime, endTime);
  }

  resetPagination() {
    this.table.pagination.current = 1;
    this.init.query.pageNo = 1;
  }

  async getList(refresh, pagination=true) {
    if (refresh) this.resetPagination(); 

    if (this.init.query.sortList.length === 0) {
      this.init.query.sortList.push({
         sortField: "totalBetAmount",
         sortOrder: "asc"
      });
    }

    const form = await this.vform.validate();
    if (form.errors) return
    const params = this.$trimValues(form.values);
    const values = Object.assign(this.init.query, params);


    let requestUrl = '';
    if (this.init.selected === 'AG') {
      requestUrl = '/lottery-api/thirdAgOrder/queryPageThirdAgOrderForAgent'
    } else if (this.init.selected === 'KY') {
      requestUrl = '/lottery-api/thirdKyOrder/queryPageThirdKyOrderForAgent'
    } else {
      requestUrl = '/lottery-api/thirdThOrder/queryPageThirdThOrderForAgent'
    }

    await this.$tools.delay(150);

    this.init.loading = true;
    const res = await this.$service.fetch(requestUrl, values);
    this.init.loading = false;

    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.code === 1 &&  res.data?.records instanceof Array) {
      this.table.dataSource = res.data.records;
      this.table.pagination.total = res.data?.totalCount;
    } else {
      this.table.dataSource = [];
      this.table.pagination.total = 0;
    }

    if (pagination) {
      this.getSummary(values);
    }
  }

  async getSummary(params) {
    
    let requestUrl = "";

    if (this.init.selected === 'AG') {
      requestUrl = '/lottery-api/thirdAgOrder/queryThirdAgOrderForAgentSummary'
    } else if (this.init.selected === 'KY') {
      requestUrl = '/lottery-api/thirdKyOrder/queryThirdKyOrderForAgentSummary'
    } else {
      requestUrl = '/lottery-api/thirdThOrder/queryThirdThOrderForAgentSummary'
    }

    const res = await this.$service.fetch(requestUrl, params);
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.summary = res.data;
  }

}
</script>

<style lang="scss" scoped>
.crown-wrapper {
    background-color: #fff;
    height: 100%;
    padding: 10px;
    overflow-y: auto;
    box-sizing: border-box;
}
.query-item-1 /deep/{
  display: flex;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #dcdcdc;
  padding-top: 10px;

  .quick-select-area {
    display: flex;
    align-items: center;
    margin-left: 10px;
    
    .btn-1 {
      button {
        padding: 6px 12px;
      }
    }
  }
}

/deep/ .quick-picker {
  .ant-form-item {
    margin-right: 0;
  }
}

/deep/ .user-name {
  label {
    width: 68px;
    display: inline-block;
  }
}

.platforms {
  border-bottom: 1px solid #e7e7e7;
  padding-bottom: 10px;
}
</style>