<template>
  <!--分享优惠活动-->
  <div class="page-container">
    <a-tabs>
      <a-tab-pane tab="字典组管理" key="1" v-if="premissions.includes('configurationManager:dictionaryManager:queryGroup')">
        <dictionaryGroup  />
      </a-tab-pane>
      <a-tab-pane tab="字典项管理" key="2" v-if="premissions.includes('configurationManager:dictionaryManager:queryItem')">
        <dictionaryItem  />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents } from 'vue-decorators'
import { dictionaryGroup, dictionaryItem} from './dictionary'

@Component()
@InjectComponents({ dictionaryGroup, dictionaryItem })
export default class DictionaryManagement extends Vue {

	activeKey = "1";

}
</script>