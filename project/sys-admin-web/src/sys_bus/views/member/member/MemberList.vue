<template>
  <!--会员列表-->
  <div class="member-list">
    <div class="member-list-hd">
      <a-form layout="inline" :form="formElement" @submit="submitAction">
        <date-range title="注册时间" @change="changeDate" ref="rg" />
        <a-form-item>
          <a-select v-model="form.groupId" @change="changeSelection" :dropdownMatchSelectWidth="false">
            <a-select-option value="">全部会员组</a-select-option>
            <a-select-option v-for="(item, index) in init.selectOptions" :key="index" :value="item.groupId">{{ item.groupName }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-select defaultValue="" v-model="form.status" :dropdownMatchSelectWidth="false" @change="changeSelection">
            <a-select-option value="">会员状态</a-select-option>
            <a-select-option v-for="(item, index) in dictionary.userStatus" :key="index" :value="item.value">{{ item.name }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-select defaultValue="" v-model="form.isTopUp" :dropdownMatchSelectWidth="false" @change="changeSelection">
            <a-select-option value="">是否充值</a-select-option>
            <a-select-option v-for="(item, index) in dictionary.booleanType" :key="index" :value="item.value">{{ item.name }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-select v-model="form.isOnline" :dropdownMatchSelectWidth="false" @change="changeSelection">
            <a-select-option value="" :key="123">在线状态</a-select-option>
            <a-select-option v-for="(item, index) in dictionary.onlineStatus" :key="index" :value="item.value">{{ item.name }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="账号">
          <a-input v-model="form.userName" placeholder="请输入会员账号" />
        </a-form-item>
        <a-form-item label="余额">
          <a-form-item> <a-input type="number" @change="changeInput" :min="0" v-model="form.minBalance" /> </a-form-item>
          <a-form-item>-</a-form-item>
          <a-form-item> <a-input type="number" @change="changeInput" :min="0" v-model="form.maxBalance" /> </a-form-item>
        </a-form-item>
        <a-form-item label="上级代理">
          <a-input v-model="form.parentName" />
        </a-form-item>
        <a-form-item label="排序">
          <a-select style="width:120px;" v-model="form.sortField">
            <a-select-option v-for="(item, index) in dictionary.sortField" :key="index" :value="item.value">{{ item.name }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="vip等级">
          <a-input v-model="form.vipLevel" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" :loading="init.loading">查询</a-button>
        </a-form-item>
      </a-form>
    </div>
    <div class="member-list-bd page-under-table">
      <div class="member-list-hd1" v-permission="20010">
        <a-select defaultValue="" v-model="init.operationId" :dropdownMatchSelectWidth="false">
          <a-select-option value="">操作</a-select-option>
          <a-select-option v-for="(item, index) in dictionary.userOperation" :key="index" :value="item.value">{{ item.name }}</a-select-option>
        </a-select>
      </div>
      <div class="member-list-hd1" v-permission="20010">
        <a-button type="primary" @click.prevent="doOperation(1)">执行</a-button>
      </div>
      <div class="member-list-hd1" v-permission="20011">
        <a-select v-model="init.groupId" :dropdownMatchSelectWidth="false">
          <a-select-option value="">移动到会员组</a-select-option>
          <a-select-option v-for="(item, index) in init.selectOptions" :key="index" :value="item.groupId">{{ item.groupName }}</a-select-option>
        </a-select>
      </div>
      <div class="member-list-hd1" v-permission="20011">
        <a-button type="primary" @click.prevent="doOperation(2)">移动</a-button>
      </div>
    </div>
    <div class="member-list-ft">
      <a-table :key="table.key" class="mytable" bordered :loading="init.loading" :columns="table.columns" :dataSource="table.tableData" :rowKey="e => e.id" :rowSelection="table.rowSelection" :pagination="table.pagination" @change="changePagination">
        <span slot="parentName" slot-scope="text, records">{{ records.parentName }}</span>
        <!-- $btns.includes(20009) &&  -->
        <a href="javascript:;" slot="userName" slot-scope="text, records" v-permission.link="20009" @click.prevent="$btns.includes(20009) && showDetail(records.id, 'account')">{{ text }}</a>
        <div slot="isOnline" slot-scope="text, records">
          <p>{{ getTextByDictionary(records.status, dictionary.userOperation) }}</p>
          <p>{{ records.isOnline == 0 ? "离线" : "在线" }}</p>
        </div>
        <span slot="balance" slot-scope="text, records">{{ typeof records.balance === "number" ? records.balance.toFixed(2) : records.balance }}</span>
        <span slot="isTopUp" slot-scope="text, records"> {{ records.isTopUp === 0 ? "否" : "是" }}</span>
        <!-- $btns.includes(20012) &&  -->
        <a href="javascript:;" slot="bankInfo" slot-scope="text, records" v-permission.link="20012" @click.prevent="$btns.includes(20012) && showDetail(records, 'bankInfo')">银行信息</a>
        <!-- $btns.includes(20013) &&  -->
        <a href="javascript:;" slot="caiwu" slot-scope="text, records" v-permission.link="20013" @click.prevent="$btns.includes(20013) && showDetail(records, 'caiwu')">查看财务</a>
      </a-table>
    </div>
    <a-modal title="会员详情" v-model="init.memberModalVisible" :width="800" :footer="null" :destroyOnClose="true" :maskClosable="false">
      <MemberInfo :userId="init.userId" @close="init.memberModalVisible = false" />
    </a-modal>
  </div>
</template>

<script>
import Vue from "vue"
import { Component, Lifecycle, InjectComponents, Prop } from 'vue-decorators'
import * as Api from '@api/member'
import { Modal } from 'ant-design-vue'
import MemberInfo from "@views/member/info/MemberInfo"
import DateRange from '@/components/date-range/DateRange'
import moment from "moment"

@Component({ dictionary: 'userStatus,onlineStatus,sortField,booleanType,userOperation' })
@InjectComponents({ MemberInfo, DateRange })
export default class MemberList extends Vue {
    table = {
        key: 1,
        columns : [
            { title: '账号', dataIndex: 'userName' , scopedSlots: {customRender: 'userName'}}, 
            { title: '真实姓名', dataIndex: 'realName' }, 
            { title: '状态', dataIndex: 'isOnline',  scopedSlots: {customRender: 'isOnline'} }, 
            { title: '是否充值', dataIndex: 'isTopUp', scopedSlots: {customRender: 'isTopUp'}  }, 
            { title: '银行信息', dataIndex: 'bankInfo', key: 'bankInfo', scopedSlots: {customRender: 'bankInfo'} }, 
            { title: '财务', dataIndex: 'caiwu', scopedSlots: {customRender: 'caiwu'} }, 
            { title: '站内余额', dataIndex: 'balance',  scopedSlots: {customRender: 'balance'}},
            { title: '会员组', dataIndex: 'groupName' },
            { title: "上级代理", dataIndex: 'parentName',  scopedSlots: {customRender: 'parentName'}},
            { title: "注册IP", dataIndex: "registerIp" },
            { title: "登陆IP", dataIndex: "loginIp" },
            { title: "注册域名", dataIndex: "registerWebName" },
            { title: "注册时间", dataIndex: "registerTime" },
            { title: "登录时间", dataIndex: "lastLoginTime" }
        ],
        tableData: [],
        selectedNumbers: [],
        rowSelection: {
            onChange: (selectedRowKeys) => {
               this.table.selectedNumbers = selectedRowKeys;
            }
        },
        pagination: {
            current: 1,
            total: 0
        }
    };

    form =  {
        startTime: '', 
        endTime: '', 
        groupId: '', 
        status: '', 
        isTopUp: '', 
        minBalance: '', 
        maxBalance: '', 
        isOnline: '', 
        userName:'', 
        platformId: 1,
        sortField: '1',
        parentName:'',
        vipLevel: ''
    };

    // 组件内部公用数据
    init = {
        pageNo: 1,
        pageSize: 10,
        selectOptions: [],
        userStatus: ['正常', '锁定', '删除'],
        memberModalVisible: false,
        userId: '',
        operationId: '',
        groupId: '',
        errorTips: ['提示', '请先选择用户', '操作成功'],
        loading: false
    }

    @Prop({type: [String, Number]}) queryId;

    @Lifecycle created() {
        this.formElement = this.$form.createForm(this);
    }

    @Lifecycle activated() {
       // this.setInitialDate();
       if (this.$route.query.id || this.$route.query.vipLevel || this.$route.query.memberId || this.$route.query.userName) {
           this.initActiveParms();
           this.setInitialParams();
           this.getUserInfo();
       }
    }

    @Lifecycle mounted() {
      //this.setInitialDate();
      this.setInitialParams();
      this.getAllUserGroupName();
      this.getUserInfo();
    }

    initActiveParms() {
        this.form.userName = "";
        this.form.minBalance = "";
        this.form.maxBalance = "";
        this.form.parentName = "";
        this.form.startTime = "";
        this.form.endTime = "";
        this.form.groupId = "";
        this.form.isOnline = "";
        this.form.isTopUp = "";
        this.form.status = "";
    }

    setInitialParams() {
      if (this.$route.query.id !== "" && this.$route.query.id) {
        this.form.groupId = +this.$route.query.id
      }
      if (this.$route.query.vipLevel !== ""  && this.$route.query.vipLevel) {
        this.form.vipLevel = this.$route.query.vipLevel
      }
      if (this.$route.query.memberId !== "" && this.$route.query.memberId) {
        this.form.userId = this.$route.query.memberId  
      }
      if (this.$route.query.userName !== "" && this.$route.query.userName) {
        this.form.userName = this.$route.query.userName  
      }
    }

    changeInput(e) {
        e.target.value = e.target.value.replace(/[^\d+|.]/, '');
    }

    setInitialDate() {
         //设置时间
      const d = new Date();
      this.$refs.rg.setDateRangeValues(d);
      this.form.startTime = moment(d).format("YYYY-MM-DD 00:00:00");  
      this.form.endTime = moment(d).format("YYYY-MM-DD 23:59:59");
    }

    getTextByDictionary(id, array) {
      return array.find(item => item.value == id)?.name;
    }

    // 下拉框改变
    changeSelection() {
        this.init.pageNo = 1;
        this.table.pagination.current = 1;
    }

    changePagination(pagination) {
        this.table.pagination.current = pagination.current;
        this.init.pageNo = pagination.current;
        this.table.key = Date.now();
        this.table.selectedNumbers = [];
        this.getUserInfo();
    }

    getStatus(statusIndex) {
        if (!statusIndex) statusIndex = 0;
        return this.init.userStatus[statusIndex]
    }
    
    showDetail(query, type) {
        this.init.userId = query;
        console.log("12")
        if (type === 'account') {
            this.init.memberModalVisible = true;
        } else if (type === 'bankInfo') {
            this.$router.push(`/finance/membership-bank-information?account=${query.userName}`)
        } else if (type === 'caiwu') {
            this.$router.push(`/finance/finance-check?account=${query.userName}`);
        }
    }
   
    changeDate(startTime, endTime, datestring, type) {
        if (type === "start") {
            this.form.startTime = datestring
        } else {
            this.form.endTime = datestring
        }
    }

    submitAction(event) {
      event.preventDefault();  
      this.changePagination({current: 1});
    }

    //type = 1 执行踢线或  type = 2 移动用户分组
    async doOperation(type) {
      const userIds = this.table.selectedNumbers;
      const operationId = this.init.operationId;
      if (userIds.length === 0) {
        Modal.warning({ title: this.init.errorTips[0], content: this.init.errorTips[1] });
        return
      }
      if (type == 1) {
        if (this.init.operationId === "") {
            Modal.warning({ title: this.init.errorTips[0], content: "请先选择操作" });
            return
        }
        if (operationId == 4) {
          return 
        } else if (operationId == 0) { //踢线
          const params = [...userIds].map(v => ({id: v}));
          const { data: res } = await Api.batchOfflineByIds({ list: params });
          if (res?.body?.code === 1) {
            this.operationSuccessCallback();
          }
        } else { 
          const params = [...userIds].map(v => {
            return { id: v, status: this.init.operationId}
          });
          const { data: res } = await Api.batchEditUserStatusOrGroup({
            list:params
          });
          if (res?.body?.code === 1) {
            this.operationSuccessCallback();
          }
        }
      } else if (type == 2) {
        if (this.init.groupId === "") {
            Modal.warning({ title: this.init.errorTips[0], content: "请先选择会员组" });
            return
        }
         const params = [...userIds].map(v => {
           return {id: v, groupId: this.init.groupId }
         });
         const { data: res } = await Api.batchEditUserStatusOrGroup({ list: params });
         if (res?.body?.code === 1) {
           this.operationSuccessCallback();
         }
      }
    }

    operationSuccessCallback () {
      Modal.warning({ 
        title: this.init.errorTips[0], 
        content: this.init.errorTips[2],
        onOk: () => {
          this.getUserInfo();
          this.table.selectedNumbers = [];
          this.table.key = Math.random();
        }
      });
    }

    // 获取会员组列表， 作为下拉选项
    async getAllUserGroupName() {
      const { data: response } = await Api.getAllUserGroupName();
      if (response?.body?.code === 1 && response?.body?.data instanceof Array) {
          this.init.selectOptions = response.body.data;
      }
    }

    // 根据条件查询列表
    async getUserInfo() {
      if (this.form.vipLevel != ""  && this.form.vipLevel <= 0) {
          return this.$message.error('没有该VIP等级');
      }
      this.init.loading = true;
      const { data: response } = await Api.getUserInfo(
          Object.assign(this.form, { pageNo: this.init.pageNo, pageSize: this.init.pageSize })
      );
      this.init.loading = false;
      if (response?.body?.code === 1 && response?.body?.data?.records instanceof Array) {
          this.table.tableData = response?.body?.data?.records;
          this.table.key = Date.now();
          this.table.pagination.total = response?.body?.data?.totalCount;
      } else {
          this.table.tableData = [];
      }
    }
}

</script>

<style lang="scss">
.member-list-hd {
  .ant-form {
    .ant-form-item {
      margin-right: 4px;
    }
    .ant-input {
      width: 120px;
    }
    .ant-calendar-picker-input {
      width: 180px !important;
    }
  }
}
.member-list-bd {
  display: flex;
  .member-list-hd1 {
    margin-right: 10px;
  }
}

.member-list-ft {
  margin-top: 15px;
}
</style>

