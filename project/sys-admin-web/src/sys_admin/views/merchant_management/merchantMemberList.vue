<template>
  <section class="buss-container" :key="updateKey">
    <a-form layout="inline" :form="formElement">
      <a-row :gutter="24">
        <a-col>
          <a-form-item class="date-rg">
            <DateRange title="注册时间" @change="changeDate" ref="rg"/>
          </a-form-item>
          <a-form-item label="商户名称">
            <a-select showSearch style="width: 120px" v-decorator="['platformId', {initialValue: platformQueryAllByListData[0].id}]" 
						placeholder="请选择" v-if="platformQueryAllByListData[0]" :dropdownMatchSelectWidth="false" @change="changePlatform" >
              <a-select-option v-for="item in platformQueryAllByListData" :key="item.id" :value="item.id" >{{item.platformName}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="会员组">
            <a-select style="width: 120px" v-decorator="['groupId', {initialValue: ''}]" placeholder="会员组" :dropdownMatchSelectWidth="false" >
              <a-select-option :value="''">全部</a-select-option>
              <a-select-option v-for="(item,i) in userGroupGetAllUserGroupNameData" :key="i" :value="`${item.groupId}`" >{{item.groupName}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="会员状态">
            <a-select style="width: 80px" v-decorator="['status', {initialValue: ''}]" placeholder="会员状态" >
              <a-select-option :value="''">全部</a-select-option>
              <a-select-option v-for="(item,i) in dictionary.userStatus" :key="i" :value="`${item.value}`" >{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="是否充值">
            <a-select style="width: 80px" v-decorator="['isTopUp', {initialValue: ''}]" placeholder="是否充值" >
							<a-select-option :value="''">全部</a-select-option>
              <a-select-option v-for="(item,i) in dictionary.booleanType" :key="i" :value="`${item.value}`" >{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="在线状态">
            <a-select style="width: 80px" v-decorator="['isOnline',{initialValue: ''}]" placeholder="在线状态" >
              <a-select-option :value="''">全部</a-select-option>
              <a-select-option :value="0">离线</a-select-option>
              <a-select-option :value="1">在线</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col>
          <a-form-item label="余额">
            <a-input style="width:100px; text-align:center;" v-number="true" v-decorator="['minBalance', { initialValue: '', rules: [{ required: false, message: '请输入正确金额', pattern: /^\d+\.?\d{0,2}$/ }]}]"/>-
            <a-input style="width:100px;text-align:center;" v-number="true" v-decorator="['maxBalance', { initialValue: '', rules: [{ required: false, message: '请输入正确金额', pattern: /^\d+\.?\d{0,2}$/ }]}]"/>
          </a-form-item>

          <a-form-item label="账号">
            <a-input v-decorator="['userName', {initialValue: ''}]"/>
          </a-form-item>

          <a-form-item label="上级代理">
            <a-input placeholder="上级代理" v-decorator="['parentName', {initialValue: ''}]" style="width:120px;" />
          </a-form-item>
          <a-form-item label="排序">
            <a-cascader :options="cascaderOptions" @change="changeCascader" placeholder="请选择" />
          </a-form-item>

          <a-form-item>
            <a-button type="primary" html-type="submit" :loading="init.loading" @click="_userGetUserInfo(true)">查询</a-button>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

    <div class="page-under-table">
      <a-table size="small" :columns="table.columns" :dataSource="table.dataSource" :rowKey="(e, index) => index" :pagination="false" :loading="init.loading" >
        <template slot="userNameAndrealName" slot-scope="r, t">
          <div>{{t.userName}}</div>
          <div>{{t.realName}}</div>
        </template>

        <template slot="groupName" slot-scope="r, t">
          <div>{{t.groupName}}</div>
          <div>{{t.parentName}}</div>
        </template>

        <template slot="status" slot-scope="r, t">
          <div>{{obj[t.status]}}</div>
          <div> {{isOnline[t.isOnline]}}<span v-if="loginDev[t.clientType]">-</span>{{loginDev[t.clientType]}} </div>
        </template>

        <template slot="isTopUp" slot-scope="r, t">
          <div>{{isTopUp[t.isTopUp]}}</div>
          <div>{{t.balance}}</div>
        </template>

        <template slot="registerIpAndLoginIp" slot-scope="r, t">
          <div>{{t.registerIp}}</div>
          <div>{{t.loginIp}}</div>
        </template>

        <template slot="registerTimeAndLastLoginTime" slot-scope="r, t">
          <div>{{t.registerTime}}</div>
          <div>{{t.lastLoginTime}}</div>
        </template>
      </a-table>

      <div style="text-align:right;margin-top:10px;">
        <a-pagination :current="pagination.current" :total="pagination.total" @change="changePagination" @showSizeChange="showSizeChange" />
      </div>
    </div>
  </section>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, Watch, Computed } from "vue-decorators";
import { userGetUserInfo, userGroupGetAllUserGroupName } from "@api/merchant";
import { platformQueryAllByList } from "@api/configs";
import { DateSwitch } from "@/components/switch";
import  DateRange  from "@/components/date-range/DateRange"
import moment from "moment"

@Component({
  dictionary: "booleanType,userStatus,sortField,onlineStatus,sortType"
})
@InjectComponents({ DateRange })
export default class MerchantMemberList extends Vue {

  pagination = { total: 0, current: 1 };
  pageSize = 10;

  init = { loading: false };
  updateKey = 1;

  async changePagination(page, pageSize) {
    this.pagination.current = page;
    this.pageSize = pageSize;
    await this._userGetUserInfo();
  }

  async showSizeChange(page, pageSize) {
    this.pagination.current = page;
    this.pageSize = pageSize;
    await this._userGetUserInfo();
  }

  isOnline = { 0: "离线", 1: "在线" };
  loginDev = { 1: "Android", 2: "IOS", 3: "H5", 4: "PC" };
  obj = { 1: "正常", 2: "锁定", 3: "删除" };
  isTopUp = { "-1": "是否充值", 0: "未充值", 1: "已充值" };

  table = {
    columns: [
      { title: "商户名称", dataIndex: "platformName" },
      { title: "账户", children: [{ title: "真实姓名", scopedSlots: { customRender: "userNameAndrealName" } }] },
      { title: "状态", scopedSlots: { customRender: "status" } },
      { title: "是否充值", children: [{ title: "站内余额", scopedSlots: { customRender: "isTopUp" } }] },
      { title: "会员组", children: [{ title: "上级代理", scopedSlots: { customRender: "groupName" } }] },
      { title: "注册IP", children: [{ title: "登录IP", scopedSlots: { customRender: "registerIpAndLoginIp" } }] },
      { title: "注册域名", dataIndex: "registerWebName" },
      { title: "注册时间", children: [{ title: "登录时间", scopedSlots: { customRender: "registerTimeAndLastLoginTime" } }] }
    ],
    dataSource: []
  };

  userGroupGetAllUserGroupNameData = [];
  platformQueryAllByListData = [];

  startTime = "";
  endTime = "";
  // 级联选择
  cascaderOptions = [];
  // 级联选择返回的数据
  cascaderSelected = {
    sortField: "",
    sortType: ""
  };


  @Lifecycle async created() {
		this.formElement = this.$form.createForm(this);
  }
  // product 做了全局缓存策略
  @Lifecycle async activated() {
    if (this.$route.params.merchantMemberId) {
      this.updateKey = Date.now();
    }
    await this.$tools.delay(100);
    if (this.$route.params.createTime) {
      // const d = new Date();
      // this.startTime = moment(this.$route.params.createTime).format("YYYY-MM-DD 00:00:00");
      // this.endTime = moment(d).format("YYYY-MM-DD 23:59:59");
      // this.$refs.rg.setDateRangeValues(this.startTime, this.endTime);
    }
    await this._platformQueryAllByList();
    await this._userGroupGetAllUserGroupName(this.platformQueryAllByListData[0].id);
    await this.formElement.setFieldsValue({platformId:this.$route.params.merchantMemberId?this.$route.params.merchantMemberId:this.platformQueryAllByListData[0]?.id});
    await this._userGetUserInfo(true);
  }

  @Lifecycle async mounted() {
    // this.setInititalDate();
    await this.delay(200);
    this.setCascaderOptions();
    await this._platformQueryAllByList();
    await this._userGroupGetAllUserGroupName(this.platformQueryAllByListData[0].id);
    await this.formElement.setFieldsValue({platformId:this.$route.params.merchantMemberId?this.$route.params.merchantMemberId:this.platformQueryAllByListData[0].id});
    await this._userGetUserInfo(true);
		
  } 

  delay(time){return new Promise(resolve => setTimeout(resolve, time));}

  changeCascader(value) {
    // 选择全部
    if (value.length === 1) {
      this.cascaderSelected.sortField = "";
      this.cascaderSelected.sortType = "";
    } else {
      this.cascaderSelected.sortField = value[0];
      this.cascaderSelected.sortType = value[1];
    }
  }
  
  setCascaderOptions() {
    const initOptions = {value: "", label: "全部"};
    const array = [], sortType = [{value: 1, label: "升序"}, {value: 2, label: "降序"}];
    if (this.dictionary?.sortField.length) {
      this.dictionary.sortField.forEach(item => {
        array.push({
          value: item.value,
          label: item.name,
          children: sortType
        });
      });
    }
    array.unshift(initOptions);
    this.cascaderOptions = array;
  }

  // 修改平台id， 动态获取会员组
  async changePlatform(id) {
    const res = await this.$service.fetch('/lottery-admin-api/userGroup/queryAllUserGroup', {
      platformId: id
    });
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data && res.data instanceof Array) {
      this.userGroupGetAllUserGroupNameData = res.data;
    }
  }

  // 设置初始化时间
  setInititalDate() {
    const d = new Date();
    this.$refs.rg.setDateRangeValues(d);
    this.startTime = moment(d).format("YYYY-MM-DD 00:00:00");  
    this.endTime = moment(d).format("YYYY-MM-DD 23:59:59");
  }

  changeDate(startTime, endTime, dateString, type) {
    if (type === "start") {
      this.startTime = dateString
    } else {
      this.endTime = dateString
    }
  }

  /* 获取用户组数据接口 */
  async _userGroupGetAllUserGroupName(id) {
    const { data: res } = await userGroupGetAllUserGroupName({platformId: id});
    if (1 == res.body.code) {
      this.userGroupGetAllUserGroupNameData = res.body.data;
    }
  }

  /* 获取所有商户列表 */
  async _platformQueryAllByList() {
    const { data: res } = await platformQueryAllByList({});
    if (1 == res.body.code) {
      this.platformQueryAllByListData = res.body.data;
    }
  }

  /* 商户会员列表 */
  async _userGetUserInfo(type) {
    if (type)  this.pagination.current = 1;

    let params = {
      // 排序类型|1:升序|2:降序
      sortType: "",
      endTime: this.endTime,
      pageNo: this.pagination.current,
      pageSize: this.pageSize,
      startTime: this.startTime
    };

    this.formElement.validateFields(async (e, v) => {
      if (e) return;
      this.init.loading = true;
      const { data: res } = await userGetUserInfo(Object.assign(params, v, this.cascaderSelected));
      this.init.loading = false;
      if (1 == res.body.code && res.body.data) {
        this.table.dataSource = res.body.data.records;
        this.pagination.total = res.body.data?.totalCount;
        return;
      }
      this.table.dataSource = [];
    });
  }
  
}
</script>

<style lang="scss" scoped>
.buss-container /deep/ {
  height: 100%;
  padding: 15px 10px;
  box-sizing: border-box;
  overflow-y: auto;
  border-radius: 4px;
  background-color: #fff;
  overflow-x: hidden;

  .ant-form-item {
    margin-right: 10px;
  }


  .ant-table-small
    > .ant-table-content
    > .ant-table-body
    > table
    > .ant-table-thead
    > tr
    > th {
    border-bottom: none;
    text-align: center;
    padding: 2px 6px;
  }
  .ant-table-thead {
    border-bottom: solid 1px #E8E8E8;
  }
  .ant-table table {
    text-align: center;
  }
}
</style>

