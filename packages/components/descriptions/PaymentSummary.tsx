import { IBookingPaymentItem } from '@ayahay/models';
import Table, { ColumnsType } from 'antd/es/table';
import React from 'react';

interface PaymentSummaryProps {
  paymentItems?: IBookingPaymentItem[];
}

const paymentItemColumns: ColumnsType<IBookingPaymentItem> = [
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
    render: (data) => {
      return `₱${data}`;
    },
  },
];

const paymentItemTotal = (paymentItems: readonly IBookingPaymentItem[]) => {
  let totalPrice = 0;
  paymentItems.forEach((item) => (totalPrice += item.price));

  return (
    <Table.Summary.Row>
      <Table.Summary.Cell index={0}>
        <strong>Total</strong>
      </Table.Summary.Cell>
      <Table.Summary.Cell index={1}>
        <strong>₱{totalPrice}</strong>
      </Table.Summary.Cell>
    </Table.Summary.Row>
  );
};

export default function PaymentSummary({ paymentItems }: PaymentSummaryProps) {
  return (
    <Table
      columns={paymentItemColumns}
      dataSource={paymentItems}
      pagination={false}
      loading={paymentItems === undefined}
      tableLayout='fixed'
      summary={paymentItemTotal}
      rowKey={(paymentItem) => paymentItem.id}
    ></Table>
  );
}
