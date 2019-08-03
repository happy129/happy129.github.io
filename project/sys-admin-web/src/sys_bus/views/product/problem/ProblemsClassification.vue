<template>
  <div class="page-container">
	<div><a-button v-permission="20320" type="primary" @click="_add()">添加</a-button></div>
    <div class="mt15">
      <a-table class="mytable" :columns="table.columns" :dataSource="table.tableData" :pagination="paginationParams" :rowKey="(r, i) => i" @change="changeTablePagenation" bordered>
        <template slot="operate" slot-scope="r, text">
                  <a-button  v-permission="20321"  type="primary" size="small" @click="_edit(text)">编辑</a-button>
                  <a-popconfirm title="确定删除吗?" @confirm="_remove(r.id)" okText="确定" cancelText="取消">
                      <a-button  v-permission="20322" type="primary" size="small" >删除</a-button>
                  </a-popconfirm>
              </template>
      </a-table>
    </div>
	<a-modal :title="flag==='edit'?`编辑分类`:`添加分类`" v-model="modalShow" :footer="false" :destroyOnClose="true" :maskClosable="false">
		<div style="text-align:left;">
            <a-form :form="form">
                <a-form-item label="分类名称" v-bind="formItemLayout">
                    <a-input v-decorator="['typeName', {initialValue:details.typeName,rules: [{required:true,message:'分类名称不能超过25个字符',pattern:/^\S{0,25}$/}]}]"></a-input>
                </a-form-item>
                    <a-form-item  label="排序" v-bind="formItemLayout">
                <a-input v-decorator="['sortOrder', {initialValue:details.sortOrder, rules: [{required:true,message:'排序不能超过5个字符',pattern: /^\d{0,5}$/ }]}]"></a-input>
                </a-form-item>
                <div style="text-align: center;">
                    <a-button type='primary' @click="flag==='edit'?_editEnter():_addEnter()">保存</a-button>
                </div>
            </a-form>
        </div>
    </a-modal>
  </div>
</template>

<script>
import Vue from "vue";
import { Component, InjectComponents, Lifecycle, Watch } from "vue-decorators";
@Component
export default class ProblemsClassification extends Vue {
	formItemLayout={ labelCol: { span: 6 }, wrapperCol: { span: 15 }, };
	modalShow=false;
	flag="add";
	details = {};
  paginationParams={ pageNo: 1, total:0 };
  init = {pageNo: 1, pageSize: 10}
	params = { id: "" };
  table = {
    tableData:[],
    columns: [
        { title: "分类名称", dataIndex: "typeName" },
        { title: "排序", dataIndex: "sortOrder" },
        { title: "操作", scopedSlots: { customRender: "operate" } }
    ]
	};
	

	  /** 获取问题详情 */
	  async _getfaq(){
      let res = await this.$service.fetch("/config-admin-api/faqType/queryPageFaqType", this.init);
      if(1!== res.code) return res.message && this.$message.error(res.message);
      if(res.data?.records) {
        this.table.tableData = res.data.records;
        this.paginationParams.total = res.data.totalCount;
      }
    }
    /** 翻页查询问题详情 */
    changeTablePagenation(pagination) {
        this.init.pageNo = pagination.current;
        this.paginationParams.pageNo = pagination.current;
        this._queryPageFaqType()
    }

    async _queryPageFaqType() {
        const res = await this.$service.fetch("/config-admin-api/faqType/queryPageFaqType", Object.assign(this.init, {}));
        if (res.code !== 1) return res.message && this.$message.error(res.message);
		this.table.tableData = Object.freeze(res.data.records);
		this.paginationParams.total=res.data.totalCount;
    }

	_add() {
		this.flag="add";
		this.modalShow=true;
		this.details={};
	}

    _edit(details){
        this.flag="edit";
		this.details=details;
		this.modalShow=true;
    }
    /** 添加常见问题分类 */
	async _addEnter(){
		await this.form.validateFields(async(err, values) => {
			if (err) return;
            let res = await this.$service.fetch("/config-admin-api/faqType/addFaqType",{...values});
            if (1 !== res.code) return res.message && this.$message.error(res.message);
            this.$message.success(res.message);
            this.modalShow=false;
            this._getfaq();
		});
    }
    /** 编辑分类方法*/
	async _editEnter(){
		await this.form.validateFields(async(err, values) => {
			if (err) return;
				let res = await this.$service.fetch("/config-admin-api/faqType/editFaqType", {...values,id: this.details.id});
				if(1!==res.code) return res.message && this.$message.error(res.message);
				this.$message.success(res.message);
				this.modalShow=false;
				this._getfaq();
		});
	}
    /** 删除常见分类方法 */
	async _remove(details){
		let res = await this.$service.fetch("/config-admin-api/faqType/removeFaqType",{id: details});
        if(1!==res.code) return res.message && this.$message.error(res.message);
        this.$message.success(res.message);
        this._getfaq();
	}
	
    @Lifecycle() async created() {
        this.form = this.$form.createForm(this);
        await this._getfaq();
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
