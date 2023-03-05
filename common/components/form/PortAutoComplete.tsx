'use client';

import Port from "@/common/models/port";
import {Form, Select} from "antd";
import React, {useState} from "react";

const { Option } = Select;

interface PortAutoCompleteProps {
  name: string,
  ports: Port[];
  excludePortId?: string;
}

export default function PortAutoComplete({name, ports, excludePortId}: PortAutoCompleteProps) {
  const form = Form.useFormInstance();
  const [portOptions, setPortOptions] = useState(ports);

  const onSearchPort = (value: string) => {
    let filteredPorts: Port[];
    if (!value) {
      filteredPorts = [];
    } else {
      filteredPorts = ports.filter(port => port.name.indexOf(value) >= 0);
    }
    setPortOptions(filteredPorts);
  };

  const onSelectPort = (value: number, _: any) => {
    form.setFieldValue(name, value);
  }

  return <Select placeholder="Select Port" filterOption={false} notFoundContent={null} allowClear showSearch
                 onSearch={onSearchPort} onSelect={onSelectPort} maxTagCount={5}>
    {portOptions
      .filter(port => !(excludePortId && port.id === +excludePortId))
      .map(port => <Option key={port.id} value={port.id}>{port.name}</Option>)
    }
  </Select>
}
