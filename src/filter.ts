import { JSXFilter } from "./evaluator";

export const DenyAttributeFilter: (matchers: (string | RegExp)[]) => JSXFilter = (matchers) => {
  const regexps = matchers.map((matcher) => matcher instanceof RegExp ? matcher : new RegExp(matcher));
  return (element) => {
    const { props, ...spread } = element;

    const filteredProps = { ...props };
    Object.keys(filteredProps).forEach((key) => {
      if(regexps.reduce<Boolean>((match, regexp) => match || regexp.exec(key), false)) {
        delete filteredProps[key];
      }
    })

    return { ...spread, props: filteredProps }
  }
}
