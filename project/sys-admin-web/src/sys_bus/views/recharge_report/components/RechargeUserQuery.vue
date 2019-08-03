<template>
  
  <div class="record">
    <a-form :form="vform" layout="inline" class="form">
      <div class="row">
        <a-form-item label="时间类型：">
          <a-select class="sSelect2" v-decorator="['timeType']"  style="width: 100px;margin-right: 10px;">
            <a-select-option value="register">注册时间</a-select-option>
            <a-select-option value="firstRecharge">首充时间</a-select-option>
            <a-select-option value="secondRecharge">二充时间</a-select-option>
            <a-select-option value="thirdRecharge">三充时间</a-select-option>
          </a-select>
          <DateRange title='' :defaultDate="true" @change="toChangeDateRange" @current="toChangeDateRange"/>
        </a-form-item>

         <a-form-item label="会员账号">
          <a-input class="member-account" v-decorator="['userName']" />
        </a-form-item>

        <a-form-item label="会员组" class="label-member">
          <a-select class="sSelect2" v-decorator="['groupId']" style="min-width: 150px;">
            <a-select-option value="">全部</a-select-option>
            <a-select-option v-for="(item, index) in dsstore.userGroups" :value="item.groupId" :key="index">{{item.groupName}}</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="VIP等级"  style="margin-left:10px;">
          <a-select class="sSelect2" v-decorator="['vipLevel']" style="min-width: 150px;">
            <a-select-option value="">全部</a-select-option>
            <a-select-option v-for="(item, index) in dsstore.vips" :value="item.vipLevel" :key="index">{{item.vipLevelName}}</a-select-option>
          </a-select>
        </a-form-item>
       
        <a-form-item label="">
          <a-button :loading="pageinfo.loading" type="primary" @click="toFetchRecords({ pageNo: 1})" style="margin-left:20px;" ref="btnSearch">查询</a-button>
        </a-form-item>
      </div>

      <div class="row row2">
         <a-form-item label="累充次数大于(次)：">
          <a-input class="member-account" v-decorator="['totalRechargeTimesStart']" @change="toFormateNumber($event, 'totalRechargeTimesStart')"/>
        </a-form-item>
         <a-form-item label="累计登录大于(天)：">
          <a-input class="member-account" v-decorator="['totalLoginTimesStart']" @change="toFormateNumber($event, 'totalLoginTimesStart')"/>
        </a-form-item>
         <a-form-item label="距离上次充值小于(次)：">
          <a-input class="member-account" v-decorator="['daysSinceLastRechargeStart']" @change="toFormateNumber($event, 'daysSinceLastRechargeStart')"/>
        </a-form-item>
        <a-form-item label="距离上次登录小于(天)：">
          <a-input class="member-account" v-decorator="['daysSinceLastLoginStart']" @change="toFormateNumber($event, 'daysSinceLastLoginStart')"/>
        </a-form-item>
         <a-form-item label="每页条数">
          <a-input class="member-account" v-decorator="['pageSizeCustom']" @change="toFormateNumber($event, 'pageSizeCustom', 50)"/>
        </a-form-item>
         <a-form-item label="">
          <a-button :loading="pageinfo.loading" type="primary" @click="toFetchRecords({ pageNo: 1, pageSize: vform.data.pageSizeCustom })">确定</a-button>
        </a-form-item>
         <!-- <a-form-item label="累充次数大于：">
          <a-input class="member-account" v-decorator="['userName']" />
        </a-form-item> -->
      </div>
     
    </a-form>
    <div class="summary">
      <table>
        <tr>
          <th>合计</th>
          <td>首充用户数：{{totalinfo.firstRechargeCount}}人</td>
          <td>首充金额：{{totalinfo.firstRechargeAmount}}</td>
          <td>二充用户数：{{totalinfo.secondRechargeCount}}人</td>
          <td>二充金额：{{totalinfo.secondRechargeAmount}}</td>
          <td>三充用户数：{{totalinfo.thirdRechargeCount}}人</td>
          <td>三充金额：{{totalinfo.thirdRechargeAmount}}</td>
          <td class="export">
            <a @click="toExport()" ref="btnExport"><a-button type="primary" tyle="margin-left:20px;">导出</a-button></a>
          </td>
        </tr>
      </table>
    
    </div>
    <a-table class="mytable mt10" 
      bordered 
      :loading="pageinfo.loading" 
      :rowKey="(e, i) => i"  
      :columns="columns" 
      :dataSource="pageinfo.records" 
      :pagination="false"
      @change="toChangeSort">
      
      <template slot="v1-1" >
        会员账号<br>会员组<br>VIP等级
      </template>
      <template slot="v1-2" slot-scope="text, record">
        {{record.userName}}<br>{{record.groupName}}<br>{{record.vipLevelName || "--"}}
      </template>

      <template slot="totalRechargeAmount" slot-scope="text">
        <span :class="getColor(text)">{{text}}</span>
      </template>
      <template slot="balance" slot-scope="text">
        <b>{{text}}</b>
      </template>
      
      <template slot="v2-1" >
        首充金额<br>首充时间
      </template>
      <template slot="v2-2" slot-scope="text, record">
        <template v-if="+record.firstRechargeAmount">
          <b>{{record.firstRechargeAmount}}</b><br>
          <span>{{record.firstRechargeTime}}</span>
        </template>
        <span v-else>--</span>
      </template>
      
      <template slot="v3-1" >
        二充金额<br>二充时间
      </template>
      <template slot="v3-2" slot-scope="text, record">
        <template v-if="+record.secondRechargeAmount">
          <b>{{record.secondRechargeAmount}}</b><br>
          <span>{{record.secondRechargeTime}}</span>
        </template>
        <span v-else>--</span>
      </template>
      
      <template slot="v4-1" >
        三充金额<br>三充时间
      </template>
      <template slot="v4-2" slot-scope="text, record">
        <template v-if="+record.thirdRechargeAmount">
          <b>{{record.thirdRechargeAmount}}</b><br>
          <span>{{record.thirdRechargeTime}}</span>
        </template>
        <span v-else>--</span>
      </template>


    </a-table>
    <div style="text-align:right;padding-top:20px;">
      <a-pagination ref="pagination" @change="toFetchRecords({ pageNo: $event })"  :current="pageinfo.pageNo" :defaultCurrent="pageinfo.pageNo" :total="pageinfo.totalCount" :pageSize="pageinfo.pageSize"/>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import { Component, InjectComponents, Prop, Watch, Lifecycle, Computed, Filter, State, Action, Getter, Mutation, InjectComponent } from 'vue-decorators';
import { getToken, getClientType } from '@/util/auth';
import { getUnit, getColor } from "@/util/helper"
import DateRange from "@/components/date-range/DateRange";

/** 数据字典 */
const dictionary = '';
const formOptions = { vform: "" };
/** 配置内置初始化数据源 */
const dsstore = {
  // [key: String]: 'url'
  // [key: String]: { url: String, value: [], params: {} }
  // key 变量名称，使用this.dsstore.变量名称获取值
  // value: 初始化值，默认空数组
  // params: 内置查询条件
  // 用于内置外部接口数据字典
  /** 用户组类型 */
  userGroups: { url: '/lottery-admin-api/userGroup/queryAllUserGroup' },
  /** vip等级 */
  vips: { url: '/config-admin-api/vipLevelConfig/queryAllVipLevelConfig' }
}


@Component({ formOptions, dsstore, components: { DateRange } })
export default class RechargeUserQuery extends Vue {
 /** 查询参数 */
  params = {
    // { sortField: "createTime", sortOrder: "desc" }
    sortList: [],
  };
  /** 分页信息 */
  pageinfo = { pageNo: 1, pageSize: 20, totalCount: -1, totalPage: -1, records: [], loading: false };
  /** 统计信息 */
  totalinfo = {};

  // 序支持字段 | 注册时间:registerTime | 首充时间:firstRechargeTime | 二充时间:secondRechargeTime | 三充时间:thirdRechargeTime，
  // 可以为空，如果为空默认以注册时间倒叙排序
  columns = [
    { slots: { title: 'v1-1' }, scopedSlots: { customRender: "v1-2" } },
    { title: '注册时间', dataIndex: "registerTime", sorter: true},
    // 首充金额/首充时间 二充金额/二充时间 三充金额/三充时间
    { dataIndex: "firstRechargeTime", scopedSlots: { title: 'v2-1', customRender: "v2-2" }, sorter: true},
    { dataIndex: "secondRechargeTime", scopedSlots: { title: 'v3-1' , customRender: "v3-2" }, sorter: true},
    { dataIndex: "thirdRechargeTime", scopedSlots: { title: 'v4-1', customRender: "v4-2" }, sorter: true},
    { title: '累计充值金额', dataIndex: "totalRechargeAmount", scopedSlots: { customRender: "totalRechargeAmount" }  },
    { title: '账户余额', dataIndex: "balance", scopedSlots: { customRender: "balance" }  },
    { title: '累计充值次数(次)', dataIndex: "totalRechargeTimes"  },
    { title: '累计登录次数(次)', dataIndex: "totalLoginTimes"  },
    { title: '距离上次充值(天)', dataIndex: "daysSinceLastRecharge"  },
    { title: '距离上次登录(天)', dataIndex: "daysSinceLastLogin"  }
  ];

  async toExport() {
    const { timeStart, timeEnd, timeType, ...vformData } = this.vform.data;
    const dateRangeParams = { [`${timeType}TimeStart`]: timeStart, [`${timeType}TimeEnd`]: timeEnd };
    const params = {...this.params, sortList: undefined, ...vformData, ...dateRangeParams };
    const res = await this.$service.download('/lottery-admin-api/rechargeReport/downloadRechargeUserSummary', params);
    if (1 != res.code) return res.message && this.$message.error(res.message);
  }

  getColor = getColor;

  toChangeDateRange(startDateStr, endDateStr, dateStr, dateType) {
    if (startDateStr || 'start' == dateType) this.vform.setValue('timeStart', startDateStr, true);
    if (endDateStr || 'end' == dateType) this.vform.setValue('timeEnd', endDateStr, true);
  }

    /** 格式化输入整数 */
  toFormateNumber(event, key, defaultValue = 1, target) {
    const $text = event.target;
    const number = this.$tools.toNumber($text.value);
    if (target) target[key] = number || defaultValue;
    else this.vform.setValue(key, number || defaultValue, true);
    $text.value = `${+number || ""}`;
    return false;
  }
  
  async toChangeSort(pagination, filters, sorter) {
    if (sorter.order) {
      this.params.sortList[0] = {};
      if(sorter.order == "ascend"){this.params.sortList[0].sortField = sorter?.field; this.params.sortList[0].sortOrder = 'asc'};
      if(sorter.order == "descend"){this.params.sortList[0].sortField = sorter?.field; this.params.sortList[0].sortOrder = 'desc'};
    } else{
      this.params.sortList[0].sortField = 'registerTime';this.params.sortList[0].sortOrder = 'desc';
    }
    this.toFetchRecords({ pageNo: 1});
  }

  async toFetchRecords(params = {}) {
    const { pageNo, pageSize } = this.pageinfo;
    const { timeStart, timeEnd, timeType, ...vformData } = this.vform.data;
    const dateRangeParams = { [`${timeType}TimeStart`]: timeStart, [`${timeType}TimeEnd`]: timeEnd };

    const queryParams = { pageNo, pageSize, ...this.params, ...vformData, ...dateRangeParams, ...params };
    this.pageinfo.loading = true;
    const [res] = await Promise.all([
      this.$service.fetch('/lottery-admin-api/rechargeReport/queryRechargeUserSummary',  queryParams), 
      this.toFetchRecordSummary(queryParams)
    ]);
    this.pageinfo.loading = false;
    if (1 != res.code) return res.message && this.$message.error(res.message);
    const pageRecords = res.data;
    this.pageinfo = { ...this.pageinfo, ...pageRecords };
  }

  async toFetchRecordSummary(queryParams = {}) {
    if (queryParams.pageNo != 1) return;
    const res = await this.$service.fetch('/lottery-admin-api/rechargeReport/queryRechargeSummaryStat',  {...queryParams, sortList: undefined});
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.totalinfo = res.data;
  }

  @Lifecycle() async created() {
    this.vform.setValues({ pageSizeCustom: 20, timeType: "register" }, true);
    await this.$tools.delay(1000);
    this.toFetchRecords({ pageNo: 1}); 
  }
}
</script>

<style lang="scss" scoped>
.record {
  background-color: #fff;

  .summary {
    padding: 10px 0 0 ;
    display: flex;
    align-items: center;
    user-select: none;
    th {
      background-color: #dfdfdf;
        width: 100px!important;
    }
    th, td {
      width: 200px;
      border: 1px solid #ccc;
      border-collapse: collapse;
      padding: 4px 10px;
      text-align: center;

      &.export {
        border: 0;
      }
    }
  }
}

.row2 {
  input { width: 80px; }
}
</style>
