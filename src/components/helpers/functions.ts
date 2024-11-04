import {
  CustomValues,
  DataItem,
  Experiment,
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

export function getRedirectType(): "dashboard" | "locala" | "deves" | "dever" {
  const url = new URL(window.location.href);
  const hostname = url.hostname;
  if (hostname.includes("localhost")) return "locala";
  if (hostname.includes("dashboard")) return "dashboard";
  if (hostname.includes("early-release")) return "dever";
  if (hostname.includes("earlystage")) return "deves";
  return "dashboard";
}

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
    const len = (url?.toString() || "")?.split("/")?.length;
    return (url?.toString() || "")?.split("/")?.[len - 1] || "";
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

export const secondNumberInput = (name: string) =>
  ["Total Pages Visited", "Average Order Value"].includes(name);

export const provideAdditionalButton = (name: string) =>
  ["Total Pages Visited"].includes(name);

export const replaceAfterEquals = (input: string, newValue: string) =>
  input.replace(/==.*/, `==${newValue}`);

export const replaceAfterItem = (
  input: string,
  item: string,
  newValue: string
) => input.replace(new RegExp(`${item}.*`), `${item}${newValue}`);

export function insertValueInRevenueOrder(str: string, value: string): string {
  const pattern = /^revenueOrder([=><]{1,2})?(.*)$/;
  const match = str.match(pattern);
  if (match) {
    const number = match[2] || "";
    return `revenueOrder${value}${number}`;
  }
  return `revenueOrder${value}`;
}

export function replaceAfterRevenueOrder(
  str: string,
  value: string,
  operator = null
): string {
  const pattern = /^revenueOrder([=><]{1,2})?(.*)$/;
  const match = str.match(pattern);
  if (match) {
    const matchedOperator = match[1] || "";
    const usedOperator = operator !== null ? operator : matchedOperator;
    return `revenueOrder${usedOperator}${value}`;
  }
  return str;
}

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
    .map((item) =>
      item.name === "Session Tag"
        ? `sessionTagName==${item.value || ""};sessionTagValue==${
            item.secValue || ""
          }`
        : `${item.segment}${(conditions as any)[item.default] || ""}${
            item.value || ""
          }`
    )
    .join(";");
};

function getCodeFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("code");
}

export function detectUrlChange() {
  const handleUrlChange = () => {
    const code = getCodeFromUrl();
    if (code) {
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

export const actionItemsSearch = (
  obj: GroupedData,
  searchTerm: string,
  allActionItems?: GroupedData
): GroupedData => {
  const result: GroupedData = {};
  const objCopy: GroupedData = JSON.parse(JSON.stringify(obj));
  for (const category in objCopy) {
    const matchedItems = objCopy[category].filter((item) => {
      return (
        item.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        category?.toLowerCase()?.includes(searchTerm.toLowerCase())
      );
    });
    if (matchedItems.length > 0) {
      result[category] = matchedItems;
    }
  }

  return Object.keys(result).length > 0 ? result : allActionItems!;
};

export const removeUrlParams = (params: string[]) => {
  const url = new URL(window.location.href);

  params.forEach((param) => {
    url.searchParams.delete(param);
  });

  window.history.replaceState(null, "", url);
};

export function hasContentAfterOperator(
  operator: string,
  str: string
): boolean {
  const escapedOperator = operator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // Escape special regex characters
  const regex = new RegExp(`${escapedOperator}(.+)`);
  return regex.test(str.trim());
}

export function getValueAfterOperator(
  operator: string,
  str: string
): string | null {
  const escapedOperator = operator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // Escape special regex characters
  const regex = new RegExp(`${escapedOperator}(.+)`);
  const match = str.trim().match(regex);
  return match ? match[1].trim() : null; // Return the value after the operator, or null if not found
}

export function isConvertibleToNumber(value: any): boolean {
  const num = parseFloat(value);
  return !isNaN(num);
}

export function isValidRevenueOrderString(str: string): [boolean, boolean] {
  const pattern = /^revenueOrder([=><]{1,2})?(\d+)?$/;
  const match = str.match(pattern);

  return [!!match?.[1], !!match?.[2]];
}

export function checkPartnerAndFriendlyNames(str: string): [boolean, boolean] {
  const partnerNameRegex = /partnerName==[^;]+/;
  const friendlyNameRegex = /friendlyName==[^;]+/;

  const partnerNameMatch = partnerNameRegex.test(str);
  const friendlyNameMatch = friendlyNameRegex.test(str);

  return [partnerNameMatch, friendlyNameMatch];
}

export function replaceAdIdValue(str: string, newValue: string): string {
  const pattern = /ad_id==[^;]*/;
  return str.replace(pattern, `ad_id==${newValue}`);
}

export function checkAdPartnerAndAdId(str: string): [boolean, boolean] {
  const partnerRegex = /ad_partner==[^;]+/;
  const idRegex = /ad_id==[^;]+/;

  const hasPartner = partnerRegex.test(str);
  const hasId = idRegex.test(str);

  return [hasPartner, hasId];
}

export function areAllTrue(values: boolean[]): boolean {
  return values.every((value) => value === true);
}

export function evaluateFilterExpression(expression: string) {
  const filters = expression.split(";");
  const results = [];

  for (const filter of filters) {
    const [key, operator, value] = filter.split(/([=<>&]+)/);

    const keyValid = key?.length > 0 && key !== "undefined";
    const operatorValid = ["==", "<", ">", "&&"].includes(operator);
    const valueValid = value?.length > 0 && value !== "undefined";

    results.push([keyValid, operatorValid, valueValid]);
  }

  return results.flat();
}

export function chunkArray<T>(arr: T[], chunkSize: number): T[][] {
  const slicedArray = arr.slice(1);
  const chunks: T[][] = [];
  for (let i = 0; i < slicedArray.length; i += chunkSize) {
    const chunk = slicedArray.slice(i, i + chunkSize);
    chunks.push(chunk);
  }
  return chunks;
}

export function removeAndReturnElements(arr: boolean[], index: number) {
  if (index < 0 || index >= arr.length) {
    return { modifiedArray: arr, removedElements: [] };
  }

  const result = [...arr];
  const removedElements = [];

  const startRemoveIndex = index === 0 ? index + 4 : index + 3;

  if (startRemoveIndex < result.length) {
    if (startRemoveIndex > 0) {
      removedElements.push(result[startRemoveIndex - 1]);
    }
    removedElements.push(...result.splice(startRemoveIndex, 3));
  }

  return { modifiedArray: result, removedElements };
}

const makeValuesUnique = (items: Experiment[]): Experiment[] => {
  const valueCount: { [key: string]: number } = {};
  return items.map((item) => {
    const { value } = item;
    if (valueCount[value]) {
      valueCount[value]++;
      item.value = `${value} (${valueCount[value]})`;
    } else {
      valueCount[value] = 1;
    }
    return item;
  });
};

export const updateValuesForEachKey = (obj: any): Experiment[] => {
  const updatedObj: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      updatedObj[key] = makeValuesUnique(obj[key]);
    }
  }
  return updatedObj;
};

export function removeVariantSuffix(str: string): string {
  return str.replace(/(\s*\(\d+\))(?=[;]|$)/g, "");
}
