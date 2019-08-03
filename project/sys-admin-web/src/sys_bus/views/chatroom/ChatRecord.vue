<template>
  <!--报表 注单管理 -->
  <div class="page-container">
    <section class="report-order">
      <div class="mt15">
        <DateSwitch ref="ds" @changeTab="searchByDate"/>
      </div>
      <div class="mt15">
        <a-form layout="inline">
            <date-range ref="rg" @change="changeDate" title='发送时间' />
          <a-form-item label="状态">
            <a-select v-model="init.type">
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="1">文字</a-select-option>
              <a-select-option value="2">图片</a-select-option>
              <a-select-option value="3">红包</a-select-option>
              <a-select-option value="4">订单分享</a-select-option>
              <a-select-option value="5">盈亏分享</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="_queryAll">查询</a-button>
          </a-form-item>
        </a-form>
      </div>
      <div class="mt15" style="display:flex;align-items:center">
        <p style="color:#FF0000;margin-right:20px">
          *聊天室内容（最新一条记录无法删除）
        </p>
        <a-button v-permission="20283" type="primary" @click="exportdata" :loading="buttonloading">导出数据<!--<a href="/lottery-admin-api/manualChangeWallet/downloadExcelTemplate" download="聊天室数据">导出数据</a>--></a-button>
      </div>
      <div class="mt15">
		  <a-table
			:rowKey="(r, i) => i"
			@change="changeTablePagenation"
			:pagination="paginationParams"
			:columns="columns"
            class="table"
			:dataSource="tableData">
			<template slot="type" slot-scope="record">
				<span v-show="record.type === 1">文字消息</span>
				<span v-show="record.type === 2">图片</span>
				<span v-show="record.type === 3">红包</span>
				<span v-show="record.type === 4">订单分享</span>
				<span v-show="record.type === 5">盈亏分享</span>
			</template>
			<template slot="operate" slot-scope="t, r">
						<a-popconfirm title="确定删除吗?" @confirm="deleteL(r.id)" okText="确定" cancelText="取消">
			<a-button  v-permission="20284" type="primary" size="small">删除</a-button>
			</a-popconfirm>
			</template>
      </a-table>
	  </div>
    </section>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents, Lifecycle } from 'vue-decorators'
import { TabSwitch, DateSwitch } from '@/components/switch'
import DateRange from "@/components/date-range/DateRange"
import moment from "moment";
import { error } from 'util';
import axios from "axios";
@Component
@InjectComponents({
	TabSwitch,
	DateSwitch,
	DateRange
})
export default class ChatRecord extends Vue {
	columns = [{
			title: 'ID',
			dataIndex: 'id',
		},
		{
			title: '用户名',
			dataIndex: 'userName',
		},
		{
			title: '昵称',
			dataIndex: 'nickName',
		},
		{
			title: '类型',
			scopedSlots: {
				customRender: 'type'
			}
		},
		{
			title: '内容',
			dataIndex: 'message',
		},
		{
			title: '操作时间',
			dataIndex: 'sendTime',
		},
		{
			title: '操作',
			dataIndex: 'handle',
			scopedSlots: {
				customRender: 'operate'
			}
		}
	];
	buttonloading = false;
	/** 表格数据 */		
	tableData = [];
	paginationParams={ pageNo: 1, total:0 };
	init={ pageNo: 1, pageSize: 10,
	startTime:"",
	endTime: "",
	type: "" };
	// 初始时间
    setInitialDate() {
        const { startDate, endDate } = this.$refs.ds.getTime();
        this.$refs.rg.setDateRangeValues(startDate, endDate);
        this.init.startTime = startDate;
        this.init.endTime = endDate;
    }
	// 切换分页 
	changeTablePagenation(pagination) {
		this.init.pageNo = pagination.current;
		this.paginationParams.pageNo = pagination.current;
        this.paginationParams.current = pagination.current;
		this._queryPageChatRecord();
	}

    changeDate(startTime, endTime) {
        this.init.startTime = startTime;
        this.init.endTime = endTime;
    }
    // searchByDate(startDate, endDate){
    //     this.changeDate(s)
	// 	this.init.startTime=startDate;
	// 	this.init.endTime=endDate;
    //     this.$refs.rg.setDateRangeValues(startTime, endTime);
	// }
    searchByDate(startTime, endTime) {
        this.changeDate(startTime, endTime);
        this.$refs.rg.setDateRangeValues(startTime, endTime);
    }

	disabledStartDate(startValue) {
		const endValue = this.endValue;
		if (!startValue || !endValue) {
			return false;
		}
		return startValue.valueOf() > endValue.valueOf();
		}
		/** 删除 */
		async deleteL(id) {
		let res = await this.$service.fetch( "/lottery-admin-api/chatRecord/removeChatRecord", { id: id } );
		if (1 !== res.code) return this.$message.error(res.message);
		this.$message.success(res.message);
		this._queryPageChatRecord();
	}

	changeDate(startTime, endTime) {
		this.init.startTime = startTime
		this.init.endTime = endTime
	}
	/** 根据条件查询聊天记录 */
	_queryAll(){
	    this.paginationParams.current = 1;
        this.paginationParams.pageNo = 1;
        this.init.pageNo = 1;
		this._queryPageChatRecord();
	}
	/** 查询聊天记录 */
	async _queryPageChatRecord(){
		const res = await this.$service.fetch( "/lottery-admin-api/chatRecord/queryPageChatRecord", Object.assign(this.init,{}) );
		if (res.code !== 1) return res.message && this.$message.error(res.message);
		this.tableData=Object.freeze(res.data.records);
		this.paginationParams.total=res.data.totalCount;
	}
	/*** 导出数据*/
	async exportdata() {
	    const res = await this.$service.download('/lottery-admin-api/chatRecord/exportChatRecord');
	    if (1 !== res.code) return res.message && this.$message.error(res.message);
        if (res.code) {
            this.$message.success(res.message);
        }
		// const res = await axios({
		// 	url: `/lottery-admin-api/chatRecord/exportChatRecord`,
		// 	params: {
		// 		token: this.token
		// 	},
		// 	method: 'post',
		// 	responseType: 'blob'
		// });
		// const blob = res.data;
		// if (res.data.type === "application/json") {
		// 	this.$message.error('导出数据失败');
		// } else {
		// 	const reader = new FileReader();
		// 	reader.readAsDataURL(blob);
		// 	reader.onload = (e) => {
		// 		const a = document.createElement("a");
		// 		a.download = '聊天记录数据.csv';
		// 		document.body.appendChild(a);
		// 		a.href = e.target.result;
		// 		document.body.appendChild(a);
		// 		a.click();
		// 		document.body.removeChild(a);
		// 	}
		// }
	}
    @Lifecycle() created(){
        this._queryPageChatRecord();
    }
	@Lifecycle() mounted(){
		this.setInitialDate();
	}
}
</script>

<style lang="scss" scoped>
.page-container {
	.report-order /deep/ {
		height: 100%;
		overflow-y: auto;
        .ant-table-tbody {
            >tr {
                >td {
                    max-width: 800px;
                    word-wrap:break-word;
                    word-break:break-all
                }
            }
        }
	}
}
.report-order-text {
  margin: 15px 0;

  span {
    margin-right: 10px;
  }
}
</style>