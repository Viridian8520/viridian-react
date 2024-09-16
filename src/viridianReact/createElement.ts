import { ReactHTML, ClassAttributes, ReactNode, HTMLAttributes } from "react";

const createElement = <P extends HTMLAttributes<T>, T extends HTMLElement>(
  type: keyof ReactHTML,
  props?: (ClassAttributes<T> & P) | null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...children: ReactNode[] | any[]
) => {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        return typeof child === "object" ? child : createTextElement(child);
      }),
    },
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createTextElement = (text: any) => {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
};

export default createElement;
