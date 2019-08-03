<template>
	<!--报表 注单管理 -->
	<div class="page-container chase-order">
		<section>
			<tab-switch :columns="TabColumns" :defaultSelected="TabSelected" @changeTabs="changeTabs" />
			<div class="mt15">
				<tab-switch :columns="SubTabColumns" :defaultSelected="TabSubSelected" level="2" @changeTabs="changeSubTabs" />
			</div>
			<div class="mt15">
				<date-switch ref="ds" @changeTab="searchByDate"></date-switch>
			</div>
			<div class="mt15">
				<a-form :form="formEl" layout="inline">
					<a-form-item label="起止时间">
						<a-select :dropdownMatchSelectWidth="false" v-model="params.queryTimeType" defaultValue="1">
							<a-select-option value="createTime">投注时间</a-select-option>
							<a-select-option value="settleTime">开奖时间</a-select-option>
						</a-select>
					</a-form-item>
					<date-range ref="rg" @change="changeDate" />
					<a-form-item label="平台名称">
						<a-select :dropdownMatchSelectWidth="false" v-model="params.platformId">
							<a-select-option v-for="item in platformList" :value="item.id" :key="item.id">{{item.platformName}}
							</a-select-option>
						</a-select>
					</a-form-item>
					<a-form-item label="用户类型">
						<a-select :dropdownMatchSelectWidth="false" v-decorator="['userType',{ initialValue: ''}]"
							style="width:100px;">
							<a-select-option value=''>全部</a-select-option>
							<a-select-option value="99">正式用户</a-select-option>
							<a-select-option value="0">试玩用户</a-select-option>
							<a-select-option value="-1">内测用户</a-select-option>
						</a-select>
					</a-form-item>
					<a-form-item label="选择玩法">
						<a-select :dropdownMatchSelectWidth="false" style="width:100px" v-model="params.playId" defaultValue="1">
							<a-select-option value=''>全部</a-select-option>
							<a-select-option v-for="(d, i) in lotteryPlayId" :value="d.id" :key="i">
								{{d.typeName}}-{{d.planName}}-{{d.playName}}</a-select-option>
						</a-select>
					</a-form-item>
					<a-form-item label="注单状态">
						<a-select :dropdownMatchSelectWidth="false"  v-decorator="['chaseStatus',{ initialValue: ''}]"
							style="width:100px;">
							<a-select-option value=''>全部</a-select-option>
							<a-select-option v-for="(item, index) in dictionary.chaseStatus" :key="index" :value="item.value">
								{{item.name}}</a-select-option>
						</a-select>
					</a-form-item>
				</a-form>
			</div>
			<div class="mt10">
				<a-form layout="inline">
					<a-form-item label="用户名">
						<a-input v-model="params.userName" />
					</a-form-item>
					<a-form-item label="用户ID">
						<a-input v-model="params.userId" />
					</a-form-item>
					<a-form-item label="追号订单号">
						<a-input v-model="params.orderGroupNo" />
					</a-form-item>
					<a-form-item label="期号">
						<a-input v-model="params.issueNo" />
					</a-form-item>
					<a-form-item>
						<a-button @click="submit" :loading="init.loading" type="primary" v-permission="10076">查询</a-button>
					</a-form-item>
				</a-form>
			</div>
			<div class="mt15">
				<a-table :pagination="false" :loading="init.loading" @expand="expand" :rowKey="(e,i) => i"
					:columns="columns" :dataSource="tableData" class="components-table-demo-nested">
					<template slot="orderStatus" slot-scope="text, records">
						<!-- <p>{{dictionary.orderStatus.filter(item=>item.value==records.orderStatus)[0].name}}</p> -->
						<p>{{getTextByType(records.orderStatus, dictionary.orderStatus)}}</p>
					</template>
					<template slot="clientType" slot-scope="text, records">
						<!-- <p>{{dictionary.clientType.filter(item=>item.value==records.clientType)[0].name}}</p> -->
						<p>{{getTextByType(records.clientType, dictionary.clientType)}}</p> 
					</template>
					<template slot="isStopChaseWhenWinning" slot-scope="text, records">
						<p v-if="records.isStopChaseWhenWinning">是</p>
						<p v-else>否</p>
					</template>
					<template slot="betNumber" slot-scope="text, records">
						<p class="bet-number-wrap">{{records.betNumber}}</p>
					</template>
					<template slot="expandedRowRender" slot-scope="params">
						<a-table :rowKey="(e,i) => i" :columns="innerColumns" :dataSource="params.innerData"
							:pagination="false">
							<template slot="openNo" slot-scope="text, records">
								<p class="open-no">{{records.openNumber}}</p>
							</template>
							<template slot="winAmount" slot-scope="text, records">
								<span v-if="records.winAmount > 0" class="g-red bold">{{records.winAmount}}</span>
								<span v-else>{{records.winAmount}}</span>
							</template>
							<template slot="profit" slot-scope="text, records">
								<span class="g-red bold" v-if="parseFloat(records.profit) > 0">+{{records.profit}}</span>
								<span class="g-green" v-else>{{records.profit}}</span>
							</template>
							<template slot="orderStatusS" slot-scope="text, records">
								<p class="g-red bold" v-if="records.orderStatusName==='已中奖'">{{ records.orderStatusName }}</p>
								<p class="g-green" v-else-if="records.orderStatusName==='未中奖'">{{ records.orderStatusName }}</p>
								<p class="g-yellow" v-else>{{ records.orderStatusName }}</p>
							</template>
						</a-table>
					</template>
				</a-table>
				<div style="text-align:right;padding-top:20px;">
					<a-pagination ref="pagination" @change="changePagination" v-permission="10077" :current="pagination.current" :defaultCurrent="pagination.current" :total="pagination.total" />
				</div>
			</div>
		</section>
	</div>
</template>
<script>
	import Vue from 'vue'
	import { Component, Lifecycle, Watch, InjectComponents } from 'vue-decorators'
	import { TabSwitch, DateSwitch } from '@/components/switch'
	import { getToken } from '@/util/auth'
	import DateRange from '@/components/date-range/DateRange'
	const dictionary = 'userType,clientType,betType,orderStatus,chaseStatus'
	import { formatDate } from "@/util/date";

	@Component({
		dictionary
	})
	@InjectComponents({
		TabSwitch,
		DateRange,
		DateSwitch
	})
	export default class OrderManage extends Vue {
		params = {
			queryTimeType: "createTime",
			queryTimeEnd: "",
			queryTimeStart: "",
			issueNo: "",
			playId: '',
			lotteryIds: "",
			orderNo: "",
			// orderStatus: 0,
			pageNo: 1,
			pageSize: 10,
			platformId: '',
			// playId: 0,
			onlyOrderGroup: true,
			orderGroupNo: "",

			userId: '',
			userName: ''
		}
		pagination = {
			total: 0,
			current: 1
		}
		timeType = '投注时间'
		TabSelected = 0;
		platformList = []
		TabColumns = ['全部'];
		TabSubSelected = 0;
		SubTabColumns = ['全部'];
		dataTable = [];
		selectPlayId = ['全部'];

		init = {
			loading: false
		}
		domTotal=0;
		// 初始化结束时间
		queryTimeEnd="";
		async changeTabs(text) {
			if (text == '全部') {
				this.TabSelected = 0
				this.SubTabColumns = ['全部'];
				this.params.lotteryIds = '';
				return
			}
			this.params.playId = ''
			this.TabSelected = this.TabColumns.findIndex(v => v === text);
			let id = text.id
			this.toFetchQueryByCategoryId(id)
			const res = await this.$service.fetch('/config-admin-api/lottery/queryAllLotteryByCategoryId', { id });
			if (res.data instanceof Array){ 
				this.SubTabColumns = res.data
				this.SubTabColumns.unshift('全部')
			}
		}
		changeSubTabs(text) {
			if (text == '全部') {
				this.params.lotteryIds = '';
				// this.SubTabColumns = ['全部'];
				this.TabSubSelected = 0
				return
			}
			this.params.lotteryIds = text.id
			this.TabSubSelected = this.SubTabColumns.findIndex(v => v === text);
		}

		@Lifecycle created() {
			this.toFetchQueryByCategoryId();
			this.queryAllPlatform();
			this.fetchLotteryCategorys();
			this.formEl = this.$form.createForm(this)
			//平台名称接口
		}
		@Lifecycle mounted() {
			this.setInitialDate();
		}
		//展开子集
		expand(expanded, record) {
			if (expanded) this.queryChaseGroup(record)
		}
		getTextByType(type, array) {
			return array.find(item => item.value == type)?.name;
		}
		changePagination(current) {
			this.pagination.current = current;
			this.params.pageNo = current;
			this.queryOrderReport(false);
		}
		changeDate(startTime, endTime, datestring, type) {
		 if (type === 'start') {
				this.params.queryTimeStart = datestring
			} else {
				this.params.queryTimeEnd = datestring
			}
		}
		setInitialDate() {
			const { startDate, endDate } = this.$refs.ds.getTime();
			this.$refs.rg.setDateRangeValues(startDate, endDate);
			this.params.queryTimeStart = startDate;
			this.params.queryTimeEnd = endDate;
		}
		searchByDate(startDate, endDate) {
			// this.changeDate(startDate, endDate)
			this.params.queryTimeStart = startDate;
			this.params.queryTimeEnd = endDate;
			this.$refs.rg.setDateRangeValues(startDate, endDate);
		}
		submit() {
			this.pagination.current=2;
			this.domTotal=0;
			this.queryOrderReport(true)
		}
		//查询子集详情
		async queryChaseGroup(record) {
			const params = {
				platformId: record.platformId,
				orderGroupNo: record.orderGroupNo,
				pageNo: 1,
				pageSize: 120,
				userId: record.userId
			}
			const res = await this.$service.fetch('/lottery-admin-api/orderReport/queryPageOrderReport', params);
			if (1 != res.code) return this.$message.error(res.message);
			record.innerData = res.data.records || []
		}
		//查询订单详情 
		async queryOrderReport(page=true) {
			this.formEl.validateFields(async (err, values) => {
				if (err)return
				this.init.loading = true;
				let params = Object.assign(values, this.params);

				// 判断结束时间是否大于当前时间
				if (page) {
					// 如果结束时间大于当前时间，设置为当前时间
					if (params.queryTimeEnd) {
						const d = new Date(params.queryTimeEnd.replace(/\-/g, '/')).getTime();
						const now = Date.now();
						if (d > now) {
							params.queryTimeEnd = formatDate(new Date());
							// 缓存数据
							this.queryTimeEnd = values.queryTimeEnd;
						}
					}
				} else {
					const d1 = new Date(this.params.queryTimeEnd.replace(/\-/g, '/')).getTime();
					const d2 = new Date(this.queryTimeEnd.replace(/\-/g, '/')).getTime();
					if (d1 < d2) {
						params.queryTimeEnd = this.params.queryTimeEnd
					} else {
						params.queryTimeEnd = this.queryTimeEnd;
					}
				}
				const res = await this.$service.fetch('/lottery-admin-api/orderReport/queryPageChaseOrderReport', { ...params });
				this.init.loading = false;
				if (1 != res.code) return this.$message.error(res.message);
				if (res.data?.records instanceof Array) {
					this.tableData = res.data.records.map(item => { return { ...item, innerData: [] } });
					this.pagination.total = res.data?.totalPage * 10;
					this.hidePageNumber(res);
					return;
				}
				this.tableData = [];
			});
		}

		/** 隐藏页码 */
	hidePageNumber(res){
		/** 判断如果当前分页大于10页就隐藏最后一页 */
		if (!res?.data?.totalPage) return;

		setTimeout(() => {
			// 不超过10页直接不用管
			if (res.data.totalPage <= 10) return;
			// 获取第一个元素
			const fristElement = this.$refs.pagination.$el.querySelector(`.ant-pagination-item-1`);
			// 获取分页的最后一个元素
			const lastElement = this.$refs.pagination.$el.querySelector(`.ant-pagination-item-${res.data.totalPage}`);
			// 大于10页第一个元素隐藏
			lastElement.style.display = 'none';
			// 如果当前页码大于10, 点击的跨度不能大于10， 所以首页得隐藏
			if (res.data.pageNo > 10) {
				fristElement.style.display = 'none';
			} else {
				fristElement.style.display = 'inline-block';
			}
		});
	}
		async queryAllPlatform() {
			// 请求参数，不用管api上的header
			const res = await this.$service.fetch('/config-admin-api/platform/queryAllPlatform', {});
			if (1 != res.code) return this.$message.error(res.message);
			this.platformList = res.data || [];
			this.params.platformId = res.data[0].id;
			this.queryOrderReport()
		}

		async fetchLotteryCategorys() {
			// 请求参数，不用管api上的header
			const res = await this.$service.fetch('/config-admin-api/category/queryAllCategory', {});
			if (1 != res.code) return this.$message.error(res.message);
			// 业务处理
			this.lotteryCategoryArrays = res.data || [];
			this.TabColumns = res.data
			this.TabColumns.unshift('全部')
		}


		/** 查询玩法信息 */
		async toFetchQueryByCategoryId(id) {
			if (!this.TabSelected) {
				return this.lotteryPlayId = [];
			}
			const res = await this.$service.fetch('/config-admin-api/play/queryAllThirdLevelPlayByCategoryId', { id });
			if (1 != res.code) return res.message && this.$message.error(res.message);
			this.lotteryPlayId = res.data;
		}
		columns = [{
				title: '彩种名称',
				dataIndex: 'lotteryName',
			},
			{
				title: '追号订单号',
				dataIndex: 'orderGroupNo',
			},
			{
				title: '用户名',
				dataIndex: 'userName',
			},
			{
				title: '玩法',
				dataIndex: 'playName',
			},
			{
				title: '下注内容',
				dataIndex: 'betNumber',
				scopedSlots: {
					customRender: 'betNumber',
				}
			},
			{
				title: '期数',
				dataIndex: 'startIssueNo',
			}, {
				title: '下注时间',
				dataIndex: 'createTime',
			}, {
				title: '来源',
				dataIndex: 'clientType',
				scopedSlots: {
					customRender: 'clientType',
				}
			}, {
				title: '中奖追停',
				dataIndex: 'isStopChaseWhenWinning',
				scopedSlots: {
					customRender: 'isStopChaseWhenWinning',
				}
			}, {
				title: '状态',
				dataIndex: 'chaseStatusName'
			}
		];
		innerColumns = [{
				title: '彩种名称',
				dataIndex: 'lotteryName',
			},
			{
				title: '订单号',
				dataIndex: 'orderNo',
			},
			{
				title: '期号',
				dataIndex: 'issueNo',
			},
			{
				title: '开奖号码',
				dataIndex: 'openNumber',
				scopedSlots: {
					customRender: "openNo"
				}
			},
			{
				title: '下注金额',
				dataIndex: 'orderAmount',

			}, {
				title: '返水比率',
				dataIndex: 'rebateRate',
			}, {
				title: '中奖金额',
				dataIndex: 'winAmount',
				scopedSlots: { customRender: 'winAmount' }
			}, {
				title: '下注时间',
				dataIndex: 'createTime',
			}, {
				title: '盈亏',
				dataIndex: 'profit',
				scopedSlots: { customRender: 'profit' }
			}, {
				title: '状态',
				scopedSlots: {
					customRender: 'orderStatusS',
				}
			}
		];
		innerData = []
		tableData = []
	}
</script>

<style lang="scss">
	.report-order-text {
		margin: 15px 0;

		span {
			margin-right: 10px;
		}
	}

	.width140>div {
		width: 180px !important;
	}

	.chase-order {
		overflow: auto !important;
	}

	.bet-number-wrap {
		max-width: 160px;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}
	.open-no {
		width: 150px;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}
</style>