<template>
  <!--报表 注单管理 -->
  <div class="page-container">
    <section class="gameManage">
      <a-form layout="inline" :form="form">
        <a-form-item>
          <tab-switch :columns="TabColumns" :defaultSelected="TabSelected" @changeTabs="changeTabs" />
        </a-form-item>
        <a-form-item label="游戏名称:" class="game-name-item" style="margin-right:30px;">
          <a-input v-model.trim="thirdGameName" @pressEnter="searchs" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="searchs" :loading="loading">查询</a-button>
        </a-form-item>
      </a-form>
      <div class="mt15">
        <a-table :columns="table.columns" :dataSource="tableData" :pagination="false" :rowKey="(v, i) => i" class="mytable" bordered>
          <template slot="iconUrl" slot-scope="r, t">
            <img :src="t.thirdGameLogoUrl" alt=".." style="height:30px;width:30px;">
          </template>
          <template slot="operate" slot-scope="r, text">
            <a-button type="primary" size="small" @click="editDetailFunc(text)" v-permission="20271">编辑</a-button>
          </template>
						<template slot="isHot" slot-scope="r">
            <span>{{r==1?'是':'否'}}</span>
          </template>
          <template slot="reQuota" slot-scope="r, text">
            <span>{{text.totalQuota - text.consumedQuota}}</span>
          </template>
					<template slot="isEnabled" slot-scope="t,r">
            <span>{{r.isEnabled==1?'启用':'停用'}}</span>
          </template>
          <template slot="isShow" slot-scope="t,r">
            <span :title="`是否在客户端显示`">{{r.isShow==1?'显示':'隐藏'}}</span>
          </template>
					<template slot="totalQuota" slot-scope="value, items">
            <a href="#" @click="_getTotalQuota(items)">{{value}}</a>
          </template>

        </a-table>
				<div style="text-align:right;padding-top:20px;">
      		<a-pagination :current="pagination.pageNo" :total="pagination.total"  @change="changePagination" @showSizeChange="showSizeChange" />
    		</div>
      </div>
    </section>
    <editGame v-if="showEditGame" @close="showEditGame=false" :detail="editDetail" @ok="getThirdGameList"/>

		<a-modal :width="900" title="额度记录" v-model="modalShow" :footer="null" :destroyOnClose="true" :maskClosable="false">
			<a-form layout="inline">
        <a-form-item class="button-group">
					<a-range-picker @change="onChange" format="YYYY-MM-DD HH:mm:ss"/>
          <a-button type="primary" @click="modalSearchs" style="margin:0px 10px;" ref="btnSave">查询</a-button>
        </a-form-item>
      </a-form>
			<a-table style="margin-top:10px;" :columns="table.columnsIn" :dataSource="tableDataIn" @change="changePagination2" :pagination="pagination2" :rowKey="e=>e.id" class="mytable" bordered >
          <template slot="iconUrl" slot-scope="r, t">
            <img :src="t.thirdGameLogoUrl" alt=".." style="height:30px;width:30px;">
          </template>
          <template slot="operate" slot-scope="r, text">
            <a-button type="primary" size="small" @click="editDetailFunc(text)">编辑</a-button>
          </template>
          <template slot="reQuota" slot-scope="r, text">
            <span>{{text.totalQuota - text.consumedQuota}}</span>
          </template>
          <template slot="isEnabledForcedly" slot-scope="t, r">
            <span>{{r.isEnabledForcedly===1?'启用':'停用'}}</span>
          </template>
					<template slot="totalQuota" slot-scope="value">
            <a href="#" @click="modalShow=true;">{{value}}</a>
          </template>
        </a-table>
    </a-modal>
  </div>
</template>

<script>
import Vue from "vue";
import {
  Component,
  InjectComponents,
  Lifecycle,
  Computed
} from "vue-decorators";
import { TabSwitch } from "@/components/switch";
import * as Api from "@api/admin";
import editGame from "./editGame";
import moment from "moment"
@Component
@InjectComponents({
  TabSwitch,
  editGame
})
export default class OrderManage extends Vue {
  editDetail = {};
  pageSize = 10;
  showEditGame = false;
  TabSelected = 0;
  TabColumns = ["bb", "xx"];
	TabSubSelected = 0;
	thirdGameName="";
	pagination = { total: 0, pageNo: 1,pageSize:10 };
	pagination2= { total: 0, pageNo: 1,pageSize:10 };
	modalShow=false;
	loading=false;
  thirdGameType = [{ id: "" }];
  // 表格
  table = {
    columns: [
      { title: "图标", scopedSlots: { customRender: "iconUrl" } },
      { title: "ID", dataIndex: "id" },
      { title: "类型", dataIndex: "thirdGameTypeName" },
      { title: "游戏名称", dataIndex: "thirdGameName", width: 100 },
      { title: "总额度", dataIndex: "totalQuota",scopedSlots: { customRender: "totalQuota" } },
      { title: "已使用额度", dataIndex: "consumedQuota" },
      { title: "剩余额度", scopedSlots: { customRender: "reQuota" } },
      { title: "排序", dataIndex: "sortOrder" },
      { title: "热门", dataIndex: "isHot",scopedSlots: { customRender: "isHot" } },
      { title: "状态", dataIndex: "isEnabled",scopedSlots: { customRender: "isEnabled" } },
      { title: "显示", dataIndex: "isShow",scopedSlots: { customRender: "isShow" } },
      { title: "操作", scopedSlots: { customRender: "operate" } }
		],
		columnsIn: [
      { title: "添加时间",dataIndex: "createTime" },
      { title: "添加前总额度", dataIndex: "preTotalQuota" },
      { title: "添加额度", dataIndex: "addQuota" },
      { title: "添加后总额度", dataIndex: "postTotalQuota", width: 200 },
      { title: "备注", dataIndex: "remark" },
    ]
  };
	tableData = [];
	tableDataIn=[];
	queryPlatformForThirdGames={endTime: "", pageNo: 1, pageSize: 10, platformId:0, startTime: "", thirdGameCode:"" };

  changeTabs(text) {
      this.pagination.pageNo = 1;
			this.TabSelected = this.TabColumns.findIndex(v => v === text);
			this.getThirdGameList();
  }

  @Computed() thirdGameTypeId() {
    return this.thirdGameType[this.TabSelected].id;
  }


	/** 获取游戏额度 */
	async _getTotalQuota(items){
		this.modalShow=true;
		this.queryPlatformForThirdGames.thirdGameCode=items.thirdGameCode;
		this.queryPlatformForThirdGames.platformId=this.platformId;
		this._getTotalQuotaDetail();
	}
	/** 弹框翻页 */
	async changePagination2(p, s){
		this.pagination2.pageNo = p.current;
		this._getTotalQuotaDetail();
	}

	onChange(date, dateString){
		this.queryPlatformForThirdGames.startTime= moment(dateString[0]).format('YYYY-MM-DD')+' 00:00:00';
		this.queryPlatformForThirdGames.endTime= moment(dateString[1]).format('YYYY-MM-DD')+' 23:59:59';
	}
	async modalSearchs() {
    this.pagination2.pageNo = 1;
    await this._getTotalQuotaDetail();
	}
	/** 添加额度模态框查询 */
	async _getTotalQuotaDetail(){
		/** 清空时间查询时会有bug,兼容处理 */
		if(this.queryPlatformForThirdGames.startTime.indexOf('Invalid')!==-1){
				this.queryPlatformForThirdGames.startTime="";
				this.queryPlatformForThirdGames.endTime="";
		}
		const res = await this.$service.fetch( "/config-admin-api/thirdGameQuotaRecord/queryPlatformForThirdGame",Object.assign(this.queryPlatformForThirdGames,this.pagination2));
		if (1!==res.code) return res.message && this.$message.error(res.message);
		this.tableDataIn=res.data.records;
		this.pagination2.total=res.data.totalCount;
	}
	
	
  async searchs() {
    this.pagination.pageNo = 1;
    await this.getThirdGameList();
  }

  async changePagination(p, s) {
    this.pagination.pageNo = p.current;
    this.pageSize = s;
    await this.getThirdGameList();
  }
  async showSizeChange(p, s) {
    this.pagination.pageNo = p.current;
    this.pageSize = s;
    await this.getThirdGameList();
  }

  @Lifecycle() mounted() {
    this.getThirdGameType();
    this.searchs();
  }
  // 获取所有第三方游戏类型
  async getThirdGameType() {
		const res = await this.$service.fetch("/config-admin-api/thirdGameType/queryAllThirdGameType");
		if (1!==res.code) return res.message && this.$message.error(res.message);
		this.thirdGameType = res.data;
    // 生成 TabColumns 展示在标签里
		this.TabColumns = this.thirdGameType.map(item=>item.thirdGameTypeName);
		this.TabColumns.unshift('全部分类');
		this.thirdGameType.unshift({id:"",name: "全部分类"})
  }

  async getThirdGameList() {
		// 获取所有第三方游戏列表
    let p = {
      // isEnabled: "",// 商：isEnabled 总：isEnabledForcedly
      pageNo: this.pagination.pageNo,
			pageSize: this.pageSize,
			thirdGameName:this.thirdGameName,
      thirdGameTypeId: this.thirdGameTypeId//标签对应的ID
		};
		this.loading=true;
		const res = await this.$service.fetch("/config-admin-api/thirdGameQuota/queryPagePlatformThirdGameConfig",p);
		this.loading=false;
    if (1!==res.code) return res.message && this.$message.error(res.message);
		let data = res.data;
    this.tableData = data.records;
    this.pagination.total = data.totalCount;
  }
  // 编辑
  editDetailFunc(text) {
    this.editDetail = text;
    this.editDetail.thirdGameTypeId = this.thirdGameTypeId;
    this.showEditGame = true;
  }
  @Lifecycle() created() {
    this.form = this.$form.createForm(this);
  }
}
</script>

<style lang="scss" scoped>
@import "@views/admin/Pop.scss";
.page-container {
  .report-order-text {
    margin: 15px 0;

    span {
      margin-right: 10px;
    }
  }

  .gameManage /deep/ {
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
  .game-name-item /deep/ {
    .ant-input {
      width: 132px;
    }
  }
  .ant-row:nth-child(1) /deep/ {
    margin-top: -3px;
  }
}
</style>