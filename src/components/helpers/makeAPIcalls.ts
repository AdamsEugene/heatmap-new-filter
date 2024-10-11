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

export async function adsPlatformData(
  action: string,
  userId: string,
  websiteIds: number[]
): Promise<string | void> {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    action,
    userId,
    websiteIds,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  try {
    const response = await fetch(
      "https://00ujjwhaed.execute-api.us-west-2.amazonaws.com/Prod/oauth",
      requestOptions as any
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
