<template>
  <div class="page-container">
    <div class="mt15">
      <a-form layout="inline" :form="form">
        <a-form-item label="发送时间">
          <a-range-picker allowClear @change="onChange" format="YYYY-MM-DD HH:mm:ss" />
        </a-form-item>
        <a-form-item label="消息标题" style="margin:0px 10px;">
          <a-input v-model.trim="params.title" />
        </a-form-item>
        <a-form-item label="发送人" style="margin:0px 10px;">
          <a-input v-model.trim="params.adminName" />
        </a-form-item>
				<a-form-item label="消息类别" style="margin:0px 10px;">
						<a-select allowClear v-model="params.messageTypeId"  placeholder="消息类别" style="width:150px;">
            <a-select-option v-for="(item, index) in table.queryAllMessageTypeList" :key="index" :value="item.id">{{item.typeName}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" ref="btnSave" @click="_query">查询</a-button>
          <a-button type="primary" ref="addClassType" @click="_editAndAdd()">发送消息</a-button >
        </a-form-item>
      </a-form>
    </div>
    <div class="mt15">
      <a-table :rowSelection="{selectedRowKeys: table.selectedRowKeys, onChange: onSelectChange}" :columns="table.columns" :dataSource="table.tableData" :pagination="false" :rowKey="e => e.id" class="mytable" bordered >
        <template slot="status" slot-scope="r, t">{{ dictionary.thirdTransferStatus.get(t.status) }}</template>
        <template slot="codeAndId" slot-scope="r, t">{{ t.platformCode + "" + t.userId }}</template>
        <template slot="type" slot-scope="r">
					{{ r == "IN" ? "第三方转AK钱包" : r == "OUT" ? "AK钱包转第三方" : "" }}
				</template>
        <template slot="operate" slot-scope="r, text" >
          <a-button type="primary" size="small" @click="_editAndAdd(text)" v-permission="101491">查看</a-button >
          <a-button type="primary" size="small" @click="_removeMessage(text)" v-permission="10149">删除</a-button >
        </template>
      </a-table>
      <div style="text-align:right;padding-top:20px;display:flex;justify-content:space-between;">
				<a-button type="primary" ref="btnSave" @click="_batchRemoveMessage" v-permission="10148">批量删除</a-button>
        <a-pagination :current="pagination.pageNo" :total="pagination.total" @change="changePagination" />
      </div>
    </div>
    <a-modal title="添加分类" v-model="modalShow" :footer="null" :destroyOnClose="true" :maskClosable="false" >
      <div style="text-align:left;">
        <a-form :form="form">
          <a-form-item  label="消息标题" v-bind="formItemLayout">
            <a-input :disabled="Object.keys(details).length?true:false" placeholder="消息标题" v-decorator="['title', { initialValue: details.title, rules: [{ required: true, message: '请输入消息标题' }] } ]" ></a-input>
          </a-form-item>
          <a-form-item  label="指定商户" v-bind="formItemLayout">
					<div style="display:flex;">
						<a-select :key="keys" :disabled="Object.keys(details).length?true:false" mode="multiple" v-decorator="['list',{initialValue: details.list,rules: [{required: true, message: '请选择商户' }] }]" placeholder="请选择商户">
    					<a-select-option v-for="(item, index) in table.queryAllPlatform" :key="index" :value="item.id">{{item.platformName}}</a-select-option>
  					</a-select>
						<a style="position:absolute;width:100px;left:300px;top:-4px;" @click="_selectAll">&nbsp;全选</a>
						</div>
          </a-form-item>
					
          <a-form-item  label="消息类别" v-bind="formItemLayout">
           <a-select :disabled="Object.keys(details).length?true:false" placeholder="选择消息类别" v-decorator="['messageTypeId', { initialValue: details.messageTypeId,rules: [{ required: true, message: '请选择消息类别' }] }]">
            <a-select-option v-for="(item, index) in table.queryAllMessageTypeList" :key="index" :value="item.id">{{item.typeName}}</a-select-option>
          </a-select>
          </a-form-item>
          <a-form-item label="消息内容" v-bind="formItemLayout">
            <a-textarea  :disabled="Object.keys(details).length?true:false" :rows="4" placeholder="消息内容" v-decorator="['content', { initialValue: details.content, rules: [{ required: true, message: '请输入消息内容' }] } ]" ></a-textarea>
          </a-form-item>
          <div style="text-indent:110px;">
            <a-button type="primary" @click="_addEnter">确定</a-button>
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
		queryAllMessageTypeList:[],
		queryAllPlatform:[],
		selectedRowKeys: [],
		tableData:[],
    columns: [
      { title: "消息标题", dataIndex: "title" },
      { title: "消息类别", dataIndex: "messageTypeName" },
      { title: "发送时间", dataIndex: "createTime" },
      { title: "发送人", dataIndex: "adminName" },
			{ title: "操作", scopedSlots: { customRender: "operate" } }
    ]
	};
	params={
		adminName: "",
		endTime: "",
		messageTypeId:"",
		startTime: "",
		title: ""
	}
	details={};
	keys = 1;
	/* 添加系统类别和修改模态框 */
	async _editAndAdd(obj){
		this.modalShow=true;
		if(obj){
			let res = await this.$service.fetch("/config-admin-api/message/getMessage",{id:obj.id});
			if (1!==res.code) return res.message && this.$message.error(res.message);
			this.details=res.data;
			this.details.list=this.details.platformList.map(item=>item.platformId);
			return;
		};
		this.details={};
	}
	/* 添加系统类别和修改系统类别确 */
	async _addEnter(){
		await this.form.validateFields(async(err, values) => {
			if (err) return;
				/** 查看 */
			if(Object.keys(this.details).length){
				this.modalShow=false;
				return;
			}
			let res = await this.$service.fetch("/config-admin-api/message/addMessage",values);
				if (1!==res.code) return res.message && this.$message.error(res.message);
				this.$message.success(res.message);
				this.modalShow=false;
				this._queryPageMessage();
		});
	}
	/** 时间查询条件 */
	onChange(date, dateString){
		this.params.startTime=moment(dateString[0]).format('YYYY-MM-DD')+' 00:00:00';
		this.params.endTime=moment(dateString[1]).format('YYYY-MM-DD')+' 23:59:59';
	}
	/** 分页查询 */
  async changePagination(p, s) {
    this.pagination.pageNo = p;
    this.pageSize = s;
    await this._queryPageMessage();
	}
	/** 全部选中 */
	_selectAll(){
		this.form.setFieldsValue({'list':this.table.queryAllPlatform.map(item=>item.id)});
		this.keys = this.keys++;
	}
	/** 查询按钮 */
	_query(){
		this.pagination.pageNo=1;
		this._queryPageMessage();
	}
	/** 分页查询消息类别 */
  async _queryPageMessage() {
		let res = await this.$service.fetch("/config-admin-api/message/queryPageMessage",Object.assign(this.params,this.pagination));
		if (1!==res.code) return res.message && this.$message.error(res.message);
		this.table.tableData = res.data.records;
		this.pagination.total = res.data.totalCount;
	}
	/** 单个删除 */
	async _removeMessage(obj) {
		if (!await this.$confirm({content: '确定删除当前操作数据?'})) return;
		let res = await this.$service.fetch("/config-admin-api/message/removeMessage",{id:obj.id});
		if (1!==res.code) return res.message && this.$message.error(res.message);
		this.$message.success(res.message);
		this._queryPageMessage();
	}
	/** 批量删除 */
	async _batchRemoveMessage() {
		if(!this.table.selectedRowKeys.length)return this.$message.error(`请先选择要删除的内容`)
		if (!await this.$confirm({content: '确定批量删除选中的数据吗?'})) return;
		let res = await this.$service.fetch("/config-admin-api/message/batchRemoveMessage",{list:this.table.selectedRowKeys});
		if (1!==res.code) return res.message && this.$message.error(res.message);
		this.table.selectedRowKeys=[];
		this.$message.success(res.message);
		this._queryPageMessage();
	}
	onSelectChange(selectedRowKeys){
		this.table.selectedRowKeys = selectedRowKeys;
	}
	/** 获取消息类别 */
	async _queryAllMessageType(obj) {
		let res = await this.$service.fetch("/config-admin-api/messageType/queryAllMessageType");
		if (1!==res.code) return res.message && this.$message.error(res.message);
		this.table.queryAllMessageTypeList=res.data;
	}
	/** 获取所有商户平台数据 */
	async _queryAllPlatform(obj) {
		let res = await this.$service.fetch("/config-admin-api/platform/queryAllPlatform");
		if (1!==res.code) return res.message && this.$message.error(res.message);
		this.table.queryAllPlatform=res.data;
	}
		
  @Lifecycle() async activated() {
		this._queryPageMessage();
		this._queryAllMessageType();
		this._queryAllPlatform();
	}
	@Lifecycle() async created() {
		this.form = this.$form.createForm(this);
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