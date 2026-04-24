import { defineComponent, h } from "vue";
import { cn } from "@/lib/utils";

export const Card = defineComponent({
  name: "Card",
  props: { class: String },
  setup(props, { slots }) {
    return () =>
      h("div", { class: cn("rounded-lg border bg-card text-card-foreground shadow-sm", props.class) }, slots.default?.());
  },
});

export const CardHeader = defineComponent({
  name: "CardHeader",
  props: { class: String },
  setup(props, { slots }) {
    return () =>
      h("div", { class: cn("flex flex-col space-y-1.5 p-6", props.class) }, slots.default?.());
  },
});

export const CardTitle = defineComponent({
  name: "CardTitle",
  props: { class: String },
  setup(props, { slots }) {
    return () =>
      h("h3", { class: cn("text-2xl font-semibold leading-none tracking-tight", props.class) }, slots.default?.());
  },
});

export const CardDescription = defineComponent({
  name: "CardDescription",
  props: { class: String },
  setup(props, { slots }) {
    return () =>
      h("p", { class: cn("text-sm text-muted-foreground", props.class) }, slots.default?.());
  },
});

export const CardContent = defineComponent({
  name: "CardContent",
  props: { class: String },
  setup(props, { slots }) {
    return () =>
      h("div", { class: cn("p-6 pt-0", props.class) }, slots.default?.());
  },
});

export const CardFooter = defineComponent({
  name: "CardFooter",
  props: { class: String },
  setup(props, { slots }) {
    return () =>
      h("div", { class: cn("flex items-center p-6 pt-0", props.class) }, slots.default?.());
  },
});
