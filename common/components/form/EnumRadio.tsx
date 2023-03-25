import { Form, FormItemProps, Radio } from 'antd';
import React from 'react';

interface EnumProps {
  _enum: any;
  children?: React.ReactNode;
}

export default function EnumRadio({
  _enum,
  children,
  ...formItemProps
}: EnumProps & FormItemProps) {
  return (
    <Form.Item {...formItemProps}>
      <Radio.Group>
        {children}
        {Object.keys(_enum).map((enumKey) => (
          <Radio value={enumKey} key={enumKey}>
            {_enum[enumKey]}
          </Radio>
        ))}
      </Radio.Group>
    </Form.Item>
  );
}
