import parse, { domToReact } from "html-react-parser";

const transform = (node) => {
  if (node.type === "tag" && node.name === "style") {
    const css = node.children?.[0]?.data || "";
    return (
      <style dangerouslySetInnerHTML={{ __html: css }} />
    );
  }
};
export default transform;
