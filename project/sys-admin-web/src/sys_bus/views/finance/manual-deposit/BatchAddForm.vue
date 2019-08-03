<template>
  <section class="deposit-wrapper">
    <a-button @click="$emit('showForm')" icon="rollback">返回上级</a-button>
    <div class="manual-deposit-modal">
      <div class="panel">
        <a-form layout="inline">
          <a-form-item class="export-file-wrap" label="导入文件">
            <template>
              <a-input style="width:160px" value="选择文件"  disabled/>
              <a class="download-link" :href="`/lottery-admin-api/manualChangeWallet/downloadExcelTemplate?token=${token}`" download="excel模板">模版下载</a>
            </template>
          </a-form-item>
          <a-form-item>
            <a-upload name="excel" action="#" :showUploadList="showUpload" :beforeUpload="beforeUpload" > <a-button type="primary">导入Excel</a-button>
            </a-upload>
          </a-form-item>
        </a-form>

        <a-form :form="vform1" class="task-name" @submit.prevent="execTask">
          <a-form-item label="任务名称" :label-col="{ span: 2 }" :wrapper-col="{ span: 6 }">
            <a-input placeholder="输入任务名称" v-decorator="['taskName', { rules: [{required: true, message: '请输入任务名称'}] }]"/>
          </a-form-item>
          <a-form-item label="任务备注" :label-col="{ span: 2 }" :wrapper-col="{ span: 6 }">
            <a-input placeholder="输入任务备注" v-decorator="['taskRemark', { rules: [{required: true, message: '请输入任务备注'}] }]"/>
          </a-form-item>
          <a-form-item label="谷歌验证码" :label-col="{ span: 2 }" :wrapper-col="{ span: 6 }">
            <a-input v-decorator="['googleCode', { rules: [{required: true, message: '请输入google验证码'}] }]" placeholder="输入谷歌验证码"/>
          </a-form-item>
          <a-form-item>
            <a-button class="form-btn" type="primary" :loading="modal.loading" :disabled="isEnabled" html-type="submit">确认批量加减款</a-button>
          </a-form-item>
        </a-form>
      </div>
        

    <div class="dynamic-table">
      <div class="total-data">
        <span>任务总数：{{totalData.completedTaskNum || '0'}}/{{totalData.totalTaskNum}}</span>
        <span>加款总额：{{totalData.addTotalAmount || '0.00'}}</span>
        <span>减款总额：{{totalData.subtractTotalAmount || '0.00'}}</span>
      </div>
      <a-table class="table-dynamic mytable" bordered :columns="table.columns" :rowKey="(e, i) => i" :dataSource="table.dataSource" :pagination="false">
        <template slot="isUpgradeRechargeUser" slot-scope="text, record">
          {{ record.isUpgradeRechargeUser == 1 ? '是' : '否' }}
        </template>
        <template slot="rechargeType" slot-scope="text, record">
          {{ getRechargeName(record.rechargeType)  }}
        </template>
        <template slot="operateType" slot-scope="text, record">
          {{ getOperateTypeName(record.operateType)  }}
        </template>
        <template slot="status" slot-scope="text, record">
          <span class="g-red" v-if="!isFinished">未开始</span>
          <span class="g-green"  v-if="isFinished && record.finished">已完成</span>
          <span class="g-red"  v-if="isFinished && !record.finished">操作失败</span>
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
  vform1: "id"
};

@Component({ formOptions })
export default class BatchAddForm extends Vue {
  // 谷歌验证码
  showUpload = false;

  // 是否开启批量加减款
  isEnabled = true;

  isFinished = false;

  totalData = {};

  modal = {
    title: '批量加减款',
    showModal: false,
    loading: false
  }

  table = {
    columns: [
      {title: '会员账号', dataIndex: 'userName'},
      {title: '类型', dataIndex: 'operateType', scopedSlots: { customRender: "operateType" }},
      {title: '加减款方式', dataIndex: 'rechargeType', scopedSlots: { customRender: "rechargeType" }},
      {title: '升级为充值用户', dataIndex: 'isUpgradeRechargeUser', scopedSlots: { customRender: "isUpgradeRechargeUser" }},
      {title: '金额', dataIndex: 'amount'},
      {title: '打码倍数', dataIndex: 'unwithdrawableTimes'},
      {title: '用户备注', dataIndex: 'remark'},
      {title: '后台备注', dataIndex: 'systemRemark'},
      {title: '状态', dataIndex: 'status', scopedSlots: { customRender: "status" }}
    ],
    dataSource: []
  };

  rechargeTypes = [
    {id:2, name: "人工汇款" },
    {id:3, name: "彩金派送" },
    {id:4, name: "返水派送" },
    {id:5, name: "其它" }
  ];

  operateType = [{id: 1, name: "加款"}, {id: -1, name: "减款"}];

  query = { pageSize: 10, pageNo: 1 };

  @Lifecycle mounted() {

  }

  getRechargeName(id) {
    return this.rechargeTypes.find(item => item.id == id)?.name;
  }

  getOperateTypeName(id) {
    return this.operateType.find(item => item.id == id)?.name;
  }

  fileList = [];
  fileUrl = "";

  changeFile(file) {
    this.fileUrl = file;
  }

  beforeUpload(file) {
    this.fileList = [];
    this.fileList = [file];
    this.$nextTick(() => this.uploadExcel());
    return false;
  }

  @Watch('table.dataSource') hasData(value) {
    if (value.length > 0) {
      this.isEnabled = false
    } else {
      this.isEnabled = true
    }
  }

  // 汇总数据
  totalData = {
    completedTaskNum: 0,
    totalTaskNum: 0
  };

  // 上传excel
  async uploadExcel() {
    const formData = new FormData();
    formData.append("fileName", this.fileList[0]);
    formData.append("platformId", this.platformId);

    const res = await this.$service.fetch("/lottery-admin-api/manualChangeWallet/parseExcel", formData);
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.isFinished = false;
    this.totalData.completedTaskNum = 0;
    this.totalData = res.data;
    if (res.data?.manualChangeWalletAddByUserNameList instanceof Array) {
      this.table.dataSource = res.data.manualChangeWalletAddByUserNameList.map(item => ({...item, finished: true }));
    }
  }

  async execTask() {
    const form = await this.vform1.validate();
    if (form.errors) retrurn 

    this.modal.loading = true;
    const res = await this.$service.fetch('/lottery-admin-api/manualChangeWallet/batchManualChangeWallet', {
      list: this.table.dataSource,
      ...form.values
    });
    this.modal.loading = false;
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    // 状态改成完成
    this.isFinished = true;
    this.totalData.completedTaskNum = this.totalData.totalTaskNum;

    const failedUserNameList = res.data?.failedUserNameList;
    if (!failedUserNameList && failedUserNameList.length === 0) return; 
    // 部分未完成
    this.table.dataSource.forEach(item => {
      for (let i = 0; i < failedUserNameList.length; i++) {
        if (failedUserNameList[i] == item.userName) {
          item.finished = false;
          break;
        }
      }
    });
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
    width: 134px;
    display: inline-block;
    &::before {
      content: "*";
      color: red;
    }
  }
}

.form-btn {
  margin-left: 134px;
}

.task-name /deep/{
  border-top: 1px solid #d4d4d4;
  margin-top: 10px;

  .ant-form-item {
    margin-bottom: 10px;
  }
}

.total-data  {
  margin-bottom: 10px;
  span {
    margin-right: 10px;
  }
}

</style>
