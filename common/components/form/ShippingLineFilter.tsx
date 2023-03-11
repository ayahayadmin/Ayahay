'use client';

import { Form, FormItemProps, Select, SelectProps } from 'antd';
import React, { useEffect, useState } from 'react';
import { getShippingLines } from '@/common/services/shipping-line.service';
import ShippingLine from '@/common/models/shipping-line';

const { Option } = Select;

export default function ShippingLineFilter({
  ...formItemProps
}: FormItemProps) {
  const [allShippingLines, setAllShippingLines] = useState(
    [] as ShippingLine[]
  );
  const [shippingLineOptions, setShippingLineOptions] = useState(
    [] as ShippingLine[]
  );

  const initializeShippingLines = () => {
    const shippingLines = getShippingLines();
    setAllShippingLines(shippingLines);
    setShippingLineOptions(shippingLines);
  };

  useEffect(initializeShippingLines, []);

  const onSearchShippingLine = (value: string) => {
    let filteredShippingLines: ShippingLine[];
    if (!value) {
      filteredShippingLines = allShippingLines;
    } else {
      filteredShippingLines = allShippingLines.filter(
        (port) => port.name.toLowerCase().indexOf(value.toLowerCase()) >= 0
      );
    }
    setShippingLineOptions(filteredShippingLines);
  };

  return (
    <Form.Item {...formItemProps}>
      <Select
        mode='multiple'
        placeholder='Filter by Shipping Line'
        filterOption={false}
        notFoundContent={null}
        showSearch
        onSearch={onSearchShippingLine}
        onSelect={() => setShippingLineOptions(allShippingLines)}
      >
        {shippingLineOptions.map((port) => (
          <Option key={port.id} value={port.id}>
            {port.name}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
}
