<template>
  <section class="configuration">
    <a-table v-show="isShowTable" class="mytable" bordered :columns="table.columns" :dataSource="table.dataSource" :pagination="false" @change="changePagination" :rowKey="(e, i) => i" :scroll="{ x: 760 }">
        <template slot="bankName" slot-scope="text,records">
          <div class="bankName"> 
            <a-checkbox @change="(e) => checkedRows(e, records.paymentId)" :indeterminate="records.indeterminate">
              <span>{{records.paymentName}}</span>
            </a-checkbox> 
          </div>
        </template>
        <template v-for="(item, index) in init.userGroupData" :slot="`item${index}`" slot-scope="text,records">
          <a-checkbox :checked="records[`g_${records.paymentId}_${item.groupId}`]" @change="(e) => checkedValue(e, records.paymentId, item.groupId)" :key="index" />
        </template>
    </a-table>
    <div class="config-text-right">
      <a-button type="primary" @click="submit">保存</a-button>
    </div>
  </section>
</template>
<script>
import Vue from "vue";
import { Component, Lifecycle, Prop, Watch, InjectComponents } from "vue-decorators";
import { Checkbox } from "ant-design-vue"

@Component
export default class Configuration extends Vue {
  @Prop({ type: String }) configType;

  table = {
    key: 1,
    columns: [{ title: "汇款银行", dataIndex: "bankName", fixed: 'left', scopedSlots: { customRender: 'bankName' }}],
    dataSource: [],
    rowSelection: {
      onChange: selectedRowKeys => {
        this.table.selectedRowKeys = selectedRows.map(e => e.id);
      }
    },
    selectedRowKeys: [],
    pagination: {
      total: 0,
      current: 1
    }
  };

  init = {
    userGroupData: [],
    query: { isEnabled: 1, paymentType: '' }
  };

  isShowTable = false;

  @Lifecycle async mounted() {
    await this.getAllUserGroup();
    await this.getList();
  }

  changePagination(pagination) {
    this.table.pagination.current = pagination.current;
    this.init.query.pageNo = pagination.current;
    this.getList();
  }

  setTableHeader(data) {
    // 深拷贝数组
    const userGroupData = JSON.parse(JSON.stringify(data));
    const self = this;
    const userGroup = userGroupData.map((item, index) => {
      // 自定义表头
      const TemplateThead = Vue.component('Athead', {
        template: '<div class="thead-item"><a-checkbox @change="e => checkedCols(e, groupId)">{{name}}</a-checkbox></div>',
        props: {
          name: String,
          groupId: [String, Number]
        },
        methods: {
          checkedCols(e, groupId) {
            self.checkedCols(e, groupId)
          }
        }
      });
      return {
        title: <TemplateThead name={item.groupName} groupId={item.groupId}/>,
        dataIndex: item.groupId,
        scopedSlots: { customRender: `item${index}`}
      }
    });
    this.table.columns = this.table.columns.concat(userGroup);
    this.table.key = Math.random();
  }

  doFilter(item, checked) {
    const result = {};
    for (let [key, value] of Object.entries(item)) {
      if (key.startsWith('g_')) {
        result[key] = checked
      } else {
        result[key] = value
      }
    }
    return result;
  }

  // 选择行
  checkedRows(e, paymentId) {
    this.table.dataSource = this.table.dataSource.map(item => {
      if (item.paymentId == paymentId) {
        item = this.doFilter(item, e.target.checked)
      }
      item.indeterminate = false;
      return item
    });
  }

  // 选择列
  checkedCols(e, groupId) {
    this.table.dataSource.forEach(item => {
      for (let [key, value] of Object.entries(item)) {
        if (key.startsWith('g_')) {
          const arr = key.split("_");
          const gId = arr[arr.length - 1];
          if (gId == groupId) {
            item[key] = e.target.checked;
          }
        }
      }
    });
  }

  // 支付id, 
  checkedValue(e, paymentId, groupId) {
    this.table.dataSource.forEach(item => {
      if (item.paymentId == paymentId) {
        item[`g_${paymentId}_${groupId}`] = e.target.checked
      }
    });
  }

   // 获取所有的会员组
  async getAllUserGroup() {
    const res = await this.$service.fetch('/lottery-admin-api/userGroup/queryAllUserGroup', {});
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data && res.data instanceof Array) {
      this.init.userGroupData = res.data;
      this.setTableHeader(res.data);
    }
  }

  
  async getList() {
     
    if (this.configType === 'bank') {
      //requestUrl = list[0];
      this.init.query.paymentType = 1;
    } else if (this.configType === "qrcode") {
      //requestUrl = list[1];
      this.init.query.paymentType = 3;
    } else if (this.configType === "third") {
      //requestUrl = list[2];
      this.init.query.paymentType = 4;
    } else {
      this.init.query.paymentType = 2;
    }

    const res = await this.$service.fetch('/config-admin-api/payment/queryUserGroupList', this.init.query);
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data && res.data instanceof Array || res.data?.records instanceof Array) {
      let tableData = [];

      tableData = res.data.map(item => {
        return {
          ...item,
          indeterminate: false
        }
      });
  
      // 把groupId混入到bankList里面, 方便后面选中
      if (this.init.userGroupData.length) {
        this.init.userGroupData.forEach(item => {
          for(let i = 0; i < tableData.length; i++) {
            if (!tableData[i].groupId) {
              tableData[i][`g_${tableData[i].paymentId}_${item.groupId}`] = false;
            }
          }
        });
      }
      // 设置选中的值
      tableData.forEach(item => {
        if (item) {
          for (let [key,value] of Object.entries(item)) {
            if (key.startsWith('g')) { 
              const groupId = key.split('_')[2];
              if (item.userGroupIdList instanceof Array && item.userGroupIdList.includes(parseInt(groupId))) {
                item[key] = true;
              }
            }
          }
        }
      });

      this.table.dataSource = tableData;
      this.table.pagination.total = res.data.totalCount;
    } else {
      this.table.dataSource = [];
    }
    
    this.isShowTable = true;
  }


  async submit() {
   const result = [], finalResult = [];
   let paymentType = "";

  //  if (this.configType === 'bank') {
  //     //requestUrl = list[0];
  //     this.init.query.paymentType = 1;
  //   } else if (this.configType === "qrcode") {
  //     //requestUrl = list[1];
  //     this.init.query.paymentType = 3;
  //   } else if (this.configType === "third") {
  //     //requestUrl = list[2];
  //     this.init.query.paymentType = 4;
  //   } else {
  //     this.init.query.paymentType = 2;
  //   } 
   // 支付分类1:银行卡|2:充值卡|3:二维码|4:第三方支付|20:第三方出款 
   switch(this.configType) {
     case "bank": 
        paymentType = 1;
        break;
     case "qrcode":
        paymentType = 3;
        break;    
     case "third":   
        paymentType = 4;
        break;  
      default: 
        paymentType = 20; 
   }


   this.table.dataSource.forEach(item => {
    for (let [key, value] of Object.entries(item)) {
      if (key.startsWith('g_') && value == true) {
        result.push(key);
      }
    }
   });
   // ['g_1_24', 'g_2_24'] => [ { 1: [24]}, {2: [24]} ]
   if (result.length) {
     const obj = {};
     result.forEach(item => {
       const arr = item.split("_");
       if (!obj[arr[1]]) {
         obj[arr[1]] = []; 
         obj[arr[1]].push(arr[2]) 
       } else {
         obj[arr[1]].push(arr[2]) 
       }
     });

    // 转化 [ { 1: [24]}, {2: [24]} ] => [ {paymentId: 1, userGroupIdList: [24] } ]
    for (let [key, value] of Object.entries(obj)) {
      finalResult.push({
        id: key,
        paymentType: paymentType,
        userGroupIdList: value
      });
    }
   }
   if (!finalResult.length) return this.$message.error('请先勾选'); 

   const res = await this.$service.fetch('/config-admin-api/payment/editUserGroup', {list:finalResult});
   if (res.code !== 1) return res.message && this.$message.error(res.message);
   this.$message.success(res.message);
   this.$emit("close");
  }

}
</script>

<style lang="scss" scoped>
.configuration /deep/ {
  width: 760px; 
  overflow-x: auto;
  .thead-item {
    white-space: nowrap;
  }
  .bankName {
    white-space: nowrap;
  }
}
.config-text-right {
  text-align: right;
  margin-top: 20px;
}
</style>
