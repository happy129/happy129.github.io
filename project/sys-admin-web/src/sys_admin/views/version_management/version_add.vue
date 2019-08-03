<template>
  <div class="version_add">
    <div class="m7 version-table" v-if="type === 'add'">
      <a-table :columns="table.columns" :dataSource="table.dataSource" size="small" :rowKey="(e, i) => i" :pagination="false">
        <template slot="updateUrl" slot-scope="text, records">
          <a-input v-decorator="['updateUrl', {initialValue: records.updateUrl}]" @change="(e) => changeUpdateUrl(records.platformId, e)"/>
        </template>
      </a-table>
    </div>
    <a-form layout="inline" :form="vform"  @submit.prevent="updateInfo">
      <div class="m7" v-if="type === 'update'">
        <a-form-item label="商户名">
          <a-input v-decorator="['platformName']" disabled/>
        </a-form-item>
        <a-form-item label="当前版本">
          <a-input v-decorator="['currentVersion']" disabled/>
        </a-form-item>
      </div>
      <div class="m7 linew" v-if="type === 'update'">
        <a-form-item label="更新地址">
          <a-input v-decorator="['updateUrl']" />
        </a-form-item>
        <a-form-item style="display:none">
          <a-input v-decorator="['id']" />
        </a-form-item>
        <a-form-item style="display:none">
          <a-input v-decorator="['platformId']" />
        </a-form-item>
      </div>
      <div class="m7">
        <a-form-item label="更新版本">
          <a-input placeholder="如:v1.0.1"  v-decorator="['version', {rules: [{required: true, message: '更新版本不能为空且版本号大于当前版本'}, { validator: checkVersion}] }]"/>
        </a-form-item>
        <a-form-item label="更新包大小">
          <a-input v-number="true" v-decorator="['appSize']" addonAfter="M"/>
        </a-form-item>
      </div>
      <div class="m7">
        <a-form-item label="更新范围(用户ID)">
          <a-button @click="selectAll">全选</a-button>
        </a-form-item>
      </div>
      <div class="m8" :key="form.key">
        <a-form-item>
          <!-- , {rules: [{ required: true, message: '请选择更新范围' }]} -->
          <a-checkbox-group v-decorator="['updateRange']" @change="changeCheckBox">
            <a-checkbox v-for="(item, index) in init.num" :value="item" :key="index">尾数{{item}}</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
      </div>
      <div class="m7">
        <a-form-item label="更新选项">
          <a-checkbox :checked="form.isForceUpdate" @click="setOppsiteValue('isForceUpdate')">强制更新</a-checkbox>
          <a-checkbox :checked="form.isPopPrompt" @click="setOppsiteValue('isPopPrompt')">弹窗提示更新</a-checkbox>
          <a-checkbox :checked="form.isVersionPrompt" @click="setOppsiteValue('isVersionPrompt')">版本查看更新</a-checkbox>
        </a-form-item>
      </div>
      <div class="m7 m9">
        <a-form-item label="更新内容" >
          <a-textarea :rows="4" v-decorator="['updateContent']"></a-textarea>
        </a-form-item>
      </div>
      <div class="m7 mt15">
        <a-form-item>
          <a-button class="mr-text" type="primary" html-type="submit">保存</a-button>
        </a-form-item>
      </div>
    </a-form>
  </div>
</template>
<script>
import Vue from "vue";
import { Component, InjectComponents, Lifecycle, Watch, Prop } from "vue-decorators";
import { Modal, Notification as Notice } from "ant-design-vue";

@Component({ formOptions: "id"})
export default class VersionAdd extends Vue {
  @Prop({ type: [String, Number] }) id;
  @Prop({ type: String, default: 'update' }) type;
  @Prop({ type: Array }) tableData;
  @Prop({ type: [String, Number] }) appType;

  table = {
    columns: [
      {title: "序号", dataIndex: "platformId"},
      {title: "商户名称", dataIndex: "platformName"},
      {title: "当前版本", dataIndex: "version"},
      {title: "更新地址", dataIndex: "updateUrl", scopedSlots: { customRender: "updateUrl" } },
    ],
    dataSource: []
  }

  init = { num: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0] };

  // 记录当前版本，表单提交的时候需要用到该字段校验
  currentVersion = "";

  form = { 
    updateRange: [],
    isForceUpdate: false,
    isPopPrompt: false,
    isVersionPrompt: false
  }

  @Lifecycle mounted() {
    if (this.type === 'update') {
      this.getInfo();
    }
    this.table.dataSource = this.tableData;
  }

  selectAll() {
    if (this.form.updateRange.length === this.init.num.length && this.form.updateRange.length > 0) {
       this.form.updateRange = []
    } else {
      this.form.updateRange = this.init.num.slice();
    }
    this.vform.setValue('updateRange', this.form.updateRange);
  }

  // 检查版本更新
  checkVersion(rule, value, cb) {
    // let number = value.replace(/[^\d]/g, '');
    // let currentVersion = "";
    // if (this.type === 'update') {
    //   currentVersion = this.currentVersion.replace(/[^\d]/g, '');
    // } 
    let currentVersion = value.split('.').map(item => (item = item.replace(/[^\d]/g, '')));
    let lastVersion = this.currentVersion.split(".").map(item  => (item = item.replace(/[^\d]/g, '')));

    if (currentVersion.length !== 3) {
      cb('请输入正确版本号');
    }

    try {
      if (lastVersion.length == 0 || lastVersion.length !== 3) {
        cb();
      }
      // 只有两个版本都是正确的时候才进行比较
      if (lastVersion.length === currentVersion.length) {
        if (+currentVersion[0] < +lastVersion[0]) {
          return cb('更新版本号不能小于当前版本');
        }
        if (+currentVersion[1] < +lastVersion[1]) {
          return cb('更新版本号不能小于当前版本');
        }

        if (+currentVersion[2] <= +lastVersion[2] && +currentVersion[1] <= +lastVersion[1]) {
          return cb('更新版本号不能小于当前版本')
        }
      }
    } catch(e) {
      console.log(e);
    }

    cb();
  }

  changeUpdateUrl(id, e) {
    this.$emit('inputChange', id, e.target.value);
  }

  changeCheckBox(value) {
    this.vform.setValue('updateRange', value);
    this.form.updateRange = value;
  }

  setOppsiteValue(type) {
    this.form[type] = !this.form[type];
  }

  async getInfo() {
    const res = await this.$service.fetch('/config-admin-api/appVersion/getAppVersion', { platformId: this.id, appType: this.appType });
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (typeof res?.data === 'object') {
      const transferData = {
        ...res.data,
        updateRange: res.data.updateRange ? res.data.updateRange.split(",").map(v => +v) : []
      };
      this.form.updateRange = transferData.updateRange;
      this.vform.setValues(transferData, true);
      // 设置checkbox的选中或者没选中的状态
      this.form.isForceUpdate = res.data?.isForceUpdate == 1 ? true : false;
      this.form.isPopPrompt = res.data?.isPopPrompt == 1 ? true : false;
      this.form.isVersionPrompt = res.data?.isVersionPrompt == 1 ? true : false;
      this.currentVersion = res.data.currentVersion || '0.0.0';
    }
  }

  async updateInfo() {
     const form = await this.vform.validate();
    
    if (this.type === 'update') {
      // 更新操作
      if (form.errors) return;
      const temp = this.transferParams(form.values);
      const extraParams = this.transferParams(this.form);
      const res = await this.$service.fetch('/config-admin-api/appVersion/batchEditAppVersion', Object.assign(temp, extraParams, {appType: this.appType}));
      this.successCallBack(res);
    } else {
      // 批量更新操作  
      if (form.errors) return;

      let inputVersion = form.values.version.replace(/[^\d]/g, '');
      let tableMaxVersion = this.table.dataSource.filter(v => v.version)
      .map(v => v.version.replace(/[^\d]/g, ''))
      .sort((prev, next) => {
        return parseInt(next, 10) - parseInt(prev, 10);
      });

      tableMaxVersion = tableMaxVersion[0] ? tableMaxVersion[0] : '';
      // 版本号如果小于四位数，改成4位数再做比较
      if (inputVersion.length < 4) {
        inputVersion += '0'
      }
      // 版本号如果小于四位数，改成4位数再做比较
      if (tableMaxVersion.length < 4) {
        tableMaxVersion += '0'
      }
      
      if (tableMaxVersion) {
        if (parseInt(inputVersion, 10) <= parseInt(tableMaxVersion, 10)) {
          return this.$message.error("更新版本号不能小于当前版本");
        }
      }

      const temp = this.transferParams(form.values);
      const params = Object.assign({ platformList: this.tableData }, temp);
      const extraParams = this.transferParams(this.form);
      const res = await this.$service.fetch('/config-admin-api/appVersion/addAppVersion', Object.assign(params, extraParams, {appType: this.appType }));
      this.successCallBack(res);
    }
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

  successCallBack(res) {
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$emit('close');
    Notice.success({ message: "提示", description: res.message });
    return false;
  }

}
</script>

<style lang="scss">
.version_add  {
  .m7 {
     display: flex;
    justify-content: space-between;

    .ant-form-item-label > label{
      display: inline-block;
      width: 120px;
      text-align: right;
    }
  }
 
  .m8 {
    margin-top: 10px;
    .ant-form-item {
      padding-left: 120px;

      .ant-checkbox-wrapper {
        width: 90px;
        display: inline-block;
        margin-bottom: 10px;
        &:nth-child(6) {
          margin-left: 0;
        }
      }
    }
  }

  .m9 {
    textarea {
      width: 515px;
    }
  }

  .version-table {
    margin-bottom: 20px;
    .ant-table-wrapper {
      width: 660px;
    }
  }
}

.linew /deep/ {
  .ant-form-item {
    .ant-input {
      width: 535px;
    }
  }
}

.mr-text {
  margin-left: 120px;
}

</style>
