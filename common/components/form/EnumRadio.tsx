import { Form, FormItemProps, Radio } from 'antd';
import React from 'react';

interface EnumProps {
  _enum: any;
}

export default function EnumRadio({
  _enum,
  ...formItemProps
}: EnumProps & FormItemProps) {
  return (
    <Form.Item {...formItemProps}>
      <Radio.Group>
        {Object.keys(_enum).map((enumKey) => (
          <Radio value={enumKey} key={enumKey}>
            {_enum[enumKey]}
          </Radio>
        ))}
      </Radio.Group>
    </Form.Item>
  );
}
