<template>
  <section class="share-wrapper share-setting-wrapper">
	  <div class="promo-list-bd">
		  <a-form layout="inline">
			<div class="mt15">
				<a-form-item label="配置组">
					<a-select placeholder="配置组" style="width: 130px" :allowClear="true"  v-model="queryForm.groupId">
						<a-select-option v-for="(item,i) in configGroupQueryAllByListData" :key="i" :value="item.id">{{item.groupName}}</a-select-option>
					</a-select>
				</a-form-item>
				<a-form-item label="配置组编码">
					<a-input placeholder="配置组编码" v-model.trim="queryForm.groupCode"/>
				</a-form-item>
				<a-form-item label="配置项编码">
					<a-input placeholder="配置项编码" v-model.trim="queryForm.itemKey"/>
				</a-form-item>
				<a-form-item>
					<a-button-group>
						<a-button type='primary' @click='()=>{this.queryForm.groupId="";this.queryForm.itemKey="";this.queryForm.groupCode=""}'>重置</a-button>
          				<a-button type='primary' @click="_configItemQueryByPage">查询</a-button>
					</a-button-group>
				</a-form-item>
				</div>
    	</a-form>
	  </div>
		<div class="page-under-table mt15">
			<a-form layout="inline">
			<a-form-item style="margin-bottom:20px;">
					<a-button type='primary' @click="showPormotionDialog({title:'添加配置项',sn:'add',data:null})" v-permission="10122">添加配置项</a-button>
				</a-form-item>
				<a-table class="mytable" :rowKey="(r,i)=>i" @change="changeTablePagenation" :pagination="paginationParams" :columns="table.columns" :dataSource="table.dataSource"  >
					<template slot="itemKey" slot-scope="text,record">
						<p class="intro-width" :title="record.itemKey">{{record.itemKey}}</p>
					</template>
					<template slot="itemValue" slot-scope="text,record">
						<p class="intro-width" :title="record.itemValue">{{record.itemValue}}</p>
					</template>
					<template slot="remark" slot-scope="text,record">
						<p class="intro-width" :title="record.remark">{{record.remark}}</p>
					</template>
					<template slot="operation" slot-scope="text,record">
					<a-button type='primary' size='small' @click="showPormotionDialog({title:'编辑配置项',sn:'edit',data:record})" v-permission="10123">编辑</a-button>&nbsp;
					 <!-- <a-button type='primary' size='small' @click="deleteItem({data:record})" v-permission="10124">删除</a-button> -->
					</template>
				</a-table>
			</a-form>
		</div>
	<a-modal  :maskClosable="false" :destroyOnClose="true" :title="modal.title" @ok="enterDialog()" v-model="modal.showModal" :centered="true" :confirmLoading="modal.confirmLoading" width="30%">
	<a-form layout="inline" :form="form">
		 <div class="mt10">
		 <a-form-item label="配置组">
			<a-select showSearch :disabled="modal.sn==='edit'" :filterOption="filterOption" style="width: 230px"
				 v-decorator="['groupId',{initialValue:formHack.groupId,rules:[{required: modal.sn === 'edit' ? 'true' : 'flase',message: '该项为必填项' }]}]">
					<a-select-option v-for="(item,i) in configGroupQueryAllByListData" :key="i" :value="item.id">{{item.groupName}}</a-select-option>
				</a-select>
		 </a-form-item>
		 </div>
		 <div class="mt10">
		 <a-form-item label="配置项键">
			<a-input style=" width: 230px;" :disabled="modal.sn==='edit'" placeholder="" type="text" v-decorator="['itemKey',{initialValue:formHack.itemKey,rules: [{ required: true, message: '该项为必填项!' }]} ]"/>
		 </a-form-item>
		 </div>
		 <div class="mt10">
		 <a-form-item label="配置项值">
			<a-input style=" width: 230px;" placeholder="" type="text" v-decorator="['itemValue',{initialValue:formHack.itemValue,rules: [{ required: true, message: '该项为必填项!' }]} ]"/>
		 </a-form-item>
		 </div>
		 <div class="mt10">
		 <a-form-item label="配置项说明">
			<a-input style=" width: 230px;" placeholder="" type="text" v-decorator="['remark',{initialValue:formHack.remark,rules: [{ required: true, message: '该项为必填项!' }]} ]"/>
		 </a-form-item>
		 </div>
		</a-form>
    </a-modal>
  </section>
</template>

<script>
import Vue from 'vue'
import { Component, Lifecycle,  InjectComponents} from 'vue-decorators';
import moment from 'moment';
import * as Api from '@api/configs';
import {Message,Modal} from 'ant-design-vue';
@Component({ methods:{ moment }})
export default class ConfigurationItem extends Vue {

	// 表格
	table = {
		dataSource: [],
		columns: [
		{title: 'ID', dataIndex: 'id'},
		// {title: '商户名称', dataIndex: 'platformName'},
		{title: '配置组名称', dataIndex: 'groupName'},
		{title: '配置组编码', dataIndex: 'groupCode'},
		{title: '配置项键', dataIndex: 'itemKey', scopedSlots: {customRender: 'itemKey'}},
		{title: '配置项值', dataIndex: 'itemValue', scopedSlots: {customRender: 'itemValue'}},
		{title: '说明', dataIndex: 'remark', scopedSlots: {customRender: 'remark'}},
		{title: '创建时间', dataIndex: 'createTime'},
		{title: '操作', dataIndex: 'operation', scopedSlots: {customRender: 'operation'}}
		]
	}
	// itemCode: "",itemName: ""
	queryForm={ groupId:"", groupCode: "",  itemKey: "", pageNo: 1, pageSize: 10 };

	formHack={};

	configItemQueryByPageData=[];
	configGroupQueryAllByListData=[];

	/* 分页数据模型 */
	paginationParams={ pageNo: 1, total:0 };

	// 弹窗里面用到的数据
	modal = { title:"", showModal: false, confirmLoading: false,sn:"",data:null};

	filterOption(input, option){
		return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0;
	}



	/** 删除配置项 */
    async deleteItem({data}) {
      Modal.confirm({
        title: `删除提示`,
        content: `您确认删除该项记录吗?`,
        onOk: async () => {
          const { data: res } = await Api.configItemRemoveById({ id:data.id });
          if (res?.body?.code === 1) {
            Message.success(res.body.message);
			this._configItemQueryByPage();
		  }
        }
      });
	}
	
	/* 公共显示modal */
	async showPormotionDialog(obj) {
		this.modal.title=obj.title;
		this.modal.showModal = true;
		this.modal.sn=obj.sn;
		this.formHack={};
		if(this.modal.sn==='edit'){
			let { data: req } =	await Api.configItemQueryDetail({id:obj.data.id});
				if (req?.body?.code === 1) {
					this.formHack=req.body.data;
			}
		}
	}
	async enterDialog(){
		this.form.validateFields(async (err, values) => {
        if (!err) {
				var req;
				if(this.modal.sn=='add'){ //如果是新增
					req =await Api.configItemAdd(values);
				}else{ //否则编辑
					req =await Api.configItemEdit(Object.assign(values, {id: this.formHack.id}));
				}
				if (req?.data?.body?.code === 1) {
					Message.success(req.data.body.message);
					this.modal.showModal = false;
					this._configItemQueryByPage();
			}
        }
      });
	}
	// 切换分页 
  changeTablePagenation(pagination) {
	this.queryForm.pageNo = pagination.current;
	this.paginationParams.pageNo = pagination.current;
	this._configItemQueryByPage();
	}

	/* 获取配置项分页列表 */
	async _configItemQueryByPage(){
		let { data: req } =	await Api.configItemQueryByPage(this.queryForm);
		  if (req?.body?.code === 1) {
			  this.table.dataSource=req.body.data.records;
			  this.paginationParams.total=req.body.data.totalCount;
		}
	}

	/* 获取商户平台信息 */
	async _platformQueryAllByList(){
		let { data: req } =	await Api.platformQueryAllByList({});
		  if (req?.body?.code === 1) {
			  this.configItemQueryByPageData=req.body.data;
		}
	}

	/* 获取配置组列表信息渲染select */
	async _configGroupQueryAllByList(){
		let { data: req } =	await Api.configGroupQueryAllByList({});
		  if (req?.body?.code === 1) {
			  this.configGroupQueryAllByListData=req.body.data;
		}
	}

	@Lifecycle created() {
	   this.form = this.$form.createForm(this);
	   this._configItemQueryByPage();
	   this._platformQueryAllByList();
	   this._configGroupQueryAllByList();
	}

	

}
</script>


<style lang="scss" scoped>
.share-wrapper {
	height: 100%;
	overflow-y: auto;
}
.intro-width {
	max-width: 200px;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
}

.mt10{
	.ant-form-item-label{
		min-width:100px;
	}
}
</style>