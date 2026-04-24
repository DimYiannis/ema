import { defineComponent, h } from "vue";
import {
  TabsRoot,
  TabsList as RadixTabsList,
  TabsTrigger as RadixTabsTrigger,
  TabsContent as RadixTabsContent,
} from "radix-vue";
import { cn } from "@/lib/utils";

export const Tabs = defineComponent({
  name: "Tabs",
  props: { modelValue: String, defaultValue: String, class: String },
  emits: ["update:modelValue"],
  setup(props, { slots, emit }) {
    return () =>
      h(TabsRoot, {
        modelValue: props.modelValue,
        defaultValue: props.defaultValue,
        class: props.class,
        "onUpdate:modelValue": (v: string) => emit("update:modelValue", v),
      }, slots.default?.());
  },
});

export const TabsList = defineComponent({
  name: "TabsList",
  props: { class: String },
  setup(props, { slots }) {
    return () =>
      h(RadixTabsList, {
        class: cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", props.class),
      }, slots.default?.());
  },
});

export const TabsTrigger = defineComponent({
  name: "TabsTrigger",
  props: { value: { type: String, required: true }, class: String },
  setup(props, { slots }) {
    return () =>
      h(RadixTabsTrigger, {
        value: props.value,
        class: cn("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm", props.class),
      }, slots.default?.());
  },
});

export const TabsContent = defineComponent({
  name: "TabsContent",
  props: { value: { type: String, required: true }, class: String },
  setup(props, { slots }) {
    return () =>
      h(RadixTabsContent, {
        value: props.value,
        class: cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", props.class),
      }, slots.default?.());
  },
});
