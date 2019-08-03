<template>
  <div class="open-no">
     <a-form class="myform" layout="inline" :form="vform0" @submit.prevent="getList(true)">
      <a-form-item class="mr10" label="彩种">  
        <a-select class="sSelect" style="width:140px" v-decorator="['lotteryId']" :dropdownMatchSelectWidth="false">
          <a-select-option value="">选择彩种</a-select-option>
          <a-select-option v-for="(item, index) in dsstore.queryAllLottery" :key="index" :value="item.id">{{item.lotteryName}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item class="mr10" label="开奖期号">
        <a-input v-decorator="['issueNo']"/>
      </a-form-item>
      <a-form-item class="mr10" label="状态">
        <a-select style="width:100px" v-decorator="['fixStatus']">
          <a-select-option value="">全部</a-select-option>
          <a-select-option v-for="(item, index) in dictionary.fixStatus" :key="index" :value="item.value">{{item.name}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item class="mr10" label="处理人">
        <a-input v-decorator="['fixAdminName']"/>
      </a-form-item>
      <a-form-item class="qr-range mr10">
        <DateRange title="处理时间" @change="changeDate" ref="rg"/>
      </a-form-item>
      <a-form-item class="qr-range mr10">
        <a-button type='primary' html-type="submit" :loading="init.loading">查询</a-button>
      </a-form-item>
      <a-form-item class="qr-range mr10" v-permission="10035">
        <a-button @click="init.modalShow = true">手动补开</a-button>
      </a-form-item>
     </a-form>  

     <div class="page-under-table">
        <a-table class="mytable" 
          bordered 
          :loading="init.loading" 
          :rowKey="(e,i) => i" 
          :columns="table.columns" 
          :dataSource="table.dataSource" 
          :pagination="table.pagination" 
          @change="changePagination">
          <template slot="fixStatus" slot-scope="text, record">
            <p>{{$getText(record.fixStatus, dictionary.fixStatus)}}</p>
          </template>
        </a-table>
     </div>

    <a-modal title="新增开奖号码" v-model="init.modalShow" :footer="null" :destroyOnClose="true" :maskClosable="false">
      <a-form class="modal-form" :form="vform1" @submit.prevent="submit">
        <a-form-item label="彩种" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-select class="sSelect" v-decorator="['lotteryId', { rules: [{ required: true, message: '请选择彩种' }] }]" :dropdownMatchSelectWidth="false">
            <a-select-option value="">选择彩种</a-select-option>
            <a-select-option v-for="(item, index) in dsstore.queryAllLottery" :key="index" :value="item.id">{{item.lotteryName}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="期号" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-input v-decorator="['issueNo', { rules: [{ required: true, message: '请输入期号' }] }]"/>
        </a-form-item>
        <a-form-item>
          <a-row>
           <a-col :offset="5" :span="18">
             <p class="g-red order-no-text">提示:</p>
             <p class="g-red order-no-text">1、已存在号码的彩种期数才可以补开，补开仅对未开奖期号、注单生效；</p>
             <p class="g-red order-no-text">2、手动补开是主系彩种（快乐8）时，自动补开所有的衍生彩种；</p>
           </a-col>
         </a-row>
        </a-form-item>
        <a-form-item>
          <a-row>
           <a-col :offset="5" :span="18">
             <a-button type="primary" html-type="submit" :loading="init.modalLoading">确认补开</a-button>&nbsp;
             <a-button @click="init.modalShow=false">取消</a-button>
           </a-col>
         </a-row>
        </a-form-item>
      </a-form>
    </a-modal>  

     <a-modal title="确认手动补开" v-model="confirmModal" :confirmLoading="confirmLoading" @ok="confirmAdd" :destroyOnClose="true" :maskClosable="false">
       <p>
         <strong>彩种：</strong>
         <span>{{lotteryName}}</span>
       </p>
       <p class="mt10">
         <strong>期数：</strong>
         <span>{{period}}</span>
       </p>
       <p class="mt10">
         <strong>开奖号码：</strong>
         <span>{{openNumber}}</span>
       </p>
       <p class="mt10">
         <strong>关联衍生彩种:</strong>
         <span>{{relationLottery}}</span>
       </p>
    </a-modal>

  </div>
</template>
<script>
import Vue from 'vue'
import { Component, InjectComponents, Prop, Watch, Lifecycle, Computed, Filter, State, Action, Getter, Mutation } from 'vue-decorators';
import DateRange from "@/components/date-range/DateRange"

const dictionary = 'fixStatus';
const dsstore = {
  queryAllLottery: { url: '/config-admin-api/lottery/queryAllLottery' }
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
      { title: "彩种", dataIndex: "lotteryName"},
      { title: "期号", dataIndex: "issueNo"},
      { title: "开奖号码", dataIndex: "openNumber"},
      { title: "处理人", dataIndex: "addAdminName"},
      { title: "处理时间", dataIndex: "fixTime"},
      { title: "状态", scopedSlots: { customRender: "fixStatus" }}
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

  // 确认弹窗提示
  confirmModal = false;
  lotteryName = "";
  period = "";
  openNumber = "";
  relationLottery = "";
  confirmLoading = false;

  @Lifecycle mounted() {
    this.setInitialSelected();
    this.getList();
  }

  setInitialSelected() {
    this.vform0.setValue('lotteryId', '');
    this.vform0.setValue('fixStatus', '');
    this.vform1.setValue('lotteryId', '');
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

  async confirmAdd() {
    const form = await this.vform1.validate();
    if (form.errors) return;
    const values = this.$trimValues(form.values); 
    this.confirmLoading = true;
    const res = await this.$service.fetch('/config-admin-api/manualOpenNumber/fixManualOpenNumber', values);
    this.confirmLoading = false;
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.confirmModal = false;
    this.init.modalShow = false;
    this.getList(true);
  }

  async submit() {
    const form = await this.vform1.validate();
    if (form.errors) return;
    const values = this.$trimValues(form.values); 
    const confrimData = await this.$service.fetch("/config-admin-api/manualOpenNumber/fixConfirm", values);
    if (confrimData.code !== 1)  return confrimData.message && this.$message.error(confrimData.message);
    if (confrimData.code === 1) {
      this.lotteryName = confrimData.data?.lotteryName;
      this.period = confrimData.data?.issueNo;
      this.openNumber = confrimData.data?.openNumber;
      this.relationLottery = confrimData.data?.childLotteryNames;
      this.confirmModal = true;
    }    
  }

  async getList(refresh) {
    if (refresh) this.resetPagination();
    const form = await this.vform0.validate();
    const params = this.$trimValues(form.values);
    this.init.loading = true;
    const res = await this.$service.fetch('/config-admin-api/manualOpenNumber/queryPageFixManualOpenNumber', Object.assign(this.init.query, params));
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