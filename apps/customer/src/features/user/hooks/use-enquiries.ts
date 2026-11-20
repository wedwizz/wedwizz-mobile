import { useEffect } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  contactBusiness,
  getEnquiryThread,
  listEnquiries,
  markEnquiryRead,
  sendEnquiryMessage,
  shareEnquiryPhone,
  startEnquiry,
} from "@/features/user/api/enquiries.api";
import type { ContactBusinessPayload, StartEnquiryPayload } from "@wedwizz/core/api/types";
import { useAccountId } from "@/features/user/hooks/use-favourites";
import { chatUpdates } from "@wedwizz/core/chat/app-chat-updates";
import { enquiryKeys } from "@wedwizz/core/query/query-keys";

/**
 * The customer's conversations. `watch` keeps the list fresh while it is on screen (the inbox). Never asked for
 * without a customer account (a guest on a business's page).
 */
export function useEnquiries(query: { slug?: string } = {}, options: { watch?: boolean; enabled?: boolean } = {}) {
  const queryClient = useQueryClient();
  const accountId = useAccountId();
  const key = enquiryKeys.list(query);
  const watch = options.watch ?? false;
  useEffect(() => {
    if (!watch) return;
    return chatUpdates.watchInbox(() => void queryClient.invalidateQueries({ queryKey: enquiryKeys.lists() }));
  }, [watch, queryClient]);

  return useQuery({
    queryKey: key,
    queryFn: ({ signal }) => listEnquiries(query, { signal }),
    enabled: !!accountId && (options.enabled ?? true),
  });
}

/** One thread, newest page first; older pages load on demand. Refreshed while it is open. */
export function useEnquiryThread(enquiryId: string | undefined) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!enquiryId) return;
    return chatUpdates.watchThread(enquiryId, () => void queryClient.invalidateQueries({ queryKey: enquiryKeys.thread(enquiryId) }));
  }, [enquiryId, queryClient]);

  return useInfiniteQuery({
    queryKey: enquiryKeys.thread(enquiryId ?? ""),
    queryFn: ({ pageParam, signal }) => getEnquiryThread(enquiryId!, pageParam ? { before: pageParam } : {}, { signal }),
    initialPageParam: "",
    getNextPageParam: (page) => (page.hasEarlier ? page.messages[page.messages.length - 1]?.messageId : undefined),
    enabled: !!enquiryId,
  });
}

export function useStartEnquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StartEnquiryPayload) => startEnquiry(payload),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: enquiryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: enquiryKeys.thread(result.enquiry.enquiryId) });
    },
  });
}

export function useSendEnquiryMessage(enquiryId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => sendEnquiryMessage(enquiryId, text),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: enquiryKeys.thread(enquiryId) });
      void queryClient.invalidateQueries({ queryKey: enquiryKeys.lists() });
    },
  });
}

export function useMarkEnquiryRead(enquiryId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markEnquiryRead(enquiryId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: enquiryKeys.lists() }),
  });
}

export function useShareEnquiryPhone(enquiryId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => shareEnquiryPhone(enquiryId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: enquiryKeys.thread(enquiryId) });
      void queryClient.invalidateQueries({ queryKey: enquiryKeys.lists() });
    },
  });
}

/** The WhatsApp or Call button: records the contact, then hands back the number to open. */
export function useContactBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ContactBusinessPayload) => contactBusiness(payload),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: enquiryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: enquiryKeys.thread(result.enquiryId) });
    },
  });
}
