<template>
  <section class="share-wrapper share-setting-wrapper">
		<!-- 一次性按钮 -->
		<a href="javascript:;" style="position:absolute;display:inline-block;width:30px;height:30px;right:0;top:0" @click="showButton=!showButton">&nbsp;</a>
	  <div class="promo-list-bd">
		  <a-form layout="inline">
			<div class="mt15">
				<a-form-item label="字典组名">
				<a-input placeholder="字典组名" v-model.trim="dictionaryGroupQueryByPageForm.groupName"/>
				</a-form-item>
				<a-form-item label="字典组编码">
				<a-input placeholder="字典组编码" v-model.trim="dictionaryGroupQueryByPageForm.groupCode"/>
				</a-form-item>
				<a-form-item>
					<a-button-group>
						<a-button type='primary' @click='()=>{this.dictionaryGroupQueryByPageForm.groupName="";this.dictionaryGroupQueryByPageForm.groupCode="";}'>重置</a-button>
          				<a-button type='primary' @click="_dictionaryGroupQueryByPage(true)">查询</a-button>
					</a-button-group>
				</a-form-item>
				</div>
    	</a-form>
	  </div>
<div class="page-under-table mt15">
    <a-form layout="inline">
	  <a-form-item style="margin-bottom:20px;" v-permission="10127">
            <a-button type='primary' @click="showPormotionDialog({title:'添加字典组',sn:'add',data:null})">添加字典组</a-button>
          </a-form-item>
			<a-form-item>
				<a-button type="primary" @click="updateRedis">更新缓存</a-button>
			</a-form-item>		
			<a-form-item>
				<a-button v-if="showButton" @click="updatePlatformDb">刷新平台数据源</a-button>
			</a-form-item>
		  <a-table class="mytable" :rowKey="(r,i)=>i" @change="changeTablePagenation" :pagination="paginationParams" :columns="table.columns" :dataSource="table.dataSource" >
            <template slot="operation" slot-scope="text,record">
              <a-button type='primary' size="small" @click="_dictionaryItemRefreshRedisByGroupId({data:record})" v-permission="10128">更新缓存</a-button>
            </template>
          </a-table>
    </a-form>
</div>
	<a-modal :maskClosable="false"  :title="modal.title" @ok="enterDialog()" :destroyOnClose="true" v-model="modal.showModal" :centered="true" :confirmLoading="modal.confirmLoading" width="30%">
		 <a-form layout="inline" :form="form">
			  <a-form-item v-show="false" v-for="(d, i) in form.hiddens" :key="i">
        		<input type="hidden" v-decorator="[d]"/>
     		  </a-form-item>
		<div class="mt10">
			<a-form-item label="字典组名称">
				<!-- ,{validator:checkPrice} -->
				<a-input style=" width: 230px;" placeholder="" type="text"  v-decorator="['groupName',{rules: [{ required: true,message:'该项为必填项!' }]} ]"/>
			</a-form-item>
		 </div>
		 <div class="mt10">
		 <a-form-item label="字典组编码">
			<a-input style=" width: 230px;" placeholder="" type="text" v-decorator="['groupCode',{rules: [{ required: true,whitespace:true, message: '该项为必填项!' }]} ]"/>
		 </a-form-item>
		 </div>
		<div class="mt10">
		 <a-form-item label="字典组说明">
			<a-input style=" width: 230px;" placeholder="" type="text" v-decorator="['remark',{rules: [{ required: false,whitespace:true, message: '该项为必填项!' }]} ]"/>
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
import {Message} from 'ant-design-vue';
const formOptions = { form: 'id' };

@Component({ methods:{ moment }, formOptions })
export default class DictionaryGroup extends Vue {
	showButton = false;
	// 表格
  table = {
    dataSource: [],
    columns: [
      {title: 'ID', dataIndex: 'id'},
      {title: '字典组名称', dataIndex: 'groupName'},
      {title: '字典组编码', dataIndex: 'groupCode'},
      {title: '字典组说明', dataIndex: 'remark'},
      {title: '创建时间', dataIndex: 'createTime'},
      {title: '操作', dataIndex: 'operation', scopedSlots: {customRender: 'operation'}}
    ]
  }
  dictionaryGroupQueryByPageForm={ groupCode: "", groupName: "", pageNo: 1, pageSize: 10 }
  paginationParams={ pageNo: 1, total:0, current: 1 };
// 弹窗里面用到的数据
	modal = { title:"", showModal: false, confirmLoading: false,sn:"",data:null};
	/* 公共显示modal */
	async showPormotionDialog(obj) {
		this.modal.title=obj.title;
		this.modal.showModal = true;
		this.modal.sn=obj.sn;
		if(this.modal.sn==='edit'){
			let { data: req } =	await Api.dictionaryGroupQueryByPage({id:obj.data.id});
				if (req?.body?.code === 1) {
					this.form.setValues(req.body.data, true)
			}
		}
	}
	async enterDialog(){
		if(this.modal.sn=='add'){ //如果是确认
			 const form = await this.form.validate();
			if (form.errors) return;
			let { data: req } =	await Api.dictionaryGroupAdd(form.values);
					if (req?.body?.code === 1) {
					Message.success(req.body.message);
					this.modal.showModal = false;
					this._dictionaryGroupQueryByPage();
				}
		}

	
		// if(this.modal.sn=='edit'){
		// 	 const form = await this.form.validate();
		// 	if (form.errors) return;
		// 		let { data: req } =	await Api.dictionaryGroupQueryByPage(form.values);
		// 		if (req?.body?.code === 1) {
		// 			Message.success(req.body.message);
		// 			this.modal.showModal = false;
		// 			this._dictionaryGroupQueryByPage();
		// 		}
		// }
	}

	async updatePlatformDb() {
		if (!await this.$confirm({title: "确认要刷新平台数据源?"})) return;
		const res = await this.$service.fetch('config-admin-api/platformDatabaseInfo/refreshData');
		if (res.code !== 1) return res.message && this.$message.error(res.message);
		this.$message.success(res.message);
	}

	async updateRedis() {
		if (!await this.$confirm({title: "确认要更新吗?"})) return;
		const res = await this.$service.fetch('/config-admin-api/dictionaryItem/refreshRedisData');
		if (res.code !== 1) return res.message && this.$message.error(res.message);
		this.$message.success(res.message);
	}

	// checkPrice(rule, value, callback) {
  //     if (value.number > 0) {
  //       callback();
  //       return;
  //     }
  //     callback('Price must greater than zero!');
	// }
	

	// 切换分页 
  changeTablePagenation(pagination) {
		this.dictionaryGroupQueryByPageForm.pageNo = pagination.current;
		this.paginationParams.pageNo = pagination.current;
		this.paginationParams.current = pagination.current;
		this._dictionaryGroupQueryByPage();
	}

	/* 更新缓存接口方法 */
	async _dictionaryItemRefreshRedisByGroupId(obj){
		this.$modal.confirm({
        title: "提示",
        content: "确认刷新缓存？",
        onOk: async () => {
          let { data: req } = await Api.dictionaryItemRefreshRedisByGroupId({ id:obj.data.id });
		  	if(req?.body?.code== 1) return Message.success(req.body.message);
        }
	  });
	}

	changeSelection() {
		this.paginationParams.current = 1;
		this.paginationParams.pageNo = 1;
		this.dictionaryGroupQueryByPageForm.pageNo = 1;
	}

	async _dictionaryGroupQueryByPage(refresh){
		if (refresh) this.changeSelection();
		let { data: req } =	await Api.dictionaryGroupQueryByPage(this.dictionaryGroupQueryByPageForm);
		  if (req?.body?.code === 1) {
			  this.table.dataSource=req.body.data.records;
			  this.paginationParams.total=req.body.data.totalCount;
		}
	}

	@Lifecycle() created() {
	   this._dictionaryGroupQueryByPage();
  }

}
</script>


<style lang="scss">
.mt10{
	.ant-form-item-label{
		min-width:100px;
	}
}
</style>