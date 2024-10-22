import { SessionDataItem } from "../../@types";
import {
  checkAdPartnerAndAdId,
  checkPartnerAndFriendlyNames,
  getValueAfterOperator,
  hasContentAfterOperator,
  isConvertibleToNumber,
  isValidRevenueOrderString,
  evaluateFilterExpression,
} from "./functions";

const validate = (_data: SessionDataItem) => {
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

  if (name === "Create Custom Filter" || data?.length) {
    const isNameValid =
      title.trim().length > 3 && title !== "Create Custom Filter";
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

export default validate;
