import { IPort } from '@ayahay/models';
import { Form, FormItemProps, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import { getPorts } from '@/services/port.service';

const { Option } = Select;

interface PortAutoCompleteProps {
  excludePortId?: string;
}

export default function PortAutoComplete({
  excludePortId,
  ...formItemProps
}: PortAutoCompleteProps & FormItemProps) {
  const [allPorts, setAllPorts] = useState([] as IPort[]);
  const [portOptions, setPortOptions] = useState([] as IPort[]);

  const initializePorts = () => {
    const ports = getPorts();
    setAllPorts(ports);
    setPortOptions(ports);
  };

  useEffect(initializePorts, []);

  const onSearchPort = (value: string) => {
    let filteredPorts: IPort[];
    if (!value) {
      filteredPorts = [];
    } else {
      filteredPorts = allPorts.filter((port) => port.name.indexOf(value) >= 0);
    }
    setPortOptions(filteredPorts);
  };

  return (
    <Form.Item {...formItemProps}>
      <Select
        placeholder='Select Port'
        filterOption={false}
        notFoundContent={null}
        showSearch
        onSearch={onSearchPort}
        bordered={false}
        size='large'
        showArrow={false}
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
