<template>
  <section>
    <div class="table-wrap">
      <a-table :key="table.key" class="mytable" bordered  :columns="table.columns" :dataSource="table.dataSource" :rowSelection="{selectedRowKeys: table.selectedRowKeys, onChange: table.rowSelection.onChange}" :pagination="false" :rowKey="(e, i) => e.groupId" >
        <span slot="index" slot-scope="text, record, index">{{index+1}}</span>
      </a-table>
    </div>
    <div class="page-under-table text-right">
      <a-button @click="$emit('close')">取消</a-button>&nbsp;
      <a-button @click="setUserGroupByBankId" type="primary">确定</a-button>
    </div>
  </section>
</template>

<script>
import Vue from 'vue'
import { Component, Lifecycle, Prop, Watch, InjectComponents } from 'vue-decorators'

@Component
export default class ConfigUserGroup extends Vue {
  @Prop({type: [String, Number]}) id;
  @Prop({type: [String, Number]}) paymentType;

   table = {
    key: 1,
    columns: [
      { title: '会员组编号',  dataIndex: 'index', scopedSlots: { customRender: 'index' }},
      { title: '会员组名称', dataIndex: 'groupName'}
    ],
    selectedRowKeys: [],
    rowSelection: {
      onChange: (selectedRowKeys, selectedRows) => {
        this.table.selectedRowKeys = selectedRowKeys;
      },
    },
    dataSource: [],
    pagination: { total: 0, current: 1 }
  };

  // 选中的会员组
  checklist = [];

  @Lifecycle async mounted() {
    await this.getRelationShipForPayment();
    await this.getUserGroup();
  }

  async getRelationShipForPayment() {
    const res = await this.$service.fetch('/config-admin-api/payment/queryUserGroupIdsById', { paymentType: this.paymentType, id: this.id });
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.checklist = res.data?.userGroupIdList || [];
  }

  delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  async getUserGroup() {
    const res = await this.$service.fetch('/lottery-admin-api/userGroup/queryAllUserGroup', {});
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data && res.data instanceof Array) {
      this.table.dataSource = res.data;
      await this.delay(100);
      this.table.selectedRowKeys = this.checklist;
    }
  }

  /* 汇款银行设置， 根据银行卡id分配会员组 */
  async setUserGroupByBankId() {
    //支付分类1:银行卡|2:充值卡|3:二维码|4:第三方支付|20:第三方出款
    const res = await this.$service.fetch('/config-admin-api/payment/editUserGroup', { list: [{
      paymentType: this.paymentType,
      id: this.id,
      userGroupIdList: this.table.selectedRowKeys
    }]});
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.$emit("close");
  }

}
</script>

<style lang="scss" scoped>
.table-wrap {
  height: 300px;
  overflow-y: auto;
}
.text-right {
  text-align: right;
}
</style>
