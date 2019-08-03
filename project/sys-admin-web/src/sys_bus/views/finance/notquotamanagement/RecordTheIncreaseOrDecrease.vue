<template>
    <section class="finance-check-container">
        <a-form class="form" layout="inline" :form="vform" @submit.prevent="getList(true)">
            <a-form-item class="range" label="操作时间">
                <DateRange :showTime="true" title="" @change="changeDate" ref="rg"/>
            </a-form-item>
            <a-form-item label="会员账号">
                <a-input v-decorator="['userName']"  style="width: 120px;" placeholder="请输入会员账号" />
            </a-form-item>
            <a-form-item label="操作人">
                <a-input v-decorator="['adminName']"  style="width: 120px;" placeholder="请输入操作人" />
            </a-form-item>
            <a-form-item label="增减类型">
                <a-select style="width: 120px;" v-decorator="['operateType']" :dropdownMatchSelectWidth="false">
                    <a-select-option value="">全部</a-select-option>
                    <a-select-option v-for="(item, index) in init.status" :key="index" :value="+item.operateType">{{item.name}}</a-select-option>
                </a-select>
            </a-form-item>
            <a-form-item label="每页条数">
                <a-input style="width: 50px;"  v-number="true" v-decorator="['pageSize', {initialValue:20, rules: [{required:true,message:'条数必须为整数'}]}]"></a-input>
            </a-form-item>
            <a-form-item>
                <a-button type="primary" html-type="submit" :loading="init.loading">查询</a-button>
            </a-form-item>
        </a-form>
        <div class="page-under-table finance-wrapper">
            <a-table class="mytable"  bordered :columns="table.columns" :dataSource="table.dataSource" :pagination="false" :rowKey="(e, i) => i">
                <template slot="operateAmount" slot-scope="t, r">
                    <span>{{ getThousandNum(r.operateAmount) }}</span>
                </template>
                <template slot="operateType" slot-scope="t, r">
                    <span>
                        {{ r.operateType === 1 ? '增加': '减少' }}
                    </span>
                </template>
            </a-table>
            <div style="text-align:right;padding-top:20px;">
                <a-pagination :current="table.pagination.current" :total="table.pagination.total" :pageSize="table.pagination.pageSize" @change="changePagination" />
            </div>
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
                { title: "会员账号", dataIndex: "userName", align: "left", width: 200 },
                { title: "增减类型", dataIndex: "operateType", scopedSlots: { customRender: "operateType" }, align: "left" },
                { title: "变动不可提额度", dataIndex: "operateAmount", scopedSlots: { customRender: "operateAmount" }, align: "left" },
                { title: "备注", dataIndex: "remark", align: "left" },
                { title: "操作时间", dataIndex: "createTime" , align: "left"},
                { title: "操作人", dataIndex: "adminName", align: "left" }
            ],
            dataSource: [],
            pagination: { total: 0, current: 1, pageSize: 20 }
        };
        // 请求参数集
        init = {
            loading: false,
            allUserGroup: [],
            // 查询参数
            query: { pageNo: 1, pageSize: 20, startTime: "", endTime: "" },
            time: { startTime: "", endTime: "" },
            // 增减类型
            status: [
                {
                    operateType: "1",
                    name: "增加"
                },
                {
                    operateType: "-1",
                    name: "减少"
                }
            ]
        };

        // 生命钩子函数
        @Lifecycle created() {
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
            this.init.query.startTime = moment(d).format("YYYY-MM-DD 00:00:00");
            this.init.query.endTime = moment(d).format("YYYY-MM-DD 23:59:59");
            this.$refs.rg.setDateRangeValues(this.init.query.startTime, this.init.query.endTime);
        }
        // 设定表单初始值
        setInitialChecked() {
            this.vform.setValue("operateType", "");
            this.vform.setValue("userName", "");
            this.vform.setValue("adminName", "");
        }
        // 换页
        changePagination(pagination) {
            this.table.pagination.current = pagination;
            this.init.query.pageNo = pagination;
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
                this.init.query.startTime = datestring
            } else {
                this.init.time.endTime = datestring;
                this.init.query.endTime = datestring
            }
        }
        // 获取表格参数
        async getList(refresh) {
            if (refresh) this.resetPagination();
            const form = await this.vform.validate();
            const values = this.$trimValues(form.values);
            const params = Object.assign(this.init.query, values);
            this.init.loading = true;
            const res = await this.$service.fetch('/lottery-admin-api/unwithdrawableAmountRecord/queryPageUnwithdrawableAmountRecord', params);
            this.init.loading = false;
            if (res.code !== 1) return res.message && this.$message.error(res.message);
            if (res.data?.records) {
                this.table.dataSource = res.data.records;
            }
            this.table.pagination.total = res.data.totalCount;
            this.table.pagination.size = res.data.totalPage;
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
