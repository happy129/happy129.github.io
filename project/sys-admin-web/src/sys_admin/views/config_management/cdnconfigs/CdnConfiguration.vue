<template>
  <section class="buss-container">

    <a-form layout="inline" :form="formElement" @submit.prevent="getList(true)">
      <a-form-item label="商户ID">
        <a-input v-decorator="['platformId',{rules: [{ required: false, message:'请输入商户ID', pattern: /^\d+$/ }] } ]" placeholder="请输入商户ID" />
      </a-form-item>
      <a-form-item label="商户名称">
        <a-input v-decorator="['platformName',{rules: [{ required: false, message:'请输入商户平台名称' }] } ]" placeholder="请输入商户平台名称" />
      </a-form-item>
      <a-form-item label="CDN名称">
        <a-input v-decorator="['cdnName',{rules: [{ required: false, message:'请输入CDN名称' }] } ]" placeholder="请输入CDN名称" />
      </a-form-item>
      <a-form-item label="CDN域名">
        <a-input v-decorator="['domainName',{rules: [{ required: false, message:'请输入CDN名称' }] } ]" placeholder="请输入CDN域名" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" :loading="loading">查询</a-button>
      </a-form-item>
    </a-form>

    <div class="page-under-table">
      <a-table class="mytable" bordered :columns="table.columns" :dataSource="table.dataSource" :rowKey="(e,i) => i" :pagination="table.pagination" @change="changePagination" >
        <template slot="vipLevelCdnConfigs" slot-scope="text, record">
          <div v-for="(data, index) in record.vipLevelCdnConfigs" :key="index" class="linktype">
            <ul>
              <li v-for="(item, index) in data.httpCdnDomains" :key="index" >{{data.vipLevelName}}:{{ getLinkType(item.linkType) }}-{{item.domainName}}，</li>
            </ul>
            <ul>
              <li v-for="(item, index) in data.mqttCdnDomains" :key="index" >{{data.vipLevelName}}:{{ getLinkType(item.linkType) }}-{{item.domainName}}，</li>
            </ul>
          </div>
        </template>
        <template slot="operation" slot-scope="text, record">
          <a-button @click="openConfigure(record)">配置</a-button>
        </template>
      </a-table>
    </div>

    <!--配置弹窗-->
    <a-modal :maskClosable="false" title="配置CDN域名" @ok="submit()" :destroyOnClose="true" v-model="modal.showModal" :confirmLoading="modal.confirmLoading" :width="600" >
      <a-form :form="form">

        <a-form-item label="商户名称" :label-col="{ span: 4}" :wrapper-col="{ span: 20 }" class="formitem">
          <a-input style=" width: 230px;" placeholder type="text" v-decorator="['platformName',{rules: [{ required: true, message:'请输入商户名称' }]} ]" />
        </a-form-item>

        <a-form-item label="商户ID" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" class="formitem">
          <a-input style=" width: 230px;" placeholder type="text" v-decorator="['platformId',{rules: [{ required: true,whitespace:true, message: '请输入商户标识' }]} ]" />
        </a-form-item>

        <div class="mt5 vipLevel">
          <a-form-item v-for="(item, index) in vipLevelList"  :label="item.vipLevelName.toUpperCase()"  :key="index" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" class="formitem">
            <div class="linkaddress">
              <a-form-item label="HTTP" :label-col="{ span: 3 }" :wrapper-col="{ span: 20 }" class="mt5" style="margin-bottom: 10px;">
                <a-select mode="multiple" style="width: 380px;" v-decorator="[`${item.vipLevelName}-httpCdnDomainIds`]">
                  <a-select-option v-for="(elem, i) in item.httpCdnDomains" :key="`${i}_1`"  :value="elem.id">
                    {{ elem.cdnName }}
                  </a-select-option>
                </a-select>
              </a-form-item>

              <a-form-item label="MQTT" :label-col="{ span: 3 }" :wrapper-col="{ span: 20 }" style="margin-bottom: 0px;">
                <a-select mode="multiple" style="width: 380px;" v-decorator="[`${item.vipLevelName}-mqttCdnDomainIds`]">
                  <a-select-option v-for="(elem, i) in item.mqttCdnDomains"  :key="`${i}_2`"  :value="elem.id">
                    {{ elem.cdnName }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </div>
          </a-form-item>
        </div>
      </a-form>
    </a-modal>


  </section>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle } from "vue-decorators";

const formOptions = { formElement: "id", form: "id" };
@Component({ formOptions })
export default class CdnConfiguration extends Vue {
  loading = false;
  table = {
    columns: [
      { title: "商户名称", dataIndex: "platformName"},
      { title: "商户ID", dataIndex: "platformId" },
      { title: "CDN配置", dataIndex: "vipLevelCdnConfigs", scopedSlots: { customRender: "vipLevelCdnConfigs" }, width: "50%" },
      { title: "操作", dataIndex: "operation", scopedSlots: { customRender: "operation" } }
    ],
    dataSource: [],
    pagination: { total: 0, current: 1 }
  };
  /** 查询分页 */
  query = { pageNo: 1, pageSize: 10 };
  /** 模态框数据 */ 
  modal = { showModal: false, confirmLoading: false, vipList: [] };
  /** 全部httpCdnDomains */
  httpCdnDomains = [];
  /** 全部mqttCdnDomains */
  mqttCdnDomains = [];
  /** 全部VipLevel */
  vipLevelList = []
  /**
   * vipList = [
   *    {
   *      httpCdnDomainIds: [],
   *      mqttCdnDomainIds: [],
   *      vipLevel: ''
   *    }
   * ]
   * 
   */

  // 1拿数组
  @Lifecycle mounted() {
    this.getList();
    this.getAllData();
    this.queryAllVipLevelConfig();
  }

  async openConfigure(record) {
    this.modal.showModal = true;

    const vipConfigList = this.table.dataSource.find(item => item.platformId == record.platformId)?.vipLevelCdnConfigs;
    //let responseData = [];

    // vipConfigList.filter(item => {
    //   this.vipLevelList.forEach(key => {
    //     if (item.vipLevel === key.vipLevel) {
    //       return item;
    //     }
    //   })
    // })

    const res = await this.$service.fetch("/config-admin-api/vipLevelConfig/queryAllVipLevelConfig");
    this.vipLevelList = res.data.map(item => {
      return {
        httpCdnDomains: [...this.httpCdnDomains],
        mqttCdnDomains: [...this.mqttCdnDomains],
        vipLevelName: item.vipLevelName
      }
    });
    // this.vipLevelList = data;
    //
    // let isFalse = false;
    // vipConfigList.forEach(iem => {
    //   if (iem.httpCdnDomains === null && iem.mqttCdnDomains === null) {
    //     isFalse = true;
    //   }
    // })
    //
    // if (!isFalse) {
    //   this.modal.vipList = vipConfigList.map(item => {
    //     item.httpCdnDomains = item.httpCdnDomains || [];
    //     item.mqttCdnDomains = item.mqttCdnDomains  || [];
    //     item.vipLevel = item.vipLevel  || [];
    //     item.vipLevelName = item.vipLevelName  || [];
    //    return item;
    //   });
    // } else {
    //   this.modal.vipList = this.vipLevelList.map(key => {
    //     key.httpCdnDomains = this.httpCdnDomains || [];
    //     key.mqttCdnDomains = this.mqttCdnDomains || [];
    //     key.vipLevel = key.vipLevel || [];
    //     key.vipLevelName = key.vipLevelName || [];
    //     return key;
    //   });
    // }

    this.form.setValues(record, true);

    vipConfigList.forEach(item => {
      this.form.setValue(`${item.vipLevelName.toUpperCase()}-httpCdnDomainIds`, item?.httpCdnDomains?.map(v => +v.id) || []);
      this.form.setValue(`${item.vipLevelName.toUpperCase()}-mqttCdnDomainIds`, item?.mqttCdnDomains?.map(v => +v.id) || []);
    });
  }

  // 获取所有vipLevel
  async queryAllVipLevelConfig() {
    const res = await this.$service.fetch("/config-admin-api/vipLevelConfig/queryAllVipLevelConfig");
    let data = res.data.map(item => {
      return {
        vipLevel: item.vipLevel,
        vipLevelName: item.vipLevelName
      }
    });
    this.vipLevelList = data;
  }

  changePagination(pagination) {
    this.table.pagination.current = pagination.current;
    this.query.pageNo = pagination.current;
    this.getList();
  }

  resetPagination() {
    this.table.pagination.current = 1;
    this.query.pageNo = 1;
  }

  getLinkType(type) {
    return +type === 0 ? "HTTP" : "MQTT";
  }

  async submit() {
    const form = await this.form.validate();
    if (form.errors) return 
    
    const vipItem = {};

    for (let [key, value] of Object.entries(form.values)) {
      if (key.indexOf('vip') !== -1 || key.indexOf('VIP') !== -1) {
        const vipLevel = key.split('-')[0];
        const vipType = key.split('-')[1];
        if (!vipItem[vipLevel]) {
          vipItem[vipLevel] = {};
          vipItem[vipLevel][vipType] = value ? `${value.length !== 0 ? ',':''}${value.join(',')},` : ',';
        } else { 
          vipItem[vipLevel][vipType] = value ? `${value.length !== 0 ? ',':''}${value.join(',')},` : ',';
          vipItem[vipLevel].vipLevel = vipLevel.replace(/[^\d]/g, '');
        }
      }
    }

    this.modal.confirmLoading = true;

    const res = await this.$service.fetch('/config-admin-api/platformCdnConfig/editPlatformCdnConfig', { 
      platformId: form.values?.platformId, 
      platformName: form.values?.platformName,
      list: Object.values(vipItem) 
    });
    this.modal.confirmLoading = false;

    if (res.code !== 1) return this.$message.error(res.message);
    this.$message.success(res.message);
    this.modal.showModal = false;
    this.getList();
  }

  /* 获取选项数据 */
  async queryAllCdnInfo(type) {
    const res = await this.$service.fetch("/config-admin-api/cdnDomain/queryAllCdnInfo", { linkType: type});
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    return res;
  }

  async getAllData() {
    const [http, cdn] = await Promise.all([this.queryAllCdnInfo(0), this.queryAllCdnInfo(1)]);
    if (http.data instanceof  Array) {
      this.httpCdnDomains = http.data;
    }
    if (cdn.data instanceof  Array) {
      this.mqttCdnDomains = cdn.data;
    }
  }

  async getList(refresh) {
    if (refresh) this.resetPagination();

    const form = await this.formElement.validate();
    if (form.errors) return 
    this.loading = true;
    const res = await this.$service.fetch('/config-admin-api/platformCdnConfig/queryPagePlatformCdnConfig', Object.assign(this.query, form.values));
    this.loading = false;
    if (res.code !== 1) return this.$message.error(res.$message);
    
    if (res.data?.records instanceof Array) {
      this.table.dataSource = res.data.records;
      this.table.pagination.total = res.data?.totalCount;
    } else {
      this.table.dataSource = [];
      this.table.pagination.total = 0;
    }
  }

}
</script>

<style lang="scss">
.buss-container {
  min-height: 100%;
  padding: 15px 10px;
  box-sizing: border-box;
  overflow-y: auto;
  border-radius: 4px;
  background-color: #fff;
}
.selectbar {
  width: 600px;
  height: 80px;
  margin-left: 100px;
  margin-top: -35px;
}
.linktype {
  display: flex;
  flex-direction: row;
}

.formitem {
    margin-bottom: 10px;
}
.linkaddress {
  border: 1px solid #d7d7d7;
  height: 130px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  align-content: center;
}
.vipLevel {
  height: 400px;
  overflow-y: scroll;
}
</style>

