import React from 'react';
import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useClientPagination } from '@ayahay/hooks';

interface PassengerName {
  key?: number;
  name: string;
}

interface PassengerNamesModalProps {
  passengerNames: PassengerName[];
}

const passengerNameColumns: ColumnsType<PassengerName> = [
  {
    title: 'Not Checked-in',
    dataIndex: 'name',
    key: 'name',
  },
];

export function PassengerNamesModal({
  passengerNames,
}: PassengerNamesModalProps) {
  const { dataInPage, antdPagination, antdOnChange } =
    useClientPagination<PassengerName>(passengerNames);

  return (
    <article
      style={{ minWidth: '260px', maxHeight: '360px', overflowY: 'auto' }}
    >
      <Table
        columns={passengerNameColumns}
        dataSource={dataInPage}
        pagination={antdPagination}
        onChange={antdOnChange}
        size='small'
      />
    </article>
  );
}
