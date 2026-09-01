import {
  fetchGetInvoicePaymentLink,
  fetchCreateStripeCheckoutSession,
  fetchGetPaymentLinkInvoicePdf,
  generateSaleInvoiceSharableLink,
} from '@bigcapital/sdk-ts';
import {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import useApiRequest, { useApiFetcher } from '../../useRequest';
import { paymentLinkKeys } from './query-keys';
import type {
  GetInvoicePaymentLinkResponse,
  CreateStripeCheckoutSessionResponse,
} from '@bigcapital/sdk-ts';

// Create Payment Link (sale-invoices generate-link via SDK)
// ------------------------------------
interface CreatePaymentLinkValues {
  publicity: string;
  transactionType: string;
  transactionId: number | string;
  expiryDate: string;
}

interface CreatePaymentLinkResponse {
  link: string;
}

/**
 * Creates a new payment link.
 */
export function useCreatePaymentLink(
  options?: UseMutationOptions<
    CreatePaymentLinkResponse,
    Error,
    CreatePaymentLinkValues
  >,
): UseMutationResult<
  CreatePaymentLinkResponse,
  Error,
  CreatePaymentLinkValues
> {
  const fetcher = useApiFetcher();

  return useMutation<CreatePaymentLinkResponse, Error, CreatePaymentLinkValues>(
    {
      mutationFn: (values) =>
        generateSaleInvoiceSharableLink(
          fetcher,
          Number(values.transactionId),
        ).then((data) => ({ link: data.link })),
      ...options,
    },
  );
}

// Get Invoice Payment Link
// -----------------------------------------

export type { GetInvoicePaymentLinkResponse };

/**
 * Fetches the sharable invoice link metadata for a given link ID.
 */
export function useGetInvoicePaymentLink(
  linkId: string,
  options?: UseQueryOptions<GetInvoicePaymentLinkResponse, Error>,
): UseQueryResult<GetInvoicePaymentLinkResponse, Error> {
  const fetcher = useApiFetcher({ enableCamelCaseTransform: true });

  return useQuery<GetInvoicePaymentLinkResponse, Error>({
    queryKey: paymentLinkKeys.invoice(linkId),
    queryFn: () => fetchGetInvoicePaymentLink(fetcher, linkId),
    enabled: !!linkId,
    ...options,
  });
}

// Create Stripe Checkout Session
// ------------------------------------
interface CreateCheckoutSessionValues {
  linkId: string;
}

export const useCreateStripeCheckoutSession = (
  options?: UseMutationOptions<
    CreateStripeCheckoutSessionResponse,
    Error,
    CreateCheckoutSessionValues
  >,
): UseMutationResult<
  CreateStripeCheckoutSessionResponse,
  Error,
  CreateCheckoutSessionValues
> => {
  const fetcher = useApiFetcher({ enableCamelCaseTransform: true });

  return useMutation({
    mutationFn: (values: CreateCheckoutSessionValues) =>
      fetchCreateStripeCheckoutSession(fetcher, values.linkId),
    ...options,
  });
};

// Get Payment Link Invoice PDF
// ------------------------------------
interface GeneratePaymentLinkInvoicePdfValues {
  paymentLinkId: string;
}

export const useGeneratePaymentLinkInvoicePdf = (
  options?: UseMutationOptions<
    Blob,
    Error,
    GeneratePaymentLinkInvoicePdfValues
  >,
): UseMutationResult<Blob, Error, GeneratePaymentLinkInvoicePdfValues> => {
  const { http } = useApiRequest();

  return useMutation<Blob, Error, GeneratePaymentLinkInvoicePdfValues>({
    // Asked for as a blob rather than through the typed fetcher, which reads
    // every response as text. A PDF read as text is corrupted on the way in,
    // and saving it produced a file that downloaded and opened blank — the
    // bytes were never intact. The same request the rest of the application
    // makes for a PDF.
    mutationFn: async (values: GeneratePaymentLinkInvoicePdfValues) => {
      const response = await http.get(
        `/api/payment-links/${encodeURIComponent(values.paymentLinkId)}/invoice/pdf`,
        {
          responseType: 'blob',
          headers: { accept: 'application/pdf' },
        },
      );
      return new Blob([response.data], { type: 'application/pdf' });
    },
    ...options,
  });
};

export const useGetPaymentLinkInvoicePdf = (
  invoiceId: string,
  options?: UseQueryOptions<Blob, Error>,
): UseQueryResult<Blob, Error> => {
  const fetcher = useApiFetcher();

  return useQuery<Blob, Error>({
    queryKey: paymentLinkKeys.invoicePdf(invoiceId),
    queryFn: () => fetchGetPaymentLinkInvoicePdf(fetcher, invoiceId),
    enabled: !!invoiceId,
    ...options,
  });
};
