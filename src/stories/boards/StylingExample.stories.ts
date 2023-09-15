import StylingExample from "./StylingExample.svelte";

export default {
  component: StylingExample,
};

const Template = (args) => ({
  Component: StylingExample,
  props: args
});

export const Default = Template.bind({});
