module.exports = {
  presets: [
    '@vue/app'
  ],
  plugins: [
    ["@babel/plugin-proposal-decorators", {"legacy": true}], // 修饰属性或者方法
    ["@babel/plugin-proposal-class-properties", { "loose": true }], // 修饰类
    [
        "import", // 按需引入antd-design中的组件
        { libraryName: "ant-design-vue", libraryDirectory: "es", style: true }
    ],
    ["@babel/plugin-proposal-optional-chaining"],
    [
      "component", { libraryName: "element-ui", styleLibraryName: "theme-chalk" }
    ]
  ]
}
