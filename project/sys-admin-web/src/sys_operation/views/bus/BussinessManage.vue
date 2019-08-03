<template>
  <section class="buss-container">
    <a-form layout="inline" :form="vform0" @submit.prevent="getList(true)">
      <a-form-item label="商户名称">
        <a-input v-decorator="['platformName']"/>
      </a-form-item>
      <a-form-item label="商户ID">
        <a-input v-decorator="['platformId']"/>
      </a-form-item>
      <a-form-item label="商户编码">
        <a-input v-decorator="['platformCode']"/>
      </a-form-item>
      <a-form-item label="数据库状态">
        <a-select style="width:140px;" v-decorator="['dbStatus']" :dropdownMatchSelectWidth="false">
          <a-select-option value=''>全部</a-select-option>
          <a-select-option v-for="(item, index) in dictionary.plateformDbStatus" :key="index" :value="item.value">{{item.name}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="平台状态">
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
      <a-table class="mytable" bordered :loading="init.loading" :columns="table.columns" :dataSource="table.dataSource" :rowKey="(e, i) => i" :pagination="table.pagination" @change="changePagination">
        <template slot="dbStatus" slot-scope="text, records">
          <span :class="[ records.dbStatus == 3 ||  records.dbStatus == 6 ? 'g-red' : 'g-blue',  records.dbStatus == 7 ? 'g-green' : '', 'bold']">{{$getText(records.dbStatus, dictionary.plateformDbStatus)}}</span>
        </template>
        <template slot="status" slot-scope="text, records">
          <span>{{$getText(records.status, dictionary.platformStatus)}}</span>
        </template>
        <template slot="operate" slot-scope="text, records">
          <a-button class="operation1" @click="init.title='分配数据库';getDetail(records.id)" v-if="records.dbStatus == 1">分配数据库</a-button>
          <a-button class="operation2" @click="init.title='重新分配数据库';getDetail(records.id)" v-else-if="records.dbStatus == 3">重新分配</a-button>
          <a-button class="operation2" @click="init.title='初始化数据库';getDetail(records.id)" v-else-if="records.dbStatus == 4">初始化数据库</a-button>
          <a-button class="operation2" @click="init.title='重新初始化';getDetail(records.id)" v-else-if="records.dbStatus == 6">重新初始化</a-button>
          <a-button class="operation3" v-else type="primary" @click="init.title='数据库已可用';getDetail(records.id)">查看详情</a-button>
        </template>
      </a-table>
    </div>

    <a-modal :title="init.title" v-model="init.modalShow" :width="560" :footer="null" :destroyOnClose="true" :maskClosable="false" :bodyStyle="{'padding': '10px 15px'}">
      <a-form :form="vform1" class="myform">
        <a-form-item label="商户名称" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-input v-decorator="['platformName']"  disabled/>
        </a-form-item>
        <a-form-item label="商户ID" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-input v-decorator="['platformId']" disabled/>
        </a-form-item>
        <a-form-item label="商户编码" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-input v-decorator="['platformCode']" disabled/>
        </a-form-item>
        <a-form-item label="数据库状态" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-input v-decorator="['dbStatus']" disabled/>
        </a-form-item>
        <a-form-item label="平台状态" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-input v-decorator="['status']"  disabled/>
        </a-form-item>
        <div class="page-under-table">
          <h4 class="form-title">数据库信息</h4>
        </div>
        <a-form-item label="实例名称" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-input v-decorator="['dbHost', { rules: [{required: true, message: '实例名称不能为空'}] }]"  :disabled="form.dbStatus!=1&&form.dbStatus!=3"/>
        </a-form-item>
        <a-form-item label="用户名" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-input v-decorator="['dbUserName', { rules: [{required: true, message: '用户名不能为空'}] }]" :disabled="form.dbStatus!=1&&form.dbStatus!=3"/>
        </a-form-item>
        <a-form-item label="密码" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-input v-decorator="['dbPassword', { rules: [{required: true, message: '密码不能为空'}] }]" :disabled="form.dbStatus!=1&&form.dbStatus!=3"/>
        </a-form-item>
        <a-form-item label="端口" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-input v-decorator="['dbPort', { rules: [{required: true, message: '端口号不能为空'}] }]" :disabled="form.dbStatus!=1&&form.dbStatus!=3"/>
        </a-form-item>
        <a-form-item label="CPU" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-input v-number v-decorator="['cpuCount', { rules: [{required: true, message: 'CPU个数不能为空'}] }]" :disabled="form.dbStatus!=1&&form.dbStatus!=3" addonAfter="核"/>
        </a-form-item>
        <a-form-item label="内存" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-input v-number v-decorator="['memorySize', { rules: [{required: true, message: '内存空间不能为空'}] }]" :disabled="form.dbStatus!=1&&form.dbStatus!=3"  addonAfter="G"/>
        </a-form-item>
        <a-form-item label="硬盘空间" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-input v-number v-decorator="['hardDiskSize', { rules: [{required: true, message: '磁盘空间不能为空'}] }]" :disabled="form.dbStatus!=1&&form.dbStatus!=3"  addonAfter="G"/>
        </a-form-item>
        <div class="page-under-table" v-if="form.dbStatus==1||form.dbStatus==3||form.dbStatus==4||form.dbStatus==6">
          <a-form-item label="Google验证码" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
            <!-- <a-input v-decorator="['googleCode', { rules: [{required: true, message: '请输入google验证码'}] }]" :disabled="form.dbStatus!=1"/> -->
            <a-input v-decorator="['googleCode', { rules: [{required: true, message: '请输入google验证码'}] }]"/>
          </a-form-item>
        </div>
         <a-form-item>
          <a-row :gutter="8" v-if="form.dbStatus==1||form.dbStatus==3">
            <a-col :offset="5" :span="18"> 
              <a-button type="primary" @click="tryConnect">测试连接</a-button>&nbsp;
              <a-button type="primary" @click="distributeDataBase" :disabled="init.isShowBtn">确认分配</a-button>&nbsp;
              <a-button @click="init.modalShow=false">取消</a-button>
            </a-col>
          </a-row>
          <a-row :gutter="8" v-else-if="form.dbStatus==4||form.dbStatus==6">
            <a-col :offset="5" :span="5"> <a-button type="primary" @click="configurationDataBase">确认初始化</a-button> </a-col>
            <a-col :span="7"> <a-button @click="init.modalShow=false">取消</a-button> </a-col>
          </a-row>
          <a-row :gutter="8" v-else>
            <a-col :span="7" :offset="5"> <a-button @click="init.modalShow=false">关闭</a-button></a-col>
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
      { title: "商户ID", dataIndex: "id"},
      { title: "商户编码", dataIndex: "platformCode" },
      { title: "审核人", dataIndex: "auditAdminName" },
      { title: "审核时间", dataIndex: "auditTime"},
      { title: "审核备注", dataIndex: "auditRemark"},
      { title: "处理人", dataIndex: "dbAdminName" },
      { title: "处理时间", dataIndex: "dbOperateTime"},
      { title: "数据库状态", scopedSlots: { customRender: "dbStatus"} },
      { title: "平台状态", scopedSlots: { customRender: "status"}},
      { title: "操作", dataIndex: "operate", scopedSlots: { customRender: "operate" }}
    ],
    dataSource: [],
    pagination: { total: 0, current: 1 }
  };

  init = {
    loading: false,
    modalShow: false,
    title: "分配数据库",
    query: {
      pageNo: 1,
      pageSize: 10
    },
    // 是否展示
    isShowBtn: true
  };
  // 保存详情中的状态
  form = {};
  timer = null;
  
  @Watch("init.modalShow") changeModal(news) {
    if (news == false) this.init.isShowBtn = true;
  }

  @Lifecycle mounted() {
    this.setInitialStatus();
    this.getList();

    this.timer = setInterval(()=> {
      this.getList(false, true);
    }, 5000);
  }

  @Lifecycle beforeDestroy() {
    clearInterval(this.timer);
  }

  @Lifecycle deactivated() {
    clearInterval(this.timer);
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

  // 获取数据库详情
  async getDetail(id) {
    this.init.modalShow = true;
    const res = await this.$service.fetch("/config-admin-api/opPlatformManager/getPlatformDetail", {platformId: id});
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.form = res.data;
    this.vform1.setValues({...res.data}, true, "dbStatus,status");
    const dbtext = this.$getText(res.data?.dbStatus, this.dictionary.plateformDbStatus);
    this.vform1.setValue("dbStatus", dbtext);
    this.vform1.setValue("status", this.$getText(res.data?.status, this.dictionary.platformStatus))
  }

  // 分配数据库
  async distributeDataBase() {
    const form = await this.vform1.validate();
    if (form.errors) return ;
    if (!await this.$confirm({title: "确认分配数据库？"})) return;
    const res = await this.$service.fetch('/config-admin-api/opPlatformManager/assignDatabase', form.values);
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.init.modalShow = false;
    this.getList();
  }

  // 初始化数据库
  async configurationDataBase() {
    const form = await this.vform1.validate();
    if (form.errors) return ;
    if (!await this.$confirm({title: "确认初始化数据？"})) return;
    const res = await this.$service.fetch("/config-admin-api/opPlatformManager/initPlatformData", {
      googleCode: form.values.googleCode,
      platformId: this.form.platformId
    });
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.init.modalShow = false;
    this.getList();
  }

  resetPagination() {
    this.table.pagination.current = 1;
    this.init.query.pageNo = 1;
  }

  // 获取列表
  async getList(refresh, cancelLoading) {
    if (refresh) this.resetPagination(); 

    const form = await this.vform0.validate();
    if (form.errors) return;

    const values = this.$trimValues(form.values);
    const params = Object.assign(this.init.query, values);

    if (!cancelLoading) this.init.loading = true;
    const res = await this.$service.fetch("/config-admin-api/opPlatformManager/queryPagePlatform", params);
    if (!cancelLoading) this.init.loading = false;

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
.operation1 {
  border-color: #ff9900; 
  background-color: #ff9900;
  color: #fff;
  &:hover {
   color: #ff9900;
   background-color: #fff;
  }
}
.operation2 {
  border-color: #dd5a43;
  background-color: #dd5a43;
  color: #fff;
  &:hover {
   color: #dd5a43;
   background-color: #fff;
  }
}
.operation3 {
  &:hover {
   color: #009688;
   background-color: #fff;
  }
}

.myform /deep/ {
  .ant-form-item {
    margin-bottom: 6px;
  }
  .form-title {
    font-weight: bold;
    color: #666;
    font-size: 18px;
    margin-bottom: 15px;
  }
}
</style>

