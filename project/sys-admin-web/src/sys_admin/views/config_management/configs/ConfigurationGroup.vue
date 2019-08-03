<template>
  <section class="share-wrapper share-setting-wrapper">
    <div class="promo-list-bd">
      <a-form layout="inline">
        <div class="mt15">
          <a-form-item label="配置组名">
            <a-input placeholder="配置组名" v-model.trim="configGroupQueryByPageForm.groupName" />
          </a-form-item>
          <a-form-item label="配置组编码">
            <a-input placeholder="配置组编码" v-model.trim="configGroupQueryByPageForm.groupCode" />
          </a-form-item>
          <a-form-item>
            <a-button-group>
              <a-button
                type="primary"
                @click="()=>{this.configGroupQueryByPageForm.groupName='';this.configGroupQueryByPageForm.groupCode=''}"
              >重置</a-button>
              <a-button type="primary" @click="_configGroupQueryByPage">查询</a-button>
            </a-button-group>
          </a-form-item>
        </div>
      </a-form>
    </div>
    <div class="page-under-table mt15">
      <a-form layout="inline">
        <a-form-item style="margin-bottom:20px;">
          <a-button
            type="primary"
            @click="showPormotionDialog({title:'添加配置组',sn:'add',data:null})"
            v-permission="10119"
          >添加配置组</a-button>
        </a-form-item>
        <a-form-item style="margin-bottom:20px;">
          <a-button type="primary" @click="showUpdateRedisModal=true">更新缓存</a-button>
        </a-form-item>
        <a-table
          class="mytable"
          :rowKey="(r,i)=>i"
          @change="changeTablePagenation"
          :pagination="paginationParams"
          :columns="table.columns"
          :dataSource="table.dataSource"
        >
        </a-table>
      </a-form>
    </div>
    <a-modal
      :maskClosable="false"
      :title="modal.title"
      @ok="enterDialog()"
      :destroyOnClose="true"
      v-model="modal.showModal"
      :centered="true"
      :confirmLoading="modal.confirmLoading"
      width="30%"
    >
      <a-form layout="inline" :form="form">
        <a-form-item v-show="false" v-for="(d, i) in form.hiddens" :key="i">
          <input type="hidden" v-decorator="[d]" />
        </a-form-item>
        <div class="mt10">
          <a-form-item label="配置组名称">
            <a-input
              style=" width: 230px;"
              placeholder
              type="text"
              v-decorator="['groupName',{rules: [{ required: true, message:'请输入配置组名称' }]} ]"
            />
          </a-form-item>
        </div>
        <div class="mt10">
          <a-form-item label="配置组编码">
            <a-input
              style=" width: 230px;"
              placeholder
              type="text"
              v-decorator="['groupCode',{rules: [{ required: true,whitespace:true, message: '该项为必填项!' }]} ]"
            />
          </a-form-item>
        </div>
      </a-form>
    </a-modal>
    <a-modal
      :title="modal2.title"
      @ok="_configItemRefreshRedisByGroupId()"
      :destroyOnClose="true"
      v-model="modal2.showModal"
      :centered="true"
      :confirmLoading="modal2.confirmLoading"
      width="30%"
    >
      <a-form layout="inline">
        <a-form-item label="商户名称">
          <a-select
            showSearch
            :allowClear="true"
            :filterOption="filterOption"
            placeholder="商户名称"
            style="width: 230px"
            v-model="configGroupQueryByPageForm.platformId"
          >
            <a-select-option
              v-for="(item,i) in configItemQueryByPageData"
              :key="i"
              :value="`${item.id}`"
            >{{item.platformName}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="配置组名">
          <a-select
            placeholder="配置组"
            style="width: 230px"
            :allowClear="true"
            v-model="configGroupQueryByPageForm.groupId"
          >
            <a-select-option
              v-for="(item,i) in configGroupQueryAllByListData"
              :key="i"
              :value="item.id"
            >{{item.groupName}}</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
		<a-modal v-model="showUpdateRedisModal" @ok="updateRedis"  :maskClosable="false" title="更新缓存">
			<a-form layout="inline" :form="form">
				<a-form-item label="请选择平台">
					<a-select v-decorator="['platformId']" style="width: 200px">
						<a-select-option value="">全部</a-select-option>
						<a-select-option v-for="(item, index) in dsstore.queryAllPlatform" :key="index" :value="item.id">{{item.platformName}}</a-select-option>
					</a-select>
				</a-form-item>
			</a-form>
		</a-modal>
  </section>
</template>

<script>
import Vue from "vue";
import {
  Component,
  Lifecycle,
  InjectComponents,
  Computed
} from "vue-decorators";
import moment from "moment";
import * as Api from "@api/configs";
import { Message } from "ant-design-vue";

const formOptions = { form: "id" };

const dsstore = {
	queryAllPlatform: '/config-admin-api/platform/queryAllPlatform'
}

const TitleComponent = Vue.component('title', {
  template: '<span class="g-red bold">{{name}}</span>',
  props: {
    name: String
  }
});

@Component({ methods: { moment }, formOptions, dsstore })
export default class ConfigurationGroup extends Vue {
  // 表格
  table = {
    dataSource: [],
    columns: [
      { title: "ID", dataIndex: "id" },
      { title: "配置组名称", dataIndex: "groupName" },
      { title: "配置组编码", dataIndex: "groupCode" },
      { title: "创建时间", dataIndex: "createTime" }
      //{title: '操作', dataIndex: 'operation', scopedSlots: {customRender: 'operation'}}
    ]
  };
  configItemQueryByPageData = [];
  configGroupQueryAllByListData = [];

  configGroupQueryByPageForm = {
    groupId: "",
    platformId: "",
    groupCode: "",
    groupName: "",
    pageNo: 1,
    pageSize: 10
  };
  paginationParams = { pageNo: 1, total: 0 };
  // 弹窗里面用到的数据
  modal = {
    title: "",
    showModal: false,
    confirmLoading: false,
    sn: "",
    data: null
  };
  modal2 = {
    title: "",
    showModal: false,
    confirmLoading: false,
    sn: "",
    data: null
  };

	showUpdateRedisModal = false;

  async updateRedis() {
    //	if (!await this.$confirm({title: "确认要更新吗?"})) return;
		const form = await this.form.validate();
    if (!form.values.platformId) {
      if (!await this.$confirm({title: <TitleComponent name="确认要刷新所有平台缓存数据?"/> })) return 
    } else {
      if (!await this.$confirm({title: "确认要刷新该平台缓存数据?"})) return 
    }

    const res = await this.$service.fetch(
      "/config-admin-api/configItem/refreshRedisData",
      { platformId: form.values.platformId || ''}
    );
    if (res.code !== 1) return res.message && this.$message.error(res.message);
		this.$message.success(res.message);
		this.showUpdateRedisModal = false;
  }

  /* 公共显示modal */
  async showPormotionDialog(obj) {
    this.modal.title = obj.title;
    this.modal.showModal = true;
    this.modal.sn = obj.sn;
    if (this.modal.sn === "edit") {
      let { data: req } = await Api.configGroupQueryByPage({ id: obj.data.id });
      if (req?.body?.code === 1) {
        this.form.setValues(req.body.data, true);
      }
    }
  }
  async enterDialog() {
    if (this.modal.sn == "add") {
      //如果是确认
      const form = await this.form.validate();
      if (form.errors) return;
      let { data: req } = await Api.configGroupAdd(form.values);
      if (req?.body?.code === 1) {
        Message.success(req.body.message);
        this.modal.showModal = false;
        this._configGroupQueryByPage();
      }
    }
  }

  checkPrice(rule, value, callback) {
    if (value.number > 0) {
      callback();
      return;
    }
    callback("Price must greater than zero!");
  }

  // 切换分页
  changeTablePagenation(pagination) {
    this.configGroupQueryByPageForm.pageNo = pagination.current;
    this.paginationParams.pageNo = pagination.current;
    this._configGroupQueryByPage();
  }

  /* 更新缓存接口方法 */
  async _configItemRefreshRedisByGroupId(obj) {
    let { data: req } = await Api.configItemRefreshRedisByGroupId({
      groupId: this.configGroupQueryByPageForm.groupId,
      platformId: this.configGroupQueryByPageForm.platformId
    });
    if (req?.body?.code == 1) {
      Message.success(req.body.message);
      this.modal2.showModal = false;
    }
  }

  async _configGroupQueryByPage() {
    let { data: req } = await Api.configGroupQueryByPage(
      this.configGroupQueryByPageForm
    );
    console.log(req);
    if (req?.body?.code === 1) {
      this.table.dataSource = req.body.data.records;
      this.paginationParams.total = req.body.data.totalCount;
    }
  }

  filterOption(input, option) {
    return (
      option.componentOptions.children[0].text
        .toLowerCase()
        .indexOf(input.toLowerCase()) >= 0
    );
  }

  /* 获取配置组列表信息渲染select */
  async _configGroupQueryAllByList() {
    let { data: req } = await Api.configGroupQueryAllByList({});
    console.log(req);
    if (req?.body?.code === 1) {
      this.configGroupQueryAllByListData = req.body.data;
    }
  }

  /* 获取商户平台信息 */
  async _platformQueryAllByList() {
    let { data: req } = await Api.platformQueryAllByList({});
    console.log(req);
    if (req?.body?.code === 1) {
      this.configItemQueryByPageData = req.body.data;
    }
  }

  @Lifecycle() created() {
    this._configGroupQueryByPage();
    this._configGroupQueryAllByList();
    this._platformQueryAllByList();
  }
}
</script>


<style lang="scss">
.mt10 {
  .ant-form-item-label {
    min-width: 100px;
  }
}
</style>