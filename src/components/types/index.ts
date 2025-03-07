export type Header = {
  name: string;
  value: string;
};

export type DuplicateRequest = {
  steps: number;
  count: number;
  url: string;
  method: string;
  headers: Record<string, string>;
  payload: object;
};

export type DuplicateRequestFromNetwork = chrome.devtools.network.Request & {
  requestIndex: number;
  stepIndex: number;
};

export type Requests = {
  originalRequests: chrome.devtools.network.Request[];
  duplicatedRequests: chrome.devtools.network.Request[];
};
