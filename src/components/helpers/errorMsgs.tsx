import { SessionDataItem } from "../../@types";

const errorMsgs = (data: SessionDataItem) => {
  const { name } = data;

  const objMap = {
    "Entry Page": "Referrer URL is Required",
    "Traffic Source": "Referrer URL is Required",
    "Total Pages Visited": "Please enter Number of visits (number)",
    "Viewed Page": "Action URL is Required",
    "Average Order Value": "Please enter a Value",
    "A/B Tests": "Please select an Experiment",
  };

  return objMap[name as keyof object] || "Invalid input";
};

export default errorMsgs;
