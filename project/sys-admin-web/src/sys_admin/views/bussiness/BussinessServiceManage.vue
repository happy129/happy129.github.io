<template>
   <section class="buss-container">
    <a-form layout="inline">
      <a-form-item label="机器名">
        <a-input/>
      </a-form-item>
      <a-form-item label="数据库IP">
        <a-select defaultValue>
          <a-select-option value>全部</a-select-option>
          <a-select-option value="1">无线代</a-select-option>
          <a-select-option value="2">现金代</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">查询</a-button>
      </a-form-item>
      <a-form-item>
        <a-button type="primary">添加</a-button>
      </a-form-item>
    </a-form>

     <div class="page-under-table">
        <a-table :columns="table.columns" :dataSource="table.dataSource" :rowKey="e => e.id">
            <a href="javascript:;" slot="userName" slot-scope="text, records" @click.prevent="showDetail(records.id, 'account')">{{text}}</a>
            <span slot="isOnline" slot-scope="text, records">{{getStatus(records.isOnline)}}</span>
            <span slot="isTopUp" slot-scope="text, records"> {{records.isTopUp === 0 ? '否' : '是' }}</span>
            <a href="javascript:;" slot="bankInfo" slot-scope="text, records" @click.prevent="showDetail(records.id, 'bankInfo')">银行信息</a>
            <a href="javascript:;" slot="caiwu" slot-scope="text, records" @click.prevent="showDetail(records.id, 'caiwu')">查看财务</a>
        </a-table>
      </div>
  </section>
</template>

<script>
import Vue from "vue"
import { Component, Lifecycle, InjectComponents } from 'vue-decorators'
import { Modal } from 'ant-design-vue'
import DateRange from '@/components/date-range/DateRange'

@Component
@InjectComponents({ DateRange })
export default class BussinessServiceManage extends Vue {
    table = {
        columns: [
            { title: '商户标识',  dataIndex: 'groupId'},
            { title: '商户名称', dataIndex: 'groupName'}, 
            { title: '机器名', dataIndex: 'userCount'}, 
            { title: '数据库IP', dataIndex: '2'}, 
            { title: '操作',  dataIndex: 'operate', scopedSlots: { customRender: 'operate' } }
        ],
        selectedRowKeys: [],
        rowSelection: {
            getCheckboxProps(record) {
              return ({ props: { disabled: record.groupId === 1  }})
            },
            onChange: (selectedRowKeys) => {
               this.table.selectedRowKeys = selectedRowKeys;
            }
        },
        dataSource: [],
        pagination: { total: 0, current: 1 }
    };
    
    requestParams = {
        getAllUserGroup: {  pageNo: 1,  pageSize: 10 }
    };

    init = {
        ModalShow: false,
        ModalTitle: ['添加会员组', '修改会员组'],
        ModalTitleIndex: 0,
        confirmLoading: false,
        form: { userName: '', groupId: ''},
        error: { msg: ''},
        tips: ['提示', '请勾选要删除的组别', '确定要删除选中的组别吗?']
    };

}
</script>

<style lang="scss">
.buss-container {
    height: 100%; padding: 15px 10px; box-sizing: border-box;
    overflow-y: auto; border-radius: 4px; background-color: #fff;
}
</style>

