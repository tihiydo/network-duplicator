import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { reformatHeaders } from "@/lib/utils";
import { DuplicateRequest, Header } from "../types";

type RequestProps = {
  request: chrome.devtools.network.Request | null;
  onDuplicate: (duplicateRequest: DuplicateRequest) => void;
};

const FormSchema = z.object({
  count: z.coerce.number().min(1, {
    message: "Count must be at least 1.",
  }),
  steps: z.coerce.number().min(1, {
    message: "Steps must be at least 1.",
  }),
  url: z.string().min(4, {
    message: "URL must be at least 4 characters.",
  }),
  headers: z.string(),
  method: z.enum(["GET", "HEAD", "POST", "PUT", "DELETE"], {
    message: "Please select a valid HTTP method.",
  }),
  payload: z.string().min(2, {
    message: "Payload must be at least 2 characters.",
  }),
});

const ConfigRequest = ({ request, onDuplicate }: RequestProps) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      url: request?.request.url,
      steps: 1,
      count: 3,
      headers: JSON.stringify(request?.request.headers, null, 2),
      method: request?.request.method as
        | "GET"
        | "HEAD"
        | "POST"
        | "PUT"
        | "DELETE",
      payload: request?.request.postData?.text
        ? JSON.stringify(JSON.parse(request?.request.postData.text), null, 2)
        : "{}",
    },
  });

  function onSubmit() {
    try {
      const headersFromForm = JSON.parse(form.getValues("headers")) as Header[];
      const headers = reformatHeaders(headersFromForm);
      const payload = JSON.parse(form.getValues("payload")) as object;
      const duplicateRequest: DuplicateRequest = {
        count: form.getValues("count"),
        steps: form.getValues("steps"),
        url: form.getValues("url"),
        method: form.getValues("method"),
        headers,
        payload,
      };
      onDuplicate(duplicateRequest);
      toast.message("Request duplicate started");
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Error", { description: error.message });
      }
    }
  }

  return (
    <div className="h-full">
      {request ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6"
          >
            <div className="flex flex-row gap-x-[20px]">
              <FormField
                control={form.control}
                name="count"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Count</FormLabel>
                    <FormControl>
                      <Input placeholder="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      You can manage request count here
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="steps"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Steps</FormLabel>
                    <FormControl>
                      <Input placeholder="3" {...field} />
                    </FormControl>
                    <FormDescription>
                      You can manage request steps here
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder="www.google.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    You can manage request url here
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="HEAD">HEAD</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    You can manage request method here
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="headers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Headers</FormLabel>
                  <FormControl>
                    <Textarea
                      className="h-[150px]"
                      placeholder="Tell us a little bit about yourself"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    You can manage request headers here
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="payload"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payload</FormLabel>
                  <FormControl>
                    <Textarea
                      className="h-[150px]"
                      placeholder="{}"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    You can manage request payload here
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full mb-2">
              DUPLICATE
            </Button>
          </form>
        </Form>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <p>No request selected</p>
        </div>
      )}
    </div>
  );
};

export default ConfigRequest;
