  <template>
  <!--报表 注单管理 -->
  <div class="page-container settIndex" v-if="loading">
    <section class="settingIndex">
      <a-form layout="inline" :form="vform" @submit.prevent="chatConfigEdit">
        <h3>基础设置</h3>
        <a-divider/>
        <div style="margin-left:20px">
          <a-form-item>
            <i>聊天室</i>
            <a-switch
              @change="changeIsShow"
              checkedChildren="显示"
              unCheckedChildren="隐藏"
              :defaultChecked="config.isShow === 1"
            />
          </a-form-item>

          <a-form-item label="在线人数增加">
            <a-input v-model="config.onlineRaiseNumber"/>
          </a-form-item>
          <a-form-item>
            <p style="color:#FF0000;">*聊天室在线人数=真实在线人数+增加的人数</p>
          </a-form-item>

          <br>
          <a-form-item>
            <i>聊天室图标</i>
          </a-form-item>
          <a-form-item style="width:60px;">
            <div><a-icon type="wechat" style="fontSize:30px;color:#FF0000;text-align:left;"/></div>
            <p style="color:#FF0000;margin-left: -10px;margin-top: -20px;">130*130</p>
          </a-form-item>
          <a-form-item>
            <a-input v-decorator="['chatLogoUrl', {rules: [{ required: true, message: '请上传头像' }]}]" placeholder="恢复默认" readonly/>
          </a-form-item>
          <a-form-item>
            <a-upload name="imageFile" :showUploadList="false" :beforeUpload="beforeUpload" @change="toUpload">
              <a-button type="primary" style="border-radius:3px;">上传图标</a-button>
            </a-upload>
          </a-form-item>

          <br>
          <a-form-item class="mr200">
            <i>禁言策略</i>
            <a-radio-group name="jyclGroup" v-model="config.forbidSpeakStrategy" :defaultValue="1">
              <a-radio :value="0">不限制</a-radio>
              <a-radio :value="1">VIP等级</a-radio>
              <a-radio :value="2">全员关闭</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item>
            <i>发送图片策略</i>
            <a-radio-group v-model="config.sendImageStrategy" name="tpclGroup" :defaultValue="1">
              <a-radio :value="0">不限制</a-radio>
              <a-radio :value="1">VIP等级</a-radio>
              <a-radio :value="2">全员关闭</a-radio>
            </a-radio-group>
          </a-form-item>

          <br>

          <div style="height:50px;line-height:50px;position:relative;">
            <div style="display:inline-block;position:absolute;left:43px;">
              <a-form-item class="hideBox" v-if="config.forbidSpeakStrategy==1" label="禁言VIP等级" style="margin-left:-74px;" :colon="false">
                <a-select
                  v-model="config.forbidSpeakVipLevel"
                  style="width: 100px"
                  defaultValue="1"
                >
                  <a-select-option value="1">VIP1</a-select-option>
                  <a-select-option value="2">VIP2</a-select-option>
                  <a-select-option value="3">VIP3</a-select-option>
                  <a-select-option value="4">VIP4</a-select-option>
                  <a-select-option value="5">VIP5</a-select-option>
                </a-select>
                <span style="color:#FF0000;">*选择VIP等级{{config.forbidSpeakVipLevel}}及以上等级才能聊天</span>
              </a-form-item>

              <a-form-item v-if="config.forbidSpeakStrategy==2" class="hideBox" label>
                <span style="color:#FF0000;">*聊天室将不可聊天</span>
              </a-form-item>
              <a-form-item v-if="config.forbidSpeakStrategy==0" class="hideBox" label>
                <span style="color:#FF0000;">*除去前端的试玩用户无权限之外，其他用户即有权（包括后台开设的账号）</span>
              </a-form-item>

            </div>

            <a-form-item class="hideBox" v-if="config.sendImageStrategy==1" label="发送图片VIP等级" style="position:absolute;left:576px;width:700px;" :colon="false">
              <a-select v-model="config.sendImageVipLevel" style="width: 100px" defaultValue="1">
                <a-select-option value="1">VIP1</a-select-option>
                <a-select-option value="2">VIP2</a-select-option>
                <a-select-option value="3">VIP3</a-select-option>
                <a-select-option value="4">VIP4</a-select-option>
                <a-select-option value="5">VIP5</a-select-option>
              </a-select>
              <span style="color:#FF0000;">*选择VIP等级{{config.sendImageVipLevel}}及以上等级才能发送图片</span>
            </a-form-item>

            <a-form-item v-if="config.sendImageStrategy==2" class="hideBox" style="position:absolute;left:601px;" >
              <span style="color:#FF0000;">*聊天室将不可发送图片</span>
            </a-form-item>

            <a-form-item v-if="config.sendImageStrategy==0" class="hideBox" style="position:absolute;left:601px;" >
              <span style="color:#FF0000;"> *除去前端的试玩用户无权限之外，其他用户即有权（包括后台开设的账号） </span>
            </a-form-item>
          </div>

          <br>
          <a-form-item>
            <i>聊天室进入策略</i>
            <a-radio-group name="tpclGroup" v-model="config.intoChatStrategy" :defaultValue="1">
              <a-radio :value="0">不限制</a-radio>
              <a-radio :value="1">VIP等级</a-radio>
              <a-radio :value="2">全员关闭</a-radio>
            </a-radio-group>
          </a-form-item>
          <br>
          <div style="height:50px;line-height:50px;">
            <a-form-item v-if="config.intoChatStrategy==0" class="hideBox" label>
              <span style="color:#FF0000;">*未登陆用户也可以进入</span>
            </a-form-item>

            <a-form-item
              class="hideBox"
              v-show="config.intoChatStrategy==1"
              label="进入聊天室VIP等级"
              style="width:auto;margin-left:-30px;"
              :colon="false"
            >
              <a-select v-model="config.intoChatVipLevel" style="width: 100px;margin-left:10px;" defaultValue="1">
                <a-select-option value="1">VIP1</a-select-option>
                <a-select-option value="2">VIP2</a-select-option>
                <a-select-option value="3">VIP3</a-select-option>
                <a-select-option value="4">VIP4</a-select-option>
                <a-select-option value="5">VIP5</a-select-option>
              </a-select>
              <span style="color:#FF0000;">*选择VIP等级{{config.intoChatVipLevel}}及以上等级才能进入聊天室</span>
            </a-form-item>

            <a-form-item v-show="config.intoChatStrategy==2" class="hideBox" label>
              <span style="color:#FF0000;">*全员不可进入聊天室</span>
            </a-form-item>
          </div>
        </div>
        <h3>红包设置</h3>
        <a-divider/>

        <div style="margin-left:20px">
          <a-form-item class="mr200">
            <i>发红包策略</i>
            <a-radio-group
              name="jyclGroup"
              v-model="config.sendRedEnvelopeStrategy"
              :defaultValue="1"
            >
              <a-radio :value="0">不限制</a-radio>
              <a-radio :value="1">VIP等级</a-radio>
              <a-radio :value="2">全员关闭</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item>
            <i>抢红包策略</i>
            <a-radio-group
              name="tpclGroup"
              v-model="config.snatchRedEnvelopeStrategy"
              :defaultValue="1"
            >
              <a-radio :value="0">不限制</a-radio>
              <a-radio :value="1">VIP等级</a-radio>
              <a-radio :value="2">全员关闭</a-radio>
            </a-radio-group>
          </a-form-item>
          <br>

          <div
            style="height:50px;line-height:50px;position:relative;"
            v-if="config.sendRedEnvelopeStrategy!==0||config.snatchRedEnvelopeStrategy!==0"
          >
            <div style="display:inline-block;position:absolute;left:43px;">
              <a-form-item
                class="hideBox"
                v-show="config.sendRedEnvelopeStrategy==1"
                label="发红包VIP等级"
              >
                <a-select
                  v-model="config.sendRedEnvelopeVipLevel"
                  style="width: 100px"
                  defaultValue="1"
                >
                  <a-select-option value="1">VIP1</a-select-option>
                  <a-select-option value="2">VIP2</a-select-option>
                  <a-select-option value="3">VIP3</a-select-option>
                  <a-select-option value="4">VIP4</a-select-option>
                  <a-select-option value="5">VIP5</a-select-option>
                </a-select>
                <span style="color:#FF0000;">*选择VIP等级{{config.sendRedEnvelopeVipLevel}}及以上等级才能发红包</span>
              </a-form-item>
              <a-form-item v-show="config.sendRedEnvelopeStrategy==2" class="hideBox" label>
                <span style="color:#FF0000;">*聊天室将不可发红包</span>
              </a-form-item>
            </div>
            <a-form-item
              style="position:absolute;left:601px;"
              class="hideBox"
              v-show="config.snatchRedEnvelopeStrategy==1"
              label="抢红包VIP等级"
            >
              <a-select
                v-model="config.snatchRedEnvelopeVipLevel"
                style="width: 100px"
                defaultValue="1"
              >
                <a-select-option value="1">VIP1</a-select-option>
                <a-select-option value="2">VIP2</a-select-option>
                <a-select-option value="3">VIP3</a-select-option>
                <a-select-option value="4">VIP4</a-select-option>
                <a-select-option value="5">VIP5</a-select-option>
              </a-select>
              <span style="color:#FF0000;">*选择VIP等级{{config.snatchRedEnvelopeVipLevel}}及以上等级才能抢红包</span>
            </a-form-item>
            <a-form-item
              v-show="config.snatchRedEnvelopeStrategy==2"
              class="hideBox"
              label="VIP等级"
              style="position:absolute;left:601px;"
            >
              <span style="color:#FF0000;">*聊天室将不可抢红包</span>
            </a-form-item>
          </div>
        </div>

        <h3>分享设置</h3>
        <a-divider/>
        <div style="margin-left:20px">
          <a-form-item>
            <i>分享</i>
            <a-switch
              :defaultChecked="config.isShareEnabled === 1"
              @change="changeSE"
              checkedChildren="开启"
              unCheckedChildren="关闭"
            />
          </a-form-item>
          <!-- <a-form-item label="注单可分享次数">
            <a-input-number v-model="config.orderShareTimes"/>
          </a-form-item> -->
          <a-form-item label="分享最小金额 ">
            <a-input-number v-model="config.orderShareMinAmount"/>
          </a-form-item>
          <a-form-item label="用户每日分享次数">
            <a-input-number v-model="config.userDayShareTimes"/>
          </a-form-item>
          <br>
          <a-form-item>
            <i>打赏</i>
            <a-switch
              @change="changeGE"
              :defaultChecked="config.isShareGiveEnabled==1"
              checkedChildren="开启"
              unCheckedChildren="关闭"
            />
          </a-form-item>
          <a-form-item label="用户每日打赏次数">
            <a-input-number v-model="config.userShareGiveDayTimes"/>
          </a-form-item>
          <a-form-item label="打赏最大金额">
            <a-input-number v-model="config.shareGiveMaxAmount"/>
          </a-form-item>
          <a-form-item class="quick" label="快捷打赏金额">
            <a-input-number v-model="config.quickShareGiveAmount[0]"/>
            <a-input-number v-model="config.quickShareGiveAmount[1]"/>
            <a-input-number v-model="config.quickShareGiveAmount[2]"/>
            <a-input-number v-model="config.quickShareGiveAmount[3]"/>
            <a-input-number v-model="config.quickShareGiveAmount[4]"/>
            <a-input-number v-model="config.quickShareGiveAmount[5]"/>
          </a-form-item>
          <br>
          <a-form-item>
            <i>跟投</i>
            <a-switch
              @change="changeBE"
              :defaultChecked="config.isFollowBetEnabled==1"
              checkedChildren="开启"
              unCheckedChildren="关闭"
            />
          </a-form-item>
        </div>
        <a-divider/>
        <a-button v-permission="20278" html-type="submit" type="primary">保存</a-button>
      </a-form>
      <div class="mt15"></div>
    </section>
  </div>
</template>

  <script>
import Vue from "vue";
import * as Api from "@api/chatroom";
import { Component, InjectComponents, Lifecycle } from "vue-decorators";
import { Modal, Notification as Notice } from "ant-design-vue";
import { close, closeSync } from "fs";
import { getToken } from "@/util/auth";

@Component({
  formOptions: "id"
})
export default class ServiceIndex extends Vue {
  loading = false;
  @Lifecycle async created() {
    await this.selectByPlatformId();
    this.loading = true;
  }
  config = {
    quickShareGiveAmount: "1,2,3,4,5,6",
    isShareGiveEnabled: 1,
    isShareEnabled: 1,
    isShow: 1,
  };

  fileList = [];
  
  uploadData = {
    token: getToken()
  };

  async chatConfigEdit() {
    let params = { ...this.config };
    const form = await this.vform.validate();
    delete params.rollNoticeContent;
    delete params.popupNoticeContent;
    delete params.isPopupNoticeEnabled;
    delete params.isRollNoticeEnabled;
    for (let key in params) {
      if (typeof params[key] == "boolean") {
        params[key] *= 1;
      }
    }
    params.quickShareGiveAmount = params.quickShareGiveAmount.join(",");
    const { data: response } = await Api.chatConfigEdit(Object.assign(params, form.values));
    if (response?.body?.code === 1) this.$message.success(response.body.message);
  }
  changeIsShow(checked) {
    this.config.isShow = checked;
  }
  changeSE(checked) {
    this.config.isShareEnabled = checked ? 1 : 0;
  }
  changeGE(checked) {
    this.config.isShareGiveEnabled = checked ? 1 : 0;
  }
  changeBE(checked) {
    this.config.isFollowBetEnabled = checked ? 1 : 0;
  }

  beforeUpload(file) {
    this.fileList = [...this.fileList, file];
    return false;
  }

  async toUpload() {
    const formdata = new FormData();
    formdata.append("imageFile", this.fileList[0]);
    formdata.append("token", this.token);
    formdata.append("uploadTypeName", "chatLogo");
    const res = await this.$service.fetch( "/common-api/upload/uploadAdminImage", formdata);
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.vform.setValue("chatLogoUrl", res.data?.imageUrl);
    Notice.success({
      message: res.message,
    });
  }

  async selectByPlatformId() {
    const { data: response } = await Api.selectByPlatformId();
    if (response?.body?.code === 1) {
      response.body.data[0].forbidSpeakVipLevel = response.body.data[0].forbidSpeakVipLevel.toString();
      response.body.data[0].sendImageVipLevel = response.body.data[0].sendImageVipLevel.toString();
      response.body.data[0].intoChatVipLevel = response.body.data[0].intoChatVipLevel.toString();
      response.body.data[0].sendRedEnvelopeVipLevel = response.body.data[0].sendRedEnvelopeVipLevel.toString();
      response.body.data[0].snatchRedEnvelopeVipLevel = response.body.data[0].snatchRedEnvelopeVipLevel.toString();
      this.config = response.body.data[0];
      this.vform.setValue("chatLogoUrl", response.body?.data[0].chatLogoUrl);
      this.config.quickShareGiveAmount = this.config.quickShareGiveAmount.split(
        ","
      );
    }
  }
}
</script>

  <style lang="scss" scoped>
.settIndex {
  overflow: auto !important;
}

.settingIndex /deep/ {
  i {
    display: inline-block;
    font-style: normal;
    margin-right: 20px;
    width: 100px;
    text-align: right;
  }

  .mr200 {
    margin-right: 200px;
  }

  .hideBox {
    width: 474px;
  }

  .ant-form-inline .ant-form-item {
    margin-bottom: 20px;
  }

  .ant-form-item-label {
    width: 140px;
  }
  .ant-input-number {
    width: 100px;
  }
  .quick .ant-input-number {
    width: 80px;
    margin-right: 20px;
  }
}
</style>