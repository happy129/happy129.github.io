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
            <a-form-item>
                <a-button type="primary" html-type="submit" :loading="init.loading" @change="changePagination">查询</a-button>
            </a-form-item>
        </a-form>
        <div class="page-under-table finance-wrapper">
            <a-table  class="mytable" bordered :columns="table.columns" :dataSource="table.dataSource" :pagination="table.pagination" :rowKey="(e, i) => i" @change="changePagination">
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
                { title: "类型", dataIndex: "paymentName", align: "left", width: 200 },
                { title: "提现用户数", dataIndex: "withdrawUserCount", align: "left" },
                { title: "提现成功用户数", dataIndex: "successWithdrawUserCount", align: "left" },
                { title: "成功提现金额", dataIndex: "successWithdrawAmount", align: "left" },
                { title: "失败提现金额", dataIndex: "failWithdrawAmount", align: "left" },
                { title: "未处理提现金额", dataIndex: "handlingWithdrawAmount", align: "left" },
                { title: "总提现金额", dataIndex: "totalWithdrawAmount" , align: "left"},
                { title: "提现成功订单", dataIndex: "successWithdrawCount", align: "left" },
                { title: "提现失败订单", dataIndex: "failWithdrawCount", align: "left" },
                { title: "提现未处理订单", dataIndex: "handlingWithdrawCount", align: "left" },
                { title: "提现订单总数", dataIndex: "totalWithdrawCount", align: "left" },
            ],
            dataSource: [],
            pagination: { total: 0, current: 1, pageSize: 20 }
        };
        // 请求参数集
        init = {
            loading: false,
            allUserGroup: [],
            // 查询参数
            query: { pageNo: 1, pageSize: 10, handleTimeStart: "", handleTimeEnd: "" },
            time: { startTime: "", endTime: "" },
            status: [],
        };

        // 生命钩子函数
        @Lifecycle created() {
            this._queryAllUserGroup();
        };
        // 生命钩子函数
        @Lifecycle mounted() {
            this.setInitialChecked();
            this.setInititalDate();
            this.getList();
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
                this.init.time.startTime = datestring
                this.init.query.handleTimeStart = datestring
            } else {
                this.init.time.endTime = datestring;
                this.init.query.handleTimeEnd = datestring
            }
        }
        // 获取整表数据
        async getList(refresh) {
            if (refresh) this.resetPagination();
            const form = await this.vform.validate();
            const values = this.$trimValues(form.values);
            const params = Object.assign(this.init.query, values);
            this.init.loading = true;
            const res = await this.$service.fetch('/lottery-admin-api/withdrawRecord/queryWithdrawReport', params);
            this.init.loading = false;
            if (res.code !== 1) return res.message && this.$message.error(res.message);
            if (res.code === 1) {
              this.table.dataSource  = res.data.records;
              this.table.pagination.total = res.data.totalCount;
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
                }
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
        }
    }
</style>
