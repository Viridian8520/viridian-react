/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactHTML } from "react";

let nextUnitOfWork: any = null;
let workInProgressRoot: any = null;
let currentRoot: any = null;
let deletions: any[] = [];
let workInProgressFiber: any = null;
let hooksIndex: number = 0;

/**
 * function a() {
 *  let a = 1;
 *  return (
 *    <h1 onClick>{a}</h1>
 *  )
 * }
 */
/**
 * <div>
 *   <h1>
 *     <p></p>
 *     <a></a>
 *   </h1>
 *   <h2></h2>
 * </div>
 */

const reconcileChildren = (workInProgressFiber: any, elements: any) => {
  // 为当前的fiber创造他子节点的fiber
  // parent child sibling 先补充子节点的 parent 跟 sibling，child只补充当前节点的child，等下次perform再填补充子节点的child
  let prevSibling: any = null;
  let oldFiber: any =
    workInProgressFiber.alternate && workInProgressFiber.alternate.child; // 这里取的是与下面workInProgressFiber?.props?.children同级的fiber
  let index = 0;

  while (index < elements.length || !!oldFiber) {
    const childNode = elements[index];
    let newFiber: any = null;
    const isSameType =
      oldFiber && childNode && childNode.type === oldFiber.type;
    if (isSameType) {
      newFiber = {
        parent: workInProgressFiber,
        dom: oldFiber.dom,
        type: oldFiber.type,
        props: childNode.props,
        alternate: oldFiber,
        effectTag: "UPDATE",
      };
    }

    if (!isSameType && childNode) {
      newFiber = {
        parent: workInProgressFiber,
        dom: null,
        type: childNode.type,
        props: childNode.props,
        alternate: null,
        effectTag: "PLACEMENT",
      };
    }

    if (!isSameType && oldFiber) {
      oldFiber.effectTag = "DELETE";
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      workInProgressFiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;

    index++;
  }
};

export const useState = (initial: any) => {
  const oldHook = workInProgressFiber?.alternate?.hooks?.[hooksIndex];
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [] as any,
  };

  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action: any) => {
    hook.state = action;
  });

  const setState = (action: any) => {
    hook.queue.push(action);
    workInProgressRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    }
    nextUnitOfWork = workInProgressRoot;
    deletions = [];
  }

  workInProgressFiber.hooks.push(hook);
  hooksIndex++;

  return [hook.state, setState];

};

const updateFunctionComponent = (fiber: any) => {
  workInProgressFiber = fiber;
  workInProgressFiber.hooks = [];
  hooksIndex = 0;
  const elements = [fiber.type(fiber.props)];
  reconcileChildren(fiber, elements);
}

const updateHostComponent = (fiber: any) => {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  // // 把创造好的fiber添加到parent里面
  // if (fiber.parent) {
  //   fiber.parent.dom.appendChild(fiber.dom);
  // }

  const elements = fiber?.props?.children;

  // 为当前的fiber创造他子节点的fiber
  reconcileChildren(fiber, elements);
}

const performUnitOfWork = (fiber: any) => {
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

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

// 筛选出来事件
const isEvent = (key: string) => key.startsWith("on");
// 筛选出不是 children 的属性
const isProperty = (key: string) => key !== "children" && !isEvent(key);
// 筛选出要移除的属性
const isDelete = (_prev: any, next: any) => (key: string) => !(key in next);
// 筛选出新的属性
const isNew =
  (prev: { [x: string]: any }, next: { [x: string]: any }) =>
  (key: string | number) =>
    prev[key] !== next[key];
const updateDom = (
  dom: any,
  prevProps: { [x: string]: any },
  nextProps: { [x: string]: any }
) => {
  // .filter(key=> isGone(prevProps,nextProps)(key)) 才是对的吧，下面的移除和新增的isGone和isNew用法是不是错的？

  // 移除掉旧的监听事件
  Object.keys(prevProps)
  .filter(isEvent)
  .filter(key => isDelete(prevProps, nextProps)(key) || isNew(prevProps, nextProps)(key))
  .forEach(name => {
    const eventType = name.toLocaleLowerCase().substring(2);
    dom.removeEventListener(
      eventType,
      prevProps[name]
    );
  });

  // 移除掉不存在新props里的属性
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isDelete(prevProps, nextProps))
    .forEach((name) => (dom[name] = ""));

  // 移除掉不存在新props里的属性
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => (dom[name] = nextProps[name]));

  // 新增事件
  Object.keys(nextProps)
  .filter(isEvent)
  .filter(isNew(prevProps, nextProps))
  .forEach(name => {
    const eventType = name.toLocaleLowerCase().substring(2);
    dom.addEventListener(
      eventType,
      nextProps[name]
    );
  });
};

const commitDeletion = (fiber: any, domParent: any) => {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    // 为什么是child？不是下面的parent？
    commitDeletion(fiber.child, domParent);
  }
}

const commitWork = (fiber: any) => {
  if (!fiber) return;
  
  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;

  switch (fiber.effectTag) {
    case "PLACEMENT":
      !!fiber.dom && domParent.appendChild(fiber.dom);
      break;
    case "UPDATE":
      !!fiber.dom && updateDom(fiber.dom, fiber.alternate, fiber.props);
      break;
    case "DELETE":
      // !!fiber.dom && domParent.removeChild(fiber.dom);
      commitDeletion(fiber, domParent);
      break;
    default:
      break;
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
};

const commitRoot = () => {
  commitWork(workInProgressRoot.child);
  deletions.forEach(commitWork);
  currentRoot = workInProgressRoot;
  workInProgressRoot = null;
};

const workLoop = (deadline: {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  timeRemaining: Function;
  [propsName: string]: any;
}) => {
  let shouldYield = true;
  while (shouldYield && nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() > 1; // 得到浏览器当前帧剩余的时间 scheduler
  }

  if (!nextUnitOfWork && workInProgressRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop); // 浏览器在空闲的时候去执行workLoop
};
requestIdleCallback(workLoop);

const createDom = (fiber: {
  type: keyof ReactHTML | "TEXT_ELEMENT";
  dom: any;
  props: { [propsName: string]: any };
}) => {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  // for (const prop in fiber.props) {
  //   if (prop === "children") continue;
  //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //   // @ts-expect-error
  //   dom[prop] = fiber.props[prop];
  // }
  updateDom(dom, {}, fiber.props);

  return dom;
};

export const render = (
  element: {
    type: keyof ReactHTML | "TEXT_ELEMENT";
    props: { children: any[]; [propsName: string]: any };
  },
  container: HTMLElement | Text | null
) => {
  workInProgressRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };

  nextUnitOfWork = workInProgressRoot;
  deletions = [];
};
