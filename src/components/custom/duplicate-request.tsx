import { useEffect } from "react";
import { DuplicateRequest, DuplicateRequestFromNetwork } from "../types";
import {
  Table,
  TableBody,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
} from "../ui/table";
import {
  evalCode,
  getRequestFinishTime,
  sortRequestsByFinishTime,
} from "@/lib/utils";

type DuplicateRequestProps = {
  duplicateRequest: DuplicateRequest | null;
  requests: DuplicateRequestFromNetwork[];
};

export const Status = ({
  duplicateRequest,
  requests,
}: DuplicateRequestProps) => {
  useEffect(() => {
    if (duplicateRequest) {
      let payload = JSON.stringify(duplicateRequest.payload);
      payload = payload ? payload : "null";
      if (payload === "{}") {
        payload = "null";
      }
      if (payload != "null") {
        payload = "'" + payload + "'";
      }

      for (let stepIndex = 0; stepIndex < duplicateRequest.steps; stepIndex++) {
        console.log(`(async () => {
          try {
            return await Promise.all(Array.from({ length: ${
              duplicateRequest.count
            } }).map(async (_, requestIndex) => {
              const headers = { ${Object.entries(duplicateRequest.headers).map(
                ([key, value]) => {
                  return "'" + key + "'" + ": '" + value + "'";
                }
              )}, 'duplicator': '${stepIndex}/' + requestIndex }
              
              const response = await fetch("${duplicateRequest.url}", {
                method: "${duplicateRequest.method}",
                headers: headers,
                body: ${payload},
              });
              return response.status;
            }));
          }
          catch(e) {
            console.log(e)
          }
        })()`);
        evalCode(`(async () => {
          try {
            return await Promise.all(Array.from({ length: ${
              duplicateRequest.count
            } }).map(async (_, requestIndex) => {
              const headers = { ${Object.entries(duplicateRequest.headers).map(
                ([key, value]) => {
                  return "'" + key + "'" + ": '" + value + "'";
                }
              )}, 'Duplicator': '${stepIndex}/' + requestIndex }
              
              const response = await fetch("${duplicateRequest.url}", {
                method: "${duplicateRequest.method}",
                headers: headers,
                body: ${payload},
              });
              return response.status;
            }));
          }
          catch(e) {
            console.log(e)
          }
        })()`);
      }
    }
  }, [duplicateRequest]);

  return (
    <>
      <Table className="h-full">
        <TableHeader>
          <TableRow>
            <TableHead>URL</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Index</TableHead>
            <TableHead>Step</TableHead>
            <TableHead>Time</TableHead>
            <TableHead className="text-right w-[100px]">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(
            sortRequestsByFinishTime(requests) as DuplicateRequestFromNetwork[]
          ).map((request, index) => (
            <TableRow key={index}>
              <TableCell className="truncate max-w-[400px]">
                {request.request.url}
              </TableCell>
              <TableCell>{request.request.method}</TableCell>
              <TableCell>{request.requestIndex}</TableCell>
              <TableCell>{request.stepIndex}</TableCell>
              <TableCell>{getRequestFinishTime(request)}</TableCell>
              <TableCell className="text-right">
                {request.response.status}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};
