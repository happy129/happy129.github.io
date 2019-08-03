<template>
  <div class="log-feedback">
     <a-form layout="inline" :form="vform">
        <a-form-item label="客户端">
            <a-select v-decorator="['clientType', { initialValue: '' }]" :dropdownMatchSelectWidth="false"  @change="changeSelection">
                <a-select-option value="">全部</a-select-option>
                <a-select-option v-for="(item, index) in dictionary.clientType"  :key="index" :value="item.value">{{item.name}}</a-select-option>
            </a-select>
        </a-form-item>
        <a-form-item label="问题">
            <a-select v-decorator="['problemType', { initialValue: '' }]" :dropdownMatchSelectWidth="false" @change="changeSelection">
              <a-select-option value="">全部</a-select-option>
              <a-select-option v-for="(item, index) in dictionary.userComplainType"  :key="index" :value="item.value">{{item.name}}</a-select-option>
            </a-select>
        </a-form-item>
        <a-form-item style="display:none"><a-input v-decorator="['feedbackType', {initialValue: 2}]"/></a-form-item>
        <a-form-item label="会员账号"><a-input v-decorator="['userName', { initialValue: ''}]"/></a-form-item>
        <a-form-item label="用户ID"><a-input v-number v-decorator="['userId', { initialValue: ''}]"/></a-form-item>
        <a-form-item><a-button type='primary' @click.prevent="getList(true)" :loading="init.loading">查询</a-button></a-form-item>
    </a-form>
    <div class="page-under-table">
        <a-table class="mytable" :loading="init.loading" bordered :columns="table.columns" :dataSource="table.dataSource" :pagination="table.pagination"  @change="changePagination" :rowKey="e => e.id">
          <template slot="feedbackContent" slot-scope="text, records">
            <p class="feed-back-content">{{records.feedbackContent}}</p>
          </template>
          
          <template slot="clientType" slot-scope="text, records">
            <span>{{getTextByDictionary(records.clientType, dictionary.clientType)}}</span>
          </template>
          <template slot="problemType" slot-scope="text, records">
            <span>{{getTextByDictionary(records.problemType, dictionary.userComplainType)}}</span>
          </template>
          <template slot="handleTime" slot-scope="text, records">
            <span v-if="records.status == 1">{{records.handleTime}}</span>
            <span v-else></span>
          </template>
          <template slot="status" slot-scope="text, records">
            <span v-if="records.status == 0" class="g-red">待回复</span>
            <span v-else>已回复</span>
          </template>
          <template slot="operation" slot-scope="text, records">
            <a-button type="primary" v-permission="20031" size="small" @click="doModify(records)">{{records.status == 0 ? '回复': '详情'}}</a-button>
          </template>
        </a-table>
    </div>

    <a-modal title="意见反馈" v-model="init.ModalShow" :maskClosable="false" :destroyOnClose="true" :footer="null">
      <log-detail type="feedback" :userId="init.userId"  :status="init.status" :userName="init.userName"  @close="closeDialog"></log-detail>
    </a-modal>

  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents, Lifecycle } from 'vue-decorators'
import LogDetail from "./LogDetail"

@Component({ dictionary: "clientType,userComplainType", formOptions: "id"})
@InjectComponents({LogDetail})
export default class LogFeedback extends Vue {
  table = {
      // 意见反馈
      columns : [
          { title: 'ID', dataIndex: 'id'},
          { title: '会员账号', dataIndex: 'userName'},
          { title: '客户端', dataIndex: 'clientType',  scopedSlots: {customRender: 'clientType'}},
          { title: '问题', dataIndex: 'problemType', scopedSlots: {customRender: 'problemType'}},
          { title: '内容', dataIndex: 'feedbackContent', scopedSlots: { customRender: 'feedbackContent'}},
          { title: '反馈时间', dataIndex: 'createTime'},
          { title: '状态', dataIndex: 'status', scopedSlots: {customRender: 'status'}},
          { title: '回复时间', dataIndex: 'handleTime', scopedSlots: {customRender: 'handleTime'} },
          { title: '回复人', dataIndex: 'adminName'},
          { title: '操作', dataIndex: 'operation', scopedSlots: {customRender: 'operation'}}
      ],
      dataSource: [],
      pagination: {
        current: 1,
        total: 0
      }
  };

  init = {
    loading: false,
    query: {
      pageNo: 1,
      pageSize: 10
    },
    ModalShow: false,
    userId: "",
    userName: "",
    status: ""
  }

  @Lifecycle mounted() {
    this.getList();
  }
  
  async getList(type) {
    if (type) {
      this.changeSelection();
    }
    const form = await this.vform.validate();
    this.init.loading = true;
    const res = await this.$service.fetch('/lottery-admin-api/userFeedback/queryPageUserFeedback', Object.assign(form.values, this.init.query));
    this.init.loading = false;
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res?.data?.records instanceof Array) {
      this.table.dataSource = res.data.records;
      this.table.pagination.total = res.data.totalCount;
    }
  }

  getTextByDictionary(id, array) {
    return array.find(item => item.value == id)?.name;
  }

  changeSelection() {
    this.init.query.pageNo = 1;
    this.table.pagination.current = 1;
  }

  changePagination(pagination) {
    this.init.query.pageNo = pagination.current;
    this.table.pagination.current = pagination.current;
    this.getList();
  }

  doModify(item) {
    this.init.userId = item.id;
    this.init.userName = item.userName;
    this.init.status = item.status;
    this.init.ModalShow = true;
  }

  closeDialog() {
    this.init.ModalShow = false;
    this.getList();
  }
}
</script>

<style lang="scss" scoped>
.feed-back-content {
  max-width: 500px;
  word-break: break-all;
}
</style>