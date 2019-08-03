<template>
  <div class="page-container">
		<XTabs @tabClick="tabClick" :isAll="false" ref="xtabs" @getAllGs="getAllGs"/>
		<div class="mt15"><a-button  v-permission="20346" type="primary" size="small" @click="_add()">添加</a-button></div>
    <div class="mt15">
      <a-table :columns="table.columns" :dataSource="table.tableData" :pagination="false" :rowKey="e=>e.id" class="mytable" bordered>
			<template slot="operate" slot-scope="r, text">
        <a-button  v-permission="20347"  type="primary" size="small" @click="_edit(text)">编辑</a-button>
        <a-button  v-permission="20348"  type="primary" size="small" @click="_remove(text)">删除</a-button>
       </template>
			</a-table>
			<div style="text-align:right;padding-top:20px;"> 
			<a-pagination :current="pagination.pageNo" :total="pagination.total" @change="changePagination" />
    </div>
    </div>
		<a-modal :title="flag==='edit'?`编辑`:`添加`" v-model="modalShow" :footer="false" :destroyOnClose="true" :maskClosable="false">
		<div style="text-align:left;">
      <a-form :form="form">
        <a-form-item label="游戏平台" v-bind="formItemLayout">
					<a-input v-if="flag==='edit'" disabled v-decorator="['thirdGameName', {initialValue:details.thirdGameName}]"></a-input>
					<a-select v-if="flag==='add'"  placeholder="请选择" v-decorator="['thirdGameCode',{initialValue:details.maxBetAmount,rules: [{required:true,message:'该项为必选项'}]}]">
          <a-select-option v-for="(d, i) in allThirdGame" :value="`${d.thirdGameCode}`" :key="i" >{{d.thirdGameName}}</a-select-option>
        </a-select>
        </a-form-item>
        <a-form-item label="最大金额" v-bind="formItemLayout">
					<a-input v-decorator="['maxBetAmount', {initialValue:details.maxBetAmount,rules: [{required:true,message:'最大金额必须为数字',pattern:/^[0-9]+([.]{1}[0-9]+){0,1}$/}]}]"></a-input>
        </a-form-item>
				<a-form-item  label="返水比例" v-bind="formItemLayout">
          <a-input v-decorator="['rebateRate', {initialValue:details.rebateRate, rules: [{required:true,message:'返水比例必须为数字',pattern:/^[0-9]+([.]{1}[0-9]+){0,1}$/}]}]"></a-input>
        </a-form-item>
				<div style="text-indent:110px;">
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
import XTabs from "./XTabs"
@Component
@InjectComponents({ XTabs, })
export default class BetRecord extends Vue {
	formItemLayout={ labelCol: { span: 6 }, wrapperCol: { span: 15 }, };
	modalShow=false;
	flag="add";
	details={};
	allThirdGame=[];
	pagination = { total: 0, pageNo: 1,pageSize: 10 };
	params={ id:"" };
  table = {
		tableData:[],
    columns: [
      { title: "游戏名称", dataIndex: "thirdGameName" },
      { title: "最小金额", dataIndex: "minBetAmount" },
      { title: "最大金额", dataIndex: "maxBetAmount" },
      { title: "返水比例", dataIndex: "rebateRate" },
      { title: "返水级别", dataIndex: "level" },
      { title: "添加时间", dataIndex: "updateTime" },
      { title: "操作", scopedSlots: { customRender: "operate" } }
    ]
	};
	

	/** 获取所有游戏 */
	async _queryAllThirdGame(){
		let res = await this.$service.fetch("/config-admin-api/thirdGame/queryAllThirdGame");
				if(1!==res.code) return res.message && this.$message.error(res.message);
				this.allThirdGame=res.data;
	}

	_add(){
		this.flag="add";
		this.modalShow=true;
		this.details={};
	}

  _edit(details){
		this.details=details;
		this.modalShow=true;
		this.flag="edit";
	}
	async _addEnter(){
		await this.form.validateFields(async(err, values) => {
			if (err) return;
				let res = await this.$service.fetch("/config-admin-api/thirdRebateConfig/addThirdRebateConfig",{...values});
				if(1!==res.code) return res.message && this.$message.error(res.message);
				this.$message.success(res.message);
				this.modalShow=false;
				this._queryPageThirdRebateConfig();
		});
	}
	async _editEnter(){
		await this.form.validateFields(async(err, values) => {
			if (err) return;
				let res = await this.$service.fetch("/config-admin-api/thirdRebateConfig/editThirdRebateConfig",{...values,id: this.details.id});
				if(1!==res.code) return res.message && this.$message.error(res.message);
				this.$message.success(res.message);
				this.modalShow=false;
				this._queryPageThirdRebateConfig();
		});
	}

	async _remove(details){
		if (!(await this.$confirm({content: "确定删除当前操作数据?"}))) return;
		let res = await this.$service.fetch("/config-admin-api/thirdRebateConfig/removeThirdRebateConfig",{id: details.id});
				if(1!==res.code) return res.message && this.$message.error(res.message);
				this.$message.success(res.message);
				this.modalShow=false;
				this._queryPageThirdRebateConfig();
	}
	/** 自动选中二级分类 */
	getAllGs(){

		this.$refs.xtabs.changeTab(this.$refs.xtabs.allGs[0].id);
		// this._getMerchantPlatformList();
	}
	tabClick(tab){
		if(!tab.subTab.thirdGameCode||this.$constants.ThireGames.THIRE_GAME_ALL.split('|').indexOf(tab.subTab.thirdGameCode)==-1) return this.$message.error(`暂不支持${tab.subTab?.thirdGameCode}游戏;`);
		this.pagination.pageNo=1;
		this.params.id=tab.subTab.id;
		this._queryPageThirdRebateConfig();
	}
	/** 翻页 */
  async changePagination(p, s) {
    this.pagination.pageNo = p;
    this.pageSize = s;
    this._queryPageThirdRebateConfig();
  }

  async _queryPageThirdRebateConfig(value) {
    let res = await this.$service.fetch("/config-admin-api/thirdRebateConfig/queryPageThirdRebateConfig",Object.assign(this.params,this.pagination));
		if (1!==res.code) return res.message && this.$message.error(res.message);
		this.table.tableData = res.data.records;
		this.pagination.total = res.data.totalCount;
  }
	
  @Lifecycle() async created() {
    this.form = this.$form.createForm(this);
		this._queryAllThirdGame();
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
    margin-top: 21px;
  }
  .ant-table-thead {
    th {
      padding: 16px 2px;
    }
  }
}
</style>