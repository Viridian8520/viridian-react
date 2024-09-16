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
import viridianReact from './viridianReact'
const viridianElement = viridianReact.createElement(
  "div",
  {
    title: "hello miao",
  },
  "哇袄",
  viridianReact.createElement(
    "a",
    {
      title: "miao a link",
      href: "https://bilibili.com",
    },
    "安修",
  )
);

console.log(viridianElement, 'miaotest viridianElement');

const container = document.getElementById("root");

viridianReact.render(viridianElement, container);