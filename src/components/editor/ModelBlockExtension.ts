import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ModelBlockNodeView } from "./ModelBlockNodeView";

export const ModelBlock = Node.create({
  name: "modelBlock",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      modelUrl: {
        default: "",
      },
      modelName: {
        default: "3D Model",
      },
      height: {
        default: 400,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-model-viewer]",
        getAttrs: (dom) => {
          if (typeof dom === "string") return false;
          return {
            modelUrl: dom.getAttribute("data-model-url"),
            modelName: dom.getAttribute("data-model-name"),
            height: parseInt(dom.getAttribute("data-model-height") || "400", 10),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-model-viewer": "true",
        "data-model-url": HTMLAttributes.modelUrl,
        "data-model-name": HTMLAttributes.modelName,
        "data-model-height": HTMLAttributes.height,
        class: "parsley-model-embed",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ModelBlockNodeView);
  },
});
