<template>
  <section class="share-wrapper share-setting-wrapper">
	  <div class="promo-list-bd">
		  <a-form layout="inline">
			<div class="mt15">
				<a-form-item label="字典组">
					<a-select placeholder="字典组" style="width: 130px" :allowClear="true"  v-model="queryForm.groupId" :dropdownMatchSelectWidth="false">
						<a-select-option v-for="(item,i) in dictionaryGroupQueryAllByListData" :key="i" :value="item.id">{{item.groupName}}</a-select-option>
					</a-select>
				</a-form-item>
				<a-form-item label="字典组编码">
					<a-input placeholder="字典组编码" v-model.trim="queryForm.groupCode"/>
				</a-form-item>
				<a-form-item label="字典项编码">
					<a-input placeholder="字典项编码" v-model.trim="queryForm.itemKey"/>
				</a-form-item>
				<a-form-item>
					<a-button-group>
						<a-button type='primary' @click='()=>{this.queryForm.groupId="";this.queryForm.itemKey="";this.queryForm.groupCode="";}'>重置</a-button>
          				<a-button type='primary' @click="_dictionaryItemQueryByPage(true)">查询</a-button>
					</a-button-group>
				</a-form-item>
				</div>
    	</a-form>
	  </div>
		<div class="page-under-table mt15">
			<a-form layout="inline">
			<a-form-item style="margin-bottom:20px;">
					<a-button type='primary' v-permission="10130" @click="showPormotionDialog({title:'添加字典项',sn:'add',data:null})">添加字典项</a-button>
				</a-form-item>
				<a-table class="mytable" :rowKey="(r,i)=>i" @change="changeTablePagenation" :pagination="paginationParams" :columns="table.columns" :dataSource="table.dataSource"  >
					<template slot="itemValue" slot-scope="text, record">
						<p class="overflow-text">{{record.itemValue}}</p>
					</template>
					<template slot="operation" slot-scope="text,record">
					<a-button type='primary' size='small' v-permission="10131" @click="showPormotionDialog({title:'编辑字典项',sn:'edit',data:record})" >编辑</a-button>&nbsp;
					<a-button type='primary' size='small' v-permission="10132" @click="deleteItem({data:record})" >删除</a-button>
					</template>
				</a-table>
			</a-form>
		</div>

	<a-modal  :maskClosable="false" :title="modal.title" @ok="enterDialog()" v-model="modal.showModal" :centered="true" :confirmLoading="modal.confirmLoading" :destroyOnClose="true" width="30%">
	<a-form layout="inline" :form="form">
		 <div class="mt10">
			 <!-- <a-form-item label="" style="display:none;">
			 <a-input  type="hidden" v-decorator="['id',{initialValue:formHack.id}]"/>
		 	</a-form-item> -->
		 <a-form-item label="字典组">
				<a-select showSearch :disabled="modal.sn==='edit'" :filterOption="filterOption" style="width: 230px" 
				v-decorator="['groupId',{initialValue:formHack.groupId,rules:[{required: modal.sn === 'edit' ? true : false, message: '该项为必填项' }]}]">
					<a-select-option v-for="(item,i) in dictionaryGroupQueryAllByListData" :key="i" :value="item.id">{{item.groupName}}</a-select-option>
				</a-select>
		 </a-form-item>
		 </div>
		 <div class="mt10">
		 <!-- <a-form-item label="字典项名称" v-if="false">
			<a-input style=" width: 230px;" placeholder="" type="text" v-decorator="['name',{initialValue:formHack.name,rules: [{ required: true, message: '该项为必填项!' }]} ]"/>
		 </a-form-item> -->
		 </div>
		 <div class="mt10">
		 <a-form-item label="字典项键">
			<a-input style=" width: 230px;" :disabled="modal.sn==='edit'" placeholder="" type="text" v-decorator="['itemKey',{initialValue:formHack.itemKey,rules: [{ required: true, message: '该项为必填项!' }]} ]"/>
		 </a-form-item>
		 </div>
		 <div class="mt10">
		 <a-form-item label="字典项值">
			<a-input style=" width: 230px;" placeholder="" type="text" v-decorator="['itemValue',{initialValue:formHack.itemValue,rules: [{ required: true, message: '该项为必填项!' }]} ]"/>
		 </a-form-item>
		 </div>
		 <div class="mt10">
		 <a-form-item label="排序">
			<a-input style=" width: 230px;" placeholder="" type="text" v-decorator="['sortOrder',{initialValue:formHack.sortOrder,rules: [{ required: false, message: '该项为必填项!' }]} ]"/>
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
import * as Api from '@api/dictionary';
import {Message,Modal} from 'ant-design-vue';
@Component({ methods:{ moment }})
export default class DictionaryItem extends Vue {

	// 表格
	table = {
		dataSource: [],
		columns: [
		{title: 'ID', dataIndex: 'id'},
		{title: '所属字典组', dataIndex: 'groupName'},
		{title: '字典组编码', dataIndex: 'groupCode'},
		{title: '字典项键', dataIndex: 'itemKey'},
		{title: '字典项值',  scopedSlots: {customRender: 'itemValue'}},
		{title: '排序', dataIndex: 'sortOrder'},
	//	{title: '创建时间', dataIndex: 'createTime'},
		{title: '操作', dataIndex: 'operation', scopedSlots: {customRender: 'operation'}}
		]
	}

	queryForm={groupCode: "", itemKey: "", itemName: "",pageNo: 1, pageSize: 10 };

	formHack={};

	dictionaryGroupQueryAllByListData=[];

	/* 分页数据模型 */
	paginationParams={ pageNo: 1, total:0, current: 1 };

	// 弹窗里面用到的数据
	modal = { title:"", showModal: false, confirmLoading: false,sn:"",data:null};

	filterOption(input, option){
		return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0;
	}

	changeSelection() {
		this.paginationParams.current = 1;
		this.queryForm.pageNo = 1;

	}
	/** 删除字典项 */
    async deleteItem({data}) {
      Modal.confirm({
        title: `删除提示`,
        content: `您确认删除该项记录吗?`,
        onOk: async () => {
          const { data: res } = await Api.dictionaryItemRemoveById({ id:data.id });
          if (res?.body?.code === 1) {
            Message.success(res.body.message);
			this._dictionaryItemQueryByPage();
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
		if(this.modal.sn=='edit'){
			let { data: req } =	await Api.dictionaryItemQueryDetail({id:obj.data.id});
			if (req?.body?.code == 1) {
				this.formHack=req.body.data;
			}
		}
	}

	/* 模态框确认 */
	async enterDialog(){
		this.form.validateFields(async (err, values) => {
        if (!err) {
				var req;
				if(this.modal.sn=='add'){ //如果是新增
					req =await Api.dictionaryItemAdd(values);
				}else{ //否则编辑
					req =await Api.dictionaryItemEdit( Object.assign({id: this.formHack.id}, values));
				}
				if (req?.data?.body?.code === 1) {
					Message.success(req.data.body.message);
					this.modal.showModal = false;
					this._dictionaryItemQueryByPage();
			}
        }
      });
	}


	// 切换分页 
  changeTablePagenation(pagination) {
	this.queryForm.pageNo = pagination.current;
	this.paginationParams.current = pagination.current;
	this._dictionaryItemQueryByPage();
	}

	/* 获取字典项分页列表 */
	async _dictionaryItemQueryByPage(refresh){
		if (refresh) this.changeSelection();
		let { data: req } =	await Api.dictionaryItemQueryByPage(this.queryForm);
		  if (req?.body?.code === 1) {
			  this.table.dataSource=req.body.data.records;
			  this.paginationParams.total=req.body.data.totalCount;
		}
	}

	/* 获取字典组列表信息渲染select */
	async _dictionaryGroupQueryAllByList(){
		let { data: req } =	await Api.dictionaryGroupQueryAllByList({});
		  if (req?.body?.code === 1) {
			  this.dictionaryGroupQueryAllByListData=req.body.data;
		}
	}

	@Lifecycle created() {
	   this.form = this.$form.createForm(this);
	   this._dictionaryItemQueryByPage();
	   this._dictionaryGroupQueryAllByList();
	}


}
</script>


<style lang="scss" scoped>
.mt10{
	.ant-form-item-label{
		min-width:100px;
	}
}
.overflow-text {
	max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
</style>