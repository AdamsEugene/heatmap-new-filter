export const labelMap = (inputType?: string) => {
  const map: { [x: string]: string } = {
    "Entry Page": "Referrer URL",
    "Ads Platform": "Select Platform",
    "Traffic Source": "Referrer URL",
    "Total Pages Visited": "Number of visits",
    "Viewed Page": "Action URL",
    "Average Order Value": "Condition",
    "Create Custom Filter": "Condition",
    "Session Tag": "Session Tag Name",
    "A/B Tests": "Select A/B Testing Tool",
  };
  return map[inputType || ""] || inputType;
};

export const placeholderMap = (inputType?: string) => {
  const map: { [x: string]: string } = {
    "Entry Page": "Select",
    "Ads Platform": "Select",
    "Traffic Source": "Select",
    "Total Pages Visited": "Enter value",
    "Viewed Page": "Select",
    "Average Order Value": "Equals",
    "Create Custom Filter": "Equals",
    "Session Tag": "Select",
    "A/B Tests": "Select",
  };
  return map[inputType || ""] || inputType;
};

export const SecondLabelMap = (inputType?: string) => {
  const map: { [x: string]: string } = {
    "Entry Page": "Value",
    "Ads Platform": "Ad Set",
    "Traffic Source": "",
    "Total Pages Visited": "",
    "Average Order Value": "Value",
    "Create Custom Filter": "Value",
    "Session Tag": "Tag Value",
    "A/B Tests": "Select Experiments",
  };
  return map[inputType || ""] || inputType;
};

export const SecondPlaceholderMap = (inputType?: string) => {
  const map: { [x: string]: string } = {
    "Entry Page": "Select",
    "Ads Platform": "Search or Select Ad Set",
    "Traffic Source": "",
    "Total Pages Visited": "",
    "Average Order Value": "0.00",
    "Create Custom Filter": "Enter value",
    "Session Tag": "Multiselect",
    "A/B Tests": "Select",
  };
  return map[inputType || ""] || inputType;
};
