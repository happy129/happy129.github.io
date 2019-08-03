<template>
    <section class="member-info-container">
        <div class="member-group-hd">
            <div class="buttons">
                <a-button v-permission="20003" type="primary" v-on:click="addMember">添加</a-button>
                <a-button v-permission="20004" type="primary" v-on:click="deleteMemberAction">删除</a-button>
            </div>
            <div class="tips">
                <a-icon type="exclamation-circle" />
                <span>编号为 1 的会员组是系统默认会员组，禁止删除！</span>
            </div>
        </div>
        <div class="member-group-bd">
            <a-table ref="table" :key="table.key" class="mytable" bordered :columns="table.columns" :loading="init.loading" :rowKey="e=> e.groupId" :dataSource="table.dataSource" :rowSelection="table.rowSelection" :pagination="table.pagination" @change="changeTablePagenation">
                <template slot="userCount" slot-scope="text, record">
                    <router-link class="g-blue bold" :to="`/dashboard/memberManage?id=${record.groupId}`">{{record.userCount}}</router-link>
                </template>
                <template slot="operate" slot-scope="text, record"> 
                    <a-button v-permission="20005" type="primary" size="small" v-on:click="() => updateMember(record)">修改</a-button> 
                </template>
            </a-table>
        </div>
        <div class="member-group-ft" v-permission="20006">
            <table class="g-table">
                <thead>
                    <tr>
                      <th>初始会员组</th>
                      <th>目标会员组</th>
                      <th>统计开始时间</th>
                      <th>统计结束时间</th>
                      <th>单笔最低金额</th>
                      <th>条件一：累计有效充值次数</th>
                      <th>条件二：累计有效充值金额</th>
                      <th>转移条件限制</th>
                      <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <a-select v-model="move.initialGroupId"  style="width: 120px">
                                <a-select-option v-for="(item, index) in userGroup1" :key="index" :value="item.groupId">{{item.groupName}}</a-select-option>
                            </a-select>
                        </td>
                        <td>
                            <a-select v-model="move.targetGroupId" style="width: 120px">
                               <a-select-option v-for="(item, index) in userGroup2" :key="index" :value="item.groupId">{{item.groupName}}</a-select-option>
                            </a-select>
                        </td>
                        <td><a-date-picker placeholder="统计开始日期"  @change="(date, datestring) => onChangeDate(date, datestring, 'start')"  format="YYYY-MM-DD 00:00:00" /></td>
                        <td><a-date-picker placeholder="统计结束日期"  @change="(date, datestring) => onChangeDate(date, datestring, 'end')"  format="YYYY-MM-DD 23:59:59" /></td>
                        <td><a-input class="w120"  v-model="move.singleRechargeAmount" v-number="true"/></td>
                        <td><a-input class="w120"  v-model="move.totalRechargeTimes" v-number="true"/></td>
                        <td><a-input class="w120"  v-model="move.totalRechargeAmount" v-number="true"/></td>
                        <td>
                            <a-select v-model="move.condition">
                              <a-select-option value="1">条件满足其一即可</a-select-option>
                              <a-select-option value="2">条件必须全部满足</a-select-option>
                              <a-select-option value="0">无条件全部转移</a-select-option>
                            </a-select>
                        </td>
                        <td><a-button @click="doMove" class="common-green-btn">转移</a-button></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <a-modal :title="`${init.ModalTitle[init.ModalTitleIndex]}`" :destroyOnClose="true" v-model="init.ModalShow"  @ok="addMemberAction" :confirmLoading="init.confirmLoading" okText="保存">
            <a-form layout="inline" :form="formElement">
                <a-form-item label="会员组名称">
                    <a-input  v-decorator="['userName', {initialValue: init.form.userName, rules: [{ required: true, message: '会员组名称不能为空' }]}]" />
                </a-form-item>
            </a-form>
        </a-modal>
    </section>
</template>

<script>
import Vue from 'vue'
import * as Api from '@api/member'
import { Component, Lifecycle, Watch } from 'vue-decorators'
import { Modal } from 'ant-design-vue';

@Component
export default class MemberGroupManage extends Vue {
    table = {
        key: 1,
        columns: [
            { title: '编号',  dataIndex: 'groupId'},
            { title: '会员组名称', dataIndex: 'groupName'}, 
            { title: '会员数量', dataIndex: 'userCount', scopedSlots: { customRender: 'userCount' }}, 
            { title: '操作',  dataIndex: 'operate', scopedSlots: { customRender: 'operate' } }
        ],
        selectedRowKeys: [],
        rowSelection: {
            getCheckboxProps(record) {
                return ({ props: { disabled: record.groupType === 0  }})
            },
            onChange: (selectedRowKeys) => {
               this.table.selectedRowKeys = selectedRowKeys;
            },
        },
        dataSource: [],
        pagination: { total: 0, current: 1 }
    };
    
    requestParams = {
        getAllUserGroup: {  pageNo: 1,  pageSize: 10 }
    };

    userGroup1 = [];
    userGroup2 = [];

    move = {
        initialGroupId: "",
        targetGroupId: "",
        startTime: "",
        endTime: "",
        singleRechargeAmount: "",
        totalRechargeTimes: "",
        totalRechargeAmount: "",
        condition: "1"
    }

    init = {
        ModalShow: false,
        ModalTitle: ['添加会员组', '修改会员组'],
        ModalTitleIndex: 0,
        confirmLoading: false,
        form: { userName: '', groupId: ''},
        error: { msg: ''},
        tips: ['提示', '请勾选要删除的组别', '确定要删除选中的组别吗?'],
        loading: false
    };

    @Lifecycle created() {
      this.formElement = this.$form.createForm(this);
    }

    @Lifecycle mounted() {
        this.getAllUserGroup();
        this.queryAllUserGroup();
    }

    // 执行移动会员组
    async doMove() {
        if (this.move.initialGroupId === this.move.targetGroupId) {
            return this.$message.error("目标会员组不能与初始化会员组一致！");
        }
        if (isNaN(this.move.singleRechargeAmount) || isNaN(this.move.totalRechargeAmount)) {
            return this.$message.error("金额只能为数字");
        }
        if (isNaN(this.move.totalRechargeTimes)) {
            return this.$message.error("充值次数只能为数字")
        }
        if (!await this.$confirm({title: "确认要转移该会员组吗?"})) return;
        const res = await this.$service.fetch("/lottery-admin-api/userGroup/moveUserGroup", this.move);
        if (res.code !== 1) return res.message && this.$message.error(res.message);
        this.$message.success(res.message);
        this.getAllUserGroup();
    }

    onChangeDate(date, datestring, type) {
        if (type === 'start') {
            // 组件上有清空操作
            this.move.startTime = datestring
        } else {
            this.move.endTime = datestring;
        }
    }

    async queryAllUserGroup() {
        const res = await this.$service.fetch("/lottery-admin-api/userGroup/queryAllUserGroup");
        if (res.code !== 1) return res.message && this.$message.error(res.message);
        if (res.data instanceof Array) {
            this.userGroup1 = [...res.data];
            this.userGroup2 = [...res.data];

            this.move.initialGroupId = this.userGroup1.length > 0 ? this.userGroup1[0].groupId : '';
            this.move.targetGroupId = this.userGroup2.length > 0 ? this.userGroup2[0].groupId : '';
        }
    }

    addMember() { 
        this.init.ModalTitleIndex = 0;
        this.init.ModalShow = true; 
        this.init.form.userName = '';
    }

    updateMember(item) {
        this.init.ModalTitleIndex = 1;
        this.init.ModalShow = true;
        this.init.form.groupId = item.groupId;
        this.init.form.userName = item.groupName;
    }
    
    changeTablePagenation(pagination) {
        this.table.pagination.current = pagination.current;
        this.requestParams.getAllUserGroup.pageNo = pagination.current;
        this.table.key = Date.now();
        this.table.selectedRowKeys = [];
        this.getAllUserGroup();
    }
   
    async getAllUserGroup() {
        this.init.loading = true;
        const { pageNo, pageSize} = this.requestParams.getAllUserGroup;
        const res = await this.$service.fetch('/lottery-admin-api/userGroup/queryPageUserGroup', { pageNo, pageSize });
        this.init.loading = false;
        if (res.code !== 1) return res.message && this.$message.error(res.message);
        this.table.dataSource = res.data.records;
        this.table.pagination.total = res.data.totalCount;
    }
    
    async addMemberAction() {
      this.formElement.validateFields(async (err, values) => {
        if (!err) {
          this.init.confirmLoading = true;
          if (this.init.ModalTitleIndex === 0) {
              const { data: response } = await Api.addUserGroup({
                  name: values.userName
              });
              this.init.confirmLoading = false;
              if (response.body && response.body.code == 1) {
                  this.init.ModalShow = false;
                  this.getAllUserGroup();
              }
          } else { 
            this.updateMemberAction(values);
          }
        }
      });
    }

    deleteMemberAction() {
      if (this.table.selectedRowKeys.length === 0) {
          Modal.warning({ 
            title: this.init.tips[0], 
            content: this.init.tips[1] 
          });
          return
      } 

      Modal.confirm({
          title: this.init.tips[0], 
          content: this.init.tips[2],
          onOk: () => {
            this.delteMemberCallback(); 
          }
      });
    }

    async updateMemberAction(values) {
        const { data: response } = await Api.editUserGroup({
            groupName: values.userName,
            id: this.init.form.groupId
        });
        this.init.confirmLoading = false;
        if (response.body && response.body.code == 1) {
            this.init.ModalShow = false;
            this.getAllUserGroup();
        }
    }

    async delteMemberCallback() {
        const params = this.table.selectedRowKeys.map(item => ({ id: item}));
        const { data: response } = await Api.removeUserGroupByIds({ list:  params})
        if (response.body && response.body.code == 1) {
            // 删除完回到第一页
            this.table.pagination.current = 1;
            this.requestParams.getAllUserGroup.pageNo = 1;
            this.getAllUserGroup();
            this.table.selectedRowKeys = [];
            this.table.key = Date.now();
        }
    }

}
</script>

<style lang="scss">
    .member-info-container {
        height: 100%; padding: 15px 10px; box-sizing: border-box;
        overflow-y: auto; border-radius: 4px; background-color: #fff;
        display: flex; flex-direction: column; justify-content: space-between;
    }
    .member-group-bd { flex: 1;}

    .member-group-hd {
        display: flex; align-items: flex-end;  margin-bottom: 10px;
        .buttons button{ margin-right: 10px; }
        .tips { 
            i {color: rgb(244, 165, 42); font-size: 18px; margin: 0 5px 0 10px;}
        }
    }

    .member-group-ft { margin-top: 10px; }
</style>

