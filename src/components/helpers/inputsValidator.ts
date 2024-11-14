import { SessionDataItem } from "../../@types";
import {
  checkAdPartnerAndAdId,
  checkPartnerAndFriendlyNames,
  getValueAfterOperator,
  hasContentAfterOperator,
  isConvertibleToNumber,
  isValidRevenueOrderString,
  evaluateFilterExpression,
  checkSessionTags,
} from "./functions";

export const validate = (_data: SessionDataItem, existingNames?: string[]) => {
  const { name, definition, data, title } = _data;
  if (noValidation.includes(name)) return [true];

  if (
    name === "Entry Page" ||
    name === "Traffic Source" ||
    name === "Viewed Page"
  ) {
    return [hasContentAfterOperator("==", definition)];
  }

  if (name === "Total Pages Visited") {
    const isValid = hasContentAfterOperator("==", definition);
    const value = getValueAfterOperator("==", definition);
    return [isValid && isConvertibleToNumber(value)];
  }

  if (name === "Average Order Value") {
    return isValidRevenueOrderString(definition);
  }

  if (name === "A/B Tests") {
    return checkPartnerAndFriendlyNames(definition);
  }

  if (name === "Ads Platform") {
    return checkAdPartnerAndAdId(definition);
  }

  if (name === "Session Tag") {
    return checkSessionTags(definition);
  }

  if (name === "Create Custom Filter" || data?.length) {
    const isNameValid =
      title.trim().length > 3 &&
      title !== "Create Custom Filter" &&
      !existingNames?.includes(title.trim());
    const isFilterOk = evaluateFilterExpression(definition);
    return [isNameValid, ...isFilterOk];
  }

  return [false];
};

const noValidation = [
  "Returning Users",
  "New Users",
  "Rage Clicks",
  "Purchasers",
  "Non Purchasers",
];

export const validateCustom = (
  filters: SessionDataItem,
  titles?: string[]
): boolean => {
  let isValid = true;

  if (filters.title.trim() === "Create Custom Filter") {
    isValid = false;
    (filters as any)[
      `error_title`
    ] = `Error: title can not be "Create Custom Filter".`;
  } else if (filters.title.trim() === "") {
    isValid = false;
    (filters as any)[`error_title`] = `Error: title is required".`;
  } else if (titles?.includes(filters.title.trim())) {
    isValid = false;
    (filters as any)[
      `error_title`
    ] = `Error: title is already taken, chose a different title".`;
  } else {
    (filters as any)[`error_title`] = ``;
  }

  filters.data?.forEach((filter) => {
    if (filter.action === "Session Tag") {
      const requiredKeys = ["default", "secValue", "value", "action"];
      requiredKeys.forEach((key) => {
        if (!filter[key]) {
          isValid = false;
          filter[`error_${key}`] = `Error: ${keyMapSes(
            key
          )} is required for Session Tag.`;
        } else filter[`error_${key}`] = "";
      });
    } else {
      const requiredKeys = ["default", "value", "action"];
      requiredKeys.forEach((key) => {
        if (!filter[key]) {
          isValid = false;
          filter[`error_${key}`] = `Error: ${keyMap(key)} is required for ${
            filter.action
          }.`;
        } else filter[`error_${key}`] = "";
      });
    }
  });

  return isValid;
};

const keyMap = (key: string) => {
  const obj = {
    default: "condition",
  };

  return (obj as any)[key] || key;
};

const keyMapSes = (key: string) => {
  const obj = {
    default: "condition",
    secValue: "tag Value",
    value: "session tag name",
  };

  return (obj as any)[key] || key;
};
