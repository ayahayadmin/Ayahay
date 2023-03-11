'use client';
import AboutUsCard from '@/common/components/AboutUsCard';
import TripSearchQuery from '@/common/components/TripSearchQuery';
import Port from '@/common/models/port';
import styles from '@/common/components/Header.module.scss';
import {
  DEFAULT_NUM_ADULTS,
  DEFAULT_NUM_CHILDREN,
  DEFAULT_NUM_INFANTS,
} from '@/common/constants/form';
import { Form } from 'antd';
import { getPorts } from '@/common/services/port.service';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { buildUrlQueryParamsFromSearchForm } from '@/common/services/search.service';

export default function Home() {
  const router = useRouter();
  const [form] = Form.useForm();

  const redirectToSearchResults = (_: any) => {
    const queryParams = buildUrlQueryParamsFromSearchForm(form);
    router.push(`/trips?${queryParams}`);
  };

  return (
    <div>
      <Form
        form={form}
        className={styles.containerFluid}
        initialValues={{
          tripType: 'single',
          numAdults: DEFAULT_NUM_ADULTS,
          numChildren: DEFAULT_NUM_CHILDREN,
          numInfants: DEFAULT_NUM_INFANTS,
          departureDate: dayjs(),
          returnDate: dayjs(),
        }}
        onFinish={redirectToSearchResults}
      >
        <TripSearchQuery />
      </Form>
      <AboutUsCard />
    </div>
  );
}
