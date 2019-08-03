<template>
  <!--报表 注单管理 -->
  <div class="page-container">
    <section class="gameManage">
      <a-form layout="inline">
        <a-form-item>
          <TabSwitch :columns="TabColumns" :defaultSelected="TabSelected" @changeTabs="changeTabs" />
          <a-button type="primary" @click="showChangeClass = true" style="margin-right: 10px;" v-permission="10095">修改分类</a-button>
          <a-button type="primary" @click="showAddClass = true" v-permission="10094">添加分类</a-button>
        </a-form-item>
        <hr style="border:1px solid #eee">
        <a-form-item label="游戏名称:" class="game-name-item">
          <a-input v-model.trim="inputValue"/>
        </a-form-item>
        <a-form-item label="状态" style="margin-left:30px;margin-right:30px;">
          <a-select defaultValue style="width: 80px" @change="(v)=>{this.isEnabled = v}">
            <a-select-option value>全部</a-select-option>
            <a-select-option value="1">启用</a-select-option>
            <a-select-option value="0">停用</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item class="button-group">
          <a-button type="primary" @click="searchs" style="margin-right:10px;" ref="btnSave" :loading="loading">查询</a-button>
          <a-button type="primary" @click="showAddGame=true" v-permission="10096">添加游戏</a-button>
        </a-form-item>
      </a-form>
      <div class="mt15">
        <a-table :columns="table.columns" :dataSource="tableData" :pagination="false" :rowKey="e=>e.id" class="mytable" bordered >
          <template slot="iconUrl" slot-scope="r, t">
            <img :src="t.thirdGameLogoUrl" alt=".." style="height:30px;width:30px;">
          </template>
          <template slot="operate" slot-scope="r, text">
            <a-button type="primary" size="small" @click="_edit(text)" v-permission="10097">编辑</a-button>
          </template>
          <template slot="reQuota" slot-scope="r, text">
            <span>{{text.totalQuota - text.consumedQuota}}</span>
          </template>
          <template slot="isEnabled" slot-scope="t, r">
            <span>{{r.isEnabled==1?'启用':'停用'}}</span>
          </template>
					<template slot="totalQuota" slot-scope="value, items">
            <a href="#" @click="$refs.amountRecordModal._getTotalQuota(items,'gameManage')">{{value}}</a>
          </template>
        </a-table>
				<div style="text-align:right;padding-top:20px;">
      		<a-pagination :current="pagination.pageNo" :total="pagination.total"  @change="changePagination"  />
    		</div>
      </div>
    </section>
		
    <editGame v-if="showEditGame" @close="showEditGame=false" :detail="editDetail" :thirdGameType="thirdGameType" @ok="getThirdGameList" />
    <addGame v-if="showAddGame" @close="showAddGame=false" @ok="getThirdGameList" :thirdGameType="thirdGameType" />
    <changeClass @close="showChangeClass=false" @ok="getThirdGameList" v-if="showChangeClass" :details="gmaeClassData" @getClass="getThirdGameType" />
    <addClass @close="showAddClass=false" @ok="getThirdGameList" v-if="showAddClass" @getClass="getThirdGameType" />
		<AmountRecordModal ref="amountRecordModal" @cancel="getThirdGameList"/>

  </div>
</template>

<script>
import Vue from "vue";
import { Component, InjectComponents, Lifecycle, Computed } from "vue-decorators";
import { TabSwitch } from "@/components/switch";
import editGame from "./editGame";
import addGame from "./addGame";
import changeClass from "./changeClass";
import addClass from "./addClass";
import  AmountRecordModal  from "./components/AmountRecordModal";
@Component()
@InjectComponents({ TabSwitch, editGame, addGame, changeClass, addClass,AmountRecordModal })
export default class OrderManage extends Vue {
  showAddClass = false;
  showChangeClass = false;
  showAddGame = false;
  editDetail = {};
  showEditGame = false;
  TabSelected = 0;
  TabColumns = [];
	pagination = { total: 0, pageNo: 1,pageSize:10 };
  inputValue = "";
  thirdGameType = [{ id:1,name:"bb"}];
	thirdGameTypeId="";
	loading=false;
	isEnabled = "";
	gmaeClassData={};
  // 表格
  table = {
    columns: [
      { title: "图标", scopedSlots: { customRender: "iconUrl" } },
      { title: "游戏名称", dataIndex: "thirdGameName" },
      { title: "游戏标识", dataIndex: "thirdGameCode" },
      { title: "状态", dataIndex: "isEnabled", scopedSlots: { customRender: "isEnabled" } },
      { title: "总额度", dataIndex: "totalQuota",scopedSlots: { customRender: "totalQuota" }},
      { title: "当前消耗额度", dataIndex: "consumedQuota" },
      { title: "剩余额度", dataIndex: "remainQuota" },
      { title: "添加时间", dataIndex: "createTime" },
      { title: "备注", dataIndex: "remark" },
      { title: "操作", scopedSlots: { customRender: "operate" } }
		]
  };
	tableData = [];

  async changeTabs(text) {
    this.pagination.pageNo = 1;
		let item=this.thirdGameType.filter(item=>item.thirdGameTypeName===text)[0];
		this.thirdGameTypeId=item.id;
    this.TabSelected = this.TabColumns.findIndex(v => v === text);
		this.gmaeClassData=item;
		this.getThirdGameList();
  }
	
  async searchs() {
    this.pagination.pageNo = 1;
    await this.getThirdGameList();
  }

  async changePagination(p, s) {
    this.pagination.pageNo = p.current;
    await this.getThirdGameList();
  }

  // 获取所有第三方游戏类型
  async getThirdGameType() {
		const res = await this.$service.fetch( "/config-admin-api/thirdGameType/queryAllThirdGameType");
		if (!res.code) return res.message && this.$message.error(res.message);
		this.thirdGameType = res.data;
		this.thirdGameType.unshift({id:"",thirdGameTypeName:"全部"});
		this.TabColumns = this.thirdGameType.map(item =>item.thirdGameTypeName);
  }
  async getThirdGameList() {
		// 获取所有第三方游戏列表
    let p = {
      isEnabled: this.isEnabled,// 商：isEnabled 总：isEnabledForcedly
      pageNo: this.pagination.pageNo,
      pageSize: this.pageSize,
      thirdGameTypeId: this.thirdGameTypeId,
      name: this.inputValue// 输入框输入的游戏名
    };
		this.loading=true;
		const res = await this.$service.fetch( "/config-admin-api/thirdGame/queryPageThirdGameByNameAndIsEnabled",Object.assign(p,this.pagination));
		this.loading=false;
		if (!res.code) return res.message && this.$message.error(res.message);
		this.tableData = res.data.records;
    this.pagination.total = res.data.totalCount;
	}
	_edit(text){
		this.editDetail = text;
		this.showEditGame = true;
	}

	/** 生命周期 */
  @Lifecycle() async created() {
		await this.getThirdGameType();
    await this.searchs();
  }
}
</script>

<style lang="scss" scoped>
@import "@views/admin/Pop.scss";
.page-container /deep/ {
  .report-order-text {
    margin: 15px 0;
    span {
      margin-right: 10px;
    }
  }
  .gameManage {
    .tab-switch-list.tab-sty1 {
      float: left;
      padding-top: 10px;
      margin-right: 30px;
      li {
        height: 25px;
        line-height: 25px;
        button {
          height: 100%;
          width: auto;
          padding: auto 6px;
        }
      }
    }
  }
  .game-name-item {
    .ant-input {
      width: 132px;
    }
  }
  .button-group {
    .ant-btn {
      width: 88px;
      margin-top: -12px;
    }
  }
}
</style>