import BoardStory from "./BoardStory.svelte";

export default {
  component: BoardStory,
  title: "Components/Board",
  tags: ["autodocs"],
  argTypes: {
    settings: {
      CAN_DRAW: { control: "boolean" },
      CAN_SELECT: { control: "boolean" },
      CAN_PAN: { control: "boolean" },
      CAN_ZOOM: { control: "boolean" },

      SNAP_TO_GRID: { control: "boolean" },
      GRID_SIZE: { control: "boolean" },

      BOUNDS: {
        minX: { control: "number" },
        maxX: { control: "number" },
        minY: { control: "number" },
        maxY: { control: "number" },
        minZoom: { control: "number" },
        maxZoom: { control: "number" },
        limit: { control: "string" }
      },

      // mostly internal stuff
      CULL: { control: "boolean" },
      CULL_MARGIN: { control: "number" },

      // dev stuff
      DEV: {
        SHOW_POS: { control: "boolean" },
        SHOW_MODE: { control: "boolean" }
      }
    },
    board: {
      viewOffset: { control: "object" },
      viewSize: { control: "object" },
      viewPort: { control: "object" },
      zoom: { control: "number" }
    }
  },
  args: {
    settings: {
      CAN_DRAW: true,
      CAN_SELECT: true,
      CAN_PAN: true,
      CAN_ZOOM: true,

      SNAP_TO_GRID: false,
      GRID_SIZE: 20,

      BOUNDS: {
        minX: null,
        maxX: null,
        minY: null,
        maxY: null,
        minZoom: null,
        maxZoom: null,
        limit: "hard"
      },

      // mostly internal stuff
      CULL: true,
      CULL_MARGIN: 400,

      // dev stuff
      DEV: {
        SHOW_POS: false,
        SHOW_MODE: false
      }
    },
    board: {
      viewOffset: { x: 0, y: 0 },
      viewSize: { x: 1280, y: 720 },
      viewPort: { x: 0, y: 0, w: 0, h: 0 },
      zoom: 1
    }
  }
};

const Template = (args) => ({
  Component: BoardStory,
  props: args,
});

export const Default = Template.bind({});
