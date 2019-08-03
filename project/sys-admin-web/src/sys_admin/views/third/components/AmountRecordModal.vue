<template>
	<div>
		<!-- 额度添加模态框 -->
		<a-modal v-on="$listeners" :width="900" title="添加额度" v-model="amountRecordModalShow" :footer="null" :destroyOnClose="true" :maskClosable="false">
			<a-form layout="inline">
        <a-form-item class="button-group">
					<a-range-picker @change="onChange" format="YYYY-MM-DD HH:mm:ss"/>
          &emsp;<a-button type="primary" @click="_getTotalQuotaDetail" style="margin:0px 10px;" ref="btnSave">查询</a-button>
          <a-button type="primary" @click="()=>{modalInShow=true;this.addThirdGameQuota.addQuota='';this.addThirdGameQuota.remark='';}">添加额度</a-button>
        </a-form-item>
      </a-form>
			<a-table style="margin-top:10px;" :columns="table.inColumns" :dataSource="inTableData" @change="changePagination2" :pagination="pagination2"
			 :rowKey="e=>e.preTotalQuota+'a'" class="mytable" bordered ></a-table>
    </a-modal>
			<a-modal style="margin-top:10%;" :width="`30%`" title="添加额度" :closable="true" v-model="modalInShow" :footer="null" :destroyOnClose="true" :maskClosable="false">
					<a-form :form="addThirdGameQuota">
						<a-form-item v-bind="formItemLayout" label="添加额度">
							<a-input v-decorator="['addQuota', {initialValue:'', rules: [{required:true,pattern:/^[\d]+$/,message:'请输入额度'}]}]"/>
						</a-form-item>
						<a-form-item v-bind="formItemLayout" label="备注">
							<a-input v-decorator="['remark', {initialValue:'', rules: [{required:true,pattern:/^[\u4e00-\u9fa5|a-z0-9A-Z]{1,20}$/,message:'备注格式：中英文数字1-20位'}]}]"/>
						</a-form-item>
						<a-form-item  style="margin-left:70px;">
							<a-button type="primary" @click="_addThirdGameQuota">保存</a-button>
						</a-form-item>
			</a-form>
    </a-modal>
	</div>
</template>
<script>
import Vue from "vue";
import  XTabs  from "./XTabs";
import { Component, InjectComponents, Computed, Lifecycle, Watch } from "vue-decorators";
import * as Api from "@api/admin";
import moment from "moment"
@Component({})
@InjectComponents({XTabs})
export default class AmountRecordModal extends Vue {
	formItemLayout={ labelCol: { span: 7 }, wrapperCol: { span: 14 }, };
	pagination2= { total: 0, pageNo: 1,pageSize:10 };
	modalShow=false;
	amountRecordModalShow=false;
	modalInShow=false;
	details={};
	allGs = [];
	typeGs = [];
  // 表格
  table = {
		inColumns: [
      { title: "添加时间", dataIndex: "createTime" },
      { title: "添加前总额度", dataIndex: "preTotalQuota" },
      { title: "添加额度", dataIndex: "addQuota" },
      { title: "添加后总额度", dataIndex: "postTotalQuota"},
      { title: "备注", dataIndex: "remark" },
    ]
  };
	inTableData=[];
	queryPlatformForThirdGames={endTime: "", pageNo: 1, pageSize: 10, platformId:0, startTime: "", thirdGameCode:"" };
	addThirdGameQuotaCopy={platformId:"",thirdGameCode:""};

	/** 获取游戏额度 */
	async _getTotalQuota(items,sn=false){

		this.amountRecordModalShow=true;
		this.addThirdGameQuotaCopy.platformId=sn?0:items.platformId;
		this.addThirdGameQuotaCopy.thirdGameCode=items.thirdGameCode;

		this.queryPlatformForThirdGames.thirdGameCode=items.thirdGameCode;
		this.queryPlatformForThirdGames.platformId=sn?0:items.platformId;
		this._getTotalQuotaDetail();
	}

	onChange(date, dateString){
		this.queryPlatformForThirdGames.startTime= moment(dateString[0]).format('YYYY-MM-DD')+' 00:00:00';
		this.queryPlatformForThirdGames.endTime= moment(dateString[1]).format('YYYY-MM-DD')+' 23:59:59';
	}
	/** 查询游戏额度 */
	async _getTotalQuotaDetail(){
		/** 清空时间查询时会有bug,兼容处理 */
		if(this.queryPlatformForThirdGames.startTime.indexOf('Invalid')!==-1){
				this.queryPlatformForThirdGames.startTime="";
				this.queryPlatformForThirdGames.endTime="";
		}
		const res = await this.$service.fetch( "/config-admin-api/thirdGameQuotaRecord/queryPlatformForThirdGame",Object.assign(this.queryPlatformForThirdGames,this.pagination2));
		if (1!==res.code) return res.message && this.$message.error(res.message);
		this.inTableData=res.data.records;
		this.pagination2.total=res.data.totalCount;
	}
	/** 添加游戏额度 */
	async _addThirdGameQuota(){
		await this.addThirdGameQuota.validateFields(async (err, values) => {
			if (err) return;
				const res = await this.$service.fetch( "/config-admin-api/thirdGameQuotaRecord/addThirdGameQuota",Object.assign(values,this.addThirdGameQuotaCopy));
				if (1!==res.code) return res.message && this.$message.error(res.message);
				this.$message.success(res.message);
				this.modalInShow=false;
				this._getTotalQuotaDetail();
		});
	}
	/** 弹框翻页 */
	async changePagination2(p, s){
		this.pagination2.pageNo = p.current;
		this._getTotalQuotaDetail();
	}

	@Lifecycle() created() {
		this.addThirdGameQuota = this.$form.createForm(this);
  }
	
}
</script>