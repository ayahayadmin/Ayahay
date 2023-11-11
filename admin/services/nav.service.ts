export const webLinks = {
  Staff: [
    {
      label: 'Trips',
      key: 'trips',
    },
    {
      label: 'Dashboard',
      key: 'dashboard',
    },
    {
      label: 'Download Bookings',
      key: 'download/bookings',
    },
  ],
  Admin: [
    {
      label: 'Trips',
      key: 'trips',
    },
    {
      label: 'Dashboard',
      key: 'dashboard',
    },
    {
      label: 'Reporting',
      key: 'reporting',
    },
    {
      label: 'Upload',
      key: 'upload',
      children: [
        {
          label: 'Upload Trips',
          key: 'upload/trips',
        },
        {
          label: 'Upload Bookings',
          key: 'upload/bookings',
        },
      ],
    },
    {
      label: 'Download Bookings',
      key: 'download/bookings',
    },
  ],
};
