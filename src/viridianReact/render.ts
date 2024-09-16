import { ReactHTML } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let nextUnitOfWork: any = null;

/**
 * <div>
 *   <h1>
 *     <p></p>
 *     <a></a>
 *   </h1>
 *   <h2></h2>
 * </div>
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const performUnitOfWork = (fiber: any) => {
  // 执行任务单元，即把 ReactElement（虚拟Dom）转化为一个真实 Dom
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  // 把创造好的fiber添加到parent里面
  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom);
  }

  // 为当前的fiber创造他子节点的fiber 
  // parent child sibling 先补充子节点的 parent 跟 sibling，child只补充当前节点的child，等下次perform再填补充子节点的child
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prevSibling: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fiber?.props?.children?.forEach((childNode: any, index: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newFiber: any = {
      parent: fiber,
      dom: null,
      type: childNode.type,
      props: childNode.props,
    };
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
  });
  // return出下一个任务单元
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
};

const workLoop = (deadline: {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  timeRemaining: Function;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [propsName: string]: any;
}) => {
  let shouldYield = true;
  while (shouldYield && nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() > 1; // 得到浏览器当前帧剩余的时间 scheduler
  }

  requestIdleCallback(workLoop); // 浏览器在空闲的时候去执行workLoop
};
requestIdleCallback(workLoop);

const createDom = (
  element: {
    type: keyof ReactHTML | "TEXT_ELEMENT";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props: { [propsName: string]: any };
  }
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

  return dom;
};

const render = (
  element: {
    type: keyof ReactHTML | "TEXT_ELEMENT";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props: { children: any[], [propsName: string]: any };
  },
  container: HTMLElement | Text | null
) => {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  }
};

export default render;
