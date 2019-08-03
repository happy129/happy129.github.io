<template>
  <section class="buss-container">
    <a-form layout="inline" :form="vform0" @submit.prevent="getList(true)">
      <a-form-item label="商户名称">
        <a-input v-decorator="['platformName']"/>
      </a-form-item>
      <a-form-item label="实例名称">
        <a-input v-decorator="['dbHost']"/>
      </a-form-item>
      <a-form-item label="当前状态">
        <a-select style="width:120px;" v-decorator="['status']"  :dropdownMatchSelectWidth="false">
          <a-select-option value>全部</a-select-option>
          <a-select-option v-for="(item, index) in dictionary.platformStatus" :key="index" :value="item.value">{{item.name}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" :loading="init.loading">查询</a-button>
      </a-form-item>
    </a-form>
    <div class="page-under-table">
      <a-table class="mytable" bordered :loading="init.loading" :columns="table.columns" :dataSource="table.dataSource" :rowKey="(e,i) => i" :pagination="table.pagination" @change="changePagination">
        <template slot="cpuCount" slot-scope="text, records">
          <span>{{records.cpuCount}}</span>
        </template>
        <template slot="status" slot-scope="text, records">
          <span>{{$getText(records.status, dictionary.platformStatus)}}</span>
        </template>
        <template slot="operate" slot-scope="text, records">
          <a-button type="primary" @click="getDetail(records.id)">修改</a-button>
        </template>
      </a-table>
    </div>

     <a-modal title="数据库信息" v-model="init.modalShow" :width="560" :footer="null" :destroyOnClose="true" :maskClosable="false" :bodyStyle="{'padding': '10px 15px'}">
      <a-form :form="vform1" class="myform">
        <a-form-item label="商户名称" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-input v-decorator="['platformName']"  disabled/>
        </a-form-item>
        <a-form-item label="实例名称" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-input v-decorator="['dbHost']" disabled/>
        </a-form-item>
        <a-form-item label="用户名" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-input v-decorator="['dbUserName']" />
        </a-form-item>
        <a-form-item label="密码" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-input v-decorator="['dbPassword']" />
        </a-form-item>
        <a-form-item label="端口" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-input v-decorator="['dbPort']" disabled/>
        </a-form-item>
        <a-form-item label="CPU" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-input v-decorator="['cpuCount']" addonAfter="核"/>
        </a-form-item>
        <a-form-item label="内存" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-input v-decorator="['memorySize']" addonAfter="G"/>
        </a-form-item>
        <a-form-item label="硬盘空间" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-input v-decorator="['hardDiskSize']" addonAfter="G"/>
        </a-form-item>
        <div class="page-under-table">
          <a-form-item label="Google验证码" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
            <a-input v-decorator="['googleCode', {rules: [{ required: true, message: '谷歌验证码不能为空'}]}]"/>
          </a-form-item>
        </div>
        <a-form-item>
           <a-row :gutter="8">
             <a-col :offset="5" :span="19">
               <a-button type="primary" @click="tryConnect">测试连接</a-button>&nbsp;
               <a-button type="primary" :disabled="init.isShowBtn" @click="submit">确认修改</a-button>&nbsp;
               <a-button @click="init.modalShow=false">取消</a-button>
             </a-col>
           </a-row>
        </a-form-item>
      </a-form>
    </a-modal>

  </section>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, Watch } from "vue-decorators";

@Component({ dictionary: 'plateformAuditStatus,plateformDbStatus,platformStatus', formOptions: {
  vform0: "id",
  vform1: "id"
}})
@InjectComponents({ })
export default class BussinessManage extends Vue {
  table = {
    columns: [
      { title: "商户名称", dataIndex: "platformName" },
      { title: "实例名称", dataIndex: "dbHost"},
      { title: "CPU", scopedSlots: { customRender: "cpuCount"}},
      { title: "内存", dataIndex: "memorySize" },
      { title: "硬盘空间", dataIndex: "hardDiskSize"},
      { title: "当前状态", scopedSlots: {customRender: "status"}},
      { title: "操作", dataIndex: "operate", scopedSlots: { customRender: "operate" } }
    ],
    dataSource: [],
    pagination: { total: 0, current: 1 }
  };

  init = {
    loading: false,
    modalShow: false,
    query: {
      pageNo: 1,
      pageSize: 10
    },
    isShowBtn: true
  };

  @Lifecycle mounted() {
    this.setInitialStatus();
    this.getList();
  }

  @Watch("init.modalShow") changeModal(news) {
    if (news == false) this.init.isShowBtn = true;
  }

   // 测试连接
  async tryConnect() {
    const form = await this.vform1.validate();
    if (form.errors) return;
    const res = await this.$service.fetch("/config-admin-api/opPlatformManager/checkDataSource", form.values);
    if (res.data == true) {
      this.$message.success("连接成功！");
      this.init.isShowBtn = false;
    } else {
      this.$message.error("连接失败，请确认数据源是否可用！");
      this.init.isShowBtn = true;
    }
  }

  setInitialStatus() {
    this.vform0.setValue('dbStatus', '');
    this.vform0.setValue('status', '');
  }

  changePagination(pagination) {
    this.table.pagination.current = pagination.current;
    this.init.query.pageNo = pagination.current;
    this.getList();
  }

  resetPagination() {
    this.table.pagination.current = 1;
    this.init.query.pageNo = 1;
  }

  editId = "";

  // 获取详情
  async getDetail(id) {
    this.init.modalShow = true;
    this.editId = id;
    const res = await this.$service.fetch("/config-admin-api/platformDatabaseInfo/getPlatformDatabaseInfoDetail", { id }); 
    if (res.data) {
      this.vform1.setValues(res.data, true);
    }
  }

  async submit() {
    const form = await this.vform1.validate();
    if (form.errors) return 
    if (!await this.$confirm({title: "确认要修改数据库吗？"})) return;
    const res = await this.$service.fetch("/config-admin-api/platformDatabaseInfo/editPlatformDatabaseInfo", {...form.values, id: this.editId });
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.getList();
    this.init.modalShow = false;
  }

  async getList(refresh) {
    if (refresh) this.resetPagination(); 

    const form = await this.vform0.validate();
    if (form.errors) return;

    const values = this.$trimValues(form.values);
    const params = Object.assign(this.init.query, values);

    this.init.loading = true;
    const res = await this.$service.fetch("/config-admin-api/platformDatabaseInfo/queryPagePlatformDatabaseInfo", params);
    this.init.loading = false;

    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data?.records instanceof Array) {
      this.table.dataSource = res.data.records;
      this.table.pagination.total = res.data?.totalCount;
    } else {
      this.table.dataSource = [];
      this.table.pagination.total = 0;
    }
  }
}
</script>

<style lang="scss" scoped>
.buss-container {
  height: 100%; padding: 15px 10px; box-sizing: border-box;
  overflow-y: auto; border-radius: 4px; background-color: #fff;
}
.logo-wrapper {
  width: 120px;
  text-align: center;
  img {
    max-width: 100%;
  }
}
.myform /deep/{
  .ant-form-item {
    margin-bottom: 6px;
  }
}
</style>

