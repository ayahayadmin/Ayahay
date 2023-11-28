export enum SEX {
  Male = 'Male',
  Female = 'Female',
}

export enum CIVIL_STATUS {
  Single = 'Single',
  Married = 'Married',
  Divorced = 'Divorced',
  Widowed = 'Widowed',
}

export enum BOOKING_TYPE {
  Single = 'Single Trip',
  // Round = 'Round Trip',
  // Multiple = 'Multiple Trips',
}

export enum OCCUPATION {
  Student = 'Student',
  Employed = 'Employed',
  SelfEmployed = 'Self-Employed',
  Unemployed = 'Unemployed',
}

export enum ACCOUNT_ROLE {
  Passenger = 'Passenger',
  Staff = 'Staff',
  Admin = 'Admin',
  SuperAdmin = 'SuperAdmin',
}

export enum DISCOUNT_TYPE {
  Student = 'Student',
  Senior = 'Senior',
  PWD = 'PWD',
  Child = 'Child',
  Infant = 'Infant',
  Driver = 'Driver',
  Passes = 'Passes',
  Helper = 'Helper',
}

export enum PAYMENT_STATUS {
  Pending = 'Waiting For Payment',
  Failed = 'Payment Failed',
  TimedOut = 'Payment Timed Out',
  Success = 'Payment Success',
}

export enum OPERATION_COSTS {
  FuelCosts = 'Fuel Costs',
  CrewWagesAndBenefits = 'Crew Wages and Benefits',
  MaintenanceAndRepairs = 'Maintenance and Repairs',
  PortFees = 'Port Fees',
  Insurance = 'Insurance',
  Utilities = 'Utilities',
  FoodAndCatering = 'Food and Catering',
  CleaningAndSupplies = 'Cleaning and Supplies',
  NavigationAndCommunication = 'Navigation and Communication',
  MarketingAndAdvertising = 'Marketing and Advertising',
  AdministrativeCosts = 'Administrative Costs',
  RegulatoryCompliance = 'Regulatory Compliance',
  Taxes = 'Taxes',
  EntertainmentAndActivities = 'Entertainment and Activities',
  OfficeSpaceAndUtilities = 'Office Space and Utilities',
  CommunicationCosts = 'Communication Costs',
  MarketingAndPromotion = 'Marketing and Promotion',
  TransactionFees = 'Transaction Fees',
  Training = 'Training',
  OfficeSupplies = 'Office Supplies',
  SecurityMeasures = 'Security Measures',
  // MaintenanceAndRepairs //#22 doble with #3
  // Insurance //#23 doble with #5
  Commissions = 'Commissions',
  CustomerSupportServices = 'Customer Support Services',
  ComplianceAndRegulatoryCosts = 'Compliance and Regulatory Costs', //#26 medj doble sa #12
  TechnologyUpgrades = 'Technology Upgrades',
}
