<template>
  <div class="page-container">
    <div class="mt200">
        <a-form layout="inline" :form="vform1" @submit.prevent="_queryPageFaqType(true)">
            <a-form-item label="在线客服">
                <a-button type="primary" @click="_add()">添加</a-button>
            </a-form-item>
            <a-form-item label="内容" style="margin-left: 500px;">
                <a-input v-decorator="['content']"></a-input>
            </a-form-item>
            <a-form-item label="类型" style="margin-left: 30px;">
                <a-select style="width: 100px;" v-decorator="['type']">
                    <a-select-option value="">全部</a-select-option>
                    <a-select-option value="0">第三方客服链接</a-select-option>
                    <a-select-option value="1">QQ</a-select-option>
                </a-select>
            </a-form-item>
            <a-form-item style="margin-left: 20px;">
                <a-button type="primary" html-type="submit">查询</a-button>
            </a-form-item>
        </a-form>    
    </div>
    <div class="mt15">
      <a-table class="mytable" :columns="table.columns" :dataSource="table.tableData" :pagination="paginationParams" :rowKey="(r, i) => i" @change="changeTablePagenation" bordered>
        <template slot="isPopup" slot-scope="text, record">
          <span v-show="record.isPopup == 1">是</span>
          <span v-show="record.isPopup == 0">否</span>
        </template>
        <template slot="type" slot-scope="text, record">
          <span v-show="record.type == 1">第三方客服链接</span>
          <span v-show="record.type == 2">QQ</span>
          <span v-show="record.type == 3">微信</span>
        </template>
        <template slot="options" slot-scope="text, record">
          <!-- <span>{{getText(record)}}</span> -->
          <span>{{ record.isH5Enabled == 1 ? "H5, ":""}} {{record.isAndroidEnabled == 1 ? "Android, ":""}} {{record.isPcEnabled == 1 ? "PC端, ":""}}  {{ record.isIosEnabled == 1 ? "Ios":"" }}</span>
        </template>
        <template slot="operate" slot-scope="r, text">
            <a-button type="primary" size="small" @click="_edit(text, r.id)">编辑</a-button>
            <a-popconfirm title="确定删除吗?" @confirm="_remove(r.id)" okText="确定" cancelText="取消">
                <a-button type="primary" size="small" >删除</a-button>
            </a-popconfirm>
        </template>
		  </a-table>
    </div>
	<a-modal :title="flag==='edit'?`修改在线客服`:`添加在线客服`" v-model="modalShow" :footer="false" :destroyOnClose="true" :maskClosable="false" @cancel="_cancel">
		<div style="text-align:left;">
            <a-form :form="vform2" @submit.prevent="flag==='edit'?_editEnter(true):_addEnter(true)">
                <a-form-item label="编号" v-bind="formItemLayout">
                   <a-input v-decorator="['id', {rules: [{required:true,message:'编号必须为数字',pattern:/^[0-9]+([.]{1}[0-9]+){0,1}$/}]}]" :readOnly="isReadOnly"></a-input>
                </a-form-item>
                <a-form-item  label="备注" v-bind="formItemLayout">
                    <a-input v-decorator="['remark', {rules: [{required:true,message:'问题标题必须不为空',pattern:/\S/}]}]" placeholder="编辑备注"></a-input>
                </a-form-item>
                <a-form-item  label="类型" v-bind="formItemLayout">
                    <a-select v-decorator="['type']">
                        <a-select-option v-for="(d, i) in ServiceType" :value="`${d.type}`" :key="i" >{{d.serviceTypeName}}</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item  label="内容" v-bind="formItemLayout">
                    <a-input v-decorator="['content', {rules: [{required:true,message:'内容不能为空',pattern:/\S/}]}]"  placeholder="编辑内容"></a-input>
                </a-form-item>
                <a-form-item  label="显示" v-bind="formItemLayout">
                    <a-checkbox-group :options="plainOptions" v-decorator="['plainOptions',{rules: [{required:true}]}]"/>
                </a-form-item>
                <a-form-item  label="新窗口打开" v-bind="formItemLayout">
                   <a-switch checkedChildren="是" unCheckedChildren="否" v-decorator="['isPopup', { valuePropName: 'checked' }]"/>
                </a-form-item>
                <div style="text-align: center;">
                    <a-button type='primary' html-type="submit">保存</a-button>
                </div>
            </a-form>
        </div>
    </a-modal>
  </div>
</template>

<script>
import Vue from "vue";
import { Component, InjectComponents, Lifecycle, Watch, Mutation, State } from "vue-decorators";

@Component({ formOptions: {
  vform1: "id",
  vform2: "id"
} })
export default class ProblemsClassification extends Vue {
	formItemLayout={ labelCol: { span: 6 }, wrapperCol: { span: 15 }, };
    modalShow=false;
    isReadOnly = false;
	  flag="add";
    details = {};
    question = {};
    paginationParams={ pageNo: 1, total: 0, pageSize: 0 };
    plainOptions = [
        {
            label: "PC端",
            value:  'isPcEnabled'
        },
        {
            label: "H5",
            value: 'isH5Enabled'
        },
        {
            label: 'IOS',
            value: 'isIosEnabled'
        },
        {
            label: 'Android',
            value: 'isAndroidEnabled'
        }
    ];
    InitOptions = {isAndroidEnabled: 0, isIosEnabled: 0, isH5Enabled: 0, isPcEnabled: 0 };
    init = { pageNo: 1, pageSize: 10};
	  params = { pageNo: 1, pageSize: 10, content: '', type: '' };
    table = {
      tableData:[],
          columns: [
              { title: "ID", dataIndex: "id" },
              { title: "内容", dataIndex: "content" },
              { title: "备注", dataIndex: "remark" },
              { title: "类型", scopedSlots: { customRender: "type"} },
              { title: "显示", scopedSlots: { customRender: "options" }},
              { title: "是否弹窗", scopedSlots: { customRender: "isPopup"}  },
              { title: "操作", scopedSlots: { customRender: "operate" } }
          ]
    };
    ServiceType = [
        {
            type: 1,
            serviceTypeName: '第三方客服链接'
        },
        {
            type: 2,
            serviceTypeName: 'QQ'
        },
        {
            type: 3,
            serviceTypeName: '微信'
        },   
    ];
	
    setInitialValues() {
      this.vform1.setValues({
        type: '',
        content: ''
      }, true);
      this.vform2.setValues({
        type: 1,
        isPopup: true,
        remark: '',
        content: ''
      }, true);
    }

   
    getText(record) {
      if(record.isAndroidEnabled == 1)  return "Android";
      if (record.isH5Enabled == 1) return "H5";
      if (record.isIosEnabled == 1) return "Ios";
      if(record.isPcEnabled == 1) return "PC端";
    }

    resetPagination() {
      this.paginationParams.current = 1;
      this.params.pageNo = 1;
      this.init.pageNo = 1;
    }

     /** 翻页查询问题详情 */
    changeTablePagenation(pagination) {
      this.init.pageNo = pagination.current;
      this.paginationParams.pageNo = pagination.current;
      this.params.pageNo = pagination.current;
      this.getInitTableInfo();
    }
    /**获取查询参数 */
    async _queryPageFaqType(refresh) {
      if (refresh) this.resetPagination();
      const form = await this.vform1.validate();
      if (form.errors) return
      const res = await this.$service.fetch("/config-admin-api/onlineCustomer/queryPageOnlineCustomer", Object.assign(form.values, this.init));
      if (res.code !== 1) return res.message && this.$message.error(res.message);
      if (res.data?.records instanceof Array) {
        this.table.tableData = Object.freeze(res.data.records);
        this.paginationParams.total = res.data?.totalCount;
      } else {
        this.table.tableData = [];
        this.paginationParams.total = 1;
      }
    }

    _add() {
      this.flag="add";
      this.modalShow=true;
      this.setInitialValues();
    }

    _edit(details, id){
      this.flag="edit";
		  this.details=details;
      this.modalShow=true;
      this.getInitInfoOfEdit(id);
      this.isReadOnly=true;
    }
    _cancel() {
      this.isReadOnly=false;
    }
    /** 添加在线客服 */
    async _addEnter(refresh){
        if (refresh) this.resetPagination();
        const form = await this.vform2.validate();
        if (form.errors) return
        let obj = {};
        form.values.plainOptions.forEach((item, index) => {
            obj[item] = 1
        });
        let selectOptionObj = Object.assign(this.InitOptions, obj);
        delete form.values.plainOptions;
        delete form.values.id;
        if (form.values.isPopup) { form.values.isPopup = 1 } else { form.values.isPopup = 0 };
        let res = await this.$service.fetch("/config-admin-api/onlineCustomer/addOnlineCustomer",Object.assign(form.values, selectOptionObj));
        if (1 !== res.code) return res.message && this.$message.error(res.message);
        this.modalShow = false;
        this.$message.success(res.message);
        this.getInitTableInfo(true);
        this.vform2.setValues({ type: 1, isPopup: true });
    }
    /** 根据id获取编辑信息 */
    async getInitInfoOfEdit(id) {
      let res = await this.$service.fetch("/config-admin-api/onlineCustomer/getOnlineCustomer", {id: id});
      if(1!==res.code) return res.message && this.$message.error(res.message);
      if(res.data) {
        this.vform2.setValues({
          id: res.data.id,
          content: res.data.content,
          title: res.data.title,
          remark: res.data.remark,
          type: res.data.type,
          isPopup: res.data.isPopup == 1 ? true : false,
          isEnabled: res.data.isEnabled,
          plainOptions: [  res.data.isPcEnabled == 1 ? 'isPcEnabled':'', res.data.isH5Enabled == 1 ? 'isH5Enabled':'', res.data.isIosEnabled == 1 ? 'isIosEnabled':'', res.data.isAndroidEnabled == 1 ? 'isAndroidEnabled':'' ]
        }, true);
      }
    }
    /** 修改在线客服*/
    async _editEnter(refresh){
      if (refresh) this.resetPagination();
      const form = await this.vform2.validate();
      if (form.errors) return
      let obj = {};
      form.values.plainOptions.forEach((item, index) => {
          obj[item] = 1
      });
      let selectOptionObj = Object.assign(this.InitOptions, obj);
      delete form.values.plainOptions;
      if (form.values.isPopup) { form.values.isPopup = 1 } else { form.values.isPopup = 0 };
      let res = await this.$service.fetch("/config-admin-api/onlineCustomer/editOnlineCustomer",Object.assign(form.values, selectOptionObj));
      if(1!==res.code) return res.message && this.$message.error(res.message);
      this.$message.success(res.message);
      this.modalShow = false;
      this.isReadOnly=false;
      this.getInitTableInfo();
    }
    /** 删除在线客服详情 */
    async _remove(removeid){
      let res = await this.$service.fetch("/config-admin-api/onlineCustomer/removeOnlineCustomer",{id: removeid});
      if (1!==res.code) return res.message && this.$message.error(res.message);
      this.$message.success(res.message);
      this.getInitTableInfo(true);
    }
    /** 初始化表格获取参数 */
    async getInitTableInfo(refresh) {
      if (refresh) this.resetPagination();
      let res = await this.$service.fetch('/config-admin-api/onlineCustomer/queryPageOnlineCustomer', this.params);
      if (res.code !== 1) return res.message && this.$message.error(res.message);
        if (res.data?.records instanceof Array) {
          this.table.tableData = Object.freeze(res.data.records);
          this.paginationParams.total = res.data?.totalCount;
        } else {
          this.table.tableData = [];
          this.paginationParams.total = 1;
        }
    }
    @Lifecycle() async created() {
        this.setInitialValues();
        await this.getInitTableInfo();
    }
}
</script>

<style lang="scss" scoped>
@import "@views/admin/Pop.scss";
.page-container /deep/ {
  .ant-btn-primary {
    margin-right: 5px;
  }
  .tab-switch-list.tab-sty1 {
    padding-top: 10px;
    margin-right: 30px;
    li {
      height: 25px;
      line-height: 25px;
      button {
        height: 100%;
        width: 90px;
        padding: 0px;
      }
    }
  }
  .ant-input:not(.ant-calendar-picker-input) {
    width: 130px;
  }
  .mt15 {
    margin-top: 10px;
  }
  .ant-table-thead {
    th {
      padding: 16px 2px;
    }
  }
}
</style>
