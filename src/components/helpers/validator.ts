import { AllData, CombinedFilter } from "../../@types";

const conditions = ["Equal To", "Less Than", "Greater Than"];

export default function validator(
  data: AllData[],
  props?: CombinedFilter
): boolean {
  //   console.log(data);
  //   console.log(props);
  let valid = false;

  // for Entry Page || Traffic Source
  if (defaultConditions(props?.name)) {
    valid = !!data[0].default;
    data[0].conditionError = !valid;
    if (!valid) {
      data[0].conditionErrorMsg = "Referrer URL is Required";
      if (props?.name === "Total Pages Visited")
        data[0].conditionErrorMsg = "Please enter Number of visits (number)";
      if (props?.name === "Viewed Page")
        data[0].conditionErrorMsg = "Action URL is Required";
    } else {
      data[0].conditionErrorMsg = "";
    }
  }

  // for Total Pages Visited
  if (props?.name === "Session Tag" || props?.name === "Ads Platform") {
    const validCondition = !!data[0].default;
    const validValue = !!data[0].value;
    valid = validCondition && validValue;
    data[0].conditionError = !validCondition;
    data[0].valueError = !validValue;
    if (!valid) {
      if (!validCondition)
        data[0].conditionErrorMsg = "Please select a Session Tag Name";
      else data[0].conditionErrorMsg = "";
      if (!validValue) data[0].valueErrorMsg = "Please select a Tag Value(s)";
      else data[0].valueErrorMsg = "";
    }
  }

  // for Total Pages Visited
  if (props?.name === "A/B Tests") {
    const validCondition = !!data[0].default;
    const validValue = !!data[0].value;
    valid = validCondition && validValue;
    data[0].conditionError = !validCondition;
    data[0].valueError = !validValue;
    if (!valid) {
      if (!validCondition)
        data[0].conditionErrorMsg = "Please select a Partners Name";
      else data[0].conditionErrorMsg = "";
      if (!validValue) data[0].valueErrorMsg = "Please select an Experiment";
      else data[0].valueErrorMsg = "";
    }
  }

  // for Total Pages Visited
  if (props?.name === "Average Order Value") {
    const validCondition = conditions.includes(data[0].default);
    const validValue = !!data[0].value;
    valid = validCondition && validValue;
    data[0].conditionError = !validCondition;
    data[0].valueError = !validValue;
    if (!valid) {
      if (!validCondition)
        data[0].conditionErrorMsg = "Please select a Condition";
      else data[0].conditionErrorMsg = "";
      if (!validValue) data[0].valueErrorMsg = "Please enter a Value";
      else data[0].valueErrorMsg = "";
    }
  }

  if (props?.name === "Create Custom Filter") {
    data.forEach((item) => {
      item.conditionError = false;
      item.actionError = false;
      item.valueError = false;
      item.conditionErrorMsg = "";
      item.actionErrorMsg = "";
      item.valueErrorMsg = "";

      // Check if 'default' is not set
      if (!item.default) {
        item.conditionError = true;
        item.conditionErrorMsg = "Please select an Condition";
      }

      // Check if 'segment' is not set
      if (!item.segment) {
        item.actionError = true;
        item.actionErrorMsg = "Please select an Action";
      }

      // Check if 'value' is not set
      if (
        item.value === "" ||
        item.value === null ||
        item.value === undefined
      ) {
        item.valueError = true;
        item.valueErrorMsg = "Value is required";
      }
    });
    valid = data.every((item) => {
      return (
        item.segment !== null &&
        item.segment !== undefined &&
        item.segment !== "" &&
        item.default !== "" &&
        item.value !== "" &&
        item.value !== null &&
        item.value !== undefined
      );
    });
  }

  return valid;
}

const defaultConditions = (name?: string) =>
  [
    "Entry Page",
    "Traffic Source",
    "Total Pages Visited",
    "Viewed Page",
  ].includes(name || "");
