<template>
  <section class="buss-container">
    <a-form layout="inline" :form="formElement" @submit.prevent="getTableList(true)">
      <a-form-item label="商户名">
        <a-input v-model.trim="formparams.platformName" />
      </a-form-item>
      <a-form-item label="商户ID">
        <a-input v-model.trim="formparams.id"/>
      </a-form-item>
      <a-form-item label="商户标识">
        <a-input v-model.trim="formparams.platformCode"/>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">查询</a-button>
      </a-form-item>
    </a-form>
    <div class="page-under-table">
      <a-table :columns="table.columns" :dataSource="table.dataSource" :rowKey="e => e.id" :pagination="table.pagination" @change="changeTablePagenation">
        <template slot="userCount" slot-scope="r, t">
          <a class="g-blue bold" @click="$router.push({name:'merchantMemberList',params:{merchantMemberId:t.id, createTime:t.createTime}})">{{r}}</a>
        </template>
			</a-table>
    </div>
  </section>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, Watch } from "vue-decorators";
import { getBusManageList } from "@api/bussiness";
import { configGroupQueryAllByList } from "@api/configs";
@Component({})
export default class MerchantMembershipStatistics extends Vue {
  table = {
    columns: [
      { title: "商户ID", dataIndex: "id" },
      { title: "商户标识", dataIndex: "platformCode" },
      { title: "商户名称", dataIndex: "platformName" },
      { title: "会员总人数", dataIndex: "userCount",scopedSlots: { customRender: "userCount" }},
      { title: "创建时间", dataIndex: "createTime"},
    ],
    dataSource: [],
    pagination: { total: 0, current: 1 }
  };

	pagination={ pageNo: 1, pageSize: 10};

  // 后台要求添加
  formparams={ platformName:"", platformCode:"", id:"", status: 1, auditStatus: 1, dbStatus: 7}
  
  changeTablePagenation(pagination) {
    this.table.pagination.current = pagination.current;
    this.pagination.pageNo = pagination.current;
    this.getTableList();
  }

  changeSelection() {
    this.table.pagination.current = 1;
    this.pagination.pageNo = 1;
  }

 /* 获取配置组列表数据 */
  getTableList(type) {
    if (type) {
      this.changeSelection();
    }
    if (this.formparams.id && !/^\d+$/.test(this.formparams.id)) return this.$message.error("请输入正确格式的商户ID");

    this.formElement.validateFields(async (err, values) => {
      if (!err) {
        const { data: res } = await getBusManageList(Object.assign(this.formparams, this.pagination));
        if (res?.body?.code === 1 && res?.body?.data?.records) {
          this.table.dataSource = res.body.data.records;
          this.table.pagination.total = res.body.data?.totalCount;
        }
      }
    });
  }
  
	@Lifecycle created() {
    	this.formElement = this.$form.createForm(this);
  	}

	@Lifecycle mounted() {
		this.getTableList();
	}

}
</script>

<style lang="scss">
.buss-container {
  height: 100%; padding: 15px 10px; box-sizing: border-box;
  overflow-y: auto; border-radius: 4px; background-color: #fff;
}
</style>

