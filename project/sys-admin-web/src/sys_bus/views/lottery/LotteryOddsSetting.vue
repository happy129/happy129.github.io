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
    padding-top:4px;
    display:inline-block;

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
        <a-form-item label="彩种">
          <a-select style="width: 200px;" placeholder="请选择" v-decorator="[ 'lotteryId']">
            <a-select-option v-for="(d, i) in dsstore.lotterys" :value="`${d.lotteryId}`" :key="i">{{d.lotteryName}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="玩法">
          <a-select style="width: 320px;" placeholder="请选择" v-decorator="[ 'playId', { initialValue: params.defaultPlayId }]">
            <a-select-option v-for="(d, i) in dsstore.lotteryPlays" :value="`${d.playId}`" :key="i">{{d.playName}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="降低赔率(%)">
          <a-input-number style="width: 100%" v-decorator="[ 'pumpingRate' ]" :min="0.1" :max="100"/>
        </a-form-item>
        <a-form-item v-permission="20257">
          <a-button type="primary" ref="btnUpdateAllPlayRate" :disabled="datasource.length == 0" @click.native="toUpdateAllPlayRate()">修改全部玩法</a-button>
        </a-form-item>
        <div class="panel2" style="padding:15px 0 10px 15px;">
          <a-form-item label="赔率">
            <a-input-number style="width: 100%" v-decorator="[ 'odds' ]" :min="0"/>
          </a-form-item>
          <span class="btns1">
              <a-button v-permission="20258" type="primary" ref="btnUpdateOdss" :disabled="grid.selectedRows.length == 0" @click.native="toUpdateSelectedOdds()">修改选中<span v-if="!!grid.selectedRows.length"> {{grid.selectedRows.length}}</span></a-button>
              <a-button v-permission="20259" type="primary" ref="btnSyncOtherLotteryOdds" @click.native="toSyncOtherLotteryOdds()">同步到其他同类彩种1</a-button>
              <a-button v-permission="20260" type="primary" ref="btnSubmit" @click.native="toSubmit()">提交</a-button>
          </span>
        </div>
      </a-form>
      <a-table :key="grid.key" class="mytable" bordered :rowSelection="rowSelection" :columns="columns" :dataSource="dataSource">
        <template slot="platformPumpingRate" slot-scope="d">
          <a-input-number style="width: 100%" v-model="d.platformPumpingRate" :max="100" @change="toCalcRateOrOdds('rate', d)"/>
        </template>
        <template slot="odds" slot-scope="d">
          <a-input-number style="width: 100%" v-model="d.odds" :min="0"  @change="toCalcRateOrOdds('odds', d)"/>
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
  { title: '奖项', dataIndex: 'awardItem', width: '200px', align: 'center', sorter: false },
//   { title: '理论赔率', dataIndex: 'theoryOdds', width: '100px', align: 'center'},
  { title: '最高赔率', dataIndex: 'theoryOdds', width: '100px', align: 'center'},
  { title: '降低赔率(%)', width: '160px', align: 'center', scopedSlots: { customRender: 'platformPumpingRate' } },
//   { title: '平台抽水比率(%)', width: '160px', align: 'center', scopedSlots: { customRender: 'platformPumpingRate' } },
  { title: '赔率', width: '160px', align: 'center', scopedSlots: { customRender: 'odds' } },
//   { title: '最大赔率', dataIndex: 'maxOdds', width: '100px', align: 'center' },
  { title: '当前赔率', dataIndex: 'maxOdds', width: '100px', align: 'center' }
];

const dictionary = '';
const formOptions = "id";

/** 配置内置初始化数据源 */
const dsstore = {
  /** 所有彩种 */
  lotterys: { url: '/config-admin-api/platformLottery/queryAllLottery', params: {id: ''}, autoload: false },
  /** 所有彩种类型 */
  // lotteryCategorys: { url: '/config-admin-api/category/queryAllCategory' },
  /** 彩种类型玩法 */
  lotteryPlays: { url: '/config-admin-api/platformPlayConfig/queryAllPlayConfig', params: { categoryId: '', lotteryId: '', platformId: '' }, autoload: false }
}

@Component({ dictionary, dsstore, formOptions })
export default class LotteryOddsSetting extends Vue {

  params = { lotteryId: '', categoryId: '', playId:'' }
  
  columns = columns;
  datasource = [];

  grid = { selectedRows: [] };

  @Computed() rowSelection() {
    return { onChange: (selectedRowKeys, selectedRows) => this.grid.selectedRows = selectedRows }
  }

  @Computed dataSource() {
    if (!this.params.lotteryName) return this.datasource;
    return this.datasource.filter(d => d.lotteryName.indexOf(this.params.lotteryName) != -1);
  }

  @WatchExtra('dsstore.lotterys', { immediate: true })
  onWatchLotterys(lotterys) {
    // 清空
    this.vform.setValues({categoryId: '', playId: ''}, true);
    if (!lotterys || !lotterys.length) return;

    // 设置查询条件
    const { lotteryId, categoryId, defaultPlayId: playId } = lotterys[0];
    this.vform.setValues({lotteryId, categoryId, playId}, true);
  }

  @WatchExtra('params.lotteryId', { immediate: true })
  async onWatchLotteryId(lotteryId) {
    const lottery = this.dsstore.lotterys.find(d => d.lotteryId == lotteryId);
    if (!lottery) return;
    const { categoryId, defaultPlayId: playId } = lottery;
    this.vform.setValues({lotteryId, categoryId, playId}, true);
    // 查询玩法
    const { platformId } = this.userInfo;
    this.dsstore.lotteryPlays.splice(0);
    this.dsstore.lotteryPlays.fetch({categoryId, lotteryId, platformId});
  }

  @WatchExtra(function(){ 
    return `${this.params.lotteryId}_${this.params.playId}`; 
  }, { immediate: true })
  onWatchPlayId(playId) {
    this.datasource.splice(0);
    if (this.params.playId) this.fetchLotteryBetItems();
  }
  
  /**
   * 计算利率与赔率
   * @param {String} type 计算类型
   * @param {Object} recordObj 记录对象
   */
  toCalcRateOrOdds(type, recordObj) {
    let { theoryOdds = 0, platformPumpingRate = 0, odds = 0 } = recordObj;
    if ('rate' == type) {
      platformPumpingRate = this.$tools.toFixed(+platformPumpingRate || 0, 1, false);
      recordObj.platformPumpingRate = platformPumpingRate;

      odds = theoryOdds * ((100 - platformPumpingRate) / 100);
      recordObj.odds = this.$tools.toFixed(odds, 3, false);
      return;
    }

    if ('odds' == type) {
      odds = this.$tools.toFixed(+odds || 0, 3, false);
      recordObj.odds = odds;
      platformPumpingRate = ((theoryOdds - odds) / theoryOdds) * 100;
      recordObj.platformPumpingRate = this.$tools.toFixed(platformPumpingRate, 1, false);
      return;
    }
  }

  /** 查询所有彩种 */
  async fetchLotteryBetItems() {
    this.grid.selectedRows.splice(0);
    const id = this.userInfo.platformId;
    const {playId, lotteryId} = this.params;
    const res = await this.$service.fetch('/config-admin-api/oddsConfig/queryOddsConfigByPlayId', { id, lotteryId, playId });
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.datasource = (res.data || []).map((d, i) => {
      d.key = `${Date.now().toString(16)}${i}`;
      d.platformPumpingRate = this.$tools.toFixed(+d.platformPumpingRate * 100, 2, false);
      const odds = +d.theoryOdds * (100 - d.platformPumpingRate) / 100;
      d.odds = this.$tools.toFixed(odds, 3, false);
      return d;
    });
  }

  /** 修改全部玩法降低赔率 */
  async toUpdateAllPlayRate() {
    const { platformId } = this.userInfo;
    let { categoryId, lotteryId, playId, pumpingRate } = this.params;
    pumpingRate = this.$tools.toFixed(pumpingRate / 100, 3, false);
    this.vform.setValues({pumpingRate: pumpingRate * 100});
    this.$refs.btnUpdateAllPlayRate.sLoading = true;
    const res = await this.$service.fetch('/config-admin-api/oddsConfig/editAllPlay', {categoryId, lotteryId, playId, pumpingRate, platformId});
    this.$refs.btnUpdateAllPlayRate.sLoading = false;
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.fetchLotteryBetItems();
  }

  /** 修改已选中的赔率 */
  toUpdateSelectedOdds() {
    this.grid.selectedRows.forEach(recordObj => {
      let { theoryOdds } = recordObj;
      const odds = recordObj.odds = this.$tools.toFixed(+this.params.odds || 0, 3, false);
      this.vform.setValues({odds});
      const platformPumpingRate = ((theoryOdds - odds) / theoryOdds) * 100;
      recordObj.platformPumpingRate = this.$tools.toFixed(platformPumpingRate, 1, false);
    });
  }

  /** 同步到其他同类彩种 */
  async toSyncOtherLotteryOdds() {
    if (!await this.$confirm({title: '同步号码赔率', content: '确定同步到其它同类彩种？' })) return;
    const { platformId } = this.userInfo;
    const { categoryId, lotteryId, playId } = this.params;
    this.$refs.btnSyncOtherLotteryOdds.sLoading = true;
    const res = await this.$service.fetch('/config-admin-api/oddsConfig/syncToOtherLottery', {categoryId, lotteryId, playId, platformId});
    this.$refs.btnSyncOtherLotteryOdds.sLoading = false;
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.fetchLotteryBetItems();
  }

  /** 保存本页提交 */
  async toSubmit() {
    const { platformId } = this.userInfo;
    const { categoryId, lotteryId, playId } = this.params;
    const oddsList = this.datasource.map(({id, awardItem, odds, platformPumpingRate, theoryOdds}) => {
      platformPumpingRate = this.$tools.toFixed(platformPumpingRate / 100, 3, false);
      const maxOdds = this.$tools.toFixed(odds, 3, false);
      return {id, awardItem, maxOdds, platformPumpingRate, theoryOdds};
    });
    this.$refs.btnSyncOtherLotteryOdds.sLoading = true;
    const res = await this.$service.fetch('/config-admin-api/oddsConfig/batchEditOddsConfigByPlatformId', {categoryId, lotteryId, playId, platformId, list: oddsList});
    this.$refs.btnSyncOtherLotteryOdds.sLoading = false;
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.fetchLotteryBetItems();
  }

  @Lifecycle() created() {
    this.vform.vbind('params');
    this.dsstore.lotterys.fetch({id: this.userInfo.platformId});
    // this.fetchLotterys();
  }

}
</script>
