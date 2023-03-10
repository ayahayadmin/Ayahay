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

export default function Home() {
  const router = useRouter();
  const [form] = Form.useForm();

  const ports: Port[] = getPorts();

  const redirectToSearchResults = (formValues: any) => {
    const searchQuery: any = {
      tripType: formValues.tripType,
      srcPortId: formValues.srcPortId.toString(),
      destPortId: formValues.destPortId.toString(),
      departureDate: formValues.departureDate.format('YYYY-MM-DD'),
      numAdults: formValues.numAdults.toString(),
      numChildren: formValues.numChildren.toString(),
      numInfants: formValues.numInfants.toString(),
    };

    if (formValues.returnDate) {
      searchQuery.returnDate = formValues.returnDate.format('YYYY-MM-DD');
    }

    const queryParams = new URLSearchParams(searchQuery).toString();
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
        }}
        onFinish={redirectToSearchResults}
      >
        <TripSearchQuery ports={ports} />
      </Form>
      <AboutUsCard />
    </div>
  );
}
