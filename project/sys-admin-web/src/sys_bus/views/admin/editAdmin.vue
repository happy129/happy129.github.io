<template>
  <a-modal v-model="show" :width="1200" :footer="null" title="编辑资料" :bodyStyle="{padding: '5px 10px'}" :destroyOnClose="true" :maskClosable="false" @cancel="()=> $emit('close')">
    <div class="dialog-box" @click.stop>
      <!-- <div class="title">
        <span>编辑资料</span>
        <span class="close-tag" style="font-size: 28px;" @click="close">&times;</span>
      </div> -->
      <a-tabs defaultActiveKey="1" @change="callback">
        <a-tab-pane tab="基本资料" key="1">
          <a-form layout="inline" :form="vform">
            <a-form-item label="账号">
              <a-input disabled :value="detail.userName"></a-input>
            </a-form-item>
            <br />
            <a-form-item label="昵称">
              <a-input
                v-decorator="[ 'nickName', {rules: [{ required: true, message: '4-12码英文或数字且符合0~9及a~z字元', pattern:/^[a-z0-9]{4,12}$/ }]} ]"
              />
            </a-form-item>
            <br />
            <a-form-item label="岗位备注">
              <a-input v-decorator="[ 'remark', {rules: [{ required: false }]} ]" />
            </a-form-item>
            <br />
            <a-form-item label="单笔人工加减款限额">
              <a-input-number
                v-decorator="[ 'correctAmountUpperLimit', { rules: [{ required: true, message: '请设置限额'}] } ]"
                :min="1"
                :max="999999999"
              />
            </a-form-item>

            <br />

            <a-form-item label="谷歌验证码开关" class="switch-box">
              <a-switch
                :defaultChecked="detail.isGoogleVerficationEnabled === 1 ? true:false || isGoogleVerficationEnabled == 1 "
                @change="onChangeGoogle"
              />
            </a-form-item>

            <div>
              <a-form-item label="谷歌密钥描述">
                <a-input
                  v-decorator="[ 'googleVerficationName', {rules: [{ required: true , message: '请输入验证名称'}]} ]"
                  @change="changeGoogleCodedescribe"
                />
              </a-form-item>

              <div class="qr-box">
                <a-button-group>
                  <a-button size="small" @click="getGoogleSecretKey">创建新密钥</a-button>
                  <a-button size="small" @click="showQrImg=!showQrImg" v-if="!showQrImg">显示QR码</a-button>
                  <a-button size="small" @click="showQrImg=!showQrImg" v-if="showQrImg">隐藏QR码</a-button>
                </a-button-group>
                <div class="qr-img" v-if="showQrImg">
                  <img :src="googleQrCodeBase64" alt="网络错误..." />
                </div>
                <div class="foot">用手机打开Authenticator,扫描二维码</div>
              </div>

              <a-form-item label="验证码">
                <a-input
                  v-decorator="[ 'googleCode', { rules: [{ required: userInfo.isGoogleVerficationEnabled===1, message: '请输入验证码' }] } ]"
                ></a-input>
              </a-form-item>
            </div>

            <br />
            <a-form-item>
              <div class="reset-button">
                <a-button type="primary" :loading="loading" @click="submitEdit">提交</a-button>
                <a-button type="primary" @click="resetEdit">重置</a-button>
              </div>
            </a-form-item>
            <br />
          </a-form>
        </a-tab-pane>

        <a-tab-pane tab="目录链接栏表" key="2" v-if="!admin">
          <Permission :detail="detail" />
        </a-tab-pane>

        <a-tab-pane tab="管理权限设定" key="3"  v-if="!admin">
          <PermissionButtons :detail="detail"/>
        </a-tab-pane>
      </a-tabs>
    </div>
  </a-modal>
</template>
<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, Computed, Prop, Watch, State } from "vue-decorators";
import { Tree } from "ant-design-vue";
import * as Api from "@api/admin";
import Permission from "./Permission";
import PermissionButtons from "./PermissionButtons";

const formOptions = "id";

@Component({ formOptions })
@InjectComponents({ Tree, Permission, PermissionButtons })
export default class EditAdminPanel extends Vue {
  @State(s => s.auth.userInfo) userInfo;
  // 判断是否是管理员
  @Prop({ type: Boolean }) admin;

  showTree = true;
  show = true;
  permissionsList = [];
  permissionsListMap = {};
  defaultCheckedKeys = [];

  googleCodedescribe = "";
  loading = false;
  @Prop() detail;

  bb = 123;
  nickName = "";
  isGoogleVerficationEnabled = 0;
  googleQrCode = "";
  showQrImg = false;
  googleVerficationSecret = "";
  value1 = "";

  close() {
    this.$emit("close");
  }
  callback() {}

  // 管理权限设定集合
  manageList = [];

  // 管理权限设定 选择的id集合
  checkedList = [];

  // 管理权限设定 列表头 选择事件
  async onCheckAllChange(e, v) {
    e.target.checked
      ? v.forEach(d => {
          !this.checkedList.includes(d.id) ? this.checkedList.push(d.id) : [];
        })
      : v.forEach(d => {
          this.checkedList.includes(d.id) ? _.pull(this.checkedList, d.id) : [];
        });
    await this.$nextTick();
    this.showTree = await false;
    this.showTree = await true;
    this.$forceUpdate();
  }

  // 复选框
  checkedAll(v) {
    let b = true;
    v.forEach(d => {
      !this.checkedList.includes(d.id) ? (b = false) : [];
    });
    return b;
  }

  googleQrCodeBase64 = this.detail?.googleQrCode || "";

  async getGoogleSecretKey() {
    let p = {
      adminName: this.detail.userName
    };
    let res = await Api.getGoogleSecretKey(p);
    if (res?.data?.body?.code === 1) {
      let data = res?.data?.body?.data;
      this.googleVerficationSecret = data.googleSecret;
      this.googleQrCode = data.googleQrCode;
      this.googleQrCodeBase64 = data.googleQrCodeBase64;
    }
  }

  onChangeGoogle(v) {
    this.isGoogleVerficationEnabled = v ? 1 : 0;
  }

  loading = false;
  // 编辑基本资料提交
  submitEdit() {
    let p = {
      googleVerficationSecret:
        this.googleVerficationSecret === ""
          ? this.detail.googleVerficationSecret
          : this.googleVerficationSecret,
      id: this.detail.id,
      isGoogleVerficationEnabled: this.isGoogleVerficationEnabled
    };

    this.vform.validateFields(async (err, values) => {
      delete values.isGoogleVerficationEnabled;
      if (err) return;
      this.loading = true;
      let res = await Api.editAdmin({ ...p, ...values });
      this.loading = false;

      if (res.data?.body?.code === 1) {
        this.$message.success(res.data?.body?.message);
        // 刷新页面
        this.$emit("ok");
      }
    });
  }

  selectedKeys = [];

  async toFetchArrays() {
    // systemType 总是0，商是1
    const systemType = 1;
    let res = await this.$service.fetch(
      "/config-admin-api/config/permission/queryAllAvailablePermission",
      { systemType }
    );
    if (1 != res.code) return res.message && this.$message.error(res.message);

    if (res.data.length === 0) return;

    let menuData = res.data;

    menuData.forEach(d => {
      d.scopedSlots = { title: "title" };
      d.checkable = false;
      d.key = d.id;
      d.title = d.permissionName;
    });

    this.permissionsListMap = menuData.reduce((m, d) => ((m[d.id] = d), m), {});

    // permissionType !== 2 排除按钮
    menuData = menuData.filter(d => d.permissionType !== 2);

    // 一维数据转树结构数据
    menuData = this.$tools.arrayToTreeArray(menuData, {
      childKey: "id",
      parentKey: "parentId",
      childrenKey: "children"
    });

    menuData.forEach(d => {
      d.checkable = true;
    });

    // 根据 /config-admin-api/adminPermission/queryAllPermission 选择已有的权限
    const id = this.detail.id;
    const permissionType = "";

    let res2 = await this.$service.fetch(
      "/config-admin-api/adminPermission/queryAllPermission",
      {
        id,
        permissionType
      }
    );

    if (1 != res2.code)
      return res2.message && this.$message.error(res2.message);

    for (var i in this.permissionsListMap) {
      this.permissionsListMap[i].checkable = false;
    }

    res2.data.forEach(d => {
      if (this.permissionsListMap[d.id]) {
        this.permissionsListMap[d.id].checkable = true;
      }
    });

    // 目录链接栏表 初始值
    this.defaultCheckedKeys = res2.data.reduce((ca, cu) => {
      if (cu.permissionType !== 2 && cu.id !== undefined) ca.push(cu.id);
      return ca;
    }, []);

    // 管理权限设定 初始值
    this.checkedList = res2.data.reduce((ca, cu) => {
      if (cu.permissionType === 2 && cu.id !== undefined) ca.push(cu.id);
      return ca;
    }, []);

    // 目录链接栏表数据
    this.permissionsList = menuData;

    // 管理权限设定
    // 所有按钮
    let allButton = res.data.reduce((ca, cu) => {
      if (cu.permissionType === 2) ca.push(cu);
      return ca;
    }, []);
    allButton.forEach(d => {
      d.label = d.permissionName;
      d.value = d.id;
      // "一级菜单002-二级菜单002-一级标签页04-按钮04"
      d.title = d.remark?.replace(`-${d.permissionName}`, "");
    });

    // 相同remark的集合
    let allKeys = _.keyBy(allButton, "title");

    let ps = [];

    // [{title:"", plainOptions: [btn]}]
    Object.keys(allKeys).forEach((v, i) => {
      let title = v;
      let plainOptions = [];
      allButton.forEach((vv, ii) => {
        if (vv.title === v) plainOptions.push(vv);
      });
      ps.push({
        title,
        plainOptions
      });
    });

    this.manageList = ps;
  }

  treeSubmitButton = true;
  checkButton = true;

  resetEdit() {
    this.vform.setValues({
      nickName: "",
      remark: "",
      correctAmountUpperLimit: "",
      googleVerficationName: "",
      googleCode: ""
    });
    this.googleCodedescribe = "";
    this.googleQrCodeBase64 = "";
  }

  async submitButtons() {
    let permissionList = await this.checkedList.reduce((ca, cu) => {
      ca.push({
        permissionId: cu,
        permissionType: 2
      });
      return ca;
    }, []);

    let p = {
      adminId: this.detail.id,
      permissionList
    };
    let res = await Api.editButtonPermission(p);
    if (res.data?.body?.code === 1) {
      this.$message.success(res.data?.body?.message);
      // 刷新页面
      this.$emit("ok");
    }
  }

  editMenuAndTagPermissionPram = {};

  async onCheck(checkedKeys, e) {
    this.treeSubmitButton = false;
    let permissionList = await e.checkedNodes.reduce((ca, cu) => {
      ca.push({
        permissionId: cu?.data?.props?.id,
        permissionType: cu?.data?.props?.permissionType
      });
      return ca;
    }, []);
    this.editMenuAndTagPermissionPram = {
      adminId: this.detail.id,
      permissionList
    };
  }

  async submit() {
    // /config/adminPermission/batchEditMenuAndTagPermission
    // 修改/保存用户权限 只菜单
    this.loading = true;
    let res = await Api.editMenuAndTagPermission(
      this.editMenuAndTagPermissionPram
    );
    this.loading = false;
    if (res.data?.body?.code === 1) {
      this.$message.success(res.data?.body?.message);
      // 刷新页面
      this.$emit("ok");
    }
    // 刷新页面
    this.$emit("ok");
  }

  async resetTree() {
    this.treeSubmitButton = false;
    // 清空列表
    let a = await this.permissionsList;
    this.permissionsList = await [];
    this.defaultCheckedKeys = await [];
    this.permissionsList = await a;
    // 提交的内容清空
    this.editMenuAndTagPermissionPram = {
      adminId: this.detail.id,
      permissionList: []
    };
  }

  changeGoogleCodedescribe(v) {
    this.googleCodedescribe = v.target.value;
  }

  @Lifecycle() async mounted() {
    await this.vform.setValues(this.detail, true);
    this.isGoogleVerficationEnabled = this.detail.isGoogleVerficationEnabled;
  }

  @Lifecycle() async created() {
    this.googleQrCodeBase64 = (await this.detail?.googleQrCode) || "";
    await this.toFetchArrays();
  }
}
</script>
<style lang="scss" scoped>
@import "./Pop.scss";
.dialog-box /deep/ {
  width: 1180px;
  min-height: 760px;
  .ant-input,
  .ant-input-number {
    width: 330px;
  }
  .ant-form-item-label {
    width: 160px;
  }
  .ant-row {
    margin-bottom: 8px;
  }
  .top-check {
    background-color: #009688;
    text-align: left;
    height: 30px;
    line-height: 30px;
    padding-left: 8px;
    .ant-checkbox-wrapper {
      span {
        color: white;
      }
    }
  }
  .ant-tabs-tabpane-active {
    padding: 0px 20px;
  }
  .ant-checkbox-group {
    display: flex;
    flex-wrap: wrap;
    padding-left: 8px;
    .ant-checkbox-group-item {
      width: 222px;
      text-align: left;
      margin: 10px 0px;
    }
  }
  .ant-tabs-nav-scroll {
    display: flex;
    justify-content: flex-start;
  }
  .switch-box {
    .ant-form-item-control-wrapper {
      margin-right: 288px;
    }
  }
  .qr-box {
    position: relative;
    width: 206px;
    height: 260px;
    margin: 10px auto 2px 161px;
    .ant-btn {
      margin: 0px;
      span {
        font-size: 12px;
        display: inline-block;
      }
    }
    button:nth-child(1) {
      width: 82px;
      border-radius: 5px 0px 0px 5px;
    }
    button:nth-child(2) {
      width: 104px;
      border-radius: 0px 5px 5px 0px;
    }
    .qr-img {
      width: 196px;
      margin: 10px auto;
      img {
        width: 100%;
      }
    }
    .foot {
      font-size: 12px;
      position: absolute;
      bottom: 0px;
      left: 5px;
    }
  }
}
.ant-tree /deep/ {
  display: flex;
  flex-wrap: wrap;
  overflow: auto;
  > li {
    margin: 10px 10px 20px 10px;
    height: 260px;
    overflow-y: scroll;
    text-align: left;
    > .ant-tree-node-content-wrapper {
      background-color: #ff9900;
      color: white;
    }
  }
}

.check-titles {
  color: white;
}

.reset-button {
  padding-left: 158px;

  button {
    margin-right: 10px;
  }
}
</style>
