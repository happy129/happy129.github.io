<template>
	<!--报表 → 注单管理 →  取消注单 -->
	<section class="report-order">
		<a-form :form="vform" class="report-form1" @submit.prevent="getList(true)">
			<a-form-item label="撤销平台" :label-col="{ span: 4 }" :wrapper-col="{ span: 10 }">
				<a-select v-decorator="['platformId']" style="width:160px;">
					<a-select-option v-for="(item, index) in dsstore.queryAllPlatform" :key="index" :value="item.id">{{item.platformName}}</a-select-option>
				</a-select>
			</a-form-item> 
			<a-form-item label="撤销彩种" :label-col="{ span: 4 }" :wrapper-col="{ span: 10 }">
				<a-cascader style="width:270px;" :options="init.lotteryCategory" @change="changeLottery" :loadData="loadLotteryData"   placeholder="选择彩种类型"/>
			</a-form-item>
			<a-form-item label="期号" :label-col="{ span: 4 }" :wrapper-col="{ span: 10 }">
				<a-input v-decorator="['issueNoString']" placeholder="请输入期号，多个以“,”隔开"/>
			</a-form-item>
			<a-form-item label="撤单生效时间" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
				<a-row :gutter="8">
					<a-col :span="6">
						<a-input v-number v-decorator="['effectiveSeconds', { rules: [{message: '有效值为1-3600', validator: checkSeconds}]  }]" addonAfter="秒"/>
					</a-col>
					<a-col :span="18"> 
						<span class="g-red">提示：会员点击撤单按钮后，在此设定时间后才能生效撤单</span>
					</a-col>
				</a-row>
			</a-form-item>
			<div>
				<a-row :gutter="8">
					<a-col :offset="4" :span="3">
						<a-button type="primary" html-type="submit" :loading="init.loading">查询</a-button>
					</a-col>
					<a-col :span="7">
							<a-button v-permission="100741" @click="openCancelOrder">开放撤单</a-button>
					</a-col>
				</a-row>
			</div>
		</a-form>

		<div class="page-under-table">
			<a-table :rowKey="(k,i)=>i" class="mytable" bordered :columns="table.columns" :loading="init.loading" :dataSource="table.dataSource" :pagination="false" >
				<template slot="status" slot-scope="text, record">
					<span :class="[record.status == 0 ? 'g-red' : 'g-green']">{{ record.status == 0 ? "撤单已关闭" : "撤单开放中" }}</span>
				</template>
				<template slot="operation" slot-scope="text, record">
					<a-button type="primary" @click="closeCancelOrder(record.id)" v-if="record.status != 0" size="small" v-permission="10074">关闭撤单</a-button>
					<a-button type="primary" size="small" @click="openOrder(record.id)" v-else v-permission="10073">开放撤单</a-button>
				</template>
			</a-table>
			<div style="text-align:right;padding-top:20px;">
				<a-pagination ref="pagination" @change="changePagination"  :current="table.pagination.current" :defaultCurrent="table.pagination.current" :total="table.pagination.total" />
			</div>
		</div>

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
			{ title: '撤单生效时间', dataIndex: 'effectiveSeconds'},
			{ title: '添加时间', dataIndex: 'createTime'},
			{ title: '操作人', dataIndex: 'createAdminName' },
			{ title: "状态", scopedSlots: { customRender: 'status' } },
			{ title: '操作', scopedSlots: { customRender: 'operation' }}
		],
		dataSource: [],
		pagination: { total: 0, current: 1, pageSize: 10 }
	};
	
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
		this.getAllLotteryList();
	}
	
	checkSeconds(rules, value, callback) {
		if (value && value < 1 || value > 3600) {
			callback('有效值为1-3600');
		}
		callback();
	}

	// 选择彩票列表
  changeLottery(value) {
    this.init.query.lotteryId = value[1] ? value[1] : "";
    //this.init.query.lotteryCategoryId = value[1] ? value[1] : "";
	}

	changePagination(pagination) {
		this.table.pagination.current = pagination;
    this.init.query.pageNo = pagination;
		this.getList();
	}

	// 单个开放撤单
	async openOrder(id) {
		if (!await this.$confirm({ title: "确定开放撤单吗？"})) return 
		const res = await this.$service.fetch('/config-admin-api/openCancelOrder/reOpenCancelOrder', {
			id
		});
		if (res.code !== 1) return res.message && this.$message.error(res.message);
		this.$message.success(res.message);
		this.getList();
	}

	// 开放撤单
	async openCancelOrder() {
		const form = await this.vform.validate();
		const params = this.$trimValues(form.values);

		if (!this.init.query.lotteryId) return this.$message.error("请先选择彩种");
		if (!params.issueNoString) return this.$message.error("请先输入要开放撤单的期号");

		if (!await this.$confirm({title: "确定要开放撤单?"})) return

		const res = await this.$service.fetch('/config-admin-api/openCancelOrder/openCancelOrder', {...params, lotteryId: this.init.query.lotteryId});
		if (res.code !== 1) return res.message && this.$message.error(res.message);
		this.$message.success(res.message);
		this.getList();
	}

	// 关闭撤单	
	async closeCancelOrder(id) {
		if (!await this.$confirm({title: "确定关闭撤单?"})) return
		const res = await this.$service.fetch("/config-admin-api/openCancelOrder/closeCancelOrder", { id });
		if (res.code !== 1) return res.message && this.$message.error(res.message);
		this.$message.success(res.message);
		this.getList();
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
	
  // 获取彩票列表
  async loadLotteryData(selectedOptions) {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;
    const res = await this.$service.fetch("/config-admin-api/lottery/queryAllLotteryByCategoryId", { id: targetOption.value });
    targetOption.loading = false;
    if (res.code === 1 && res.data instanceof Array) {
      targetOption.children = res.data.map(item => {
        return {
          value: item.id,
          label: item.lotteryName
        }
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
		const res = await this.$service.fetch("/config-admin-api/openCancelOrder/queryPageOpenCancelOrder", Object.assign(form.values, query));
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
.report-form1 /deep/{
	width: 600px;
	.ant-form-item {
    margin-bottom: 6px;
  }
}
</style>
