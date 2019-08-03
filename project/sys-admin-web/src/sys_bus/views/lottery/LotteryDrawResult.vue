<style lang="scss" scoped>
.wrapper {
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  border-radius: 4px;
  .panel {
    padding: 20px 15px 25px;
    background: #ffffff;
    margin-bottom: 20px;
    min-height: 300px;
    h1 {
      font-size: 16px;
      font-weight: bold;
    }
    .input {
      width: 200px;
    }
    .span1 {
      display: inline-block;
      min-width: 80px;
      margin-right: 20px;
    }
    .panel2 {
      margin: 10px -15px 0;
      width: 100%;
      border-top: 1px solid #ddd;
      padding: 15px 15px 0;
      > button {
        margin-right: 15px;
      }
    }

    .tabs {
      margin: 20px 0;
      > button {
        margin-right: 15px;
      }
    }
  }
}
</style>
<template>
  <div class="wrapper">
    <a-form :form="vform" layout="inline" class="panel">
      <a-form-item label="彩种名称">
        <a-select style="width: 140px;" placeholder="请选择" v-decorator="[ 'lotteryId' ]">
          <a-select-option :value="``">全部</a-select-option>
          <a-select-option v-for="(d, i) in dsstore.lotterys" :value="`${d.id}`" :key="i" >{{d.lotteryName}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="当前期号">
        <a-input v-decorator="[ 'issueNo' ]"/>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" ref="btnQuery" @click.native="fetchOpennosArray()">查询</a-button>
      </a-form-item>
      <a-table style="margin-top: 10px" class="mytable" bordered
        :columns="columns" :rowKey="(_, i) => i"
        :dataSource="datasource" :pagination="pagination" @change="toGridChange($event)">
        <!-- <template slot="nameAndIssueNo" slot-scope="d">
          <span style="min-width:180px;text-align:center;display:inline-block;float:left;">{{d.lotteryName}}</span>
          {{d.issueNo}}
        </template> -->
      </a-table>
    </a-form>
  </div>
</template>
<script>
import Vue from "vue";
import { Component, InjectComponents, Prop, Watch, Lifecycle, Computed, Filter, State, Action, Getter, Mutation, InjectComponent } from "vue-decorators";

//, scopedSlots: { customRender: 'categoryId' }
const columns = [
  { title: "彩种名称", dataIndex: "lotteryName", width: "200px", align: "center" },
  { title: "开奖期号", dataIndex: "issueNo", width: "140px", align: "center" },
  { title: "开奖号码", dataIndex: "openNumber", width: "200px", align: "center" },
  { title: '本期截止时间', dataIndex: 'currentIssueEndTime', width: '200px', align: 'center' },
  // { title: '总和', dataIndex: 'currentIssueEndTime', width: '200px', align: 'center' },
  // { title: '前三/中三/后三', dataIndex: 'collectingSourceName', width: '200px', align: 'center' },
  { title: "开奖时间", dataIndex: "settleTime", width: "200px", align: "center" }
];

const dictionary = "";
const formOptions = "id";

/** 配置内置初始化数据源 */
const dsstore = {
  lotterys: { url: "/config-admin-api/lottery/queryAllLottery", params: {} }
};

@Component({ dictionary, formOptions, dsstore })
@InjectComponents({})
export default class LotteryDrawResult extends Vue {
  /** 查询条件 */
  params = { lotteryId: "" };
  /** 分页条件 */
  pagination = { current: 1, get pageNo() { return this.current; }, pageSize: 15, total: 0 };
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
    this.$refs.btnQuery.sLoading = true;
    const res = await this.$service.fetch( "/config-admin-api/openNumber/queryPageOpenNumber", { ...this.params, ...this.pagination, ...params } );
    this.$refs.btnQuery.sLoading = false;
    if (1 != res.code) return res.message && this.$message.error(res.message);
    const { totalCount: total = 0, pageNo: current = 1, pageSize = 15, records = [] } = res.data || {};
    this.datasource = records;
    Object.assign(this.pagination, { total, current, pageSize });
  }

  /**
   * 添加/修改
   * @param {object} obj 开奖号码对象
   */
  async addOrEdit(obj) {
    // const res = await this.$modal2(require('./OpennosForm').default, {...obj});
    // if (!res.closed) return;
    // this.fetchOpennosArray({pageNo: 1});
  }

  /**
   * 删除
   * @param {object} obj 开奖号码对象
   */
  async del(obj) {
    if (!(await this.$confirm({ content: "确定删除当前操作数据?" }))) return;
    const { id } = obj;
    const res = await this.$service.fetch( "/config-admin-api/openNumber/removeOpenNumberById", { id } );
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.fetchOpennosArray({ pageNo: 1 });
  }

  @Lifecycle() mounted() {
    this.vform.vbind("params");
    this.fetchOpennosArray();
  }
}
</script>
