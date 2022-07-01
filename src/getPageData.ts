import { onPageData, requestPages } from "./flutterCom";

const cachedPages = new Map<number, string>();
const pageDataListeningList = new Map<number, ((html: string) => void)[]>();

const getPageData = async (pageIndex: number) => {
  const cachedPageHTML = cachedPages.get(pageIndex);
  if (cachedPageHTML !== undefined) {
    return cachedPageHTML;
  }
  let listeningList = pageDataListeningList.get(pageIndex);

  if (listeningList === undefined) {
    listeningList = [];
    pageDataListeningList.set(pageIndex, listeningList);
  }

  const promise = new Promise<string>((resolve) => {
    listeningList!.push((html) => {
      cachedPages.set(pageIndex, html);
      resolve(html);
    });
  });

  requestPages([pageIndex]);

  return promise;
};

(window as any).getPageData = getPageData;

onPageData((index, html) => {
  cachedPages.set(index, html);

  const listeningList = pageDataListeningList.get(index);
  if (listeningList !== undefined) {
    listeningList.forEach((callback) => {
      callback(html);
    });

    pageDataListeningList.delete(index);
  }
});

export default getPageData;
