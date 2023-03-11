'use client';

import Port from '@/common/models/port';
import { Form, FormItemProps, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import { getPorts } from '@/common/services/port.service';

const { Option } = Select;

interface PortAutoCompleteProps {
  excludePortId?: string;
}

export default function PortAutoComplete({
  excludePortId,
  ...formItemProps
}: PortAutoCompleteProps & FormItemProps) {
  const form = Form.useFormInstance();

  const [allPorts, setAllPorts] = useState([] as Port[]);
  const [portOptions, setPortOptions] = useState([] as Port[]);
  const [initialPortOption, setInitialPortOption] = useState<any>(undefined);

  const initializePorts = () => {
    const ports = getPorts();
    setAllPorts(ports);
    setPortOptions(ports);
    if (formItemProps.name === undefined) {
      return;
    }

    const portId = form.getFieldValue(formItemProps.name);
    const defaultPort = ports.find((port) => port.id === portId);
    if (defaultPort === undefined) {
      return;
    }

    setInitialPortOption({ value: defaultPort.id, label: defaultPort.name });
  };

  useEffect(initializePorts, []);

  const onSearchPort = (value: string) => {
    let filteredPorts: Port[];
    if (!value) {
      filteredPorts = [];
    } else {
      filteredPorts = allPorts.filter((port) => port.name.indexOf(value) >= 0);
    }
    setPortOptions(filteredPorts);
  };

  return (
    <Form.Item {...formItemProps} initialValue={initialPortOption}>
      <Select
        placeholder='Select Port'
        filterOption={false}
        notFoundContent={null}
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
