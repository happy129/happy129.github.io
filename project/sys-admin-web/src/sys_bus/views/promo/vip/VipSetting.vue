<template>
  <section class="share-wrapper share-setting-wrapper">
    <a-form layout="inline">
	  <a-form-item style="margin-bottom:20px;">
            <a-button v-permission="20209" type='primary' @click="showPormotionDialog({title:'添加VIP等级',sn:'add',data:null})">添加</a-button>
          </a-form-item>
		  <a-table :rowKey="(r,i)=>i" @change="changeTablePagenation" :pagination="paginationParams" :columns="table.columns" :dataSource="table.dataSource"  size="small">
						<template slot="vipLevel" slot-scope="text,record">
							VIP{{record.vipLevel}}
						</template>
						<template slot="operation" slot-scope="text,record">
              <a-button  v-permission="20210"  type='primary' size='small' @click="showPormotionDialog({title:'修改VIP等级',sn:'edit',data:record})">修改</a-button>
							&nbsp;&nbsp;
							<a-button v-permission="20211"  type='primary' size='small' @click="linkToMember(record)">查看会员</a-button>
            </template>
          </a-table>
    </a-form>


	<a-modal :title="modal.title" @ok="enterDialog()" :destroyOnClose="true" v-model="modal.showModal" :maskClosable="true" :centered="true" :confirmLoading="modal.confirmLoading" :width="580">
		 <a-form layout="inline" :form="form">
			  <a-form-item v-show="false" v-for="(d, i) in form.hiddens" :key="i">
        <input type="hidden" v-decorator="[d]"/>
      </a-form-item>
		<div class="mt10">
			<a-form-item label="VIP名称">
				<a-input style="width: 400px;" placeholder="请输入活动名称" type="text"  v-decorator="['vipLevelName',{rules: [{ required: true, message: '该项为必填项!' }]} ]"/>
			</a-form-item>
		 </div>
		 <div class="mt10">
		 <a-form-item label="有效投注">
			<a-input style=" width: 400px;" placeholder="有效投注表示上一个等级升级到该等级所需要的有效投注" :min="0"  @change="changeValue" v-decorator="['vipValidBetAmount',{rules: [{ required: true, message: '该项为必填项!' }]} ]"/>
		 </a-form-item>
		 </div>
		 <div class="mt10">
		 <a-form-item label="彩金">
			<a-input style="width: 400px;" placeholder="单位: %" :min="0" @change="changeValue" v-decorator="['bonus',{rules: [{ required: true, message: '该项为必填项!' }]} ]"/>
		 </a-form-item>
		 </div>
		 <div class="mt10">
		 <a-form-item label="彩票A盘返水">
			<a-input style="width: 400px;" placeholder="单位: %"  :min="0"  @change="changeValue" v-decorator="['arebateRate',{rules: [{ required: true, message: '该项为必填项!' }]} ]"/>
		 </a-form-item>
		 </div>
		 <div class="mt10">
		 <a-form-item label="彩票B盘返水">
			<a-input style="width: 400px;" placeholder="单位: %"  :min="0" @change="changeValue" v-decorator="['brebateRate',{rules: [{ required: true, message: '该项为必填项!' }]} ]"/>
		 </a-form-item>
		 </div>
		 <div class="mt10">
		 <a-form-item label="真人返水">
			<a-input style="width: 400px;" placeholder="单位: %"  :min="0" @change="changeValue" v-decorator="['sportRebateRate',{rules: [{ required: true, message: '该项为必填项!' }]} ]"/>
		 </a-form-item>
		 </div>
		 <div class="mt10">
		 <a-form-item label="体育返水">
			<a-input style="width: 400px;" placeholder="单位: %"  :min="0" @change="changeValue"  v-decorator="['realPersonRebateRate',{rules: [{ required: true, message: '该项为必填项!' }]} ]"/>
		 </a-form-item>
		 </div>
		 
		  <div class="mt10">
		 <a-form-item label="电子返水">
			<a-input style="width: 400px;" placeholder="单位: %"  :min="0" @change="changeValue"  v-decorator="['electronRebateRate',{rules: [{ required: true, message: '该项为必填项!' }]} ]"/>
		 </a-form-item>
		 </div>
		 <div class="mt10">
		 <a-form-item label="棋牌返水">
			<a-input style="width: 400px;" placeholder="单位: %"  :min="0" @change="changeValue"  v-decorator="['chessRebateRate',{rules: [{ required: true, message: '该项为必填项!' }]} ]"/>
		 </a-form-item>
		 </div>
		 <div class="mt10">
		 <a-form-item label="特权">
			<a-textarea :rows="6" style="width: 400px;" placeholder="" type="text"  v-decorator="['remark',{rules: [{ required: true, message: '该项为必填项!' }]} ]"/>
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
import * as Api from '@api/activity';
import {Message} from 'ant-design-vue';
const formOptions = { form: 'id' };

@Component({ methods:{ moment }, formOptions })
export default class ShareSetting extends Vue {

	// 表格
  table = {
    dataSource: [],
    columns: [
			{title: "ID", dataIndex: "id"},
      {title: 'VIP等级', dataIndex: 'vipLevel', scopedSlots: {customRender: 'vipLevel'}},
      {title: '名称', dataIndex: 'vipLevelName'},
      {title: '有效投注', dataIndex: 'vipValidBetAmount'},
      {title: '彩金', dataIndex: 'bonus'},
      {title: '彩票A盘返水(%)', dataIndex: 'arebateRate'},
      {title: '彩票B盘返水(%)', dataIndex: 'brebateRate'},
      {title: '电子返水(%)', dataIndex: 'electronRebateRate'},
      {title: '体育返水(%)', dataIndex: 'realPersonRebateRate'},
      {title: '真人返水(%)', dataIndex: 'sportRebateRate'},
      {title: '棋牌返水(%)', dataIndex: 'chessRebateRate'},
      {title: '操作', dataIndex: 'operation', scopedSlots: {customRender: 'operation'}}
    ]
  }
  paginationParams={ pageNo: 1, total:0 };
// 弹窗里面用到的数据
	modal = { title:"", showModal: false, confirmLoading: false,sn:"",data:null};
	/* 公共显示modal */
	async showPormotionDialog(obj) {
		this.modal.title=obj.title;
		this.modal.showModal = true;
		this.modal.sn=obj.sn;
		if(this.modal.sn==='edit'){
			let { data: req } =	await Api.vipLevelConfigDetail({id:obj.data.id});
				if (req?.body?.code === 1) {
					this.form.setValues(req.body.data, true)
			}
		}
	}
	async enterDialog(){

		if(this.modal.sn=='add'){ //如果是确认
			 const form = await this.form.validate();
			if (form.errors) return;
			let { data: req } =	await Api.vipLevelConfigAdd(form.values);
					if (req?.body?.code === 1) {
					Message.success(req.body.message);
					this.modal.showModal = false;
					this._vipLevelConfigQuery();
					}
		}

		if(this.modal.sn=='edit'){
			 const form = await this.form.validate();
			if (form.errors) return;
				let { data: req } =	await Api.vipLevelConfigEdit(form.values);
				if (req?.body?.code === 1) {
					Message.success(req.body.message);
					this.modal.showModal = false;
					this._vipLevelConfigQuery();
				}
		}

	}
	// 切换分页 
  changeTablePagenation(pagination) {
	this.form.pageNo = pagination.current;
	this.paginationParams.pageNo = pagination.current;
	this._firstRechargeGivenQueryDetail();
	}

	async _vipLevelConfigQuery(){
		let { data: req } =	await Api.vipLevelConfigQuery({});
		  if (req?.body?.code === 1) {
			  this.table.dataSource=req.body.data;
		}
	}

	changeValue(e) {
		let array = e.target.value.split('');
    // 找到第一个点在的索引
    const fristItemIndex = array.findIndex(item => item == '.');
    array = array.filter((elem, index) => {
      return /\d/.test(elem) || (elem === '.' && index == fristItemIndex && fristItemIndex != 0);
    });
    e.target.value = array.join('');
	}

	linkToMember(record) {
		this.$router.push('/dashboard/memberManage?vipLevel=' + record.vipLevel);
	}

	@Lifecycle() created() {
	   this._vipLevelConfigQuery();
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