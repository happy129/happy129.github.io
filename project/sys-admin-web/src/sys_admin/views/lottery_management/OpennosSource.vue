<style lang="scss">
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
  <div class="wrapper">
    <a-form layout="inline" class="panel">
      <a-form-item label="来源名称">
        <a-input v-model="params.sourceName"/>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" ref="btnQuery" @click.native="fetchOpenSources()">查询</a-button>
      </a-form-item>
      <div class="panel2">
        <a-button type="primary" @click.native="addOrEdit()" v-permission="10047">添加</a-button>
      </div>
      <a-table style="margin-top: 10px" class="mytable" bordered :columns="columns" :rowKey="(_, i) => i" :dataSource="dataSource">
        <template slot="todo" slot-scope="d" v-permission="10048">
          <a-button type="primary" size="small" @click.native="addOrEdit(d)">修改</a-button>
        </template>
      </a-table>
    </a-form>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents, Prop, Watch, Lifecycle, Computed, Filter, State, Action, Getter, Mutation, InjectComponent } from 'vue-decorators';

const dictionary = '';

//, scopedSlots: { customRender: 'categoryId' }
const columns = [
  { title: 'ID', dataIndex: 'id', width: '180px', align: 'center' },
  { title: '来源名称', dataIndex: 'sourceName', width: '200px', align: 'center' },
  { title: '添加时间', dataIndex: 'createTime', width: '200px', align: 'center' },
  { title: '', scopedSlots: { customRender: 'todo' } },
];

@Component({ dictionary })
@InjectComponents({ })
export default class OpennosSource extends Vue {

  /** 查询条件 */
  params = { sourceName: '' }
  
  /** 列表定义 */
  columns = columns;

  /** 数据源 */
  datasource = [];

  @Computed dataSource() {
    if (!this.params.sourceName) return this.datasource;
    return this.datasource.filter(d => d.sourceName && d.sourceName.indexOf(this.params.sourceName) != -1);
  }

   /** 彩种初始化 */
  async fetchOpenSources() {
    this.$refs.btnQuery.sLoading = true;
    const res = await this.$service.fetch('/config-admin-api/collectingSource/queryAllCollectingSource', {});
    this.$refs.btnQuery.sLoading = false;
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.datasource = res.data || [];
  }

  /**
   * 添加/修改
   * @param {object} openSourceObj 开奖
   */
  async addOrEdit(openSourceObj) {
    const res = await this.$modal2(require('./OpennosSourceForm').default, openSourceObj);
    if (!res.closed) return;
    this.params.sourceName = '';
    this.fetchOpenSources();
  }

  @Lifecycle() mounted() {
    this.fetchOpenSources();
  }


}
</script>