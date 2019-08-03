<style lang="scss" scoped>
.hallLotteryClass-box /deep/ {
  height: 100%;
  background-color: #fff;
  padding: 10px;
}
</style>

<template>
  <div class="hallLotteryClass-box">
    <a-button v-permission="20315" type="primary" @click="showAdd=true;">添加</a-button>
    <br>
    <a-table class="mytable mt10" bordered :columns="columns" :dataSource="tableData" :rowKey="e => e.id" :pagination="false">
      <template slot="conf" slot-scope="t, r">
        <a-button  v-permission="20316"  type="primary" size="small" style="margin-right:10px;" @click="openEdit(r.id)">编辑</a-button>
        <a-popconfirm title="确定删除吗?" @confirm="deleteL(r.id)" okText="确定" cancelText="取消">
          <a-button  v-permission="20317"  type="primary" size="small">删除</a-button>
        </a-popconfirm>
      </template>
      <template slot="lotteryList" slot-scope="t, r">
        <span>{{getNames(r.lotteryList)}}</span>
      </template>
    </a-table>

    <a-pagination
      class="mt10"
      style="text-align: right;"
      :current="pagination.current"
      :total="pagination.total"
      @change="changePagination"
      @showSizeChange="showSizeChange"
    />

    <add-lottery-class v-if="showAdd" @close="showAdd=false;" @ok="fetchData" :plainOptions="plainOptions"></add-lottery-class>

    <edit-lottery-class v-if="showEdit" @close="showEdit=false;" :id="id" @ok="fetchData" :plainOptions="plainOptions"></edit-lottery-class>
  </div>
</template>
<script>
import Vue from "vue";
import {
  Component,
  Lifecycle,
  InjectComponents,
  Prop,
  State
} from "vue-decorators";
import addLotteryClass from "./AddLotteryClass.vue";
import editLotteryClass from "./EditLotteryClass.vue";
@Component
@InjectComponents({ addLotteryClass, editLotteryClass })
export default class HallLotteryClass extends Vue {
  id = "";
  tableData = [];
  showAdd = false;
  showEdit = false;
  pagination = { total: 0, current: 1 };
  pageSize = 10;
  columns = [
    { title: "分类名称", dataIndex: "categoryName" },
    { title: "排序", dataIndex: "sortOrder" },
    { title: "彩种", scopedSlots: { customRender: "lotteryList" } },
    { title: "操作", scopedSlots: { customRender: "conf" } }
  ];

  async changePagination(page, pageSize) {
    this.pagination.current = page;
    this.pageSize = pageSize;
    await this.fetchData();
  }
  async showSizeChange(page, pageSize) {
    this.pagination.current = page;
    this.pageSize = pageSize;
    await this.fetchData();
  }

  async fetchData() {
    let res = await this.$service.fetch(
      "/config-admin-api/frontCategory/queryPageFrontCategory",
      {
        categoryName: "",
        pageNo: this.pagination.current,
        pageSize: this.pageSize
      }
    );
    if (1 !== res.code) return this.$message.error(res.message);
    this.tableData = res.data?.records;
    this.pagination.total = res.data?.totalCount;
  }

  plainOptions = [];

  @Lifecycle() async created() {
    this.plainOptions = await this.getPlainOptions();
    this.pagination.current = 1;
    this.fetchData();
  }

  async deleteL(id) {
    let res = await this.$service.fetch( "/config-admin-api/frontCategory/removeFrontCategoryById", { id: id } );
    if (1 !== res.code) return this.$message.error(res.message);
    if (1 == res.code) {
      this.$message.success(res.message);
      this.fetchData();
    }
  }

  getNames(l) {
    return l
      .reduce((ca, cu) => {
        ca.push(cu.lotteryName);
        return ca;
      }, [])
      .join("、");
  }

  async getPlainOptions() {
    let res = await this.$service.fetch('/config-admin-api/lottery/queryAllLottery', {})
    if (1 !== res.code) return this.$message.error(res.message);
    let d = res.data;
    d.forEach(d => { d.label = d.lotteryName; d.value = +d.id; })
    return d
  }

  openEdit(id) {
    this.id = id;
    this.showEdit = true;
  }
}
</script>
