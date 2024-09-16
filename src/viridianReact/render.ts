
import { ReactHTML } from "react";

const render = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  element: { type: keyof ReactHTML | "TEXT_ELEMENT", props: {[propsName: string]: any} },
  container: HTMLElement | Text | null
) => {
  const dom =
    element.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);

  for (const prop in element.props) {
    if (prop === "children") continue;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    dom[prop] = element.props[prop];
  }

  for (const child of element.props.children) {
    render(child, dom);
  }
  container?.appendChild(dom);
};

export default render;
