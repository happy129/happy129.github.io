<template>
	<div class="page-container">
		<div class="mt15">
			<date-switch ref="ds" @changeTab="searchByDate"></date-switch>
		</div>
		<div class="mt15">
			<a-form layout="inline">
				<date-range ref="rg" @change="changeDate" />
				<a-form-item label="商户名称">
					<a-select :dropdownMatchSelectWidth="false" v-model="params.platformId">
						<a-select-option v-for="(item,i) in platformList" :key="i" :value="item.id">{{item.platformName}}
						</a-select-option>
					</a-select>
				</a-form-item>
				<a-form-item label="第三方游戏">
					<a-select style="width:140px" :dropdownMatchSelectWidth="false" v-model="params.thirdGameCode">
						<a-select-option v-for="(item,i) in thirdGames" :key='i' :value="item.thirdGameCode">
							{{item.thirdGameName}}</a-select-option>
					</a-select>
				</a-form-item>
				<a-button type="primary" @click="submit">查询</a-button>
			</a-form>
		</div>
		<a-table 
			:rowKey="(e,i)=>i" 
			:columns="columns" 
			:dataSource="tableData" 
			:loading="loading"
			:pagination="false"
			>
			<a slot="operation" href="javascript:;">20190213265</a>
		</a-table>
		<div style="text-align:right;padding-top:20px;">
			<a-pagination ref="pagination" @change="changeTablePagenation"  :current="pagination.current" :defaultCurrent="pagination.current" :total="pagination.total" />
		</div>
	</div>
</template>

<script>
	import Vue from 'vue'
	import {
		Lifecycle,
		Component,
		InjectComponents
	} from 'vue-decorators'
	import DateRange from '@/components/date-range/DateRange'
	import {
		TabSwitch,
		DateSwitch
	} from '@/components/switch'
	import { formatDate } from "@/util/date";

	@Component({})
	@InjectComponents({
		TabSwitch,
		DateSwitch,
		DateRange
	})
	export default class ThirdProfit extends Vue {
		params = {
			endTime: "",
			startTime: "",
			thirdGameCode: "",
			pageNo: 1,
			pageSize: 10,
			platformId: '',
		}
		columns = [
			{
				title: '商户名称',
				dataIndex: 'platformName',
				key: '1'
			},
			{
				title: '第三方游戏',
				dataIndex: 'thirdGameName',
				key: '2'
			},
			{
				title: '投注次数',
				dataIndex: 'totalBetTimes',
				key: '3'
			},
			{
				title: '投注金额',
				dataIndex: 'totalBetAmount',
				key: '4'
			},
			{
				title: '盈亏金额',
				dataIndex: 'totalBetProfit',
				key: '5'
			}
		];
		tableData = [];
		thirdGames = [];
		platformList = [];
		loading = false;
		pagination = {
			total: 1,
			current: 1
		};
		queryTimeEnd="";
		setInitialDate() {
			const {
				startDate,
				endDate
			} = this.$refs.ds.getTime();
			this.$refs.rg.setDateRangeValues(startDate, endDate);
			this.params.startTime = startDate;
			this.params.endTime = endDate;
			this.params.platformId = '';
		}

		searchByDate(startTime, endTime) {
			//this.changeDate(startTime, endTime)
			this.params.startTime = startTime;
			this.params.endTime = endTime;
			this.$refs.rg.setDateRangeValues(startTime, endTime);
		}
		
		changeTablePagenation(pagination) {
			this.pagination.pageNo = pagination;
			this.pagination.current = pagination;
			this.params.pageNo = pagination;
			this.queryPageThirdOrder();
		}
		changeDate(startTime, endTime, datestring, type) {
			if (type === 'start') {
				this.params.startTime = datestring
			} else {
				this.params.endTime = datestring
			}
		}

		submit() {
			this.queryPageThirdOrder()
		}
		/**获取平台三方盈亏数据 */
		async queryPageThirdOrder(page=true) {
			// 判断选择时间是否大于当前时间
			if (page) {
				// 如果结束时间大于当前时间，设置为当前时间
				if (this.params.endTime) {
					const d = new Date(this.params.endTime.replace(/\-/g, '/')).getTime();
					const now = Date.now();
					if (d > now) {
						this.params.endTime = formatDate(new Date());
						// 缓存数据
						this.queryTimeEnd = this.params.endTime;
					}
				}
			} else {
				const d1 = new Date(this.params.endTime.replace(/\-/g, '/')).getTime();
				const d2 = new Date(this.queryTimeEnd.replace(/\-/g, '/')).getTime();
				if (d1 < d2) {
					this.params.endTime = this.params.endTime;
				} else {
					this.params.endTime = this.queryTimeEnd;
				}
			}
			const res = await this.$service.fetch('/lottery-admin-api/thirdOrder/queryPageThirdOrder', this.params);
			if (1 != res.code) return this.$message.error(res.message);
			if (res.data?.records) {
				this.tableData = res.data.records;
				this.pagination.total = res.data.totalPage;
			} else {
				this.tableData = [];
			}
			this.$message.success(res.message);
		}
		/**获取平台名称 */
		async queryAllPlatform() {
			const res = await this.$service.fetch('/config-admin-api/platform/queryAllPlatform', {});
			if (1 != res.code) return this.$message.error(res.message);
			this.params.platformId = res.data[0].id;
			await this.$service.fetch('/lottery-admin-api/thirdOrder/queryPageThirdOrder', this.params).then(res => {
				this.hidePageNumber(res);
				if (res.data?.records) {
					this.tableData = res.data.records;
					this.pagination.total = res.data.totalPage;
				} else {
					this.tableData = [];
				}
			});
			this.platformList = res.data || [];
			this.params.platformId = this.platformList[0].id;
		}
		/**获取第三方游戏 */
		async queryAllThridGame() {
			const res = await this.$service.fetch('/config-admin-api/thirdGame/queryAllThirdGame');
			if (1 != res.code) return this.$message.error(res.message);
			if (res?.data && res.data instanceof Array) {
				this.thirdGames = res.data;
				this.params.thirdGameCode = res.data[0]?.thirdGameCode;
			}
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

		@Lifecycle created() {
			this.queryAllPlatform();
			this.queryAllThridGame();
		}
		@Lifecycle mounted() {
			this.setInitialDate();
			// this.queryPageThirdOrder();
		}
	}
</script>