<template>
   <section class="buss-container">
    <a-form layout="inline" :form="formElement">
      <a-form-item label="商户名">
        <a-input v-decorator="['platformName', { initialValue: ''} ]"/>
      </a-form-item>
      <a-form-item label="域名">
        <a-input v-decorator="['domainName', { initialValue: ''}]"/>
      </a-form-item>
      <a-form-item label="类型">
         <a-select v-decorator="['domainType', { initialValue: ''}]" @change="changeDomain">
            <a-select-option value="">全部</a-select-option>
            <a-select-option v-for="(item, index) in dictionary.plateformDomainType" :key="index" :value="item.value">{{item.name}}域名</a-select-option>
          </a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click.prevent="queryDomainList(true)">查询</a-button>
      </a-form-item>
      <a-form-item v-permission="10015">
        <a-button type="primary"  @click="showModalAction">添加域名</a-button>
      </a-form-item>
    </a-form>

     <div class="page-under-table">
        <a-table class="mytable" bordered :columns="table.columns" :dataSource="table.dataSource" :pagination="table.pagination" @change="changeTablePagenation" :rowKey="e => e.id">
          <template slot="domainType" slot-scope="text, records">{{records.domainType === 0 ? 'H5':'PC'}}</template>
          <template slot="operate" slot-scope="text, records">
            <a-button type="primary" size="small" @click="modifyDomain(records.id)" v-permission="10016">修改</a-button> &nbsp;&nbsp;
            <a-button type="primary" size="small" @click="deleteDomain(records.id)" v-permission="10017">删除</a-button>
          </template>
        </a-table>
      </div>

      <a-modal :title="init.ModalTitle[init.ModalTitleIndex]" v-model="init.ModalShow" :footer="null" :destroyOnClose="true">
        <a-form  class="domain-form" :form="vform" @submit.prevent="submit" :hideRequiredMark="true">
          <a-form-item label="域名" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
            <a-input  v-decorator="['domainName', {rules: [{ required: true, message: '请输入域名' }]}]" style="width: 180px;"/>
          </a-form-item>
          <div>
            <a-form-item label="商户" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
              <a-select v-decorator="['platformId', {initialValue: '', rules: [{ required: true, message: '请选择商户平台' }]}]" style="width: 180px;">
                <a-select-option value="">请选择商户平台</a-select-option>
                <a-select-option v-for="(item, index) in init.bus" :key="index" :value="`${item.id}`">{{item.platformName}}</a-select-option>
              </a-select>
            </a-form-item>
          </div>
          <div class="mt10">
            <a-form-item label="客户端" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
              <a-radio-group v-decorator="['domainType', {rules: [{ required: true, message: '请选择客户端' }]}]">
                <a-radio v-for="(item, index) in dictionary.plateformDomainType" :key="index" :value="item.value">{{item.name}}域名</a-radio>
              </a-radio-group>
            </a-form-item>
          </div>
          <div class="mt10">
            <a-form-item label="Google验证码" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
              <a-input v-decorator="['googleCode', {rules: [{ required: true, message: '请输入google验证码' }]}]"/>
            </a-form-item>
          </div>
          <div class="mt10">
            <a-form-item>
              <a-row>
                <a-col :offset="6" :span="18">
                    <a-button type='primary' html-type="submit">保存</a-button>
                </a-col>
              </a-row>
            </a-form-item>
          </div>
        </a-form>
      </a-modal>
  </section>
</template>

<script>
import Vue from "vue"
import { Component, Lifecycle, InjectComponents, Watch } from 'vue-decorators'
import { Modal , Notification as Notice } from 'ant-design-vue'
import DateRange from '@/components/date-range/DateRange'
import * as Api from '@api/bussiness'

@Component({  dictionary: 'plateformDomainType', formOptions: 'createTime' })
@InjectComponents({ DateRange })
export default class BussinessDomainManage extends Vue {
    table = {
        columns: [
            { title: '域名',  dataIndex: 'domainName'},
            { title: '对应商户', dataIndex: 'platformName'}, 
            { title: '客户端', dataIndex: 'domainType',scopedSlots: {customRender: 'domainType'}}, 
            { title: '创建时间', dataIndex: 'createTime'}, 
            { title: '操作',  dataIndex: 'operate', scopedSlots: { customRender: 'operate' } }
        ],
        dataSource: [],
        pagination: { total: 0, current: 1, pageSize: 10 }
    };
    
    requestParams = {
        getAllUserGroup: {  pageNo: 1,  pageSize: 10 }
    };

    init = {
        ModalShow: false,
        ModalTitle: ["添加域名", "修改域名"],
        ModalTitleIndex: 0,
        confirmLoading: false,
        tips: ['提示', '是否确定删除?'],
        pagination: { pageNo: 1, pageSize: 10},
        bus: [],
        editId: 0
    };

    @Watch('init.ModalShow', {immediate: true}) watchModalShow(value) {
      if (value === true) {
        this.getTableList();
      }
    }

    @Lifecycle created() {
      this.formElement = this.$form.createForm(this);
    }

    @Lifecycle mounted() {
      this.queryDomainList();
    }

    changeDomain() {
      this.init.pagination.pageNo = 1;
      this.table.pagination.current = 1;
    }

    showModalAction() {
      this.init.ModalShow = true;
      this.init.ModalTitleIndex = 0;
    }

    changeTablePagenation(pagination) {
      this.table.pagination.current = pagination.current;
      this.init.pagination.pageNo = pagination.current;
      this.queryDomainList();
    }

    /** 修改域名 */
    async modifyDomain(id) {
      this.init.ModalTitleIndex = 1;
      const { data: res } = await Api.domainGetById({
        id
      });
      if (res?.body?.code === 1 && typeof res.body.data === 'object') {
        this.vform.setValues(res.body.data, true);
        this.init.editId = res.body.data?.id;
      }
      this.init.ModalShow = true;
    }

    /** 获取所有商户 */
    async getTableList() {
      const res = await this.$service.fetch("/config-admin-api/platform/queryAllPlatform");
      if (res.code !== 1) res.message && this.$message.error(res.message);
      if (res?.data instanceof Array) {
        this.init.bus = res.data;
      }
    }

    /** 删除域名 */
    async deleteDomain(id) {
      Modal.confirm({
        title: this.init.tips[0],
        content: this.init.tips[1],
        onOk: async () => {
          const { data: res } = await Api.domainRemove({
            id
          });
          if (res?.body?.code === 1) {
            Notice.success({ message: this.init.tips[0], description: res.body.message });
            this.queryDomainList(true);
          }
        }
      });
    }

    async queryDomainList(type) {
      if (type) {
        this.changeDomain();
      }
      this.formElement.validateFields(async (err, values) => {
        if (!err) {
         const { data: res } = await Api.domainQuery(Object.assign(values, this.init.pagination));
         if (res?.body?.code === 1 && res?.body?.data?.records) {
           this.table.dataSource = res.body?.data?.records;
           this.table.pagination.total = res.body.data.totalCount;
         }
        }
      });
    }

    async submit() {
      const form = await this.vform.validate();
      let platformName = "";
      if (form.errors) return;
      if (this.init.bus.length > 0) {
        platformName = this.init.bus.find(item => item.id == form.values.platformId)?.platformName;
      }
      // 新增
      if (this.init.ModalTitleIndex === 0) {
        const { data: res } = await Api.domainAdd(Object.assign(form.values, {platformName}));
        if (res?.body?.code === 1) {
          Notice.success({ message: this.init.tips[0], description: res.body.message });
          this.init.ModalShow = false;
          this.queryDomainList(true);
        }
      } else {
      // 修改
        const { data: res } = await Api.domainEdit( Object.assign({id: this.init.editId, platformName: platformName}, form.values));
        if (res?.body?.code === 1) {
          Notice.success({ message: this.init.tips[0], description: res.body.message });
          this.init.ModalShow = false;
          this.queryDomainList(true);
        }
      }
    }

}
</script>

<style lang="scss">
.buss-container {
    height: 100%; padding: 15px 10px; box-sizing: border-box;
    overflow-y: auto; border-radius: 4px; background-color: #fff;
}
.domain-form {
  .ant-form-item {
    margin-bottom: 10px;
  }
}
</style>

