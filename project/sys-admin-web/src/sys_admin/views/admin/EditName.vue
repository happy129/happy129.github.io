<template>
<div>
  <a-tabs defaultActiveKey="新增修改" @change="callback">
    <a-tab-pane tab="新增修改" key="新增修改">
        <add-modify></add-modify>
    </a-tab-pane>
    <a-tab-pane tab="待审核" key="待审核" forceRender>
        <wait v-if="adminNameTag==='待审核'"></wait>
    </a-tab-pane>
    <a-tab-pane tab="已通过" key="已通过">
        <passed v-if="adminNameTag==='已通过'"></passed>
    </a-tab-pane>
    <a-tab-pane tab="未通过" key="未通过">
        <no-passed v-if="adminNameTag==='未通过'"></no-passed>
    </a-tab-pane>
  </a-tabs>
</div>
</template>
<script>
import addModify from "./edit_name_components/addModify"
import wait from "./edit_name_components/waitExam"
import passed from "./edit_name_components/passed"
import noPassed from "./edit_name_components/noPassed"
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, Prop, State } from "vue-decorators";
@Component
@InjectComponents({addModify, wait, passed, noPassed})
export default class editName extends Vue {
  @State(state => state.adminNameTag) adminNameTag;
  callback(activeKey) {
    this.$store.commit('setAdminNameTag', activeKey)
  }
}
</script>
