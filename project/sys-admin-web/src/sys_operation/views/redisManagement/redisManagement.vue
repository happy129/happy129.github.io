<template>
    <section class="buss-container">
        <a-form layout="inline" :form="vform0" @submit.prevent="getList(true)">
            <a-form-item label="服务器">
                <a-select style="width: 150px;" v-decorator="['redisServer',{ initialValue: '' , rules: [{required: false, message:'请选择服务器'}]}]" :dropdownMatchSelectWidth="false">
                    <a-select-option value>请选择</a-select-option>
                    <a-select-option v-for="(item, index) in dictionary.redisServer" :key="index" :value="item.name">{{item.value}}</a-select-option>
                </a-select>
            </a-form-item>
            <br>
            <a-form-item label="命令">
                <a-select
                        style="width: 150px; margin-left: 13px;"
                        v-decorator="['redisCommand',{ initialValue: '' , rules: [{required: false, message:'请选择命令'}]}]"
                        @change="changeCommand"
                        :dropdownMatchSelectWidth="false">
                    <a-select-option value="">请选择</a-select-option>
                    <a-select-option v-for="(item, index) in dictionary.redisCommand" :key="index" :value="item.name">{{item.value}}</a-select-option>
                </a-select>
            </a-form-item>
            <a-form-item label="key" v-if="init.isShowKey">
                <a-input v-decorator="['key',{ initialValue: '' , rules: [{required: false, message:'请填key'}]}]" />
            </a-form-item>
            <a-form-item label="item" v-if="init.isShowItem">
                <a-input v-decorator="['item',{ initialValue: '' , rules: [{required: false, message:'请填item'}]}]" />
            </a-form-item>
            <a-form-item label="start" v-if="init.isShowStart">
                <a-input v-decorator="['start',{ initialValue: '' , rules: [{required: false, message:'请填start'}]}]" />
            </a-form-item>
            <a-form-item label="end" v-if="init.isShowEnd">
                <a-input v-decorator="['end',{ initialValue: '' , rules: [{required: false, message:'请填end'}]}]" />
            </a-form-item>
            <a-form-item>
                <a-button type="primary" html-type="submit" :loading="init.loading">查询</a-button>
            </a-form-item>
        </a-form>
        <div class="page-under-table">
            <span>查询结果:</span>
            <br/>
            <a-textarea style="width:100%; height: 500px;" placeholder="查询结果" :value="init.message" :rows="4" readOnly></a-textarea>
        </div>
    </section>
</template>

<script>
    import Vue from "vue";
    import { Component, Lifecycle, InjectComponents, Watch } from "vue-decorators";

    @Component({ dictionary: 'redisServer,redisCommand', formOptions: {vform0: "id",}})
    export default class BussinessManage extends Vue {
        init = {
            loading: false,
            ServerList: [
                {
                    redisServer: 0,
                    name: 'redis'
                },
                {
                    redisServer: 1,
                    name: 'statRedis'
                },
                {
                    redisServer: 2,
                    name: 'sessionRedis'
                }
            ],
            redisCommandList: [
                {
                    redisCommand: 0,
                    name: 'get'
                },
                {
                    redisCommand: 1,
                    name: 'hGetObject'
                },
                {
                    redisCommand: 2,
                    name: 'hGetAll'
                },
                {
                    redisCommand: 3,
                    name: 'sGet'
                },
                {
                    redisCommand: 4,
                    name: 'IRange'
                },
                {
                    redisCommand: 5,
                    name: 'ISize'
                },
            ],
            // 结果信息
            message: '',
            // 是否显示key
            isShowKey: false,
            // 是否显示item
            isShowItem: false,
            // 是否显示start
            isShowStart: false,
            // 是否显示end
            isShowEnd: false
        };

        // 选择命令
        async changeCommand() {
            const data = await this.vform0.getValues();
            if (data.redisCommand !== '') {
                this.init.isShowKey = true;
            }
            data.redisCommand === '2' ?  this.init.isShowItem = true : this.init.isShowItem = false;
            if (data.redisCommand === '5') {
                this.init.isShowStart = true;
                this.init.isShowEnd = true;
            } else {
                this.init.isShowStart = false;
                this.init.isShowEnd = false;
            }
        }


        async getList() {
            const form = await this.vform0.validate();
            if (form.errors) return;
            this.init.loading = true;
            const res = await this.$service.fetch("/config-admin-api/redis/executeCommand", {...form.values});
            this.init.loading = false;
            if (res.code !== 1) return res.message && this.$message.error(res.message);
            this.init.message = res.data[form.values?.key];
        }
    }
</script>

<style lang="scss" scoped>
    .buss-container {
        height: 100%; padding: 15px 10px; box-sizing: border-box;
        overflow-y: auto; border-radius: 4px; background-color: #fff;
    }
    .logo-wrapper {
        width: 120px;
        text-align: center;
        img {
            max-width: 100%;
        }
    }
    .myform /deep/{
        .ant-form-item {
            margin-bottom: 6px;
        }
    }
</style>
