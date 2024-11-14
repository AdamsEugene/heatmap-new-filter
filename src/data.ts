import flightLand from "./assets/images/flight_land.svg";
import trackChanges from "./assets/images/track_changes.svg";
import numbers from "./assets/images/numbers.svg";
import group from "./assets/images/group.svg";
import groupAdd from "./assets/images/group_add.svg";
import sentimentExtremelyDissatisfied from "./assets/images/sentiment_extremely_dissatisfied.svg";
import addShoppingCart from "./assets/images/add_shopping_cart.svg";
import payments from "./assets/images/payments.svg";
import task from "./assets/images/task.svg";
import partner from "./assets/images/timeline.svg";
import session from "./assets/images/sessiontag.svg";
import nonPur from "./assets/images/Non-purchasers.svg";
import adsPlatform from "./assets/images/addPlatform.svg";
import { DataItem, ECommerceDataItem, SessionDataItem } from "./@types";

export const sessionData: SessionDataItem[] = [
  {
    definition: "entryPageUrl==",
    iconSrc: flightLand,
    idsegment: 0,
    name: "Entry Page",
    title: "QuickFilter-EntryPage",
  },
  {
    definition: "ad_partner==;ad_id==",
    iconSrc: adsPlatform,
    idsegment: 0,
    name: "Ads Platform",
    title: "QuickFilter-SessionTag",
    showSign: true,
    hasBudge: true,
  },
  {
    definition: "referrerUrl==",
    iconSrc: trackChanges,
    idsegment: 0,
    name: "Traffic Source",
    title: "QuickFilter-TrafficSource",
    notDone: true,
  },
  {
    definition: "sessionTagName==;sessionTagValue==",
    iconSrc: session,
    idsegment: 0,
    name: "Session Tag",
    title: "QuickFilter-SessionTag",
    showSign: true,
  },
  {
    definition: "visitCount==",
    iconSrc: numbers,
    idsegment: 0,
    name: "Total Pages Visited",
    title: "QuickFilter-TotalPagesVisited",
  },
  {
    definition: "actionUrl==",
    iconSrc: task,
    idsegment: 0,
    name: "Viewed Page",
    title: "QuickFilter-ViewedPage",
  },
  {
    definition: "visitorType==returning",
    iconSrc: group,
    idsegment: 0,
    name: "Returning Users",
    title: "QuickFilter-ReturningUsers",
    isDefinitionValueSet: true,
    subTitle: "Users who have previously visited your site",
  },
  {
    definition: "visitorType==new",
    iconSrc: groupAdd,
    idsegment: 0,
    name: "New Users",
    title: "QuickFilter-NewUsers",
    isDefinitionValueSet: true,
    subTitle: "Users who visit your site for the first time",
  },
  {
    definition: "heatmapType==rage",
    iconSrc: sentimentExtremelyDissatisfied,
    idsegment: 0,
    name: "Rage Clicks",
    title: "rage click events",
    isDefinitionValueSet: true,
    subTitle:
      "Repeated clicks on the same area, often indicating user frustration or confusion.",
  },
];

export const eCommerceData: ECommerceDataItem[] = [
  {
    definition: "revenueOrder>1",
    iconSrc: addShoppingCart,
    idsegment: 0,
    name: "Purchasers",
    title: "QuickFilter-Purchasers",
    isDefinitionValueSet: true,
    subTitle: "Users who complete a purchase or transaction on your site",
  },
  {
    definition: "revenueOrder==0",
    iconSrc: nonPur,
    idsegment: 0,
    name: "Non Purchasers",
    title: "QuickFilter-Non-Purchasers",
    isDefinitionValueSet: true,
    subTitle:
      "Users who visit your site but do not complete a purchase or transaction",
  },
  {
    definition: "revenueOrder",
    iconSrc: payments,
    idsegment: 0,
    name: "Average Order Value",
    title: "QuickFilter-OrderValue",
    showSign: true,
  },
  {
    definition: "partnerName==",
    iconSrc: partner,
    idsegment: 0,
    name: "A/B Tests",
    title: "partner-name",
    showSign: true,
  },
];

export const segmentValues = {
  visitorType: ["returning", "new"],
  browserName: [
    "Chrome",
    "Firefox",
    "Handheld Browser",
    "Safari",
    "Firefox",
    "Konqueror",
    "Yuzu Browser",
    "UC Browser",
    "Yandex Browser",
    "Mozilla",
    "Whale Browser",
    "Samsung Internet",
    "UNK",
  ],
  deviceModel: [
    "iPhone OS",
    "Mac OS",
    "SAMSUNG",
    "Nexus",
    "Pixel",
    "Mac",
    "Linux",
    "BlackBerry",
    "Motorola",
    "Sony",
    "Xiaomi",
    "NokiaLumia",
    "OnePlus",
    "Nokia",
    "LG",
    "Pixel",
    "Dell",
  ],
  browserEngine: [
    "WebKit",
    "Blink",
    "Trident",
    "Text-based",
    "Dillo",
    "iCab",
    "Elektra",
    "Presto",
    "Gecko",
    "KHTML",
    "NetFront",
    "Edge",
    "NetSurf",
    "Servo",
    "Goanna",
    "EkiohFlow",
  ],
  deviceType: ["Desktop", "Tablet", "Mobile"],
  operatingSystemName: [
    "Windows",
    "Mac",
    "GNU/Linux",
    "Java ME",
    "webOS",
    "watchOS",
    "tvOS",
    "palmOS",
    "moonOS",
    "iPadOS",
    "iOS",
    "ZorinOS",
    "Zenwalk",
    "YunOS",
    "Xubuntu",
    "Xbox",
    "Windows RT",
    "Windows Phone",
    "Windows Mobile",
    "Windows IoT",
    "Windows CE",
    "Whale OS",
    "WebTV",
    "VectorLinux",
    "Unknown",
    "Ubuntu",
    "TmaxOS",
    "Tizen",
    "ThreadX",
    "TencentOS",
  ],
  referrerUrl: [
    "Google",
    "Bing",
    "Yahoo",
    "DuckDuckGo",
    "Baidu",
    "Yandex",
    "Ask",
    "AOL Search",
    "Facebook",
    "Twitter",
    "Instagram",
    "LinkedIn",
    "Pinterest",
    "YouTube",
    "Snapchat",
    "Reddit",
    "TikTok",
    "WhatsApp",
    "Telegram",
    "Tumblr",
    "Flickr",
    "Vimeo",
  ],
  countryName: {
    AF: "Afghanistan",
    AL: "Albania",
    DZ: "Algeria",
    AD: "Andorra",
    AO: "Angola",
    AI: "Anguilla",
    AG: "Antigua and Barbuda",
    AR: "Argentina",
    AM: "Armenia",
    AW: "Aruba",
    AU: "Australia",
    AT: "Austria",
    AZ: "Azerbaijan",
    BS: "Bahamas",
    BH: "Bahrain",
    BD: "Bangladesh",
    BB: "Barbados",
    BY: "Belarus",
    BE: "Belgium",
    BZ: "Belize",
    BJ: "Benin",
    BM: "Bermuda",
    BT: "Bhutan",
    BO: "Bolivia",
    BA: "Bosnia and Herzegovina",
    BW: "Botswana",
    BR: "Brazil",
    BN: "Brunei",
    BG: "Bulgaria",
    BF: "Burkina Faso",
    BI: "Burundi",
    CV: "Cabo Verde",
    KH: "Cambodia",
    CM: "Cameroon",
    CA: "Canada",
    KY: "Cayman Islands",
    CF: "Central African Republic",
    TD: "Chad",
    CL: "Chile",
    CN: "China",
    CO: "Colombia",
    KM: "Comoros",
    CG: "Congo",
    CR: "Costa Rica",
    HR: "Croatia",
    CU: "Cuba",
    CW: "Curaçao",
    CY: "Cyprus",
    CZ: "Czech Republic",
    DK: "Denmark",
    DJ: "Djibouti",
    DM: "Dominica",
    DO: "Dominican Republic",
    EC: "Ecuador",
    EG: "Egypt",
    SV: "El Salvador",
    GQ: "Equatorial Guinea",
    ER: "Eritrea",
    EE: "Estonia",
    ET: "Ethiopia",
    FK: "Falkland Islands",
    FO: "Faroe Islands",
    FJ: "Fiji",
    FI: "Finland",
    FR: "France",
    GF: "French Guiana",
    PF: "French Polynesia",
    GA: "Gabon",
    GM: "Gambia",
    GE: "Georgia",
    DE: "Germany",
    GH: "Ghana",
    GI: "Gibraltar",
    GR: "Greece",
    GL: "Greenland",
    GD: "Grenada",
    GP: "Guadeloupe",
    GU: "Guam",
    GT: "Guatemala",
    GG: "Guernsey",
    GN: "Guinea",
    GW: "Guinea-Bissau",
    GY: "Guyana",
    HT: "Haiti",
    HN: "Honduras",
    HK: "Hong Kong",
    HU: "Hungary",
    IS: "Iceland",
    IN: "India",
    ID: "Indonesia",
    IR: "Iran",
    IQ: "Iraq",
    IE: "Ireland",
    IM: "Isle of Man",
    IL: "Israel",
    IT: "Italy",
    JM: "Jamaica",
    JP: "Japan",
    JE: "Jersey",
    JO: "Jordan",
    KZ: "Kazakhstan",
    KE: "Kenya",
    KI: "Kiribati",
    KW: "Kuwait",
    KG: "Kyrgyzstan",
    LV: "Latvia",
    LB: "Lebanon",
    LS: "Lesotho",
    LR: "Liberia",
    LY: "Libya",
    LI: "Liechtenstein",
    LT: "Lithuania",
    LU: "Luxembourg",
    MO: "Macao",
    MG: "Madagascar",
    MW: "Malawi",
    MY: "Malaysia",
    MV: "Maldives",
    ML: "Mali",
    MT: "Malta",
    MH: "Marshall Islands",
    MQ: "Martinique",
    MR: "Mauritania",
    MU: "Mauritius",
    YT: "Mayotte",
    MX: "Mexico",
    MC: "Monaco",
    MN: "Mongolia",
    ME: "Montenegro",
    MS: "Montserrat",
    MA: "Morocco",
    MZ: "Mozambique",
    MM: "Myanmar",
    NA: "Namibia",
    NR: "Nauru",
    NP: "Nepal",
    NL: "Netherlands",
    NC: "New Caledonia",
    NZ: "New Zealand",
    NI: "Nicaragua",
    NE: "Niger",
    NG: "Nigeria",
    NU: "Niue",
    NF: "Norfolk Island",
    KP: "North Korea",
    MK: "North Macedonia",
    MP: "Northern Mariana Islands",
    NO: "Norway",
    OM: "Oman",
    PK: "Pakistan",
    PW: "Palau",
    PS: "Palestinian Territory",
    PA: "Panama",
    PG: "Papua New Guinea",
    PY: "Paraguay",
    PE: "Peru",
    PH: "Philippines",
    PL: "Poland",
    PT: "Portugal",
    PR: "Puerto Rico",
    QA: "Qatar",
    RE: "Réunion",
    RO: "Romania",
    RU: "Russia",
    RW: "Rwanda",
    WS: "Samoa",
    SM: "San Marino",
    ST: "Sao Tome and Principe",
    SA: "Saudi Arabia",
    SN: "Senegal",
    RS: "Serbia",
    SC: "Seychelles",
    SL: "Sierra Leone",
    SG: "Singapore",
    SX: "Sint Maarten",
    SK: "Slovakia",
    SI: "Slovenia",
    SB: "Solomon Islands",
    SO: "Somalia",
    ZA: "South Africa",
    KR: "South Korea",
    SS: "South Sudan",
    ES: "Spain",
    LK: "Sri Lanka",
    SD: "Sudan",
    SR: "Suriname",
    SZ: "Eswatini",
    SE: "Sweden",
    CH: "Switzerland",
    SY: "Syria",
    TW: "Taiwan",
    TJ: "Tajikistan",
    TZ: "Tanzania",
    TH: "Thailand",
    TL: "Timor-,Leste",
    TG: "Togo",
    TK: "Tokelau",
    TO: "Tonga",
    TT: "Trinidad and Tobago",
    TN: "Tunisia",
    TR: "Turkey",
    TM: "Turkmenistan",
    TC: "Turks and Caicos Islands",
    TV: "Tuvalu",
    UG: "Uganda",
    UA: "Ukraine",
    AE: "United Arab Emirates",
    GB: "United Kingdom",
    US: "United States",
    UY: "Uruguay",
    UZ: "Uzbekistan",
    VU: "Vanuatu",
    VA: "Vatican City",
    VE: "Venezuela",
    VN: "Vietnam",
    YE: "Yemen",
    ZM: "Zambia",
    ZW: "Zimbabwe",
  },
  referrerType: {
    1: "direct",
    2: "search",
    3: "website",
    6: "campaign",
    7: "social",
  },
};

export const _data: DataItem[] = [
  {
    type: "metric",
    category: "Visitors",
    name: "Actions In Visit",
    segment: "actions",
    sqlSegment: "log_visit.visit_total_actions",
    needsMostFrequentValues: true,
    option: "number" as const,
  },
  {
    type: "metric",
    category: "Visitors",
    name: "Days since first visit",
    segment: "daysSinceFirstVisit",
    sqlSegment: "log_visit.visitor_seconds_since_first",
    needsMostFrequentValues: true,
    sqlFilterValue: {},
    option: "number" as const,
  },
  {
    type: "metric",
    category: "Visitors",
    name: "Days since last visit",
    segment: "daysSinceLastVisit",
    sqlSegment: "FLOOR(log_visit.visitor_seconds_since_last / 86400)",
    needsMostFrequentValues: true,
    option: "number" as const,
  },
  {
    type: "metric",
    category: "Visitors",
    name: "Events",
    segment: "events",
    sqlSegment: "log_visit.visit_total_events",
    needsMostFrequentValues: true,
    acceptedValues:
      "To select all visits who triggered an Event, use: &segment=events>0",
    option: "integer" as const,
  },
  {
    type: "metric",
    category: "Visitors",
    name: "Number of Interactions",
    segment: "interactions",
    sqlSegment: "log_visit.visit_total_interactions",
    needsMostFrequentValues: true,
    acceptedValues: "Any positive integer",
    suggestedValuesCallback: {},
    option: "number" as const,
  },
  {
    type: "metric",
    category: "Visitors",
    name: "Number of Internal Searches",
    segment: "searches",
    sqlSegment: "log_visit.visit_total_searches",
    needsMostFrequentValues: true,
    acceptedValues:
      "To select all visits who used internal Site Search, use: &segment=searches>0",
    option: "integer" as const,
  },
  {
    type: "metric",
    category: "Visitors",
    name: "Number of visits",
    segment: "visitCount",
    sqlSegment: "log_visit.visitor_count_visits",
    needsMostFrequentValues: true,
    option: "number" as const,
  },
  {
    type: "metric",
    category: "Visitors",
    name: "Visit Duration (in seconds)",
    segment: "visitDuration",
    sqlSegment: "log_visit.visit_total_time",
    needsMostFrequentValues: true,
    option: "number" as const,
  },
  {
    type: "dimension",
    category: "Visitors",
    name: "Browser",
    segment: "browserName",
    sqlSegment: "log_visit.config_browser_name",
    needsMostFrequentValues: false,
    sqlFilterValue: {},
    acceptedValues: "FireFox, Internet Explorer, Chrome, Safari, Opera etc.",
    suggestedValuesCallback: {},
    option: "text" as const,
  },
  {
    type: "dimension",
    category: "Visitors",
    name: "Device model",
    segment: "deviceModel",
    sqlSegment: "log_visit.config_device_model",
    needsMostFrequentValues: true,
    acceptedValues: "iPad, Nexus 5, Galaxy S5, Fire TV, etc.",
    option: "text" as const,
  },
  {
    type: "dimension",
    category: "Visitors",
    name: "Device type",
    segment: "deviceType",
    sqlSegment: "log_visit.config_device_type",
    needsMostFrequentValues: true,
    sqlFilter: {},
    acceptedValues:
      "desktop, smartphone, tablet, feature phone, console, tv, car browser, smart display, camera, portable media player, phablet, smart speaker, wearable, peripheral",
    suggestedValuesCallback: {},
    option: "text" as const,
  },
  {
    type: "dimension",
    category: "Visitors",
    name: "Operating system",
    segment: "operatingSystemName",
    sqlSegment: "log_visit.config_os",
    needsMostFrequentValues: false,
    sqlFilterValue: {},
    acceptedValues: "Windows, Linux, Mac, Android, iOS etc.",
    suggestedValuesCallback: {},
    option: "text" as const,
  },
  {
    type: "dimension",
    category: "Visitors",
    name: "Resolution",
    segment: "resolution",
    sqlSegment: "log_visit.config_resolution",
    needsMostFrequentValues: true,
    acceptedValues: "1280x1024, 800x600, etc.",
    option: "matches" as const,
  },
  {
    type: "dimension",
    category: "Visitors",
    name: "Site time — hour (time of last action)",
    segment: "visitServerHour",
    sqlSegment: "HOUR(log_visit.visit_last_action_time)",
    needsMostFrequentValues: true,
    acceptedValues: "0, 1, 2, 3, ..., 20, 21, 22, 23",
    option: "number" as const,
  },
  {
    type: "dimension",
    category: "Visitors",
    name: "Visit type",
    segment: "visitorType",
    sqlSegment: "log_visit.visitor_returning",
    needsMostFrequentValues: true,
    sqlFilterValue: {},
    acceptedValues:
      'new, returning, returningCustomer. For example, to select all visitors who have returned to the website, including those who have bought something in their previous visits, the API request would contain "&segment=visitorType==returning,visitorType==returningCustomer"',
    suggestedValuesCallback: {},
    option: "matches" as const,
  },
  {
    type: "dimension",
    category: "Visitor location",
    name: "City",
    segment: "city",
    sqlSegment: "log_visit.location_city",
    needsMostFrequentValues: true,
    acceptedValues: "Sydney, Sao Paolo, Rome, etc.",
    option: "text" as const,
  },
  {
    type: "dimension",
    category: "Visitor location",
    name: "Continent",
    segment: "continentCode",
    sqlSegment: "log_visit.location_country",
    needsMostFrequentValues: true,
    sqlFilter:
      "Piwik\\Plugins\\UserCountry\\UserCountry::getCountriesForContinent",
    acceptedValues: "eur, asi, amc, amn, ams, afr, ant, oce",
    option: "text" as const,
  },
  {
    type: "dimension",
    category: "Visitor location",
    name: "Country",
    segment: "countryName",
    sqlSegment: "log_visit.location_country",
    needsMostFrequentValues: false,
    sqlFilterValue: {},
    acceptedValues: "Germany, France, Spain, ...",
    option: "text" as const,
  },
  // {
  //   type: "dimension",
  //   category: "Behaviour",
  //   name: "Action Type",
  //   segment: "actionType",
  //   sqlSegment: "log_action.type",
  //   needsMostFrequentValues: true,
  //   sqlFilter: {},
  //   acceptedValues:
  //     "A type of action, such as: pageviews, contents, sitesearches, events, outlinks, downloads",
  //   suggestedValuesCallback: {},
  //   option: "text" as const,
  // },
  {
    type: "dimension",
    category: "Behaviour",
    name: "Entry Page URL",
    segment: "entryPageUrl",
    sqlSegment: "log_visit.visit_entry_idaction_url",
    needsMostFrequentValues: true,
    sqlFilter: "\\Piwik\\Tracker\\TableLogAction::getIdActionFromSegment",
    suggestedValuesApi: "Actions.getEntryPageUrls",
    option: "matches" as const,
  },
  {
    type: "dimension",
    category: "Behaviour",
    name: "Exit Page URL",
    segment: "exitPageUrl",
    sqlSegment: "log_visit.visit_exit_idaction_url",
    needsMostFrequentValues: true,
    sqlFilter: "\\Piwik\\Tracker\\TableLogAction::getIdActionFromSegment",
    suggestedValuesApi: "Actions.getExitPageUrls",
    option: "matches" as const,
  },
  {
    type: "dimension",
    category: "Behaviour",
    name: "Page URL",
    segment: "pageUrl",
    sqlSegment: "log_link_visit_action.idaction_url",
    needsMostFrequentValues: true,
    sqlFilter: "\\Piwik\\Tracker\\TableLogAction::getIdActionFromSegment",
    suggestedValuesApi: "Actions.getPageUrls",
    option: "number" as const,
  },
  // {
  //   type: "dimension",
  //   category: "Events",
  //   name: "Event Action",
  //   segment: "eventAction",
  //   sqlSegment: "log_link_visit_action.idaction_event_action",
  //   needsMostFrequentValues: true,
  //   sqlFilter: "\\Piwik\\Tracker\\TableLogAction::getIdActionFromSegment",
  //   suggestedValuesApi: "Events.getAction",
  //   option: "matches" as const,
  // },
  // {
  //   type: "dimension",
  //   category: "Events",
  //   name: "Event Name",
  //   segment: "eventName",
  //   sqlSegment: "log_link_visit_action.idaction_name",
  //   needsMostFrequentValues: true,
  //   sqlFilter: "\\Piwik\\Tracker\\TableLogAction::getIdActionFromSegment",
  //   suggestedValuesApi: "Events.getName",
  //   option: "matches" as const,
  // },
  // {
  //   type: "dimension",
  //   category: "Events",
  //   name: "Event URL",
  //   segment: "eventUrl",
  //   sqlSegment: "log_link_visit_action.idaction_url",
  //   needsMostFrequentValues: true,
  //   sqlFilter: "\\Piwik\\Tracker\\TableLogAction::getIdActionFromSegment",
  //   acceptedValues:
  //     "The URL must be URL encoded, for example: http%3A%2F%2Fexample.com%2Fpath%2Fpage%3Fquery",
  //   option: "matches" as const,
  // },
  {
    type: "dimension",
    category: "Acquisition",
    name: "Channel Type",
    segment: "referrerType",
    sqlSegment: "log_visit.referer_type",
    needsMostFrequentValues: true,
    sqlFilterValue: "Piwik\\Plugins\\Referrers\\getReferrerTypeFromShortName",
    acceptedValues: "direct, search, website, campaign",
    suggestedValuesCallback: {},
    option: "matches" as const,
  },
  {
    type: "dimension",
    category: "Acquisition",
    name: "Keyword",
    segment: "referrerKeyword",
    sqlSegment: "log_visit.referer_keyword",
    needsMostFrequentValues: true,
    acceptedValues: "Encoded%20Keyword, keyword",
    option: "matches" as const,
  },
  {
    type: "dimension",
    category: "Acquisition",
    name: "Referrer Name",
    segment: "referrerName",
    sqlSegment: "log_visit.referer_name",
    needsMostFrequentValues: true,
    acceptedValues:
      "twitter.com, www.facebook.com, Bing, Google, Yahoo, CampaignName",
    option: "matches" as const,
  },
  {
    type: "dimension",
    category: "Acquisition",
    name: "Referrer URL",
    segment: "referrerUrl",
    sqlSegment: "log_visit.referer_url",
    needsMostFrequentValues: true,
    acceptedValues: "http%3A%2F%2Fwww.example.org%2Freferer-page.htm",
    option: "number" as const,
  },
  {
    type: "metric",
    category: "Ecommerce",
    name: "Order Revenue",
    segment: "revenueOrder",
    sqlSegment: "log_conversion.idvisit",
    needsMostFrequentValues: true,
    sqlFilter: {},
    option: "number" as const,
  },
  // {
  //   type: "dimension",
  //   category: "Ecommerce",
  //   name: "Product Name",
  //   segment: "productName",
  //   sqlSegment: "log_conversion_item.idaction_name",
  //   needsMostFrequentValues: true,
  //   sqlFilter: "\\Piwik\\Tracker\\TableLogAction::getIdActionFromSegment",
  //   option: "matches" as const,
  // },
  {
    type: "metric",
    category: "Session Tags",
    name: "Session Tag",
    segment: "sessionTag",
    sqlSegment: "log_hsr.session_tag",
    needsMostFrequentValues: false,
    option: "matches" as const,
  },
];
