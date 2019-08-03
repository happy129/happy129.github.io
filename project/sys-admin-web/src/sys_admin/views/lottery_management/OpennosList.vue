<template>
  <div class="wrapper">
    <a-form :form="vform" layout="inline" class="panel">
      <a-form-item label="平台名称">
        <a-select style="width: 180px;" placeholder="请选择" v-decorator="[ 'platformId' ]">
          <a-select-option :value="``">请选择平台名称</a-select-option>
          <a-select-option v-for="(d, i) in dsstore.platforms" :value="`${d.id}`" :key="i">{{d.platformName}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="彩种名称">
        <a-select style="width: 180px;" placeholder="请选择" v-decorator="[ 'lotteryId' ]">
          <a-select-option :value="``">全部</a-select-option>
          <a-select-option v-for="(d, i) in dsstore.lotterys" :value="`${d.id}`" :key="i">{{d.lotteryName}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="当前期号">
        <a-input v-decorator="[ 'issueNo' ]"/>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" ref="btnQuery" @click.native="fetchOpennosArray({pageNo: 1})">查询</a-button>
      </a-form-item>
      <a-table style="margin-top: 10px" class="mytable" bordered :columns="columns" :rowKey="(_, i) => i" 
        :dataSource="datasource" :pagination="pagination" @change="toGridChange($event)">
        <template slot="todo" slot-scope="d">
          <a-button type="primary" size="small" @click.native="addOrEdit(d)" v-permission="10030">修改</a-button>&nbsp;
          <a-button type="danger" size="small" @click.native="del(d)" v-permission="10031">删除</a-button>
        </template>
      </a-table>
    </a-form>
  </div>
</template>
<script>
import Vue from 'vue'
import { Component, InjectComponents, Prop, Watch, Lifecycle, Computed, Filter, State, Action, Getter, Mutation, InjectComponent } from 'vue-decorators';

//, scopedSlots: { customRender: 'categoryId' }
const columns = [
  { title: '平台名称', dataIndex: 'platformName', width: '120px', align: 'center' },
  { title: '彩种名称', dataIndex: 'lotteryName', width: '160px', align: 'center' },
  { title: '开奖期号', dataIndex: 'issueNo', width: '140px', align: 'center' },
  { title: '开奖号码', dataIndex: 'openNumber', width: '200px', align: 'center' },
  { title: '本期截止时间', dataIndex: 'currentIssueEndTime', width: '140px', align: 'center' },
  { title: '开奖时间', dataIndex: 'settleTime', width: '140px', align: 'center' },
  { title: '号码来源', dataIndex: 'collectingSourceName', width: '200px', align: 'center' },
  { title: '号码来源服务器', dataIndex: 'collectingServerIp', width: '200px', align: 'center' },
  { title: '操作', width: '180px', scopedSlots: { customRender: 'todo' } },
];

const dictionary = '';
const formOptions = 'id';

/** 配置内置初始化数据源 */
const dsstore = {
  platforms: { url: '/config-admin-api/platform/queryAllPlatform', params: {} },
  lotterys: { url: '/config-admin-api/lottery/queryAllLottery', params: {} }
}

@Component({ dictionary, formOptions, dsstore })
@InjectComponents({ })
export default class OpennosList extends Vue {

  
  /** 查询条件 */
  params = { platformId: '', lotteryId: '' }
  /** 分页条件 */
  pagination = { current: 1, get pageNo() { return this.current }, pageSize: 15, total: 0 }
  /** 列表定义 */
  columns = columns;
  /** 数据源 */
  datasource = [];

  /** 分页查询 */
  toGridChange(pagination) {
    const { total, current, pageSize } = pagination;
    Object.assign(this.pagination, { total, current, pageSize });
    this.fetchOpennosArray();
  }

  
  /** 彩种初始化 */
  async fetchOpennosArray(params = {}) {
    if (!this.params.platformId) return this.$message.info("请选择平台名称!");
    this.$refs.btnQuery.sLoading = true;
    const res = await this.$service.fetch('/config-admin-api/openNumber/queryPageOpenNumber', {...this.params, ...this.pagination, ...params});
    this.$refs.btnQuery.sLoading = false;
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.datasource = res.data.records || [];
    const { totalCount: total = 0, pageNo: current = 1, pageSize = 15 } = res.data;
    Object.assign(this.pagination, { total, current, pageSize });
  }
  
  /**
   * 添加/修改
   * @param {object} obj 开奖号码对象
   */
  async addOrEdit(obj) {
    const res = await this.$modal2(require('./OpennosForm').default, {...obj});
    if (!res.closed) return;
    this.fetchOpennosArray({pageNo: 1});
  }

  /**
   * 删除
   * @param {object} obj 开奖号码对象
   */
  async del(obj) {
    if (!await this.$confirm({content: '确定删除当前操作数据?'})) return;
    const {id} = obj;
    const res = await this.$service.fetch('/config-admin-api/openNumber/removeOpenNumberById', {id});
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.fetchOpennosArray({pageNo: 1});
  } 

  @Lifecycle() mounted() {
    this.vform.vbind('params');
    // this.fetchOpennosArray();
  }


}
</script>
