import { SessionDataItem } from "../../@types";
import {
  checkPartnerAndFriendlyNames,
  getValueAfterOperator,
  hasContentAfterOperator,
  isConvertibleToNumber,
  isValidRevenueOrderString,
} from "./functions";

const validate = (data: SessionDataItem) => {
  const { name, definition } = data;
  console.log(data);
  if (noValidation.includes(name)) return true;

  if (
    name === "Entry Page" ||
    name === "Traffic Source" ||
    name === "Viewed Page"
  ) {
    return hasContentAfterOperator("==", definition);
  }

  if (name === "Total Pages Visited") {
    const isValid = hasContentAfterOperator("==", definition);
    const value = getValueAfterOperator("==", definition);
    return isValid && isConvertibleToNumber(value);
  }

  if (name === "Average Order Value") {
    return isValidRevenueOrderString(definition);
  }

  if (name === "A/B Tests") {
    return checkPartnerAndFriendlyNames(definition);
  }

  return false;
};

const noValidation = [
  "Returning Users",
  "New Users",
  "Rage Clicks",
  "Purchasers",
  "Non Purchasers",
];

export default validate;
