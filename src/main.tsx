/* eslint-disable @typescript-eslint/no-explicit-any */
import "./index.css";
// import React from "react";
// import ReactDOM from "react-dom";

// const element = React.createElement(
//   "div",
//   {
//     title: "hello miao",
//   },
//   "哇袄",
//   React.createElement(
//     "a",
//     {
//       title: "miao a link",
//       href: "https://bilibili.com",
//     },
//     "安修",
//   )
// );

// console.log(element, 'miaotest element');

// const container = document.getElementById("root");

// ReactDOM.render(element, container);


// the same
// import viridianReact from './viridianReact'
// const viridianElement = viridianReact.createElement(
//   "div",
//   {
//     title: "hello miao",
//   },
//   "哇袄",
//   viridianReact.createElement(
//     "a",
//     {
//       title: "miao a link",
//       href: "https://bilibili.com",
//     },
//     "安修",
//   )
// );

// console.log(viridianElement, 'miaotest viridianElement');

// const container = document.getElementById("root");

// viridianReact.render(viridianElement, container);

/** @jsxRuntime classic */

import viridianReact from './viridianReact'

/** @jsx viridianReact.createElement */

const container = document.getElementById("root");

const updateValue = (e: any) => {
  renderer(e.target.value);
}

const renderer = (value: string) => {
  const element = (
    <div>
      <input onInput={updateValue} value={value} />
      <h2>current text is: {value}</h2>
    </div>
  )

  viridianReact.render(element, container);
}
renderer('阿弥诺斯');