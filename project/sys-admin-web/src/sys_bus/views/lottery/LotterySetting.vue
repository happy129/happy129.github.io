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
      <div class="panel2" style="padding:5px 0 0 0;">&nbsp;</div>
      <a-table class="mytable" bordered :columns="columns" :rowKey="(_, i) => i" :dataSource="dataSource">
        <template slot="logoUrl" slot-scope="d"><img :src="d || defaultLogoUrl" style="width: 20px; height: 20px;"/></template>
        <template slot="lotteryCycleId" slot-scope="d">{{(lotteryCycleMap[d] || {}).name || d || '无'}}</template>
        <template slot="isEnabled" slot-scope="d">{{dictionary.showStatus.get(d)}}</template>
        <template slot="isBetEnabled" slot-scope="d">{{dictionary.openingStatus.get(d)}}</template>
        <template slot="isHot" slot-scope="d">{{dictionary.booleanType.get(d)}}</template>
        <template slot="isChaseEnabled" slot-scope="d">{{dictionary.booleanType.get(d)}}</template>
        <template slot="todo" slot-scope="d">
          <a-button v-permission="20255" type="primary" size="small" @click="addOrEdit(d)">修改</a-button>
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
  { title: '彩种名称', dataIndex: 'lotteryName', width: '200px', align: 'center', sorter: false },
  { title: '默认玩法', dataIndex: 'defaultPlayName', width: '300px', align: 'center', sorter: false },
  { title: '排序值', dataIndex: 'sortOrder', width: '60px', align: 'center'},
  { title: '开盘状态', dataIndex: 'isBetEnabled', width: '100px', align: 'center', scopedSlots: { customRender: 'isBetEnabled' } },
  { title: '显隐状态', dataIndex: 'isEnabled', width: '100px', align: 'center', scopedSlots: { customRender: 'isEnabled' } },
  { title: '热门', dataIndex: 'isHot', width: '60px', align: 'center', scopedSlots: { customRender: 'isHot' } },
  { title: '追号', dataIndex: 'isChaseEnabled', width: '60px', align: 'center', scopedSlots: { customRender: 'isChaseEnabled' } },
  { title: '操作', scopedSlots: { customRender: 'todo' } }
];

const dictionary = 'showStatus,openingStatus,booleanType';

/** 配置内置初始化数据源 */
const dsstore = {}

@Component({ dictionary, dsstore })
export default class Lottery extends Vue {

  params = { lotteryName: '' }
  
  columns = columns;
  datasource = [];
  defaultLogoUrl = require('./images/lottery.png');

  @Computed dataSource() {
    if (!this.params.lotteryName) return this.datasource;
    return this.datasource.filter(d => d.lotteryName &&  d.lotteryName.indexOf(this.params.lotteryName) != -1);
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
		const id = this.userInfo.platformId;
    const res = await this.$service.fetch('/config-admin-api/platformLottery/queryAllLottery', { id });
    this.$refs.btnQuery.sLoading = false;
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.datasource = res.data || [];
  }


  /**
   * 添加与修改
   * @param {Object} lotteryObj 彩种对象
   */
  async addOrEdit(lotteryObj) {
    const data = this.$tools.cloneDeep(lotteryObj);
    const res = await this.$modal2(require('./LotterySettingForm').default, { data });
    if (!res.closed) return;
    this.params.lotteryName = '';
    this.fetchLotterys();
  }

  @Lifecycle() mounted() {
    this.fetchLotterys();
  }

}
</script>
