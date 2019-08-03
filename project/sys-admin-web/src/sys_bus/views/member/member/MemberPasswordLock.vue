<template>
    <!--密码冻结管理-->
    <div class="member-pass">
         <div class="member-pass-hd">
            <a-form layout="inline" @submit.prevent="getUserPasswordList(true)">
                <a-form-item label="会员ID"> <a-input v-model="form.userId"/> </a-form-item>
                <a-form-item label="会员账号"> <a-input v-model="form.userName"/> </a-form-item>
                <a-form-item>
                    <a-button type="primary" html-type="submit">查询</a-button>
                </a-form-item>
            </a-form>
        </div>
        <div class="page-under-table">
          <a-table  class="mytable" bordered :columns="table.columns" :rowKey="(e, i) => i" :dataSource="table.dataSource" :pagination="table.pagination" @change="changePagination">
            <template slot="operation" slot-scope="text, record">
              <a-button v-permission="20021" type="primary" size="small" @click="openAction(record)">解冻</a-button>
            </template>
          </a-table>
        </div>
    </div>
</template>

<script>
import Vue from "vue"
import { Component, Lifecycle } from 'vue-decorators'
import { getUserPasswordLockInfo } from '@api/member'

@Component
export default class MemberPasswordLock extends Vue {
    table = {
      columns: [
        { title: 'ID', dataIndex: 'userId' },
        { title: '会员账号', dataIndex: 'userName' },
        { title: '登录次数', dataIndex: 'passwordErrorCount' },
        { title: '支付次数', dataIndex: 'payPasswordErrorCount' },
        { title: '时间', dataIndex: 'createTime' },
        { title: '操作', dataIndex: 'operation', scopedSlots: { customRender: "operation" } }
      ],
      dataSource: [],
      pagination: { total: 0, current: 1} 
    };

    form = {
      pageNo: 1,
      pageSize: 10,
      userId: '',
      userName: ''
    };

    @Lifecycle mounted() {
      this.getUserPasswordList();
    }

    changePagination(pagination) {
      this.table.pagination.current = pagination.current;
      this.form.pageNo = pagination.current;
      this.getUserPasswordList();
    }

    resetPagination() {
      this.table.pagination.current = 1;
      this.form.pageNo = 1;
    }

    async getUserPasswordList(reset) {
      if (reset) this.resetPagination();
      
      const { data: res } = await getUserPasswordLockInfo(this.form);
      if (res?.body?.code === 1 && res?.body?.data?.records) {
        this.table.dataSource = res.body.data.records;
        this.table.pagination.total = res?.body?.data?.totalCount;
      }
    }

    async openAction(item) {
      this.$modal.confirm({
        title: "提示",
        content: "确认解除冻结？",
        onOk: async () => {
          const res = await this.$service.fetch("/lottery-admin-api/userPasswordLock/unlockUser", {userId: item.userId});
          if (res.code !== 1) res.message && this.$message.error(res.message);
          this.$notice.success({ message: res.message });
          this.getUserPasswordList();
        }
      });
    }
}

</script>