<template>
  <div class="crown-wrapper">
    <div class="line-code-form">
        <a-form layout="inline" :form="vform1" @submit.prevent="getList(true)">
          <div class="date-select">
              <div class="select-timer-area">
                <span>快捷选时：</span><DateSwitch @changeTab="changeQuickTime" className="btn-1"/>
              </div>
          </div>
          <a-form-item class="picker-area">
            <DateRange title="统计时间" :defaultDate="true" ref="rg" @change="changeDate"/>
          </a-form-item>
          <a-form-item label="状态">
            <a-select v-decorator="['given']">
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="0">未赠送</a-select-option>
              <a-select-option value="1">已赠送</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="用户ID">
            <a-input v-number v-decorator="['userId']"/>
          </a-form-item>
          <a-form-item label="用户名">
            <a-input  v-decorator="['userName']"/>
          </a-form-item>
          <a-form-item>
            <a-button type="primary"  html-type="submit" :loading="init.loading">查询</a-button>
          </a-form-item>
        </a-form>
    </div>
     <a-table 
      class="mytable mt10" 
      bordered 
      :loading="init.loading"
      :columns="table.columns" 
      :rowKey="(e, i) => i" 
      :dataSource="table.dataSource" 
      :pagination="table.pagination"  
      @change="changePagination"> 
        <template slot="isGiven" slot-scope="text, record">
          {{ record.isGiven ? '已赠送' : '未赠送'}}
        </template>
        <template slot="type" slot-scope="text, record">
          {{ record.type == 0 ? '金币' : '其他' }}
        </template>
        <template slot="operation" slot-scope="text,record">
          <a-button v-permission="20368"  v-if="record.isGiven != 1" class="common-green-btn" @click="showRecord(record, 1)" size="small">记录</a-button>
          <a-button v-permission="20368"  v-if="record.isGiven == 1" class="common-yellow-btn" @click="showRecord(record, 2)" size="small">详情</a-button>
        </template>
      </a-table>

    <a-modal title="赠送" v-model="init.showModal" :footer="null" :destroyOnClose="true" :maskClosable="false">
      <a-form class="myform" :form="vform2" @submit.prevent="submit">
        <a-form-item label="用户名" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
          <a-input v-decorator="['userName']" disabled/>
        </a-form-item>
        <a-form-item label="皇冠数量" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
          <a-input v-decorator="['crownNum']" disabled/>
        </a-form-item>
        <a-form-item label="赠送类型" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
          <a-select :disabled="init.type != 1" v-decorator="['type']">
            <a-select-option value="0">金币</a-select-option>
            <a-select-option value="1">其他</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="赠送金额" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
          <a-input :disabled="init.type != 1" v-decorator="['giveContent']"/>
        </a-form-item>
        <a-form-item label="状态" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
          <a-select :disabled="init.type != 1" v-decorator="['given']">
            <a-select-option value="0">未赠送</a-select-option>
            <a-select-option value="1">已赠送</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="备注" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
          <a-textarea :disabled="init.type != 1" v-decorator="['remark']" :rows="3" />
        </a-form-item>
        <a-form-item v-if="init.type == 1">
          <a-row>
            <a-col :offset="5">
              <a-button html-type="submit" :loading="init.editLoading" type="primary">确认</a-button>&nbsp;
              <a-button @click="init.showModal=false">取消</a-button>
            </a-col>
          </a-row>
        </a-form-item>
      </a-form>
    </a-modal>  

  </div>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents } from "vue-decorators";
import DateRange from "@/components/date-range/DateRange";
import { DateSwitch } from "@/components/switch"

@Component({ formOptions: {
  vform1: "id",
  vform2: "id"
}})
@InjectComponents({ DateRange, DateSwitch })
export default class AgentCrown extends Vue {
  table = {
    key: 1,
    columns: [
      { title: "用户ID", dataIndex: "userId" },
      { title: "用户名", dataIndex: "userName" },
      { title: "皇冠数量", dataIndex: "crownNum"},
      { title: "状态", scopedSlots: { customRender: "isGiven" } },
      { title: "类型", scopedSlots: { customRender: "type" } },
      { title: "赠送内容", dataIndex: "giveContent"},
      { title: "备注", dataIndex: "remark"},
      { title: "结算时间", dataIndex: "summaryDay"},
      { title: "记录时间", dataIndex: "createTime"},
      { title: "操作人", dataIndex: "creator"},
      { title: "操作", scopedSlots: { customRender: 'operation' }}
    ],
    dataSource: [],
    pagination: { total: 0, current: 1}
  };

  init = {
    loading: false,
    showModal: false,
    editLoading: false,
    editId: "",
    query: { pageNo: 1, pageSize: 10, startTime: "",  endTime: ""},
    type: ""
  };

  @Lifecycle mounted() {
    this.vform1.setValue('given', '');
    this.getList();
  }

  // 编辑
  async submit() {
    const form = await this.vform2.validate();
    if (form.errors) return 
    this.init.editLoading = true;
    // 编辑的时候必须传入id
    delete form.values.userName;
    delete form.values.crownNum;


    form.values.id = this.init.editId;
    const res = await this.$service.fetch("/lottery-admin-api/crownDaySummary/editCrownDaySummary", form.values);
    this.init.editLoading = false;
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.init.showModal = false;
    this.getList();
  }

  // 快捷选时间
  changeQuickTime(startDate, endTime) {
    this.init.query.startTime = startDate;
    this.init.query.endTime = endTime;
    this.$refs.rg.setDateRangeValues(startDate, endTime);
  }

  changeDate(start, end, datestring, type) {
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
    this.table.key = Math.random();
    this.table.pagination.current = 1;
    this.init.query.pageNo = 1;
  }

  showRecord(record, type) {
    this.init.type = type;
    this.init.showModal = true;
    this.init.editId = record.id;
    this.vform2.setValues(record, true);
    this.vform2.setValue('given', !!record.isGiven ? 1 : 0);
  }

  async getList(refresh) {
    if (refresh) this.resetPagination(); 
    const form = await this.vform1.validate();
    const values = this.$trimValues(form.values);
    const params = Object.assign(this.init.query, values);

    this.init.loading = true;
    const res = await this.$service.fetch('/lottery-admin-api/crownDaySummary/queryPageCrownDaySummary', params);
    this.init.loading = false;

    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.code === 1 &&  res.data?.records instanceof Array) {
      this.table.dataSource = res.data.records;
      this.table.pagination.total = res.data?.totalCount;
    } else {
      this.table.dataSource = [];
      this.table.pagination.total = 0;
    }
  }
}
</script>

<style lang="scss" scoped>
.crown-wrapper {
    background-color: #fff;
    min-height: 100%;
    padding: 10px;
}

.date-select /deep/{
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  .ant-form-item {
    margin-right: 0;
  }
  .select-timer-area {
    display: flex;
    font-size: 14px;
    align-items: center;
  }
  .btn-1 {
    button {
      padding: 6px 12px;
    }
  }
}
.picker-area /deep/{
    .ant-form-item {
        margin-right: 0;
    }
  }

.myform /deep/ {
  .ant-form-item {
    margin-bottom: 10px;
  }
}
</style>