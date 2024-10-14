import { defineComponent, h } from "vue";
import HeatmapFilterComponent from "./components/HeatmapFilter.vue";

export const HeatmapFilterNew = defineComponent({
  name: "HeatmapFilterNew",
  components: {
    HeatmapFilterComponent,
  },
  setup() {
    return () => h(HeatmapFilterComponent);
  },
});

export default HeatmapFilterNew;

// Add this line to export the type
export type { PropType as HeatmapFilterNewProps } from "vue";
