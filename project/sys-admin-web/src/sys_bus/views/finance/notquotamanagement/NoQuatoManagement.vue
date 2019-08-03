<template>
    <section class="finance-check-container">
        <a-form class="form" layout="inline" :form="vform" @submit.prevent="getList(true)">
            <a-form-item label="会员账号">
                <a-input v-decorator="['userName']"  style="width: 120px;" placeholder="请输入会员账号" />
            </a-form-item>
            <a-form-item label="会员组">
                <a-select style="width: 120px;" v-decorator="['usergroupId']" :dropdownMatchSelectWidth="false">
                    <a-select-option value="">全部</a-select-option>
                    <a-select-option v-for="(item, index) in init.status" :key="index" :value="item.groupId">{{item.groupName}}</a-select-option>
                </a-select>
            </a-form-item>
            <a-form-item label="VIP等级">
                <a-select style="width: 120px;" v-decorator="['vipLevel']" :dropdownMatchSelectWidth="false">
                    <a-select-option value="">全部</a-select-option>
                    <a-select-option v-for="(item, index) in init.viplevellist" :key="index" :value="item.vipLevel">{{item.vipLevelName}}</a-select-option>
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
                <template slot="vipLevel" slot-scope="text,record">
                    <span>VIP{{record.vipLevel}}</span>
                </template>
                <template slot="walletBalance" slot-scope="text, record">
                    <span>{{getThousandNum(record.walletBalance)}}</span>
                </template>
                <template slot="totalRechargeAmount" slot-scope="text, record">
                    <span>{{getThousandNum(record.totalRechargeAmount)}}</span>
                </template>
                <template slot="unwithdrawableAmount" slot-scope="text, record">
                    <span>{{getThousandNum(record.unwithdrawableAmount)}}</span>
                </template>
                <template slot="operation" slot-scope="text,record">
                    <a-button class="common-green-btn" size="small" @click.prevent="Increase(record)">增加</a-button>
                    <a-button class="common-yellow-btn" size="small" @click.prevent="Reduce(record)" style="margin-left: 10px;">减少</a-button>
                </template>
            </a-table>
            <div style="text-align:right;padding-top:20px;">
                <a-pagination :current="table.pagination.current" :total="table.pagination.total" :pageSize="table.pagination.pageSize" @change="changePagination" />
            </div>
        </div>
        <a-modal :title="init.isIncrease ? '增加':'减少'" v-model="init.modalShow" :footer="null" :destroyOnClose="true" :width="540" :maskClosable="false">
            <a-form class="bank" :form="formElem" @submit.prevent="patch">
                <a-form-item label="会员账号" :label-col="{ span: 7 }" :wrapper-col="{ span: 15 }">
                    <a-input v-decorator="['userId', {initialValue: increaseformData.userName, rules: [{required: false, message: '会员账号不能为空'}] }]" disabled/>
                </a-form-item>
                <a-form-item label="当前不可提额度" :label-col="{ span: 7 }" :wrapper-col="{ span: 15 }">
                    <a-input v-decorator="['currentUnwithdrawableAmount', {initialValue: increaseformData.unwithdrawableAmount, rules: [{required: false, pattern:  /^(\d+|\d+\.\d{1,2})$/g, message: '当前不可提额度'}] }]" disabled/>
                </a-form-item>
                <a-form-item :label="init.isIncrease ? '增加':'减少'" :label-col="{ span: 7 }" :wrapper-col="{ span: 15 }">
                    <a-input  v-decorator="['operateAmount', {rules: [{required: true, pattern: /^(\d+|\d+\.\d{1,2})$/g, message: '请正确输入增加或减少额度'}] }]" :placeholder="init.isIncrease ? '输入增加额度':'输入减少额度'" @input="calculate"/>
                </a-form-item>
                <a-form-item :label="init.isIncrease ? '增加后的不可提额度':'减少后的不可提额度'" :label-col="{ span: 7 }" :wrapper-col="{ span: 15 }">
                    <a-input v-decorator="['afterOperateUnwithdrawableAmount', {rules: [{ required: false, pattern:  /^(\d+|\d+\.\d{1,2})$/g, message: '增加后的不可提额度' }]} ]"/>
                </a-form-item>
                <a-form-item label="备注" :label-col="{ span: 7 }" :wrapper-col="{ span: 15 }">
                    <a-textarea v-decorator="['remark', {rules: [{ required: false, message: '请备注' }] } ]" placeholder="请输入备注信息" :rows="3"/>
                </a-form-item>
                <a-form-item label="谷歌验证码" :label-col="{ span: 7 }" :wrapper-col="{ span: 15 }">
                    <a-input v-decorator="['googleCode', {rules: [{ required: true, message: '请输入google验证码' }] } ]" placeholder="请输入google验证码" />
                </a-form-item>
                <div style="width: 100%; margin-left: 180px;">
                    <a-button type="primary" html-type="submit" :loading="init.loading">提交</a-button>
                     &nbsp;&nbsp;&nbsp;<a-button type="primary" @click.prevent="init.modalShow = false">取消</a-button>
                </div>
            </a-form>
        </a-modal>
    </section>
</template>
<script>
    import Vue from "vue";
    import { Component, Lifecycle } from "vue-decorators";

    const formOptions = { formElem: "id", vform: "id" };
    @Component({ formOptions })
    export default class NoQuatoManagement extends Vue {
        table = {
            key: 1,
            columns: [
                { title: "会员账号", dataIndex: "userName", align: "left" },
                { title: "会员组", dataIndex: "userGroupName", align: "left" },
                { title: "VIP等级", dataIndex: "vipLevel",scopedSlots: { customRender: "vipLevel" }, align: "left" },
                { title: " 用户余额", dataIndex: "walletBalance", scopedSlots: { customRender: "walletBalance" }, align: "left" },
                { title: "累计充值金额", dataIndex: "totalRechargeAmount" , scopedSlots: { customRender: "totalRechargeAmount" }, align: "left"},
                { title: "当前不可提额度", dataIndex: "unwithdrawableAmount", scopedSlots: { customRender: "unwithdrawableAmount" }, align: "left" },
                { title: "操作", dataIndex: "operation", scopedSlots: { customRender: "operation" }, align: "center" }
            ],
            dataSource: [],
            pagination: { total: 0, current: 1, pageSize: 20 }
        };
        // 充值合计
        increaseformData = {};
        // 请求参数集
        init = {
            loading: false,
            modalShow: false,
            allUserGroup: [],
            // 查询参数
            query: { pageNo: 1, pageSize: 20 },
            time: { startTime: "", endTime: "" },
            // 会员组array
            status: [],
            // vip等级array
            viplevellist: [],
            // 是否增加
            isIncrease: true
        };

        // 生命钩子函数
        @Lifecycle created() {
            this._queryAllUserGroup();
            this.queryAllVipList();
        };
        // 生命钩子函数
        @Lifecycle mounted() {
            this.setInitialChecked();
            this.getList();
        }
        // 设定表单初始值
        setInitialChecked() {
            this.vform.setValue('usergroupId', '');
            this.vform.setValue('vipLevel', '');
        }
        // 增加或减少金额
        async calculate() {
            if (this.init.isIncrease) {
                const form = this.formElem.getValues();
                const values = this.$trimValues(form);
                let totalAccountMont = this.$tools.add(+values.currentUnwithdrawableAmount, +values.operateAmount);
                // let totalAccountMont = +values.currentUnwithdrawableAmount + (+values.operateAmount);
                await this.formElem.setValue('afterOperateUnwithdrawableAmount', totalAccountMont.toFixed(2));
            } else {
                const form = this.formElem.getValues();
                const values = this.$trimValues(form);
                // 如果减少金额大于当前金额
                if (+values.operateAmount > +values.currentUnwithdrawableAmount) {
                    this.$message.error('请输入正确减少金额');
                    await this.formElem.setValue('afterOperateUnwithdrawableAmount', 0);
                } else {
                    let totalAccountMont = this.$tools.subtract(+values.currentUnwithdrawableAmount, +values.operateAmount);
                    // let totalAccountMont = +values.currentUnwithdrawableAmount - (+values.operateAmount);
                    await this.formElem.setValue('afterOperateUnwithdrawableAmount', totalAccountMont.toFixed(2));
                }
            }
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
            this.table.pagination.current = pagination;
            this.init.query.pageNo = pagination;
            this.getList();
        }
        // 充值表单中表格状态
        resetPagination() {
            this.table.pagination.current = 1;
            this.init.query.pageNo = 1;
        }
        // 增加
        Increase(increaseData) {
            this.increaseformData = increaseData;
            this.init.modalShow = true;
            this.init.isIncrease = true;
        }
        // 减少
        Reduce(reduceData) {
            this.increaseformData = reduceData;
            this.init.modalShow = true;
            this.init.isIncrease = false;
        }
        // 提交修改-增加|减少
        async patch() {
            const form = await this.formElem.validate();
            if (form.errors) return;
            const values = this.$trimValues(form.values);
            if (!this.init.isIncrease) {
                values.operateAmount = -(values.operateAmount);
            }
            values.userId = this.increaseformData.userId;
            const res = await this.$service.fetch("/lottery-admin-api/unwithdrawableAmountRecord/editUnwithdrawableAmount", Object.assign(values, { operateType: this.init.isIncrease ? 1 : -1 }));
            if (res.code !== 1) return res.message && this.$message.error(res.message);
            if (res.code === 1) {
                this.getList();
                this.init.modalShow = false;
                this.$message.success(res.message);
            }
        }
        // 获取整表数据
        async getList(refresh) {
            if (refresh) this.resetPagination();
            const form = await this.vform.validate();
            const values = this.$trimValues(form.values);
            const params = Object.assign(this.init.query, values);
            this.init.loading = true;
            const res = await this.$service.fetch('/lottery-admin-api/unwithdrawableAmountRecord/queryPageUnwithdrawableUser', params);
            this.init.loading = false;
            if (res.code !== 1) return res.message && this.$message.error(res.message);
            if (res.code === 1 && res.data?.records instanceof Array) {
                this.table.dataSource = res.data.records;
            }
            this.table.pagination.total = res.data.totalCount;
        }
        // vip等级获取
        async queryAllVipList() {
            const res = await this.$service.fetch('/config-admin-api/vipLevelConfig/queryAllVipLevelConfig');
            if (res.code !== 1) return res.message && this.$message.error(res.message);
            if (res?.data) {
                this.init.viplevellist = res.data;
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
