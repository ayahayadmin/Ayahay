import EnumSelect from '@ayahay/components/form/EnumSelect';
import {
  DATE_FORMAT_LIST,
  DATE_PLACEHOLDER,
  OPERATION_COSTS,
} from '@ayahay/constants';
import { Button, DatePicker, Divider, Form, Input, InputNumber } from 'antd';
import dayjs from 'dayjs';

const { TextArea } = Input;

const two_columns_grid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gridRowGap: 10,
  gridColumnGap: 50,
};

interface DisbursementsProps {
  tripDate: string;
}

export default function Disbursements({ tripDate }: DisbursementsProps) {
  return (
    <Form.List name='disbursement'>
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }, index) => (
            <div key={key}>
              <Divider>Disbursement {index + 1}</Divider>
              <div style={two_columns_grid}>
                <Form.Item {...restField} name={[name, 'date']} label='Date'>
                  <DatePicker
                    format={DATE_FORMAT_LIST}
                    placeholder={DATE_PLACEHOLDER}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'officialReceipt']}
                  label='Official Receipt'
                >
                  <TextArea autoSize />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'paidTo']}
                  label='Paid To'
                  rules={[{ required: true, message: 'Missing paid to' }]}
                >
                  <TextArea autoSize />
                </Form.Item>
                <EnumSelect
                  _enum={OPERATION_COSTS}
                  disabled={false}
                  name={[name, 'description']}
                  label='Description'
                  rules={[{ required: true, message: 'Missing description' }]}
                />
                <Form.Item
                  {...restField}
                  name={[name, 'purpose']}
                  label='Purpose'
                  rules={[{ required: true, message: 'Missing purpose' }]}
                >
                  <TextArea autoSize />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'amount']}
                  label='Amount'
                  rules={[{ required: true, message: 'Missing amount' }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </div>
              <Button
                danger
                style={{ float: 'right' }}
                onClick={() => remove(name)}
              >
                Remove Disbursement
              </Button>
            </div>
          ))}

          <Button
            type='dashed'
            onClick={() => add({ date: dayjs(tripDate) })}
            block
          >
            Add Disbursement
          </Button>
        </>
      )}
    </Form.List>
  );
}
