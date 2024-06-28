const adminLinks = [
  {
    label: 'Dashboard',
    key: 'dashboard',
  },
  {
    label: 'Trips',
    key: 'trips',
  },
  {
    label: 'Vessels',
    key: 'ships',
  },
  {
    label: 'Reporting',
    key: 'reporting',
    children: [
      {
        label: 'Cancelled Trips',
        key: 'reporting/cancelled-trips',
      },
      {
        label: 'Collect Bookings',
        key: 'reporting/collect-bookings',
      },
      {
        label: 'Summary Sales',
        key: 'reporting/summary',
      },
    ],
  },
  {
    label: 'Vouchers',
    key: 'vouchers',
  },
  {
    label: 'Bookings',
    key: 'bookings',
    children: [
      {
        label: 'Search Bookings',
        key: 'search',
      },
      {
        label: 'Download Bookings',
        key: 'download/bookings',
      },
      {
        label: 'Upload Bookings',
        key: 'upload/bookings',
      },
    ],
  },
  {
    label: 'Rates',
    key: 'rate-tables',
  },
];

export const webLinks: {
  [role: string]: { label: string; key: string; children?: any[] }[];
} = {
  ShippingLineScanner: [
    {
      label: 'Dashboard',
      key: 'dashboard',
    },
  ],
  ShippingLineStaff: [
    {
      label: 'Trips',
      key: 'trips',
    },
    {
      label: 'Vessels',
      key: 'ships',
    },
    {
      label: 'Dashboard',
      key: 'dashboard',
    },
    {
      label: 'Reporting',
      key: 'reporting',
      children: [
        {
          label: 'Cancelled Trips',
          key: 'reporting/cancelled-trips',
        },
        {
          label: 'Collect Bookings',
          key: 'reporting/collect-bookings',
        },
        {
          label: 'Summary Sales',
          key: 'reporting/summary',
        },
      ],
    },
    {
      label: 'Bookings',
      key: 'bookings',
      children: [
        {
          label: 'Download Bookings',
          key: 'download/bookings',
        },
        {
          label: 'Search Bookings',
          key: 'search',
        },
      ],
    },
  ],
  TravelAgencyStaff: [
    {
      label: 'Trips',
      key: 'trips',
    },
  ],
  TravelAgencyAdmin: [
    {
      label: 'Rates',
      key: 'rate-tables',
    },
  ],
  ShippingLineAdmin: adminLinks,
  SuperAdmin: adminLinks,
};

// what role-specific links to show when account icon on top right is clicked
export const accountLinks: {
  [role: string]: { label: string; href: string }[];
} = {
  ShippingLineStaff: [
    {
      label: 'My Shipping Line',
      href: '/shipping-lines/mine',
    },
  ],
  ShippingLineAdmin: [
    {
      label: 'My Shipping Line',
      href: '/shipping-lines/mine',
    },
  ],
  TravelAgencyStaff: [
    { label: 'My Travel Agency', href: '/travel-agencies/mine' },
  ],
  TravelAgencyAdmin: [
    { label: 'My Travel Agency', href: '/travel-agencies/mine' },
  ],
};
