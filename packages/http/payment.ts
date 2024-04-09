export interface PaymentInitiationRequest {
  paymentGateway?: string;
  contactEmail?: string;
  contactMobile?: string;
  consigneeName?: string;
}

export interface PaymentInitiationResponse {
  redirectUrl: string;
  paymentReference: string;
}
