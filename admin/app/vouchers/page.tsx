'use client';

import { useAuthGuard } from '@/hooks/auth';
import { Button, Table, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { IVoucher } from '@ayahay/models';
import { usePaginatedData } from '@ayahay/hooks';
import {
  createVoucher as _createVoucher,
  getVouchers,
} from '@/services/voucher.service';
import { ColumnsType } from 'antd/es/table';
import CreateVoucherModal from '@/components/modal/CreateVoucherModal';

const { Title } = Typography;

const voucherColumns: ColumnsType<IVoucher> = [
  {
    title: 'Code',
    key: 'code',
    dataIndex: 'code',
  },
  {
    title: 'Description',
    key: 'description',
    dataIndex: 'description',
  },
  {
    title: 'Flat Discount',
    key: 'discountFlat',
    dataIndex: 'discountFlat',
  },
  {
    title: 'Percentage Discount',
    key: 'discountPercent',
    dataIndex: 'discountPercent',
    render: (discountPercent: number) => discountPercent * 100,
  },
  {
    title: 'Expiry Date',
    key: 'expiryIso',
    dataIndex: 'expiryIso',
  },
  {
    title: 'Remaining Uses',
    key: 'remainingUses',
    dataIndex: 'remainingUses',
  },
];

export default function VouchersPage() {
  useAuthGuard(['Admin', 'SuperAdmin']);

  const [createVoucherModalOpen, setCreateVoucherModalOpen] = useState(false);

  const { dataInPage, antdPagination, antdOnChange, resetData } =
    usePaginatedData<IVoucher>(getVouchers, true);

  const createVoucher = async (voucher: IVoucher): Promise<void> => {
    await _createVoucher(voucher);
    setCreateVoucherModalOpen(false);
    resetData();
  };

  return (
    <div style={{ margin: '32px' }}>
      <Title level={1}>Vouchers</Title>
      <Button
        type='primary'
        icon={<PlusOutlined />}
        onClick={() => setCreateVoucherModalOpen(true)}
      >
        Create Voucher
      </Button>
      <Table
        columns={voucherColumns}
        dataSource={dataInPage}
        loading={dataInPage === undefined}
        pagination={antdPagination}
        onChange={antdOnChange}
        rowKey={(voucher) => voucher.code}
      ></Table>
      <CreateVoucherModal
        open={createVoucherModalOpen}
        onCreateVoucher={createVoucher}
        onCancel={() => setCreateVoucherModalOpen(false)}
        width={300}
      />
    </div>
  );
}
