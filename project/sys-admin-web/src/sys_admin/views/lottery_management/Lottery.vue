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

    .tabs {
      margin: 20px 0;
      > button { margin-right: 15px; }
    }
  }
}
</style>

<template>
  <div class="wrapper">
    <div class="panel">
      <a-form layout="inline" style="padding:20px 0 0;">
        <a-form-item label="彩种名称">
          <a-input v-model="params.lotteryName"/>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" ref="btnQuery" @click.native="fetchLotterys()">查询</a-button>
        </a-form-item>
      </a-form>
      <div class="panel2" style="padding:15px 0 10px 15px;">
        <!-- <a-button type="primary" @click.native="addOrEdit()">添加</a-button> -->
        <a-button type="primary" @click="addOrEdit()" v-permission="10039">添加彩种</a-button>
      </div>
      <!-- <div style="padding:20px 0 10px;">
        <a-button type="primary" @click="addOrEdit()">添加彩种</a-button>
      </div> -->
      <a-table class="mytable" bordered :columns="columns" :rowKey="(_, i) => i" :dataSource="dataSource">
        <template slot="logoUrl" slot-scope="d"><img :src="d || defaultLogoUrl" style="width: 20px; height: 20px;"/></template>
        <template slot="categoryId" slot-scope="d">{{(lotteryCategoryMap[d] || {}).categoryName}}</template>
        <template slot="parentId" slot-scope="d">{{(lotteryDeriveMap[d] || {}).lotteryName || d || '无'}}</template>
        <template slot="collectingSourceIds" slot-scope="d">{{formatCollectingSource(d)}}</template>
        <template slot="lotteryCycleId" slot-scope="d">{{(lotteryCycleMap[d] || {}).name || d || '无'}}</template>
        <template slot="isEnabled" slot-scope="d">{{dictionary.showStatus.get(d)}}</template>
        <template slot="isBetEnabled" slot-scope="d">{{dictionary.openingStatus.get(d)}}</template>
        <template slot="todo" slot-scope="d">
          <a-button type="primary" size="small" @click="addOrEdit(d)" v-permission="10040">编辑</a-button>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents, Prop, Watch, Lifecycle, Computed, Filter, State, Action, Getter, Mutation, InjectComponent } from 'vue-decorators';

const columns = [
  { title: '图标', dataIndex: 'logoUrl', width: '60px', align: 'center', scopedSlots: { customRender: 'logoUrl' } },
  { title: '彩种ID', dataIndex: 'id', width: '100px', align: 'center', sorter: false },
  { title: '彩种名称', dataIndex: 'lotteryName', width: '160px', align: 'center', sorter: false },
  { title: '彩种分类', dataIndex: 'categoryId', width: '160px', align: 'center', scopedSlots: { customRender: 'categoryId' } },
  { title: '衍生彩种', dataIndex: 'parentId', width: '160px', align: 'center', scopedSlots: { customRender: 'parentId' } },
  { title: '开奖来源', dataIndex: 'collectingSourceIds', width: '140px', align: 'center', scopedSlots: { customRender: 'collectingSourceIds' } },
  { title: '时间盘口类型', dataIndex: 'lotteryCycleId', width: '120px', align: 'center', scopedSlots: { customRender: 'lotteryCycleId' } },
  { title: '显隐状态', dataIndex: 'isEnabled', width: '100px', align: 'center', scopedSlots: { customRender: 'isEnabled' } },
  { title: '开盘状态', dataIndex: 'isBetEnabled', width: '100px', align: 'center', scopedSlots: { customRender: 'isBetEnabled' } },
  { title: '操作', scopedSlots: { customRender: 'todo' } }
];

const dictionary = 'plateType,showStatus,openingStatus';

/** 配置内置初始化数据源 */
const dsstore = {
  // [key: String]: 'url'
  // [key: String]: { url: String, value: [], params: {} }
  // key 变量名称，使用this.dsstore.变量名称获取值
  // value: 初始化值，默认空数组
  // params: 内置查询条件
  // 用于内置外部接口数据字典
  /** 所有彩种类型 */
  lotteryCategorys: { url: '/config-admin-api/category/queryAllCategory' },  
  /** 开奖来源 */
  collectingSources: { url: '/config-admin-api/collectingSource/queryAllCollectingSource' },
  /** 时间盘口类型 */ 
  lotteryCycles: { url: '/config-admin-api/lotteryCycle/queryAllLotteryCycle' } 
}

@Component({ dictionary, dsstore })
export default class Lottery extends Vue {

  params = { lotteryName: '' }
  
  columns = columns;
  datasource = [];
  defaultLogoUrl = require('./images/lottery.png');
  // /** 所有彩种类型 */
  // lotteryCategorys = [];
  // /** 开奖来源 */
  // collectingSources = [];
  // /** 时间盘口类型 */
  // lotteryCycles = [];

  /** 所有彩种类型映射 */
  @Computed() lotteryCategoryMap() {
    return this.dsstore.lotteryCategorys.reduce((m, d) => (m[d.id] = d, m), {});
  }
  /** 所有彩种类型映射 */
  @Computed() lotteryDeriveMap() {
    return this.datasource.reduce((m, d) => (m[d.id] = d, m), {});
  }
  /** 所有开奖来源映射 */
  @Computed() collectingSourceMap() {
    return this.dsstore.collectingSources.reduce((m, d) => (m[d.id] = d, m), {});
  }
  /** 所有时间盘口类型 */
  @Computed() lotteryCycleMap() {
    return this.dsstore.lotteryCycles.reduce((m, d) => (m[d.id] = d, m), {});
  }

  @Computed dataSource() {
    if (!this.params.lotteryName) return this.datasource;
    return this.datasource.filter(d => d.lotteryName && d.lotteryName.indexOf(this.params.lotteryName) != -1);
  }


  /**
   * 格式化彩种来源
   * @param {String} collectingSource 彩种来源数组
   */
  formatCollectingSource(collectingSource) {
    if (!collectingSource) return collectingSource;
    return `${collectingSource}`.split(',').reduce((m, d) => {
      if (!this.collectingSourceMap[d]) return m;
      m.push(this.collectingSourceMap[d].sourceName);
      return m;
    }, []).join('、') || '无'
  }

  /** 查询所有彩种 */
  async fetchLotterys() {
    this.$refs.btnQuery.sLoading = true;
    const res = await this.$service.fetch('/config-admin-api/lottery/queryAllLottery', {});
    this.$refs.btnQuery.sLoading = false;
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.datasource = res.data || [];
  }
  // /** 查询所有彩种种类 */
  // async fetchLotteryCategorys() {
  //   const res = await this.$service.fetch('/config-admin-api/category/queryAllCategory', {});
  //   if (1 != res.code) return res.message && this.$message.error(res.message);
  //   this.lotteryCategorys = res.data || [];
  // }
  // /** 查询所有彩种类型 */
  // async fetchCollectingSources() {
  //   const res = await this.$service.fetch('/config-admin-api/collectingSource/queryAllCollectingSource', {});
  //   if (1 != res.code) return res.message && this.$message.error(res.message);
  //   this.collectingSources = res.data || [];
  // }
  // /** 查询所有彩种时间盘口类型 */
  // async fetchLotteryCycle() {
  //   const res = await this.$service.fetch('/config-admin-api/lotteryCycle/queryAllLotteryCycle', {});
  //   if (1 != res.code) return res.message && this.$message.error(res.message);
  //   this.lotteryCycles = res.data || [];
  // }

  /**
   * 添加与修改
   * @param {Object} lotteryObj 彩种对象
   */
  async addOrEdit(lotteryObj) {
    // 所有彩种字典
    const lotterys = this.datasource.map(({id, lotteryName: name}) => ({name, id}));
    // 所有彩种分类字典
    const categorys = this.dsstore.lotteryCategorys.map(({id, categoryName: name}) => ({name, id}));
    // 所有开奖来源字典
    const collectingSources = this.dsstore.collectingSources.map(({id, sourceName: name}) => ({name, id}));
    /** 时间盘口类型 */
    const cycles = this.dsstore.lotteryCycles;

    const res = await this.$modal2(require('./LotteryForm').default, {data: {...lotteryObj}, lotterys, categorys, collectingSources, cycles});

    if (!res.closed) return;
    this.params.lotteryName = '';
    this.fetchLotterys();
  }

  @Lifecycle() mounted() {
    this.fetchLotterys();
    // this.fetchLotteryCategorys();
    // this.fetchCollectingSources();
    // this.fetchLotteryCycle();
  }

}
</script>
