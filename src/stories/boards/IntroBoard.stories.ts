import IntroBoard from "./IntroBoard.svelte";

export default {
  component: IntroBoard,
};

const Template = (args) => ({
  Component: IntroBoard,
  props: args
});

export const Default = Template.bind({});
