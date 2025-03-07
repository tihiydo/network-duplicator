import ConfigRequest from "@/components/custom/config-request";
import { Status } from "@/components/custom/duplicate-request";
import RequestList from "@/components/custom/request-list";
import { Settings } from "@/components/custom/settings";
import { DuplicateRequest, Requests } from "@/components/types";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCallback, useEffect, useState } from "react";
import {
  CogIcon,
  FileChartColumn,
  ListIcon,
  Settings as SettingsIcon,
} from "lucide-react";
import { getDuplicateRequestsInfo, sendLog } from "@/lib/utils";

function App() {
  const [tab, setTab] = useState("list");

  const [requests, setRequests] = useState<Requests>({
    originalRequests: [],
    duplicatedRequests: [],
  });

  const [selectedRequest, setSelectedRequest] =
    useState<chrome.devtools.network.Request | null>(null);

  const [duplicateRequest, setDuplicateRequest] =
    useState<DuplicateRequest | null>(null);

  const handleRequestFinished = useCallback(
    (requestEntity: chrome.devtools.network.Request) => {
      if (requestEntity.request.method != "OPTIONS") {
        sendLog(JSON.stringify(requestEntity.request.headers, undefined, 2));
        console.log(requestEntity.request.headers);
        if (
          requestEntity.request.headers.find((h) => h.name === "duplicator")
        ) {
          setRequests((prev) => ({
            ...prev,
            duplicatedRequests: [...prev.duplicatedRequests, requestEntity],
          }));
        } else {
          setRequests((prev) => ({
            ...prev,
            originalRequests: [...prev.originalRequests, requestEntity],
          }));
        }
      }
    },
    []
  );

  // Create a new panel in the DevTools
  useEffect(() => {
    chrome.devtools.panels.create("Network Duplicator", "", "index.html");
    chrome.devtools.network.onRequestFinished?.addListener(
      handleRequestFinished
    );
  }, [handleRequestFinished]);

  return (
    <>
      <Toaster />
      <div className="w-full max-h-[100vh] flex flex-col h-[100vh]">
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value)}
          className="w-full flex-1 overflow-hidden"
        >
          <TabsList className="w-full">
            <TabsTrigger value="settings" className="cursor-pointer">
              <SettingsIcon className="w-2 h-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="list" className="cursor-pointer">
              <ListIcon className="w-2 h-2" />
              Request list
            </TabsTrigger>
            <TabsTrigger value="config" className="cursor-pointer">
              <CogIcon className="w-2 h-2" />
              Config request
            </TabsTrigger>
            <TabsTrigger value="status" className="cursor-pointer">
              <FileChartColumn className="w-2 h-2" />
              Status
            </TabsTrigger>
          </TabsList>
          <div className="pt-2 px-4 h-full overflow-y-auto">
            <TabsContent value="settings">
              <Settings />
            </TabsContent>
            <TabsContent value="list">
              <RequestList
                requests={requests.originalRequests}
                onRequestClick={(request) => {
                  setSelectedRequest(request);
                  setTab("config");
                }}
              />
            </TabsContent>
            <TabsContent value="config">
              <ConfigRequest
                request={selectedRequest}
                onDuplicate={(duplicateRequest) => {
                  setDuplicateRequest(duplicateRequest);
                  setTab("status");
                }}
              />
            </TabsContent>
            <TabsContent value="status">
              <Status
                duplicateRequest={duplicateRequest}
                requests={getDuplicateRequestsInfo(requests.duplicatedRequests)}
              />
            </TabsContent>
          </div>
        </Tabs>
        <div className="w-full text-[#eaeaea] text-center bg-[#3f3f3f85]">
          <i>Evoverse {new Date().getFullYear()}</i>
        </div>
      </div>
    </>
  );
}

export default App;
