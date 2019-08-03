<style lang="scss">
.wrapper {
    height: 100%; box-sizing: border-box;
    overflow-y: auto; border-radius: 4px; 
  .panel {
    padding: 15px 15px; background: #ffffff; margin-bottom: 20px;
    h1 { font-size: 16px; font-weight: bold; }
    .panel2 {
      margin: 10px -15px 0;  width: 100%; border-top: 1px solid #ddd;
      padding: 15px 15px 0; 
      > button { margin-right: 15px; }
    }

  }
}
</style>


<template>
  <div class="wrapper">
    <a-form :form="vform" layout="inline" class="panel">
      <a-form-item label="彩种分类">
        <a-select style="width: 160px;" placeholder="请选择" v-decorator="[ 'categoryId' ]">
          <a-select-option v-for="(d, i) in dsstore.lotteryCategorys" :value="`${d.id}`" :key="i">{{d.categoryName}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="彩种玩法">
        <a-select style="width: 340px;" placeholder="请选择" v-decorator="[ 'playId' , {  rules: [{ required: true, message: '请选择彩种玩法' }] }]" >
          <a-select-option v-for="(d, i) in dsstore.lotteryCategoryPlays" :value="`${d.id}`" :key="i">{{d.playName}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item style="margin-left: 20px;">
        <a-button type="primary" ref="btnQuery" @click.native="fetchOdds(true)">查询</a-button>
      </a-form-item>
      <div class="panel2">
        <a-button type="primary" :disabled="!vformdata.playId" @click.native="addOrEdit(vformdata)">添加奖项</a-button>
        <a-button type="primary" ref="btnSavePage" :disabled="!newDataArray.length" @click.native="savePage()" v-permission="10027">保存本页</a-button>
      </div>
      <a-table style="margin-top: 10px" class="mytable" bordered :columns="columns" :rowKey="(_, i) => i" :dataSource="datasource" :pagination="pagination" @change="changePagination">
        <template slot="playId" slot-scope="d">
          <span>{{(lotteryCategoryPlayMap[d] || {}).playName || '无'}}</span>
        </template>
        <template slot="todo" slot-scope="d">
          <template v-if="d.relationAwardItem">
            <span>已关联【{{ d.relationAwardItem }}】</span><a-button type="primary" size="small" @click="toRelationOdds(false, d)">取消关联</a-button>
          </template>
          <template v-else>
            <a-button type="primary" size="small"  @click="toRelationOdds(true, d)">关联</a-button>
          </template>
        </template>
      </a-table>
    </a-form>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents, Prop, WatchExtra, Lifecycle, Computed, Filter, State, Action, Getter, Mutation, InjectComponent } from '@/util/decorators';

const dictionary = 'sex';
const formOptions = 'id';
const dsstore = {
  /** 所有彩种类型 */
  lotteryCategorys: { url: '/config-admin-api/category/queryAllCategory' },
  /** 彩种类型第三级玩法 */
  lotteryCategoryPlays: { url: '/config-admin-api/play/queryIdNameList', params: { id: '' }, autoload: false }
}

//, scopedSlots: { customRender: 'todo' }
const columns = [
  { title: '玩法', dataIndex: 'playId', width: '120px', align: 'center', scopedSlots: { customRender: 'playId' } },
  { title: '奖项', dataIndex: 'awardItem', width: '160px', align: 'center' },
  { title: '最高赔率', dataIndex: 'theoryOdds', width: '200px', align: 'center' },
  { title: '操作', width: '200px', align: 'center', scopedSlots: { customRender: 'todo' } },
];

@Component({ dictionary, dsstore, formOptions })
@InjectComponents({ })
export default class PlayOdds extends Vue {

  vformdata = { categoryId: '', playId: '' }

  /** 列表定义 */
  columns = columns;
  /** 数据源 */
  datasource = [];
  /** 初始化页码*/
  pagination = {
    pageNo: 1,
    current: 1,
  };

  changeModeType() {
    this.pagination.pageNo = 1;
    this.pagination.current = 1;
  }

  changePagination(pagination) {
    this.pagination.current = pagination.current;
    this.pagination.pageNo = pagination.current;
  }

  @Computed() lotteryCategoryPlayMap() {
    return this.dsstore.lotteryCategoryPlays.reduce((m, d) => (m[d.id] = d, m), {});
  }

  @Computed() newDataArray() {
    return this.datasource.filter(d => !d.id);
  }

  @Computed() datasourceMap() {
    return this.datasource.reduce((m, d) => {
      if (!d.id) return m;
      return m[d.id] = d, m;
    }, {});
  }
  
  @WatchExtra('dsstore.lotteryCategorys', { immediate: true })
  onWatchLotteryCategorys(lotteryCategorys){
    if (!lotteryCategorys || lotteryCategorys.length == 0) return;
    this.vform.setValue('categoryId', `${lotteryCategorys[0].id}`, true);
  }

  @WatchExtra('dsstore.lotteryCategoryPlays', { immediate: true })
  onWatchLotteryCategoryPlays(lotteryCategoryPlays){
    if (!lotteryCategoryPlays || lotteryCategoryPlays.length == 0) return;
    this.vform.setValue('playId', `${lotteryCategoryPlays[0].id}`, true);
    if (playId) this.fetchOdds(true);
  }

  /**
   * 处理参数变动是否更新值
   * 监听彩种类型与玩法编号
   */
  @WatchExtra(function (){
    const {categoryId, playId} = this.vformdata || {};
    return {categoryId, playId}
  }, { immediate: true })
  async onWatchCategoryIdIdAndPlayId(nv = {}, ov = {}) {
    if (nv.categoryId && nv.playId) {
      // 有新数据
      if (this.newDataArray.length) {
        const { categoryId, playId } = this.newDataArray[0];
        // 如果切换的值，是新添加数据的值，不做任何处理（相当于还原表单值reset）
        if (nv.categoryId == categoryId && nv.playId == playId) return;
        // 且已点击取消放弃本页保存
        if (!await this.$confirm({content: '确定放弃本页保存吗？'})) {
          // 如果不放弃
          return this.vform.setValues(ov, false);
        }
      }
    }
    this.datasource.splice(0);
    if (!nv.categoryId) return;
    if (nv.categoryId != ov.categoryId) {
      this.dsstore.lotteryCategoryPlays.fetch({id: nv.categoryId});
      this.vform.setValue('playId', ``, true);
      return;
    }
    if (nv.playId) this.fetchOdds(true);
  }

  // @WatchExtra('vformdata.playId', { immediate: true })
  // async onWatchPlayId(playId){
  //   if (playId && this.newDataArray.length) {
  //     const prevPlayId = this.newDataArray[0].playId;
  //     if (playId == prevPlayId) return;

  //     this.vform.setValues({playId: prevPlayId});
  //     if (!await this.$confirm({content: '确定放弃保存吗？'})) return;
  //     this.datasource.splice(0);
  //     this.vform.setValues({playId});
  //     return;
  //   }
  //   this.datasource.splice(0);
  //   if (this.vformdata.playId) this.fetchOdds();
  // }

  async fetchOdds(refresh) {
    if (refresh) this.changeModeType();
    const form = await this.vform.validate();
    if (form.errors) return;
    if (this.newDataArray.length && !await this.$confirm({content: '确定放弃本页保存吗？'})) return;
    this.$refs.btnQuery.sLoading = true;
    const lotteryId = 0;
    const res = await this.$service.fetch('/config-admin-api/oddsConfig/queryOddsConfigByPlayId', { lotteryId,  playId: this.vformdata.playId});
    this.$refs.btnQuery.sLoading = false;
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.datasource = res.data || [];
  }

  /** 
   * 添加与修改 
   * @param {Object} obj 添加与修改初始值
   */
  async addOrEdit(obj) {
    const form = await this.vform.validate();
    if (form.errors) return;
    obj.playName = this.dsstore.lotteryCategoryPlays?.find(item => item.id == obj.playId)?.playName;
    const res = await this.$modal2(require('./PlayOddsForm').default, obj);
    if (!res.closed) return;
    this.datasource.unshift(res.data);
  }

  /** 保存本页 */
  async savePage() {
    const apiName = '/config-admin-api/oddsConfig/batchAddOddsConfig';
    const oddsList = this.newDataArray;
    this.$refs.btnSavePage.sLoading = true;
    const res = await this.$service.fetch(apiName, {list: oddsList});
    this.$refs.btnSavePage.sLoading = false;
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.datasource = this.datasource.filter(d => d.id);
    this.fetchOdds();
  }

  /* 关联/取消关联赔率 */
  async toRelationOdds(relationType, oddsObj) {
    if (this.newDataArray.length > 0) return this.$message.warn("请先保存本页再进行关联操作!");
    // 奖项编号
    const { id, playId } = oddsObj;
    // 取消关联
    if (!relationType) {
      if (!await this.$confirm({title:'溫馨提示',content:"是否取消关联?"})) return;
      const res = await this.$service.fetch("/config-admin-api/oddsConfig/unbindOddsConfig", { id });
      if (1 != res.code) return res.message && this.$message.error(res.message);
      this.$message.success(res.message);
      this.fetchOdds();
      return;
    }
    // 玩法对象
    const play = this.lotteryCategoryPlayMap[id] || {};
    const playName = this.lotteryCategoryPlayMap[playId]?.playName;
    // 关联奖项
    const relationItems = this.datasource.filter(d =>  id != d.id);
    if (!relationItems.length) return this.$message.warn("无关联奖项");
    let res = await this.$modal2(require('./PlayOddsRelationForm').default, {play, relationItems, playName});
    if (!res.closed) return;
    const bindId = res.data;

    res = await this.$service.fetch("/config-admin-api/oddsConfig/bindOddsConfig", { id, ...bindId });
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.fetchOdds();
  }  

  @Lifecycle() created() {
    this.vform.vbind('vformdata');
  }
}
</script>