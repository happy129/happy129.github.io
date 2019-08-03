<template>
  <div class="bank-container">
    <a-button type="primary" @click="showAdd=true" v-permission="10064">添加前缀</a-button>
    <a-table class="mytable mt15" bordered :columns="columns" :dataSource="dataSource" :pagination="false" :rowKey="e => e.id">
      <template slot="op" slot-scope="r, t" >
        <a-button @click="modify(t)" type="primary" size="small" v-permission="10065">修改</a-button>
      </template>
    </a-table>

    <a-pagination
      :current="pagination.current"
      class="mt15"
      style="text-align: right;"
      :total="pagination.total"
      @change="changePagination"
      @showSizeChange="showSizeChange"
    />

    <add-prefix v-if="showAdd" @close="showAdd=false" @ok="getData" :allBs="allBs"></add-prefix>

    <edit-prefix v-if="showEdit" @close="showEdit=false" @ok="getData" :details="details" :allBs="allBs" ></edit-prefix>
  </div>
</template>
<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, State } from "vue-decorators";
import addPrefix from "./AddPrefix";
import editPrefix from "./EditPrefix";

@Component
@InjectComponents({ addPrefix, editPrefix })
export default class BanksDistinguish extends Vue {
  showEdit = false;
  details = {};
  showAdd = false;
  dataSource = [];
  columns = [
    { title: "银行卡前缀", dataIndex: "cardNoPrefix" },
    { title: "银行卡名称", dataIndex: "cardName" },
    { title: "创建时间", dataIndex: "createTime" },
    { title: "操作", scopedSlots: { customRender: "op" } }
  ];

  modify(t) {
    this.details = t;
    this.showEdit = true;
  }

  async getData() {
    let res = await this.$service.fetch(
      "/config-admin-api/bankCardType/queryPageBankCardType",
      {
        pageNo: this.pagination.current,
        pageSize: this.pageSize
      }
    );
    if (1 !== res.code) return;
    this.dataSource = res.data?.records;
    this.pagination.total = res.data?.totalCount;
  }

  pagination = { total: 0, current: 1 };
  pageSize = 10;
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

  allBs = [];

  @Lifecycle() async created() {
    
    await this.getData();

    // 所有银行名和ID
    let r = await this.$service.fetch(
      "/config-admin-api/bank/queryAllBank",
      { pageNo: this.pagination.current, pageSize: this.pageSize }
    );
    if (1 !== r.code) return;
    this.allBs = r.data;
  }
}
</script>
