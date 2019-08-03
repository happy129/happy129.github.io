<template>
  <div class="page-container noticeSlideShow">
    <div class="mt15">
      <a-form layout="inline">
        <a-form-item>
          <a-button v-permission="20228" type="primary" @click="addSlideShow">添加轮播</a-button>
        </a-form-item>
        <a-form-item label="名称">
          <a-input v-model="requestParams.bannerPage.name"/>
        </a-form-item>
        <date-range @change="changeDate"/>
        <a-form-item label="状态">
          <a-select defaultValue="1" v-model="requestParams.bannerPage.isEnabled">
            <a-select-option value>全部</a-select-option>
            <a-select-option value="1">启用</a-select-option>
            <a-select-option value="0">停用</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="bannerPage">搜索</a-button>
        </a-form-item>
      </a-form>
    </div>
    <div class="mt15">
      <a-table
      class="mytable" bordered 
        :columns="table.columns"
        @change="changeTablePagenation"
        :rowKey="e => e.id"
        :dataSource="table.tableData"
        :pagination="table.pagination"
      >
        <template slot="operate" slot-scope="text, record">
          <a-button v-permission="20229" type="primary" @click="updateBanner(record)" size="small">修改</a-button>
          <a-button v-permission="20230" type="primary" size="small" @click="deleteBanner(record)">删除</a-button>
          <a-button
            type="primary"
            @click="changeEnabled(record)"
            size="small"
            v-permission="20232"
            v-if="record.isEnabled==0"
          >启用</a-button>
          <a-button
            type="primary"
            @click="changeEnabled(record)"
            size="small"
            v-permission="20231"
            v-if="record.isEnabled==1"
          >停用</a-button>
        </template>

        <template slot="pcImgUrl" class="tablePcUrl" slot-scope="text, record">
          <a
            v-if="record.pcImageUrl"
            target="_blank"
            @click="showImageModal(record.pcImageUrl)"
          >点击预览</a>
        </template>

        <template slot="h5ImgUrl" class="tablePcUrl" slot-scope="text, record">
          <a
            v-if="record.h5ImageUrl"
            target="_blank"
            @click="showImageModal(record.h5ImageUrl)"
          >点击预览</a>
        </template>
        <template slot="appImgUrl" class="tablePcUrl" slot-scope="text, record">
          <a
            v-if="record.appImageUrl"
            target="_blank"
            @click="showImageModal(record.appImageUrl)"
          >点击预览</a>
        </template>

        <template slot="isEnabled" slot-scope="text, record">
          <span v-if="record.isEnabled == 1">启用</span>
          <span v-else>停用</span>
        </template>
        <template slot="type" slot-scope="text, record">
          <span v-show="record.type == 0">活动</span>
          <span v-show="record.type == 1">公告</span>
          <span v-show="record.type == 2">站内链接</span>
        </template>
      </a-table>
    </div>
    <!-- 弹窗 -->
    <a-modal
      :maskClosable="false" 
      :destroyOnClose="true"
      title="修改轮播图"
      class="modelForm"
      :visible="init.visible"
      @ok="submit()"
      @cancel="handleCancel"
    >
      <a-form :form="formEl" class="modelForm" layout="inline">
        <div class="mt15">
          <a-form-item label="名称">
            <a-input
              placeholder="输入名称"
              v-decorator="[ 'name', {rules: [{ required: true, message: '请输入名称' }]} ]"
            />
          </a-form-item>
        </div>
        <div>
          <a-form-item label="类型:">
            <a-radio-group v-decorator="['type']" @change="changeType">
              <a-radio :value="0">活动</a-radio>
              <a-radio :value="1">公告</a-radio>
            </a-radio-group>
          </a-form-item>
        </div>
        <div>
          <a-form-item label="跳转地址:" class="jump-url-box">
            <!-- 活动 -->
            <a-select  v-decorator="['targetId']" v-if="imgUrlType===0">
              <a-select-option :key="i" v-for="(v, i) of acList" :value="v.id">{{v.activityName}}</a-select-option>
            </a-select>

            <!-- 公告 -->
            <a-select v-decorator="['targetId']" v-if="imgUrlType===1">
              <a-select-option :key="i" v-for="(v, i) of anList" :value="v.id">{{v.title}}</a-select-option>
            </a-select>
          </a-form-item>
        </div>
        <div class="mt15">
          <a-form-item label="PC端图">
            <a-input placeholder="输入或者上传图片地址" v-model="requestParams.bannerAdd.pcImageUrl"/>
            <a-upload
              name="imageFile"
              :data="uploadData"
              :multiple="false"
              :showUploadList="false"
              action="/common-api/upload/uploadAdminImage"
              @change="uploadChange"
            >
              <a-button  :disabled="loading" :loading="loading">
                <a-icon type="upload"/>上传
              </a-button>
            </a-upload>
          </a-form-item>
        </div>
        <div class="mt15">
          <a-form-item label="H5端图">
            <a-input placeholder="输入或者上传图片地址" v-model="requestParams.bannerAdd.h5ImageUrl"/>
            <a-upload
              name="imageFile"
              :data="uploadData"
              :multiple="false"
              :showUploadList="false"
              action="/common-api/upload/uploadAdminImage"
              @change="uploadChangeH5"
            >
              <a-button :disabled="loading1" :loading="loading1">
                <a-icon type="upload"/>上传
              </a-button>
            </a-upload>
          </a-form-item>
        </div>
        <div class="mt15">
          <a-form-item label="APP端图">
            <a-input placeholder="输入或者上传图片地址" v-model="requestParams.bannerAdd.appImageUrl"/>
            <a-upload
              name="imageFile"
              :data="uploadData"
              :multiple="false"
              :showUploadList="false"
              action="/common-api/upload/uploadAdminImage"
              @change="uploadChangeApp"
            >
              <a-button  :disabled="loading2" :loading="loading2">
                <a-icon type="upload"/>上传
              </a-button>
            </a-upload>
          </a-form-item>
        </div>
        <div class="mt15">
          <a-form-item label="排序">
            <a-input-number
              placeholder="输入排序值"
              v-decorator="[ 'sortOrder', {rules: [{ required: true }]} ]"
            />
          </a-form-item>
        </div>
        <div class="mt15">
          <a-form-item label="发布时间">
            <a-date-picker
              format="YYYY-MM-DD HH:mm:ss"
              v-model="createTime"
              showTime
              :defaultValue="moment(requestParams.bannerAdd.createTime, 'YYYY-MM-DD HH:mm:ss')"
            />
          </a-form-item>
        </div>
      </a-form>
    </a-modal>

    <add-lun-b v-if="showAddLunB" @close="showAddLunB=false" @ok="ok" :acList="acList" :anList="anList"></add-lun-b>
  </div>
</template>

<script>
import Vue from "vue";
import { formatDate } from "@/util/date";
import { Modal, Notification as Notice } from "ant-design-vue";
import * as Api from "@api/notice";
import { activityList } from "@api/activity";
import DateRange from "@/components/date-range/DateRange";
import { getToken } from "@/util/auth";
import {
  Component,
  InjectComponents,
  Lifecycle,
  Computed
} from "vue-decorators";
import { close } from "fs";
import addLunB from "./AddLunB";
import moment from "moment";

Vue.component("aImage", {
  template: '<div class="modal-image-wrap"><img :src="src" /></div>',
  props: {
    src: {
      type: String,
      default: ""
    }
  }
});

@Component({ formOptions: "id" })
@InjectComponents({ DateRange, Modal, addLunB })
export default class NoticeSlideShow extends Vue {
  async ok() {
    await this.bannerPage();
  }
  moment(v) {
    return moment(v);
  }
  createTime = null;
  loading = false;
  loading1 = false;
  loading2 = false;
  acList = [];
  anList = [];
  changeType(e) {
    this.imgUrlType = e.target.value;
    if (e.target.value === 0) {
      this.formEl.setFieldsValue({'targetId': this.acList[0].id }, () => {});
    } else {
      this.formEl.setFieldsValue({'targetId': this.anList[0].id }, () => {});
    }
  }
  imgUrlType = 0;
  showImageModal(url) {
    Modal.info({
      title: "预览图像",
      content: <aImage src={url} />,
      onOk() {}
    });
  }
  init = { visible: false, record: {}, selectId: "" };
  // 是否停用-1:启用, 0:停用
  isEnabled = 1;
  uploadData = { token: getToken(), uploadTypeName: "banner" };
  fileList = [];
  // 接口请求参数
  requestParams = {
    bannerPage: {
      pageNo: 1,
      pageSize: 10,
      beginTime: "",
      endTime: "",
      isEnabled: "",
      name: ""
    },
    bannerAdd: {
      pcImageUrl: "",
      pcUrl: "",
      appImageUrl: "",
      appUrl: "",
      h5ImageUrl: "",
      h5Url: "",
      createTime: ""
    }
  };
  table = {
    tableData: [],
    columns: [
      { title: "名称", dataIndex: "name" },
      {
        title: "类型",
        dataIndex: "type",
        scopedSlots: { customRender: "type" }
      },
      { title: "PC图片", scopedSlots: { customRender: "pcImgUrl" } },
      { title: "H5图片", scopedSlots: { customRender: "h5ImgUrl" } },
      { title: "APP图片", scopedSlots: { customRender: "appImgUrl" } },
      { title: "发布时间", dataIndex: "createTime" },
      { title: "排序", dataIndex: "sortOrder" },
      { title: "状态", scopedSlots: { customRender: "isEnabled" } },
      {
        title: "操作",
        dataIndex: "money3",
        scopedSlots: { customRender: "operate" }
      }
    ],
    pagination: {
      total: 0,
      current: 1
    }
  };
  @Lifecycle async mounted() {
    await this.bannerPage();
  }
  @Lifecycle async activated() {
    this.formEl = this.$form.createForm(this);
    // 活动列表
    this.acList = (await activityList({
      pageNo: 1,
      pageSize: 999999999
    })).data?.body?.data?.records.map(item => {
      if (item.isShow === 0) {
        item.activityName = '[不显示] '+ item.activityName;
      }
      return item;
    });
    // 公告列表
    this.anList = (await Api.announcementPage({
      pageNo: 1,
      pageSize: 999999999
    })).data?.body?.data?.records.filter(item => { return item.isEnabled !== 0 });
  }
  @Lifecycle async created() {
    this.formEl = this.$form.createForm(this);
    // 活动列表
    this.acList = (await activityList({
      pageNo: 1,
      pageSize: 999999999
    })).data?.body?.data?.records.map(item => {
      if (item.isShow === 0) {
        item.activityName = '[不显示] '+ item.activityName;
      }
      return item;
    });
    // 公告列表
    this.anList = (await Api.announcementPage({
      pageNo: 1,
      pageSize: 999999999
    })).data?.body?.data?.records.filter(item => { return item.isEnabled !== 0 });
  }
  handleCancel(e) {
    this.init.visible = false;
  }
  changeDate(startTime, endTime) {
    this.requestParams.bannerPage.beginTime = startTime;
    this.requestParams.bannerPage.endTime = endTime;
  }

  uploadChange(info) {
    this.loading = true;
    if (info.file.status != "done") return;
    this.file = info.file;
    let res = info.file.response;
    this.loading = false;
    if (1 != res.body.code)
      return res.message && this.$message.error(res.message);
    this.requestParams.bannerAdd.pcImageUrl = res.body.data.imageUrl;
  }

  uploadChangeH5(info) {
    this.loading1 = true;
    if (info.file.status != "done") return;
    this.file = info.file;
    let res = info.file.response;
    this.loading1 = false;
    if (1 != res.body.code)
      return res.message && this.$message.error(res.message);
    this.requestParams.bannerAdd.h5ImageUrl = res.body.data.imageUrl;
  }

  uploadChangeApp(info) {
    this.loading2 = true;
    if (info.file.status != "done") return;
    this.file = info.file;
    let res = info.file.response;
    this.loading2 = false;
    if (1 != res.body.code)
    return res.message && this.$message.error(res.message);
    this.requestParams.bannerAdd.appImageUrl = res.body.data.imageUrl;
  }

  uploadImage() {

  }

  // 切换分页
  async changeTablePagenation(pagination) {
    this.table.pagination.current = pagination.current;
    this.requestParams.bannerPage.pageNo = pagination.current;
    await this.bannerPage();
  }
  
  showAddLunB = false;
  //添加轮播图
  addSlideShow() {
    this.showAddLunB = true;
  }

  //修改banner图
  updateBanner(record) {
    this.isEnabled = record.isEnabled;
    this.init.record = record;
    this.requestParams.bannerAdd = { ...record };
    this.init.isEdit = true;
    for (let [key, value] of Object.entries(record)) {
      this.formEl.getFieldDecorator(key, {
        initialValue: value
      });
		}
    this.init.selectId = record.id;
    this.init.visible = true;
    this.createTime = moment(this.requestParams.bannerAdd.createTime, "YYYY-MM-DD HH:mm:ss");
		this.imgUrlType=record.type;
	}

  // 删除
  deleteBanner(item) {
    Modal.confirm({
      content: "确定要删除选中的组别吗?",
      onOk: async () => {
        const { data: response } = await Api.bannerRemove({
          id: item.id
        });
        if (response?.body?.code === 1) {
          this.bannerPage();
        }
      }
    });
  }

  //修改状态
  async changeEnabled(record) {
    record.isEnabled = !record.isEnabled * 1;
    const { data: response } = await Api.bannerEdit(
      Object.assign(record)
    );
    if (response?.body?.code === 1) {
      await this.bannerPage();
    }
  }
  // 获取站内信列表
  async bannerPage() {
    const { data: response } = await Api.bannerPage(this.requestParams.bannerPage);
    if (
      response?.body?.code === 1 &&
      response?.body?.data?.records instanceof Array
    ) {
      this.table.tableData = response.body.data.records;
      this.table.pagination.total = response.body.data.totalCount;
    }
  }
  async submit(isEnabled = "") {
    this.formEl.validateFields(async (err, values) => {
      if (err) return;
      if (this.init.isEdit) {
        values.id = this.init.selectId;
        values.isEnabled = isEnabled;
      }

      let r = await this.$service.fetch("/config-admin-api/banner/editBanner", {
        ...this.requestParams.bannerAdd,
        createTime: moment(this.createTime).format("YYYY-MM-DD HH:mm:ss"),
        ...values
      });
      if (1 !== r.code) return r.message && this.$message.error(r.message);
      this.$message.success(r.message);

      await this.bannerPage();
      this.init.visible = false;
    });
  }
}
</script>
<style lang="scss" >
.tablePcUrl {
  width: 300px;
  text-overflow: ellipsis;
  overflow: hidden;
}
.ant-btn-primary {
  margin-right: 5px;
}
.noticeSlideShow {
  overflow: auto;
}
.modelForm {
  .ant-form-item-label {
    label {
      width: 80px;
      display: inline-block;
      text-align: right;
      margin-right: 10px;
    }
  }

  textarea {
    width: 300px;
  }
  input {
    width: 200px;
    margin-right: 10px;
  }
}
.modal-image-wrap /deep/{
  text-align: center;
  img {
    max-width: 100%;
  }
}
.url-box-2 {
  margin-top: -38px;
  padding: 0px;
  .url-title {
    width: 96px;
    display: inline-block;
    height: 32px;
    line-height: 32px;
    text-align: center;
    margin-right: 10px;
  }
  .ant-input {
    width: 230px;
  }
}
.jump-url-box /deep/ {
  .ant-select {
    width: 200px;
  }
}
</style>