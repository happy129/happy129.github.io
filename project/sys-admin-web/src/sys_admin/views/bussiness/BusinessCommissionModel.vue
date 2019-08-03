<template>
  <section class="buss-container">
    <a-form layout="inline" :form="formElement">
      <a-form-item label="佣金模式名">
        <a-input v-decorator="['commissonModeName', { initialValue: ''}]"/>
      </a-form-item>
      <a-form-item label="推广模式">
        <a-select v-decorator="['commissonComputeMode', { initialValue: ''}]" :dropdownMatchSelectWidth="false" @change="changeModeType">
          <a-select-option value=''>全部</a-select-option>
          <a-select-option v-for="(item, index) in dictionary.commissonComputeMode" :key="index" :value="item.value">{{item.name}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" @click="getCommissionList(true)" :loading="init.loading">查询</a-button>
      </a-form-item>
      <a-form-item v-permission="10006">
        <a-button type="primary" @click="addCommission">添加</a-button>
      </a-form-item>
    </a-form>

    <div class="page-under-table">
      <a-table :loading="init.loading" class="mytable" bordered :columns="table.columns" :dataSource="table.dataSource" :rowKey="e => e.id" :pagination="table.pagination" @change="changePagination">
        <template slot="commissonComputeMode" slot-scope="text, records">
          {{getCommissonModeName(records.commissonComputeMode)}}
        </template>
        <template slot="fixedRate"  slot-scope="text, records">
          {{getRate(records)}}
        </template>
        <template slot="operate" slot-scope="text, records">
          <a-button type='primary' size="small" v-permission="10007" @click="showUpdate(records.id)">修改</a-button>
        </template>
      </a-table>
    </div>

    <a-modal :title="init.ModalTitle[init.ModalTitleIndex]"  v-model="init.ModalShow" :footer="null" :destroyOnClose="true" :maskClosable="false">
      <div class="commission-box" :key="init.key">
        <a-form layout="inline" :form="formElement2" @submit.prevent="updateCommission">
          <a-form-item label="佣金模式名称">
            <a-input v-decorator="['commissonModeName', { initialValue: form.commissonModeName, rules: [{ required: true, message: '佣金模式不能为空' }] }]"/>
          </a-form-item>
          <div>
            <a-form-item label="保底费用">
              <a-input v-decorator="['minFee', { initialValue: form.minFee, rules: [{ required: true, message: '保底费用不能为空' }] }]"/>
            </a-form-item>
            <a-form-item label="服务器费用">
              <a-input v-decorator="['serverFee', { initialValue: form.serverFee, rules: [{ required: true, message: '服务器费用不能为空' }] }]"/>
            </a-form-item>
          </div>
          <div>
            <a-form-item label="计算方式">
              <a-select  v-decorator="['commissonComputeMode', { initialValue: form.commissonComputeMode === undefined ? '0' : form.commissonComputeMode , rules: [{ required: true, message: '请选择计算方式' }]}]" :dropdownMatchSelectWidth="false" @change="changeMode">
                <a-select-option v-for="(item, index) in dictionary.commissonComputeMode" :key="index" :value="item.value">{{item.name}}</a-select-option>
              </a-select>
            </a-form-item>
          </div>
          <div v-if="init.mode == 0">
            <a-form-item label="固定比例">
              <a-input v-number="true" addonAfter="%" v-decorator="['fixedRate', { initialValue: form.fixedRate, rules: [{ required: true, message: '固定比例不能为空且大于0', validator: checkValidator }] }]" :disabled="init.mode === 1"/>
            </a-form-item>
          </div>
          <div v-else>
            <div class="mode-add"> <a-button type='primary' size="small" @click="addTableRows">添加</a-button> </div>
            <div class="mode-table mt10">
              <a-table size="small" :columns="table.columns2" :dataSource="table.dataSource2" :pagination="false">
                <template slot="platformProfit" slot-scope="text, records">
                  <a-input size="small" :value="records.platformProfit"  @change="(value) => changeInputValue(value, records.key, 'platformProfit')"/>
                </template>
                 <template slot="commissonRate"  slot-scope="text, records">
                  <a-input size="small" :value="records.commissonRate" @change="(value) => changeInputValue(value, records.key, 'commissonRate')" addonAfter="%"/>
                </template>
                <template slot="operation" slot-scope="text, records">
                  <a-button type="primary" size="small" @click="removeTableRows(records.key)">删除</a-button>
                </template>
              </a-table>
            </div>
          </div>
          <div class="mt10">
            <a-form-item label="Google验证码">
              <a-input v-decorator="['googleCode', {rules: [{ required: true, message: '请输入google验证码' }]}]"/>
            </a-form-item>
          </div>
          <div class="commission-btn">
            <a-button type='primary' html-type="submit" :loading="init.loadingadd">保存</a-button>
          </div>
        </a-form>
      </div>
    </a-modal>
  </section>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle, Watch } from "vue-decorators";
import { Modal, Notification as Notice } from "ant-design-vue";
import * as Api from '@api/bussiness'

@Component({ dictionary: 'commissonComputeMode' })
export default class BusinessCommissionModel extends Vue {
  table = {
    columns: [
      { title: "佣金模式名称", dataIndex: "commissonModeName" },
      { title: "计算方式", dataIndex: "commissonComputeMode" , scopedSlots: {customRender: "commissonComputeMode"}},
      { title: "比例", dataIndex: "fixedRate",  scopedSlots: {customRender: "fixedRate" }},
      { title: "保底金额", dataIndex: "minFee" },
      { title: "服务器费用", dataIndex: "serverFee" },
      {
        title: "操作",
        dataIndex: "operate",
        scopedSlots: { customRender: "operate" }
      }
    ],
    dataSource: [],
    pagination: { total: 0, current: 1 },

    columns2: [
      { title: "盈亏", dataIndex: "platformProfit", scopedSlots: {customRender: 'platformProfit'}},
      { title: "比例", dataIndex: "commissonRate", scopedSlots: {customRender: 'commissonRate'} },
      { title: "操作", dataIndex: "operation", scopedSlots: { customRender: "operation" } },
    ],
    dataSource2: [
      {key: 1, platformProfit: '', commissonRate: ''}
    ]
  };

  init = {
    ModalShow: false,
    ModalTitle: ["添加佣金模式", "修改佣金模式"],
    ModalTitleIndex: 0,
    confirmLoading: false,
    pagination: {
      pageNo: 1,
      pageSize: 10
    },
    /** 默认显示 固定比例， 1为阶梯比例 */
    mode: 0,
    key: 1,
    isModify: true,
    loading: false,
    loadingadd: false,
    editInitialMode: '' // 点击编辑的时候，默认的状态
  };

  form = {};
  
  @Lifecycle created() {
    this.formElement = this.$form.createForm(this);
    this.formElement2 = this.$form.createForm(this);
  }

  @Lifecycle mounted() {
    this.getCommissionList();
  }

  getCommissonModeName(type) {
    if (this.dictionary.commissonComputeMode.length > 0) {
      return this.dictionary.commissonComputeMode.find(item => item.value == type)?.name
    }
    return type;
  }

  checkValidator(rule, value, callback) {
    if (!value) callback("固定比例不能为空且大于0");
    if (parseFloat(value) < 0) callback("固定比例不能为空且大于0");
    callback()
  }

  getRate(item) {
    if (item?.commissonComputeMode === 0) {
      return `${item.fixedRate}%`
    } else {
      return `${item.minRate || 0}-${item.maxRate || 0}%`
    }
  }

  changeModeType() {
    this.init.pagination.pageNo = 1;
    this.table.pagination.current = 1;
  }

  changeMode(value) {
    this.init.mode = value;
    // 编辑的时候，从固定比率切换到阶梯比率，清空之前选择的阶梯比率
    if (this.init.editInitialMode != 1) {
      this.table.dataSource2 = [];
    }
  }

  changePagination(pagination) {
    this.table.pagination.current = pagination.current;
    this.init.pagination.pageNo = pagination.current;
    this.getCommissionList();
  }

  addTableRows() {
    let rowIndex = this.table.dataSource2.length + Math.random();
    this.table.dataSource2.push({
      key: ++rowIndex, 
      platformProfit: '',
      commissonRate: ''
    });
  }

  removeTableRows(key) {
    this.table.dataSource2 = this.table.dataSource2.filter(item => item.key !== key); 
  }

  addCommission() {
    this.init.ModalTitleIndex = 0;
    this.init.ModalShow = true;
    this.form = {};
    this.init.mode = 0;
    this.table.dataSource2 = [];
    this.init.isModify = false;
  }

  /** 修改input里面的value, 联动表单 */
  changeInputValue(event, key, type) {
    this.table.dataSource2.forEach(item => {
      if (item.key === key) {
        item[type] = event.target.value
      }
    });
  }

  async showUpdate(rowId) {
    this.init.ModalTitleIndex = 1;
    this.init.rowId = rowId;
    const { data: res } = await Api.queryDetail({ id: rowId });
    if (res?.body?.code === 1  && typeof res?.body?.data === 'object') {
      this.form = res.body.data;
      if (typeof this.form.commissonComputeMode === "number") {
        this.form.commissonComputeMode = '' + this.form.commissonComputeMode;
      }
      // 点击编辑时的默认数据
      this.init.editInitialMode = res.body.data?.commissonComputeMode == 1 ? 1 : 0;
      // 如果是阶梯比率
      if (res.body.data?.commissonComputeMode == 1) {
        this.init.mode = 1;
        if (Array.isArray(res.body.data.items)) {
          /** 还原table的值 */
          this.table.dataSource2 = res.body.data.items.map((v, index) => {
            v.key = index;
            return v;
          })
        }
      } else {
        this.init.mode = 0;
      }
    }
    this.init.isModify = true;
    this.init.ModalShow = true;
  }

  async getCommissionList(type) {
    if (type) {
      this.changeModeType();
    }
    this.formElement.validateFields(async (err, values) => {
      if (!err) {
        this.init.loading = true;
        const { data: res } = await Api.getCommissionList(Object.assign(values, this.init.pagination));
        if (res?.body?.code === 1 && res?.body?.data?.records) {
          this.table.dataSource = res.body.data.records;
        }
        this.init.loading = false;
        this.table.pagination.total = res?.body?.data?.totalCount;
      }
    });
  }

  async updateCommission() {
    let params = {};

    this.formElement2.validateFields(async (err, values) => {
      if (!err) {
        if (this.init.mode === 0) {
          params = values;
        } else {
          // 过滤掉空数据
          let addItems = [...this.table.dataSource2].filter(item => {
            return item.platformProfit !== '' || item.commissonRate !== '';
          });
          // 删除key值
          addItems.forEach(item => {
            delete item.key
          });
          // 合并params
          params = Object.assign(values, {
            items: addItems
          });
        }
        this.init.loadingadd = true;
        // 新增佣金模式
        if (!this.init.isModify) {
          const { data: res } = await Api.addCommission(params); 
          if (res?.body?.code === 1) {
            this.successCallBack(res);
          }
        } else {
          // 修改佣金模式
          params.id = this.init.rowId;
          const { data: res } = await Api.editCommission(params);
          if (res?.body?.code === 1) {
            this.successCallBack(res);
          }
        }
        this.init.loadingadd = false;
      }
    });
  }

  successCallBack(res) {
    this.init.ModalShow = false;
    Notice.success({
        message: this.init.ModalTitle[this.init.ModalTitleIndex],
        description: res.body.message
    });
    this.getCommissionList(true);
  }

}
</script>

<style lang="scss">
.buss-container {
    height: 100%; padding: 15px 10px; box-sizing: border-box;
    overflow-y: auto; border-radius: 4px; background-color: #fff;
}
.commission-box {
  .ant-form-item-label label{
    display: inline-block;
    width: 120px;
    text-align: right;
  }
  .commission-btn {
    margin-top: 20px;
    margin-left: 120px;
  }
}
</style>

