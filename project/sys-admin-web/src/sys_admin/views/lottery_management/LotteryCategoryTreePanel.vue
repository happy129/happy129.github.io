<style lang="scss" scoped>
.wrapper {
  overflow-x: hidden;
  /deep/ {
    .ant-tree li { 
      border-top: 1px solid #ddd!important; position: relative;
      &.ant-tree-treenode-switcher-open > ul {
        margin-top: 5px!important;
      }     
    }
    .ant-tree li ul { padding: 0; }
    // .ant-tree li ul > li { padding-left: 18px!important; }
    // .ant-tree li { padding-bottom: 5px; }
    .ant-tree > li {
      .title { display: inline-block; min-width: 300px; }
      > ul > li { 
        text-indent: 8px; 
        .title { display: inline-block; min-width: 300px - 24px; }
      }
      > ul > li > ul > li { 
        text-indent: 8px * 2; 
        .title { display: inline-block; min-width: 300px - 24px * 2; }
      }
    }
    .ant-tree li .ant-tree-node-content-wrapper:hover,
    .ant-tree li .ant-tree-node-content-wrapper.ant-tree-node-selected {
      background-color: transparent!important;
    }
    .ant-tree li .ant-tree-node-content-wrapper:hover {
      .title > span { background-color: #c1d6d0; }
    }
    .ant-tree li .ant-tree-node-content-wrapper.ant-tree-node-selected {
      .title > span { background-color: #81c9b9; }
    }
  }

  .lv1,.lv2,.lv3 {
    display: inline-block;
  }
  // .lv1 { min-width: 18px * (1 - 1); display: none;}
  // .lv2 { min-width: 18px * (2 - 1);}
  // .lv3 { min-width: 18px * (3 - 1);}

  .tree {
    width: 98%; overflow-x: hidden;
  }

  .title span { padding: 2px 5px;}
  .tree-btns {
    display: inline-block; 
    > button { margin-right: 5px; }
  }
}
.tools {
  padding: 10px 20px; margin: 0 0 15px; border: 1px solid #dfdfdf;
  background: #f1f1f1;
}
</style>

<template>
  <div class="wrapper">
    <div class="tools">
      <!-- <a-input-search style="width: 200px; margin-right: 8px" placeholder="请输入玩法名称" @change="toSearch($event)" /> -->
      <a-button @click="addOrEdit(true, 'type')">添加类型</a-button>
    </div>
    <!-- @expand="toExpand" :autoExpandParent="autoExpandParent" -->
    <Tree class="tree" :showLine="false" :defaultExpandedKeys="defaultExpandedKeys" :treeData="dataSourceTree">
      <template slot="type" slot-scope="d">
        <div class="title"><span>{{d.name}}</span></div>
        <div class="tree-btns">
          <a-button type="default" size="small" @click="addOrEdit(true, 'plan', d.id)">添加方案</a-button>
          <a-button type="default" size="small" @click="addOrEdit(false, 'type', d.id)">修改</a-button>
          <a-button type="default" size="small" :loading="d.loading" v-if="d.isSync == 0" @click="toInitPlayASyncApi(d)">启用</a-button>
        </div>
      </template>
      <template slot="plan" slot-scope="d">
        <div class="title"><span>{{d.name}}</span></div>
        <div class="tree-btns">
          <a-button type="default" size="small" @click="addOrEdit(true, 'play', d.id)">添加玩法</a-button>
          <a-button type="default" size="small" @click="addOrEdit(false, 'plan', d.id)">修改</a-button>
          <a-button type="default" size="small" :loading="d.loading" v-if="d.isSync == 0" @click="toInitPlayASyncApi(d)">启用</a-button>
        </div>
      </template>
      <template slot="play" slot-scope="d">
        <div class="title"><span>{{d.name}}</span></div>
        <div class="tree-btns">
          <a-button type="default" size="small" @click="addOrEdit(false, 'play', d.id)">修改</a-button>
          <a-button type="default" size="small" :loading="d.loading" v-if="d.isSync == 0" @click="toInitPlayASyncApi(d)">启用</a-button>
        </div>
      </template>
    </Tree>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents, Prop, Watch, Lifecycle, Computed, Filter, State, Action, Getter, Mutation, InjectComponent } from 'vue-decorators';

import { Tree } from 'ant-design-vue';

import LotteryCategroyPlayForm from './LotteryCategroyPlayForm';


@Component()
@InjectComponents({Tree})
export default class LotteryCategoryTreePanel extends Vue {

  @Prop({ required: true, type: [String, Number]}) lotteryCategoryId;

  expandedKeys = []
  searchValue = ''
  autoExpandParent = true

  dataSource = {};
  dataSourceTree = [];
  loading = false;

  defaultExpandedKeys = [];
  
  playLevelMap =  { 1: 'type', 2: 'plan', 3: 'play' };

  /** 查询玩法信息 */
  async toFetchQueryTreeByCategoryId() {
    if (!this.lotteryCategoryId) {
      return this.dataSource = [];
    }
    this.loading = true;
    const id = this.lotteryCategoryId;
    // const res = await this.$service.fetch('/config-admin-api/play/queryTreeByCategoryId', { id });
    const res = await this.$service.fetch('/config-admin-api/play/queryAllPlayByCategoryId', { id });
    this.loading = false;
    this.dataSourceTree = [];
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.dataSource = {};
    
    /** 数据映射 */
    const array = res.data.map(d => {
      const { id, parentId: pid, playName: name, level, isSync } = d;
      this.dataSource[id] = d;
      return { id, pid, name, isSync, loading: false, scopedSlots: { title: this.playLevelMap[level] }};
    });

    // 树形结构数据
    this.dataSourceTree = this.$tools.arrayToTreeArray(array);
  }

  toExpand(expandedKeys) {
    this.defaultExpandedKeys = expandedKeys
    this.autoExpandParent = false
  }

  /**
   * 查询
   * @param {Event} event 事件对象
   */
  toSearch(event) {
    const value = event.target.value;
    let defaultExpandedKeys = [];
    if (value) {
      const ids = {};
      Object.keys(this.dataSource).forEach(id => {
        const d = this.dataSource[id];
        if (ids[id]) return;
        if (!`${d.playName}`.includes(value)) return;
        ids[id] = 1;
      });
      defaultExpandedKeys = Object.keys(ids).map(d => +d);
    }
    Object.assign(this, {
      defaultExpandedKeys,
      searchValue: value,
      autoExpandParent: true
    });
  }
  
  /** 
   * 玩法初始化 
   * @param {Object} playObj 玩法对象，包括类型，方案，玩法
   */
  async toInitPlayASyncApi(playObj) {
    if (!await this.$confirm({ content: '请确保已设置好相关配置，初始化后将同步更新至所有商户后台', title: '提示'})) return;
    playObj.loading = true;
    const res = await this.$service.fetch('/config-admin-api/play/initPlay', { id: playObj.id });
    playObj.loading = false;
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    playObj.isSync = 1;
  }

  /**
   * 添加与修改
   * @param {Boolean} isAdd 是否添加与修改表单
   * @param {String} type 什么样的表单
   * @param {String/Number} id 编号
   */
  async addOrEdit(isAdd, type, id) {
    this.defaultExpandedKeys.splice(0);
    if (id) this.defaultExpandedKeys.push(id);
    let data = id ? (this.dataSource[id] || {}) : null;
    if (isAdd) {
      let parentId;
      if (type == 'type') data = { parentId: 0 };
      else if (type == 'plan') data = { parentId: data.id };
      else if (type == 'play') data = { parentId: data.id, typeId: data.parentId };
      data.categoryId = this.lotteryCategoryId
    } 
    const res = await this.$modal2(LotteryCategroyPlayForm, { type, data, dataSource: this.dataSource, dataSourceTree: this.dataSourceTree });
    if (!res.closed) return;
    this.toFetchQueryTreeByCategoryId()
  }

  @Lifecycle created() {
    this.$watch('lotteryCategoryId', () => this.toFetchQueryTreeByCategoryId(), { immediate: true});
  }
}
</script>
