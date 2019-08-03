<template>
    <div class="subaccount-box page-container">
        <a-button type="primary" @click="edit('t', 'addEdit')" v-permission="10152">添加</a-button>
        <a-table class="mytable mt15" bordered :columns="columns" :dataSource="dataSource" :rowKey="e => e.id" :pagination="false">
            <template slot="operation" slot-scope="r, t">
                <a-button type="primary" size="small" @click="edit(t, 'fixEdit');" v-permission="10153">编辑</a-button>
            </template>
        </a-table>
        <a-pagination
            :current="pagination.current"
            class="mt15"
            style="text-align:right;"
            :total="pagination.total"
            @change="changePagination"
            @showSizeChange="showSizeChange"
        />

        <a-modal :title="flag==='edit'?`修改扫码支付配置`:`添加扫码支付配置`" v-model="modalShow" :footer="false" :destroyOnClose="true" :maskClosable="false">
            <div style="text-align:left;">
                <a-form :form="vform" @submit.prevent="flag==='edit'?_editEnter(true):_addEnter(true)">
                    <a-form-item label="支付跳转名称" v-bind="formItemLayout">
                       <a-input v-decorator="['linkName', { rules: [{required:true,message:'支付跳转名称不为空',pattern:/\S/}]}]" placeholder="请输入支付跳转名称"></a-input>
                    </a-form-item>
                    <a-form-item  label="跳转链接" v-bind="formItemLayout">
                        <!--<a-input-->
                            <!--v-decorator="['linkUrl', {rules: [{required:false,message:'请输入符合的跳转链接',pattern:/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm }]}]"-->
                            <!--placeholder="请输入支付跳转名称"/>-->
                        <a-input
                                v-decorator="['linkUrl', {rules: [{required:false,message:'请输入跳转链接' }]}]"
                                placeholder="请输入支付跳转名称"/>
                    </a-form-item>
                    <div style="text-align: center;">
                        <a-button type='primary' html-type="submit">提交</a-button>
                    </div>
                </a-form>
            </div>
        </a-modal>
    </div>
</template>

<script>
    import Vue from "vue";
    import { Component, Lifecycle, Watch, InjectComponents } from "vue-decorators";
    @Component({
        formOptions: {
            vform: "id"
        }
    })
    @InjectComponents({ })
    export default class ThirdPartyIn extends Vue {
        formItemLayout={ labelCol: { span: 6 }, wrapperCol: { span: 15 }, };
        modalShow=false;
        flag="add";
        pagination = { total: 0, current: 1 };
        pageParms = { pageNo: 1, pageSize: 10 };
        details = {};
        detailsforpayment = {};
        dataSource = [];
        columns = [
            { title: "支付跳转名称", dataIndex: "linkName" },
            { title: "跳转链接", dataIndex: "linkUrl" },
            { title: "创建时间", dataIndex: "createTime" },
            { title: "操作", scopedSlots: { customRender: "operation" } }
        ];
        initParams = { id: null, linkName: '', linkUrl: '' };

        init = { loading: false };

        setInitialValues() {
            this.vform.setValues({
                id: null,
                linkName: '',
                linkUrl: ''
            }, true);
        }

        resetPagination() {
            this.pagination.current = 1;
            this.pageParms.pageNo = 1;
        }

        async changePagination(p, s) {
            this.pagination.current = p;
            this.pageParms.pageSize = s;
            this.pageParms.pageNo = p;
            this.queryPageQrcodeLink();
        }

        async showSizeChange(p, s) {
            this.pagination.current = p;
            this.pageParms.pageSize = s;
            this.pageParms.pageNo = p;
            this.queryPageQrcodeLink();
        }

        async _editEnter(refresh) {
            const form = await this.vform.validate();
            const res = await this.$service.fetch("/config-admin-api/qrcodeLink/editQrcodeLink", Object.assign(this.initParams, form.values));
            if (1!==res.code) return res.message && this.$message.error(res.message);
            this.modalShow = false;
            this.$message.success(res.message);
            this.setInitialValues();
            this.queryPageQrcodeLink();
        }

        async _addEnter(refresh) {
            const form = await this.vform.validate();
            const res = await this.$service.fetch("/config-admin-api/qrcodeLink/addQrcodeLink", form.values);
            if (1!==res.code) return res.message && this.$message.error(res.message);
            this.modalShow = false;
            this.$message.success(res.message);
            this.setInitialValues();
            this.resetPagination();
            this.queryPageQrcodeLink();
        }

        async edit(t, showName) {
            this.modalShow = true;
            if (showName === 'addEdit') {
                this.flag = "add";
            } else if (showName === "fixEdit") {
                this.flag = "edit";
                const res = await this.$service.fetch("/config-admin-api/qrcodeLink/getQrcodeLinkDetail", { id: t.id });
                if (res.code !== 1) return res.message && this.$message.error(res.message);
                // this._editEnter(res.data);
                this.initParams = {
                    id: res.data.id,
                    linkName: res.data.linkName,
                    linkUrl: res.data.linkUrl
                };
                this.vform.setValues({
                    id: res.data.id,
                    linkName: res.data.linkName,
                    linkUrl: res.data.linkUrl
                }, true);
            }
        }

        /** 翻页查询 */
        async queryPageQrcodeLink() {
            const res = await this.$service.fetch("/config-admin-api/qrcodeLink/queryPageQrcodeLink", this.pageParms);
            if (1!==res.code) return res.message && this.$message.error(res.message);
            if (res.data?.records) {
                this.dataSource = res.data.records;
                this.pagination.total = res.data.totalCount;
            }
        }
        /**  初始化页面数据 */
        async getAllQrcodeLink() {
            const res = await this.$service.fetch("/config-admin-api/qrcodeLink/queryAllQrcodeLink");
            if (1!==res.code) return res.message && this.$message.error(res.message);
            if (res.data) {
                this.dataSource = res.data;
            }
        }

        @Lifecycle() async created() {
            await this.queryPageQrcodeLink();
            this.form = this.$form.createForm(this);
            this.pagination.current = 1;
        }

        @Lifecycle() async mounted() {
            await this.setInitialValues();
        }
    }
</script>

<style lang="scss" scoped>
    @import "@views/admin/Pop.scss";
    .subaccount-box /deep/ {
        .ant-btn {
            margin-top: 4px;
        }
    }
    .remark {
        max-width: 200px;
        word-break: break-all;
    }
</style>
