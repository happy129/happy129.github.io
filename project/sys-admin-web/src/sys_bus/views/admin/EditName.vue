<template>
<div style="background-color: #fff; padding: 0 15px 35px;">
  <a-tabs @change="callback">
    <a-tab-pane tab="新增修改" key="新增修改"  v-if="premissions.includes('administrator:userRealnameModify:add')">
        <add-modify></add-modify>
    </a-tab-pane>
    <a-tab-pane tab="待审核" key="待审核"  v-if="premissions.includes('administrator:userRealnameModify:verify')">
        <wait></wait>
    </a-tab-pane>
    <a-tab-pane tab="已通过" key="已通过"  v-if="premissions.includes('administrator:userRealnameModify:passRecord')">
        <passed></passed>
    </a-tab-pane>
    <a-tab-pane tab="未通过" key="未通过"  v-if="premissions.includes('administrator:userRealnameModify:refuseRecord')">
        <no-passed></no-passed>
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
