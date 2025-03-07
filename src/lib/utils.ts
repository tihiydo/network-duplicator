import { DuplicateRequestFromNetwork, Header } from "@/components/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sendLog(message: string) {
  chrome.devtools.inspectedWindow.eval(
    `console.log("[Network Duplicator]", "${message}")`
  );
}

export function evalCode(code: string) {
  return chrome.devtools.inspectedWindow.eval(code);
}

export function reformatHeaders(headers: Header[]) {
  const newHeaders = headers.reduce<Record<string, string>>((acc, header) => {
    if (/^[a-zA-Z0-9!#$%&'*+-.^_`|~]+$/.test(header.name)) {
      acc[header.name] = header.value;
    }
    return acc;
  }, {});
  return newHeaders;
}

export function getDuplicateRequestsInfo(
  requests: chrome.devtools.network.Request[]
): DuplicateRequestFromNetwork[] {
  const requestsInfo = requests.map((request) => {
    try {
      const headers = request.request.headers.find(
        (header) => header.name === "duplicator"
      );
      sendLog(headers?.name || "net");
      if (!headers) {
        return null;
      }
      const [step, requestIndex] = headers.value.split("/") ?? [];
      console.log(step, requestIndex);
      return {
        ...request,
        stepIndex: parseInt(step),
        requestIndex: parseInt(requestIndex),
      };
    } catch {
      return null;
    }
  });

  return requestsInfo.filter((request) => request !== null);
}

export function sortRequestsByFinishTime(
  requests: chrome.devtools.network.Request[] | DuplicateRequestFromNetwork[]
): chrome.devtools.network.Request[] | DuplicateRequestFromNetwork[] {
  requests.sort(
    (a, b) =>
      new Date(new Date(a.startedDateTime).getTime() + a.time).getTime() -
      new Date(new Date(b.startedDateTime).getTime() + b.time).getTime()
  );
  return requests;
}

export function getRequestFinishTime(
  request: chrome.devtools.network.Request | DuplicateRequestFromNetwork
): string {
  return getTimeFormatted(
    new Date(new Date(request.startedDateTime).getTime() + request.time)
  );
}
export function getTimeFormatted(date: Date) {
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");
  return `${minutes}:${seconds}:${milliseconds}`;
}
