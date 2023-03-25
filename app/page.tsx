'use client';
import AboutUsCard from '@/common/components/AboutUsCard';
import TripSearchQuery from '@/common/components/search/TripSearchQuery';
import {
  DEFAULT_NUM_ADULTS,
  DEFAULT_NUM_CHILDREN,
  DEFAULT_NUM_INFANTS,
  DEFAULT_TRIP_TYPE,
} from '@/common/constants/default';
import { Form } from 'antd';
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
        initialValues={{
          tripType: DEFAULT_TRIP_TYPE,
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
