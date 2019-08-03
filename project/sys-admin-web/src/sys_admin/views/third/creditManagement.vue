<template>
  <div class="page-container">
		<XTabs @tabClick="subTab" ref="xtabs"/>
    <div class="mt15">
      <a-form layout="inline">
        <a-form-item label="商户名称" style="margin-left:10px;margin-right:20px;">
          <a-select style="width: 120px" v-model="form.platformId" placeholder="请选择" >
						<a-select-option value=''>全部</a-select-option>
            <a-select-option v-for="(v, i) of merchantPlatformList" :value="v.id" :key="i" >{{v.platformName}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="游戏名称" style="margin-left:10px;margin-right:20px;">
          <a-input v-model.trim="form.thirdGameName" />
        </a-form-item>
        <a-form-item label="状态" class="status-select">
          <a-select v-model="form.isEnabledForcedly" >
            <a-select-option :value="''">全部</a-select-option>
            <a-select-option :value="0">停用</a-select-option>
            <a-select-option :value="1">启用</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item style="margin-left:10px;">
          <a-button type="primary" @click="_querySelect" ref="btnSave"  v-permission="10138">查询</a-button>
        </a-form-item>
      </a-form>
    </div>
    <div class="mt15">
      <a-table :columns="table.columns" :dataSource="tableData" :pagination="false" :rowKey="e=>e.id" class="mytable" bordered>
        <template slot="isEnabledForcedly" slot-scope="r">
					{{r==1?'启用':'停用'}}
				</template>
				<template slot="totalQuota" slot-scope="value, items">
					<a href="#" @click="$refs.amountRecordModal._getTotalQuota(items)">{{value}}</a>
				</template>
                <template slot="option" slot-scope="r, t">
					<a-button type="primary" size="small" @click="_editModal(t)" v-permission="10137">编辑</a-button>
				</template>
      </a-table>
			<div style="text-align:right;padding-top:20px;">
      	<a-pagination :current="pagination.current" :total="pagination.total" @change="changePagination" @showSizeChange="showSizeChange" />
    	</div>
    </div>
		<!-- 编辑游戏模态框 -->
		<a-modal title="编辑游戏" v-model="modalShow" :footer="null" :destroyOnClose="true" :maskClosable="false">
		<div style="text-align:left;">
      <a-form :form="form2">
				<a-input type="hidden" v-decorator="['id', {initialValue:details.id}]"></a-input>
        <a-form-item label="商户平台" disabled v-bind="formItemLayout">
          <a-select disabled v-decorator="['platformId', { initialValue:details.platformId}]" >
            <a-select-option :value="v.id" v-for="(v, i) of merchantPlatformList" :key="i">{{v.platformName}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="游戏分类" v-bind="formItemLayout">
					<a-select disabled v-decorator="['thirdGameTypeName', { initialValue:details.thirdGameTypeName}]" >
            <a-select-option :value="v.id" v-for="(v, i) of allGs" :key="i">{{v.thirdGameTypeName}}</a-select-option>
          </a-select>
        </a-form-item>
				<a-form-item label="选择游戏" disabled v-bind="formItemLayout">
					<a-input disabled v-decorator="['thirdGameName', {initialValue:details.thirdGameName, rules: [{required:false}]}]"></a-input>
        </a-form-item>
        <a-form-item  label="总额度" v-bind="formItemLayout">
          <a-input disabled v-decorator="['totalQuota', {initialValue:details.totalQuota, rules: [{required:false}]}]"></a-input>
        </a-form-item>
        <a-form-item  label="当前使用额度" v-bind="formItemLayout">
          <a-input disabled v-decorator="['consumedQuota', {initialValue:details.consumedQuota, rules: [{required:true,message:'请输入总额度'}]}]"></a-input>
        </a-form-item>
        <a-form-item label="单笔最大额度" v-bind="formItemLayout">
          <a-input v-decorator="['maxAmountPerTransfer', {initialValue:details.maxAmountPerTransfer, rules: [{required:true,message:'请输入总额度'}]}]"></a-input>
        </a-form-item>
        <a-form-item label="单笔最小额度" v-bind="formItemLayout">
          <a-input v-decorator="['minAmountPerTransfer', {initialValue:details.minAmountPerTransfer, rules: [{required:true,message:'请输入总额度'}]}]"></a-input>
        </a-form-item>
        <a-form-item label="状态" v-bind="formItemLayout">
          <a-select  v-decorator="['isEnabledForcedly', { initialValue:details.isEnabledForcedly}]" >
            <a-select-option :value="1">启用</a-select-option>
            <a-select-option :value="0">停用</a-select-option>
          </a-select>
        </a-form-item>
				<div style="text-indent:110px;">
					<a-button type='primary' @click="_editEnter">保存</a-button>
        </div>
      </a-form>
			</div>
    </a-modal>

		<AmountRecordModal ref="amountRecordModal" @cancel="_queryPagePlatformThirdGameConfigByCon"/>

  </div>
</template>
<script>
import Vue from "vue";
import  XTabs  from "./components/XTabs";
import  AmountRecordModal  from "./components/AmountRecordModal";
import { Component, InjectComponents, Computed, Lifecycle, Watch } from "vue-decorators";
import * as Api from "@api/admin";
@Component({})
@InjectComponents({XTabs,AmountRecordModal})

export default class CreditManagement extends Vue {
	formItemLayout={ labelCol: { span: 6 }, wrapperCol: { span: 15 }, };
  merchantPlatformList = [];
	pagination = { total: 0, current: 1,pageSize:10 };
	pageSize = 10;
	thirdGameCode="";
	modalShow=false;
	details={};
	allGs = [];
	typeGs = [];
  // 表格
  table = {
    columns: [
      { title: "商户名称", dataIndex: "platformName" },
      { title: "游戏名称", dataIndex: "thirdGameName" },
      { title: "游戏标识", dataIndex: "thirdGameCode",scopedSlots: { customRender: "thirdGameCode" } },
      { title: "状态", dataIndex: "isEnabledForcedly", scopedSlots: { customRender: "isEnabledForcedly" } },
      { title: "总额度", dataIndex: "totalQuota", scopedSlots: { customRender: "totalQuota" } },
      { title: "当前已使用额度", dataIndex: "consumedQuota" },
      { title: "剩余额度", dataIndex: "remainQuota" },
      { title: "单笔最大额", dataIndex: "maxAmountPerTransfer" },
      { title: "单笔最小额", dataIndex: "minAmountPerTransfer" },
      { title: "操作",   scopedSlots: { customRender: "option" }},
		]
  };
	tableData = [];
	form={ platformId:"", thirdGameName:"", isEnabledForcedly:"" }
  async changePagination(p, s) {
    this.pagination.current = p;
    this.pageSize = s;
    await this._queryPagePlatformThirdGameConfigByCon();
  }
  async showSizeChange(p, s) {
    this.pagination.current = p;
    this.pageSize = s;
    await this._queryPagePlatformThirdGameConfigByCon();
	}
	/** xtab切换 */
	subTab(tabs){
		/** 如果没有数据查询全部 */
		this.tableData=[];
		this.thirdGameCode="";
		if(tabs.tab.thirdGameTypeName==='全部'){
			this._queryPagePlatformThirdGameConfigByCon();
		}else{
			if(tabs.subTab.id){
				this.thirdGameCode=tabs.subTab.thirdGameCode;
				this._queryPagePlatformThirdGameConfigByCon();
				return;
			}
			this.tableData=[];
		}
	}
	/** 获取商户列 */
	async _getMerchantPlatformList(){
		let res = await Api.queryAllByList();
    if (res?.data?.body?.code !== 1) return;
    this.merchantPlatformList = res?.data?.body?.data;
	}
  @Lifecycle() async created() {
		this.form2 = this.$form.createForm(this);
		await this._getMerchantPlatformList();
		this.subTab({subTab:{},tab:{thirdGameTypeName:"全部",id:""}})
  }
  async _queryPagePlatformThirdGameConfigByCon() {
		let p = {
			pageNo: this.pagination.current, 
			pageSize: this.pageSize,
			isEnabledForcedly: this.form.isEnabledForcedly,
			platformId: this.form.platformId,
			thirdGameName: this.form.thirdGameName,
			thirdGameCode:this.thirdGameCode
		};
        let res = await this.$service.fetch("/config-admin-api/thirdGameQuota/queryPagePlatformThirdGameConfigByCon",{...p });
        if (res?.data) {
            this.tableData = res.data.records;
            this.pagination.total = res.data.totalCount;
        }
	}
	async _querySelect(){
		this.pagination.current=1;
		this._queryPagePlatformThirdGameConfigByCon();
	}
	async _editModal(details){
		this.modalShow=true;
		this.allGs=this.$refs.xtabs.allGs;
		this.typeGs=this.$refs.xtabs.typeGs;
		this.details=details;
	}
	async _editEnter(){
		await this.form2.validateFields(async(err, values) => {
			if (err) return;
				let res = await this.$service.fetch("/config-admin-api/thirdGameQuota/editPlatformThirdGameConfig",{...values,id: this.details.id});
				if(1!==res.code) return res.message && this.$message.error(res.message);
				this.$message.success(res.message);
				this.modalShow=false;
				this._queryPagePlatformThirdGameConfigByCon();
		});
		
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