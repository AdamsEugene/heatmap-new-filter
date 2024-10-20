import { SessionDataItem } from "../../@types";

const errorMsgs = (_data: SessionDataItem): string[] => {
  const { name, data } = _data;

  const isCustom = !!data;

  const objMap = {
    "Entry Page": ["Referrer URL is Required"],
    "Traffic Source": ["Referrer URL is Required"],
    "Total Pages Visited": ["Please enter Number of visits (number)"],
    "Viewed Page": ["Action URL is Required"],
    "Average Order Value": [
      "Please select a Condition",
      "Please enter a Value",
    ],
    "A/B Tests": [
      "Please select a Partners Name",
      "Please select an Experiment",
    ],
    "Ads Platform": ["Please select a platform", "Please select an ad set"],
    "Create Custom Filter": [
      "Please select an Action",
      "Please select an Condition",
      "Value is required",
    ],
  };

  return (
    objMap[isCustom ? "Create Custom Filter" : (name as keyof object)] || [
      "Invalid input",
    ]
  );
};

export default errorMsgs;
