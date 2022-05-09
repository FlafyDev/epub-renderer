// https://stackoverflow.com/a/66291608
const getSelector = (elem: Element) => {
  if (elem.tagName === "BODY") return "BODY";
  const names = [];
  while (elem.parentElement && elem.tagName !== "BODY") {
    if (elem.id) {
      names.unshift("#" + elem.getAttribute("id")); // getAttribute, because `elm.id` could also return a child element with name "id"
      break; // Because ID should be unique, no more is needed. Remove the break, if you always want a full path.
    } else {
      let c = 1,
        e = elem;
      for (; e.previousElementSibling; e = e.previousElementSibling, c++);
      names.unshift(elem.tagName + ":nth-child(" + c + ")");
    }
    elem = elem.parentElement;
  }
  return names.join(">");
};

export default getSelector;
