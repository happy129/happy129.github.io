<template>
  <div class="page-container">
    <div class="mt200">
      <a-form v-permission="20306" layout="inline" :form="vform1" @submit.prevent="_queryPageFaqType(true)">
        <a-form-item label="屏蔽国家">
          <a-radio-group v-decorator="['limitType', { rules: [{ required: false, message:'请选择屏蔽国家或地区' }]}]" @change="_selectRadioValue">
            <a-radio value="0">除中国外的所有国家</a-radio>
            <a-radio value="1">屏蔽单个国家</a-radio>
            <a-radio value="2">不屏蔽任何国家</a-radio>
          </a-radio-group>
        </a-form-item>
        <br>
        <a-form-item label="屏蔽国家">
          <a-button  type="default" size="small" icon="plus-square" @click.prevent="limit" :disabled="disabled"></a-button>
        </a-form-item>
        <!-- <a-popover v-if="showSelectArea"  trigger="click">
          <a-icon type="plus-square" theme="twoTone" @click.prevent="limit" style="font-size: 16px;"/>
          <select-area :open="showSelectArea"/> 
        </a-popover>-->
        <br>
        <a-form-item
          :read-only="isReadOnly"
          v-decorator="['countreyCodes', { rules: [{ required: true, message:'请选择屏蔽国家或地区' }]}]"
        >
          <div class="limitarea" :style="diabledclick">
            <template v-for="(tag, index) in tagsArray">
              <a-tooltip :key="index">
                <a-tag
                  :key="tag.countryCode"
                  closable
                  :afterClose="() => handleClose(tag.countryCode)"
                  color="#2db7f5"
                >{{tag.countryName}}</a-tag>
              </a-tooltip>
            </template>
          </div>
        </a-form-item>
      </a-form>
    </div>
    <div class="mt15">
      <a-form layout="inline" class="form2">
        <a-form-item label="IP白名单">
          <a-button type="primary" v-permission="20307"  @click="_add()">添加</a-button>
        </a-form-item>
        <a-form-item>
          <a-input-search placeholder="请输入IP地址" @search="onSearch"/>
        </a-form-item>
      </a-form>
    </div>
    <div class="mt15">
      <a-table class="mytable" :columns="table.columns" :dataSource="table.tableData" :pagination="paginationParams" :rowKey="(r, i) => i" @change="changeTablePagenation" bordered >
        <template slot="operate" slot-scope="r, text">
          <a-button type="primary" v-permission="20309" size="small" @click="_edit(text, r.id)">编辑</a-button>
          <a-popconfirm title="确定删除吗?" @confirm="_remove(r.id)" okText="确定" cancelText="取消">
            <a-button type="primary" v-permission="20308" size="small">删除</a-button>
          </a-popconfirm>
        </template>
      </a-table>
    </div>
    <a-modal
      :title="flag==='edit'?`修改IP白名单`:`添加IP白名单`"
      v-model="modalShow"
      :footer="false"
      :destroyOnClose="true"
      :maskClosable="false"
    >
      <div style="text-align:left;">
        <a-form :form="vform2" @submit.prevent="flag==='edit'?_editEnter():_addEnter(true)">
          <a-form-item v-bind="formItemLayout" label="输入IP地址">
            <a-input
              placeholder="请输入IP地址"
              v-decorator="['ip', {rules: [{required:true,message:'请输入正确IP地址',pattern:/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/}]}]"
            ></a-input>
          </a-form-item>
          <a-form-item v-bind="formItemLayout" label="请编辑备注">
            <a-textarea
              :rows="4"
              v-decorator="['remark', {rules: [{required:true,message:'备注不能为空',pattern:/\S/}]}]"
              autoSize
              placeholder="编辑备注"
            ></a-textarea>
          </a-form-item>
          <div style="text-align: center;">
            <a-button type="primary" html-type="submit">保存</a-button>
          </div>
        </a-form>
      </div>
    </a-modal>
    <a-modal
      title="请选择屏蔽国家"
      v-model="showSelectArea"
      :footer="false"
      :destroyOnClose="true"
      :maskClosable="false"
      :width="1300"
    >
      <div class="text-align: center;">
        <a-form @submit.prevent="_limitArea">
          <a-form-item>
            <a-tabs size="small" type="card">
              <a-tab-pane
                v-for="pane in panes"
                :tab="pane.title"
                :key="pane.key"
                :closable="pane.closable"
              >
                <template v-for="(tag, index) in pane.content">
                  <a-checkable-tag
                    :key="index"
                    :checked="selectedTags.indexOf(tag.countryCode) > -1"
                    @change="(checked) => handleChange(tag.countryCode, checked)"
                  >{{tag.countryName}}</a-checkable-tag>
                </template>
              </a-tab-pane>
            </a-tabs>
          </a-form-item>
          <div style="text-align: right;">
            <a-button type="primary" html-type="submit">确定</a-button>
          </div>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script>
import Vue from "vue";
import {
  Component,
  InjectComponents,
  Provide,
  Lifecycle,
  Watch,
  Mutation,
  State
} from "vue-decorators";

@Component({
  formOptions: {
    vform1: "id",
    vform2: "id"
  }
})
export default class ProblemsClassification extends Vue {
  formItemLayout = { labelCol: { span: 6 }, wrapperCol: { span: 15 } };
  modalShow = false;
  isReadOnly = true;
  radiogroupValue = "0";
  flag = "add";
  paginationParams = { pageNo: 1, total: 0, pageSize: 0 };
  details = {};
  init = { pageNo: 1, pageSize: 10 };
  params = { pageNo: 1, pageSize: 10, ip: "" };
  table = {
    tableData: [],
    columns: [
      { title: "ID", dataIndex: "id" },
      { title: "IP地址", dataIndex: "ip" },
      { title: "备注", dataIndex: "remark" },
      { title: "修改类型", dataIndex: "updateTime" },
      { title: "操作", scopedSlots: { customRender: "operate" } }
    ]
  };
  // 限制地区部分初始值
  showSelectArea = false;
  tagsArray = [];
  InintLimitAll = [];
  panes = [];
  selectedTags = [];
  disabled = true;
  diabledclick = "pointer-events: none;";

  @Mutation("setDiabledAredCode") setDiabledAredCode;
  @State(state => state.diabledAredCode) diabledAredCode;
  handleChange(tag, checked) {
    const { selectedTags } = this;
    const nextSelectedTags = checked
      ? [...selectedTags, tag]
      : selectedTags.filter(t => t !== tag);
    this.selectedTags = nextSelectedTags;
  }

  /**设置初始表单状态 */
  setInitialValues() {
    this.vform1.setValues(
      {
        limitType: 0,
        countreyCodes: ""
      },
      true
    );
    this.vform2.setValues(
      {
        ip: "",
        remark: ""
      },
      true
    );
  }
  /**设置屏蔽国家 */
  async handleClose(removedTagCode) {
    let unremovedcodeArray = [];
    this.tagsArray.forEach(item => {
      if (item.countryCode !== removedTagCode) {
        unremovedcodeArray.push(item.countryCode);
      }
    });
    const res = await this.$service.fetch(
      "/config-admin-api/countryLimit/editCountryLimit",
      { countreyCodes: unremovedcodeArray.join(","), limitType: 1 }
    );
    if (1 !== res.code) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    await this.$service
      .fetch("/config-admin-api/countryLimit/getCountryLimit")
      .then(rts => {
        this.setDiabledAredCode("");
        this.setDiabledAredCode(rts.data.countryCodes);
        let residueArray = [];
        this.InintLimitAll.forEach(item => {
          rts.data.countryCodes.split(",").forEach(keys => {
            if (keys === item.countryCode) {
              residueArray.push(item);
            }
          });
        });
        this.tagsArray = residueArray;
      });
  }

  limit() {
    this.showSelectArea = true;
    this.getTabInitdata();
  }
  _add() {
    this.flag = "add";
    this.modalShow = true;
  }
  _edit(details, id) {
    this.flag = "edit";
    this.modalShow = true;
    this.details = details;
    this.vform2.setValues({ ip: details.ip, remark: details.remark }, true);
  }
  resetPagination() {
    this.paginationParams.current = 1;
    this.params.pageNo = 1;
    this.init.pageNo = 1;
  }
  /**屏蔽单个国家 */
  async _limitArea() {
    const res = await this.$service.fetch(
      "/config-admin-api/countryLimit/editCountryLimit",
      { countreyCodes: this.selectedTags.join(",")+","+this.diabledAredCode, limitType: 1 }
    );
    if (1 !== res.code) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.showSelectArea = false;
    let allCountryCode = this.InintLimitAll.map(item => { 
      return item.countryCode;
    });
    let tempArray1  = [];
    let tempArray2 = [];
    for(var i=0;i<this.selectedTags.length;i++){
      tempArray1[this.selectedTags[i]]=true;
    }
    for(var i=0;i<allCountryCode.length;i++){
        if(!tempArray1[allCountryCode[i]]){
            tempArray2.push(allCountryCode[i]);
        }
    }
    function unique(array) {
      return Array.from(new Set(array));
    }
    let newTitltleArray1 = tempArray2.map(item => {
      return item.substr(0, 1);
    });
    let titleArray = unique(newTitltleArray1).map((keys, index) => {
      let rObj = {};
      rObj.key = index;
      rObj.title = "title";
      rObj.content = [];
      rObj[rObj.title] = keys;
      return rObj;
    });
    let array = [];
    unique(tempArray2).forEach((key, i) => {
      this.InintLimitAll.forEach(item => {
        if (item.countryCode === key) {
          array.push(item);
        }
      })    
    });
    array.forEach((item, index) => {
      unique(newTitltleArray1).forEach((key, i) => {
        if (item.countryCode.indexOf(key) == 0)
          titleArray[i].content.push(item);
      });
    });
    titleArray.unshift({ title: "全部", content: array });
    this.panes = titleArray;
    await this.$service
      .fetch("/config-admin-api/countryLimit/getCountryLimit")
      .then(res => {
        this.setDiabledAredCode(res.data.countryCodes);
        let residueArray = [];
        this.InintLimitAll.forEach(item => {
          res.data.countryCodes.split(",").forEach(keys => {
            if (keys === item.countryCode) {
              residueArray.push(item);
            }
          });
        });
        this.tagsArray = residueArray;
      });
    this.selectedTags = []; // 清空选项中的数据  
  }
  /** 翻页查询问题详情 */
  changeTablePagenation(pagination) {
    this.init.pageNo = pagination.current;
    this.paginationParams.current = pagination.current;
    this.paginationParams.pageNo = pagination.current;
    this.params.pageNo = pagination.current;
    this.getInitTableInfo();
  }
  /** 选择屏蔽国家业务 */
  async _selectRadioValue(e) {
    if (e.target.value === "1") {
      this.disabled = false;
      this.diabledclick = "";
      this.getInitLimitAll();
      this.selectedTags = [];
    } else {
      this.disabled = true;
      this.diabledclick = "pointer-events: none;";
    }
    const res = await this.$service.fetch(
      "/config-admin-api/countryLimit/editCountryLimit",
      { countreyCodes: this.diabledAredCode, limitType: e.target.value }
    );
    if (1 !== res.code) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    const datas = await this.$service.fetch(
      "/config-admin-api/countryLimit/getCountryLimit"
    );
    this.setDiabledAredCode(datas.data.countryCodes);
    if (datas.data?.countryCodes == "") {
      this.tagsArray = [];
    }
  }
  /**屏蔽国家 */
  async _queryPageFaqType(refresh) {
    if (refresh) this.resetPagination();
    const form = await this.vform1.validate();
    if (form.errors) return;
    const res = await this.$service.fetch(
      "/config-admin-api/onlineCustomer/queryPageOnlineCustomer",
      Object.assign(form.values, this.init)
    );
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data?.records instanceof Array) {
      this.table.tableData = Object.freeze(res.data.records);
      this.paginationParams.total = res.data?.totalCount;
    } else {
      this.table.tableData = [];
      this.paginationParams.total = 1;
    }
  }
  /** 搜索IP白名单 */
  async onSearch(value) {
    this.resetPagination();
    const res = await this.$service.fetch(
      "/config-admin-api/ipWhiteList/queryPageIpWhiteList",
      { ip: value, pageNo: 1, pageSize: 10 }
    );
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data?.records instanceof Array) {
      this.table.tableData = Object.freeze(res.data.records);
      this.paginationParams.total = res.data?.totalCount;
    } else {
      this.table.tableData = [];
      this.paginationParams.total = 1;
    }
  }
  /** 添加白名单IP */
  async _addEnter(refresh) {
    if (refresh) {
      this.paginationParams.pageNo = 1;
      this.paginationParams.current = 1;
      this.init.pageNo = 1;
      this.params.pageNo = 1;
    }
    const form = await this.vform2.validate();
    if (form.errors) return;
    let res = await this.$service.fetch(
      "/config-admin-api/ipWhiteList/addIpWhiteList",
      form.values
    );
    if (1 !== res.code) return res.message && this.$message.error(res.message);
    this.modalShow = false;
    this.$message.success(res.message);
    this.getInitTableInfo();
    this.vform2.setValues({ ip: "", remark: "" });
  }
  /** 修改白名单IP*/
  async _editEnter(refresh) {
    if (refresh) this.resetPagination();
    const form = await this.vform2.validate();
    if (form.errors) return;
    form.values.id = this.details.id;
    let res = await this.$service.fetch(
      "/config-admin-api/ipWhiteList/editIpWhiteList",
      form.values
    );
    if (1 !== res.code) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.modalShow = false;
    this.getInitTableInfo();
  }
  /** 删除IP白名单列表 */
  async _remove(removeid) {
    let res = await this.$service.fetch(
      "/config-admin-api/ipWhiteList/removeIpWhiteList",
      { id: removeid }
    );
    if (1 !== res.code) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.getInitTableInfo();
  }
  /** 初始化表格获取参数 */
  async getInitTableInfo(refresh) {
    if (refresh) this.resetPagination();
    let res = await this.$service.fetch(
      "/config-admin-api/ipWhiteList/queryPageIpWhiteList",
      this.params
    );
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data?.records instanceof Array) {
      this.table.tableData = Object.freeze(res.data.records);
      this.paginationParams.total = res.data?.totalCount;
    } else {
      this.table.tableData = [];
      this.paginationParams.total = 1;
    }
  }
  /**初始化已屏蔽国家或地区 */
  async getInintLimitedArea() {
    const res = await this.$service.fetch(
      "/config-admin-api/countryLimit/getCountryLimit"
    );
    if (1 !== res.code) return res.message && this.$message.error(res.message);
    function getCode(index) {
      const code = {
        0: 0,
        1: 1,
        2: 2
      };
      return code[index];
    }
    this.setDiabledAredCode(res.data.countryCodes);
    if (getCode(res.data.limitType) === 1) {
      this.diabledclick = "";
      this.disabled = false;
    } else {
      this.diabledclick = "pointer-events: none;";
      this.disabled = true;
    }
    this.vform1.setValues({ limitType: getCode(res.data.limitType) }, true);

    if (res?.data instanceof Object) {
      let CountCodeArray = res.data.countryCodes.split(",");
      await this.$service
        .fetch("/config-admin-api/countryLimit/queryAllCountry")
        .then(res => {
          if (1 !== res.code)
            return res.message && this.$message.error(res.message);
          if (res?.data instanceof Array) {
            CountCodeArray.forEach(keys => {
              res.data.forEach(item => {
                item.countryCode === keys ? this.tagsArray.push(item) : "";
              });
            });
          }
          this.InintLimitAll = res.data;
        });
      CountCodeArray = [];
    } else {
      this.tagsArray = [];
    }
  }
  /**初始化获取所有可选国家信息 */
  async getInitLimitAll() {
    let newTitltleArray = this.InintLimitAll.map(item => {
      return item.countryCode.substr(0, 1);
    });
    function unique(array) {
      return Array.from(new Set(array));
    }
    let titleArray = unique(newTitltleArray).map((keys, index) => {
      let rObj = {};
      rObj.key = index;
      rObj.title = "title";
      rObj.content = [];
      rObj[rObj.title] = keys;
      return rObj;
    });
    this.InintLimitAll.forEach((item, index) => {
      unique(newTitltleArray).forEach((key, i) => {
        if (item.countryCode.indexOf(key) == 0)
          titleArray[i].content.push(item);
      });
    });
    titleArray.unshift({ title: "全部", content: this.InintLimitAll });
    this.panes = titleArray;
  }
  async getTabInitdata() {
    let diabledAredCode = this.diabledAredCode.split(",");
    let allCountryCode = this.InintLimitAll.map(item => {
      return item.countryCode;
    });
    let tempArray1  = [];
    let tempArray2 = [];

    for(var i=0;i<diabledAredCode.length;i++){
      tempArray1[diabledAredCode[i]]=true;
    }
    for(var i=0;i<allCountryCode.length;i++){
      if(!tempArray1[allCountryCode[i]]){
        tempArray2.push(allCountryCode[i]);
      }
    }
    function unique(array) {
      return Array.from(new Set(array));
    }
    let newTitltleArray1 = tempArray2.map(item => {
      return item.substr(0, 1);
    });
    let titleArray = unique(newTitltleArray1).map((keys, index) => {
      let rObj = {};
      rObj.key = index;
      rObj.title = "title";
      rObj.content = [];
      rObj[rObj.title] = keys;
      return rObj;
    });
    let array = [];
    unique(tempArray2).forEach((key, i) => {
      this.InintLimitAll.forEach(item => {
        if (item.countryCode === key) {
          array.push(item);
        }
      })
    });
    array.forEach((item, index) => {
      unique(newTitltleArray1).forEach((key, i) => {
        if (item.countryCode.indexOf(key) == 0)
          titleArray[i].content.push(item);
      });
    });
    titleArray.unshift({ title: "全部", content: array });
    this.panes = titleArray;
  }
  @Lifecycle() created() {
    this.setInitialValues();
    this.getInitTableInfo();
    this.getInintLimitedArea();
    this.getInitLimitAll();
  }
}
</script>

<style lang="scss" scoped>
@import "@views/admin/Pop.scss";
.page-container /deep/ {
  .ant-btn-primary {
    margin-right: 5px;
  }
  .form2 {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .ant-form {
    .limitarea {
      width: 1625px;
      min-height: 200px;
      box-shadow: 1px 0.5px 0.5px 1px rgb(217, 217, 217);
      overflow-x: hidden;
      overflow-y: auto;
      outline: none;
    }
  }
  .tab-switch-list.tab-sty1 {
    padding-top: 10px;
    margin-right: 30px;
    li {
      height: 25px;
      line-height: 25px;
      button {
        height: 100%;
        width: 90px;
        padding: 0px;
      }
    }
  }
  .ant-input:not(.ant-calendar-picker-input) {
    width: 130px;
  }
  .mt15 {
    margin-top: 10px;
  }
  .ant-table-thead {
    th {
      padding: 16px 2px;
    }
  }
  .ant-modal2 {
    width: 1000px;
  }
}
</style>
