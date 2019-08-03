<template>
  <div class="open-no">
     <a-form class="myform" layout="inline" :form="vform0" @submit.prevent="getList(true)">
      <a-form-item class="mr10" label="彩种">  
        <a-select class="sSelect" style="width:160px" v-decorator="['lotteryId']" :dropdownMatchSelectWidth="false">
          <a-select-option value="">选择彩种</a-select-option>
          <a-select-option v-for="(item, index) in dsstore.queryAllLottery" :key="index" :value="item.id">{{item.lotteryName}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item class="mr10" label="撤销类型">
        <a-select v-decorator="['cancelType']" :dropdownMatchSelectWidth="false">
          <a-select-option value="">全部</a-select-option>
          <a-select-option v-for="(item, index) in dictionary.cancelOpenType" :key="index" :value="item.value">{{item.name}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item class="mr10" label="期号">
          <a-input v-decorator="['issueNo']"/>
      </a-form-item>
      <a-form-item class="mr10" label="处理人">
          <a-input v-decorator="['adminName']"/>
      </a-form-item>
      <a-form-item class="qr-range mr10">
          <DateRange title="处理时间" @change="changeDate" ref="rg"/>
      </a-form-item>
      <a-form-item class="qr-range mr10">
        <a-button type='primary' html-type="submit" :loading="init.loading">查询</a-button>
      </a-form-item>
     </a-form>  

     <div class="mt10 page-under-table" v-permission="10037">
      <a-button type="primary" @click="init.modalShow = true; cancelType = 1">撤销整期</a-button> &nbsp;
      <a-button type="primary" @click="init.modalShow = true; cancelType = 2">撤销注单</a-button>
     </div>

     <div class="mt10">
        <a-table class="mytable" 
          bordered 
          :loading="init.loading" 
          :rowKey="(e,i) => i" 
          :columns="table.columns" 
          :dataSource="table.dataSource" 
          :pagination="table.pagination" 
          @change="changePagination">
          <template slot="cancelType" slot-scope="text,record">
            {{$getText(record.cancelType, dictionary.cancelOpenType)}}
          </template>
          <template slot="cancelStatus" slot-scope="text,record">
            {{$getText(record.cancelStatus, dictionary.cancelOpenStatus)}}
          </template>
        </a-table>
     </div>

    <a-modal :title="`${ cancelType == 1 ? '撤销整期' : '撤销注单'}`" v-model="init.modalShow" :footer="null" :destroyOnClose="true" :maskClosable="false">
      <a-form class="modal-form" :form="vform1" @submit.prevent="submit">
        <a-form-item v-if="cancelType == 1" label="彩种" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-select class="sSelect" v-decorator="['lotteryId', { rules: [{ required: true, message: '请选择彩种' }] }]" :dropdownMatchSelectWidth="false">
            <a-select-option value="">选择彩种</a-select-option>
            <a-select-option v-for="(item, index) in dsstore.queryAllLottery" :key="index" :value="item.id">{{item.lotteryName}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="平台"  v-if="cancelType == 2" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-select class="sSelect" v-decorator="['platformId', { rules: [{ required: true, message: '请选择彩种' }] }]" :dropdownMatchSelectWidth="false">
            <a-select-option value="">选择彩种</a-select-option>
            <a-select-option v-for="(item, index) in dsstore.queryAllPlatform" :key="index" :value="item.id">{{item.platformName}}</a-select-option>
          </a-select>
        </a-form-item>
        <!-- <a-form-item label="选项" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-radio-group @change="changeType" v-decorator="['cancelType', { rules: [{ required: true, message: '请选择撤销类型' }] }]">
            <a-radio value="1">撤销整期</a-radio>
            <a-radio value="2">撤销注单</a-radio>
          </a-radio-group>
        </a-form-item> -->
        <a-form-item v-if="cancelType == 1" label="期号" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-input v-decorator="['issueNo', { rules: [{ required: true, message: '请输入期号' }] }]"/>
        </a-form-item>
        <a-form-item v-else label="注单号" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-textarea :rows="4" v-decorator="['orderNoList']" placeholder="输入注单号，多个以','号隔开"/>
        </a-form-item>
        <a-form-item>
          <a-row>
           <a-col :offset="5" :span="18">
             <p class="g-red order-no-text">提示:</p>
             <p class="g-red order-no-text">1、彩种期数下的所有已开奖注单恢复至未开奖状态，且需扣除已派发给用户的奖金；</p>
             <p class="g-red order-no-text">2、撤销整期是主系彩种（快乐8）时，自动撤销所有的衍生彩种开奖；</p>
           </a-col>
         </a-row>
        </a-form-item>
        <a-form-item>
          <a-row>
           <a-col :offset="5" :span="18">
             <a-button type="primary" html-type="submit" :loading="init.modalLoading">确认撤销</a-button>&nbsp;
             <a-button @click="init.modalShow=false">取消</a-button>
           </a-col>
         </a-row>
        </a-form-item>
      </a-form>
    </a-modal>  

  </div>
</template>
<script>
import Vue from 'vue'
import { Component, InjectComponents, Prop, Watch, Lifecycle, Computed, Filter, State, Action, Getter, Mutation, InjectComponent } from 'vue-decorators';
import DateRange from "@/components/date-range/DateRange"

const dictionary = 'cancelOpenType,cancelOpenStatus';
const dsstore = {
  queryAllLottery: { url: '/config-admin-api/lottery/queryAllLottery' },
  queryAllPlatform: { url: '/config-admin-api/platform/queryAllPlatform' }
}

@Component({ dictionary, dsstore, formOptions: {
  vform0: "id",
  vform1: "ids"
}})
@InjectComponents({ DateRange })
export default class OpennosNew extends Vue {

  table = {
    key: 1,
    columns: [
      { title: "ID", dataIndex: "id"},
      { title: "撤销类型", scopedSlots: { customRender: "cancelType" }},
      { title: "彩种", dataIndex: "lotteryName"},
      { title: "期号", dataIndex: "issueNo"},
      { title: "注单号", dataIndex: "orderNoList"},
      { title: "处理人", dataIndex: "adminName"},
      { title: "处理时间", dataIndex: "createTime"},
      { title: "状态", scopedSlots: { customRender: "cancelStatus" }}
    ],
    selectedRowKeys: [],
    rowSelection: {
      onChange: (selectedRowKeys, selectedRows) => {
        this.table.selectedRowKeys = selectedRows.map(e => e.id);
      },
    },
    dataSource: [],
    pagination: { total: 0, current: 1, pageSize: 10 }
  }

  cancelType = 1;

  init = {
    loading: false,
    modalShow: false,
    modalLoading: false,
    query: {
      pageNo: 1,
      pageSize: 10,
      startTime: "",
      endTime: ""
    }
  }

  @Lifecycle mounted() {
    this.setInitialSelected();
    this.getList();
  }

  setInitialSelected() {
    this.vform0.setValue('lotteryId', '');
    this.vform0.setValue('cancelType', '');
    this.vform1.setValue('lotteryId', '');
    this.vform1.setValue('cancelType', '1');
  }

  changeType(e) {
    this.cancelType = e.target.value; 
  }

  changeDate(startTime, endTime, datestring, type) {
    if (type === "start") {
      this.init.query.startTime = datestring
    } else {
      this.init.query.endTime = datestring
    }
  }

  changePagination(pagination) {
    this.table.pagination.current = pagination.current;
    this.init.query.pageNo = pagination.current;
    this.getList();
  }

  resetPagination() {
    this.table.pagination.current = 1;
    this.init.query.pageNo = 1;
  }

  async submit() {
    const form = await this.vform1.validate();
    const values = this.$trimValues(form.values); 
    // cancelType = 1, 撤销整期 cancelType = 2 根据主单号撤销
    const requestUrl = this.cancelType == 1 ? '/config-admin-api/cancelOpenRecord/cancelOpenByIssue' : '/config-admin-api/cancelOpenRecord/cancelOpenByOrderNo';

    this.init.modalLoading = true;
    const res = await this.$service.fetch(requestUrl, values);
    this.init.modalLoading = false;
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.init.modalShow = false;
    this.getList(true);
  }

  async getList(refresh) {
    if (refresh) this.resetPagination();
    const form = await this.vform0.validate();
    const params = this.$trimValues(form.values);
    this.init.loading = true;
    const res = await this.$service.fetch('/config-admin-api/cancelOpenRecord/queryPageCancelOpenRecord', Object.assign(this.init.query, params));
    this.init.loading = false;
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data?.records instanceof Array) {
      this.table.dataSource = res.data?.records;
      this.table.pagination.total = res.data.totalCount;
      this.table.pagination.pageSize = res.data.pageSize;
    } else {
      this.table.dataSource = [];
      this.table.pagination.pageSize = 1;
    }
  }
}
</script>

<style lang="scss" scoped>
.open-no /deep/ {
  .myform {
    .ant-form-item {
      margin-right: 0;
      &.mr10 {
        margin-right: 10px;
      }
    }
  }
}

.modal-form /deep/ {
  .ant-form-item {
    margin-bottom: 10px;
  }
}

.order-no-text {
  font-size: 13px;
  line-height: 1.2;
  margin-bottom: 5px;
}
 
</style>