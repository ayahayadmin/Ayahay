import { IPort } from '@ayahay/models';
import { Form, FormItemProps, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import { getPorts } from '@ayahay/services/port.service';

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

  useEffect(() => {
    initializePorts();
  }, []);

  const initializePorts = async () => {
    const ports = (await getPorts()) ?? [];
    setAllPorts(ports);
    setPortOptions(ports);
  };

  const onSearchPort = (value: string) => {
    let filteredPorts: IPort[];
    if (!value) {
      filteredPorts = allPorts;
    } else {
      filteredPorts = allPorts.filter(
        (port) => port.name.toLowerCase().indexOf(value.toLowerCase()) >= 0
      );
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
        onDropdownVisibleChange={() => onSearchPort('')}
        bordered={false}
        size='large'
        showArrow={false}
        allowClear={true}
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
