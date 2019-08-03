<template>
    <div class="crown-wrapper">

        <a-form layout="inline" :form="vform" class="query-form" @submit.prevent="getList(true)">
            <div class="query-item-1">
                <div class="quick-picker">
                    <DateRange :defaultDate="true" title="投注时间" ref="rg" @current="setCurrent" @change="changeDate"/>
                </div>
                <div class="quick-select-area">
                    <span>快捷选时：</span><DateSwitch @changeTab="changeQuickTime" className="btn-1"/>
                </div>
            </div>
            <div class="query-item-1">
                <a-form-item class="user-name" label="高频彩">
                    <a-select  v-model="lotteryType" class="lottery-category" @change="changeLotteryType">
                        <a-select-option value="null">全部</a-select-option>
                        <a-select-option value="0">高频彩</a-select-option>
                        <a-select-option value="1">低频彩</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="选择彩种">
                    <a-cascader :options="init.lotteryCategory" v-decorator="['lotteryId']" @change="changeLottery"  :loadData="loadLotteryData" :allowClear="false"  placeholder="选择彩种类型"/>
                </a-form-item>
                <a-form-item label="选择玩法">
                    <a-select v-decorator="['playId']"  style="width: 200px;" placeholder="请选择">
                        <!--<a-select-option value="">全部</a-select-option>-->
                        <a-select-option v-for="(d, i) in init.playIds" :value="`${d.id}`" :key="i">{{d.playName}}</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="期号">
                    <a-input v-decorator="['issueNo']"/>
                </a-form-item>
                <a-form-item label="订单号">
                    <a-input v-decorator="['orderNo']" />
                </a-form-item>
            </div>

            <div class="mt10">
                <a-form-item  class="user-name" label="用户名">
                    <a-input v-decorator="['userName']"/>
                </a-form-item>
                <a-form-item  label="状态">
                    <a-select v-decorator="['orderStatus']" class="lottery-category">
                        <a-select-option value="">全部</a-select-option>
                        <a-select-option v-for="(item, index) in dictionary.orderStatus" :key="index" :value="item.value">{{item.name}}</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="来源">
                    <a-select v-decorator="['clientType']" class="lottery-category">
                        <a-select-option value="">全部</a-select-option>
                        <a-select-option v-for="(d, i) in clientTypes" :key="i" :value="`${d.value}`">{{d.name}}</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item>
                    <a-button :loading="init.loading" html-type="submit" type="primary">查询</a-button>
                </a-form-item>
            </div>
        </a-form>

        <div class="page-under-table">
            <ul class="summary-data">
                <li>投注总数：{{summary.totalOrderCount || '0'}} 注</li>
                <li>投注总额：{{summary.totalOrderAmount || '0.00'}} 元</li>
                <li>中奖总额：{{summary.totalWinAmount || '0.00'}} 元</li>
                <li>有效投注：{{summary.validOrderAmount || '0.00'}} 元</li>
                <li>有效注单：{{summary.validOrderCount || '0'}} 注</li>
                <li>返点总额：{{summary.totalRebateAmount || '0.00'}} 元</li>
                <li>撤销投注：{{summary.cancelledOrderAmount || '0.00'}} 元</li>
                <li>平台盈亏：{{summary.totalProfit || '0.00'}}</li>
                <li>撤销注单：{{summary.cancelledOrderCount || '0'}} 注 </li>
            </ul>
        </div>

        <a-table
            class="mytable mt10"
            bordered
            :loading="init.loading"
            :columns="table.columns"
            :rowKey="(e, i) => i"
            :dataSource="table.dataSource"
            :pagination="false"
            @change="changePagination2">
            <template slot="orderNumber"> <p>订单号</p> <p>投注方式</p> </template>
            <template slot="lottery"> <p>彩种</p> <p>期号</p> </template>
            <template slot="orderNumberData" slot-scope="text, record">
                <p>{{record.orderNo}}</p>
                <p>{{record.orderTypeName}}</p>
            </template>
            <template slot="lotteryData" slot-scope="text, record">
                <p>{{record.lotteryName}}</p>
                <p>{{record.issueNo}}</p>
            </template>
            <template slot="rebateRate" slot-scope="text, record">
                <p>{{record.rebateRate}}</p>
            </template>
            <template slot="profit" slot-scope="text, record">
                <p :class="[ record.profit > 0 ? 'g-red' : 'g-green']"> {{ record.profit > 0 ? `+${record.profit}` : record.profit}}</p>
            </template>
            <template slot="orderStatusName" slot-scope="text, record">
                <p :class="[record.orderStatus == 4 ? 'g-red' : record.orderStatus == 3 ? 'g-green' : '']">{{record.orderStatusName}}</p>
            </template>
            <template slot="clientType" slot-scope="text, record">
                {{  $getText(record.clientType, dictionary.clientType) }}
            </template>
        </a-table>
        <div style="text-align:right;padding-top:20px;">
            <a-pagination ref="pagination" @change="changePagination"  :current="table.pagination.current" :defaultCurrent="table.pagination.current" :total="table.pagination.total" />
        </div>
    </div>
</template>

<script>
    import Vue from "vue";
    import { Component, Lifecycle, InjectComponents, WatchExtra, Computed, Watch } from "vue-decorators";
    import DateRange from "@/components/date-range/DateRange";
    import { DateSwitch } from "@/components/switch"
    import { formatDate } from "@/util/date";

    const dsstore = {
        /** 所有彩种类型 */
        lotteryCategorys: { url: '/config-api/category/queryAllCategory' }
    }

    const dictionary = "clientType,orderStatus";

    @Component({ formOptions: "id", dsstore, dictionary })
    @InjectComponents({ DateRange, DateSwitch })
    export default class LotteryQuery extends Vue {
        table = {
            key: 1,
            columns: [
                { scopedSlots: { title: "orderNumber", customRender: 'orderNumberData' } },
                { title: "用户名", dataIndex: "userName"},
                { scopedSlots: { title: "lottery", customRender: "lotteryData" } },
                { title: "玩法", dataIndex: "playName" },
                { title: "投注内容", dataIndex: "awardItems"},
                { title: "投注金额", dataIndex: "orderAmount", sorter: true },
                { title: "返点", dataIndex: "rebateRate", scopedSlots: { customRender: "rebateRate" }, sorter: true },
                { title: "中奖", dataIndex: "winAmount", sorter: true },
                { title: "用户盈亏", dataIndex: "profit", scopedSlots: { customRender: 'profit' }, sorter: true },
                { title: "状态", scopedSlots: { customRender: 'orderStatusName'}},
                { title: "来源", scopedSlots: { customRender: 'clientType'}},
                { title: "投注时间", dataIndex: 'createTime', sorter: true }
            ],
            dataSource: [],
            pagination: { total: 0, current: 1}
        };

        init = {
            loading: false,
            value: [],
            playIds: [],
            query: { pageNo: 1, pageSize: 10, queryTimeStart: "",  queryTimeEnd: "", sortList: [], lotteryIds: ""},
            lotteryCategory: []
        };
        // 彩种类型
        lotteryType = "null";
        // 查询结束时间
        queryTimeEnd = '';

        summary = {};


        @Computed clientTypes() {
            return (this.dictionary?.clientType || []).filter(v => (v.value != -1 && v.value != 0));
        }

        @Lifecycle mounted() {
            this.setInitialValue();
            this.getList();
            // this.getAllLotteryList();
            this.changeLotteryType();
        }

        // 换页
        changePagination(pagination) {
            this.init.query.pageNo = pagination;
            this.table.pagination.current = pagination;
            this.getList(false, false);
        }

        // 获取彩票类型
        async changeLotteryType() {
            // const form = await this.vform.validate();
            this.init.query.lotteryIds = "";
            this.vform.setValues({
                lotteryIds: "",
                playId: "",
                issueNo: "",
                orderNo: "",
                orderStatus: "",
                userName: "",
                clientType: "",
                lotteryId: []
            }, true);
            this.init.playIds = [];
            this.init.value = [];
            if(this.lotteryType==='null') {
                this.getAllLotteryList();
            } else {
                const res = await this.$service.fetch("/config-api/lottery/queryAllCategoryAndLottery",  { lotteryType: this.lotteryType });
                const result = [];
                if (res.code === 1 && res.data instanceof Array) {
                    res.data.forEach(item => {
                        result.push({
                            value: item.categoryId,
                            label: item.categoryName,
                            isLeaf: false
                        });
                    });
                }
                this.init.lotteryCategory = result;
            }
            // this.setInitialValue();
        }
        // 获取彩票列表
        async loadLotteryData(selectedOptions) {
            const targetOption = selectedOptions[selectedOptions.length - 1];
            targetOption.loading = true;
            const res = await this.$service.fetch("/config-api/lottery/queryAllLotteryByCategoryId", { id: targetOption.value });
            targetOption.loading = false;
            if (res.code === 1 && res.data instanceof Array) {
                targetOption.children = res.data.map(item => {
                    return {
                        value: item.id,
                        label: item.lotteryName
                    }
                });
                // targetOption.children.unshift({
                //   value: "",
                //   label: "全部"
                // });
                this.init.lotteryCategory = [...this.init.lotteryCategory];
            }
        }

        // 设置初始化值
        setInitialValue() {
            this.vform.setValues({
                lotteryType: "",
                lotteryIds: "",
                playId: "",
                orderStatus: "",
                clientType: ""
            }, true);
        }

        async getAllLotteryList() {
            const res = await this.$service.fetch("/config-api/category/queryAllCategory");
            const result = [];
            if (res.code === 1 && res.data instanceof Array) {
                res.data.forEach(item => {
                    result.push({
                        value: item.id,
                        label: item.categoryName,
                        isLeaf: false
                    });
                });
            }
            // result.unshift({
            //     value: "",
            //     label: "全部"
            // });
            this.init.lotteryCategory = result;
        }

        // 选择彩票列表
        async changeLottery(value) {
            if (!value) return
            this.init.query.lotteryIds = value[1] ? value[1] : "";
            this.vform.setValues({playId: ""}, true);
            const res = await this.$service.fetch('/config-api/play/queryIdNameList', { id: value[0] });
            if (res.code !== 1) return res.message && this.$message.error(res.message);
            if (res.data instanceof Array) {
              this.init.playIds = res.data;
            }
            // this.init.query.lotteryCategoryId = value[0];
        }

        setCurrent(start, end) {
            this.init.query.queryTimeStart = start;
            this.init.query.queryTimeEnd = end;
        }

        changeDate(start, end, datestring, type) {
            if (type === "start") {
                this.init.query.queryTimeStart = datestring
            } else {
                this.init.query.queryTimeEnd = datestring
            }
        }

        changePagination2(pagination, filters, sorter) {
            // this.table.pagination.current = pagination.current;
            // this.init.query.pageNo = pagination.current;
            //
            const sortParams = {
                sortField: "",
                sortOrder: ""
            };

            // 点击排序
            if (sorter.order) {
                switch(sorter.order) {
                    case "ascend":
                        sortParams.sortField = sorter.field;
                        sortParams.sortOrder = "asc"
                        break;
                    case "descend":
                        sortParams.sortField = sorter.field;
                        sortParams.sortOrder = "desc"
                        break;
                }
            } else {
                sortParams.sortField = "orderAmount";
                sortParams.sortOrder = "desc"
            }
            // 设定排序
            this.init.query.sortList[0] = sortParams;

            this.getList(false, false);
        }

        resetPagination() {
            this.table.pagination.current = 1;
            this.init.query.pageNo = 1;
        }

        changeQuickTime(startTime, endTime) {
            this.init.query.queryTimeStart = startTime;
            this.init.query.queryTimeEnd = endTime;
            this.$refs.rg.setDateRangeValues(startTime, endTime);
        }

        async getList(refresh, page=true) {
            if (refresh) this.resetPagination();
            const form = await this.vform.validate();
            if (form.errors) return
            delete form.values.lotteryId;
            const params = this.$trimValues(form.values);
            const values = Object.assign(this.init.query, params, {lotteryType:this.lotteryType });

            if (page) {
                // 如果结束时间大于当前时间，设置为当前时间
                if (values.queryTimeEnd) {
                    const d = new Date(values.queryTimeEnd.replace(/\-/g, '/')).getTime();
                    const now = Date.now();
                    if (d > now) {
                        values.queryTimeEnd = formatDate(new Date());
                        // 缓存数据
                        this.queryTimeEnd = values.queryTimeEnd;
                    }
                }
            } else {
                const d1 = new Date(this.init.query.queryTimeEnd.replace(/\-/g, '/')).getTime();
                const d2 = new Date(this.queryTimeEnd.replace(/\-/g, '/')).getTime();
                if (d1 < d2) {
                    values.queryTimeEnd = this.init.query.queryTimeEnd
                } else {
                    values.queryTimeEnd = this.queryTimeEnd;
                }
            }

            this.init.loading = true;
            const res = await this.$service.fetch('/lottery-api/orderReport/queryPageOrderReport', values);
            this.init.loading = false;

            if (res.code !== 1) { this.table.dataSource = []; this.summary = { }; return res.message && this.$message.error(res.message) };
            if (res.code === 1 &&  res?.data?.records instanceof Array) {
                this.table.dataSource = res.data.records;
                this.table.pagination.total = res.data?.totalCount;
                this.hidePageNumber(res);
            } else {
                this.table.dataSource = [];
                this.table.pagination.total = 0;
            }

            this.getSummary(values);
        }

        changeSelection() {
            this.init.query.pageNo = 1;
            this.table.pagination.current = 1;
        }

        async getSummary(params) {
            const res = await this.$service.fetch('/lottery-api/orderReport/queryBetOrderReportSummary', params);
            if (res.code !== 1) return res.message && this.$message.error(res.message);
            this.summary = res.data;
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
                lastElement.style.display = 'none';
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
    .crown-wrapper {
        background-color: #fff;
        min-height: 100%;
        padding: 10px;
        overflow-y: auto;
        box-sizing: border-box;
    }
    .query-item-1 /deep/{
        display: flex;
        align-items: center;
        padding-bottom: 10px;
        border-bottom: 1px solid #dcdcdc;
        padding-top: 10px;

        .quick-select-area {
            display: flex;
            align-items: center;
            margin-left: 10px;

            .btn-1 {
                button {
                    padding: 6px 12px;
                }
            }
        }
    }

    /deep/ .quick-picker {
        .ant-form-item {
            margin-right: 0;
        }
    }

    /deep/ .user-name {
        label {
            width: 68px;
            display: inline-block;
        }
    }

    /deep/ .query-form {
        .lottery-category {
            width: 110px;
        }
    }


    .summary-data {
        display: flex;
        flex-wrap: wrap;
        border-top: 1px solid #ccc;
        border-left: 1px solid #ccc;
        background-color: #f1f1f1;
        li {
            flex: 0 0 25%;
            box-sizing: border-box;
            padding: 5px 10px;
            border-right: 1px solid #ccc;
            border-bottom: 1px solid #ccc;
        }
    }
</style>