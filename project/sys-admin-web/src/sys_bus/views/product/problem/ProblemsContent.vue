<template>
  <div class="page-container">
    <div class="mt200">
        <a-form layout="inline" :form="vform1" @submit.prevent="_queryPageFaqType(true)">
            <a-form-item label="问题标题">
                <a-input v-decorator="['title']" ></a-input>
            </a-form-item>
            <a-form-item label="问题分类" style="margin-left: 500px;">
                <a-select  style="width: 120px;" v-decorator="['faqTypeId', { rules: [{required:false,message:'问题不能超过20个字符',pattern:/\S/}]}]" placeholder="请选择分类">
                    <a-select-option value="">全部</a-select-option>
                    <a-select-option v-for="(d, i) in questions" :value="`${d.id}`" :key="i">{{d.typeName}}</a-select-option>
                    <!-- <a-select-option value="2">支付相关</a-select-option> -->
                </a-select>
            </a-form-item>
            <a-form-item label="是否热门" style="margin-left: 30px;">
                <a-select style="width: 100px;" v-decorator="['isHot']">
                    <a-select-option value="">全部</a-select-option>
                    <a-select-option value="0">否</a-select-option>
                    <a-select-option value="1">是</a-select-option>
                </a-select>
            </a-form-item>
            <a-form-item style="margin-left: 20px;">
            <a-button type="primary" html-type="submit">查询</a-button>
            </a-form-item>
        </a-form>    
    </div>
	<div class="mt15"><a-button   v-permission="20324"  type="primary" @click="_add()">添加</a-button></div>
    <div class="mt15">
        <a-table class="mytable" :columns="table.columns" :dataSource="table.tableData" :pagination="paginationParams" :rowKey="(r, i) => i" @change="changeTablePagenation" bordered>
           <template slot="isHot" slot-scope="text, record">
						<span v-show="record.isHot == 0">否</span>
						<span v-show="record.isHot == 1">是</span>
					</template>
          <template slot="operate" slot-scope="r, text">
            <a-button  v-permission="20325" type="primary" size="small" @click="_edit(text, r.id)">编辑</a-button>
            <a-popconfirm title="确定删除吗?" @confirm="_remove(r.id)" okText="确定" cancelText="取消">
                <a-button  v-permission="20326" type="primary" size="small" >删除</a-button>
            </a-popconfirm>
          </template>
		    </a-table>
    </div>
	<a-modal :title="flag==='edit'?`修改常见问题`:`添加常见问题`" v-model="modalShow" :footer="false" :destroyOnClose="true" :maskClosable="false">
		<div style="text-align:left;">
            <a-form :form="vform2" @submit.prevent="flag==='edit'?_editEnter():_addEnter(true)">
                <a-form-item label="问题分类" v-bind="formItemLayout">
                    <!-- <a-select placeholder="请选择" v-decorator="['faqTypeId',{rules: [{required:true,message:'该项为必选项'}]}]">
                        <a-select-option v-for="(d, i) in contentType" :value="`${d.faqTypeId}`" :key="i" >{{d.contentTypeName}}</a-select-option>
                    </a-select> -->
                    <a-select v-decorator="['faqTypeId', { rules: [{required:true,message:'问题标题必须不为空',pattern:/\S/}]}]" placeholder="请选择问题分类">
                      <a-select-option v-for="(d, i) in questions" :value="`${d.id}`" :key="i">{{d.typeName}}</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item  label="问题标题" v-bind="formItemLayout">
                    <a-textarea v-decorator="['title', {rules: [{required:true,message:'问题标题必须不为空且长度不超过20个字符',pattern:/^\S{0,20}$/ }]}]" :rows="2"></a-textarea>
                </a-form-item>
                <a-form-item  label="回答内容" v-bind="formItemLayout">
                    <a-textarea v-decorator="['content', {rules: [{required:true,message:'回答内容必须不为空',pattern:/\S/}]}]" :rows="4"></a-textarea>
                </a-form-item>
                <a-form-item  label="排序" v-bind="formItemLayout">
                    <a-input v-decorator="['sortOrder', {rules: [{required:true,message:'排序不能超过5个字符',pattern:/^[0-9]{0,5}$/}]}]" :rows="4"></a-input>
                </a-form-item>
                <a-form-item  label="热门" v-bind="formItemLayout">
                    <a-radio-group v-decorator="['isHot',{rules: [{required:true}]}]">
                        <a-radio value="1">是</a-radio>
                        <a-radio value="0">否</a-radio>
                    </a-radio-group>
                    <p style="color:#FF0000;text-align: center;">最多可设置6个热门问题</p>
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
	  flag="add";
    details = {};
    question = {};
    questions = [];
    paginationParams={ pageNo: 1, total: 0, pageSize: 0 };
    init = { pageNo: 1, pageSize: 10};
    params = { pageNo: 1, pageSize: 10, faqTypeId: '', isHot: '', title: ''}
    table = {
		tableData:[],
        columns: [
            { title: "问题标题", dataIndex: "title" },
            { 
              title: "问题分类",
              dataIndex: "faqTypeId"
            },
            { title: "回答内容", dataIndex: "content" },
            { title: "排序", dataIndex: "sortOrder" },
            { 
              title: "热门", 
              scopedSlots: {
						    customRender: 'isHot'
              }
            },
            { title: "已解决次数", dataIndex: "resolvedTimes" },
            { title: "未解决次数", dataIndex: "unresolvedTimes" },
            { title: "操作", scopedSlots: { customRender: "operate" } }
        ]
    };
	
    setInitialValues() {
      this.vform1.setValues({
        isHot: '',
        faqTypeId: ''
      }, true);
      this.vform2.setValues({
        title: '',
        content: '',
        sortOrder: '',
        isHot: 1
      }, true);
    }

  @Mutation('setQuestionId') setQuestionId;
  @State(state => state.questionId) id;

    /** 翻页查询问题详情 */
    changeTablePagenation(pagination) {
      this.init.pageNo = pagination.current;
      this.paginationParams.pageNo = pagination.current;
      this.params.pageNo = pagination.current;
      this.paginationParams.current = pagination.current;
      this._queryPageFaqType();
    }

    resetPagination() {
      this.paginationParams.current = 1;
      this.paginationParams.pageNo = 1;
      this.init.pageNo = 1;
      this.params.pageNo = 1;
    }
    /**获取查询参数 */
    async _queryPageFaqType(refresh) {
      if (refresh) this.resetPagination();
      const form = await this.vform1.validate();
      if (form.errors) return
      const res = await this.$service.fetch("/config-admin-api/faq/queryPageFaq", Object.assign(form.values, this.init));
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
      this.details={};
    }

    _edit(details, id){
      this.flag="edit";
		  this.details=details;
      this.modalShow=true;
      this.getInitInfoOfEdit(id);
    }
    /** 添加常见问题分类 */
    async _addEnter(refresh){
      if (refresh) this.resetPagination();
      const form = await this.vform2.validate();
      if (form.errors) return
      form.values.faqTypeId = Number(form.values.faqTypeId);
      form.values.isHot = Number(form.values.isHot);
      form.values.sortOrder = Number(form.values.sortOrder);
      let res = await this.$service.fetch("/config-admin-api/faq/addFaq",form.values);
      if (1 !== res.code) return res.message && this.$message.error(res.message);
      this.modalShow = false;
      this.$message.success(res.message);
      this.getInitTableInfo();
    }
    /** 根据id获取编辑信息 */
    async getInitInfoOfEdit(id) {
      let res = await this.$service.fetch("/config-admin-api/faq/getFaq", {id: id});
      if(1!==res.code) return res.message && this.$message.error(res.message);
      if(res.data) {
        this.vform2.setValues({
          faqTypeId: res.data.faqTypeId,
          title: res.data.title,
          content: res.data.content,
          sortOrder: res.data.sortOrder,
          isHot: res.data.isHot
        }, true);
        this.setQuestionId(res.data.id)
      }
    }
    /** 编辑分类方法*/
    async _editEnter(){
      const form = await this.vform2.validate();
      if (form.errors) return
      form.values.faqTypeId = Number(form.values.faqTypeId);
      form.values.isHot = Number(form.values.isHot);
      form.values.sortOrder = Number(form.values.sortOrder);
      form.values.id = this.id;
  
      let res = await this.$service.fetch("/config-admin-api/faq/editFaq",form.values);
      if(1!==res.code) return res.message && this.$message.error(res.message);
      this.$message.success(res.message);
      this.modalShow = false;
      this.getInitTableInfo();
    }
    /** 删除常见分类方法 */
    async _remove(removeid){
      let res = await this.$service.fetch("/config-admin-api/faq/removeFaq",{id: removeid});
      if(1!==res.code) return res.message && this.$message.error(res.message);
      this.$message.success(res.message);
      this.getInitTableInfo();
    }
    /** 初始化表格获取参数 */
    async getInitTableInfo(refresh) {
      if (refresh) {this.paginationParams.pageNo = 1;}
      let res = await this.$service.fetch('/config-admin-api/faq/queryPageFaq', this.params);
      if (res.code !== 1) return res.message && this.$message.error(res.message);
        if (res.data?.records instanceof Array) {
          this.table.tableData = Object.freeze(res.data.records);
          this.paginationParams.total = res.data?.totalCount;
        } else {
          this.table.tableData = [];
          this.paginationParams.total = 1;
        }
    }
    /**初始化下拉选择框数据 */
    async getQuestion() {
      const res = await this.$service.fetch("/config-admin-api/faqType/queryAllFaqType");
      if (res.code !== 1) return res.message && this.$message.error(res.message);
      if (res?.data) {
        this.questions = res.data;
      }
    }
    @Lifecycle() async created() {
        this.setInitialValues();
        await this.getInitTableInfo(true);
        await this.getQuestion()
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
