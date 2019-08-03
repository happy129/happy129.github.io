<template>
  <div class="bank-container">
    <a-button type="primary" @click="showAdd=true" v-permission="10061">添加银行</a-button>
    <a-table class="mytable mt15" bordered :columns="columns" :dataSource="dataSource" :rowKey="e => e.id" :pagination="false">
      <template slot="op" slot-scope="r, t">
        <a-button @click="modify(t)" type="primary" size="small" v-permission="10062">修改</a-button>
      </template>

      <template slot="logo" slot-scope="r, t">
        <img :src="t.logoUrl" alt="..." style="width:40px;height:40px;">
      </template>

      <template slot="status" slot-scope="r, t">
        {{t.isEnabled===1?'启用':'禁用'}}
      </template>
    </a-table>

    <a-pagination
      :current="pagination.current"
      class="mt15"
      style="text-align:right;"
      :total="pagination.total"
      @change="changePagination"
      @showSizeChange="showSizeChange"
    />

    <add-bank v-if="showAdd" @close="showAdd=false" @ok="getData"></add-bank>

    <edit-bank v-if="showEdit" @close="showEdit=false" @ok="getData" :detail="detail"></edit-bank>
  </div>
</template>
<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, State } from "vue-decorators";
import addBank from "./AddBank"
import editBank from "./EditBank"

@Component
@InjectComponents({addBank, editBank})
export default class SupportBanks extends Vue {
  detail = {};
  showAdd = false;
  showEdit = false;
  pagination = { total: 0, current: 1 };
  pageSize = 10;
  dataSource = [];
  columns = [
    { title: "ID", dataIndex: 'id' },
    { title: "logo", scopedSlots: { customRender: "logo" } },
    { title: "银行名称", dataIndex: 'bankName' },
    { title: "总行联号", dataIndex: 'bankCode' },
    { title: "状态", dataIndex: 'isEnabled', scopedSlots: {customRender: "status"} },
    { title: "创建时间", dataIndex: 'createTime' },
    { title: "操作", scopedSlots: { customRender: "op" } }
  ];

  async modify(t) {
    this.detail = await t;
    this.showEdit = true;
  }

  async changePagination(page, pageSize) {
    this.pagination.current = page;
    this.pageSize = pageSize;
    await this.getData();
  }
  async showSizeChange(page, pageSize) {
    this.pagination.current = page;
    this.pageSize = pageSize;
    await this.getData();
  }

  async getData() {
    let res = await this.$service.fetch(
      "/config-admin-api/bank/queryPageBank",
      {
        bankName: "",
        pageNo: this.pagination.current,
        pageSize: this.pageSize
      }
    );
    if (1 !== res.code) return;
    this.dataSource = res.data?.records;
    this.pagination.total = res.data?.totalCount;
  }

  @Lifecycle() async created() {
    await this.getData();
  }
}
</script>

<style lang="scss" scoped>
.bank-container {
  
}
</style>