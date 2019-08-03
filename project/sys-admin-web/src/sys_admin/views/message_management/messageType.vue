<template>
  <div class="page-container">
    <div class="mt15">
      <a-form layout="inline" :form="form">
        <a-form-item label="创建时间">
          <a-range-picker allowClear @change="onChange" format="YYYY-MM-DD HH:mm:ss" />
        </a-form-item>
        <a-form-item label="创建人" style="margin:0px 10px;">
          <a-input v-model.trim="params.adminName" />
        </a-form-item>
        <a-form-item label="分类名称" style="margin:0px 10px;">
          <a-input v-model="params.typeName" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" ref="btnSave"  @click="_query">查询</a-button>
          <a-button type="primary" ref="addClassType"  @click="_editAndAdd()">添加</a-button >
        </a-form-item>
      </a-form>
    </div>
    <div class="mt15">
      <a-table :columns="table.columns" :dataSource="table.tableData" :pagination="false" :rowKey="e => e.id" class="mytable" bordered >
        <template slot="status" slot-scope="r, t">{{ dictionary.thirdTransferStatus.get(t.status) }}</template>
        <template slot="codeAndId" slot-scope="r, t">{{ t.platformCode + "" + t.userId }}</template>
        <template slot="type" slot-scope="r, t">
					{{ r == "IN" ? "第三方转AK钱包" : r == "OUT" ? "AK钱包转第三方" : "" }}
				</template>
        <template slot="operate" slot-scope="r, text">
          <a-button type="primary" size="small" @click="_editAndAdd(text)" v-permission="10143">修改</a-button >
          <a-button type="primary" size="small" @click="_removeMessageType(text)" v-permission="10144">删除</a-button >
        </template>
      </a-table>
      <div style="text-align:right;padding-top:20px;">
        <a-pagination :current="pagination.pageNo" :total="pagination.total" @change="changePagination" />
      </div>
    </div>
    <a-modal title="添加分类" v-model="modalShow" :footer="null" :destroyOnClose="true" :maskClosable="false" >
      <div style="text-align:left;">
        <a-form :form="form">
          <a-form-item label="分类名称" v-bind="formItemLayout">
            <a-input v-decorator="['messageTypeName', { initialValue: details.typeName, rules: [{ required: true, message: '请输入分类名称' }] } ]" ></a-input>
          </a-form-item>
          <div style="text-indent:110px;">
            <a-button type="primary" @click="_editAndAddEnter">保存</a-button>
          </div>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script>
import Vue from "vue";
import { Component, InjectComponents, Computed, Lifecycle, Watch } from "vue-decorators";
import moment from "moment"
@Component({})
@InjectComponents({})
export default class ChangeRecord extends Vue {
	modalShow=false;
	formItemLayout={ labelCol: { span: 6 }, wrapperCol: { span: 15 }, };
  pagination = {total:0,pageNo:1,pageSize:10 };
  table = {
		tableData:[],
    columns: [
      { title: "分类名称", dataIndex: "typeName" },
      { title: "创建时间", dataIndex: "createTime" },
      { title: "创建人", dataIndex: "adminName" },
			{ title: "操作", scopedSlots: { customRender: "operate" } }
    ]
	};
	params={
		adminName: "",
		startTime: "",
		endTime: "",
		typeName: "",
	}
	details={};
	/* 添加系统类别和修改模态框 */
	_editAndAdd(obj){
		this.modalShow=true;
		if(obj) return this.details=obj;
		this.details={};
	}
	/* 添加系统类别和修改系统类别确 */
	async _editAndAddEnter(){
		await this.form.validateFields(async(err, values) => {
			if (err) return;
			if(Object.keys(this.details).length){
				let res = await this.$service.fetch("/config-admin-api/messageType/editMessageType",{...values,id:this.details.id});
				if (1!==res.code) return res.message && this.$message.error(res.message);
				this.$message.success(res.message);
				this.modalShow=false;
				this._queryPageMessageType();
				return;
			}
			let res = await this.$service.fetch("/config-admin-api/messageType/addMessageType",values);
			if (1!==res.code) return res.message && this.$message.error(res.message);
			this.$message.success(res.message);
			this.modalShow=false;
			this._queryPageMessageType();
		});
	}
	onChange(date, dateString){
		this.params.startTime=moment(dateString[0]).format('YYYY-MM-DD')+' 00:00:00';
		this.params.endTime=moment(dateString[1]).format('YYYY-MM-DD')+' 23:59:59';
	}
  async changePagination(p, s) {
    this.pagination.pageNo = p;
    this.pageSize = s;
    await this._queryPageMessageType();
  }
	_query(){
		this.pagination.pageNo=1;
		this._queryPageMessageType();
	}
	/** 分页查询消息类别 */
  async _queryPageMessageType() {
		let res = await this.$service.fetch("/config-admin-api/messageType/queryPageMessageType",Object.assign(this.params,this.pagination));
		if (1!==res.code) return res.message && this.$message.error(res.message);
		this.table.tableData = res.data.records;
		this.pagination.total = res.data.totalCount;
	}
	async _removeMessageType(obj) {
		if (!await this.$confirm({content: '确定删除当前操作数据?'})) return;
		let res = await this.$service.fetch("/config-admin-api/messageType/removeMessageType",{id:obj.id});
		if (1!==res.code) return res.message && this.$message.error(res.message);
		this.$message.success(res.message);
	}
  @Lifecycle() async created() {
		this.form = this.$form.createForm(this);
		this._queryPageMessageType();
	}
}
</script>
<style lang="scss" scoped>
@import "@views/admin/Pop.scss";
.page-container /deep/ {
  position: relative;
  height: 100%;
  .ant-btn-primary {
    margin-right: 5px;
  }
  .tab-switch-list.tab-sty1 {
    float: left;
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
  .status-select /deep/ {
    .ant-select-selection {
      width: 100px;
    }
  }

  .ant-tabs-nav-wrap {
    height: 26px;
    border-bottom: solid 2px #009688;
    .ant-tabs-nav .ant-tabs-tab-active {
      color: white;
      background-color: #009688;
    }
    .ant-tabs-ink-bar.ant-tabs-ink-bar-animated {
      display: none !important;
    }
    .ant-tabs-nav .ant-tabs-tab {
      padding: 3px 15px;
    }
  }
}
</style>