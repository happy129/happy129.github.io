<style lang="scss" scoped>
.wrapper {
  height: 100%; box-sizing: border-box;
  overflow-y: auto; border-radius: 4px; 
  .panel {
    padding: 0 15px 15px; background: #ffffff; margin-bottom: 20px;
    h1 { font-size: 16px; font-weight: bold; }
    .input { width: 200px; }
    .span1 { display: inline-block; min-width: 80px; margin-right: 20px }
    .panel2 {
      margin: 10px -15px 0;  width: 100%; border-top: 1px solid #ddd;
      padding: 15px 15px 0; 
      > button { margin-right: 15px; }
    }

  }
  .btns1 {
    button { margin-right: 15px; }
  }
  .mytable /deep/ tr:hover > td {
    background-color: transparent!important;
  }
}
</style>

<template>
  <div class="wrapper">
    <div class="panel">
      <a-form :form="vform" layout="inline" style="padding:20px 0 0;">
        <a-form-item label="选择彩种分类：">
          <a-select style="width: 200px;" placeholder="请选择" v-decorator="[ 'categoryId']">
            <a-select-option v-for="(d, i) in dsstore.categorys" :value="`${d.id}`" :key="i">{{d.categoryName}}</a-select-option>
          </a-select>
        </a-form-item>
        <div class="panel2" style="padding:15px 0 10px 15px;">
          <a-input-group compact>
            <a-form-item>
              <a-select style="width: 100px;" v-decorator="['type']">
                <a-select-option value="">请选择</a-select-option>
                <a-select-option value="maxUnitPrice">注单单注</a-select-option>
                <a-select-option value="singleUserMaxBetAmount">用户当期</a-select-option>
                <a-select-option value="allUserMaxBetAmount">玩法当期</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item>
              <a-input-number style="width: 160px" v-decorator="['value']"/>
            </a-form-item>
            <div class="btns1" style="margin-left: 15px;">
              <template>
                <a-button v-permission="20263" type="primary" ref="btnUpdateOdss" :disabled="!params.type || grid.selectedRows.length == 0" @click.native="toUpdateSelected()">修改选中<span v-if="!!grid.selectedRows.length"> {{grid.selectedRows.length}}</span></a-button>
              </template>
              <a-button v-permission="20265" type="primary" ref="btnSubmit" @click.native="toSubmit()">提交</a-button>
            </div>
          </a-input-group>
        </div>
      </a-form>
      <a-table class="mytable" bordered :rowSelection="rowSelection" :columns="columns" :dataSource="dataSource">
        <template slot="maxUnitPrice" slot-scope="d">
          <a-input-number style="width: 100%" v-model="d.maxUnitPrice" :min="0"/>
        </template>
        <template slot="singleUserMaxBetAmount" slot-scope="d">
          <a-input-number style="width: 100%" :min="0" v-model="d.singleUserMaxBetAmount"/>
        </template>
        <template slot="allUserMaxBetAmount" slot-scope="d">
          <a-input-number style="width: 100%" :min="0" v-model="d.allUserMaxBetAmount"/>
        </template>
        <template slot="isEnabled" slot-scope="d">
          <!-- 启用停用 -->
          <a-switch v-permission="20266" :checkedChildren="dictionary.enabledStatus.get(1)" :unCheckedChildren="dictionary.enabledStatus.get(0)" v-model="d.isEnabled"/>
        </template>
        <template slot="isValidBetEnabled" slot-scope="d">
           <!-- 计算有效投注 -->
          <a-switch v-permission="20267" :checkedChildren="dictionary.validBetEnabled.get(1)" :unCheckedChildren="dictionary.validBetEnabled.get(0)" v-model="d.isValidBetEnabled"/>
        </template>
        <template slot="isRebateEnabled" slot-scope="d">
          <!-- 给予返水 -->
          <a-switch v-permission="20268" :checkedChildren="dictionary.rebateEnabled.get(1)" :unCheckedChildren="dictionary.rebateEnabled.get(0)" v-model="d.isRebateEnabled"/>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents, Prop, WatchExtra, Lifecycle, Computed, Filter, State, Action, Getter, Mutation, InjectComponent } from '@/util/decorators';

const columns = [
  { title: '玩法名称', dataIndex: 'playName', width: '200px', align: 'center', sorter: false },
  { title: '注单单注最大金额', dataIndex2: 'maxUnitPrice', width: '160px', align: 'center', scopedSlots: { customRender: 'maxUnitPrice' } },
  { title: '用户当前期最大下注', dataIndex2: 'singleUserMaxBetAmount', width: '160px', align: 'center', scopedSlots: { customRender: 'singleUserMaxBetAmount' }},
  { title: '玩法当期最大下注', dataIndex2: 'allUserMaxBetAmount', width: '160px', align: 'center', scopedSlots: { customRender: 'allUserMaxBetAmount' }},
  { title: '启用/停用', dataIndex2: 'isEnabled', width: '100px', align: 'center', scopedSlots: { customRender: 'isEnabled' } },
  { title: '计算有效投注', dataIndex2: 'isValidBetEnabled', width: '140px', align: 'center', scopedSlots: { customRender: 'isValidBetEnabled' } },
  { title: '给予返水', dataIndex2: 'isRebateEnabled', width: '100px', align: 'center', scopedSlots: { customRender: 'isRebateEnabled' } }
];

const dictionary = 'enabledStatus,validBetEnabled,rebateEnabled,booleanType';
const formOptions = "id";

/** 配置内置初始化数据源 */
const dsstore = {
  /** 所有彩种类型 */
  categorys: { url: '/config-admin-api/category/queryAllCategory' }
}

@Component({ dictionary, dsstore, formOptions })
export default class LotteryBetLimit extends Vue {

  params = { categoryId: '', type:'' }
  
  columns = columns;
  datasource = [];

  grid = { 
    selectedRows: [], 
  };

  @Computed() rowSelection() {
    return { 
      onChange: (selectedRowKeys, selectedRows) => this.grid.selectedRows = selectedRows
    };
  }

  @Computed dataSource() {
    if (!this.params.lotteryName) return this.datasource;
    return this.datasource.filter(d => d.lotteryName.indexOf(this.params.lotteryName) != -1);
  }

  @WatchExtra('dsstore.categorys', { immediate: true })
  onWatchCategorys(categorys) {
    // 清空
    this.vform.setValues({categoryId: '', playId: ''}, true);
    if (!categorys || !categorys.length) return;

    // 设置查询条件
    const { id: categoryId } = categorys[0];
    this.vform.setValues({categoryId}, true);
  }

  @WatchExtra('params.categoryId', { immediate: true })
  onWatchCategoryId(categoryId) {
    if (!categoryId) return;
    this.fetchArrays();
  }


  /** 查询所有彩种 */
  async fetchArrays() {
    this.grid.selectedRows.splice(0);
    const {categoryId} = this.params;
    const res = await this.$service.fetch('/config-admin-api/platformPlayConfig/queryAllPlayConfig', { categoryId });
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.datasource = (res.data || []).map((d, i) => {
      d.key = `${Date.now().toString(16)}${i}`;
      d.isEnabled = 1 == d.isEnabled;
      d.isValidBetEnabled = 1 == d.isValidBetEnabled;
      d.isRebateEnabled = 1 == d.isRebateEnabled;
      return d;
    });
  }

  /** 修改已选中的 */
  async toUpdateSelected() {
    let { type, value } = this.params;
    if (!type) return;
    if (!await this.$confirm({content: '确定批量更新？'})) return;
    value = this.$tools.toFixed(+value || 0, 3, false);
    this.grid.selectedRows.forEach(recordObj => {
      let { theoryOdds } = recordObj;
      recordObj[type] = value;
    });
  }

  /** 保存本页提交 */
  async toSubmit() {
    const { categoryId } = this.params;
    const platformPlayList = this.datasource.map(({allUserMaxBetAmount,id,isEnabled,isRebateEnabled,isValidBetEnabled,maxUnitPrice,playId,singleUserMaxBetAmount}) => {
      isEnabled = isEnabled ? 1 : 0;
      isRebateEnabled = isRebateEnabled ? 1 : 0;
      isValidBetEnabled = isValidBetEnabled ? 1 : 0;
      allUserMaxBetAmount = this.$tools.toFixed(+allUserMaxBetAmount || 0, 3, false);
      maxUnitPrice = this.$tools.toFixed(+maxUnitPrice || 0, 3, false);
      singleUserMaxBetAmount = this.$tools.toFixed(+singleUserMaxBetAmount || 0, 3, false);
      return {allUserMaxBetAmount,id,isEnabled,isRebateEnabled,isValidBetEnabled,maxUnitPrice,playId,singleUserMaxBetAmount};
    });
    this.$refs.btnSubmit.sLoading = true;
    const res = await this.$service.fetch('/config-admin-api/platformPlayConfig/batchEditPlayConfig', {categoryId, list: platformPlayList});
    this.$refs.btnSubmit.sLoading = false;
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.fetchArrays();
  }

  @Lifecycle() created() {
    this.vform.vbind('params');
  }

}
</script>
