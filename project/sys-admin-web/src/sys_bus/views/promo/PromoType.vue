<template>
  <!--优惠活动类型-->
  <section class="page-wrapper">
    <div class="promo-type-hd">
      <a-form layout="inline">
        <a-form-item>
          <a-button v-permission="20183" type='primary' @click="showPormotionDialog({title:'添加活动类型'})">添加类型</a-button>
        </a-form-item>
        <!-- <a-form-item>
          <a-button type='primary'>删除类型</a-button>
        </a-form-item> -->
      </a-form>
    </div>
    <div class="promo-type-bd page-under-table">
      <a-table size="small" :columns="table.columns" @change="changeTablePagenation" :pagination="paginationParams" :dataSource="table.dataSource" :rowSelection="table.rowSelection" :rowKey="(r,i)=>i">
        <template slot="isShow" slot-scope="text,record">
          {{record.isShow == '1' ? '是' : '否'}}
        </template>
        <template slot="clientType" slot-scope="text, record">
          {{ record.clientType == -1 ? '通用' : $getText(record.clientType, dictionary.clientType) }}
        </template>
        <template slot="operation" slot-scope="text,record">
          <a-button v-permission="20185"  type='primary' size="small" @click="showPormotionDialog({title:'编辑活动类型',data:record})">修改</a-button>&nbsp;
		      <a-button v-permission="20184"  type='primary' size="small" @click="showDeleteConfirm({data:record})">删除</a-button>
        </template>
      </a-table>
    </div>

    <a-modal  @ok="activityOk({title:modal.title})"  :title="modal.title" v-model="modal.showModal" :centered="true" :destroyOnClose="true" :confirmLoading="modal.confirmLoading" width="400">
      <div class="promo-type-add">
        <a-form layout="inline" :form="vform">
          <div class="mt10">
            <a-form-item label="类型名称">
              <!-- <a-input v-model="form.typeName" v-decorator="['typeName']"/> -->
              <a-input v-decorator="['typeName', {initialValue: form.typeName, rules: [{ required: true, message: '请输入类型名称，类型名称为数字字母或中文', pattern: /^[0-9|a-z|\u4e00-\u9fa5]+$/ }]} ]"/>
            </a-form-item>
          </div>  
          <div class="mt10">
            <a-form-item label="排序值">
              <!-- <a-input v-model="form.sortOrder"/> -->
                <a-input v-decorator="['sortOrder', { initialValue: form.sortOrder, rules: [{ required: true, message: '请输入排序值'}]}]"/> 
            </a-form-item>
          </div>
          <div class="mt10">
              <a-form-item label="是否显示">
                <a-radio-group v-decorator="['isShow', {initialValue: form.isShow}]">
                  <a-radio :value="1">显示</a-radio>
                  <a-radio :value="0">不显示</a-radio>
              </a-radio-group>
            </a-form-item>
          </div>
          <div class="mt10">
              <a-form-item label="使用端">
                <a-radio-group v-decorator="['clientType', {initialValue: form.clientType}]">
                  <a-radio :value="-1">通用</a-radio>
                  <a-radio :value="0">APP</a-radio>
                  <a-radio :value="3">H5</a-radio>
                  <a-radio :value="4">PC端</a-radio>
                </a-radio-group>
            </a-form-item>
          </div> 
        </a-form>
      </div>
    </a-modal>
  </section>
</template>

<script>
import Vue from 'vue'
import { Component, Lifecycle } from 'vue-decorators'
import * as Api from '@api/activity';
import {Modal} from 'ant-design-vue';

const dictionary = "clientType";

@Component({ formOptions: "id", dictionary})
export default class PromoType extends Vue {
  // 表格
  table = {
    rowSelection: {},
    dataSource: [],
    columns: [
      {title: 'ID', dataIndex: 'id'},
      {title: '类型', dataIndex: 'typeName'},
      {title: '创建时间', dataIndex: 'createTime'},
      {title: '创建人', dataIndex: 'updateAdminName'},
      {title: '使用端', scopedSlots: { customRender: "clientType"}},
      {title: '是否显示', dataIndex: 'isShow', scopedSlots: {customRender: 'isShow'}},
      {title: '排序', dataIndex: 'sortOrder'},
      {title: '操作', dataIndex: 'operation', scopedSlots: {customRender: 'operation'}}
    ]
  }
	paginationParams={
		pageNo: 1,
		total:0	
	};
	form = {
		id:"",
	    typeName: "", //活动名称
		isShow: 0,  //是否显示
    sortOrder: 0,
    clientType: -1
  }
	activityTypePageParams={
		typeName: "",
		pageSize:10,
		pageNo:1
	}
  // 弹窗里面用到的数据
  modal = {
	title:"",
    showModal: false,
    confirmLoading: false
  };

/* 删除类型 */
 async showDeleteConfirm({data}) {
      Modal.confirm({
        title: '删除警告',
        content: '你确定要删除选中的数据?',
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        onOk:async()=>{
			let { data: req } = await Api.activityTypeRemove({ id:data.id });
			if (req?.body?.code === 1) {
				this.getActivityTypePage();
				return false;
			}
        },
        onCancel:()=> {
          return false;
        }
      });
	}
	
/* 获取活动列表 */
  async getActivityTypePage(){
	  let { data: req } =	await Api.activityTypePage(this.activityTypePageParams)
	  if (req?.body?.code === 1 && req?.body?.data) {
		  let isEnableds={0:"关闭",1:"开启"};
		  let isShows={0:"不显示",1:"显示"};
		  let clientTypes={'-1':"通用",0:"APP",1:"android",2:"IOS",3:"H5",4:"PC端"};
		this.table.dataSource = req.body.data.records.map((item,i)=>{
			item._isEnabled=isEnableds[item.isEnabled];
			item._clientType=clientTypes[item.clientType]
			item._isShow=isShows[item.isShow]
			return item;
		});
		this.paginationParams.total = req.body.data.totalCount;
	   }
  }

/* 添加编辑活动类型 */
  async activityOk(obj){
    const form = await this.vform.validate();
    if (form.error) return;

	  if(obj.title=='添加活动类型'){
		  let { data: req } =	await Api.activityTypeAdd(form.values);
		  if (req?.body?.code === 1) {
			  this.modal.showModal=false;
			  this.getActivityTypePage();
		   }
	  }
	  if(obj.title=='编辑活动类型'){
		  let { data: req } =	await Api.activityTypeEdit(Object.assign(this.form, form.values));
			if (req?.body?.code === 1) {
				this.modal.showModal=false;
				this.getActivityTypePage();
		}
	  }
  }
// 切换分页 
  changeTablePagenation(pagination) {
	this.paginationParams.pageNo = pagination.current;
	this.activityTypePageParams.pageNo = pagination.current;
	this.getActivityTypePage();
	}
/* 公共显示modal */
	showPormotionDialog(obj) {
        this.form={ typeName: "", isShow: 0, sortOrder: 0};
		this.modal.title=obj.title;
		this.modal.showModal = true;
		if(obj.title==="编辑活动类型"){
			this.$nextTick(()=>{
				this.form={ typeName:obj.data.typeName, id:obj.data.id,isShow: obj.data.isShow, sortOrder: obj.data.sortOrder, clientType: obj.data.clientType};
			})
		}
	}

  @Lifecycle mounted() {
    this.getActivityTypePage();
  }

  addType() {
    this.modal.showModal = true;
  }
}
</script>


<style lang="scss">
.promo-type-add {
  .ant-form-item > .ant-form-item-label > label {
    width: 80px; text-align: right; display: inline-block;
  }
  .ant-form-item-children .ant-input {
    width: 280px;
  }
}

.page-wrapper {
  min-height: 100%;
  background-color: #fff;
  padding: 10px;
}
</style>