import DraggableStory from "./DraggableStory.svelte";

export default {
  component: DraggableStory,
  title: "Components/Draggable",
  tags: ["autodocs"],
  argTypes: {
    pos: {
      x: { control: "number" },
      y: { control: "number" }
    },
    size: {
      x: { control: "number" },
      y: { control: "number" }
    }
  },
  args: {
    pos: {
      x: 0,
      y: 0
    },
    size: {
      x: 200,
      y: 200
    }
  }
};

const Template = (args) => ({
  Component: DraggableStory,
  props: args
});

export const Default = Template.bind({});
