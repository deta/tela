import type { Meta } from "@storybook/svelte";

import Positionable from "$lib/Positionable.svelte";

const meta: Meta<typeof Positionable> = {
  component: Positionable,
  title: "Components/Positionable",
  argTypes: {
    pos: {
      x: { control: "number" },
      y: { control: "number" }
    },
    size: {
      x: { control: "number" },
      y: { control: "number" }
    },
    z: { control: "number", min: 0 }
  },
  args: {
    pos: {
      x: 0,
      y: 0
    },
    size: {
      x: 0,
      y: 0
    },
    z: 0
  }
};

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/svelte/api/csf
 * to learn how to use render functions.
 */
export const Primary = {
  render: () => ({
    Component: Positionable,
    props: {
      pos: { x: 0, y: 0},
    },
  }),
};

export default meta;
