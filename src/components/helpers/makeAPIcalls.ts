import { getThis, useEntryPage } from "./functions";

const BASE_URL = "https://stage14.heatmapcore.com/";

export async function loadCustomFilters<T>(): Promise<T | false> {
  const body = JSON.stringify({
    idSite: getThis("idSite"),
    deviceType: getThis("deviceType"),
    idSiteHsr: getThis("subcategory"),
  });

  const requestOptions = { method: "POST", body };

  const response = await fetch(
    `${BASE_URL}index.php?module=API&format=json&method=API.processCustomFilters`,
    requestOptions
  );

  if (response.ok) {
    const result = await response.json();
    return result.message;
  } else return false;
}

export async function fetchSegmentData(segmentName: string) {
  const url = `${BASE_URL}index.php?idSite=${getThis(
    "idSite"
  )}&idSiteHsr=${getThis(
    "subcategory"
  )}&method=API.getSuggestedValuesForSegment&module=API&segmentName=${segmentName}`;

  const response = await fetch(url);

  if (response.ok) {
    const result = await response.json();
    return result;
  } else return false;
}

export const dynamicallyFetchOptions = async (segment?: string) => {
  if (!segment) return;

  const url = `${BASE_URL}index.php?idSite=${getThis(
    "idSite"
  )}&idSiteHsr=${getThis(
    "subcategory"
  )}&method=API.getSuggestedValuesForSegment&module=API&segmentName=${useEntryPage(
    segment
  )}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return undefined;
    const data = await response.json();
    return data;
  } catch (error) {
    console.log({ error });
    return undefined;
  }
};
