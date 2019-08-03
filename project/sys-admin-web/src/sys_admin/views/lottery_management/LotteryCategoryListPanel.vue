<template>
  <div class="wrapper">
    <a-table class="mytable" bordered :columns="columns" :rowKey="(_, i) => i" :dataSource="dataSource" :pagination="pagination" :loading="loading">
    <template slot="categoryId" slot-scope="categoryId">
      {{(lotteryCategorys[categoryId] || {categoryName: categoryId}).categoryName}}
    </template>
  </a-table>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents, Prop, Watch, Lifecycle, Computed, Filter, State, Action, Getter, Mutation, InjectComponent } from 'vue-decorators';
// 排列字段：玩法ID、彩种分类、类型、方案、玩法、玩法缩写、玩法简介、玩法说明、投注示例、示例号码
const columns = [
  { title: '玩法ID', dataIndex: 'id', width: '60px', align: 'center' },
  { title: '彩种分类', dataIndex: 'categoryId', width: '120px', align: 'center', scopedSlots: { customRender: 'categoryId' }, },
  { title: '类型', dataIndex: 'typeName', width: '120px', align: 'center' },
  { title: '方案', dataIndex: 'planName', width: '120px', align: 'center' },
  { title: '玩法', dataIndex: 'playName', width: '120px', align: 'center' },
  { title: '玩法缩写', dataIndex: 'fullName', width: '200px', align: 'center' },
  { title: '玩法简介', dataIndex: 'summary', width: '200px' },
  { title: '玩法说明', dataIndex: 'description', width: '200px' },
  { title: '投注示例', dataIndex: 'betExample', width: '200px' },
  { title: '示例号码', dataIndex: 'exampleDescription', width: '200px' },
];

@Component()
export default class LotteryCategoryListPanel extends Vue {
  
  @Prop({ required: true, type: [String, Number]}) lotteryCategoryId;

  dataSource = [];
  loading = false;
  pagination = {};

  lotteryCategoryArrays = [];
  columns = columns;

  @Computed() lotteryCategorys() {
    return this.lotteryCategoryArrays.reduce((m, d) => (m[d.id] = d, m), {});
  }

  /**
   * 抓取所有彩种分类集合信息
   */
  async fetchLotteryCategorys() {
    const res = await this.$service.fetch('/config-admin-api/category/queryAllCategory', {});
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.lotteryCategoryArrays = res.data || [];
  }


  /** 查询玩法信息 */
  async toFetchQueryByCategoryId() {
    if (!this.lotteryCategoryId) {
      return this.dataSource = [];
    }
    this.loading = true;
    const id = this.lotteryCategoryId;
    const res = await this.$service.fetch('/config-admin-api/play/queryAllThirdLevelPlayByCategoryId', { id });
    this.loading = false;
    this.dataSource = [];
    if (1 != res.code) return res.message && this.$message.error(res.message);
    const tocalc = (num1, num2) => (+num1 || 0) - (+num2 || 0);
    this.dataSource = res.data.sort((d1, d2) => {
      // 类型排序
      if (d1.typeId != d2.typeId) {
        return tocalc(d1.typeId, d2.typeId);
      }
      // 方案排序
      if (d1.planId != d2.planId) {
        return tocalc(d1.planId, d2.planId);
      }
      // 玩法排序字段
      return tocalc(d1.sortOrder, d2.sortOrder);
    });
  }

  @Lifecycle created() {
    this.$watch('lotteryCategoryId', () => this.toFetchQueryByCategoryId(), { immediate: true});
    this.fetchLotteryCategorys();
  }
}
</script>
