import GridStory from "./GridStory.svelte";

export default {
  component: GridStory,
  title: "Components/Grid",
  tags: ["autodocs"],
  argTypes: {
    dotColor: { control: "color" },
    dotOpacity: { control: "number" },
    dotSize: { control: "number" }
  }
};

const Template = (args) => ({
  Component: GridStory,
  props: args,
  // decorators: [() => GridStory]
});

export const Default = Template.bind({});

