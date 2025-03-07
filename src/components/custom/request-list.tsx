import { getRequestFinishTime, sortRequestsByFinishTime } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";

type RequestListProps = {
  requests: chrome.devtools.network.Request[];
  onRequestClick: (request: chrome.devtools.network.Request) => void;
};

const RequestList = ({ requests, onRequestClick }: RequestListProps) => {
  return (
    <Table className="h-full">
      <div>
        <Button>
          <Trash2></Trash2>
        </Button>
      </div>
      <TableHeader>
        <TableRow>
          <TableHead>URL</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Time</TableHead>
          <TableHead className="text-right w-[100px]">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortRequestsByFinishTime(requests).map((request, index) => (
          <TableRow
            className="cursor-pointer"
            key={index}
            onClick={() => onRequestClick(request)}
          >
            <TableCell className="truncate max-w-[400px]">
              {request.request.url}
            </TableCell>
            <TableCell>{request.request.method}</TableCell>
            <TableCell>{getRequestFinishTime(request)}</TableCell>
            <TableCell className="text-right">
              {request.response.status}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableCaption>List of intercepted network requests</TableCaption>
    </Table>
  );
};

export default RequestList;
