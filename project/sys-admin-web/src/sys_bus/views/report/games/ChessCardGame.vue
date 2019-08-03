<template>
	<div class="page-container">
		<a-table :columns="table.columns" :rowKey="(e, i) => i" :dataSource="table.dataSource" :pagination="false">
		</a-table>
		<div style="text-align:right;padding-top:20px;">
			<a-pagination ref="pagination" @change="changePagination"  :current="table.pagination.current" :defaultCurrent="table.pagination.current" :total="table.pagination.total" />
		</div>
	</div>
</template>

<script>
import Vue from 'vue'
import { Component, Prop, Lifecycle } from 'vue-decorators'
import { formatDate } from "@/util/date"

@Component
export default class ChessCardGame extends Vue {
	// 从父组件里面传过来的查询条件
	@Prop({ type: Object, default: () => {}}) options;

	table = {
		columns: [
			{ title: '游戏名称', dataIndex: 'playName'  },
			{ title: '人数', dataIndex: 'userCount'},
			{ title: '注数', dataIndex: 'validOrderCount' },
			{ title: '有效注数金额', dataIndex: 'validOrderAmount' },
			{ title: '中奖金额', dataIndex: 'totalWinAmount' },
			{ title: '平台盈亏', dataIndex: 'totalProfit'}
		],
		dataSource: [],
		pagination: { total: 0, current: 1, pageSize: 10 }
	}

	@Lifecycle mounted() {
		this.getList();
	}


	changePagination(pagination) {
    this.table.pagination.current = pagination;
		// this.init.query.pageNo = pagination.current;
		this.$emit('updatePageNo', pagination);
    this.getList();
  }

	async getList(page=true) {
	// 判断选择时间是否大于当前时间
	if (page) {
		// 如果结束时间大于当前时间，设置为当前时间
		if (this.options.createTimeEnd) {
			const d = new Date(this.options.createTimeEnd.replace(/\-/g, '/')).getTime();
			const now = Date.now();
			if (d > now) {
				this.options.createTimeEnd = formatDate(new Date());
				// 缓存数据
				this.queryTimeEnd = this.options.createTimeEnd;
			}
		}
	} else {
		const d1 = new Date(this.options.createTimeEnd.replace(/\-/g, '/')).getTime();
		const d2 = new Date(this.queryTimeEnd.replace(/\-/g, '/')).getTime();
		if (d1 < d2) {
			this.options.createTimeEnd = this.options.createTimeEnd;
		} else {
			this.options.createTimeEnd = this.queryTimeEnd;
		}
	}
    const res = await this.$service.fetch('/lottery-admin-api/orderReport/search/thirdLotteryStat', this.options);
	// this.hidePageNumber(res);
    if (res.code !== 1) return res.message && this.$message.error(res.message);
		if (res?.data?.records instanceof Array) {
			this.table.dataSource = res.data.records;
			this.table.pagination.total = res.data.totalCount
		} else {
			this.table.dataSource = [];
			this.table.pagination.total = 0;
		}
  }

	/** 隐藏页码 */
	hidePageNumber(res){
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
}
</script>