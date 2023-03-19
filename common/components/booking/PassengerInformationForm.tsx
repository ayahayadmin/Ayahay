import { Button, DatePicker, Divider, Form, Input, Radio } from 'antd';
import React from 'react';
import { CIVIL_STATUS, SEX } from '@/common/constants/enum';
import EnumRadio from '@/common/components/form/EnumRadio';

export default function PassengerInformationForm() {
  const form = Form.useFormInstance();

  return (
    <Form.List name='passengers'>
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }, index) => (
            <div key={key}>
              <Divider>Passenger {index + 1}</Divider>
              <Form.Item
                {...restField}
                name={[name, 'firstName']}
                label='First Name'
                colon={false}
                rules={[{ required: true, message: 'Missing first name' }]}
              >
                <Input placeholder='First Name' />
              </Form.Item>
              <Form.Item
                {...restField}
                name={[name, 'lastName']}
                label='Last Name'
                colon={false}
                rules={[{ required: true, message: 'Missing last name' }]}
              >
                <Input placeholder='Last Name' />
              </Form.Item>
              <Form.Item
                {...restField}
                name={[name, 'occupation']}
                label='Occupation'
                colon={false}
                rules={[{ required: true, message: 'Missing occupation' }]}
              >
                <Input placeholder='Doctor, Lawyer, or Failure' />
              </Form.Item>
              <EnumRadio
                _enum={SEX}
                {...restField}
                name={[name, 'sex']}
                label='Sex'
                colon={false}
                rules={[{ required: true, message: 'Missing sex' }]}
              />
              <EnumRadio
                _enum={CIVIL_STATUS}
                {...restField}
                name={[name, 'civilStatus']}
                label='Civil Status'
                colon={false}
                rules={[{ required: true, message: 'Missing civil status' }]}
              />
              <Form.Item
                {...restField}
                name={[name, 'birthday']}
                label='Date of Birth'
                colon={false}
                rules={[{ required: true, message: 'Missing date of birth' }]}
              >
                <DatePicker format='YYYY/MM/DD' placeholder='YYYY/MM/DD' />
              </Form.Item>
              <Form.Item
                {...restField}
                name={[name, 'address']}
                label='Address'
                colon={false}
                rules={[{ required: true, message: 'Missing address' }]}
              >
                <Input placeholder='Region, Province, Municipality' />
              </Form.Item>
              <Form.Item
                {...restField}
                name={[name, 'nationality']}
                label='Nationality'
                colon={false}
                rules={[{ required: true, message: 'Missing nationality' }]}
              >
                <Input placeholder='Filipino, Chinese, American, etc.' />
              </Form.Item>
              {index > 0 && (
                <Button onClick={() => remove(name)}>Remove Passenger</Button>
              )}
            </div>
          ))}
          <Form.Item>
            <Button type='dashed' onClick={() => add({})} block>
              Add Passenger
            </Button>
          </Form.Item>
        </>
      )}
    </Form.List>
  );
}
