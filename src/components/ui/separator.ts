import { defineComponent, h } from "vue";
import { cn } from "@/lib/utils";

export const Separator = defineComponent({
  name: "Separator",
  props: {
    class: String,
    orientation: {
      type: String as () => "horizontal" | "vertical",
      default: "horizontal",
    },
    decorative: Boolean,
  },
  setup(props) {
    return () =>
      h("div", {
        role: props.decorative ? "none" : "separator",
        "aria-orientation": props.orientation,
        class: cn(
          "shrink-0 bg-border",
          props.orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
          props.class
        ),
      });
  },
});
