<template>
  <div class="back-layer">
    <div class="dialog-box" @click.stop>
      <div class="title">
        <span>编辑首页彩种分类</span>
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
@Component()
export default class EditLotteryClass extends Vue {
  @Prop() id;

  @Prop() plainOptions;

  detail = {};

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
      id: this.id,
      lotteryList: this.lotteryList,
      sortOrder: this.sortOrder
    };
    let res = await this.$service.fetch(
      "/config-admin-api/frontCategory/editFrontCategory",
      p
    );
    if (1 !== res.code) return this.$message.error(res.message);
    if (1 == res.code) {
      this.$message.success(res.message);
      this.$emit("ok");
    }
  }

  @Lifecycle() async created() {

    //detail
    let r = await this.$service.fetch(
      "/config-admin-api/frontCategory/getFrontCategoryDetail",
      { id: this.id }
    );
    if (1 !== r.code) return this.$message.error(r.message);
    this.detail = r.data;
    // 已选彩种
    this.lotteryList = r.data?.lotteryList.reduce((ca, cu) => {
      ca.push(+cu.lotteryid);
      return ca;
    }, []);
    this.categoryName = this.detail.categoryName;
    this.sortOrder = this.detail.sortOrder;
    this.$forceUpdate();
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