<template>
  <div class="back-layer">
    <div class="dialog-box" @click.stop>
      <div class="title">
        <span>添加首页彩种分类</span>
        <span class="close-tag" @click="close">X</span>
      </div>
      <div style="padding:20px;text-align:left;">
        <a-form layout="inline">
          <a-form-item label="分类名称" style="margin-right:20px;">
            <a-input v-model="categoryName"></a-input>
          </a-form-item>
          <a-form-item label="排序">
            <a-input-number v-model="sortOrder"></a-input-number>
          </a-form-item>

          <br>
          <a-form-item label="彩种选择">
            <a-checkbox-group :options="plainOptions" v-model="lotteryList" @change="onChange"/>
          </a-form-item>
        </a-form>
      </div>
      <a-button type="primary" @click="submit">保存</a-button>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import {
  Component,
  Prop,
  State,
  Mutation,
  Lifecycle,
  Action
} from "vue-decorators";
@Component
export default class AddLotteryClass extends Vue {
  @Prop() plainOptions;
  sortOrder = 0;
  categoryName = "";
  lotteryList = [];

  close() {
    this.$emit("close");
  }

  onChange() {}

  async submit() {
    let p = {
      categoryName: this.categoryName,
      id: "",
      lotteryList: this.lotteryList,
      sortOrder: this.sortOrder
    };
    let res = await this.$service.fetch('/config-admin-api/frontCategory/addFrontCategory', p)
    if (1 != res.code) return this.$message.error(res.message);
    if (1 == res.code) {this.$message.success(res.message);this.$emit('ok')}
  }

  @Lifecycle() async created() {
    // let res = await this.$service.fetch('/config-admin-api/lottery/queryAllLottery', {})
    // if (1 !== res.code) return this.$message.error(res.message);
    // this.plainOptions = res.data;
    // this.plainOptions.forEach(d => { d.label = d.lotteryName; d.value = +d.id; })
  }
}
</script>

<style lang="scss" scoped>
@import "@views/admin/Pop.scss";
/deep/ .ant-checkbox-group-item {
  width: 180px;
  margin-bottom: 10px;
}
</style>