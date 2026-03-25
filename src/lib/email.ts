import { createElement, type ReactElement } from "react";
import { Resend } from "resend";
import { getEmailBaseUrl } from "@/emails/shared";
import { WelcomeEmail, welcomeEmailSubject } from "@/emails/WelcomeEmail";
import {
  OrderConfirmationEmail,
  orderConfirmationEmailSubject,
  type OrderConfirmationEmailProps,
} from "@/emails/OrderConfirmationEmail";
import {
  ShippingEmail,
  shippingEmailSubject,
  type ShippingEmailProps,
} from "@/emails/ShippingEmail";
import {
  DeliveryEmail,
  deliveryEmailSubject,
  type DeliveryEmailProps,
} from "@/emails/DeliveryEmail";
import {
  AbandonedCartEmail1,
  abandonedCartEmail1Subject,
  type AbandonedCartEmail1Props,
} from "@/emails/AbandonedCartEmail1";
import {
  AbandonedCartEmail2,
  abandonedCartEmail2Subject,
  type AbandonedCartEmail2Props,
} from "@/emails/AbandonedCartEmail2";
import {
  AbandonedCartEmail3,
  abandonedCartEmail3Subject,
  type AbandonedCartEmail3Props,
} from "@/emails/AbandonedCartEmail3";
import {
  BirthdayEmail,
  birthdayEmailSubject,
  type BirthdayEmailProps,
} from "@/emails/BirthdayEmail";
import {
  RestockEmail,
  restockEmailSubject,
  type RestockEmailProps,
} from "@/emails/RestockEmail";
import {
  ReviewRequestEmail,
  reviewRequestEmailSubject,
  type ReviewRequestEmailProps,
} from "@/emails/ReviewRequestEmail";

let resendClient: Resend | null = null;

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY est manquant dans les variables d'environnement.");
  }
  if (!resendClient) {
    resendClient = new Resend(key);
  }
  return resendClient;
}

function defaultFrom(): string {
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) {
    throw new Error(
      "RESEND_FROM_EMAIL est manquant (ex. « ISHYA <newsletter@votredomaine.com> »).",
    );
  }
  return from;
}

function resolveEmailRouting(args: {
  baseUrl?: string;
  unsubscribeUrl?: string;
}): { baseUrl: string; unsubscribeUrl: string } {
  const baseUrl = args.baseUrl ?? getEmailBaseUrl();
  const unsubscribeUrl =
    args.unsubscribeUrl ?? `${baseUrl}/compte/notifications`;
  return { baseUrl, unsubscribeUrl };
}

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  react: ReactElement;
  replyTo?: string;
  /** Surcharge du champ « from » Resend */
  from?: string;
};

/**
 * Envoie un email transactionnel ou marketing via Resend.
 * Configurez `RESEND_API_KEY` et `RESEND_FROM_EMAIL`.
 */
export async function sendEmail(options: SendEmailOptions) {
  const resend = getResend();
  return resend.emails.send({
    from: options.from ?? defaultFrom(),
    to: options.to,
    subject: options.subject,
    react: options.react,
    replyTo: options.replyTo,
  });
}

export async function sendWelcomeEmail(
  to: string,
  args: {
    firstName: string;
    shopUrl?: string;
    baseUrl?: string;
    unsubscribeUrl?: string;
    logoSrc?: string;
  },
) {
  const { baseUrl, unsubscribeUrl } = resolveEmailRouting(args);
  const shopUrl = args.shopUrl ?? `${baseUrl}/boutique`;
  return sendEmail({
    to,
    subject: welcomeEmailSubject,
    react: createElement(WelcomeEmail, {
      firstName: args.firstName,
      baseUrl,
      shopUrl,
      unsubscribeUrl,
      logoSrc: args.logoSrc,
    }),
  });
}

export async function sendOrderConfirmation(
  to: string,
  args: Omit<
    OrderConfirmationEmailProps,
    "baseUrl" | "unsubscribeUrl"
  > &
    Partial<Pick<OrderConfirmationEmailProps, "baseUrl" | "unsubscribeUrl" | "logoSrc">>,
) {
  const { baseUrl, unsubscribeUrl } = resolveEmailRouting(args);
  return sendEmail({
    to,
    subject: orderConfirmationEmailSubject(args.orderNumber),
    react: createElement(OrderConfirmationEmail, {
      orderNumber: args.orderNumber,
      orderDate: args.orderDate,
      items: args.items,
      subtotal: args.subtotal,
      shipping: args.shipping,
      discount: args.discount,
      total: args.total,
      shippingAddressLines: args.shippingAddressLines,
      trackOrderUrl: args.trackOrderUrl,
      estimatedDelivery: args.estimatedDelivery,
      logoSrc: args.logoSrc,
      baseUrl,
      unsubscribeUrl,
    }),
  });
}

export async function sendShippingNotification(
  to: string,
  args: Omit<ShippingEmailProps, "baseUrl" | "unsubscribeUrl"> &
    Partial<Pick<ShippingEmailProps, "baseUrl" | "unsubscribeUrl" | "logoSrc">>,
) {
  const { baseUrl, unsubscribeUrl } = resolveEmailRouting(args);
  return sendEmail({
    to,
    subject: shippingEmailSubject,
    react: createElement(ShippingEmail, {
      orderNumber: args.orderNumber,
      trackingNumber: args.trackingNumber,
      carrier: args.carrier,
      trackParcelUrl: args.trackParcelUrl,
      estimatedDeliveryDate: args.estimatedDeliveryDate,
      items: args.items,
      logoSrc: args.logoSrc,
      baseUrl,
      unsubscribeUrl,
    }),
  });
}

export async function sendDeliveryEmail(
  to: string,
  args: Omit<DeliveryEmailProps, "baseUrl" | "unsubscribeUrl"> &
    Partial<Pick<DeliveryEmailProps, "baseUrl" | "unsubscribeUrl" | "logoSrc">>,
) {
  const { baseUrl, unsubscribeUrl } = resolveEmailRouting(args);
  return sendEmail({
    to,
    subject: deliveryEmailSubject,
    react: createElement(DeliveryEmail, {
      firstName: args.firstName,
      reviewUrl: args.reviewUrl,
      logoSrc: args.logoSrc,
      baseUrl,
      unsubscribeUrl,
    }),
  });
}

export async function sendAbandonedCartEmail1(
  to: string,
  args: Omit<AbandonedCartEmail1Props, "baseUrl" | "unsubscribeUrl"> &
    Partial<
      Pick<AbandonedCartEmail1Props, "baseUrl" | "unsubscribeUrl" | "logoSrc">
    >,
) {
  const { baseUrl, unsubscribeUrl } = resolveEmailRouting(args);
  return sendEmail({
    to,
    subject: abandonedCartEmail1Subject,
    react: createElement(AbandonedCartEmail1, {
      products: args.products,
      cartUrl: args.cartUrl,
      logoSrc: args.logoSrc,
      baseUrl,
      unsubscribeUrl,
    }),
  });
}

export async function sendAbandonedCartEmail2(
  to: string,
  args: Omit<AbandonedCartEmail2Props, "baseUrl" | "unsubscribeUrl"> &
    Partial<
      Pick<AbandonedCartEmail2Props, "baseUrl" | "unsubscribeUrl" | "logoSrc">
    >,
) {
  const { baseUrl, unsubscribeUrl } = resolveEmailRouting(args);
  return sendEmail({
    to,
    subject: abandonedCartEmail2Subject,
    react: createElement(AbandonedCartEmail2, {
      products: args.products,
      checkoutUrl: args.checkoutUrl,
      logoSrc: args.logoSrc,
      baseUrl,
      unsubscribeUrl,
    }),
  });
}

export async function sendAbandonedCartEmail3(
  to: string,
  args: Omit<AbandonedCartEmail3Props, "baseUrl" | "unsubscribeUrl"> &
    Partial<
      Pick<AbandonedCartEmail3Props, "baseUrl" | "unsubscribeUrl" | "logoSrc">
    >,
) {
  const { baseUrl, unsubscribeUrl } = resolveEmailRouting(args);
  return sendEmail({
    to,
    subject: abandonedCartEmail3Subject,
    react: createElement(AbandonedCartEmail3, {
      products: args.products,
      promoUrl: args.promoUrl,
      logoSrc: args.logoSrc,
      baseUrl,
      unsubscribeUrl,
    }),
  });
}

export async function sendBirthdayEmail(
  to: string,
  args: Omit<BirthdayEmailProps, "baseUrl" | "unsubscribeUrl"> &
    Partial<Pick<BirthdayEmailProps, "baseUrl" | "unsubscribeUrl" | "logoSrc">>,
) {
  const { baseUrl, unsubscribeUrl } = resolveEmailRouting(args);
  return sendEmail({
    to,
    subject: birthdayEmailSubject(args.firstName),
    react: createElement(BirthdayEmail, {
      firstName: args.firstName,
      discountCode: args.discountCode,
      giftIdeasUrl: args.giftIdeasUrl,
      logoSrc: args.logoSrc,
      baseUrl,
      unsubscribeUrl,
    }),
  });
}

export async function sendRestockEmail(
  to: string,
  args: Omit<RestockEmailProps, "baseUrl" | "unsubscribeUrl"> &
    Partial<Pick<RestockEmailProps, "baseUrl" | "unsubscribeUrl" | "logoSrc">>,
) {
  const { baseUrl, unsubscribeUrl } = resolveEmailRouting(args);
  return sendEmail({
    to,
    subject: restockEmailSubject(args.productName),
    react: createElement(RestockEmail, {
      productName: args.productName,
      productImageUrl: args.productImageUrl,
      productUrl: args.productUrl,
      logoSrc: args.logoSrc,
      baseUrl,
      unsubscribeUrl,
    }),
  });
}

export async function sendReviewRequestEmail(
  to: string,
  args: Omit<ReviewRequestEmailProps, "baseUrl" | "unsubscribeUrl"> &
    Partial<
      Pick<ReviewRequestEmailProps, "baseUrl" | "unsubscribeUrl" | "logoSrc">
    >,
) {
  const { baseUrl, unsubscribeUrl } = resolveEmailRouting(args);
  return sendEmail({
    to,
    subject: reviewRequestEmailSubject,
    react: createElement(ReviewRequestEmail, {
      productName: args.productName,
      productImageUrl: args.productImageUrl,
      reviewUrl: args.reviewUrl,
      logoSrc: args.logoSrc,
      baseUrl,
      unsubscribeUrl,
    }),
  });
}
