---
title: 今日随笔(7-30)
date: 2020-07-30 14:22:18
tags: essay
categories: essay
---

## 用 ts 开发 react 组件

</br>

**基础函数式组件**

不用传递任何的 prop，直接返回一个 jsx 作为 react 组件

```bash
function Title() {
  return <h1>Welcome to this application</h1>;
}
```
<!-- more -- >
**带有 prop 的函数式组件**

声明 props 类型并将 prop 传递给 jsx

```bash
type GreetingProps = {
  name: string;
};

function Greeting(props: GreetingProps) {
  return <p>Hi {props.name} 👋</p>
}
```

对 prop 进行解构或许可读性更好

```bash
function Greeting({ name }: GreetingProps) {
  return <p>Hi {name} 👋</p>;
}
```

假如 GreetingProps 中的 name 可选，那么就要给 name 一个默认值，以防 name 会变成 undefined

```bash
type LoginMsgProps = {
  name?: string;
};

function LoginMsg({ name = "Guest" }: LoginMsgProps) {
  return <p>Logged in as {name}</p>;
}
```

**Children**

对于 children，更倾向于显示定义，而对于 ReactNode 类型来说，已经能够接受大多数的东西，比如 jsx，string 字符串等等

```bash
type CardProps = {
  title: string;
  children: React.ReactNode;
};

export function Card({ title, children }: CardProps) {
  return (
    <section className="cards">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
```

当不需要 children 元素时，可以显示定义 children 的类型为 never

```bash
type SaveButtonProps = {

  children: never
}
```

这样当传递了 children 时就会抛出错误

**对 html 元素使用拓展符**

拓展符对于 html 元素来说是个很好的特性，因为它能帮助你确保你把所有的 html 属性都给挪到你需要的元素上

```bash
type ButtonProps = JSX.IntrinsicElements["button"];

function Button({ ...allProps }: ButtonProps) {
  return <button {...allProps} />;
}
```

**属性可以自定义设计**

当需要对 html 某些属性进行约束时，可以对它们进行自定义设定

如下这个例子，对 type 进行类型约束，这样仅能被赋予`"primary" | "secondary"`这两个值了

```bash
type StyledButton = Omit<
  JSX.IntrinsicElements["button"],
  "type" | "className"
> & {
  type: "primary" | "secondary";
};

function StyledButton({ type, ...allProps }: StyledButton) {
  return <Button className={`btn-${type}`} />;
}
```

**Required**

为了防止被 omit 出来的属性会忘记进行添加，封装一个 helper 来进行约束,

```bash
type MakeRequired<T, K extends keyof T> = Omit<T, K> &
  Required<{ [P in K]: T[P] }>;
```

这样既可以将需要约束的属性omit出来，同时还能够防止忘记添加被omit出来的属性

```bash
type ImgProps
  = MakeRequired<
    JSX.IntrinsicElements["img"],
    "alt" | "src"
  >;

export function Img({ alt, ...allProps }: ImgProps) {
  return <img alt={alt} {...allProps} />;
}

const zz = <Img alt="..." src="..." />;
```
