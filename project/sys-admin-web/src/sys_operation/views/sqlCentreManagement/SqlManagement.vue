<template>
    <div>
    <!-- sql管理页面 -->
    <section class="sqlmanagement-container" v-show="init.sqlmanagement">
        <a-form class="myform" layout="inline" :form="vform1" @submit.prevent="getList(true)">
            <a-form-item label="数据库类型">
                <a-select
                    class="sSelect"
                    v-decorator="['dbType', {initialValue: ''}]"
                    @change="ChangeDataBaseType"
                    :dropdownMatchSelectWidth="false">
                    <a-select-option value="">全部</a-select-option>
                    <a-select-option value="1">config库</a-select-option>
                    <a-select-option value="2">所有lottery库</a-select-option>
                    <a-select-option value="3">指定lottery库</a-select-option>
                </a-select>
            </a-form-item>
            <a-form-item label="平台名称" v-if="init.isMerchatShow0">
                <a-select
                        style="width: 180px;"
                        :value="init.query.platformName"
                        showSearch
                        :defaultActiveFirstOption="false"
                        :showArrow="false"
                        :filterOption="false"
                        @search="handleSearch"
                        @change="handleChangeMerchat"
                        :notFoundContent="init.fetching ? undefined : null">
                    <a-spin v-if="init.fetching" slot="notFoundContent" size="small"/>
                    <a-select-option v-for="d in init.mearchdata" :key="d.platformName">{{d.platformName}}</a-select-option>
                </a-select>
            </a-form-item>
            <a-form-item label="标题">
                <a-input class="w120"  v-decorator="['title', { initialValue: ''}]"/>
            </a-form-item>
            <a-form-item label="状态">
                <a-select class="sSelect" v-decorator="['status', { initialValue: '' }]" :dropdownMatchSelectWidth="true">
                    <a-select-option value="">全部</a-select-option>
                    <a-select-option value="0">草稿</a-select-option>
                    <a-select-option value="1">待审核</a-select-option>
                    <a-select-option value="2">审核通过</a-select-option>
                    <a-select-option value="3">审核不通过</a-select-option>
                    <a-select-option value="4">执行成功</a-select-option>
                    <a-select-option value="5">执行失败</a-select-option>
                </a-select>
            </a-form-item>
            <a-form-item label="每页条数">
                <a-input class="w120"  v-decorator="['pageSize', { initialValue: '10'} ]"/>
            </a-form-item>
            <a-form-item>
                <a-button type='primary' html-type="submit" :loading="init.loading">查询</a-button>
            </a-form-item>
            <br/>
            <a-form-item label="提交人">
                <a-input class="w120"  v-decorator="['applyAdminName', { initialValue: ''}]"/>
            </a-form-item>
            <a-form-item class="qr-range">
                <DateRange :isToday="true" :showTime="true" @current="setCurrent" title="提交时间" @change="changeDate" ref="rg"/>
            </a-form-item>
            <a-form-item label="审核人">
                <a-input class="w120"  v-decorator="['auditAdminName', { initialValue: ''}]"/>
            </a-form-item>
            <a-form-item class="qr-range">
                <DateRange :isToday="true" :showTime="true" @current="setCurrent" title="审核时间" @change="auditDate" ref="rg"/>
            </a-form-item>
            <br>
            <a-form-item label="执行人">
                <a-input class="w120"  v-decorator="['executeAdminName', { initialValue: ''}]"/>
            </a-form-item>
            <a-form-item class="qr-range">
                <DateRange :isToday="true" :showTime="true" @current="setCurrent" title="执行时间" @change="handleTime" ref="rg"/>
            </a-form-item>
        </a-form>
        <div class="page-under-table">
            <div class="total-data">
                <a-button type="primary" @click.prevent="changeOrderStatus(0, null)">添加</a-button>
            </div>
            <a-table class="mytable" bordered :loading="init.tableloading" :rowKey="(e,i) => i" :columns="table.columns" :dataSource="table.dataSource" :pagination="table.pagination" @change="changePagination">
                <template slot="dbType" slot-scope="text, records">
                    <span>{{ table.dbTypeList[records.dbType - 1] }}</span>
                </template>
                <template slot="status" slot-scope="text, records">
                    <span>{{ table.statusList[records.status] }}</span>
                </template>
                <template slot="operate" slot-scope="text, records">
                    <div>
                        <template  v-if="records.status === 1">
                            <div class="operationbtn">
                                <a-button size="small" class="common-green-btn" @click.prevent="changeOrderStatus(6, records)">查看详情</a-button>
                                <a-button size="small" class="common-yellow-btn" @click.prevent="changeOrderStatus(3, records)">审核</a-button>
                                <a-button size="small" class="common-red-btn" @click.prevent="changeOrderStatus(4, records)" >撤回</a-button>
                            </div>
                        </template>
                        <template v-else-if="records.status === 0">
                            <div class="operationbtn">
                                <a-button size="small" class="common-green-btn"  @click.prevent="changeOrderStatus(1, records)">编辑</a-button>
                                <a-button size="small" class="common-yellow-btn" @click.prevent="changeOrderStatus(8, records)">删除</a-button>
                            </div>
                        </template>
                        <template v-else-if="records.status === 2 || records.status === 3">
                            <div  class="operationbtn">
                                <a-button size="small" class="common-green-btn" @click.prevent="changeOrderStatus(7, records)">查看详情</a-button>
                                <a-button class="common-red-btn" size="small" @click.prevent="changeOrderStatus(5, records)">执行</a-button>
                            </div>
                        </template>
                        <template v-else>
                            <div  class="operationbtn">
                                <a-button size="small" class="common-green-btn" @click.prevent="changeOrderStatus(2, records)">查看详情</a-button>
                            </div>
                        </template>
                    </div>
                </template>
            </a-table>
        </div>

        <!-- 添加(提交SQL申请) -->
        <a-modal :title="popup1.title1" v-model="popup1.isOpenAddOrEditPoup" :footer="null" :destroyOnClose="true" :maskClosable="false" :width="600">
            <a-form class="myform-update" layout="inline" :form="vform2">
                <div class="m7 mt10">
                    <a-form-item class="label-1" label="数据库类型">
                        <a-select
                            style="width: 400px;"
                            v-decorator="['dbType', { initialValue: '1' , rules: [{ required: true, message:'请选择数据库类型'}]}]"
                            @change="handleChangeDataBaseType"
                            placeholder="请选择分类">
                            <a-select-option value="1">config</a-select-option>
                            <a-select-option value="2">所有lottery</a-select-option>
                            <a-select-option value="3">指定lottery</a-select-option>
                        </a-select>
                    </a-form-item>
                </div>
                <div class="m7 mt10" v-if="init.isMerchatShow">
                    <a-form-item class="label-1" label="平台名称">
                        <!--v-decorator="['platformId',{ rules: [{required:true,message:'请选择数据库类型'}]}]"-->
                        <a-select
                           :value="popup1.platformId"
                           style="width: 400px;"
                           showSearch
                           :defaultActiveFirstOption="false"
                           :showArrow="false"
                           :filterOption="false"
                           @search="handleSearch"
                           @change="handleChangeMerchat1"
                           :notFoundContent="null"
                        >
                            <a-select-option v-for="d in init.mearchdata" :key="d.platformId">{{d.platformName}}</a-select-option>
                        </a-select>
                    </a-form-item>
                </div>
                <div class="m7 mt10" >
                    <a-form-item class="label-1" label="标题">
                        <a-input style="width: 400px;" v-decorator="['title',{ initialValue: '' , rules: [{required:true,message:'请选择数据库类型'}]}]"/>
                    </a-form-item>
                </div>
                <div class="m7 mt10" >
                    <a-form-item class="label-1" label="提交备注">
                        <a-input style="width: 400px;" v-decorator="['remark',{ initialValue: '' , rules: [{required:true,message:'请填写备注'}]}]"/>
                    </a-form-item>
                </div>
                <div class="m7 mt10" >
                    <a-form-item class="label-1" label="是否要求备份">
                        <a-radio-group v-decorator="['isBackup',{ initialValue: '1' , rules: [{required:true,message:'请选择数据库是否要求备份'}]}]">
                            <a-radio value="1">是</a-radio>
                            <a-radio value="0">否</a-radio>
                        </a-radio-group>
                        <span style="color:red;">非系统自动备份，需运维人工备份</span>
                    </a-form-item>
                </div>
                <div class="m7 mt10">
                    <a-form-item class="label-1" label="SQL内容">
                        <a-textarea style="width: 400px; height: 240px;" placeholder="在这里输入SQL内容" v-decorator="['sqlContent']" :rows="4"></a-textarea>
                    </a-form-item>
                </div>
                <div class="m7 mt10">
                    <a-form-item class="label-1" label="Google验证码">
                        <a-input style="width: 400px;" v-decorator="['googleCode', { rules: [{ required: true, message: '请输入google验证码'}]}]" placeholder="输入验证码"/>
                    </a-form-item>
                </div>
                <div class="modify-btn">
                    <template>
                        <a-button type="default" :loading="init.saveloading" @click.prevent="saveSqlOpeation">保存</a-button>
                        <a-button type="primary" style="margin-left: 10px;" :loading="init.submitloading" @click.prevent="commitSqlApply">提交审核</a-button>
                        <a-button type="default" style="margin-left: 10px;" @click="popup1.isOpenAddOrEditPoup = false">取消</a-button>
                    </template>
                </div>
            </a-form>
        </a-modal>
        <!-- 操作弹窗 -->
        <a-modal :title="popup2.title2" v-model="popup2.showOperactionPopup" :footer="null" :destroyOnClose="true" :maskClosable="false" :width="600">
            <a-form class="myform-update" layout="inline" :form="vform3">
                <div class="m7 mt10">
                    <a-form-item class="label-1" label="数据库类型">
                        <a-select style="width: 400px;" v-decorator="['dbType', { initialValue: '3' , rules: [{required:true,message:'请选择数据库类型'}]}]" placeholder="请选择分类">
                            <a-select-option value="0">请选择</a-select-option>
                            <a-select-option value="1">config</a-select-option>
                            <a-select-option value="2">所有lottery</a-select-option>
                            <a-select-option value="3">指定lottery</a-select-option>
                        </a-select>
                    </a-form-item>
                </div>
                <div class="m7 mt10">
                    <a-form-item class="label-1" label="平台名称" v-if="init.isMerchatShow">
                        <!--v-decorator="['platformId',{ initialValue: '' , rules: [{required:true,message:'请选择数据库类型'}]}]"-->
                        <a-select
                                :value="popup2.platformId"
                                style="width: 400px;"
                                showSearch
                                :defaultActiveFirstOption="false"
                                :showArrow="false"
                                :filterOption="false"
                                @search="handleSearch"
                                @change="handleChangeMerchat2"
                                :notFoundContent="null"
                        >
                            <a-select-option v-for="d in init.mearchdata" :key="d.platformId">{{d.platformName}}</a-select-option>
                        </a-select>
                    </a-form-item>
                </div>
                <div class="m7 mt10" >
                    <a-form-item class="label-1" label="标题">
                        <a-input style="width: 400px;" v-decorator="['title',{ initialValue: '' , rules: [{required:true,message:'请选择数据库类型'}]}]"/>
                    </a-form-item>
                </div>
                <div class="m7 mt10" >
                    <a-form-item class="label-1" label="提交备注">
                        <a-input style="width: 400px;" v-decorator="['remark',{ initialValue: '' , rules: [{required:true,message:'请选择数据库类型'}]}]"/>
                    </a-form-item>
                </div>
                <div class="m7 mt10" >
                    <a-form-item class="label-1" label="是否要求备份">
                        <a-radio-group v-decorator="['isBackup',{ initialValue: '1' , rules: [{required:true,message:'请选择数据库是否要求备份'}]}]">
                            <a-radio value="1">是</a-radio>
                            <a-radio value="0">否</a-radio>
                        </a-radio-group>
                        <span style="color:red;">非系统自动备份，需运维人工备份</span>
                    </a-form-item>
                </div>
                <div class="m7 mt10">
                    <a-form-item class="label-1" label="审核人" v-if="init.isShowauditor">
                        <a-input style="width: 400px;" v-decorator="['auditAdminName',{ initialValue: '' , rules: [{ required: false }]}]" aria-placeholder="请输入备注"/>
                    </a-form-item>
                </div>
                <div class="m7 mt10">
                    <a-form-item class="label-1" label="审核备注" v-if="init.isShownote">
                        <a-input style="width: 400px;" v-decorator="['auditRemark',{ initialValue: '' , rules: [{required: false, message:'请备注'}]}]" aria-placeholder="请输入备注"/>
                    </a-form-item>
                </div>
                <div class="m7 mt10">
                    <template v-if="init.auditStatus">
                        <a-form-item class="label-1" label="状态" >
                            <a-input style="width: 260px;" v-decorator="['status',{ initialValue: '' , rules: [{ required: false }]}]"/>
                            <a-button
                               type="primary"
                               style="margin-left: 10px;"
                               @click="querySqlExecuteRecordList(popup2.id)"
                            >执行结果</a-button>
                        </a-form-item>
                    </template>
                    <template v-else>
                        <a-form-item class="label-1" label="状态">
                            <a-input style="width: 400px;" v-decorator="['status']"/>
                        </a-form-item>
                    </template>
                </div>
                <div class="m7 mt10">
                    <a-form-item class="label-1" label="SQL内容">
                        <a-textarea style="width: 400px; height: 240px;" placeholder="在这里输入SQL内容" v-decorator="['sqlContent']" :rows="4"></a-textarea>
                    </a-form-item>
                </div>
                <div class="m7 mt10" v-show="popup2.type !== 1">
                    <a-form-item class="label-1" label="Google验证码">
                        <a-input style="width: 400px;" v-decorator="['googleCode', { rules: [{ required: true, message: '请输入google验证码'}]}]" placeholder="输入验证码"/>
                    </a-form-item>
                </div>
                <div class="modify-btn">
                    <template  v-if="popup2.type === 1">
                        <a-button type="primary" @click="popup2.showOperactionPopup = false">关闭</a-button>
                    </template>
                    <template  v-if="popup2.type === 2">
                        <a-button type="primary" :loading="init.saveloading" @click.prevent="auditSqlApplyRecord(2)">审核通过</a-button>
                        <a-button class="common-yellow-btn" style="margin-left: 10px;" :loading="init.submitloading" @click.prevent="auditSqlApplyRecord(3)">审核不通过</a-button>
                        <a-button type="default" style="margin-left: 10px;" @click="popup2.showOperactionPopup = false"> 取消</a-button>
                    </template>
                    <template  v-if="popup2.type === 3">
                        <a-button class="common-yellow-btn" :loading="init.saveloading" @click.prevent="cancelSqlApplyRecord">撤回提交</a-button>
                        <a-button type="default" style="margin-left: 10px;" @click="popup2.showOperactionPopup = false"> 关闭</a-button>
                    </template>
                    <template  v-if="popup2.type === 4">
                        <a-button class="common-red-btn" :loading="init.saveloading" @click.prevent="executeSqlApplyRecord">执行</a-button>
                        <a-button type="default" style="margin-left: 10px;" @click="popup2.showOperactionPopup = false"> 取消</a-button>
                    </template>
                </div>
            </a-form>
        </a-modal>

    </section>
    <!-- 执行结果页面 -->
    <section class="sqlmanagement-container" v-show="!init.sqlmanagement">
        <div class="page-under-table">
            <div class="total-data">
                <a-button type="primary" @click.prevent="init.sqlmanagement = true">返回上一级</a-button>
            </div>
            <a-table class="mytable" bordered :loading="init.tableloading2" :rowKey="(e,i) => i" :columns="table2.columns" :dataSource="table2.dataSource" :pagination="table2.pagination">
                <template slot="status" slot-scope="text, records">
                    <span v-if="records.status === 0">等待执行</span>
                    <span v-else-if="records.status === 1">执行成功</span>
                    <span v-else-if="records.status === 2">执行失败</span>
                    <span v-else>执行失败后已对数据做修复处理</span>
                </template>
                <template slot="operate" slot-scope="text, records">
                    <div class="operationbtn">
                        <a-button size="small" class="common-green-btn" :loading="arrivedLoading" @click="getSqlExecuteRecord(records)">查看详情</a-button>
                    </div>
                </template>
            </a-table>
        </div>
        <!-- 查看执行结果弹窗 -->
        <a-modal :title="popup3.title" v-model="popup3.showOperactionPopup" :footer="null" :destroyOnClose="true" :maskClosable="false" :width="600">
            <a-form class="myform-update" layout="inline" :form="vform4">
                <div class="m7 mt10">
                    <a-form-item class="label-1" label="平台名称">
                        <a-input style="width: 400px;" v-decorator="['platformName']"/>
                    </a-form-item>
                </div>
                <div class="m7 mt10" >
                    <a-form-item class="label-1" label="完成时间">
                        <a-input style="width: 400px;" v-decorator="['finishTime']"/>
                    </a-form-item>
                </div>
                <div class="m7 mt10" >
                    <a-form-item class="label-1" label="执行时长">
                        <a-input style="width: 400px;" v-decorator="['costTime']"/>
                    </a-form-item>
                </div>
                <div class="m7 mt10">
                    <a-form-item class="label-1" label="执行结果">
                        <a-input style="width: 400px;" v-decorator="['status']" placeholder="请输入备注"/>
                    </a-form-item>
                </div>

                <div class="m7 mt10">
                    <a-form-item class="label-1" label="SQL内容">
                        <a-textarea style="width: 400px; height: 240px;" placeholder="在这里输入SQL内容" v-decorator="['sqlContent']" :rows="4"></a-textarea>
                    </a-form-item>
                </div>
                <div class="m7 mt10">
                    <a-form-item class="label-1" label="结果说明">
                        <a-textarea style="width: 400px; height: 240px;" placeholder="在这里输入SQL内容" v-decorator="['message']" :rows="4"></a-textarea>
                    </a-form-item>
                </div>
                <div class="modify-btn">
                    <a-button type="primary" @click="popup3.showOperactionPopup = false">关闭</a-button>
                </div>
            </a-form>
        </a-modal>
    </section>
</div>
</template>

<script>
    import Vue from 'vue'
    import { Component, InjectComponents, Lifecycle } from 'vue-decorators'
    import DateRange from "@/components/date-range/DateRange"

    const formOptions = {
        vform1: "id",
        vform2: "id",
        vform3: "id",
        vform4: "id"
    };
    @Component({formOptions})
    @InjectComponents({ DateRange})
    export default class sqlCentreManagement extends Vue {
        table = {
            key: 1,
            columns: [
                { title: "ID", dataIndex: "id" },
                { title: "数据库类型", dataIndex: "dbType", scopedSlots: { customRender: 'dbType' } },
                { title: "平台名称", dataIndex: "platformName" },
                { title: "标题", dataIndex: "title" },
                { title: "提交时间", dataIndex: "createTime" },
                { title: "提交人", dataIndex: "applyAdminName" },
                { title: "审核时间", dataIndex: "auditTime" },
                { title: "审核人", dataIndex: "auditAdminName" },
                { title: "执行时间", dataIndex: "executeTime" },
                { title: "执行人", dataIndex: "executeAdminName" },
                { title: "状态", dataIndex: "status" ,scopedSlots: { customRender: "status" }},
                { title: "操作",  dataIndex: "operate", scopedSlots: { customRender: "operate" }, width: 230 }
            ],
            dataSource: [],
            pagination: { total: 0, current: 1, pageSize: 10, totalPage: 0 },
            dbTypeList: ["config库", "全部lottery库", "指定lottery库"],
            statusList: ["草稿", "待审核", "审核通过", "审核不通过", "执行成功", "执行失败"],
        };
        table2 = {
            key: 1,
            columns: [
                { title: "ID", dataIndex: "id" },
                { title: "平台名称", dataIndex: "platformName" },
                { title: "执行时长", dataIndex: "costTime" },
                { title: "完成时间", dataIndex: "finishTime" },
                { title: "执行结果", dataIndex: "status", scopedSlots: { customRender: 'status' } },
                { title: '操作',  dataIndex: 'operate', scopedSlots: { customRender: 'operate' } }
            ],
            dataSource: [
                {
                    id: '1',
                    platformName: 's',
                    costTime: '2019',
                    finishTime: '2019',
                    status: 0
                }
            ],
            pagination: { total: 0, current: 1, pageSize: 10 }
        };
        // loading 状态
        arrivedLoading = false;
        // 初始值
        init = {
            // 请求参数
            query: { pageNo: 1, pageSize: 10, createTimeStart: "", createTimeEnd: "", executeTimeStart: "", executeTimeEnd: "", auditTimeStart: "", auditTimeEnd: "", platformName: "" },
            // 是否显示平台名称输入框
            isMerchatShow: false,
            isMerchatShow0: false,
            // 操作弹窗
            showOperactionPopup: false,
            // 保存loading
            saveloading: false,
            // 提交申请loading
            submitloading: false,
            // 平台名称(远程搜索框数据)
            mearchdata: [],
            // sql管理页面
            sqlmanagement: true,
            // 搜索动态加载模态
            fetching: false,
            // 表格1搜索模态
            tableloading: false,
            // 表格2模态
            tableloading2: false,
            // 是否显示审核人
            isShowauditor: true,
            // 是否显示审核备注
            isShownote: true,
            // 审核状态显示
            auditStatus: false,
            // 查询按钮loading
            loading: false
        };
        // 弹窗1固定数据
        popup1 = {
            // 是否打开添加or编辑弹窗
            isOpenAddOrEditPoup: false,
            // 编辑&添加弹窗title
            title1: '提交SQL申请',
            platformId: null,
            id: null
        };
        // 弹窗2固定数据
        popup2 = {
            // 是否打开添加or编辑弹窗
            showOperactionPopup: false,
            // 编辑&添加弹窗title
            title2: null,
            platformId: null,
            id: null,
            type: 0
        };
        // 弹窗3固定数据
        popup3 = {
            // 是否打开添加or编辑弹窗
            showOperactionPopup: false,
            // 编辑&添加弹窗title
            title: '查看执行结果详情'
        };
        // 页码
        totalData = {
            currentPageTotal: 0,
            currentPageDepositTotal: 0,
            currentPageGiveTotal: 0
        };
        createTimeEnd="";

        // 弹窗数据
        form = [
            {
                title1: "提交SQL申请",
                isOpenAddOrEditPoup: true
            },
            {
                title1: "编辑SQL申请",
                isOpenAddOrEditPoup: true
            },
            {
                title2: "查看详情",
                showOperactionPopup: true,
                type: 1
            },
            {
                title2: "审核",
                showOperactionPopup: true,
                type: 2
            },
            {
                title2: "撤回",
                showOperactionPopup: true,
                type: 3
            },
            {
                title2: "执行",
                showOperactionPopup: true,
                type: 4
            },
            {
                title2: "查看详情",
                showOperactionPopup: true,
                type: 1
            },
            {
                title2: "查看详情",
                showOperactionPopup: true,
                type: 1
            }
        ];

        @Lifecycle mounted() {
            this.getList();
            this.handleSearch = this.$tools.debounce(this.handleSearch, 1000)
        }

        // 设置时间段
        setCurrent(startTime, endTime) {
            this.init.query.createTimeStart = startTime;
            this.init.query.createTimeEnd = endTime;
            this.init.query.auditTimeStart = startTime;
            this.init.query.auditTimeEnd = endTime;
            this.init.query.executeTimeStart = startTime;
            this.init.query.executeTimeEnd = endTime;
        }
        // 分页选择
        changePagination(pagination) {
            this.table.pagination.current = pagination.current;
            this.init.query.pageNo = pagination.current;
            this.getList();
        }
        // 重置分页
        resetPagination() {
            this.table.pagination.current = 1;
            this.init.query.pageNo = 1;
        }
        // 提交时间
        changeDate(startTime, endTime, datestring, type) {
            if (type === "start") {
                this.init.query.createTimeStart = datestring
            } else {
                this.init.query.createTimeEnd = datestring
            }
        }
        // 审核时间
        auditDate(startTime, endTime, datestring, type) {
            if (type === "start") {
                this.init.query.auditTimeStart = datestring
            } else {
                this.init.query.auditTimeEnd = datestring
            }
        }
        // 执行时间
        handleTime(startTime, endTime, datestring, type) {
            if (type === "start") {
                this.init.query.executeTimeStart = datestring
            } else {
                this.init.query.executeTimeEnd = datestring
            }
        }
        // 搜索数据表中数据库类型选择
        async ChangeDataBaseType() {
            const from = await this.vform1.getValues();
            if(from.dbType === "3") {
                this.init.isMerchatShow0 = true;
            } else {
                this.init.isMerchatShow0 = false;
                this.init.query.platformName = "";
            }
        }
        // 数据库类型选择
        async handleChangeDataBaseType() {
           const from = await this.vform2.getValues();
           if(from.dbType === "3") {
               this.init.isMerchatShow = true;
           } else {
               this.init.isMerchatShow = false;
           }
        }
        // 平台名称搜索
        async handleSearch(val) {
            this.init.fetching = true;
            const res = await this.$service.fetch("/config-admin-api/opSqlManager/queryPlatformListByName", { name: val });
            if (res.code !== 1) return res.message && this.$message.error(res.message);
            if (res.data instanceof Array) {
                this.init.mearchdata = res.data;
            }
            this.init.fetching = false;
        }
        // 表格商户选择
        handleChangeMerchat(value) {
            this.init.query.platformName = value;
        }
        // 弹窗1商户选择
        handleChangeMerchat1(value) {
            this.popup1.platformId = value;
        }
        // 弹窗2商户选择
        handleChangeMerchat2(value) {
            this.popup2.platformId = value;
        }

        // 按钮操作逻辑部分
        async changeOrderStatus(type, data) {
            // 删除按钮判断
            if (type === 8) {
                const result = await this.$confirm({title: `确认删除?`});
                if (result) {
                    const res = await this.$service.fetch("/config-admin-api/opSqlManager/deleteSqlApplyRecord", { id: data.id});
                    if (res.code !== 1) return res.message && this.$message.error(res.message);
                    this.getList();
                }
                return;
            };
            // 添加or编辑按钮判断
            if (type === 0) {
                this.vform2.setValues({
                    dbType: 1,
                    title: '',
                    remark: '',
                    isBackup: 1,
                    sqlContent: '',
                    platformId: ''
                },true);
                this.popup1.isOpenAddOrEditPoup = true;
                this.init.isMerchatShow = false;
                this.handleChangeMerchat1('');
                return;
            };
            // 审核人&审核备注状态判断
            if (type === 3 || type === 4 || type === 6) {
                this.init.isShowauditor = false;
                if (type === 4) {
                    this.init.isShownote = false;
                }
            } else {
                this.init.isShowauditor = true;
                this.init.isShownote = true;
            }
            // 审核状态判断
            if (type === 2) {
                this.init.auditStatus = true;
            } else {
                this.init.auditStatus = false;
            }
            const res = await this.$service.fetch("/config-admin-api/opSqlManager/getSqlApplyRecord", { id: data.id });
            if (res.code !== 1) return res.message && this.$message.error(res.message);
            if (type === 1) {
               if (res.data.dbType === 3) {
                   this.init.isMerchatShow = true;
                   this.$service.fetch("/config-admin-api/opSqlManager/queryPlatformListByName", { name: res.data.platformName }).then(res => {
                       if (res.code !== 1) return res.message && this.$message.error(res.message);
                       if (res.code === 1 && res?.data instanceof Array) {
                           this.init.mearchdata = res.data;
                           this.handleChangeMerchat1(res.data[0].platformId);
                       }
                   });
               } else {
                   this.init.isMerchatShow = false;
               }
               this.popup1.id = res.data.id;
               this.vform2.setValues({
                   dbType: res.data.dbType,
                   title: res.data.title,
                   isBackup: res.data.isBackup,
                   remark: res.data.remark,
                   sqlContent: res.data.sqlContent
               },true);
               this.popup1.isOpenAddOrEditPoup = true;
               return
            } else {
                this.popup2.showOperactionPopup = this.form[type].showOperactionPopup;
                this.popup2.title2 = this.form[type].title2;
                this.popup2.type = this.form[type].type;
                this.popup2.id = res.data.id;
                if (res.data.dbType === 3) {
                    this.init.isMerchatShow = true;
                    this.$service.fetch("/config-admin-api/opSqlManager/queryPlatformListByName", { name: res.data.platformName }).then(res => {
                        if (res.code !== 1) return res.message && this.$message.error(res.message);
                        if (res.code === 1 && res?.data instanceof Array) {
                            this.init.mearchdata = res.data;
                            this.handleChangeMerchat2(res.data[0].platformId);
                        }
                    });
                } else {
                    this.init.isMerchatShow = false;
                }
                this.vform3.setValues({
                    applyAdminName: res.data.applyAdminName,
                    auditAdminName: res.data.auditAdminName,
                    auditRemark: res.data.auditRemark,
                    dbType: res.data.dbType,
                    executeAdminName: res.data.executeAdminName,
                    isBackup: res.data.isBackup,
                    remark: res.data.remark,
                    sqlContent: res.data.sqlContent,
                    status: this.table.statusList[res.data.status],
                    title: res.data.title
                },true)
            }
        }
        // 保存方法
        async saveSqlOpeation() {
            const form = await this.vform2.validate();
            if (form.errors) return;
            const params = Object.assign(this.$trimValues(form.values), { sqlContent: form.values.sqlContent});
            this.init.saveloading = true;
            const res = await this.$service.fetch('/config-admin-api/opSqlManager/addSqlApplyRecord', Object.assign(params, { platformId: this.popup1.platformId, id: this.popup1.id}));
            this.init.saveloading = false;
            if (res.code !== 1) return res.message && this.$message.error(res.message);
            this.popup1.isOpenAddOrEditPoup = false;
            this.popup1.id = null;
            this.getList();
        }
        // 提交审核方法
        async commitSqlApply() {
            const form = await this.vform2.validate();
            if (form.errors) return;
            const params = Object.assign(this.$trimValues(form.values), { sqlContent: form.values.sqlContent});
            this.init.submitloading = true;
            const res = await this.$service.fetch('/config-admin-api/opSqlManager/commitSqlApplyRecord',Object.assign(params, { platformId: this.popup1.platformId, id: this.popup1.id}));
            this.init.submitloading = false;
            if (res.code !== 1) return res.message && this.$message.error(res.message);
            this.popup1.isOpenAddOrEditPoup = false;
            this.popup1.id = null;
            this.getList();
        }
        // 审核通过or不通过
        async auditSqlApplyRecord(type) {
            const form = await this.vform3.validate();
            if (form.errors) return;
            const params = Object.assign(this.$trimValues(form.values), { sqlContent: form.values.sqlContent});
            if (type === 2) {
                this.init.saveloading = true;
            } else {
                this.init.submitloading = true;
            }
            const res = await this.$service.fetch("/config-admin-api/opSqlManager/auditSqlApplyRecord", {
                auditRemark: params.auditRemark,
                googleCode: params.googleCode,
                id: this.popup2.id,
                status: type
            });
            this.init.saveloading = false;
            this.init.submitloading = false;
            if (res.code !== 1) return res.message && this.$message.error(res.message);
            this.popup2.showOperactionPopup = false;
            this.getList()
        }
        // 撤回操作方法
        async cancelSqlApplyRecord() {
            this.init.saveloading = true;
            const res = await this.$service.fetch("/config-admin-api/opSqlManager/cancelSqlApplyRecord", {
                id: this.popup2.id,
            });
            this.init.saveloading = false;
            if (res.code !== 1) return res.message && this.$message.error(res.message);
            this.popup2.showOperactionPopup = false;
            this.getList();
        }
        // 执行操作方法
        async executeSqlApplyRecord() {
            const form = await this.vform3.validate();
            if (form.errors) return;
            const params = Object.assign(this.$trimValues(form.values), { sqlContent: form.values.sqlContent});
            if (params.isBackup === '1') {
                if (await this.$confirm({title: "确认操作", content: "该sql执行前必须备份，请确认已经备份了相关库后再执行该操作！！！"})) {
                    this.init.saveloading = true;
                    const res = await this.$service.fetch("/config-admin-api/opSqlManager/executeSqlApplyRecord", {
                        id: this.popup2.id,
                        googleCode: params.googleCode
                    });
                    this.init.saveloading = false;
                    if (res.code !== 1) return res.message && this.$message.error(res.message);
                    this.popup2.showOperactionPopup = false;
                    this.getList()
                }
            } else {
                this.init.saveloading = true;
                const res = await this.$service.fetch("/config-admin-api/opSqlManager/executeSqlApplyRecord", {
                    id: this.popup2.id,
                    googleCode: params.googleCode
                });
                this.init.saveloading = false;
                if (res.code !== 1) return res.message && this.$message.error(res.message);
                this.popup2.showOperactionPopup = false;
                this.getList()
            }
        }
        // 查询sql管理页面数据
        async getList(refresh) {
            if (refresh) this.resetPagination();
            const form = await this.vform1.validate();
            if (form.errors) return;
            const params = Object.assign(this.$trimValues(form.values), { sqlContent: form.values.sqlContent});
            this.init.loading = true;
            this.init.tableloading = true;
            const res = await this.$service.fetch('/config-admin-api/opSqlManager/queryPageSqlApplyRecord', Object.assign(this.init.query, params));
            this.init.loading = false;
            this.init.tableloading = false;
            if (res.code !== 1) return res.message && this.$message.error(res.message);
            if (res.data?.records instanceof Array) {
                this.table.dataSource = res.data?.records;
                this.table.pagination.total = res.data.totalCount;
                this.table.pagination.totalPage = res.data.totalPage;
                this.table.pagination.pageSize = res.data.pageSize;
            }
        }
        // 执行结果
        async querySqlExecuteRecordList(id) {
            this.init.tableloading2 = true;
            this.init.sqlmanagement = false;
            const res = await this.$service.fetch("/config-admin-api/opSqlManager/querySqlExecuteRecordList", { id: id || 0 });
            this.init.tableloading2 = false;
            if (res.code !== 1) return res.message && this.$message.error(res.message);
            if (res.code === 1 && res.data instanceof Array) {
                this.table2.dataSource = res.data;
            }
            this.popup2.showOperactionPopup = false;
        }
        // 查看执行结果
        async getSqlExecuteRecord(val) {
            this.popup3.showOperactionPopup = true;
            this.arrivedLoading = true;
            const res = await this.$service.fetch("/config-admin-api/opSqlManager/getSqlExecuteRecord", { id: val.id });
            this.arrivedLoading = false;
            if (res.code !== 1) return res.message && this.$message.error(res.message);
            if (res.code === 1 && res?.data instanceof Object) {
                this.vform4.setValues({
                    platformName: res.data.platformName,
                    finishTime: res.data.finishTime,
                    costTime: res.data.costTime,
                    status: res.data.status === 0 ? '等待执行': res.data.status === 1 ? '执行成功': res.data.status === 2 ? '执行失败':'执行失败后已对数据做修复处理',
                    sqlContent: res.data.sqlContent,
                    message: res.data.message
                }, true)
            }
        }
    }
</script>

<style lang="scss" scoped>
    .myform /deep/ {
        .ant-form-item {
            margin-bottom: 2px;
        }
    }
    .sqlmanagement-container {
        height: 100%; padding: 15px 10px; box-sizing: border-box;
        overflow-y: auto; border-radius: 4px; background-color: #fff;
        display: flex; flex-direction: column; justify-content: flex-start;
    }
    .qr-range /deep/{
        .ant-form-item {
            margin-right: 0;
        }
    }
    .sSelect {
        width: 160px;
    }
    .amount {
        width: 90px;
    }
    .report-order-text {
        border-bottom: 1px solid #f2f2f2;
        margin-bottom: 15px;
        padding-bottom: 15px;
        font-weight: bold;
    }
    .cursor-pointer {
        cursor: pointer;
    }

    .modify-btn {
        margin: 20px auto 0px;
        display: flex;
        justify-content: center;
    }

    .w120 {
        width: 120px;
    }
    .w40 {
        width: 60px;
    }

    .label-1 /deep/{
        .ant-form-item-label {
            width: 120px;
            text-align: end;
        }
    }

    .operationbtn {
        display: flex;
        justify-content: space-around;
    }

    .dropdown-link {
        position: relative;
        .dropdown-input {
            width: 160px;
        }
        .dropdown-btn {
            position: absolute;
            right: 4px;
            top: 8px;
            color: #009688;
            border: 1px solid #009688;
        }
    }

    .sSelect1 {
        width: 170px;
    }

    .select-all {
        color: #ff9900;
        border: 1px solid #ff9900;
    }
    .select-sty1 {
        color: #009688;
        border: 1px solid #009688;
    }

    .btn-blue {
        color: #478fca;
        border: 1px solid #478fca;
    }

    .dropdown-inner {
        height: 200px;
        overflow-y: auto;
    }

    .member-data-text {
        display: flex;
        justify-content: space-between;
        button {
            color: #009688;
            border: 1px solid #009688;
        }
    }

    .btn-middle0 {
        padding: 4px 10px;
        height: auto;
    }

    /deep/ .drop-down-list {
        .ant-dropdown-menu-item {
            padding: 0;
            &:hover {
                background-color: transparent;
            }
        }
    }

    .total-data {
        display: flex;
        justify-content: flex-start;
        margin-bottom: 20px;
    }

</style>