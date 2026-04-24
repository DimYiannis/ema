import { defineComponent, h } from "vue";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export const Alert = defineComponent({
  name: "Alert",
  props: {
    class: String,
    variant: {
      type: String as () => VariantProps<typeof alertVariants>["variant"],
      default: "default",
    },
  },
  setup(props, { slots }) {
    return () =>
      h("div", {
        role: "alert",
        class: cn(alertVariants({ variant: props.variant as any }), props.class),
      }, slots.default?.());
  },
});

export const AlertTitle = defineComponent({
  name: "AlertTitle",
  props: { class: String },
  setup(props, { slots }) {
    return () =>
      h("h5", { class: cn("mb-1 font-medium leading-none tracking-tight", props.class) }, slots.default?.());
  },
});

export const AlertDescription = defineComponent({
  name: "AlertDescription",
  props: { class: String },
  setup(props, { slots }) {
    return () =>
      h("div", { class: cn("text-sm [&_p]:leading-relaxed", props.class) }, slots.default?.());
  },
});
