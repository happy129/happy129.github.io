<style lang="scss">
.wrapper {
    height: 100%; box-sizing: border-box;
    overflow-y: auto; border-radius: 4px; 
  .panel {
    padding: 15px 15px; background: #ffffff; margin-bottom: 20px;
    h1 { font-size: 16px; font-weight: bold; }
    h2 { font-size: 14px; font-weight: bold; margin: 5px 0; }
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

  .layout3 /deep/ {
    .ant-form-item-label { font-weight: 400; font-size: 13px; color: #777; }
    .ant-form-item-children { min-width: 80px; display: inline-block; margin-right: 10px; font-size: 13px; }
    .ant-form-item-label, .ant-form-item-control { line-height: 21px; }
  }
}
</style>

<template>
  <section class="wrapper">
    <a-form layout="inline" class="panel">
      <a-form-item label="时间盘口类型">
        <a-select class="input" v-model="timeTrayTypeId">
          <a-select-option v-for="(d, i) in timeTrayTypeArrays" :value="`${d.id}`" :key="i">{{d.name}}</a-select-option>
        </a-select>
      </a-form-item>
      <div class="panel2">
        <a-button type="primary" @click.native="addOrEdit()" v-permission="10024">添加分类</a-button>
        <a-button type="primary" :disabled="!timeTrayType" @click.native="addOrEdit(timeTrayType)" v-permission="10025">修改</a-button>
      </div>
    </a-form>
    <div class="panel" v-if="timeTrayType">
      <h1>类型设置</h1>
      <a-form layout="inline" class="layout3">
        <a-form-item label="周期类型">{{dictionary.cycleType.get(timeTrayType.cycleType)}}</a-form-item>
        <a-form-item label="期号格式类型">{{dictionary.issueFormatType.get(timeTrayType.issueFormatType)}}</a-form-item>
        <a-form-item label="期号缩写">
          <template v-if="timeTrayType.issueAbbrDigits == 0">全显</template>
          <template v-else>后{{timeTrayType.issueAbbrDigits}}位</template>
        </a-form-item>
        <a-form-item label="时区类型">{{dictionary.timeZoneType.get(timeTrayType.timeZoneType)}}</a-form-item>
        <a-form-item label="时间类型">{{dictionary.timeType.get(timeTrayType.timeType)}}</a-form-item>
        <a-form-item label="封单时间">{{timeTrayType.sealSeconds}}秒</a-form-item>
      </a-form>
      <h2>周期规则</h2>
      <a-form layout="inline" class="layout3">
        <div v-for="(d, i) in timeTrayType.cycleList" :key="i">
          <template v-if="timeTrayType.cycleType == 0">
            <!-- 每天 -->
            <a-form-item label="周期开始时间">{{d.cycleStartTime}}</a-form-item>
            <a-form-item label="周期结束时间">{{d.cycleEndTime}}</a-form-item>
            <a-form-item label="开奖周期">{{toFormatDayOpenCycle(+d.cycleInterval)}}/期</a-form-item>
          </template>
          <template v-else-if="timeTrayType.cycleType == 1">
            <!-- 每年 -->
            <a-form-item label="每期结束时间">{{d.cycleEndTime}}</a-form-item>
            <a-form-item label="下期开始时间">{{d.cycleStartTime}}</a-form-item>
            <a-form-item label="开奖周期">
              {{`${d.cycleInterval}`.split(',').map(d => dictionary._weeks.get(d)).join('、')}}
            </a-form-item>
          </template>
        </div>
      </a-form>
      <h2>休市时间</h2>
      <a-form layout="inline" class="layout3">
        <div title="每年国庆休市">
          <a-form-item label="休市开始时间1"> <span v-if="timeTrayType.isBusinessSuspended != 0">{{timeTrayType.nationalDayStartTime || '无'}} </span></a-form-item>
          <a-form-item label="休市结束时间1"> <span v-if="timeTrayType.isBusinessSuspended != 0">{{timeTrayType.nationalDayEndTime || '无'}} </span></a-form-item>
        </div>
        <div title="每年过年休市">
          <a-form-item label="休市开始时间2"> <span v-if="timeTrayType.isBusinessSuspended != 0">{{timeTrayType.newYearStartTime || '无'}} </span></a-form-item>
          <a-form-item label="休市结束时间2"> <span v-if="timeTrayType.isBusinessSuspended != 0">{{timeTrayType.newYearEndTime || '无'}} </span></a-form-item>
        </div>
      </a-form>
      <h2>累加期号起点</h2>
      <a-form layout="inline" class="layout3">
        <a-form-item label="日期">{{timeTrayType.initDate || '无'}}</a-form-item>
        <a-form-item label="期号">{{timeTrayType.initIssue || '无'}}</a-form-item>
      </a-form>

      <div class="panel2">
        <h1 style="margin: 0 0 20px">开奖时间列表</h1>
        <!-- :dataSource="dataSource" :pagination="pagination" :loading="loading" -->
        <a-table class="mytable" bordered :columns="columns" :rowKey="(_, i) => i" @change="changePagination" :pagination="pagination" :dataSource="dataSource"></a-table>
      </div>
    </div>
  </section>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents, Prop, Watch, Lifecycle, Computed, Filter, State, Action, Getter, Mutation, InjectComponent } from 'vue-decorators';

const dictionary = '_weeks,cycleType,issueFormatType,timeZoneType,timeType';

//, scopedSlots: { customRender: 'categoryId' }
const columns = [
  { title: '期号', dataIndex: 'issueNo', width: '120px', align: 'center' },
  { title: '本期开始时间', dataIndex: 'openTime', width: '120px', align: 'center' },
  { title: '本期结束时间', dataIndex: 'endTime', width: '120px', align: 'center' },
  { title: '本期封单时间', dataIndex: 'sealSeconds', width: '120px', align: 'center', customRender: text => `${text}秒` }
];

@Component({ dictionary })
@InjectComponents({ })
export default class TimeTrayType extends Vue {

  /** 时间盘口类型数组 */
  timeTrayTypeArrays = [];
  /** 当前时间盘口类型选中key */
  timeTrayTypeId = null;

  /** 当前盘口类型 */
  timeTrayType = null;

  pagination = {
    total: 0, current: 1, pageSize: 20
  }

  dataSource = [];

  /** 列表定义 */
  columns = columns;

  @Watch('timeTrayTypeId')
  onWatchtimeTrayTypeId() {
    this.timeTrayType = null;
    if (!this.timeTrayTypeId) return;
    this.fetchTimeTrayType();
  }

  changePagination(pagination) {
    this.pagination.current = pagination.current;
    this.queryOpenTime(this.timeTrayTypeId);
  }


  async queryOpenTime(id) {
    const res = await this.$service.fetch('/config-admin-api/lotteryCycle/queryPageOpenTime', {
      id,
      pageNo: this.pagination.current,
      pageSize: this.pagination.pageSize
    });
    // 业务处理
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data?.records instanceof Array) {
      this.dataSource = res.data?.records;
      this.pagination.pageSize = res.data?.pageSize;
      this.pagination.total = res.data?.totalCount;
    }
  }

  /**
   * 抓取所有彩种分类集合信息
   */
  async fetchTimeTrayTypes() {
    // 请求参数，不用管api上的header
    this.timeTrayTypeId = null;
    const res = await this.$service.fetch('/config-admin-api/lotteryCycle/queryAllLotteryCycle', {});
    if (1 != res.code) return res.message && this.$message.error(res.message);
    // 业务处理
    this.timeTrayTypeArrays = res.data || [];
    this.timeTrayTypeId = `${(this.timeTrayTypeArrays[0] || {}).id || ''}`;
  }
  /**
   * 抓取指定盘口类型信息
   */
  async fetchTimeTrayType() {
    const id = this.timeTrayTypeId;
    // 请求参数，不用管api上的header
    const res = await this.$service.fetch('/config-admin-api/lotteryCycle/getLotteryCycleDetail', { id });
    if (1 != res.code) return res.message && this.$message.error(res.message);
    // 业务处理
    this.timeTrayType = res.data;
    this.queryOpenTime(id);
  }

  /**
   * 格式化每期开奖周期
   * @param {Number} seconds 周期时间单位秒
   */
  toFormatDayOpenCycle(seconds) {
    if (isNaN(seconds)) return '';
    const array = [];

    // 秒
    if (seconds % 60) {
      array.unshift(`${seconds % 60}秒`)
    }
    
    // 分钟
    const mins = Math.floor(seconds / 60);
    if (!mins) return array.join('');
    if (mins % 60) {
      array.unshift(`${mins % 60}分钟`)
    }
    
    // 小时
    const hours = Math.floor(mins / 60);
    if (!hours) return array.join('');
    if (hours % 24) {
      array.unshift(`${hours % 24}小时`)
    }

    // 天
    const days = Math.floor(hours / 24);
    if (days) array.unshift(`${days}天`)
    return array.join('');
  }
  
  /** 
   * 添加与修改 
   * @param {Object} obj 添加与修改初始值
   */
  async addOrEdit(obj = {}) {
    const res = await this.$modal2(require('./TimeTrayTypeForm').default, { data: this.$tools.serialize(obj) });
    if (!res.closed) return;
    if (obj.id) this.fetchTimeTrayType();
    else this.fetchTimeTrayTypes();
  }

  @Lifecycle() created() {
    this.fetchTimeTrayTypes();
  }
}
</script>