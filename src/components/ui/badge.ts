import { defineComponent, h } from "vue";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export const Badge = defineComponent({
  name: "Badge",
  props: {
    class: String,
    variant: {
      type: String as () => VariantProps<typeof badgeVariants>["variant"],
      default: "default",
    },
  },
  setup(props, { slots }) {
    return () =>
      h("div", { class: cn(badgeVariants({ variant: props.variant as any }), props.class) }, slots.default?.());
  },
});
