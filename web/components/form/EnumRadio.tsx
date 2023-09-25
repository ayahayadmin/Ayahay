import { Form, FormItemProps, Radio } from 'antd';
import React from 'react';

interface EnumProps {
  _enum: any;
  disabled?: boolean;
}

export default function EnumRadio({
  _enum,
  disabled,
  ...formItemProps
}: EnumProps & FormItemProps) {
  return (
    <Form.Item {...formItemProps}>
      <Radio.Group disabled={disabled}>
        {Object.keys(_enum).map((enumKey) => (
          <Radio value={enumKey} key={enumKey}>
            {_enum[enumKey]}
          </Radio>
        ))}
      </Radio.Group>
    </Form.Item>
  );
}
