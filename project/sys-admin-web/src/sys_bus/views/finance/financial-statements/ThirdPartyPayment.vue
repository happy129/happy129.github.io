<template>
    <section class="finance-check-container">
        <a-form class="form" layout="inline" :form="vform" @submit.prevent="getList(true)">
            <a-form-item class="range" label="统计时间">
                <DateRange :showTime="true" title="" @change="changeDate" ref="rg"/>
            </a-form-item>
            <a-form-item label="会员账号">
                <a-input v-decorator="['userName']"  style="width: 120px;" placeholder="请输入会员账号" />
            </a-form-item>

            <a-form-item label="会员组">
                <a-select style="width: 120px;" v-decorator="['userGroupId']" :dropdownMatchSelectWidth="false">
                    <a-select-option value="">全部</a-select-option>
                    <a-select-option v-for="(item, index) in init.status" :key="index" :value="item.groupId">{{item.groupName}}</a-select-option>
                </a-select>
            </a-form-item>
            <a-form-item label="每页条数">
                <a-input style="width: 50px;"  v-number="true" v-decorator="['pageSize', {initialValue:20, rules: [{required:true,message:'条数必须为整数'}]}]"></a-input>
            </a-form-item>

            <a-form-item label="第三方支付" style="margin-left:10px;">
                <a-dropdown :trigger="['click']">
                    <div class="dropdown-link">
                        <a-input v-model="init.bankText" class="dropdown-input" placeholder="全部" />
                        <a-button size="small" class="dropdown-btn" @click.stop="cancelSelected('bank')">清空</a-button>
                    </div>
                    <a-menu slot="overlay">
                        <a-menu-item class="dropdown-inner">
                            <p @click.stop class="pt5" v-for="(item, index) in init.banks" :key="index"><a-checkbox :checked="item.checked" @change.stop="(e) => selectPayments(e, item.id)">{{item.name}}</a-checkbox></p>
                        </a-menu-item>
                        <a-menu-item class="dropdown-btns">
                            <a-button size="small" class="select-all" @click.stop="selectAllMethods">全部选中</a-button>&nbsp;
                            <a-button size="small"  class="select-sty1">确认</a-button>&nbsp;
                            <a-button size="small"  class="select-sty2">取消</a-button>
                        </a-menu-item>
                    </a-menu>
                </a-dropdown>
            </a-form-item>

            <a-form-item>
                <a-button type="primary" html-type="submit" :loading="init.loading">查询</a-button>
            </a-form-item>
        </a-form>
        <div class="page-under-table finance-wrapper">
            <div class="total">
                <ul>
                    <li class="head"><span>合计</span></li>
                    <li>
                        <p class="head">充值成功用户数</p>
                        <p>{{rechageTotal.successRechargeUserCount}}人</p>
                    </li>
                    <li>
                        <p class="head">成功充值金额</p>
                        <p>{{rechageTotal.successRechargeAmount}}元</p>
                    </li>
                    <li>
                        <p class="head">失败充值金额</p>
                        <p>{{rechageTotal.failRechargeAmount}}元</p>
                    </li>
                    <li>
                        <p class="head">未处理充值金额</p>
                        <p>{{rechageTotal.handlingRechargeAmount}}元</p>
                    </li>
                    <li>
                        <p class="head">总充值金额</p>
                        <p>{{rechageTotal.totalRechargeAmount}}元</p>
                    </li>
                    <li>
                        <p class="head">充值成功订单</p>
                        <p>{{rechageTotal.successRechargeCount}}笔</p>
                    </li>
                    <li>
                        <p class="head">充值失败订单</p>
                        <p>{{rechageTotal.failRechargeCount}}笔</p>
                    </li>
                    <li>
                        <p class="head">充值未处理订单</p>
                        <p>{{rechageTotal.handlingRechargeCount}}笔</p>
                    </li>
                    <li>
                        <p class="head">充值订单总数</p>
                        <p>{{rechageTotal.totalRechargeCount}}笔</p>
                    </li>
                    <li>
                        <p class="head">成功率</p>
                        <p>{{ $tools.toFixed(rechageTotal.successRate*100, 2, true)}}%</p>
                    </li>
                </ul>
            </div>
            <a-table class="mytable mt10"  bordered :columns="table.columns" :dataSource="table.dataSource" :pagination="table.pagination" @change="changePagination" :rowKey="(e, i) => i">
                <template slot="successRate" slot-scope="t, r">
                    <span>
                        {{$tools.toFixed(r.successRate*100, 2, true)}}%
                    </span>
                </template>
            </a-table>
        </div>
    </section>
</template>
<script>
    import Vue from "vue";
    import { Component, Lifecycle, InjectComponents } from "vue-decorators";
    import DateRange from "@/components/date-range/DateRange"
    import moment from "moment";

    @Component({ formOptions: "id" })
    @InjectComponents({ DateRange })
    export default class FinanceCheck extends Vue {
        table = {
            key: 1,
            columns: [
                { title: "第三方支付", dataIndex: "thirdPaymentName", align: "left" },
                { title: "支付方式", dataIndex: "paymentName", align: "left", width: 200 },
                { title: "充值用户数", dataIndex: "rechargeUserCount", align: "left" },
                { title: "充值成功用户数", dataIndex: "successRechargeUserCount", align: "left" },
                { title: "成功充值金额", dataIndex: "successRechargeAmount", align: "left" },
                { title: "失败充值金额", dataIndex: "failRechargeAmount", align: "left" },
                { title: "未处理充值金额", dataIndex: "handlingRechargeAmount" , align: "left"},
                { title: "总充值金额", dataIndex: "totalRechargeAmount", align: "left" },
                { title: "充值成功订单", dataIndex: "successRechargeCount", align: "left" },
                { title: "充值失败订单", dataIndex: "failRechargeCount", align: "left" },
                { title: "充值未处理订单", dataIndex: "handlingRechargeCount", align: "left"},
                { title: "充值订单总数", dataIndex: "totalRechargeCount", align: "left" },
                { title: "成功率", align: "left", scopedSlots: { customRender: "successRate" } }
            ],
            dataSource: [],
            pagination: { total: 0, current: 1, pageSize: 20 }
        };
        // 充值合计
        rechageTotal = {};
        init = {
            loading: false,
            bankText: "",
            selectedBanks: [],
            // 查询参数
            query: { pageNo: 1, pageSize: 20, handleTimeStart: "", handleTimeEnd: "", paymentType: 4, thirdPaymentId: 0 },
            time: { startTime: "", endTime: "" },
            // 会员组
            status: [],
            // 第三方支付
            banks: [],
            // 第三方支付方式是否全选
            isChecked: false,
            // 汇总
            totalResult: {}
        };

        // 生命钩子函数
        @Lifecycle created() {
            this._queryAllUserGroup();
            this.getThirfPayment();
        };
        // 生命钩子函数
        @Lifecycle mounted() {
            this.setInitialChecked();
            this.setInititalDate();
            this.getList();
        }
        // 清空方法
        cancelSelected(type) {
            if (type === 'bank') {
                this.init.query.thirdPaymentId = 0;
                this.init.selectedBanks = [];
                this.init.banks.forEach(item => {
                    item.checked = false;
                });
                this.init.query.thirdPaymentId = [];
            }
        }
        // 选中所有的支付方式
        selectAllMethods() {
            this.init.isChecked = !this.init.isChecked;
            this.init.banks.forEach(item => {
                item.checked = this.init.isChecked
            });
            const selected = this.init.banks.filter(item => item.checked);
            this.init.selectedBanks = selected.map(v => v.paymentId);
            let txt = '';
            let codeArray = [];
            selected.forEach(item => {
                txt += ',' + item.name;
                codeArray.push(item.id);
            });
            this.init.bankText = txt.substring(1);
            this.init.query.thirdPaymentId = codeArray;
        }
        // 设置选中
        selectPayments(event, id) {
            if (this.init.selectedBanks.includes(id)) {
                const index = this.init.selectedBanks.indexOf(id);
                this.init.selectedBanks.splice(index, 1);
            } else {
                this.init.selectedBanks.push(id);
            }
            this.init.banks.forEach(item => {
                if (item.id == id) {
                    item.checked = !item.checked;
                }
            });
            let txt = '';
            let codeArray = [];
            const selected = this.init.banks.filter(item => item.checked);
            selected.forEach(item => {
                txt += ',' + item.name;
                codeArray.push(item.id);
            });

            this.init.bankText = txt.substring(1);
            this.init.query.thirdPaymentId = codeArray;
        }
        // 设置初始化时间
        setInititalDate() {
            // const starttime = new Date().getTime() - 30*24*60*60*1000;
            const d = new Date();
            this.init.query.handleTimeStart = moment(d).format("YYYY-MM-DD 00:00:00");
            this.init.query.handleTimeEnd = moment(d).format("YYYY-MM-DD 23:59:59");
            this.$refs.rg.setDateRangeValues(this.init.query.handleTimeStart, this.init.query.handleTimeEnd);
        }
        // 设定表单初始值
        setInitialChecked() {
            this.vform.setValue('userGroupId', '');
        }
        // 获取会员组list信息
        async _queryAllUserGroup() {
            const res = await this.$service.fetch("/lottery-admin-api/userGroup/queryAllUserGroup");
            if (1!==res.code) return res.message && this.$message.error(res.message);
            if (res?.data) {
                this.init.status = res.data;
            }
        }
        // 换页
        changePagination(pagination) {
            this.table.pagination.current = pagination.current;
            this.init.query.pageNo = pagination.current;
            this.getList();
        }
        // 充值表单中表格状态
        resetPagination() {
            this.table.pagination.current = 1;
            this.init.query.pageNo = 1;
        }
        // 改变时间参数
        changeDate(startTime, endTime, datestring, type) {
            if (type === "start") {
                this.init.time.startTime = datestring;
                this.init.query.handleTimeStart = datestring;
            } else {
                this.init.time.endTime = datestring;
                this.init.query.handleTimeEnd = datestring;
            }
        }

        // 获取整表数据
        async getList(refresh) {
            if (refresh) this.resetPagination();
            const form = await this.vform.validate();
            const values = this.$trimValues(form.values);
            const params = Object.assign(this.init.query, values);
            this.init.loading = true;
            const res = await this.$service.fetch('/lottery-admin-api/rechargeRecord/queryRechargeReportSummary', params);
            this.init.loading = false;
            if (res.code !== 1) return res.message && this.$message.error(res.message);
            if (res.code === 1 &&  res?.data instanceof Object) {
                this.rechageTotal = res.data;
            }
            // 获取表格参数
            this.getTotal(params);
        }
        // 获取表格参数
        async getTotal(params) {
            const res = await this.$service.fetch('/lottery-admin-api/rechargeRecord/queryRechargeReport', params);
            if (res.code !== 1) return res.message && this.$message.error(res.message);
            if (res.code === 1 && res.data?.records instanceof Array) {
                this.table.dataSource = res.data.records;
                this.table.pagination.pageSize = res.data.pageSize;
                this.table.pagination.total = res.data.totalCount;
            } else {
                this.table.dataSource = [];
                this.table.pagination.total = 0;
            }
        }
        // 获取三方支付参数
        async getThirfPayment() {
            const res = await this.$service.fetch('/config-admin-api/thirdPayment/queryThirdPaymentIdAndNameList');
            if (res.code !== 1) return res.message && this.$message.error(res.message);
            if (res?.data) {
                this.init.banks = res.data;
            }
        }
    }
</script>
<style lang="scss" scoped>
    .finance-check-container /deep/{
        background-color: #fff;
        min-height: 100%;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        padding: 10px;
        box-sizing: border-box;

        .total {
            border: 1px solid #e0e0e0;
            ul {
                display: flex;
                flex-wrap: wrap;
                li {
                    &:first-child {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    flex: 1;
                    border: 1px solid #f7f7f7;
                    p { padding-left: 10px; line-height: 30px; text-indent: 5px; &.head { background: #f7f7f7; font-weight: bold; } }
                    &.head { background: #f7f7f7; font-weight: bold; }
                }
            }
        }
        .dropdown-link {
            position: relative;
            .dropdown-input {
                width: 260px;
            }
            .dropdown-input1 {
                width: 180px;
            }
            .dropdown-btn {
                position: absolute;
                right: 4px;
                top: 8px;
                color: #009688;
                border: 1px solid #009688;
            }
        }
        .form {
            .ant-form-item {
                margin-right: 10px;
            }
            .range {
                .ant-form-item {
                    margin-right: 0;
                }
            }
        }

        .finance-wrapper {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            .my-table{
                margin-top: 30px;
            }
        }
    }
</style>
