<template>
    <!--所有上级代理 -->
    <div class="page-container">
        <section class="report-order">
            <div class="mt15">
                <a-form layout="inline">
                    <a-form-item label="会员账号">
                        <a-input placeholder="请输入会员账号"/>
                    </a-form-item>
                    <a-form-item>
                        <a-button @click="sensitiveWordAdd" type="primary">查询</a-button>
                    </a-form-item>
                    <a-form-item>
                        <p style="color: red;">查询当前账号的所有上级，最上面的为顶级代理</p>
                    </a-form-item>
                </a-form>
            </div>
            <div class="mt15">
                <a-table
                    class="mytable"
                    bordered
                    :rowKey="(e,i) => i"
                    @change="changeTablePagenation"
                    :columns="columns"
                    :dataSource="tableData"
                    :pagination="pagination">
                </a-table>
            </div>
        </section>
    </div>
</template>

<script>
    import Vue from "vue";
    import { Modal, Notification as Notice } from "ant-design-vue";
    import * as Api from "@api/chatroom";
    import { Component, InjectComponents, Lifecycle } from "vue-decorators";

    @Component
    export default class ChatStopWords extends Vue {
        params = {
            pageNo: 1,
            pageSize: 10
        };
        pagination = {
            total: 0,
            current: 1
        };
        word = "";
        columns = [
            {
                title: "ID",
                dataIndex: "id"
            },
            {
                title: "上级账号",
                dataIndex: "word"
            },
            {
                title: "昵称",
                dataIndex: "nickname"
            },
            {
                title: '注册时间',
                dataIndex: "注册时间"
            }
        ];
        tableData = [];
        //
        // @Lifecycle created() {
        //     this.sensitiveWordPage();
        // }
        // 切换分页
        changeTablePagenation(pagination) {
            this.pagination.current = pagination.current;
            this.params.pageNo = pagination.current;
            this.sensitiveWordPage();
        }

        resetPagination() {
            this.pagination.current = 1;
            this.params.pageNo = 1;
        }

        async sensitiveWordPage(reset) {
            if (reset) this.resetPagination();
            const { data: response } = await Api.sensitiveWordPage(this.params);
            if (
                response?.body?.code === 1 &&
                response?.body?.data?.records instanceof Array
            ) {
                this.tableData = response.body.data.records;
                this.pagination.total = response.body.data.totalCount;
            }
        }
        async sensitiveWordAdd() {
            if (this.word === "") {
                this.$message.error("请输入关键字");
                return;
            }
            const { data: response } = await Api.sensitiveWordAdd({ word: this.word });
            if (response?.body?.code === 1) {
                Notice.success({
                    message: response.body.message
                });
                this.sensitiveWordPage(true);
                this.word = "";
            }
        }
        async sensitiveWordRemove(id) {
            const { data: response } = await Api.sensitiveWordRemove({ id: id });
            if (response?.body?.code === 1) {
                Notice.success({
                    message: response.body.message
                });
                this.sensitiveWordPage();
            }
        }

    }
</script>

<style lang="scss">
    .report-order-text {
        margin: 15px 0;

        span {
            margin-right: 10px;
        }
    }
</style>