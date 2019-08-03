<template>
  <section class="deposit-wrapper">
    <a-form layout="inline">
      <a-form-item label="任务名称">
        <a-input v-model="query.taskName"/>
      </a-form-item>
      <a-form-item label="每页条数">
        <a-input style="width: 60px" v-model="query.pageSize"/>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" :loading="loading" @click="getList(true)">查询</a-button>
      </a-form-item>
    </a-form>
    <div class="mt10">
      <a-button type="primary" v-permission="20132"  @click="$emit('showForm')">添加任务</a-button>
    </div>
    <div class="g-gray-border page-under-table">
      <div class="mt15">
        <a-table class="mytable" bordered :rowKey="(r,i)=>i" :columns="columns" :dataSource="dataSource" :pagination="pagination"  @change="changePagination">
          <template slot="status" slot-scope="text, record">
            {{record.status == 0 ? "进行中" : "已完成"}}
          </template>
        </a-table>
      </div>
    </div>
   
  </section>
</template>
<script>
import Vue from 'vue'
import { Component, Lifecycle, Watch } from 'vue-decorators'

const formOptions = {
  vform0: "id"
};

@Component({ formOptions })
export default class BatchAdd extends Vue {
  // 谷歌验证码
  columns = [
    {title: 'ID', dataIndex: 'id'},
    {title: '任务名称', dataIndex: 'taskName'},
    {title: '任务备注', dataIndex: 'taskRemark'},
    {title: '任务总数', dataIndex: 'taskCount'},
    {title: '状态', scopedSlots: { customRender: "status" } },
    {title: '开始时间', dataIndex: 'createTime'},
    {title: '处理人', dataIndex: 'adminName'}
  ];
  dataSource = [];
  pagination = { total: 0, current: 1, pageSize: 10 };

  // modal = {
  //   title: '批量加减款',
  //   showModal: false,
  //   loading: false
  // }

  loading = false;

  query = {
    taskName: '',
    pageSize: 10,
    pageNo: 1
  };

  @Lifecycle mounted() {
    this.getList();
  }

  changePagination(pagination) {
    this.pagination.current = pagination.current;
    this.query.pageNo = pagination.current;
    this.getList();
  }

  // 获取列表
  async getList(reset) {
    if (reset) {
      this.query.pageNo = 1;
      this.pagination.current = 1;
    }
    this.loading = true;
    const res = await this.$service.fetch('/lottery-admin-api/manualChangeWallet/queryPageBatchTask', this.query);
    this.loading = false;
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data?.records instanceof Array) {
      this.dataSource = res.data.records;
      this.pagination.total = res.data?.totalCount;
      this.pagination.pageSize = res.data.pageSize;
    } else {
      this.dataSource = [];
    }
  }

}
</script>
<style lang="scss" scoped>
.manual-deposit-modal /deep/{
  .ant-form {
    padding: 5px 0 5px 8px;
    .ant-select {
      width: 150px;
    }
    .right {
      float: right;
    }
  }
  .panel {
    border: 1px solid #d4d4d4;
    margin: 10px 0;
    .panel-header {
      padding: 15px 5px;
      background: #e4e4e4;
      span {
        display: inline-block;
        line-height: 0;
        color: #09f;
        margin-left: 20px;
      }
    }
  }
  .footer {
    .ant-input {
      width: 105px !important;
      margin-right: 30px;
    }
    text-align: right;
    padding-right: 16px;
    margin-top: 25px;
  }
}

.download-link {
  margin-left: 10px;
  margin-right: 20px;
  color: #6464ff;
}

.export-file-wrap /deep/{
  label {
    width: 94px;
    display: inline-block;
  }
}

.form-btn {
  margin-left: 94px;
}

.task-name /deep/{
  border-top: 1px solid #d4d4d4;
  margin-top: 10px;

  .ant-form-item {
    margin-bottom: 10px;
  }
}

</style>
