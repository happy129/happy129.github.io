<template>
	<!--报表 注单管理 -->
	<div class="page-container">
		<section class="report-order">
			<div class="mt15">
        		<DateSwitch ref="ds" @changeTab="searchByDate"/>
      		</div>
			<div class="mt15">
				<a-form layout="inline">
					<date-range @change="changeDate" ref="rg" title="发送时间"/>
					<a-form-item label="红包状态">
						<a-select v-model="requestParams.chatPage.status">
							<a-select-option value="">全部</a-select-option>
							<a-select-option value="0">待领取</a-select-option>
							<a-select-option value="1">已领完</a-select-option>
							<a-select-option value="2">已过期</a-select-option>
							<a-select-option value="3">已回收</a-select-option>
						</a-select>
					</a-form-item>
					<a-form-item label="设备来源">
						<a-select v-model="requestParams.chatPage.clientType">
							<a-select-option value="">全部</a-select-option>
							<a-select-option value="1">Android</a-select-option>
							<a-select-option value="2">IOS</a-select-option>
							<a-select-option value="3">H5</a-select-option>
							<a-select-option value="4">PC</a-select-option>
						</a-select>
					</a-form-item>
					<a-form-item label="用户名:">
						<a-input  v-model="requestParams.chatPage.userName"/>
					</a-form-item>
					<a-form-item label="用户ID:">
						<a-input  v-model="requestParams.chatPage.userId"/>
					</a-form-item>
					<a-form-item label="订单号:" >
						<a-input v-model="requestParams.chatPage.transactionNo" />
					</a-form-item>
					<a-form-item>
						<a-button @click="chatPage(true)" type="primary">查询</a-button>
					</a-form-item>
				</a-form>
			</div>
			<div class="mt15">
				<p><em>发红包：{{redData.count}}</em><em> 红包总数:{{redData.totalCount}}</em><em>红包领取总数:{{redData.snatchedTotalCount}}</em><em>红包领取总金额:{{redData.snatchedTotalAmount}}</em><em>总红包金额:{{redData.totalAmount}}</em><em>
						未领取金额:{{redData.noSnatchedTotalAmount}}</em><em>已过期金额:{{redData.overdueTotalAmount}}</em></p>
			</div>
			<div class="mt15">
				<a-table class="chat-table" :rowKey="e => e.id" @change="changeTablePagenation" :pagination="table.pagination" @expand="expand" :columns="table.columns" :dataSource="table.tableData"
					:rowClassName="(record, index) => { if (index % 2) { return 'bg-row-dual' } else { return 'bg-row-single' }}">
					<template slot="status" slot-scope="text, record">
						<span v-show="record.status == 0">待领取</span>
						<span v-show="record.status == 1">已领完</span>
						<span v-show="record.status == 2">已过期</span>
						<span v-show="record.status == 3">已回收</span>
					</template>
					<template slot="snatchedCount" slot-scope="text, record">
						<span>{{record.snatchedCount}}/{{record.totalCount}}</span>
					</template>
						<template slot="clientType" slot-scope="text, record">
						<span v-show="record.clientType == 4">PC</span>
						<span v-show="record.clientType == 1">Android</span>
						<span v-show="record.clientType == 2">IOS</span>
						<span v-show="record.clientType == 3">H5</span>
					</template>
					<a-table style="max-height: 200px; overflow:hidden; overflow-y: scroll;" :rowKey="(e,i) => i" :pagination="false" slot="expandedRowRender"  :columns="table.innerColumns" :dataSource="table.innerData.innerDataForTable">
						<template slot="clientType" slot-scope="text, record">
							<span v-show="record.clientType == 4">PC</span>
							<span v-show="record.clientType == 1">Android</span>
							<span v-show="record.clientType == 2">IOS</span>
							<span v-show="record.clientType == 3">H5</span>
						</template>
					</a-table>
				</a-table>
			</div>
		</section>
	</div>
</template>

<script>
	import Vue from 'vue'
	import {
		Component,
		InjectComponents,
		Lifecycle
	} from 'vue-decorators'
	import * as Api from '@api/chatroom'
	import {
		TabSwitch,
		DateSwitch
	} from '@/components/switch'
	import DateRange from '@/components/date-range/DateRange'
	import {
		close
	} from 'fs';
	import moment from "moment";

	@Component
	@InjectComponents({
		TabSwitch,
		DateRange,
		DateSwitch,
	})
	export default class ChatRedPacket extends Vue {
		// 接口请求参数
		requestParams = {
			chatPage: {
				pageNo: 1,
				pageSize: 10,
				clientType: '',
				beginTime: '',
				endTime: '',
				status: '',
				transactionNo: '',
				userId: '',
				userName: '',
			}
		};
		redData = {}
		table = {
			tableData: [],
			columns: [{
					title: '订单号',
					dataIndex: 'transactionNo',
				},
				{
					title: '用户名',
					dataIndex: 'userName',
				},
				{
					title: '红包总金额',
					dataIndex: 'amount',
				},
				{
					title: '红包领取',
					scopedSlots: {
						customRender: 'snatchedCount'
					},
				},
				{
					title: '未领取金额',
					dataIndex: 'noSnatchedTotalAmount',
				},
				{
					title: '发出时间',
					dataIndex: 'createTime',
				},
				{
					title: '设备来源',
						scopedSlots: {
						customRender: 'clientType'
					}
				},
				{
					title: '状态',
					scopedSlots: {
						customRender: 'status'
					},
				},
			],
			innerColumns: [
				{
					title: '订单号',
					dataIndex: 'id',
					key: 'operation',
					scopedSlots: {
						customRender: 'operation'
					},
				}, {
					title: '用户',
					dataIndex: 'userName',
				},
				{
					title: '抢红包金额',
					dataIndex: 'snatchAmount',
				},
				{
					title: '抢红包时间',
					dataIndex:'createTime'
				
				},
				{
					title: '红包来源',
						scopedSlots: {
						customRender: 'clientType'
					}
				}
			],
			innerData: {
				innerDataForTable: []
			},
			pagination: {
				total: 0,
				current: 1
			}
		};


		setInitialDate() {
			const { startDate, endDate } = this.$refs.ds.getTime();
			this.$refs.rg.setDateRangeValues(startDate, endDate);
			this.requestParams.chatPage.beginTime = startDate;
			this.requestParams.chatPage.endTime = endDate;
		}

		@Lifecycle mounted() {
			this.chatPage();
			this.chatPageCount();
			this.setInitialDate();
		}
			// 切换分页 
		changeTablePagenation(pagination) {
			this.table.pagination.current = pagination.current;
			this.requestParams.chatPage.pageNo = pagination.current;
			this.chatPage();
		}
		expand(expanded,record){
			if(expanded)this.selectByChatRedEvenlopeItemVO(record.id)
		}
		changeDate(startTime, endTime) {
			this.requestParams.chatPage.beginTime = startTime
			this.requestParams.chatPage.endTime = endTime
		}
		/** 快捷选择时间*/
		searchByDate(startTime, endTime) {
			this.changeDate(startTime, endTime);
			this.$refs.rg.setDateRangeValues(startTime, endTime);
		}
		//请求红包详情
	    async selectByChatRedEvenlopeItemVO(id){
		const { data: response } = await Api.selectByChatRedEvenlopeItemVO({redEvenlopeId:id})
			if (response?.body?.code === 1) {
				if (!Array.isArray(response.body.data)){
					this.table.innerData.innerDataForTable = [response.body.data]
				}else{
				this.table.innerData.innerDataForTable=response.body.data
				}
			}
		}
		//请求红包列表接口 
		async chatPage(refresh) {
			if (refresh) {
				this.table.pagination.current = 1;
				this.table.pagination.pageNo = 1;
				this.requestParams.chatPage.pageNo =  1;
				this.chatPageCount();
			}
			/*if (this.requestParams.chatPage.beginTime === '') {
				this.requestParams.chatPage.beginTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
			} else if (this.requestParams.chatPage.endTime === '') {
				this.requestParams.chatPage.endTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
			}*/
			const { data: response } = await Api.chatRedEnvelopePage(this.requestParams.chatPage);
			if (response?.body?.code === 1 && response?.body?.data?.records instanceof Array) {
				this.table.tableData = response.body.data.records;
				this.table.tableData.map(item=>{
						item.noSnatchedTotalAmount = (item.amount - item.snatchedAmount).toFixed(2);
						return item
				})
				this.table.pagination.total = response.body.data.totalCount;
			}
		}
		//请求红包总信息
		async chatPageCount() {
			const {
				data: response
			} = await Api.chatRedEnvelopePageCount(this.requestParams.chatPage);
			if (response?.body?.code === 1) {
				this.redData = response.body.data
			}
		}
	}
</script>

<style lang="scss" scoped>
	em {
		font-style: normal;
		display: inline-block;
		margin-right: 20px;
	}

	.page-container /deep/ {
		height: auto;
	}
	.report-order-text {
		margin: 15px 0;

		span {
			margin-right: 10px;
		}
	}

	.chat-table /deep/ {
		.bg-row-single {
			background-color: #5cbcb2;
		}
		.bg-row-dual {
			background-color: #33ab9f;
		}
		// .ant-table-row-level-0 {
			
		// 	&:nth-child(even) {
		// 		background-color: #5cbcb2;
		// 	}
		// 	&:nth-child(odd) {
		// 		background-color: #33ab9f;
		// 	}
		// }
	}
</style>