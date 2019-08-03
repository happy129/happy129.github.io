<template>
  <div class="level-wrapper">
    <div>
      <a-button  v-permission="20238" type="primary" @click="init.showModal=true;init.editType='add'">添加</a-button>
    </div>
     <a-table 
      class="mytable mt10" 
      bordered 
      :columns="table.columns" 
      :rowKey="(e, i) => i" 
      :dataSource="table.dataSource" 
      :pagination="false"  
      > 
        <template slot="operation" slot-scope="text, record">
          <a-button  v-permission="20239" size="small" type="primary" @click="editAgentLevel(record)">编辑</a-button>
        </template>
      </a-table>

    <a-modal title="添加等级" v-model="init.showModal" :width="460" :destroyOnClose="true" :maskClosable="false">
      <a-form :form="vform">
        <a-form-item label="等级名称" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-input v-decorator="['levelName', { rules: [{required: true, message: '请输入等级名称'}] } ]"/>
        </a-form-item>
        <a-form-item label="最高金额" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-input v-number="true" v-decorator="['maxBetAmount', { rules: [{required: true, message: '请输入最高金额'}] }]"/>
        </a-form-item>
        <a-form-item label="返佣比例" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-input v-number="true" v-decorator="['commissionRate', { rules: [{required: true, message: '请输入返佣比例'}] }]"/>
        </a-form-item>
      </a-form>
      <footer slot="footer">
        <a-button type="primary" :loading="init.loading" @click="addOrEditLevel">确定</a-button>
      </footer>
    </a-modal>

  </div>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents } from "vue-decorators";

@Component({ formOptions: "id" })
export default class Level extends Vue {
  table = {
    key: 1,
    columns: [
      { title: "等级", dataIndex: "level" },
      { title: "等级名称", dataIndex: "levelName" },
      { title: "最低金额", dataIndex: "minBetAmount"},
      { title: "最高金额", dataIndex: "maxBetAmount" },
      { title: "返佣比例", dataIndex: "commissionRate" },
      { title: "操作", scopedSlots: { customRender: "operation" } }
    ],
    dataSource: [],
    pagination: { total: 0, current: 1 }
  };

  init = {
    loading: false,
    showModal: false,
    editType: 'add',
    editId: "",
    query: { pageNo: 1, pageSize: 10},
    time: { startTime: "", endTime: "" }
  };

  @Lifecycle mounted() {
    this.getList();
  }

  async editAgentLevel(record) {
    this.init.editType = 'edit';
    this.init.editId = record.id;
    this.init.showModal = true;
    this.vform.setValues(record, true);
  }

  async addOrEditLevel() {
    const form = await this.vform.validate();
    if (form.errors) return;
    this.init.loading = true;
    if (this.init.editType === 'edit') {
      form.values.id = this.init.editId;
    }
    const res = await this.$service.fetch("/config-admin-api/commissionConfig/addOrEditCommissionConfig", form.values);
    this.init.loading = false;
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.init.showModal = false;
    this.getList();
  }

  changePagination(pagination) {
    this.table.pagination.current = pagination.current;
    this.init.query.pageNo = pagination.current;
    this.getList();
  }

  async getList() {
    const res = await this.$service.fetch("/config-admin-api/commissionConfig/queryAllCommissionConfig");
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data instanceof Array) {
      this.table.dataSource = res.data;
    } else {
      this.table.dataSource = [];
    }
  }
}
</script>