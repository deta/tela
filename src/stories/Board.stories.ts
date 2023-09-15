import type { Meta } from "@storybook/svelte";

import Board from "$lib/Board.svelte";
import { writable } from "svelte/store";

const meta: Meta<typeof Board> = {
  component: Board,
  argTypes: {
    settings: { control: "object" },
    board: { control: "object" }
  },
  args: {
    settings: writable({
      CAN_DRAW: true,
      CAN_SELECT: true,
      CAN_PAN: true,
      CAN_ZOOM: true,

      SNAP_TO_GRID: true,
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

      CULL: true,
      CULL_MARGIN: 400,

      DEV: {
        SHOW_POS: true,
        SHOW_MODE: true
      },
    })
  }
};

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/svelte/api/csf
 * to learn how to use render functions.
 */
export const Primary = {
  render: () => ({
    Component: Board,
  })
};

export default meta;
