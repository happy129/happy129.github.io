<template>
  <div class="level-wrapper">
    <div class="level-top">
      <div class="options">
        选项
        <ul>
          <li>
            <a-button :class="{active: init.thirdPlatformCode == ''}" @click="init.thirdPlatformCode=''; getList(true) ">全部</a-button>
          </li>
          <li v-for="(item, index) in dsstore.thirdGames.records" :key="index">
            <a-button  :class="{active: init.thirdPlatformCode == item.thirdGameCode}" @click="init.thirdPlatformCode=item.thirdGameCode; getList(true)">{{item.thirdGameName}}</a-button>
          </li>
        </ul>
      </div>
      <a-button  v-permission="20241" type="primary" @click="init.showModal=true;init.editType='add'">添加</a-button>&nbsp;
      <a-button v-permission="202421" @click="showConfig=true;queryStatus();" :disabled="init.thirdPlatformCode==''">配置</a-button>
    </div>
     <a-table 
      class="mytable mt10" 
      bordered 
      :columns="table.columns" 
      :rowKey="(e, i) => i" 
      :dataSource="table.dataSource" 
      :pagination="table.pagination"  
      @change="changePagination"> 
        <template slot="operation" slot-scope="text, record">
          <a-button  v-permission="20242" size="small" type="primary" @click="editAgentLevel(record)">编辑</a-button>
        </template>
      </a-table>

      <a-modal title="添加等级" v-model="init.showModal" :width="460" :destroyOnClose="true" :maskClosable="false">
        <a-form :form="vform">
          <a-form-item label="游戏平台" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
            <a-select :disabled="init.editType=='edit'" v-decorator="['thirdGameCode', { rules: [{required: true, message: '请选择游戏平台'}] } ]">
              <a-select-option value="">请选择</a-select-option>
              <a-select-option v-for="(item, index) in dsstore.thirdGames.records" :key="index" :value="item.thirdGameCode">{{item.thirdGameName}}</a-select-option>
            </a-select>
          </a-form-item>
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

    <a-modal :title="`${getName}配置`" v-model="showConfig" @ok="doConfiguration" :confirmLoading="confirmLoading" :width="500" :destroyOnClose="true" :maskClosable="false">
      <a-form :form="vform1">
        <a-form-item :label="`${getGameCode}无限代开关`" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
          <a-switch checkedChildren="开" unCheckedChildren="关" :checked="isChecked" @change="isChecked=!isChecked"></a-switch>
        </a-form-item>
        <a-form-item :label="`${getGameCode}代理说明`" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
          <a-textarea  v-decorator="['faqUrl']" :rows="3"></a-textarea>
        </a-form-item>
      </a-form>
    </a-modal>

  </div>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, Computed } from "vue-decorators";

const dsstore = {
   thirdGames: { url: '/config-admin-api/thirdGameQuota/queryPagePlatformThirdGameConfig', params: { pageNo: 1, pageSize: 100} },
}

@Component({ formOptions: {
  vform: "id", 
  vform1: "id"
}, dsstore })
export default class ThirdLevel extends Vue {
  table = {
    key: 1,
    columns: [
      { title: "游戏名称", dataIndex: "thirdGameName" },
      { title: "等级", dataIndex: "level" },
      { title: "等级名称", dataIndex: "levelName"},
      { title: "最低金额", dataIndex: "minBetAmount" },
      { title: "最高金额", dataIndex: "maxBetAmount" },
      { title: "返佣比例", dataIndex: "commissionRate" },
      { title: "操作", scopedSlots: { customRender: "operation" } }
    ],
    selectedRowKeys: [],
    rowSelection: {
      onChange: (selectedRowKeys, selectedRows) => {
        this.table.selectedRowKeys = selectedRows.map(e => e.id);
      },
    },
    dataSource: [],
    pagination: { total: 0, current: 1 }
  };

  confirmLoading = false;
  showConfig = false;
  isChecked = false;

  init = {
    loading: false,
    showModal: false,
    query: { pageNo: 1, pageSize: 10 },
    thirdPlatformCode: ""
  };

  @Lifecycle mounted() {
    this.vform.setValue('thirdPlatformCode', '');
    this.getList();
  }

  @Computed getName() {
    if (!this.init.thirdPlatformCode) return ''
    return this.dsstore.thirdGames?.records?.find(item => item.thirdGameCode == this.init.thirdPlatformCode)?.thirdGameName || ' ';
  }
  
  @Computed getGameCode() {
    if (!this.init.thirdPlatformCode) return ''
    return this.dsstore.thirdGames?.records?.find(item => item.thirdGameCode == this.init.thirdPlatformCode)?.thirdGameCode || ' ';
  }

  // 查询内容
  async queryStatus() {
    const res = await this.$service.fetch('/config-admin-api/thirdCommissionConfig/queryThirdInfiniteAgentConfig', {
      thirdGameCode: this.init.thirdPlatformCode
    });
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.isChecked = res.data.isEnabled == 1 ? true : false; 
    this.vform1.setValues({
      faqUrl: res.data.faqUrl
    }, true);
  }

  async editAgentLevel(record) {
    this.init.editType = 'edit';
    this.init.editId = record.id;
    this.init.showModal = true;
    this.vform.setValues(record, true);
  }

  changePagination(pagination) {
    this.table.pagination.current = pagination.current;
    this.init.query.pageNo = pagination.current;
    this.getList();
  }

  // 进行初始化配置
  async doConfiguration() {
    const form = await this.vform1.validate();
    if (form.errors) return
    this.confirmLoading = true;
    const res = await this.$service.fetch('/config-admin-api/thirdCommissionConfig/editThirdInfiniteAgentConfig', {
      thirdGameCode: this.init.thirdPlatformCode,
      isEnabled: this.isChecked == true ? 1 : 0,
      faqUrl: form.values.faqUrl
    });
    this.confirmLoading = false;
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.showConfig = false;
  }

  async addOrEditLevel() {
    const form = await this.vform.validate();
    if (form.errors) return;
    this.init.loading = true;
    if (this.init.editType === 'edit') {
      form.values.id = this.init.editId;
    }
    form.values.platformId = this.platformId;

    const res = await this.$service.fetch("/config-admin-api/thirdCommissionConfig/addOrEditThirdCommissionConfig", form.values);
    this.init.loading = false;
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.init.showModal = false;
    this.getList();
  }

  resetPagination() {
    this.table.pagination.current = 1;
    this.init.query.pageNo = 1;
  }

  async getList(refresh) {
    if (refresh) this.resetPagination();
    const res = await this.$service.fetch("/config-admin-api/thirdCommissionConfig/queryAllThirdCommissionConfig", Object.assign({
      platformId: this.platformId,
      thirdPlatformCode: this.init.thirdPlatformCode
    }, this.init.query));
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data.records instanceof Array) {
      this.table.dataSource = res.data.records;
      this.table.pagination.total = res.data.totalCount
    } else {
      this.table.dataSource = [];
      this.table.pagination.total = 0
    }
  }
}
</script>

<style lang="scss" scoped>
.level-top {
  display: flex;
  .options {
    display: flex;
    align-items: center;
    ul {
      margin-left: 10px;
      display: flex;
      li {
        margin-right: 5px;
      }
    }
  }
}
.active /deep/ {
  border: 1px solid #009688;
}
</style>