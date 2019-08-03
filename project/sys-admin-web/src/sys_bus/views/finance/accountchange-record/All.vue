<template>
  <section class="account-change">
    <a-form class="myform" layout="inline">
      <a-form-item label="帐变时间">
        <div class="date-select">
          <div>
            <DateRange :showTime="true" :defaultDate="true" ref="rg" @current="currentDate" @change="changeDate" title="" />
          </div>
          <div class="select-timer-area"><span>快捷选时：</span><DateSwitch ref="ds" @changeTab="changeQuickTime" className="btn-1" /></div>
        </div>
      </a-form-item>
      <br />
      <a-form-item label="帐变类型">
        <div class="label-wrapper">
          <a-input style="width: 170px" :value="checkedStr" placeholder="请选择帐变类型" @click.stop="showDropDown = !showDropDown" readOnly />
          <a-icon type="down" />
          <div class="accout-change-types" v-show="showDropDown">
            <ul class="accout-change-list">
              <li class="active" @click.stop><a-checkbox @change="checkAllItems">全部</a-checkbox></li>
            </ul>
            <div class="account-change-content">
              <el-tree node-key="id" ref="tree" :key="treeKey" :default-expand-all="true" :show-checkbox="true" :data="treeData" :expand-on-click-node="false" :default-checked-keys="selectedKeys" />
            </div>
            <div class="account-change-button">
              <a-button @click="showDropDown = !showDropDown">取消</a-button>
              <a-button
                @click="
                  showDropDown = !showDropDown;
                  getCheckedKeys();
                "
                type="primary"
                >确定</a-button
              >
            </div>
          </div>
        </div>
      </a-form-item>
      <a-form-item label="选择彩种">
        <a-cascader :options="init.lotteryCategory" @change="changeLottery" :loadData="loadLotteryData" placeholder="选择彩种类型" />
      </a-form-item>
      <a-form-item label="会员类型">
        <a-dropdown>
          <div class="account-user-type-wrap">
            <a-input v-model="userTypeNames" placeholder="请选择用户类型" />
            <a-icon type="down" />
          </div>
          <a-menu slot="overlay" :key="dropKey">
            <a-menu-item v-for="(item, index) in dictionary.userType" :key="index">
              <a href="javascript:;" @click.stop
                ><a-checkbox :checked="userTypes.includes(+item.value)" @change.stop="e => changeUserName(e, +item.value)">{{ item.name }}</a-checkbox></a
              >
            </a-menu-item>
            <!-- <a-menu-item>
              <div class="inside-drop-menu">
                <a-button size="small">取消</a-button> &nbsp;
                <a-button size="small" type="primary">确认</a-button>
              </div>
            </a-menu-item> -->
          </a-menu>
        </a-dropdown>
      </a-form-item>
      <a-form-item label="会员账号">
        <a-input v-model="init.query.userName" />
      </a-form-item>
      <a-form-item label="期号">
        <a-input v-model="init.query.issueNo" />
      </a-form-item>
      <a-form-item label="每页条数">
        <a-input style="width: 50px" v-model="init.query.pageSize" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" :loading="init.loading" @click="getList(true)">查询</a-button>
      </a-form-item>
      <a-form-item>
        <a-button @click="reset">重置</a-button>
      </a-form-item>
    </a-form>
    <div class="total-data" style="display:none">
      <table>
        <tr>
          <td class="align-center" rowspan="12">资金帐变</td>
          <td>充值成功: <span v-html="setTotalValue(totalData)"></span></td>
          <td>银行卡充值: <span v-html="setTotalValue(totalData)"></span></td>
          <td>二维码充值: <span v-html="setTotalValue(totalData)"></span></td>
          <td>第三方充值: <span v-html="setTotalValue(totalData)"></span></td>
          <td></td>
        </tr>
        <tr>
          <td>提现成功: <span v-html="setTotalValue(totalData)"></span></td>
          <td>提现扣款: <span v-html="setTotalValue(totalData)"></span></td>
          <td>提现失败: <span v-html="setTotalValue(totalData)"></span></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>加款: <span v-html="setTotalValue(totalData)"></span></td>
          <td>加款_汇款提交: <span v-html="setTotalValue(totalData)"></span></td>
          <td>加款_彩金派送: <span v-html="setTotalValue(totalData)"></span></td>
          <td>加款_返水派送: <span v-html="setTotalValue(totalData)"></span></td>
          <td>加款_其他: <span v-html="setTotalValue(totalData)"></span></td>
        </tr>
        <tr>
          <td>减款: <span v-html="setTotalValue(totalData)"></span></td>
          <td>减款_汇款提交: <span v-html="setTotalValue(totalData)"></span></td>
          <td>减款_彩金派送: <span v-html="setTotalValue(totalData)"></span></td>
          <td>减款_返水派送: <span v-html="setTotalValue(totalData)"></span></td>
          <td>减款_其他: <span v-html="setTotalValue(totalData)"></span></td>
        </tr>
        <tr>
          <td rowspan="2">礼金: <span v-html="setTotalValue(totalData)"></span></td>
          <td>充值赠送: <span v-html="setTotalValue(totalData)"></span></td>
          <td>VIP升级礼金: <span v-html="setTotalValue(totalData)"></span></td>
          <td>VIP返水礼金: <span v-html="setTotalValue(totalData)"></span></td>
          <td>签到礼金: <span v-html="setTotalValue(totalData)"></span></td>
        </tr>
        <tr>
          <td>分享礼金: <span v-html="setTotalValue(totalData)"></span></td>
          <td>分享返水: <span v-html="setTotalValue(totalData)"></span></td>
          <td>首充礼金返还: <span v-html="setTotalValue(totalData)"></span></td>
          <td></td>
        </tr>
        <tr>
          <td>返水: <span v-html="setTotalValue(totalData)"></span></td>
          <td>第三方返水: <span v-html="setTotalValue(totalData)"></span></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>佣金: <span v-html="setTotalValue(totalData)"></span></td>
          <td>彩票佣金: <span v-html="setTotalValue(totalData)"></span></td>
          <td>第三方佣金: <span v-html="setTotalValue(totalData)"></span></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>打赏: <span v-html="setTotalValue(totalData)"></span></td>
          <td>打赏: <span v-html="setTotalValue(totalData)"></span></td>
          <td>被打赏: <span v-html="setTotalValue(totalData)"></span></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>红包: <span v-html="setTotalValue(totalData)"></span></td>
          <td>发红包: <span v-html="setTotalValue(totalData)"></span></td>
          <td>领红包: <span v-html="setTotalValue(totalData)"></span></td>
          <td>红包回收: <span v-html="setTotalValue(totalData)"></span></td>
          <td></td>
        </tr>
        <tr>
          <td>代充: <span v-html="setTotalValue(totalData)"></span></td>
          <td>代充: <span v-html="setTotalValue(totalData)"></span></td>
          <td>被代充: <span v-html="setTotalValue(totalData)"></span></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>额度转换: <span v-html="setTotalValue(totalData)"></span></td>
          <td>转入: <span v-html="setTotalValue(totalData)"></span></td>
          <td>转出退回: <span v-html="setTotalValue(totalData)"></span></td>
          <td>转出: <span v-html="setTotalValue(totalData)"></span></td>
          <td></td>
        </tr>
        <tr>
          <td class="align-center" rowspan="5">游戏帐变</td>
          <td>中奖: <span v-html="setTotalValue(totalData)"></span></td>
          <td>普通投注: <span v-html="setTotalValue(totalData)"></span></td>
          <td>追号投注: <span v-html="setTotalValue(totalData)"></span></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>投注: <span v-html="setTotalValue(totalData)"></span></td>
          <td>普通投注: <span v-html="setTotalValue(totalData)"></span></td>
          <td>追号投注: <span v-html="setTotalValue(totalData)"></span></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>返点: <span v-html="setTotalValue(totalData)"></span></td>
          <td>开奖返点: <span v-html="setTotalValue(totalData)"></span></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>撤单: <span v-html="setTotalValue(totalData)"></span></td>
          <td>主动撤单: <span v-html="setTotalValue(totalData)"></span></td>
          <td>系统撤单: <span v-html="setTotalValue(totalData)"></span></td>
          <td>中奖停追: <span v-html="setTotalValue(totalData)"></span></td>
          <td></td>
        </tr>
        <tr>
          <td>撤销开奖: <span v-html="setTotalValue(totalData)"></span></td>
          <td>普通中奖: <span v-html="setTotalValue(totalData)"></span></td>
          <td>追号中奖: <span v-html="setTotalValue(totalData)"></span></td>
          <td>开奖返点: <span v-html="setTotalValue(totalData)"></span></td>
          <td></td>
        </tr>
      </table>
    </div>
    <div class="page-under-table">
      <a-table :key="table.key" class="mytable" bordered :loading="init.loading" :columns="table.columns" :dataSource="table.dataSource" :pagination="false" :rowKey="(e, i) => i" @change="changePagination2">
        <template slot="businessType" slot-scope="text, record">
          {{ getTextByIds(init.gameCategory, record.businessType) }}
        </template>
        <template slot="businessType3" slot-scope="text, record">
          {{ record.businessType3 ? record.businessType3 : "--" }}
        </template>
        <template slot="lotteryName" slot-scope="text, record">
          {{ record.lotteryName ? record.lotteryName : "--" }}
        </template>
        <template slot="playName" slot-scope="text, record">
          {{ record.playName ? record.playName : "--" }}
        </template>
        <template slot="transactionAmount" slot-scope="text, record">
          <span v-html="setTotalValue(+record.transactionAmount)"></span>
        </template>
        <template slot="issueNo" slot-scope="text, record">
          {{ record.issueNo ? record.issueNo : "--" }}
        </template>
      </a-table>
    </div>
    <div style="text-align:right;padding-top:20px;">
      <a-pagination ref="pagination" @change="changePagination" :current="table.pagination.current" :defaultCurrent="table.pagination.current" :pageSize="table.pagination.pageSize" :total="table.pagination.total" />
    </div>
  </section>
</template>
<script>
import Vue from 'vue'
import { Component, Lifecycle, InjectComponents} from 'vue-decorators'
import DateRange from "@/components/date-range/DateRange"
import { DateSwitch } from "@/components/switch"
import moment  from "moment";
import { formatDate } from "@/util/date";
import { Tree } from "element-ui";

Vue.use(Tree);

@Component({ dictionary: "walletLogSubType,walletLogTypeFund,walletLogTypeGame,userType" })
@InjectComponents({ DateRange, DateSwitch })
export default class Game extends Vue {
  table = {
    key: 1,
    columns: [
      { title: '帐变ID',  dataIndex: 'id'},
      { title: '会员账号', dataIndex: 'userName'}, 
      { title: '帐变类型', dataIndex: 'businessType'}, 
      { title: '子类型', dataIndex: 'businessType2'}, 
      { title: '账变方式', dataIndex: 'businessType3', scopedSlots: { customRender: 'businessType3'}},
      { title: '彩种', dataIndex: 'lotteryName', scopedSlots: {customRender: 'lotteryName' }}, 
      { title: '玩法', dataIndex: 'playName', scopedSlots: {customRender: 'playName' }}, 
      { title: '期号', dataIndex: 'issueNo', scopedSlots: {customRender: 'issueNo' }}, 
      { title: '交易前余额', dataIndex: 'preBalance'}, 
      { title: '交易金额', dataIndex: 'transactionAmount', scopedSlots: {customRender: 'transactionAmount'}},
      { title: '交易后余额', dataIndex: 'postBalance'},
      { title: '交易时间',  dataIndex: 'createTime', sorter: true}
    ],
    dataSource: [],
    pagination: { total: 0, current: 1, pageSize: 10 }
  };

  init = {
    query: {
      pageNo: 1,
      pageSize: 10,
      queryTimeStart: "",
      queryTimeEnd: "",
      businessType: "",
      businessSubType: "",
      userName: "",
      businessType: "",
      businessType2: "",
      businessType3: "",
      lotteryId: "",
      issueNo: "",
      userTypes: "",
      sortList: [
        {
          sortField: "createTime",
          sortOrder: "desc"
        }
      ],
      lotteryCategoryId: ""
    },
    loading: false,
    modalShow: false,
    lotteryCategory: [],
    gameCategory: []
  }
  /** 选择的用户名 */
  userTypeNames = '';
  /** 汇总数据 */ 
  totalData = {};
  /** 树形结构 */ 
  treeData = [];
  /** 选择的树形结构 */ 
  checkedTreeKeys = [];
  /** 是否展示下拉选择 */
  showDropDown = false;
  /** 勾选的数据 */
  selectedKeys = [];
  /** 原始的数据 */
  originData = []
  /** tree key */
  treeKey = 1;
  /** 选中的数据 */
  checkedStr = "";
  /** 用户类型 */
  userTypes = [1, 2];
  /** 默认选择的类型 */
  defaultSelected = 0;
  /** 下拉 */
  dropKey = 1;

  @Lifecycle async mounted() {
    this.getAllWalletLog();
    this.setDefaultUserTypes();
    await this.getAllLotteryList();
    await this.getList();
  }

  /** 设置默认的用户 */
  setDefaultUserTypes() {
    this.userTypeNames = "普通用户,充值用户";
    this.init.userTypes = this.userTypes.join(',');
  }

  currentDate(startTime, endTime) {
    this.init.query.queryTimeStart = startTime;
    this.init.query.queryTimeEnd = endTime; 
  }

  changeUserName(event, value) {
    if (event.target.checked) {
      this.userTypes.push(value)
    } else {
      const index = this.userTypes.indexOf(value);
      this.userTypes.splice(index, 1);
    }
    this.init.query.userTypes = this.userTypes.join(',');

    this.userTypeNames = '';
    const result = [];
    this.userTypes.forEach(item => {
      for (let i = 0; i < this.dictionary.userType.length; i++) {
        if (this.dictionary.userType[i].value == item) {
          result.push(this.dictionary.userType[i].name);
          break;
        }
      }
    });
    this.userTypeNames = result.join(',');
  }

  reset() {
    this.checkedStr = "";
    this.init.query.lotteryId = "";
    this.init.query.lotteryCategoryId = "";
    this.init.query.userName = "";
    this.init.query.issueNo = "";
    this.init.query.pageSize = 10;
    this.defaultSelected = 0;
    this.init.query.userTypes = "";
    this.userTypeNames = "";
    this.userTypes = [];
    this.init.query.businessType = "";
    this.init.query.businessType2 = "";
    this.init.query.businessType3 = "";
    this.dropKey = Date.now();
    this.$refs.rg.setCurrentDate();
    this.$refs.ds.resetKey();
    this.$refs.tree.setCheckedKeys([]);
  }
  

  setTotalValue(totalData) {
    if (typeof +totalData !== "number" || isNaN(totalData)) return '0.00';
    const className = +totalData > 0 ? 'g-green' : 'g-red';
    return `<span class="${className}"> ${+totalData > 0 ? '+' : ''}${ this.$tools.thoundSep(totalData) }</span>`
  }

  // 排序
  changePagination2(current, filters, sorter) {
    // // 点击排序
    if (sorter.order) {
      switch(sorter.order) {
        case "ascend":
          this.init.query.sortList[0].sortField = sorter?.field;
          this.init.query.sortList[0].sortOrder = 'asc';
          break;
        case "descend":
          this.init.query.sortList[0].sortField = sorter?.field;
          this.init.query.sortList[0].sortOrder = 'desc';
          break;
      }
    } else {
      this.init.query.sortList[0].sortField = '';
      this.init.query.sortList[0].sortOrder = '';
    }
    this.getList(false, false);
  }

  getTextById(array, id) {
    return array.find(item => item.value == id)?.name;
  }

  getTextByIds(array, id) {
    return array.find(item => item?.extra == id)?.label;
  }

  /** 获取key值 */
  getCheckedKeys() {
    const keys = this.$refs.tree.getCheckedNodes();
    this.init.query.businessType = this.getCheckedString(keys, 1, 'value').join(',');
    this.init.query.businessType2 = this.getCheckedString(keys, 2, 'value').join(',');
    this.init.query.businessType3 = this.getCheckedString(keys, 3, 'value').join(',');
    this.checkedStr = '';
    let str1 = '', str2 = '', str3 = '';
    str1 += this.getCheckedString(keys, 1, 'name').join(',');
    str2 += this.getCheckedString(keys, 2, 'name').join(',');
    str3 += this.getCheckedString(keys, 3, 'name').join(',');
     
    if (str3 != '') {
      this.checkedStr += str3;
    } 

    if(str2 != '') {
      this.checkedStr += str2;
    }

    if(str1 != '') {
      this.checkedStr += str1;
    }

    this.checkedStr = `${this.checkedStr.length > 10 ? this.checkedStr.substring(0, 10) + '...': this.checkedStr}`;
  }

  getCheckedString(array, level, prop) {
    if (!array instanceof Array) return 
    return array.slice().filter(item => item.level == level).map(v => v[prop]);
  }

  changeDate(start, end, datestring, type) {
    if (type === "start") {
      this.init.query.queryTimeStart = datestring
    } else {
      this.init.query.queryTimeEnd = datestring
    }
  }

  // 快捷选时间
  changeQuickTime(startDate, endTime) {
    this.init.query.queryTimeStart = startDate;
    this.init.query.queryTimeEnd = endTime;
    this.$refs.rg.setDateRangeValues(startDate, endTime);
  }

  changePagination(pagination) {
    this.table.pagination.current = pagination;
    this.init.query.pageNo = pagination;
    this.table.key = Math.random();
    this.getList(false, false);
  }

  // 重置分页
  resetPagination() {
    this.table.pagination.current = 1;
    this.init.query.pageNo = 1;
  }

  checkAllItems(event) {
    if (event.target.checked == false) {
      this.selectedKeys = []
    } else {
      this.selectedKeys = this.originData.map(item => item.id); 
    }
    this.$refs.tree.setCheckedKeys(this.selectedKeys);
  }

  /** 获取所有帐变类型 */
  async getAllWalletLog() {
    const res = await this.$service.fetch('/lottery-admin-api/walletLog/queryAllWalletLogType', {walletLogType: 0})
    if (res.code !== 1) return this.$message.error(res.message)
    if (res.data instanceof Array) {
      // 拷贝一份原始的数据
      this.originData = JSON.parse(JSON.stringify(res.data));
      this.treeData = this.toTree(res.data, 0).sort((prev, next) => {
        return prev.sortOrder - next.sortOrder
      });
    }
  }

  /** 把数据改变成三级结构 */
  toTree(array, parentId) {
    return array.filter(item => item.parentId === parentId)
    .map(elem => ({
      ...elem,
      label: elem.name,
      children: this.toTree(array.filter(item => item.parentId !== parentId), elem.id)
    }));
  }

  // 选择彩票列表
  changeLottery(value) {
    this.init.query.lotteryId = value[1] ? value[1] : "";
    this.init.query.lotteryCategoryId = value[0]; 
  }

  // 获取彩票列表
  async loadLotteryData(selectedOptions) {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;
    const res = await this.$service.fetch("/config-admin-api/lottery/queryAllLotteryByCategoryId", { id: targetOption.value });
    targetOption.loading = false;
    if (res.code === 1 && res.data instanceof Array) {
      targetOption.children = res.data.map(item => {
        return {
          value: item.id,
          label: item.lotteryName
        }
      });
      targetOption.children.unshift({value:"",label:"全部"})
      this.init.lotteryCategory = [...this.init.lotteryCategory];
    }
  }

  async getAllLotteryList() {
    const res = await this.$service.fetch("/config-admin-api/category/queryAllCategory");
    const result = [];
    if (res.code === 1 && res.data instanceof Array) {
       res.data.forEach(item => {
        result.push({ value: item.id, label: item.categoryName, isLeaf: false });
      });
    }
    result.unshift({ value: "", label: "全部" });

    this.init.lotteryCategory = result;
  }

  async getList(refresh, page=true) {
    if (refresh) this.resetPagination(); 
    const params = {};  
    for (let [key, value] of Object.entries(this.init.query)) {
      if (typeof value === "boolean") {
        value = value === true ? 1 : 0;
      }
      params[key] = value;
    }
    if (page) {
      // 如果结束时间大于当前时间，设置为当前时间
      if (params.queryTimeEnd) {
        const d = new Date(params.queryTimeEnd.replace(/\-/g, '/')).getTime();
        const now = Date.now();
        if (d > now) {
          params.queryTimeEnd = formatDate(new Date());
          // 缓存数据
          this.queryTimeEnd = params.queryTimeEnd;
        }
      }
    } else {
      const d1 = new Date(this.init.query.queryTimeEnd.replace(/\-/g, '/')).getTime();
      const d2 = new Date(this.queryTimeEnd.replace(/\-/g, '/')).getTime();
      if (d1 < d2) {
        params.queryTimeEnd = this.init.query.queryTimeEnd
      } else {
        params.queryTimeEnd = this.queryTimeEnd;
      }
    }
    this.init.loading = true;
    const res = await this.$service.fetch('/lottery-admin-api/walletLog/queryPageWalletLog', params);
    this.init.loading = false;

    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.code === 1 &&  res.data?.records instanceof Array) {
      this.table.dataSource = res.data.records;
      this.table.pagination.total = res.data?.totalCount;
      this.table.pagination.pageSize = res.data.pageSize;
      this.hidePageNumber(res);
    } else {
      this.table.dataSource = [];
      this.table.pagination.total = 0;
    }
  }

  /** 隐藏页码 */
  hidePageNumber(res){
    if (!res?.data?.totalPage) return;

    setTimeout(() => {
      // 不超过10页直接不用管
      if (res.data.totalPage <= 10) return;
      // 获取第一个元素
      const fristElement = this.$refs.pagination.$el.querySelector(`.ant-pagination-item-1`);
      // 获取分页的最后一个元素
      const lastElement = this.$refs.pagination.$el.querySelector(`.ant-pagination-item-${res.data.totalPage}`);
      // 大于10页第一个元素隐藏
      if (lastElement) lastElement.style.display = 'none';
      // 如果当前页码大于10, 点击的跨度不能大于10， 所以首页得隐藏
      if (res.data.pageNo > 10) {
        fristElement.style.display = 'none';
      } else {
        fristElement.style.display = 'inline-block';
      }
    });

  }
}

</script>

<style lang="scss" scoped>
.myform /deep/ {
  .ant-form-item {
    margin-bottom: 2px;
  }
}

.qr-range /deep/ {
  .ant-form-item {
    margin-right: 0;
  }
}

.date-select /deep/ {
  display: flex;
  align-items: center;
  .ant-form-item {
    margin-right: 0;
  }
  .select-timer-area {
    display: flex;
    margin-left: 20px;
    font-size: 14px;
    align-items: center;
  }
  .btn-1 {
    button {
      padding: 6px 12px;
    }
  }
}

.inside-drop-menu {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #d7d7d7;
  padding-top: 10px;
}

.label-wrapper /deep/ {
  position: relative;
  input {
    cursor: pointer;
  }
  .anticon-down {
    position: absolute;
    z-index: 1;
    top: 50%;
    right: 12px;
    width: 12px;
    height: 12px;
    font-size: 12px;
    margin-top: -6px;
    line-height: 12px;
    transition: transform 0.2s, -webkit-transform 0.2s;
    color: rgba(0, 0, 0, 0.25);
  }

  .accout-change-types {
    position: absolute;
    top: 40px;
    left: 0;
    width: 1100px;
    height: 500px;
    z-index: 2;
    background-color: #fff;
    box-shadow: -5px 0 5px 0 rgba(0, 0, 0, 0.1), /*左边阴影*/ 0 -5px 5px 0 rgba(0, 0, 0, 0.1), /*顶部阴影*/ 0 5px 5px 0 rgba(0, 0, 0, 0.1), /*底部阴影*/ 5px 0 5px 0 rgba(0, 0, 0, 0.1);
  }
}

.account-user-type-wrap {
  position: relative;
  .anticon-down {
    position: absolute;
    z-index: 1;
    top: 50%;
    right: 12px;
    width: 12px;
    height: 12px;
    font-size: 12px;
    margin-top: -6px;
    line-height: 12px;
    transition: transform 0.2s, -webkit-transform 0.2s;
    color: rgba(0, 0, 0, 0.25);
  }
}

.total-data {
  table {
    border-collapse: collapse;
    width: 100%;
    td {
      border: 1px solid #d7d7d7;
      padding: 8px 10px;
    }
    tr {
      &:nth-child(1),
      &:nth-child(13) {
        td {
          &:nth-child(1) {
            background-color: #fff;
          }
          &:nth-child(2) {
            background-color: #f5f5f5;
          }
        }
      }
      &:nth-child(6) {
        td {
          &:nth-child(1) {
            background-color: #fff;
          }
        }
      }
      td {
        &:nth-child(1) {
          background-color: #f5f5f5;
        }
      }
    }
    .align-center {
      text-align: center;
      font-weight: bold;
    }
  }
}

.accout-change-list {
  display: flex;
  border-bottom: 1px solid #dedede;
  li {
    height: 36x;
    line-height: 36px;
    padding: 0 20px;
    cursor: pointer;
    position: relative;

    &.active {
      color: #009688;
      &::after {
        content: "";
        position: absolute;
        height: 2px;
        background-color: #009688;
        width: 100%;
        left: 0;
        bottom: -1px;
      }
    }

    &:hover {
      color: #009688;
    }
  }
}

.account-change {
  min-height: 800px;
}

.account-change-content /deep/ {
  height: 410px;
  padding-top: 10px;
  overflow-y: auto;
  .el-checkbox__input.is-checked .el-checkbox__inner,
  .el-checkbox__input.is-indeterminate .el-checkbox__inner {
    background-color: #009688;
    border-color: #009688;
  }

  .el-tree {
    display: flex;
    flex-wrap: wrap;

    > .el-tree-node {
      width: 16.6%;
      margin-bottom: 10px;
      border-bottom: 1px solid #f5f5f5;
      padding-bottom: 10px;

      > .el-tree-node__content {
        > .el-tree-node__label {
          font-weight: bold;
        }
      }
    }

    .el-tree-node__content {
      height: 22px;
    }
  }
}

.account-change-button {
  height: 50px;
  line-height: 50px;
  border-top: 1px solid #d7d7d7;
  text-align: right;
  margin-right: 10px;
  button {
    margin-left: 10px;
  }
}
</style>
