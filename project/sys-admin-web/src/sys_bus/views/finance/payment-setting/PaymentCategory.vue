<template>
  <section class="bank-setting">
      <div class="info">
          <div class="icon-yellow">
              <a-icon type="question-circle" class="icon-ques"/>
          </div>
          <div>
            <p>快捷支付设置：会根据【快捷支付名称】，去前缀匹配【汇款银行设置】【二维码设置】【在线支付设置】里面的每个实例</p>
            <p>快捷支付名称会在前端形成一个分类标签，根据名称模糊匹配成功的实例会作为列表展示在该分类标签下面</p>
            <p>例如快捷名称是“微信”，那么在【汇款银行设置】【二维码设置】和【在线支付设置】里只要有微信支付渠道的，都会显示在“微信”分类下面</p>
          </div>
      </div>
      <div class="page-under-table">
        <div class="page-btn">
          <a-button v-permission="20075"  type="primary" @click="init.modalShow=true;init.modalType='add'">添加</a-button>&nbsp;
          <a-button v-permission="20076"  type="primary" @click="deleteByIds">删除</a-button>
        </div>
        <a-table 
            :key="table.key"
            class="mytable mt15" bordered :loading="init.loading" :columns="table.columns" :dataSource="table.dataSource" 
            :rowSelection="table.rowSelection" :pagination="false" :rowKey="(e, i) => i"
            @change="changePagination"
        >
          <template slot="iconUrl" slot-scope="text,record">
            <img style="max-width:60px" :src="record.iconUrl"/>
          </template>
          <template slot="isEnabled" slot-scope="text,record">
            <span>{{record.isEnabled == 1 ? "启用":"禁用"}}</span>
          </template>
          <template slot="clientType" slot-scope="text,record">
            <span>{{ $getText(record.clientType,  dictionary.clientType2) }}</span>
          </template>
          <template slot="operate" slot-scope="text,record">
            <a-button v-permission="20077"  type="primary" size="small" @click="modify(record)">修改</a-button>
          </template>
       </a-table> 
      </div>

      <a-modal title="添加" v-model="init.modalShow" :footer="null" :destroyOnClose="true" :width="460" :maskClosable="false">
          <a-form class="form-container" :form="vform" @submit.prevent="submit">
            <a-form-item label="名称" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
              <a-input class="qr-input" v-decorator="['fastPaymentName', {rules: [{required: true, message: '名称不能为空'}] }]" :disabled="init.modalType=='edit'"/>
            </a-form-item>
            <a-form-item label="排序" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
              <a-input class="qr-input" v-decorator="['sortOrder', {rules: [{required: true, message: '排序不能为空'}] }]"/>
            </a-form-item>
            <a-form-item label="图标" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
              <a-row :gutter="8">
                <a-col :span="18">
                  <a-input  v-decorator="['iconUrl']"/>
                </a-col>
                <a-col :span="4">
                  <a-upload name="imageFile" :showUploadList="false" action="#" :beforeUpload="beforeUpload" @change="uploadImage">
                    <a-button type="primary"><a-icon type="upload" />上传</a-button>
                  </a-upload>
                </a-col>
              </a-row>
            </a-form-item>
            <a-form-item label="状态" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
              <a-radio-group v-decorator="['isEnabled', {rules: [{required: true, message: '请选择状态'}] } ]">
                <a-radio value="1">启用</a-radio>
                <a-radio value="0">停用</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="使用端" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
              <a-radio-group v-decorator="['clientType', {rules: [{required: true, message: '请选择使用端'}]}]">
                <!-- <a-radio value="15">通用</a-radio>
                <a-radio value="3">APP</a-radio>
                <a-radio value="8">PC</a-radio>
                <a-radio value="4">H5</a-radio> -->
                <a-radio v-for="(item, index) in dictionary.clientType2" :key="index" :value="item.value">{{item.name}}</a-radio>
              </a-radio-group>
            </a-form-item>
            <div class="text-right page-under-table">
              <a-button type="primary" html-type="submit" :loading="init.loading2">提交</a-button>
              <!-- &nbsp;<a-button type="primary">重置</a-button> -->
            </div>
          </a-form>
      </a-modal> 


  </section>
</template>

<script>
import Vue from 'vue'
import { Component, Lifecycle, Prop, Watch, InjectComponents } from 'vue-decorators'
import { getToken } from "@/util/auth"

@Component({ formOptions: "id",  dictionary: 'clientType2' })
export default class PaymenrCategory extends Vue {
  table = {
    key: 1,
    columns: [
      { title: '编号',  dataIndex: 'id'},
      { title: '快捷支付名称', dataIndex: 'fastPaymentName'}, 
      { title: '快捷支付图标', dataIndex: 'iconUrl', scopedSlots: { customRender: 'iconUrl' } }, 
      { title: '使用状态', dataIndex: 'isEnabled',  scopedSlots: { customRender: 'isEnabled' }}, 
      { title: '使用前端', dataIndex: 'clientType', scopedSlots: { customRender: 'clientType' }}, 
      { title: '排序', dataIndex: 'sortOrder'},
      { title: '操作',  dataIndex: 'operate', scopedSlots: { customRender: 'operate' } }
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

  file = "";
  init = {
    query: { pageNo: 1, pageSize: 10, updateTimeStart: "", updateTimeEnd: "" },
    loading: false,
    modalShow: false,
    editId: "",
    modalType: 'add',
    paymentId: "",
    bankId: "",
    showUserGroup: false,
    loading2: false
  };

  @Lifecycle mounted() {
    if (this.init.modalType === 'add') {
      this.setInitialValue();
    }
    this.getList();
  }

  @Watch('init.modalShow') changeModal(news, olds) {
    if (news && this.init.modalType == 'add') {
      this.setInitialValue();
    }
  }

  setInitialValue() {
    this.vform.setValue('isEnabled', 1);
    this.vform.setValue('clientType', -1);
  }

  beforeUpload(file) {
		this.fileList = [file];
		this.$nextTick(() => this.toUpload());
		return false;
	}

  modify(record) {
    this.init.modalShow = true;
    this.init.modalType = "edit";
    this.init.editId = record.id;
    this.vform.setValues(record, true);
  }

  getClientTypeText(value) {
    value = parseInt(value);
    switch(value) { 
      case 15: return "通用";
      case 8: return "PC"
      case 4: return "H5"
      case 3:  return "APP"
      default: return "通用";
    }
  }

  async toUpload() {
    const formdata = new FormData();
    formdata.append('imageFile', this.fileList[0]);
    formdata.append('token', getToken());
    formdata.append('uploadTypeName', 'paymentCategory');
    const res = await this.$service.fetch('/common-api/upload/uploadAdminImage', formdata);
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
  	this.fileList = [];
    this.vform.setValue("iconUrl", res.data.imageUrl);
  }

  async uploadImage(info) {
    this.file= info;
  }

  changePagination(pagination) {
    this.table.pagination.current = pagination.current;
    this.init.query.pageNo = pagination.current;
    this.table.key =  Math.random();
    this.table.selectedRowKeys = [];
    this.getList();
  }

  resetPagination() {
    this.table.pagination.current = 1;
    this.init.query.pageNo = 1;
    this.table.key =  Math.random();
  }

  async deleteByIds() {
    const ids = this.table.selectedRowKeys.map(item => ({ id: item }));
    if (!ids.length)  {
      this.$message.error("无选中内容");
      return
    }
    if (!await this.$confirm({title: "提示", content: "确定要删除已选中的内容？"})) return;
    const res = await this.$service.fetch('/config-admin-api/fastPayment/batchRemoveFastPayment',{ list: ids });
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.getList(true);
  }

  async getList(refresh) {
    if (refresh) this.resetPagination(); 

    this.init.loading = true;
    const res = await this.$service.fetch('/config-admin-api/fastPayment/queryAllFastPayment');
    this.init.loading = false;

    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.code === 1 &&  res.data instanceof Array) {
      this.table.dataSource = res.data;
      this.table.pagination.total = res.data?.totalCount;
    } else {
      this.table.dataSource = [];
      this.table.pagination.total = 0;
    }
  }
 
  async submit() {
    const form = await this.vform.validate();
    if (form.errors) return;
    this.init.loading2 = true;
    const url = this.init.modalType === 'add' ? '/config-admin-api/fastPayment/addFastPayment' : '/config-admin-api/fastPayment/editFastPayment';
    if (this.init.modalType === 'edit') form.values.id = this.init.editId;
    const res = await this.$service.fetch(url, form.values);
    this.init.loading2 = false;
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    // 添加成功
    this.$message.success(res.message);
    this.init.modalShow = false;
    this.getList();
  }

}

</script>

<style lang="scss" scoped>
.info {
  display: flex;
  .icon-yellow {
    color: #f8da5a;
    .icon-ques {
      font-size: 20px;
      margin-right: 20px;
    }
  }
}
.text-right {
  text-align: right;
  margin-top: 20px;
}
.form-container /deep/ {
  .ant-form-item {
    margin-bottom: 10px;
  }
}
</style>
