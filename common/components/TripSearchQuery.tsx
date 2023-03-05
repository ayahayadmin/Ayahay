'use client';
import React from 'react';
import {Button, DatePicker, Form, Radio} from 'antd';
import styles from './Header.module.css';
import Port from "@/common/models/port";
import PortAutoComplete from "@/common/components/form/PortAutoComplete";
import {DEFAULT_NUM_ADULTS, DEFAULT_NUM_CHILDREN, DEFAULT_NUM_INFANTS} from "@/common/constants/form";
import PassengerCount from "@/common/components/form/PassengerCount";

interface TripSearchQueryProps {
  ports: Port[],
}

interface SearchQuery {
  tripType: "single" | "round",
  srcPortId: number,
  destPortId: number,
  depDate: string,
  numAdults: number,
  numChildren: number,
  numInfants: number,
}

export default function TripSearchQuery({ports}: TripSearchQueryProps) {
  const [form] = Form.useForm();
  const srcPortId = Form.useWatch('srcPortId', form);
  const destPortId = Form.useWatch('destPortId', form);

  const submitQuery = (query: any) => {
    console.log(query)
  }

  return (
    <Form
      form={form}
      className={styles.containerFluid}
      initialValues={{
        tripType: "single",
        numAdults: DEFAULT_NUM_ADULTS,
        numChildren: DEFAULT_NUM_CHILDREN,
        numInfants: DEFAULT_NUM_INFANTS,
      }}
      onFinish={submitQuery}
    >
      <div id="search-type">
        <Form.Item name="tripType">
          <Radio.Group>
            <Radio value="single">Single Trip</Radio>
            <Radio value="round">Round Trip</Radio>
          </Radio.Group>
        </Form.Item>
      </div>

      <div id="search-main">
        <Form.Item
          label="Origin Port"
          name="srcPortId"
          rules={[{ required: true, message: "Please select an origin port." }]}
        >
          <PortAutoComplete name="srcPortId" ports={ports} excludePortId={destPortId} />
        </Form.Item>
        <Form.Item
          label="Destination Port"
          name="destPortId"
          rules={[{ required: true, message: "Please select a destination port." }]}
        >
          <PortAutoComplete name="destPortId" ports={ports} excludePortId={srcPortId} />
        </Form.Item>
        <Form.Item
          label="Departure Date"
          name="depDate"
          rules={[{ required: true, message: "Please select a departure date." }]}
        >
          <DatePicker />
        </Form.Item>
        <PassengerCount />
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </div>
    </Form>
  );
}
