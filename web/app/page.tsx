'use client';
import AboutUsCard from '@/components/AboutUsCard';
import TripSearchQuery from '@/components/search/TripSearchQuery';
import {
  DEFAULT_NUM_ADULTS,
  DEFAULT_NUM_CHILDREN,
  DEFAULT_NUM_INFANTS,
  DEFAULT_TRIP_TYPE,
} from '@ayahay/constants/default';
import { Form } from 'antd';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { buildUrlQueryParamsFromSearchForm } from '@/services/search.service';
import styles from './page.module.scss';

export default function Home() {
  const router = useRouter();
  const [form] = Form.useForm();

  const redirectToSearchResults = (_: any) => {
    const queryParams = buildUrlQueryParamsFromSearchForm(form);
    router.push(`/trips?${queryParams}`);
  };

  return (
    <div id={styles['home-page']}>
      <Form
        form={form}
        initialValues={{
          tripType: DEFAULT_TRIP_TYPE,
          numAdults: DEFAULT_NUM_ADULTS,
          numChildren: DEFAULT_NUM_CHILDREN,
          numInfants: DEFAULT_NUM_INFANTS,
          departureDate: dayjs(),
          returnDate: dayjs(),
        }}
        onFinish={redirectToSearchResults}
        className={styles['landing']}
      >
        <h1>Where Do You Want to Go?</h1>
        <p>Travel around the Philippines</p>
        <TripSearchQuery className={styles['trip-search-query']} />
      </Form>
      <AboutUsCard />
    </div>
  );
}
