<template>
  <section class="buss-container">
    <a-form layout="inline" :form="formElement">
      <a-form-item label="商户名">
        <a-input v-decorator="['platformName', { initialValue: ''}]"/>
      </a-form-item>
      <a-form-item label="商户ID">
        <a-input v-decorator="['id', { initialValue: ''}]"/>
      </a-form-item>
      <a-form-item label="商户标识">
        <a-input v-decorator="['platformCode', { initialValue: ''}]"/>
      </a-form-item>
      <a-form-item label="推广模式">
        <a-select v-decorator="['promotionType', { initialValue: ''}]" @change="changeSelection">
          <a-select-option value='' :dropdownMatchSelectWidth="false">全部</a-select-option>
          <a-select-option v-for="(item, index) in dictionary.promotionType" :key="index" :value="item.value">{{item.name}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="佣金模式">
        <a-select v-decorator="['commissonModeId', { initialValue: ''}]" :dropdownMatchSelectWidth="false"  @change="changeSelection">
          <a-select-option value="">全部</a-select-option>
          <a-select-option v-for="(item, index) in init.commissionModes" :key="index" :value="item.id">{{item.commissonModeName}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="平台状态">
        <a-select v-decorator="['status', { initialValue: '1'}]"  :dropdownMatchSelectWidth="false"  @change="changeSelection">
          <a-select-option value>全部</a-select-option>
          <a-select-option v-for="(item, index) in dictionary.platformStatus" :key="index" :value="item.value">{{item.name}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" @click="getTableList(true)" :loading="init.loading">查询</a-button>
      </a-form-item>
      <a-form-item v-permission="10003">
        <a-button  @click="init.ModalShow = true; init.modalType = 'add';">添加</a-button>
      </a-form-item>
    </a-form>
    <div class="page-under-table">
      <a-table class="mytable" bordered :loading="init.loading" :columns="table.columns" :dataSource="table.dataSource" :rowKey="e => e.id" :pagination="table.pagination" @change="changeTablePagenation">
        <template slot="promotionType" slot-scope="text, records">
          <span v-if="dictionary.promotionType">{{getText(records.promotionType, dictionary.promotionType)}}</span>
        </template>
        <template slot="logo" slot-scope="text, records">
          <div class="logo-wrapper">
            <span v-if="!records.logoUrl.startsWith('http')">{{records.logoUrl}}</span>
            <img :src="records.logoUrl" v-else/>
          </div>
        </template>
        <template slot="commissonModeId" slot-scope="text, records">
          <span>{{getCommissionName(records.commissonModeId)}}</span>
        </template>
        <!--审核状态-->
        <template slot="auditStatus" slot-scope="text, records">
          <span :class="[records.auditStatus==-1 ? 'g-purple' : records.auditStatus==1 ? 'g-green' : '']">{{getText(records.auditStatus, dictionary.plateformAuditStatus)}}</span>
        </template>
        <!--数据库状态-->
        <template slot="dbStatus" slot-scope="text, records">
          <span>{{getText(records.dbStatus, dictionary.plateformDbStatus)}}</span>
        </template>
        <!--平台状态-->
        <template slot="status" slot-scope="text, records">
          <span  :class="[records.status==1 ? 'g-green' : records.status==-1 ? 'g-red' : '']">{{getText(records.status, dictionary.platformStatus)}}</span>
        </template>
        <template slot="operate" slot-scope="text, records">
          <div class="wrapper-operate">
            <a-button class="common-green-btn" v-permission="10004" @click="getDetail(records.id)">查看详情</a-button>
            <!--只有待审核状态才能进行审核-->
            <a-button class="common-purple-btn" v-permission="100012" @click="showAudit(records)" v-if="records.auditStatus==-1">审核</a-button>&nbsp;
            <!-- 只有在维护中或者正常状态下, 并且数据库的状态是已初始化， 审核状态为已审核 才展示更改状态-->
            <a-button class="common-yellow-btn" v-permission="100011" @click="showUpdateModal(records)" v-if="(records.status==-1 || records.status==1) && records.dbStatus == 7 && records.auditStatus == 1">更改状态</a-button>&nbsp;
            <!-- 只有在维护升级的时候才可已停用平台 -->
            <a-button class="common-red-btn" v-permission="100013" @click="stopPlatform(records)" v-if="records.status==-1 && records.dbStatus == 7 && records.auditStatus == 1">停用平台</a-button>&nbsp;
            <!-- 只有在审核不通过的的情况下才展示删除平台-->
            <a-button class="common-red-btn" @click="deletePlatform(records)" v-if="records.auditStatus==0">删除平台</a-button>
          </div>
        </template>
      </a-table>
    </div>

    <a-modal title="会员详情" v-model="init.ModalShow" :width="800" :footer="null" :destroyOnClose="true" :maskClosable="false" :bodyStyle="{'padding': '15px'}" >
      <bussiness-add :type="init.modalType" :userId="init.userId" @close="closeCallback"></bussiness-add>
    </a-modal>

    <a-modal title="更改状态" v-model="init.isShowUpdateStatus" :destroyOnClose="true" :maskClosable="false" @ok="updateServerStatus">
      <a-form :form="vform1" class="status-form">
        <a-form-item label="维护状态" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
          <a-radio-group v-decorator="['status', {rules: [{ required: true, message: '请选择维护状态' }]}]">
              <a-radio value="1">正常运行</a-radio>
              <a-radio class="g-red" value="-1">维护升级</a-radio>
            </a-radio-group>
        </a-form-item>
        <a-form-item label="Google验证码" :label-col="{ span: 6 }" :wrapper-col="{ span: 10 }">
          <a-input v-decorator="['googleCode', {rules: [{ required: true, message: '请输入google验证码' }]}]"/>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal title="停用平台" v-model="init.isShowStopPlatform" :destroyOnClose="true" :maskClosable="false" @ok="stopPlatformAction">
      <p class="text-center"><strong>停用平台后不可重新启用，确认停用平台？</strong></p>
      <a-form :form="vform2" class="status-form mt15">
          <a-form-item label="输入确认" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
            <a-input placeholder="请输入“停用平台”" v-decorator="['stopValue', {rules: [{ required: true, message: '请输入“停用平台”', validator: validatorCallback}]}]"/>
          </a-form-item>
          <a-form-item label="Google验证码" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
            <a-input v-decorator="['googleCode', {rules: [{ required: true, message: '请输入google验证码' }]}]"/>
          </a-form-item>
      </a-form>
    </a-modal>

    <a-modal title="删除平台" v-model="init.isShowDeletePlatform" :destroyOnClose="true" :maskClosable="false" @ok="deletePlatformAction">
      <p class="text-center"><strong>删除平台后将不再展示，确认删除？</strong></p>
      <a-form :form="vform3" class="status-form mt15">
          <a-form-item label="输入确认" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
            <a-input placeholder="请输入“删除平台”" v-decorator="['stopValue', {rules: [{ required: true, message: '请输入“删除平台”', validator: validatorDeleteCallback}]}]"/>
          </a-form-item>
          <a-form-item label="Google验证码" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
            <a-input v-decorator="['googleCode', {rules: [{ required: true, message: '请输入google验证码' }]}]"/>
          </a-form-item>
      </a-form>
    </a-modal>


    <a-modal title="审核" v-model="init.isShowAudit" :destroyOnClose="true" :maskClosable="false" @ok="auditPlatformAction">
      <a-form :form="vform4" class="status-form">
          <a-form-item label="审核" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
            <a-radio-group v-decorator="['auditStatus', {rules: [{ required: true, message: '请选择审核状态' }]}]">
              <a-radio value="1">审核通过</a-radio>
              <a-radio class="g-red" value="0">审核不通过</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="审核备注" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
            <a-input v-decorator="['auditRemark', {rules: [{ required: true, message: '请输入审核备注' }]}]"/>
          </a-form-item>
          <a-form-item label="Google验证码" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
            <a-input v-decorator="['googleCode', {rules: [{ required: true, message: '请输入google验证码' }]}]"/>
          </a-form-item>
      </a-form>
    </a-modal>


  </section>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, Watch } from "vue-decorators";
import BussinessAdd from "./BussinessAdd";
import { getBusManageList } from "@api/bussiness";

const dictionary = 'promotionType,maintainStatus,commissonComputeMode,plateformServerStatus,plateformAuditStatus,platformStatus,plateformDbStatus';
const formOptions = {
  vform1: "id",
  vform2: "id",
  vform3: "id",
  vform4: "id"
};
@Component({ dictionary, formOptions })
@InjectComponents({ BussinessAdd })
export default class BussinessManage extends Vue {
  table = {
    columns: [
      { title: "商户ID", dataIndex: "id" },
      { title: "商户logo", dataIndex: "logoUrl", scopedSlots: {customRender: "logo"} },
      { title: "商户标识", dataIndex: "platformCode" },
      { title: "商户名称", dataIndex: "platformName" },
      { title: "推广模式", dataIndex: "promotionType", scopedSlots: { customRender: "promotionType" } },
      { title: "佣金模式", dataIndex: "commissonModeId", scopedSlots: { customRender: "commissonModeId" } },
      { title: "创建人", dataIndex: "createAdminName"},
      { title: "创建时间", dataIndex: "createTime" },
      { title: "审核状态", scopedSlots: { customRender: 'auditStatus'}},
      { title: "数据库状态", scopedSlots: { customRender: "dbStatus" } },
      { title: "平台状态", scopedSlots: { customRender: "status" } },
      {
        title: "操作",
        dataIndex: "operate",
        scopedSlots: { customRender: "operate" }
      }
    ],
    dataSource: [],
    pagination: { total: 0, current: 1 }
  };

  requestParams = {
    getAllUserGroup: { pageNo: 1, pageSize: 10 }
  };

  init = {
    //是否展示审核
    isShowAudit: false,
    // 是否展示删除平台
    isShowDeletePlatform: false,
    // 是否展示停用平台弹窗
    isShowStopPlatform: false,
    // 是否展示更改状态弹窗
    isShowUpdateStatus: false,
    ModalShow: false,
    ModalTitle: ["添加商户", "修改商户信息"],
    ModalTitleIndex: 0,
    confirmLoading: false,
    tips: ["提示"],
    pagination: {
      pageNo: 1,
      pageSize: 10
    },
    modalType: 'add',
    userId: '',
    loading: false,
    // 获取佣金列表
    commissionModes: [],
    // 平台状态
    platformStatus: ""
  };

  form = {};

  @Lifecycle created() {
    this.formElement = this.$form.createForm(this);
  }

  @Lifecycle mounted() {
    this.getCommissionMode();
    this.getTableList();
  }

  validatorCallback(rule, value, callback) {
    if (!value || (value && value.replace(/\s+/g, '') !== "停用平台")) {
      return callback('请输入“停用平台”四个字');
    }
    callback() 
  }

  validatorDeleteCallback(rule, value, callback) {
    if (!value || (value && value.replace(/\s+/g, '') !== "删除平台")) {
      return callback('请输入“删除平台”四个字');
    }
    callback() 
  }

  // 展示审核弹窗
  showAudit(record) {
    this.init.isShowAudit = true;
    this.init.userId = record.id;
  }

  // 审核平台
  async auditPlatformAction() {
    const form = await this.vform4.validate();
    if (form.errors) return
    if (!await this.$confirm({title: "确认进行审核?"})) return 
    const res = await this.$service.fetch("/config-admin-api/platform/auditPlatform", Object.assign(form.values, {
      id: this.init.userId
    }));
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.init.isShowAudit = false;
    this.getTableList(true);
  }

  deletePlatform(record) {
    this.init.isShowDeletePlatform = true;
    this.init.userId = record.id;
    this.init.platformStatus = record.status;
  }

  async deletePlatformAction() {
    const form = await this.vform3.validate();
    if (form.errors) return;

    if (!await this.$confirm({title: "确认删除平台?"})) return;

    const res = await this.$service.fetch("/config-admin-api/platform/removePlatformById", {
      googleCode: form.values.googleCode,
      id: this.init.userId
    });
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.init.isShowDeletePlatform = false;
    this.getTableList(true);
  }

  // 停用平台
  stopPlatform(record) {
    this.init.isShowStopPlatform = true;
    this.init.userId = record.id;
    this.init.platformStatus = record.status;
  }

  // 停用平台
  async stopPlatformAction() {
    const form = await this.vform2.validate();
    if (form.errors) return;

    if (!await this.$confirm({title: "确认停用平台?"})) return ;
    //if (form.values.stopValue) delete from.values.stopValue;
    const res = await this.$service.fetch("/config-admin-api/platform/editPlatformStatus", {
      googleCode: form.values.googleCode,
      id: this.init.userId,
      status: 0
    });
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.init.isShowStopPlatform = false;
    this.getTableList(true);
  }

  showUpdateModal(records) {
    this.init.isShowUpdateStatus= true;
    this.init.userId=records.id;
    this.vform1.setValue("status", records.status);
  }

  // 更改状态
  async updateServerStatus() {
    const form = await this.vform1.validate();
    if (form.errors) return;
    const res = await this.$service.fetch("/config-admin-api/platform/editPlatformStatus", Object.assign(form.values, {
      id: this.init.userId
    }));
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.init.isShowUpdateStatus = false;
    this.getTableList(true);
  }

  closeCallback(type) {
    this.init.ModalShow = false;
    if (!type) return;
    this.getTableList(type)
  }

  // 改变输入框， 初始化分页查询条件
  changeSelection() {
    this.init.pagination.pageNo = 1;
    this.table.pagination.current = 1;
  }

  changeTablePagenation(pagination) {
    this.table.pagination.current = pagination.current;
    this.init.pagination.pageNo = pagination.current;
    this.getTableList();
  }

  // 获取佣金名称
  getCommissionName(id) {
    if (this.init.commissionModes.length > 0) {
      return this.init.commissionModes.find(item => item.id == id)?.commissonModeName;
    }
    return "";
  }

  getText(id, array) {
    return array.find(item => item.value == id)?.name
  }

  getDetail(id) {
    this.init.userId = id;
    this.init.ModalShow = true;
    this.init.modalType = 'update';
  }

  // 获取佣金模式
  async getCommissionMode() {
    const res = await this.$service.fetch("/config-admin-api/platformCommissonMode/queryAllPlatformCommissonMode");
    if (res.code !== 1) res.message && this.$message.error(res.message);
    if (res.data instanceof Array) {
      this.init.commissionModes = res.data;
    }
  }

  getTableList(type) {
    if (type) {
      this.changeSelection();
    }
    this.formElement.validateFields(async (err, values) => {
      if (!err) {
        this.init.loading = true;
        const { data: res } = await getBusManageList(Object.assign(values, this.init.pagination));
        if (res?.body?.code === 1 && res?.body?.data?.records) {
          this.table.dataSource = res.body.data.records;
          this.table.pagination.total = res.body.data?.totalCount;
        }
        this.init.loading = false;
      }
    });
  }
}
</script>

<style lang="scss" scoped>
.buss-container {
  height: 100%; padding: 15px 10px; box-sizing: border-box;
  overflow-y: auto; border-radius: 4px; background-color: #fff;
}
.logo-wrapper {
  width: 60px;
  text-align: center;
  img {
    max-width: 100%;
  }
}
.status-form /deep/{
  .ant-form-item {
    margin-bottom: 10px;
  }
}
.wrapper-operate {
  font-size: 0;
  button {
    margin-right: 5px;
  }
}
</style>

