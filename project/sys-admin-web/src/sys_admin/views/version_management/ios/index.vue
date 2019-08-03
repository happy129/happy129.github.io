<template>
  <div class="version-and">
    <a-form layout="inline" :form="formElement" @submit.prevent="queryList(true)">
      <a-form-item label="商户名称">
        <a-input v-decorator="['platformName', { initialValue: ''}]" />
      </a-form-item>
      <a-form-item label="版本号">
        <a-input v-decorator="['version', { initialValue: ''}]" />
      </a-form-item>
      <a-form-item>
        <a-button type='primary' html-type="submit" :loading="init.loading">查询</a-button>
      </a-form-item>
      <a-form-item v-permission="10087">
        <a-button type='primary' @click="showAddModal">批量更新</a-button>
      </a-form-item>
    </a-form>
    <div class="page-under-table">
      <a-table :key="keys" class="mytable" bordered :loading="init.loading" :columns="table.columns" :dataSource="table.dataSource" :pagination="table.pagination" @change="changePagination" :rowKey="(e, i) => e.platformId" :rowSelection="table.rowSelection">
        <template slot="platformName"  slot-scope="text, record">
          <a href="javascript:;" class="g-blue bold" @click.prevent="showInfo(record)"> {{record.platformName}}</a>
        </template>
        <template slot="operation" slot-scope="text, record">
          <a-button v-permission="10088" type="primary" size="small" @click="showModal(record.platformId)">版本更新</a-button>
        </template>
        <template slot="isVersionPrompt"   slot-scope="text, record">
          <span>{{record.isVersionPrompt == 1 ? '是' : '否'}}</span>
        </template>
        <template slot="isPopPrompt"   slot-scope="text, record">
          <span>{{record.isPopPrompt == 1 ? '是' : '否'}}</span>
        </template>
        <template slot="isForceUpdate"   slot-scope="text, record">
          <span>{{record.isForceUpdate == 1 ? '是' : '否'}}</span>
        </template>
        <template slot="updateRange"  slot-scope="text, record"> 
          <span>尾数{{record.updateRange}}</span>
        </template>
      </a-table>
    </div>

    <a-modal title="版本更新"  v-model="init.ModalShow" :footer="null" :destroyOnClose="true" :width="720" :maskClosable="false">
      <version-add @close="closeCallBack" :id="init.ModalId" :type="init.ModalType" :tableData="init.tableData" @inputChange="Inputchange" :appType="appType"/>
    </a-modal>
 
    <a-modal :title="init.AppDialogTitle" v-model="init.AppDialogVisible" :footer="null" :destroyOnClose="true" :width="940" :maskClosable="false">
      <app-update-info :platformName="init.platformName" @close="closeCallBack" :pid="init.platformId" :appType="appType"/>
    </a-modal>

  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents ,Lifecycle, Watch, Prop } from "vue-decorators";
import VersionAdd from '../version_add';
import { Modal, Notification as Notice } from "ant-design-vue";
import AppUpdateInfo from "./AppUpdateInfo";

@Component
@InjectComponents({ VersionAdd, AppUpdateInfo })
export default class TabIos extends Vue {
  @Prop({ type: [String, Number] }) appType;
  table = {
    key: 1,
    columns: [
      { title: "商户名称", dataIndex: "platformName", scopedSlots: {customRender: "platformName"}},
      { title: "商户标识", dataIndex: "platformId"},
      { title: "当前版本", dataIndex: "version"},
      { title: "版本提示", dataIndex: "isVersionPrompt", scopedSlots: { customRender: "isVersionPrompt" }},
      { title: "弹窗提示", dataIndex: "isPopPrompt", scopedSlots: { customRender: "isPopPrompt" }},
      { title: "强制更新", dataIndex: "isForceUpdate", scopedSlots: { customRender: "isForceUpdate" }},
      { title: "更新范围", dataIndex: "updateRange", scopedSlots: { customRender: "updateRange" }},
      { title: "更新时间", dataIndex: "createTime"},
      { title: "操作", dataIndex: "operation",  scopedSlots: { customRender: "operation" }}
    ],
    dataSource: [],
    pagination: { total: 0, current: 1},
    selectedRowKeys: [],
    rowSelection: {
      onChange: (selectedKeys, selectedRows) => {
        this.table.selectedRowKeys = selectedKeys;
      }
    }
  }
  keys = 1;

  init = {
    query: {
      pageNo: 1,
      pageSize: 10
    },
    ModalShow: false,
    ModalId: "",
    errorTips: ["提示", "请先选择要更新的商户"],
    ModalType: "add",
    tableData: [],

    // 查看app版本更新列表
    AppDialogVisible: false,
    AppDialogTitle: "",
    platformId: "",
    // 是否显示正在查询
    loading: false,
    // 平台名称
    platformName: ""
  }

  @Lifecycle created() {
    this.formElement = this.$form.createForm(this);
  }
  @Lifecycle async mounted() {
    await this.queryList();
  }

  showInfo(item) {
    this.init.platformId = item.platformId;
    this.init.AppDialogVisible = true;
    this.init.AppDialogTitle = item.platformName + "版本记录列表";
    this.init.platformName = item.platformName;
  }

  async changePagination(pagination) {
    this.table.pagination.current = pagination.current;
    this.init.query.pageNo = pagination.current;
    this.table.selectedRowKeys = [];
    await this.queryList();
  }

  async closeCallBack() {
    this.init.ModalShow = false;
    this.keys = Date.now();
    await this.queryList();
  }

  showAddModal() {
    if (this.table.selectedRowKeys.length === 0) {
      Notice.error({ message: this.init.errorTips[0], description: this.init.errorTips[1] });
      return
    }
    // 根据选择的id来筛选信息
    const array = [];
    for (let i = 0, len = this.table.dataSource.length; i < len; i++) {
      for (let j = 0, len2 = this.table.selectedRowKeys.length; j < len2; j++) {
        if (this.table.selectedRowKeys[j] == this.table.dataSource[i].platformId) {
          array.push({
            platformId: this.table.dataSource[i].platformId,
            platformName: this.table.dataSource[i].platformName,
            version: this.table.dataSource[i].version,
            updateUrl: ''
          })
        }
      }
    }

    if (array.length < 2) {
      return this.$message.warning('请至少勾选2个商户平台');
    }

    this.init.ModalType = "add";
    this.init.ModalShow = true;
    this.init.tableData = array;
  }
  // 自组建修改值
  Inputchange(id, value) {
    this.init.tableData.forEach(item => {
      if (item.platformId === id) {
        item.updateUrl = value;
      }
    });
  }

  showModal(id) {
    this.init.ModalId = id;
    this.init.ModalType = "update";
    this.init.ModalShow = true;
  }

  resetPagination() {
    this.table.pagination.current = 1;
    this.init.query.pageNo = 1;
  }

  async queryList(refresh) {
    if (refresh) this.resetPagination()
    this.formElement.validateFields(async (err, values) => {
      if (!err) {
        this.init.loading = true;
        const res = await this.$service.fetch('/config-admin-api/appVersion/queryPagePlatformAppVersion', Object.assign(this.init.query, values, {
          appType: this.appType
        }));
        this.init.loading = false;
        if (res.code !== 1) return res.message && this.$message.error(res.message);
        this.keys = Date.now();
        this.table.dataSource = res.data?.records;
      }
    });
  }
}
</script>
