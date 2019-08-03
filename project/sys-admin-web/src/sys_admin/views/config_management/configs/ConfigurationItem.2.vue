<template>
  <a-form :form="form">
    <a-form-item label="Name" >
      <a-input v-decorator="['username',{rules: [{ required: true, message: 'Please input your name' }]} ]" placeholder="Please input your name" />
    </a-form-item>
    <a-form-item  label="Nickname" >
      <a-input v-decorator="['nickname',{rules: [{ required: checkNick, message: 'Please input your nickname' }]} ]" placeholder="Please input your nickname" />
    </a-form-item>
    <a-form-item>
      <a-checkbox :checked="checkNick" @change="handleChange" > Nickname is required </a-checkbox>
    </a-form-item>
    <a-form-item >
      <a-button type="primary" @click="check" > Check </a-button>
    </a-form-item>
  </a-form>
</template>

<script>

export default {
  data () {
    return {
      checkNick: false,
      form: this.$form.createForm(this)
    };
  },
  methods: {
    check  () {
      this.form.validateFields((err) => {
          if (!err) {
            console.info('success');
          }
        },
      );
    },
    handleChange  (e) {
      this.checkNick = e.target.checked;
      this.$nextTick(() => {
        this.form.validateFields(['nickname'], { force: true });
      });
    },
  },
};
</script>