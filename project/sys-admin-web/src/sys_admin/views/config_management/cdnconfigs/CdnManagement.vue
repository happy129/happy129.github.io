<template>
  <section>
     <a-form layout="inline" :form="vform0">
        <a-form-item label="域名地址">
          <a-input placeholder="请输入域名" v-decorator="['domainName']" />
        </a-form-item>
        <a-form-item label="链接类型">
          <a-select style="width: 120px;" v-decorator="['linkType']" placeholder="请选择分类" >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="0">HTTP</a-select-option>
            <a-select-option value="1">MQTT</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" :loading="loading" @click="getList(true)">查询</a-button>
        </a-form-item>
        <a-form-item>
          <a-button @click="modalInfo.show=true;modalInfo.type='add'">添加CDN域名</a-button>
        </a-form-item>
      </a-form>

      <a-table 
        class="mytable mt10"
        bordered
        :rowKey="(r,i)=>i" 
        :pagination="table.pagination" 
        :columns="table.columns" 
        :dataSource="table.dataSource" 
        @change="changePagination" 
      >
        <template slot="linkType" slot-scope="text, record">
          {{ record.linkType == 0 ? 'http' : 'mqtt' }}
        </template>
        <template slot="operation" slot-scope="text, record">
          <a-button class="common-green-btn" @click="doModidyCDN(record)">修改</a-button> &nbsp;
          <a-button class="common-red-btn" @click="deleteCDN(record)">删除</a-button>
        </template>
      </a-table>


      <a-modal :title="`${modalInfo.type === 'add' ? '添加CDN域名' : '修改CDN域名'}`" @ok="submit" :confirmLoading="confirmLoading" v-model="modalInfo.show" :destroyOnClose="true" :maskClosable="false">
        <a-form :form="vform1" class="myform-cdn">
          <a-form-item label="CDN名称" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
            <a-input v-decorator="['cdnName', {rules: [{required: true, message: 'CDN名称不能为空'}] }]" />
          </a-form-item>
          <a-form-item label="域名地址" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
            <a-input v-decorator="['domainName', {rules: [{required: true, message: '域名地址不能为空'}] }]" />
          </a-form-item>
          <a-form-item label="链接类型" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
            <a-select v-decorator="['linkType', {rules: [{required: true, message: '请选择链接类型'}] }]">
              <a-select-option value="">请选择链接类型</a-select-option>
              <a-select-option value="0">HTTP</a-select-option>
              <a-select-option value="1">MQTT</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="备注" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
            <a-textarea v-decorator="['remark']" :rows="4"></a-textarea>
          </a-form-item>
        </a-form>
      </a-modal>

  </section>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle } from "vue-decorators";

const formOptions = {
  vform0: 'id',
  vform1: 'id'
}

@Component({ formOptions })
export default class CdnManagerMent extends Vue { 
  loading = false;
  confirmLoading = false;
  
  modalInfo = { show: false, type: 'add', id: '' }

  table = {
    dataSource: [],
    columns: [
      { title: "CND名称", dataIndex: "cdnName" },
      { title: "域名地址", dataIndex: "domainName" },
      { title: "链接类型", dataIndex: "linkType", scopedSlots: { customRender: 'linkType' } },
      { title: "备注", dataIndex: "remark" },
      { title: "创建时间", dataIndex: "createTime" },
      { title: "操作", dataIndex: "operation", scopedSlots: { customRender: "operation" }, align: 'center' }
    ],
    pagination: { total: 0, current: 1 }
  }

  query = {
    pageNo: 1,
    pageSize: 10
  }

  @Lifecycle mounted() {
    this.getList();
  }

  async doModidyCDN(record) {
    this.modalInfo.show = true;
    this.modalInfo.type = 'modify';
    this.modalInfo.id = record.id;
    this.vform1.setValues(record, true);
  }

  /**
   * 添加或者修改cdn 根据 modalInfo.type来判断
   */
  async submit() {
    const form = await this.vform1.validate();
    if (form.errors) return

    const requestUrl = this.modalInfo.type === 'add' ? '/config-admin-api/cdnDomain/addCdnInfo' : '/config-admin-api/cdnDomain/editCdnInfo';
    const params = form.values;

    if (this.modalInfo.type !== 'add') params.id = this.modalInfo.id;

    this.confirmLoading = true;
    const res = await this.$service.fetch(requestUrl, params);
    this.confirmLoading = false;

    if (res.code !== 1) return this.$message.error(res.message);

    this.$message.success(res.message);
    this.modalInfo.show = false;
    this.getList();
  }

  async deleteCDN(record) {
    if (!await this.$confirm({title: '确定要删除吗'})) return
    const res = await this.$service.fetch('/config-admin-api/cdnDomain/removeCdnInfo', {id: record.id});
    if (res.code !== 1) return this.$message.error(res.message);
    this.$message.success(res.message);
    this.getList();
  }

  resetPagination() {
    this.table.pagination.current = 1;
    this.query.pageNo = 1;
  }

  changePagination(pagination) {
    this.table.pagination.current = pagination.current;
    this.query.pageNo = pagination.current;
    this.getList();
  }

  async getList(refresh) {  
    if (refresh) this.resetPagination();

    const form = await this.vform0.validate();
    if (form.errors) return 
    this.loading = true;
    const res = await this.$service.fetch('/config-admin-api/cdnDomain/queryPageCdnInfo', Object.assign(this.query, form.values));
    this.loading = false;
    if (res.code !== 1) return this.$message.error(res.$message);
    
    if (res.data?.records instanceof Array) {
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
.myform-cdn /deep/{
  .ant-form-item {
    margin-bottom: 15px;
  }
}

</style>