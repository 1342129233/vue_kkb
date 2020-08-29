export default {
  props: {
    to: {
      type: String,
      required: true // 必填
    }
  },
  // 只能使用 render 来描述
  render(h) {
    // <a href="">abc</a>  渲染一个 a 标签
    // <router-link to="">
    // h(tag, data, children)
    // console.log(this.$slots);
    // (标签， 描述， 值(this.$slots.default   这个是匿名插槽))
    return h(
      "a",
      { attrs: { href: "#" + this.to }, class: "router-link" },
      this.$slots.default
    );
  }
};
