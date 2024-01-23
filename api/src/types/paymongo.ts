export interface PayMongoCheckoutPaidPostbackRequest {
  id: string;
  attributes: {
    type: string;
    data: PayMongoCheckoutSession;
  };
}

export interface PayMongoCheckoutSession {
  id: string;
  attributes: {
    checkout_url: string;
    reference_number: string;
  };
}
