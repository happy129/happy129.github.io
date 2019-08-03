<template>
  <div class="chaseOrder page-container">
    <a-tabs defaultActiveKey="1">
      <a-tab-pane tab="注单管理" key="1">
          <OrderManage/>
      </a-tab-pane>
      <a-tab-pane tab="撤销注单" key="2">
        <CancelOrder/>
      </a-tab-pane>
      <a-tab-pane tab="开放撤单" key="3">
        <OpenOrder />
      </a-tab-pane>
    </a-tabs>
  </div>
</template> 

<script>
import Vue from "vue";
import { Component, InjectComponents } from "vue-decorators";
import { OrderManage, CancelOrder, OpenOrder } from "./orders";

@Component
@InjectComponents({
  OrderManage,
  CancelOrder,
  OpenOrder
})
export default class ReportOrders extends Vue {}
</script>
<style lang="scss" scoped>
.chaseOrder{
			overflow-y: auto !important
}
</style>


