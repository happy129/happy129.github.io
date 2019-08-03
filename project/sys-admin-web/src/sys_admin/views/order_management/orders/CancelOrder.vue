<template>
	<!--报表 → 注单管理 →  取消注单 -->
	<section class="report-order">
		<a-form :form="vform" layout="inline" @submit.prevent="getList(true)">
			<a-form-item label="撤销平台">
				<a-select v-decorator="['platformId']" style="width:160px;">
					<a-select-option v-for="(item, index) in dsstore.queryAllPlatform" :key="index" :value="item.id">{{item.platformName}}</a-select-option>
				</a-select>
			</a-form-item> 
			<a-form-item label="撤销彩种">
				<a-cascader style="width:270px;" :options="init.lotteryCategory" @change="changeLottery" :loadData="loadLotteryData"   placeholder="选择彩种类型"/>
			</a-form-item>
			<a-form-item label="选项">
				<a-radio-group v-decorator="['type']" @change="changeType">
					<a-radio value="2">期号</a-radio>
					<a-radio value="1">注单号</a-radio>
				</a-radio-group>
			</a-form-item>
			<a-form-item :label="type == 2 ? '期号' : '注单号'">
				<a-input style="width:240px" v-if="type==2" v-decorator="['issueNoString']" placeholder="请输入期号，多个以“,”隔开"/>
				<a-input style="width:240px" v-else v-decorator="['orderNoString']" placeholder="请输入注单号，多个以“,”隔开"/>
			</a-form-item>
			<a-form-item>
				<a-button type="primary" html-type="submit" :loading="init.loading">查询</a-button>
			</a-form-item>
			<a-form-item v-permission="10071">
				<a-button type="primary" @click="cancelOrder">撤销注单</a-button>
			</a-form-item>
		</a-form>

		<div class="page-under-table">
			<a-table class="mytable" bordered :columns="table.columns" :loading="init.loading" :pagination="false" :dataSource="table.dataSource">
				<template slot="status" slot-scope="text, record">
					{{ record.status == 0 ? "撤单进行中" : "撤单已完成" }}
				</template>
			</a-table>
			<div style="text-align:right;padding-top:20px;">
				<a-pagination ref="pagination" @change="changePagination"  :current="table.pagination.current" :defaultCurrent="table.pagination.current" :total="table.pagination.total" />
			</div>
		</div>

		<a-modal title="撤销提示"  v-model="init.modalShow" :destroyOnClose="true" :maskClosable="false">
			<div class="cancel-order-wrapper">
					<h4 class="text-center bold g-red">以下注单已经开奖，无法进行撤销。</h4>
					<div class="cancel-order-list">
						<ul>
							<li v-for="(item, index) in cancelOrderList" :key="index">{{ item.orderNo }}</li>
						</ul>
					</div>
			</div>
			<div slot="footer">
				<a-button @click="init.modalShow=false">关闭</a-button>
			</div>
		</a-modal>

	</section>
</template>
<script>
import Vue from 'vue'
import { Component, Lifecycle } from 'vue-decorators'

const dsstore = {
	queryAllPlatform: "/config-admin-api/platform/queryAllPlatform"
}

@Component({
	formOptions: "id",
	dsstore
})
export default class CancelOrder extends Vue {
	table = {
		columns: [
			{ title: '彩种', dataIndex: 'lotteryName'},
			{ title: '期号', dataIndex: 'issueNo'},
			{ title: '注单号', dataIndex: 'orderNo'},
			{ title: '添加时间', dataIndex: 'createTime'},
			{ title: '操作人', dataIndex: 'adminName' },
			{ title: '状态', scopedSlots: { customRender: 'status' } }
		],
		dataSource: [],
		pagination: { total: 0, current: 1 }
	};

	// 默认根据期号查询
	type =  1;
	// 撤销注单列表
	cancelOrderList = [];

  init = {
    loading: false,
    modalShow: false,
    modalLoading: false,
    query: { pageNo: 1, pageSize: 10, lotteryId: "" },
	lotteryCategory: [],
    gameCategory: []
	}

	@Lifecycle mounted() {
		if (this.dsstore.queryAllPlatform && this.dsstore.queryAllPlatform  instanceof Array) {
			this.vform.setValue("platformId", this.dsstore.queryAllPlatform[0]?.id);
		}
		this.vform.setValue('type', 1);
		this.getAllLotteryList();
	}

	changeType(e) {
		this.type = e.target.value;
	}

	changePagination(pagination) {
		this.table.pagination.current = pagination;
		this.init.query.pageNo = pagination;
		this.getList();
	}
	
	// 选择彩票列表
  changeLottery(value) {
    this.init.query.lotteryId = value[1] ? value[1] : "";
   // this.init.query.lotteryCategoryId = value[1] ? value[1] : "";
	}
	
	async getAllLotteryList() {
    const res = await this.$service.fetch("/config-admin-api/category/queryAllCategory");
    const result = [];
    if (res.code === 1 && res.data instanceof Array) {
       res.data.forEach(item => {
        result.push({
          value: item.id,
          label: item.categoryName,
          isLeaf: false
        });
      });
		}
    this.init.lotteryCategory = result;
  }

	// 撤销注单
	async cancelOrder() {
		const form = await this.vform.validate();
		if (!this.init.query.lotteryId) return this.$message.error("请先选择彩种");

		if (!await this.$confirm({ title: "确认撤销注单?"})) return;
		const { lotteryId } = this.init.query;
		const res = await this.$service.fetch("/config-admin-api/cancelOrderRecord/cancelOrder", Object.assign(form.values, {
			lotteryId
		}));
		if (res.code !== 1) return res.message && this.$message.error(res.message);
		if (res.data?.cancelOrderRecordList instanceof Array) {
			this.cancelOrderList = res.data.cancelOrderRecordList
		}
		if (res.data?.errorTips) {
			this.$modal.warning({
				title: "撤单信息",
				content: res.data.errorTips
			});
		}
	}

  // 获取彩票列表
  async loadLotteryData(selectedOptions) {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;
    const res = await this.$service.fetch("/config-admin-api/lottery/queryAllLotteryByCategoryId", { id: targetOption.value });
    targetOption.loading = false;
    if (res.code === 1 && res.data instanceof Array) {
      targetOption.children = res.data.map(item => {
        return { value: item.id, label: item.lotteryName }
      });
      this.init.lotteryCategory = [...this.init.lotteryCategory];
    }
	}

	resetPagination() {
    this.table.pagination.current = 1;
    this.init.query.pageNo = 1;
  }

	async getList(refresh) {
		if (refresh) this.resetPagination();

		const form = await this.vform.validate();
		const params = this.$trimValues(form.values);
		if (form.errors) return;

		this.init.loading = true;
		const query = {...this.init.query};
		const res = await this.$service.fetch("/config-admin-api/cancelOrderRecord/queryPageOpenCancelOrder", Object.assign(form.values, query));
		this.init.loading = false;
		if (res.code !== 1) return res.message && this.$message.error(res.message);
		this.hidePageNumber(res);
		if (res.data?.records instanceof Array) {
			this.table.dataSource = res.data.records;
			this.table.pagination.total = res.data.totalCount;
		} else {
			this.table.dataSource = [];
			this.table.pagination.pageSize = 1;
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
}
</script>

<style lang="scss" scoped>
.cancel-order-list {
	max-height: 300px;
	overflow-y: auto;
}
.cancel-order-list {
	margin-top: 10px;
	ul {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		li {
			flex: 0 1 50%;
			text-align: center;
			font-size: 14px;
		}
	}
}
</style>