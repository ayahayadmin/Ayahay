'use client';
import React from 'react';
import { Button, DatePicker, Form, Radio } from 'antd';
import ShippingLineFilter from '@/common/components/form/ShippingLineFilter';
import CabinFilter from '@/common/components/form/CabinFilter';

export default function TripSearchFilters() {
  const form = Form.useFormInstance();

  return (
    <div>
      <CabinFilter name='cabinTypes' label='Cabin Types' />
      <ShippingLineFilter name='shippingLineIds' label='Shipping Lines' />
    </div>
  );
}
