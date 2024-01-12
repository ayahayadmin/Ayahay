'use client';
import { Button, Form, Typography } from 'antd';
import styles from './page.module.scss';
import dayjs from 'dayjs';
import Disbursements from '@/components/form/Disbursements';
import { createDisbursements } from '@/services/disbursement.service';
import { useAuthGuard } from '@/hooks/auth';

const { Title } = Typography;

export default function DisbursementPage() {
  useAuthGuard(['Staff', 'Admin', 'SuperAdmin']);
  const handleDisbursementSubmit = async (values: any) => {
    if (values.disbursement.length === 0) {
      return;
    }
    await createDisbursements(values.disbursement);
  };

  return (
    <div className={styles['main-container']}>
      <Title level={1} style={{ fontSize: 25 }}>
        Disbursements
      </Title>
      <Form
        initialValues={{
          disbursement: [{ date: dayjs() }],
        }}
        onFinish={handleDisbursementSubmit}
      >
        <Disbursements />
        <div>
          <Button type='primary' htmlType='submit'>
            Submit
          </Button>
        </div>
      </Form>
    </div>
  );
}
