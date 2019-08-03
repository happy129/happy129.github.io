<template>
  <div class="page-container">
    <div class="mem-ignore-buttons">
      <a-button v-permission="20034" type="primary" @click="init.showModal=true">添加</a-button>
      <a-button v-permission="20035" type="primary" @click="freeByIds">批量免费</a-button>
      <a-button v-permission="20036" type="primary" @click="deteleByIds">删除</a-button>
      <a-button v-permission="20037" type="primary" @click="getReportIgnoreList(true)">刷新</a-button>
    </div>
    <div class="mt10">
      <a-form layout="inline"  v-permission="20038">
        <a-form-item label="免费会员额度">
          <a-input v-number="true" v-model="requestParams.modify.value1"/>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click.prevent="updateMemberFreeLimit(1)">提交</a-button>
        </a-form-item>
        <a-form-item>【免费会员账户的金额上限】</a-form-item>
        <a-form-item>
          <span class="g-red">备注：所有列表会员均为报表忽略；报表忽略会员，状态只能：收费->免费；免费会员不能够删除</span>
        </a-form-item>
      </a-form>
      <a-form layout="inline" v-permission="20039">
        <a-form-item label="额度恢复阈值">
          <a-input v-number="true" v-model="requestParams.modify.value2"/>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click.prevent="updateMemberFreeLimit(2)">提交</a-button>
        </a-form-item>
        <a-form-item>【免费会员账户金额低于此值时，恢复额度】</a-form-item>
        <a-form-item>
          <p class="g-blue bold">备注：只有免费会员下注系统彩才不影响系统彩的杀率；(PS：相当于，免费会员是随机的)</p>
        </a-form-item>
      </a-form>
      <a-form layout="inline" :form="formElement" v-permission="20040">
        <a-form-item label="会员账号查询">
          <a-input  v-model="requestParams.list.userName"/>
        </a-form-item>
        <a-form-item label="是否免费">
          <a-select defaultValue="" v-model="requestParams.list.isCountReport" @change="changeSelection">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="0">收费</a-select-option>
            <a-select-option value="1">免费</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" @click="getReportIgnoreList(true)" :loading="init.loading">提交</a-button>
        </a-form-item>
      </a-form>
    </div>
    <div class="g-gray-border mt15">
      <div class="mt15">
        <a-table class="mytable" 
          :key="table.key" bordered 
          :columns="table.columns" 
          :dataSource="table.dataSource" 
          :rowSelection="table.rowSelection" 
          :rowKey="e => e.id" :loading="init.loading" :pagination="table.pagination"
          @change="changeTablePagenation"
        >
          <template slot="isCountReport" slot-scope="text, records">{{records.isCountReport == 0 ? '收费' : '免费' }}</template>
          <template slot="operation" slot-scope="text, records">
            <a-button type="primary" v-permission="20042" size="small" :freeLoading="init.freeLoading" @click.prevent="setFreeById(records.id)" v-if="records.isCountReport == 0">免费</a-button>
            <a-button type="primary" v-permission="20041"  size="small" :freeLoading="init.freeLoading" @click.prevent="resetAmountLimit(records.id)" v-else>恢复额度</a-button>
          </template>
        </a-table>
      </div>
    </div>
    <!--弹窗 添加会员报表忽略-->
    <a-modal title="添加忽略" v-model="init.showModal" :footer="null" :destroyOnClose="true" :maskClosable="false">
      <div class="add-ignore-form">
        <a-form layout="inline" :form="formEl" @submit.prevent="submitAddMemberAction">
          <a-form-item label="会员账号">
          <a-textarea v-decorator="[ 'userName', {rules: [{ required: true, message: '请填写会员账号'}]} ]" :rows="8" size="large" placeholder="多个账号以英文，逗号隔开"/>
          </a-form-item>
          <div class="page-under-table">
            <a-form-item>
              <a-form-item label="谷歌验证码">
                <a-input  v-decorator="['googleCode',  {rules: [{ required:  userInfo.isGoogleVerficationEnabled===1, message: '请输入谷歌验证码,且不能有空格', whitespace: true }]}]"/>
              </a-form-item>
              <a-form-item>
                <a-button type="primary" html-type="submit">保存</a-button>
              </a-form-item>
            </a-form-item>
          </div>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>


<script>
import Vue from "vue";
import { Component, Lifecycle, State } from "vue-decorators";
import * as Api from "@api/member"

@Component
export default class MemberReportIgnore extends Vue {
  @State(s => s.auth.userInfo) userInfo;
  table = {
    key: 1,
    columns: [
      { title: "会员账号", dataIndex: "userName" },
      { title: "是否免费", dataIndex: "isCountReport", scopedSlots: { customRender: "isCountReport" }},
      { title: "更新时间", dataIndex: "updateTime" },
      { title: "操作", dataIndex: "operation", key: 4, scopedSlots: { customRender: "operation" } }
    ],
    dataSource: [],
    rowSelection: {
      onChange: (selectedRowKeys) => {
        this.table.selectedRowKeys = selectedRowKeys;
      }
    },
    selectedRowKeys: [],
    pagination: {
      total: 0,
      current: 1
    }
  };

  requestParams = {
   list: {
    userName: '',
    isCountReport: '',
    pageNo: 1,
    pageSize: 10
   },
   add: {
     userName: ''
   },
   modify: {
     code1: '',
     value1: '',
     code2: '',
     value2: ''
   }
  };

  init = {
    showModal: false,
    loading: false,
    freeLoading: false,
    tips: ["提示", "请先选择要免费的会员", "是否将该选中的会员设为免费会员？", "请先选择要删除的会员", "是否删除选中的会员？", '更新成功']
  };

  @Lifecycle created() {
    this.formElement = this.$form.createForm(this);
    this.formEl = this.$form.createForm(this);
  }

  @Lifecycle mounted() {
    this.getInitialValue();
    this.getReportIgnoreList();
  }

  async getInitialValue() {
    const res = await this.$service.fetch('/config-admin-api/configItem/queryByGroupCode', {
      groupCode: "reportIgnoreSetting"
    });
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data && res.data instanceof Array) {
      // 设置免费额度
      this.requestParams.modify.value1 = res.data.find(item => item.itemKey === "freeQuota")?.itemValue;
      // 设置默认恢复阈值
      this.requestParams.modify.value2 = res.data.find(item => item.itemKey === "recoveryThreshold")?.itemValue;
    }
  }

  changeTablePagenation(pagination) {
    this.table.pagination.current = pagination.current;
    this.requestParams.list.pageNo = pagination.current;
    this.table.selectedRowKeys = [];
    this.getReportIgnoreList();
  }

  changeSelection() {
    this.requestParams.list.pageNo = 1;
    this.table.pagination.current = 1;
  }

  async submitAddMemberAction() {
    this.formEl.validateFields(async (err, values) => {
      if (!err) { 
        const users = values.userName.replace(/\s+/g,'').split(/[,|，]/).filter(item => item !== '').map(item => ({userName: item}));
        if (users.length === 0) {
          await this.$confirm({title: this.init.tips[0], content: "会员账号不能为空"});
          return
        }
        const { data: res } = await Api.addUserToIgnore({ googleCode: values.googleCode?.replace(/\s+/g, ''), list: users });
        if (res?.body?.code === 1) {
          this.init.showModal = false;
          this.table.key = Date.now();
          this.requestParams.list.isCountReport = "";
          this.getReportIgnoreList(true);
        }
      }
    });
  } 

  async resetAmountLimit(id) {
    if (!this.requestParams.modify.value1) {
      return this.$message.error("请先设置免费会员额度");
    }
    const result = await this.$confirm({
      title: this.init.tips[0],
      content: "是否恢复该用户的额度？"
    });
    if (result) {
      this.resetAmountLimitCallback(id);
    }
  }

  async resetAmountLimitCallback(id) {
    this.init.freeLoading = true;
    const {data: res} = await Api.changeToQuotaByUserId({id});
    this.init.freeLoading = false;
    if (res?.body?.code === 1) {
      this.$message.success(res?.body?.message);
      this.getReportIgnoreList(true);
    }
  }

  async setFreeById(id) {
    this.$modal.confirm({
      title: this.init.tips[0],
      content: "是否将该用户设为免费会员",
      onOk: () => {
       this.setFreeByIdCallback(id);
      }
    });
  }

  async setFreeByIdCallback(id) {
    this.init.freeLoading = true;
    const {data: res} = await Api.batchEditUserFree({ list: [{id}] });
    this.init.freeLoading = false;
    if (res?.body?.code === 1) {
      this.getReportIgnoreList(true);
    }
  }

  async freeByIds() {
    if (this.table.selectedRowKeys.length === 0) {
      this.$modal.warning({ 
        title: this.init.tips[0],
        content: this.init.tips[1]
      });
      return 
    }
    this.$modal.confirm({
       title: this.init.tips[0],
       content: this.init.tips[2],
       onOk: () => {
         this.setfreeByids();
       }
    });
  }

  async setfreeByids() {
    const ids = this.table.selectedRowKeys.map(item => ({id: item}));
    const { data: res } = await Api.batchEditUserFree({ list: ids });
    if (res?.body?.code === 1) {
      this.getReportIgnoreList(true);
      this.clearSelect();
    }
  }


  clearSelect() {
    this.table.selectedRowKeys = [];
    this.table.key= Math.random();
  }

  deteleByIds() {
    if (this.table.selectedRowKeys.length === 0) {
      this.$modal.warning({ 
        title: this.init.tips[0],
        content: this.init.tips[3]
      });
      return 
    }
    this.$modal.confirm({
      title: this.init.tips[0],
      content: this.init.tips[4],
      onOk: async () => {
        const ids = this.table.selectedRowKeys.map(item => ({id: item}));
        const { data: res } = await Api.batchRemoveCollectFeeUser({ list: ids });
        if (res?.body?.code === 1) {
          this.getReportIgnoreList(true);
          this.clearSelect();
        }
      }
    })
  }

  async getReportIgnoreList(type) {
    if (type) this.changeSelection();
    
    this.init.loading = true;
    const { data: res } = await Api.getUserReportIgnoreInfo(this.requestParams.list);
    this.init.loading = false;
    if (res?.body?.code === 1 && res?.body?.data?.records) {
      this.table.key = Date.now();
      this.table.dataSource = res.body.data.records;
      this.table.pagination.total = res.body.data.totalCount;
    }
  }

  // type=1修改会员额度  type=2 修改回复阈值
  async updateMemberFreeLimit(type) {
    const groupCode = 'reportIgnoreSetting';
    const { data: res } = await Api.queryByGroupCode({ groupCode });

    if (res?.body?.code === 1 && Array.isArray(res?.body?.data))  {
      res.body.data.forEach(item => {
        if (item.itemKey === "freeQuota") {
          this.requestParams.modify.code1  = item.itemKey;
        } else {
          this.requestParams.modify.code2  = item.itemKey;
        }
      });
      if (type === 2) {
        // 需求 判断额度恢复阈值需大于免费会员额度
        const {value1, value2} = this.requestParams.modify;
        if (value1 !== "" && value2 !== "" && parseFloat(value2) > parseFloat(value1)) {
          this.$message.error("免费会员额度需大于额度恢复阈值");
          return;
        }
      }
      try {
        const { data: response } = await Api.editByRedisKey({
          itemKey: this.requestParams.modify[`code${type}`],
          groupCode: groupCode,
          itemValue: this.requestParams.modify[`value${type}`]
        });  

        if (response?.body?.code === 1) {
          this.$modal.warning({
            title: this.init.tips[0],
            content: this.init.tips[5]
          });   
        }
      } catch(e) {
        console.warn(e)
      }
    }
  }

}
</script>

<style lang="scss">
.page-container {
  height: 100%;
  overflow-y: auto;
}

.mem-ignore-buttons {
    button { margin-right: 10px; }
}
.add-ignore-form /deep/ {
  .ant-form-item-control {
    .ant-form-item-children {
      textarea {
        width: 360px;
        display: inline-block;
      }
    }
  }
  .page-under-table {
    display: flex;
    justify-content: center;
  }
}
</style>
