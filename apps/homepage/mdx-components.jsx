const H1 = ({ children }) => <h1 className="mt-8 text-3xl font-bold">{children}</h1>;

const H2 = ({ children }) => (
  <h2 className="font-bold" id={String(children).replaceAll(" ", "-")}>
    {children}
  </h2>
);

const A = ({ children, href }) => (
  <a href={href} className="text-primary underline">
    {children}
  </a>
);

export function useMDXComponents(components) {
  return {
    h1: H1,
    h2: H2,
    a: A,
    ...components,
  };
}
