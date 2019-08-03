<template>
  <!--报表 注单管理 -->
  <div class="page-container">
    <section class="report-order">
      <div class="mt15">
        <a-form layout="inline">
          <a-form-item label="聊天室弹窗公告:">
            <a-switch
              v-model="params.isPopupNoticeEnabled"
              checkedChildren="开启"
              unCheckedChildren="关闭"
              defaultChecked
            />
          </a-form-item>
          <br>
          <div class="mt15">
            <textarea
              name
              v-model="params.popupNoticeContent"
              placeholder="这是一个弹窗公告,最多100个字"
              id
              cols="100"
              rows="6"
            ></textarea>
          </div>
          <br>
          <a-form-item label="聊天室滚动公告:">
            <a-switch
              v-model="params.isRollNoticeEnabled"
              checkedChildren="开启"
              unCheckedChildren="关闭"
              defaultChecked
            />
          </a-form-item>
          <br>
          <div class="mt15">
            <textarea
              name
              v-model="params.rollNoticeContent"
              placeholder="这是一个弹窗公告,最多100个字"
              id
              cols="100"
              rows="6"
            ></textarea>
          </div>
          <br>
          <br>
          <a-form-item>
            <a-button v-permission="20292" @click="chatConfigAddOrUpdate" type="primary" style="width:100px;">保存</a-button>
          </a-form-item>
        </a-form>
      </div>
    </section>
  </div>
</template>

<script>
import Vue from "vue";
import { Modal, Notification as Notice } from "ant-design-vue";
import { Component, InjectComponents, Lifecycle } from "vue-decorators";
import * as Api from "@api/chatroom";

@Component
export default class ChatNotice extends Vue {
  params = {
    isPopupNoticeEnabled: true,
    isRollNoticeEnabled: true,
    id: 1,
    popupNoticeContent: "",
    rollNoticeContent: ""
	};
	
  @Lifecycle created() {
    this.selectByPlatformId();
  }
  async selectByPlatformId() {
    const { data: response } = await Api.selectByPlatformId();
    if (
      response?.body?.code === 1 &&
      response.body?.data instanceof Array
    ) {
      this.params.id = response.body.data[0]?.id;
      this.params.popupNoticeContent =
        response.body.data[0].popupNoticeContent;
      this.params.rollNoticeContent = response.body.data[0].rollNoticeContent;
    }
  }
  //更新公告配置
  async chatConfigAddOrUpdate() {
    let p = { ...this.params };
    for (let key in p) {
      if (typeof p[key] == "boolean") {
        p[key] *= 1;
      }
		}
		if (this.params.popupNoticeContent.length > 100 || this.params.rollNoticeContent.length > 100) {
			return this.$message.error("最多可输入100个字符");
		}
    const { data: response } = await Api.chatConfigAddOrUpdate(p);
    if (response?.body?.code === 1) {
      Notice.success({
        message: response.body.message
      });
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