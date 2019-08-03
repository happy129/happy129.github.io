<template>
  <div class="update-info">
    <a-table :columns="table.columns" :dataSource="table.dataSource" :rowKey="(e, i) => i" size="small" :pagination="false">
      <span slot="sort" slot-scope="text, record, index">{{index}}</span>
      <template slot="isPopPrompt" slot-scope="text, record">
        {{ record.isPopPrompt == 1 ? '是' : '否' }}
      </template>
      <template slot="isVersionPrompt" slot-scope="text, record">
        {{ record.isVersionPrompt == 1 ? '是' : '否' }}
      </template>
      <template slot="isForceUpdate" slot-scope="text, record">
        {{ record.isForceUpdate == 1 ? '是' : '否' }}
      </template>
      <p class="update-content" slot="updateContent" slot-scope="text, record">
        <span :title="`${record.updateContent}`">{{record.updateContent}}</span>
      </p>
      <template slot="operation" slot-scope="text, record">
        <a-button v-permission="10088" @click="showPoump(record)" size="small" type="primary">版本更新</a-button>
      </template>
    </a-table>

    <a-modal title="版本更新" v-model="showModel" :confirmLoading="confirmLoading" @ok="doUpdateVersion" :width="600">
      <a-form class="myform-update" layout="inline" :form="vform">
        <a-row :gutter="8">
          <a-col :span="12">
            <span class="label120">商户名：</span>
            <span>{{platformName}}</span>
          </a-col>
          <a-col :span="12">
            <span class="label120">版本号：</span>
            <span>{{appCurrentVersion}}</span>
          </a-col>
        </a-row>
        <div class="m7 mt10">
          <a-form-item label="更新范围(用户ID)">
            <a-button @click="selectAll">全选</a-button>
          </a-form-item>
        </div>
        <div class="m8 mt10" :key="form.key">
          <a-form-item>
            <a-checkbox-group v-decorator="['updateRange']" @change="changeCheckBox">
              <a-checkbox v-for="(item, index) in init.num" :value="item" :key="index">尾数{{item}}</a-checkbox>
            </a-checkbox-group>
          </a-form-item>
        </div>
        <div class="m7">
          <a-form-item class="update-options" label="更新选项">
            <a-checkbox :checked="form.isForceUpdate" @click="setOppsiteValue('isForceUpdate')">强制更新</a-checkbox>
            <a-checkbox :checked="form.isPopPrompt" @click="setOppsiteValue('isPopPrompt')">弹窗提示更新</a-checkbox>
            <a-checkbox :checked="form.isVersionPrompt" @click="setOppsiteValue('isVersionPrompt')">版本查看更新</a-checkbox>
          </a-form-item>
        </div>
        <div class="m7 mt10" v-if="isNewest">
          <a-form-item class="update-options" label="更新地址">
            <a-input style="width: 380px;" v-decorator="['updateUrl']"/>
          </a-form-item>
        </div>
        <div class="m7 mt10" v-if="isNewest">
          <a-form-item class="update-options" label="更新内容">
            <a-textarea style="width: 380px;"  v-decorator="['updateContent']" :rows="4"></a-textarea>
          </a-form-item>
        </div> 
      </a-form>
    </a-modal>

  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents ,Lifecycle, Watch, Prop } from "vue-decorators";

@Component({ formOptions: 'id' })
export default class AppUpdateInfo extends Vue {
  table = {
    columns: [
      {title: "排序", dataIndex: "sort", scopedSlots: { customRender: "sort" }},
      {title: "版本号", dataIndex: "version"},
      {title: "版本提示", scopedSlots: { customRender: "isVersionPrompt"}},
      {title: "弹框提示", scopedSlots: { customRender: "isPopPrompt"}},
      {title: "强制更新", scopedSlots: { customRender: "isForceUpdate"}},
      {title: "更新时间", dataIndex: "createTime"},
      {title: "内容",  dataIndex: "updateContent",  scopedSlots: { customRender: "updateContent" }},
      {title: "操作", scopedSlots: { customRender: "operation" }}
    ],
    dataSource: []
  };

  showModel = false;

  @Prop({ type: [String, Number]}) pid;
  @Prop({ type: [String, Number]}) appType;
  @Prop({ type: String }) platformName;

  confirmLoading = false;
  init = { num: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0] };
  updateId = '';

  // 当前app版本
  appCurrentVersion = "";

  // 是否是最新版本
  isNewest = false;

  form = { 
    updateRange: [],
    isForceUpdate: false,
    isPopPrompt: false,
    isVersionPrompt: false
  }

  selectAll() {
    if (this.form.updateRange.length === this.init.num.length && this.form.updateRange.length > 0) {
       this.form.updateRange = []
    } else {
      this.form.updateRange = this.init.num.slice();
    }
    this.vform.setValue('updateRange', this.form.updateRange);
  }

  changeCheckBox(value) {
    this.vform.setValue('updateRange', value);
    this.form.updateRange = value;
  }

  setOppsiteValue(type) {
    this.form[type] = !this.form[type];
  }

  setInit() {
    this.form.updateRange = "";
    this.form.isForceUpdate = false;
    this.form.isPopPrompt = false;
    this.form.isVersionPrompt = false;
  }

  showPoump(record) {
    // this.setInit();
    this.isNewest = record.isNewest == 1 ? true : false;

    this.appCurrentVersion = record.version;
    this.updateId = record?.id;
    this.vform.setValue('updateRange', record?.updateRange.length === 0 ? [] : record?.updateRange.split(',').map(item=>+item));
    this.form.updateRange = record?.updateRange.length === 0 ? [] : record?.updateRange.split(',').map(item=>+item);
    this.form.isForceUpdate=record?.isForceUpdate === 1 ? true:false;
    this.form.isPopPrompt=record?.isPopPrompt  === 1 ? true:false;
    this.form.isVersionPrompt=record?.isVersionPrompt  === 1 ? true:false;
    this.vform.setValue('updateUrl', record.updateUrl);
    this.vform.setValue('updateContent', record.updateContent);
    this.showModel = true;
  }

  async doUpdateVersion() {
    const form = await this.vform.validate();
    if (form.errors) return
    const temp = this.transferParams(form.values);
    const extraParams = this.transferParams(this.form);
    const res = await this.$service.fetch("/config-admin-api/appVersion/editAppVersion", Object.assign({
      id: this.updateId
    }, temp, extraParams));
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.showModel = false;
    // this.setInit();
    this.getList();
  }

  transferParams(values) {
    const temp = {};
    // 按接口格式转化值
    for (let [key, value] of Object.entries(values)) {
      if (typeof value === "boolean") {
        value = value === true ? 1 : 0
      } else if (typeof value === "undefined") {
        value = ""; 
      } else if (typeof value === 'object' && value instanceof Array) {
        value = value.join(",");
      }
      temp[key] = value
    };
    return temp;
  }

  @Lifecycle mounted() {
    this.getList();
  }

  async getList() {
    const res = await this.$service.fetch("/config-admin-api/appVersion/queryAllPlatformAppVersion", {appType: this.appType, platformId: this.pid});
    if (res.code !== 1) res.message && this.$message.error(res.message);
    if (res.data instanceof Array) {
      this.table.dataSource = res.data;
      this.$emit("close");
    }
  }

}
</script>

<style lang="scss" scoped>
.update-content {
  width: 160px;
  word-break: break-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.myform-update /deep/ {
  .m8 {
    padding-left: 120px;
    .ant-checkbox-wrapper {
      &:nth-child(6) {
        margin-left: 0;
      }
    }
  }

  .label120 {
    width: 120px;
    display: inline-block;
    text-align: right;
  }

  .update-options {
    label {
      width: 120px;
      display: inline-block;

      &.ant-checkbox-wrapper {
        width: auto;
      }
    }
  }
}
</style>