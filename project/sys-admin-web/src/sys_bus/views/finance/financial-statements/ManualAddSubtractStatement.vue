<template>
    <section class="finance-check-container">
        <a-form class="form" layout="inline" :form="vform" @submit.prevent="getList()">
            <a-form-item class="range" label="统计时间">
                <DateRange :showTime="true" title="" @change="changeDate" ref="rg"/>
            </a-form-item>
            <a-form-item label="会员账号">
                <a-input v-decorator="['userName']"  style="width: 120px;" placeholder="请输入会员账号" />
            </a-form-item>
            <a-form-item>
                <a-button type="primary" html-type="submit" :loading="init.loading">查询</a-button>
            </a-form-item>
        </a-form>
        <div class="page-under-table finance-wrapper">
            <a-table class="mytable"  bordered :columns="table.columns" :dataSource="table.dataSource" :pagination="false" :rowKey="(e, i) => i">
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
                { title: "类型", dataIndex: "typeName", align: "left", width: 200 },
                { title: "金额", dataIndex: "amount", align: "left" },
                { title: "次数", dataIndex: "count", align: "left" },
            ],
            dataSource: [],
            pagination: { total: 0, current: 1 }
        };
        // 请求参数集
        init = {
            loading: false,
            allUserGroup: [],
            // 查询参数
            query: { startTime: "", endTime: "" },
            status: [],
        };

        // 生命钩子函数
        @Lifecycle created() {
            this._queryAllUserGroup();
        };
        // 生命钩子函数
        @Lifecycle mounted() {
            this.setInititalDate();
            this.getList();
        }

        // 设置初始化时间
        setInititalDate() {
            // const starttime = new Date().getTime() - 30*24*60*60*1000;
            const d = new Date();
            this.init.query.startTime = moment(d).format("YYYY-MM-DD 00:00:00");
            this.init.query.endTime = moment(d).format("YYYY-MM-DD 23:59:59");
            this.$refs.rg.setDateRangeValues(this.init.query.startTime, this.init.query.endTime);
        }
        // 获取会员组list信息
        async _queryAllUserGroup() {
            const res = await this.$service.fetch("/lottery-admin-api/userGroup/queryAllUserGroup");
            if (1!==res.code) return res.message && this.$message.error(res.message);
            if (res?.data) {
                this.init.status = res.data;
            }
        }
        // 充值表单中表格状态
        resetPagination() {
            this.table.pagination.current = 1;
            this.init.query.pageNo = 1;
        }
        // 改变时间参数
        changeDate(startTime, endTime, datestring, type) {
            if (type === "start") {
                this.init.query.startTime = datestring;
            } else {
                this.init.query.endTime = datestring;
            }
        }
        // 获取整表数据
        async getList() {
            const form = await this.vform.validate();
            const values = this.$trimValues(form.values);
            const params = Object.assign(this.init.query, values);
            this.init.loading = true;
            const res = await this.$service.fetch('/lottery-admin-api/manualChangeWallet/queryManualChangeWalletReport', params);
            this.init.loading = false;
            if (res.code !== 1) return res.message && this.$message.error(res.message);
            if (res.code === 1 &&  res?.data instanceof Array) {
                this.table.dataSource  = res.data;
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
