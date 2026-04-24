import { defineComponent, h } from "vue";
import { RadioGroupRoot, RadioGroupItem, RadioGroupIndicator } from "radix-vue";
import { cn } from "@/lib/utils";

export const RadioGroup = defineComponent({
  name: "RadioGroup",
  props: { modelValue: String, class: String },
  emits: ["update:modelValue"],
  setup(props, { slots, emit }) {
    return () =>
      h(RadioGroupRoot, {
        modelValue: props.modelValue,
        class: cn("grid gap-2", props.class),
        "onUpdate:modelValue": (v: string) => emit("update:modelValue", v),
      }, slots.default?.());
  },
});

export const RadioGroupItem = defineComponent({
  name: "RadioGroupItem",
  props: {
    value: { type: String, required: true },
    id: String,
    class: String,
    disabled: Boolean,
  },
  setup(props) {
    return () =>
      h(
        RadioGroupItem,
        {
          value: props.value,
          id: props.id,
          disabled: props.disabled,
          class: cn(
            "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            props.class
          ),
        },
        () =>
          h(RadioGroupIndicator, { class: "flex items-center justify-center" }, () =>
            h("div", { class: "h-2.5 w-2.5 rounded-full bg-current" })
          )
      );
  },
});
