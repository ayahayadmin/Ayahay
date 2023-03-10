'use client';

import Port from '@/common/models/port';
import { Form, FormItemProps, Select } from 'antd';
import React, { useState } from 'react';

const { Option } = Select;

interface PortAutoCompleteProps {
  ports: Port[];
  excludePortId?: string;
}

export default function PortAutoComplete({
  ports,
  excludePortId,
  ...formItemProps
}: PortAutoCompleteProps & FormItemProps) {
  const [portOptions, setPortOptions] = useState(ports);

  const onSearchPort = (value: string) => {
    let filteredPorts: Port[];
    if (!value) {
      filteredPorts = [];
    } else {
      filteredPorts = ports.filter((port) => port.name.indexOf(value) >= 0);
    }
    setPortOptions(filteredPorts);
  };

  return (
    <Form.Item {...formItemProps}>
      <Select
        placeholder='Select Port'
        filterOption={false}
        notFoundContent={null}
        allowClear
        showSearch
        onSearch={onSearchPort}
      >
        {portOptions
          .filter((port) => !(excludePortId && port.id === +excludePortId))
          .map((port) => (
            <Option key={port.id} value={port.id}>
              {port.name}
            </Option>
          ))}
      </Select>
    </Form.Item>
  );
}
