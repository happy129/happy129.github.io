<template>
  <div class="selectwapper">
    <div class="main-top-list">
      <a-tabs size="small" type="card">
        <a-tab-pane v-for="pane in panes" :tab="pane.title" :key="pane.key" :closable="pane.closable">
          {{pane.content}}
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { Component, InjectComponents, Lifecycle, Inject, Watch, Prop } from "vue-decorators";
export default class SelectArea extends Vue {
  initalnumber = [];
  panes = [
      { title: '全部', content: 'Content of Tab 1', key: '1' },
      { title: 'Tab 2', content: 'Content of Tab 2', key: '2' },
      { title: 'Tab 3', content: 'Content of Tab 3', key: '3', closable: false },
  ];
  @Prop()

  @Watch("open", {immediate: true})
  /**初始化所有可屏蔽地区 */
  async getInitLimitAll() {
    const res = await this.$service.fetch(
      "/config-admin-api/countryLimit/queryAllCountry"
    );
    if (1!==res.code) return res.message && this.$message.error(res.message);
    if (res.data instanceof Array) {
      let newArray = res.data.map(item => { 
        return item.countryCode.substr(0, 1)
      });
      function unique(array) {
        return Array.from(new Set(array));
      }
      cosnole.log(unique(newArray), 666)
    } else {

    }
  }
  @Lifecycle async created() {
      await this.getInitLimitAll();
  }
}
</script>
<style lang="scss" scoped>
.selectwapper {
  width: 900px;
  height: 200px;
}
</style>
