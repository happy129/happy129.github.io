<template>
  <div class="promo-add">
    <a-form layout="inline">
      <a-form-item>
        <a-form-item label="活动类型">
          <a-select
            :dropdownMatchSelectWidth="false"
            defaultValue="form.activityTypeId"
            v-model="form.activityTypeId"
          >
            <a-select-option
              :value="item.id"
              v-for="(item,i) in activityTypeIds"
              :key="i"
            >{{item.typeName}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态">
          <a-radio-group v-model="form.isEnabled">
            <a-radio :value="1">开启</a-radio>
            <a-radio :value="0">关闭</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form-item>
      <div class="mt5">
        <a-form-item label="活动名称">
          <a-input v-model="form.activityName"/>
        </a-form-item>
      </div>
      <div class="mt5">
        <a-form-item label="排序">
          <a-input v-model="form.sortOrder"/>
        </a-form-item>
      </div>
      <div class="mt5 dg-range">
        <DateRange title="活动时间" @change="changeDate" ref="rg"/>
      </div>
      <div class="mt5">
        <a-form-item label="PC端小图">
          <a-form-item>
            <a-input v-model="form.pcSmallImgUrl"/>
          </a-form-item>
          <a-form-item>
            <a-upload
              name="avatar"
              :showUploadList="false"
              action="#"
              :beforeUpload="beforeUpload"
              @change="changes('pcSmallImgUrl')"
            >
              <a-button>
                <a-icon type="upload"/>上传
              </a-button>
            </a-upload>
          </a-form-item>
        </a-form-item>
      </div>
      <!-- <div class="mt5">
        <a-form-item label="PC端大图">
          <a-form-item>
            <a-input v-model="form.pcBigImgUrl"/>
          </a-form-item>
          <a-form-item>
            <a-upload
              name="avatar"
              :showUploadList="false"
              action="#"
              :beforeUpload="beforeUpload"
              @change="changes('pcBigImgUrl')"
            >
              <a-button>
                <a-icon type="upload"/>上传
              </a-button>
            </a-upload>
          </a-form-item>
        </a-form-item>
      </div> -->
      <div class="mt5">
        <a-form-item label="H5端小图">
          <a-form-item>
            <a-input v-model="form.h5SmallImgUrl"/>
          </a-form-item>
          <a-form-item>
            <a-upload
              name="avatar"
              :showUploadList="false"
              action="#"
              :beforeUpload="beforeUpload"
              @change="changes('h5SmallImgUrl')"
            >
              <a-button>
                <a-icon type="upload"/>上传
              </a-button>
            </a-upload>
          </a-form-item>
        </a-form-item>
      </div>
      <!-- <div class="mt5">
        <a-form-item label='H5端大图'>
          <a-form-item><a-input v-model="form.h5BigImgUrl"/></a-form-item>
          <a-form-item>
			  <a-upload name="avatar" :showUploadList="false" action="#" :beforeUpload="beforeUpload" @change="changes('h5BigImgUrl')">
        			<a-button><a-icon type="upload" />上传</a-button>
        		</a-upload>
		  </a-form-item>
        </a-form-item>
      </div>-->
      <div class="mt5">
        <a-form-item label="APP小图">
          <a-form-item>
            <a-input v-model="form.appSmallImgUrl"/>
          </a-form-item>
          <a-form-item>
            <a-upload
              name="avatar"
              :showUploadList="false"
              action="#"
              :beforeUpload="beforeUpload"
              @change="changes('appSmallImgUrl')"
            >
              <a-button>
                <a-icon type="upload"/>上传
              </a-button>
            </a-upload>
          </a-form-item>
        </a-form-item>
      </div>
      <!-- <div class="mt5">
        <a-form-item label="APP大图">
          <a-form-item>
            <a-input v-model="form.appBigImgUrl"/>
          </a-form-item>
          <a-form-item>
            <a-upload
              name="avatar"
              :showUploadList="false"
              action="#"
              :beforeUpload="beforeUpload"
              @change="changes('appBigImgUrl')"
            >
              <a-button>
                <a-icon type="upload"/>上传
              </a-button>
            </a-upload>
          </a-form-item>
        </a-form-item>
      </div> -->
      <div class="mt5">
        <a-form-item label="内容编辑">
          <Editor :key="editorKey" @edit="editing" :editContent="editContent"/>
        </a-form-item>
      </div>
      <div class="mt5">
        <a-form-item label="是否显示">
          <a-radio-group v-model="form.isShow">
            <a-radio :value="0">不显示</a-radio>
            <a-radio :value="1">显示</a-radio>
          </a-radio-group>
        </a-form-item>
      </div>
      <div class="mt5">
        <a-form-item label="使用端">
          <a-radio-group v-model="form.clientType">
            <a-radio :value="-1">通用</a-radio>
            <a-radio :value="0">APP</a-radio>
            <a-radio :value="3">H5</a-radio>
            <a-radio :value="4">PC端</a-radio>
          </a-radio-group>
        </a-form-item>
      </div>
    </a-form>
  </div>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle, Prop, InjectComponents, Watch } from "vue-decorators";
import moment from "moment";
import { getToken } from "@/util/auth";
import DateRange from "@/components/date-range/DateRange";
import Editor from "@/components/editor";

@Component
@InjectComponents({ DateRange, Editor })
export default class PromoAdd extends Vue {
  @Prop({ type: String }) promoType;
  // 表单布局
  @Prop({ type: Array, default: () => [] }) activityTypeIds;
  //@Prop({ type: String }) editContent;
  @Prop({ type: [String, Number] }) id;
  editorKey = 1;
  form = {
    activityName: "", //活动名称
    activityTypeId: "", //活动类型
    appBigImgUrl: "", //app大图
    appSmallImgUrl: "", //app小图
    clientType: -1, //
    h5BigImgUrl: "", //H5大图
    h5SmallImgUrl: "", //h5小图
    id: 0,
    isEnabled: 0, //活动状态
    isShow: 0, //是否显示
    pcBigImgUrl: "", //PC端大图
    pcSmallImgUrl: "", //PC端小图
    sortOrder: 0,
    startTime: "", //
    endTime: "", //
    description: "" // 富文本编辑器内容
  };
  fileList = [];
  fileSn = "";
  uploadData = { token: getToken() };

  /* 图片上传 */
  beforeUpload(file) {
    this.fileList = [file];
    this.$nextTick(() => this.toUpload());
    return false;
  }

  changes(sn) {
    this.fileSn = sn;
  }

  editContent = "";
  //  富文本编辑内容
  editing(content) {
    this.form.description = content;
  }

  //  @Lifecycle created() {
  //   this.editcontent = this.editContent
  // }

  async toUpload() {
    const formData = new FormData();
    formData.append("imageFile", this.fileList[0]);
    formData.append('token', this.token);
    formData.append('uploadTypeName', 'activity');

    const res = await this.$service.fetch( "/common-api/upload/uploadAdminImage", formData );

    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.fileList = [];
    this.form[this.fileSn] = res.data.imageUrl;
  }

  @Watch("form.startTime") changeTime(news, olds) {
    if (this.promoType === "edit") {
      const start = new Date(this.form.startTime?.replace(/\-/g, "/"));
      const end = new Date(this.form.endTime?.replace(/\-/g, "/"));
      this.$refs.rg.setDateRangeValues(start, end);
    }
  }

  @Lifecycle() mounted() {
    if (this.promoType == "add") {
      const date = new Date();
      this.$refs.rg.setDateRangeValues(date);
      this.form.startTime = moment(date).format("YYYY-MM-DD 00:00:00");
      this.form.endTime = moment(date).format("YYYY-MM-DD 23:59:59");
    } else {
      const start = this.form.startTime?.replace(/\-/g, "/");
      const end = this.form.endTime?.replace(/\-/g, "/");
      this.$refs.rg.setDateRangeValues(start, end);
      this.getInfo();
    }
  }

  async getInfo() {
    const res = await this.$service.fetch("/config-admin-api/activity/getActivityDetail", {
      id: this.id
    });
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.form = res.data;
    this.form.activityTypeId = res.data.activityTypeId;
    this.editContent = res.data.description;
    this.editorKey ++;
  }

  changeDate(startTime, endTime, datestring, type) {
    if (type === "start") {
      this.form.startTime = datestring;
    } else {
      this.form.endTime = datestring;
    }
  }
}
</script>

<style lang="scss">
.promo-add {
  .ant-form-item > .ant-form-item-label > label {
    width: 80px;
    text-align: right;
    display: inline-block;
  }
  .ant-form-item-children .ant-input {
    width: 360px;
  }

  .dg-range {
    .ant-input {
      width: 180px !important;
    }
  }
}
</style>
