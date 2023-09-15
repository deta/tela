import type { Preview } from "@storybook/svelte";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/
      }
    },
    options: {
      storySort: {
        order: ["Getting Started", "Grid"]
      }
    }
  }
};

export default preview;
