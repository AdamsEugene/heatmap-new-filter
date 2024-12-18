import { AuthorizationRequest, SessionDataItem } from "../../@types";
import { getRedirectType, getThis, useEntryPage } from "./functions";

// const BASE_URL = "https://stage14.heatmapcore.com/";
let BASE_URL = "";
let BASE_URL_2 = "";

if (getRedirectType() === "locala") {
  BASE_URL = "https://stage9.heatmapcore.com/";
  BASE_URL_2 = "https://stage9.heatmapcore.com";
}

export async function loadCustomFilters<T>(): Promise<T | false> {
  const body = JSON.stringify({
    idSite: getThis("idSite"),
    deviceType: getThis("deviceType"),
    idSiteHsr: getThis("subcategory"),
  });

  const requestOptions = { method: "POST", body };

  const response = await fetch(
    `${BASE_URL}/index.php?module=API&format=json&method=API.processCustomFilters`,
    requestOptions
  );

  if (response.ok) {
    const result = await response.json();
    if (result.result === "error") return false;
    return result.message;
  } else return false;
}

export async function fetchSegmentData(segmentName: string) {
  const url = `${BASE_URL}/index.php?idSite=${getThis(
    "idSite"
  )}&idSiteHsr=${getThis(
    "subcategory"
  )}&method=API.getSuggestedValuesForSegment&module=API&segmentName=${segmentName}`;
  try {
    const response = await fetch(url);

    if (response.ok) {
      const result = await response.json();
      if (result.result === "error") return false;
      return result;
    } else return false;
  } catch (error) {
    return false;
  }
}

export const dynamicallyFetchOptions = async (segment?: string) => {
  if (!segment) return;

  const url = `${BASE_URL}/index.php?idSite=${getThis(
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

// export async function adsPlatformData(
//   action: string,
//   userId: string,
//   websiteIds: number[]
// ): Promise<string | void> {
//   const myHeaders = new Headers();
//   myHeaders.append("Content-Type", "application/json");

//   const raw = JSON.stringify({
//     action,
//     userId,
//     websiteIds,
//   });

//   const requestOptions = {
//     method: "POST",
//     headers: myHeaders,
//     body: raw,
//     redirect: "follow",
//   };

//   try {
//     const response = await fetch(
//       "https://00ujjwhaed.execute-api.us-west-2.amazonaws.com/Prod/oauth",
//       requestOptions as any
//     );

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const result = await response.json();
//     return result;
//   } catch (error) {
//     console.error("Error fetching data:", error);
//   }
// }

export async function manageAdsConnection(params: AuthorizationRequest) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({ ...params });

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

export const saveEditCustomFilter = async (filterData: SessionDataItem) => {
  const restData = filterData.data?.map((data) => ({
    action: data.action,
    default: data.default,
    name: data.name,
    segment: data.segment,
    value: data.value,
    secValue: data.secValue,
  }));

  const dataToDb = JSON.stringify({
    data: restData,
    title: filterData.title,
    definition: filterData.definition,
    idSite: getThis("idSite"),
    deviceType: getThis("deviceType"),
    idSiteHsr: getThis("subcategory"),
    filterId: filterData.id,
  });

  const requestOptions = { method: "POST", body: dataToDb };

  try {
    const url = `${BASE_URL}/index.php?module=API&format=json&method=API.processCustomFilters`;

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const deleteCustomFilter = async (data: SessionDataItem) => {
  const id = data?.id;
  if (typeof id === "undefined") return;
  const dataToDb = JSON.stringify({
    idSite: getThis("idSite"),
    definition: "delete",
    filterId: id,
  });
  const requestOptions = { method: "POST", body: dataToDb };
  const url = `${BASE_URL}/index.php?module=API&format=json&method=API.processCustomFilters`;

  try {
    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const loadPartnerFilers = async (partner: string) => {
  const requestOptions = {
    method: "GET",
    redirect: "follow",
  };
  const token = localStorage.getItem("heatUserId");
  const accountId = localStorage.getItem("filter-account-id") || 0;
  try {
    const url = `${BASE_URL_2}/index.php?module=API&method=AdsIntegration.ads&token=${
      token || "9eecb8e8e31f3e5fb6d8bcf0ce343050"
    }&idSite=${getThis(
      "idSite"
    )}&userId=${accountId}&partner=${partner}&live=1`;
    const response = await fetch(url, requestOptions as any);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.msg;
  } catch (error) {
    console.error("Error fetching data:", error);
    return false;
  }
};
// https://stage1.heatmapcore.com/index.php?module=API&method=AdsIntegration.ads&token=9eecb8e8e31f3e5fb6d8bcf0ce343050&idSite=1562&userId=6&partner=x&live=1
export const justMakeThis = async (partner: string) => {
  const requestOptions = {
    method: "GET",
    redirect: "follow",
  };
  const token = localStorage.getItem("heatUserId");
  const accountId = localStorage.getItem("filter-account-id");
  try {
    const url = `${BASE_URL_2}/index.php?module=API&method=AdsIntegration.accounts&token=${token}&idSite=${getThis(
      "idSite"
    )}&userId=${accountId}&partner=${partner}&live=1`;
    const response = await fetch(url, requestOptions as any);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.msg;
  } catch (error) {
    console.error("Error fetching data:", error);
    return false;
  }
};
