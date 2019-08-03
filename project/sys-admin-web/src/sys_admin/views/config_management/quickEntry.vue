<template>
  <section class="buss-container">
    <a-button type="primary" @click="showAdd=true" v-permission="10134">添加快捷入口</a-button>

    <div class="page-under-table">
      <a-table class="mytable" bordered :columns="columns" :dataSource="dataSource" :rowKey="e => e.id" :pagination="false">
        <template slot="operate" slot-scope="r, t">
          <a-button @click="edit(t)" type="primary" v-permission="10135">编辑</a-button>
        </template>
        <template slot="isEnabledForcedly" slot-scope="r, t">{{t.isEnabledForcedly===1?'启用':'禁用'}}</template>
        <template slot="logoUrl" slot-scope="r, t">
          <img :src="t.logoUrl" alt="..." style="width:35px;height:35px;">
        </template>
      </a-table>
    </div>

    <a-pagination style="margin: 15px 15px; text-align: right;" :current="pagination.current" size="small" 
    :total="pagination.total" showSizeChanger showQuickJumper @change="changePagination" @showSizeChange="showSizeChange" />
    <add-quick-entry v-if="showAdd" @close="showAdd=false" @ok="getTableList();"></add-quick-entry>
    <edit-quick-entry v-if="showEdit" @close="showEdit=false" @ok="getTableList();" :det="det"></edit-quick-entry>
  </section>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, Watch } from "vue-decorators";
import addQuickEntry from "./AddQuickEntry";
import editQuickEntry from "./EditQuickEntry";

@Component({})
@InjectComponents({ addQuickEntry, editQuickEntry })
export default class QuickEntry extends Vue {
  det = {};
  showEdit = false;
  showAdd = false;
  async edit(t) {
    let r = await this.$service.fetch(
      "/config-admin-api/shortcutEntry/getShortcutEntryDetail",
      { id: t.id }
    );
    if (1 !== r.code) return r.message && this.$message.error(r.message);
    this.det = r.data;
    this.showEdit = true;
  }
  pagination = { total: 0, current: 1 };
  pageSize = 10;
  async changePagination(page, pageSize) {
    this.pagination.current = page;
    this.pageSize = pageSize;
    await this.getTableList();
  }
  async showSizeChange(page, pageSize) {
    this.pagination.current = page;
    this.pageSize = pageSize;
    await this.getTableList();
  }

  columns = [
    {
      title: "LOGO",
      dataIndex: "logoUrl",
      scopedSlots: { customRender: "logoUrl" }
    },
    { title: "快捷入口名称", dataIndex: "shortcutEntryName" },
    { title: "快捷入口编码", dataIndex: "shortcutEntryCode" },
    { title: "排序", dataIndex: "sortOrder" },
    {
      title: "状态",
      dataIndex: "isEnabledForcedly",
      scopedSlots: { customRender: "isEnabledForcedly" }
    },
    { title: "创建时间", dataIndex: "createTime" },
    {
      title: "操作",
      dataIndex: "operate",
      scopedSlots: { customRender: "operate" }
    }
  ];
  dataSource = [
    // {
    //   id: 110,
    //   isEnabledForcedly: 0,
    //   logoUrl: "www",
    //   shortcutEntryCode: "shortcutEntryCode",
    //   shortcutEntryName: "shortcutEntryName",
    //   sortOrder: 5
    // }
  ];

  @Lifecycle async created() {
    this.formElement = this.$form.createForm(this);
    await this.getTableList();
  }

  async getTableList() {
    let r = await this.$service.fetch(
      "/config-admin-api/shortcutEntry/queryPageShortcutEntry",
      { pageNo: this.pagination.current, pageSize: this.pageSize }
    );
    if (1 !== r.code) return r.message && this.$message.error(r.message);
    this.dataSource = r.data?.records;
    this.pagination.total = r.data?.totalCount;
  }
}
</script>

<style lang="scss">
.buss-container {
  height: 100%;
  padding: 15px 10px;
  box-sizing: border-box;
  overflow-y: auto;
  border-radius: 4px;
  background-color: #fff;
}
</style>

