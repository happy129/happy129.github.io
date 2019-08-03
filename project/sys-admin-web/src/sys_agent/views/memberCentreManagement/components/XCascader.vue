<template>
	<div>
		<a-cascader :options="lotteryCategory" @change="changeLottery" :loadData="loadLotteryData" placeholder="选择彩种类型"/>
	</div>
</template>
<script>
import Vue from 'vue'
import { Component, Lifecycle } from 'vue-decorators'
@Component({ formOptions: "id" })
export default class XCascader extends Vue {
	lotteryCategory= [];
	query={ pageNo: 1, pageSize: 10, lotteryId: ""};
	// 选择彩票列表
  changeLottery(value) {
    this.query.lotteryId = value[1] ? value[1] : "";
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
      this.lotteryCategory = [...this.lotteryCategory];
    }
	}
	/** 获取彩种 */
	async getAllLotteryList() {
    const res = await this.$service.fetch("/config-admin-api/category/queryAllCategory");
    const result = [];
    if (res.code === 1 && res.data instanceof Array) {
       res.data.forEach(item => {
        result.push({ value: item.id, label: item.categoryName, isLeaf: false });
      });
    }
    this.lotteryCategory = result;
	}
	@Lifecycle created() {
		// this.getAllLotteryList();
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