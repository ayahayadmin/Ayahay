import {Form, InputNumber, Popover} from "antd";
import React from "react";
import {DEFAULT_NUM_ADULTS, DEFAULT_NUM_CHILDREN, DEFAULT_NUM_INFANTS} from "@/common/constants/form";

export default function PassengerCount() {
  const form = Form.useFormInstance();

  const numAdults = Form.useWatch('numAdults', form);
  const numChildren = Form.useWatch('numChildren', form);
  const numInfants = Form.useWatch('numInfants', form);

  const passengerCountPopoverContent = <div>
    <Form.Item name="numAdults">
      <InputNumber />
    </Form.Item>
    <Form.Item name="numChildren">
      <InputNumber />
    </Form.Item>
    <Form.Item name="numInfants">
      <InputNumber />
    </Form.Item>
  </div>

  return (
    <Popover placement="bottomLeft" title="Passenger Count" content={passengerCountPopoverContent} trigger="click">
      <span>{numAdults ?? DEFAULT_NUM_ADULTS} Adults | </span>
      <span>{numChildren ?? DEFAULT_NUM_CHILDREN} Children | </span>
      <span>{numInfants ?? DEFAULT_NUM_INFANTS} Infants</span>
    </Popover>
  )
}
