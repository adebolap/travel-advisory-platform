import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    const error = new Error(`${res.status}: ${text}`) as Error & { status?: number };
    error.status = res.status;
    if (res.status === 401) {
      toast({
        title: "Session Expired",
        description: "Please log in again to continue.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "API Request Failed",
        description: text,
        variant: "destructive",
      });
    }
    throw error;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined
): Promise<Response> {
  try {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> = ({ on401: unauthorizedBehavior }) => async ({ queryKey }) => {
  try {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      toast({
        title: "Unauthorized",
        description: "You need to log in to access this resource.",
        variant: "destructive",
      });
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  } catch (error) {
    console.error("Query Fetch Error:", error);
    throw error;
  }
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true,
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      onError: (error) => {
        if ((error as any).status !== 401) {
          toast({
            title: "Error Fetching Data",
            description: "An unexpected error occurred.",
            variant: "destructive",
          });
        }
      },
    },
    mutations: {
      retry: false,
      onError: (error) => {
        toast({
          title: "Mutation Failed",
          description: "There was an issue processing your request.",
          variant: "destructive",
        });
      },
    },
  },
});
