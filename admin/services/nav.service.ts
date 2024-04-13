export const webLinks = {
  Scanner: [
    {
      label: 'Dashboard',
      key: 'dashboard',
    },
  ],
  Staff: [
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
  Admin: [
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
  ],
};
