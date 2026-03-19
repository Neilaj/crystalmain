import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { FormBlockNodeView } from "./FormBlockNodeView";

export const ContactFormBlock = Node.create({
  name: "contactForm",
  group: "block",
  atom: true, // Not editable content inside

  addAttributes() {
    return {
      formSlug: {
        default: "contact",
      },
      formName: {
        default: "Contact Form",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-contact-form]',
        getAttrs: (dom) => {
          if (typeof dom === 'string') return false;
          return {
            formSlug: dom.getAttribute("data-contact-form"),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, {
      "data-contact-form": HTMLAttributes.formSlug,
      class: "parsley-form-embed",
    })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FormBlockNodeView);
  },
});
