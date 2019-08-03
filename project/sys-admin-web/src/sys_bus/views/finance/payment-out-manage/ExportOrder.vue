<template>
  <div class="export-order">
      <div class="back-to-upper">
        <a-button @click="$emit('closeExportPage')" icon="rollback">返回上级</a-button>
      </div>  

      <div class="bank-item mt10">
        <a-button @click="bankId = item.itemKey;filterDataFunc(item.itemKey);" :type="`${bankId == item.itemKey ? 'primary' : 'default'}`" v-for="(item, index) in banks" :key="index">{{item.itemValue}}</a-button>
      </div>

      <div class="select-check-item">
        <ul>
          <li><a-checkbox :checked="bankType==='current'" @change="(e) => changeBankType(e, 'current')">本行</a-checkbox></li>
          <li><a-checkbox :checked="bankType==='other'" @change="(e) => changeBankType(e, 'other')">他行</a-checkbox></li>
        </ul> 
      </div>

      <div class="select-check-item">
        <ul class="amount">
          <li><a-checkbox  :checked="amountArea==='all'" @change="(e) => changeAmountArea(e, 'all')">全部</a-checkbox></li>
          <li class="item1"><a-checkbox  :checked="amountArea==='min'" @change="(e) => changeAmountArea(e, 'min')">小于5000</a-checkbox></li>
          <li class="item1"><a-checkbox  :checked="amountArea==='max'" @change="(e) => changeAmountArea(e, 'max')">大于等于5000</a-checkbox></li>
        </ul> 
      </div>

      <div class="mt10 total-wrapper">
        <ul class="nav-item-total">
          <li>选中数据</li>
          <li>提款金额：<span class="g-green bold">{{ calc.totalWithDrawAmount }}</span>元</li>
          <li>提款人数：<span class="g-yellow bold">{{ calc.totalPersonCount }}</span>人</li>
          <li>提款笔数：<span class="g-blue bold">{{ calc.totalWithDrawCount }}</span>笔</li>
        </ul>
        <a-button @click="exportFile" :loading="loading" type="primary">确认导出</a-button>
      </div>

      <a-table class="mytable mt10" 
        bordered 
        :rowKey="(e,i)=>i" 
        :columns="table.columns" 
        :dataSource="table.dataSource" 
        :pagination="false" 
      >
        <template slot="operation" slot-scope="text, record">
          <a-button @click="deleteData(record.id)" class="common-green-btn">删除</a-button>
        </template>
      </a-table>
  </div>
</template>

<script>
import Vue from "vue";
import { Component, InjectComponents, Lifecycle, Watch, State, Computed, Mutation, Prop } from "vue-decorators";

@Component
export default class ExportOrder extends Vue {
  // 从接口筛选出的数据
  @Prop({ type: Array, default: () => [] }) filterData;
  // 导出的数据类型, excel或者txt
  @Prop({ type: String }) exportType;

  table = {
    columns: [
      { title: "ID", dataIndex: "id" },
      { title: "收款账户", dataIndex: 'cardNo'},
      { title: "收款账户名称", dataIndex: 'realName'},
      { title: "收款网点联行号", dataIndex: 'bankCode'},
      { title: "交易金额", dataIndex: 'withdrawAmount'},
      { title: "绑卡银行", dataIndex: 'bankName'},
      { title: "操作", scopedSlots: { customRender: "operation" } },
    ],
    dataSource: []
  };

  calc = {
    totalWithDrawAmount: "0.00",
    totalPersonCount: 0,
    totalWithDrawCount: 0
  };

  banks = [];
  // 选择的银行id
  bankId = '';
  // 他行，本行
  bankType = 'other';
  // 金额类型 全部， 小于5000， 大于等于5000
  amountArea = 'all';
  loading = false;

  @Watch('filterData') changeData(news) {
    this.table.dataSource = news;
  }

  @Watch('table.dataSource', { immediate: true }) calcTotal(array) {
    if (!array instanceof Array) return
    let amountTotal = 0;
    array.forEach(({ withdrawAmount }) => {
      const amount = isNaN(withdrawAmount) ? 0 : withdrawAmount * 1;
      amountTotal += amount
    });

    this.calc.totalWithDrawAmount = amountTotal.toFixed(2);
    this.calc.totalPersonCount = array.length;
    this.calc.totalWithDrawCount = array.length;
  }

  @Watch('bankId') changeBankId(news) {
    this.filterDataFunc();
  }

  changeBankType(e, type) {
    if (e.target.checked) {
      this.bankType = type
    } else {
      this.bankType = '';
    }
    // 过滤数据
    this.filterDataFunc();
  }

  changeAmountArea(e, type) {
    if (e.target.checked) {
      this.amountArea = type
    } else {
      this.amountArea = '';
    }
    // 过滤数据
    this.filterDataFunc();
  }

  @Lifecycle async created() {
    this.table.dataSource = this.filterData.slice() || [];

    this.getItemId();
  }

  async getItemId() {
    const res = await this.$service.fetch('/config-admin-api/dictionaryItem/queryByGroupCode', {
      groupCode: this.exportType == 'txt' ? 'exportBankToTxt' : 'exportBankToExcel'
    });
    if (res.code === 1 && res.data instanceof Array && res.data.length > 0) {
      this.banks = res.data;
      this.bankId = res.data[0].itemKey;
    }
  }

  filterDataFunc() {
    // 是否过滤本行
    const isFilterCurrent = this.bankType === 'current';
    // 过滤金额
    let filterAmount = 0;
    if (this.amountArea === 'all') {
      filterAmount = 0;
    } else if (this.amountArea === 'max') {
      filterAmount = 5000;
    } else {
      filterAmount = 1; 
    }
    
    // 返回的结果集
    let result = [];
    // 过滤数据
    result = this.filterData.filter(item => {
      // 民生银行特殊处理 && item.bankName === '民生银行' 
      //return isFilterCurrent ? item.bankId == this.bankId  : item.bankId != this.bankId 
      if (this.bankId == 9) return true;
      return isFilterCurrent ? item.bankId == this.bankId : item.bankId != this.bankId;
    });

    if (filterAmount == 0) return this.table.dataSource = result;

    result = result.filter(item => {
      const amount = isNaN(item.withdrawAmount) ? 0 : item.withdrawAmount * 1;
      return filterAmount === 5000 ? amount >= 5000 : amount < 5000;
    });


    this.table.dataSource = result;
  }

  // 根据id删除对应的条目
  deleteData(id) {
    const currentIndex = this.table.dataSource.findIndex(item => item.id == id);

    // 删除该项
    this.table.dataSource.splice(currentIndex, 1);
  }

  // 导出excel功能
  async exportFile() {
    if (!await this.$confirm({title: '确认导出数据?'})) return;

    const requestUrl =  this.exportType === 'excel' ? '/lottery-admin-api/withdrawRecord/exportResultToExcelFile' : '/lottery-admin-api/withdrawRecord/exportResultToTxtFile';
    // 导出是要传的id
    const orderIds = this.table.dataSource.map(item => {
      return item.id
    });
    
    // 防止一直点击
    // this.loading = true;
    // await this.$tools.delay(200);
    // this.loading = false;

    const params =  {
      bankId: this.bankId,
      bankType: this.bankType == 'current' ? 0 : 1,
      ids: orderIds.join(','),
      token: this.token,
      platformId: this.platformId,
      clientType: 3
    };

    let paramString =  '';

    for (let [key, value] of Object.entries(params)) {
      paramString += `${key}=${value}&`;
    }

    if (paramString === "") return this.$message.error("无导出数据");

    // 拼接url
    let href = `${requestUrl}?${paramString}`;
    // 去掉尾部的&
    href = href.substring(0, href.length - 1);
    console.log(href);

    const elem = document.createElement('a');
    elem.href = href;
    elem.download = '导出数据';
    document.body.appendChild(elem);
    elem.click();
    setTimeout(() => { document.body.removeChild(elem); }, 50);
  }

}

</script>

<style lang="scss" scoped>
.export-order {
  background-color: #fff;
  min-height: 100%;
}
/deep/ .bank-item {
  button {
    margin-right: 10px;
  }
}
.select-check-item ul{
  display: flex;
  margin-top: 10px;
  li {
    width: 88px;
    height: 32px;
    margin-right: 10px;
    text-align: center;
    line-height: 32px;
    border: 1px solid #d9d9d9;
  }

  &.amount {
   li {
     &.item1 {
       width: 136px;
     }
   }
  }
}

.total-wrapper {
  display: flex;

   .nav-item-total {
    display: flex;
    border-top: 1px solid #999;
    border-left: 1px solid #999;
    margin-right: 20px;
    li {
      border-bottom: 1px solid #999;
      border-right: 1px solid #999;
      padding: 8px 16px;
      line-height: 1;
      span {
        margin-right: 5px;
      }
      &:first-child {
        background-color: #d1d1d1;
      }
    }
  }
}
</style>