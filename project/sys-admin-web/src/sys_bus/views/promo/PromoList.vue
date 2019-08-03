<template>
  <!--优惠列表-->
  <div class="page-container">
    <div class="promo-list-bd">
      <a-form layout="inline">
        <a-form-item label="活动标题">
          <a-input placeholder="活动标题" v-model.trim="table.activityListParams.activityName"/>
        </a-form-item>
        <a-form-item label="活动类型">
          <a-select defaultValue="table.activityListParams.activityTypeId" :dropdownMatchSelectWidth="false" v-model="table.activityListParams.activityTypeId" >
            <a-select-option :value="item.id" v-for="(item,i) in activityTypeIds" :key="i" >{{item.typeName}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <div>
            <a-button @click="()=>{ this.table.activityListParams.activityName=''; }" >重置</a-button>&nbsp;
            <a-button :loading="loading" type="primary" @click="getActivityList">查询</a-button>&nbsp;
            <a-button v-permission="20179" type="primary" @click="promoType='add';showPormotionDialog({title:'添加活动'});" >添加</a-button>&nbsp;
          </div>
        </a-form-item>
        <!-- <a-form-item>
              <a-button type='primary' @click="showDeleteConfirm">删除</a-button>
        </a-form-item>-->
      </a-form>
    </div>
    <div class="promo-list-bd page-under-table">
      <a-table
        :loading="loading" 
        @change="changeTablePagenation"
        :pagination="table.paginationParams"
        size="small"
        :columns="table.columns"
        :dataSource="table.dataSource"
        :rowKey="(r,i)=>i"
      >
        <template slot="operation" slot-scope="text,record,index">
          <a-button v-permission="20181" type="primary" size="small" :key="index" @click="promoType='edit';showPormotionDialog({title:'编辑活动',data:record})" >修改</a-button>&nbsp;
          <a-button v-permission="20180" type="danger" size="small" @click="showDeleteConfirm({data:record})">删除</a-button>
        </template>
        <!-- style="width:120px;overflow:hidden;white-space:nowrap" -->
        <div slot="pcSmallImgUrl" :title="record.pcSmallImgUrl" slot-scope="text, record">
          <a
            v-if="record.pcSmallImgUrl"
            target="_blank"
            @click="showImageModal(record.pcSmallImgUrl)"
          >点击预览</a>
        </div>
        <!-- {{`${record.pcSmallImgUrl.split('/')[record.pcSmallImgUrl.split('/').length-1]}`}} -->
        <div slot="h5SmallImgUrl" slot-scope="text, record">
          <a
            v-if="record.h5SmallImgUrl"
            target="_blank"
            @click="showImageModal(record.h5SmallImgUrl)"
          >点击预览</a>
        </div>
        <!-- {{`${record.pcBigImgUrl.split('/')[record.pcBigImgUrl.split('/').length-1]}`}} -->
        <div slot="appSmallImgUrl" :title="record.appSmallImgUrl" slot-scope="text, record">
          <a
            v-if="record.appSmallImgUrl"
            target="_blank"
            @click="showImageModal(record.appSmallImgUrl)"
          >点击预览</a>
        </div>
        <!-- {{`${record.appSmallImgUrl.split('/')[record.appSmallImgUrl.split('/').length-1]}`}} -->
        <div slot="appBigImgUrl" :title="record.appBigImgUrl" slot-scope="text, record">
          <a
            v-if="record.appBigImgUrl"
            target="_blank"
            @click="showImageModal(record.appBigImgUrl)"
          >点击预览</a>
        </div>
        <!-- {{`${record.appBigImgUrl.split('/')[record.appBigImgUrl.split('/').length-1]}`}} -->
      </a-table>
    </div>
    <!-- 添加优惠活动弹窗 -->
    <a-modal :title="modal.title" @ok="activityOk({title:modal.title})" :maskClosable="false" :destroyOnClose="true" v-model="modal.showModal" :centered="true" :confirmLoading="modal.confirmLoading" :width="800" >
      <PromoAdd :id="modal.id" ref="promoAdd" :type="modal.title" :activityTypeIds="activityTypeIds" :editContent="editContent" :promoType="promoType"/>
    </a-modal>
  </div>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, Computed } from "vue-decorators";
import PromoAdd from "./list/PromoAdd";
import * as Api from "@api/activity";
import { Modal } from "ant-design-vue";
import { Promise } from "q";

Vue.component("aImage", {
  template: '<div class="modal-image-wrap"><img :src="src" /></div>',
  props: { src: {type: String, default: ""} }
});

@Component()
@InjectComponents({ PromoAdd })
export default class PromoList extends Vue {
  // 表格
  activityTypeIds = [];
  promoType = "add";
  loading = false;
  table = {
    /* 请求列表参数 */
    activityListParams: {
      activityName: "",
      activityTypeId: "",
      pageNo: 1,
      pageSize: 10
    },
    paginationParams: {
      pageNo: 1,
      total: 0
    },
    rowSelection: {},
    dataSource: [],
    columns: [
      { title: "ID", dataIndex: "id" },
      { title: "活动类型", dataIndex: "activityTypeName" },
      { title: "活动标题", dataIndex: "activityName" },
      {
        title: "PC小图",
        dataIndex: "pcSmallImgUrl",
        scopedSlots: { customRender: "pcSmallImgUrl" }
      },
      {
        title: "H5小图",
        scopedSlots: { customRender: "h5SmallImgUrl" }
      },
      {
        title: "APP小图",
        scopedSlots: { customRender: "appSmallImgUrl" }
      },
      { title: "发布时间", dataIndex: "createTime" },
      { title: "有效期", dataIndex: "endTime" },
      { title: "是否显示", dataIndex: "_isShow" },
      { title: "排序", dataIndex: "sortOrder" },
      { title: "使用端", dataIndex: "_clientType" },
      { title: "状态", dataIndex: "_isEnabled" },
      {
        title: "操作",
        dataIndex: "operation",
        scopedSlots: { customRender: "operation" }
      }
    ]
  };
  // 富文本回填
  editContent = "";

  // 弹窗里面用到的数据
  modal = {
    title: "",
    showModal: false,
    confirmLoading: false,
    id: ""
  };

  showDeleteConfirm({ data }) {
    Modal.confirm({
      title: "删除警告",
      content: "你确定要删除选中的数据?",
      okText: "确定",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        let { data: req } = await Api.activityRemove({ id: data.id });
        if (req?.body?.code === 1) {
          this.getActivityList();
          return false;
        }
      },
      onCancel: () => {
        return false;
      }
    });
  }
  /* 预览图片 */

  showImageModal(url) {
    Modal.info({
      title: "预览图像",
      content: <aImage src={url} />,
      onOk() {}
    });
  }

  /* 获取活动列表 */
  async getActivityList() {
    this.loading = true;
    let { data: req } = await Api.activityList(this.table.activityListParams);
    this.loading = false;
    if (req?.body?.code === 1 && req?.body?.data) {
      let isEnableds = { 0: "关闭", 1: "开启" };
      let isShows = { 0: "不显示", 1: "显示" };
      let clientTypes = {
        "-1": "通用",
        0: "APP",
        1: "android",
        2: "IOS",
        3: "H5",
        4: "PC端"
      };
      this.table.dataSource =
        req.body.data.records &&
        req.body.data.records.map((item, i) => {
          item._isEnabled = isEnableds[item.isEnabled];
          item._clientType = clientTypes[item.clientType];
          item._isShow = isShows[item.isShow];
          return item;
        });
      this.table.paginationParams.total = req.body.data.totalCount;
    }
  }

  /* 添加活动 */
  async activityOk(obj) {
    if (obj.title == "添加活动") {
      let { data: req } = await Api.activityAdd(this.$refs.promoAdd.form);
      if (req?.body?.code === 1) {
        this.modal.showModal = false;
        this.getActivityList();
      }
    }
    if (obj.title == "编辑活动") {
      let { data: req } = await Api.activityEdit(this.$refs.promoAdd.form);
      if (req?.body?.code === 1) {
        this.modal.showModal = false;
        this.getActivityList();
      }
    }
  }
  // 切换分页
  changeTablePagenation(pagination) {
    this.table.paginationParams.pageNo = pagination.current;
    this.table.activityListParams.pageNo = pagination.current;
    this.getActivityList();
  }

  delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }
  /* 公共显示modal */
  async showPormotionDialog(obj) {
    this.modal.title = obj.title;
    this.modal.showModal = true;
    this.modal.id = obj?.data?.id;
  }
  
  /* 获取活动类型列表 */
  async getActivityTypeList() {
    let { data: req } = await Api.activityTypeList({});
    if (req?.body?.code === 1 && req?.body?.data) {
      this.activityTypeIds = req.body.data;
      this.activityTypeIds.unshift({ id: "", typeName: "全部" });
    }
  }

  @Lifecycle() mounted() {
    this.getActivityTypeList();
    this.getActivityList();
  }
}
</script>
<style lang="scss">
.modal-image-wrap /deep/ {
  text-align: center;
  img {
    max-width: 100%;
  }
}
</style>