import {
  CustomValues,
  DataItem,
  FilterItem,
  GroupedData,
  SessionDataItem,
} from "../../@types";
import { _data, segmentValues } from "../../data";

export const getThis = (item: string) => {
  const parsedUrl = new URL(window.location.href);
  const searchParams = new URLSearchParams(parsedUrl.search);
  const hashParams = new URLSearchParams(parsedUrl.hash.slice(1));

  return searchParams.get(item) || hashParams.get(item) || "";
};

export const makeRequestFor = (name?: string): boolean => {
  const allowRequestList = [
    "Entry Page",
    "Traffic Source",
    "Session Tag",
    "Viewed Page",
    "A/B Tests",
    "Ads Platform",
  ];
  return name ? allowRequestList.includes(name) : false;
};

export const formatUrl = (url?: string): string => {
  try {
    if (!url) throw new Error("URL is undefined or empty.");
    if (url.startsWith("file://")) {
      const pathParts = url.split("/").filter((part) => part.length > 0);
      return pathParts.length > 0 ? pathParts[pathParts.length - 1] : "unknown";
    } else {
      const urlObject = new URL(url);
      const hostname = urlObject.hostname;
      const domainParts = hostname.startsWith("www.")
        ? hostname.slice(4)
        : hostname;
      const pathParts = urlObject.pathname
        .split("/")
        .filter((part) => part.length > 0);
      if (pathParts.length > 0) {
        return pathParts[pathParts.length - 1];
      } else {
        const domainName = domainParts.split(".")[0];
        return domainName;
      }
    }
  } catch (error) {
    // console.error(`Invalid URL: ${url}`, error);
    const len = (url || "")?.split("/")?.length;
    return (url || "")?.split("/")?.[len - 1] || "";
  }
};

export const insertItemBeforeSemicolon = (input: string, item: string) =>
  input.replace(/;/g, `${item};`);

export const alreadyHaveDisplayName = (data: SessionDataItem, item: string) =>
  data.nameForCompare && !hasNoDropdown(data.name)
    ? data.nameForCompare + "->" + formatUrl(item)
    : data.name + ": " + formatUrl(item);

export const hasNoDropdown = (name: string) =>
  ["Total Pages Visited"].includes(name);

export const numberInput = (name: string) =>
  ["Total Pages Visited"].includes(name);

export const provideAdditionalButton = (name: string) =>
  ["Total Pages Visited"].includes(name);

export const replaceAfterEquals = (input: string, newValue: string) =>
  input.replace(/==.*/, `==${newValue}`);

export const replaceAfterItem = (
  input: string,
  item: string,
  newValue: string
) => input.replace(new RegExp(`${item}.*`), `${item}${newValue}`);

export const replaceAfterSymbols = (
  input: string,
  replacement: string
): string => input.replace(/([><=]{1,2}|&&).*/, `$1${replacement}`);

export const options = {
  number: {
    "==": "Equal To",
    "<": "Less Than",
    ">": "Greater Than",
  },
  integer: {
    "==": "Equal To",
    ">": "Greater Than",
  },
  matches: {
    "==": "Equal To",
  },
  text: {
    "==": "Equal To",
    "&&": "Contains",
  },
};

export const conditions = {
  "Equal To": "==",
  "Less Than": "<",
  "Greater Than": ">",
  Contains: "&&",
};

export const groupDataByCategory = (data: DataItem[]): GroupedData => {
  return data.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as GroupedData);
};

export const addOptionsToData = () =>
  _data.map((d) => ({
    ...d,
    options: segmentValues[d.segment as keyof typeof segmentValues] || [],
    conditions: Object.values((options as any)[d.option as any]) || [],
  }));

export function convertOptionToArray(data: DataItem[]) {
  return data.map((item) => {
    if (typeof item.options === "object" && !Array.isArray(item.options)) {
      if (item.options) {
        item["options"] = Object.values(item.options) || [];
      } else {
        item["options"] = [];
      }
    }
    return item;
  });
}

export const useEntryPage = (segment: string) => {
  return ["exitPageUrl", "entryPageUrl", "pageUrl"].includes(segment)
    ? "entryPageUrl"
    : segment;
};

export const getPartnerValues = (
  partnersFriendly: { [key: string]: string },
  partners: string[]
): string[] => {
  return Object.keys(partnersFriendly)
    .filter((key) => partners.includes(key))
    .map((key) => partnersFriendly[key]);
};

export const getKeyByValue = (
  partnersFriendly: { [key: string]: string },
  value: string
): string | undefined => {
  return Object.keys(partnersFriendly).find(
    (key) => partnersFriendly[key] === value
  );
};

export const getUniqueArray = (browsers: string[]): string[] =>
  Array.from(new Set(browsers));

export const isArrayValid = (arr: string[]) => !arr.some((item) => item === "");

export const initialNewFilter: FilterItem = {
  id: "",
  title: "",
  definition: "",
  data: [{ action: "", default: "", name: "", segment: "", value: "" }],
};

export const generateSegmentString = (data: CustomValues[]): string => {
  return data
    .map(
      (item) =>
        `${item.segment}${(conditions as any)[item.default]}${item.value}`
    )
    .join(";");
};

function getCodeFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("code");
}

export function detectUrlChange() {
  const handleUrlChange = () => {
    console.log("popstate");

    const code = getCodeFromUrl();
    if (code) {
      console.log("Code parameter changed:", code);
    }
  };

  window.addEventListener("popstate", handleUrlChange);
  window.addEventListener("hashchange", handleUrlChange);

  return () => {
    window.removeEventListener("popstate", handleUrlChange);
    window.removeEventListener("hashchange", handleUrlChange);
  };
}

export const checkForTokens = (data: any): string[] => {
  const keysWithTokens: string[] = [];

  for (const key in data) {
    const partnerData = data[key];
    for (const siteId in partnerData) {
      if (partnerData[siteId].tokens && partnerData[siteId].tokens.length > 0) {
        keysWithTokens.push(key);
        break; // Stop checking this partner since it already has tokens
      }
    }
  }

  return keysWithTokens;
};
