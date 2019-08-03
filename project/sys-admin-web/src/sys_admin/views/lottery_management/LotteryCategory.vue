<style lang="scss" scoped>
.wrapper {
  height: 100%; box-sizing: border-box;
  overflow-y: auto; border-radius: 4px; 
  .panel {
    padding: 15px 15px; background: #ffffff; margin-bottom: 20px;
    h1 { font-size: 16px; font-weight: bold; }
    .input { width: 200px; }
    .span1 { display: inline-block; min-width: 80px; margin-right: 20px }
    .panel2 {
      margin: 10px -15px 0;  width: 100%; border-top: 1px solid #ddd;
      padding: 15px 15px 0; 
      > button { margin-right: 15px; }
    }
	
    .tabs {
      margin: 20px 0;
      > button { margin-right: 15px; }
    }
  }
}
</style>



<template>
  <section class="wrapper">
    <a-form layout="inline" class="panel">
      <a-form-item label="彩种分类">
        <a-select class="input" v-model="lotteryCategoryKey">
          <a-select-option v-for="(d, i) in lotteryCategoryArrays" :value="i" :key="i">{{d.categoryName}}</a-select-option>
        </a-select>
      </a-form-item>
      <div class="panel2">
        <a-button type="primary" @click.native="addOrEdit(false)" v-permission="10020">添加分类</a-button>
        <a-button type="primary" :disabled="!lotteryCategory" @click.native="addOrEdit(true)" v-permission="10021">修改分类</a-button>
      </div>
    </a-form>

    <div class="panel" v-if="lotteryCategory">
      <a-form layout="inline">
        <h1>类型设置</h1>
        <a-form-item label="类型名称"><span class="span1">{{lotteryCategory && lotteryCategory.categoryName}}</span></a-form-item>
        <a-form-item label="盘别">
          <span class="span1">{{dictionary.plateType.get(lotteryCategory.plateType)}}</span>
        </a-form-item>
        <!-- 是否初始化 -->
        <a-form-item v-if="0 == lotteryCategory.isSync" v-permission="10022">
          <a-button ref="btnInit" type="primary" @click.native="toInitLotteryASyncApi()" :disabled="!lotteryCategory">初始化</a-button>
        </a-form-item>
      </a-form>
      <div class="panel2">
        <h1>玩法列表</h1>
        <div class="tabs">
          <a-button v-for="(d, i) in tabs" :key="i" :type="tabkey == i ? 'primary' : 'default'" @click.native="() => tabkey = i">{{d}}</a-button>
        </div>
        <LotteryCategoryTreePanel ref="lotteryCategoryTreePanel" :lotteryCategoryId="lotteryCategory.id" v-if="0 == tabkey"/>
        <LotteryCategoryListPanel :lotteryCategoryId="lotteryCategory.id" v-else-if="1 == tabkey"/>
      </div>
    </div>
  </section>
</template>
<script>
import Vue from 'vue'
import { Component, InjectComponents, Prop, Watch, Lifecycle, Computed, Filter, State, Action, Getter, Mutation, InjectComponent } from 'vue-decorators';

import LotteryCategoryForm from './LotteryCategoryForm';
import LotteryCategoryTreePanel from './LotteryCategoryTreePanel';
import LotteryCategoryListPanel from './LotteryCategoryListPanel';

/** 数据字典 */
const dictionary = 'plateType';

@Component({ dictionary })
@InjectComponents({ LotteryCategoryListPanel, LotteryCategoryTreePanel })
export default class LotteryCategory extends Vue {
  
  /** 彩种分类 */
  lotteryCategoryArrays = [];

  /** 选中的彩种序号 */
  lotteryCategoryKey = null;
  
  tabs = ['玩法结构', '玩法列表'];
  tabkey = 0;

  /** 当前选中的彩种类型 */
  @Computed() lotteryCategory() {
    return this.lotteryCategoryArrays[this.lotteryCategoryKey];
  }

  /**
   * 抓取所有彩种分类集合信息
   */
  async fetchLotteryCategorys() {
    // 请求参数，不用管api上的header
    const res = await this.$service.fetch('/config-admin-api/category/queryAllCategory', {});
    if (1 != res.code) return res.message && this.$message.error(res.message);
    // 业务处理
    this.lotteryCategoryArrays = res.data || [];
    this.lotteryCategoryKey = this.lotteryCategoryArrays.length > 0 ? 0 : null;
  }

  /** 
   * 添加或修改
   * @param {Boolean} isEdit=false 是否修改表单
   */
  async addOrEdit(isEdit = false) {
    const res = await this.$modal2(LotteryCategoryForm, isEdit ? this.lotteryCategory : {});
    if (!res.closed) return;
    this.fetchLotteryCategorys();
  }

  /** 彩种初始化 */
  async toInitLotteryASyncApi() {
    const {id} = this.lotteryCategory;
    if (! await this.$confirm({ content: '请确保已设置好相关配置，初始化后将同步更新至所有商户后台', title: '提示'})) return;
    this.$refs.btnInit.sLoading = true;
    const res = await this.$service.fetch('/config-admin-api/category/init', { id });
    this.$refs.btnInit.sLoading = false;
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    // 手动更新状态
    this.lotteryCategory.isSync = 1;
    // 刷新树的状态
    this.$refs.lotteryCategoryTreePanel?.toFetchQueryTreeByCategoryId();
  }

  @Lifecycle() async created() {
    this.fetchLotteryCategorys();
  }
}
</script>

