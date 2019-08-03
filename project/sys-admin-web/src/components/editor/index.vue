<template>
    <vue-editor v-model="content" :editorToolbar="customToolbar" :useCustomImageHandler="true" @imageAdded="uploadImage"></vue-editor>
</template>
<script>
import { VueEditor } from "vue2-editor";
import { getToken } from "@/util/auth"
// 详细配置
// https://github.com/davidroyer/vue2-editor/blob/master/src/helpers/default-toolbar.js
export default {
  name: 'editor',
  components: { VueEditor },
  props: {
    editContent: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      content: "",
      customToolbar: [
        [{ header: [false, 1, 2, 3, 4, 5, 6] }],
        ["bold", "italic", "underline"],
        [ { align: "" }, { align: "center" }, { align: "right" }, { align: "justify" } ],
        [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ color: [] }, { background: [] }],
        ["link", "image"]
      ]
    }
  },
  watch: {
    content(val){
      this.$emit('edit', val);
    }
  },
  mounted() {
    if (this.editContent !== "") {
      this.content = this.editContent;
    }
  },
  methods: {
    async uploadImage(file, Editor, cursorLocation, resetUploader) {
      const formData = new FormData();
      formData.append("imageFile", file);
      formData.append('token', getToken());
      formData.append('uploadTypeName', 'activity');
      try {
        const res = await this.$service.fetch( "/common-api/upload/uploadAdminImage", formData);
        if (1 != res.code) return res.message && this.$message.error(res.message);
        Editor.insertEmbed(cursorLocation, "image", res.data?.imageUrl);
        resetUploader();
      } catch (err) {
        this.$message.error("上传图片失败");
      }
    }
  }  
}
</script>
<style lang="scss">
/* 定义富文本编辑器样式 */
.quillWrapper {
	line-height: 1;
	div.ql-toolbar.ql-toolbar {
		padding: 3px 0 0 0;
		.ql-formats {
			&:first-child {
				.ql-picker-label {
					&::before {
						content: "标题"
					}
				}
			}
		
			margin-bottom: 5px;
			svg {
				width: 16px;
				height: 16px;
			}
		}
	}
	.ql-snow {
    #ql-picker-options-0 {
      .ql-picker-item {
        &::before {
          content: "段落"
        }
        &:nth-child(2) {
          &::before {
            content: "标题 1"
          }
        }
        &:nth-child(3) {
          &::before {
            content: "标题 2"
          }
        }
        &:nth-child(4) {
          &::before {
            content: "标题 3"
          }
        }
        &:nth-child(5) {
          &::before {
            content: "标题 4"
          }
        }
        &:nth-child(6) {
          &::before {
            content: "标题 5"
          }
        }
        &:nth-child(7) {
          &::before {
            content: "标题 6"
          }
        }
      }
    }
    span.ql-picker.ql-header {
      width: 70px;
    }
		.ql-tooltip.ql-editing {
			&::before {
				content: "链接地址："
			}
			.ql-action {
				&::after {
					content: "保存"
				}
			}
		}
	}
}
</style>
