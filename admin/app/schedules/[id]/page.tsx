'use client';
import React, { useEffect, useState } from 'react';
import { filter, find, map } from 'lodash';
import { Button, Form, Input, Modal, Select, Space, Table } from 'antd';
import { useRouter } from 'next/navigation';
import {
  IPassenger,
  mockBookingPassengers,
  mockBookings,
} from '@/../packages/models';
import { PlusOutlined } from '@ant-design/icons';
import styles from './page.module.scss';

const { Option } = Select;
const PAGE_SIZE = 10;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 },
  },
};

const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 20, offset: 4 },
  },
};
const OPTIONS = [
  {
    value: 'id', //might change this to referenceNum in the future, will use ID as of now
    label: 'ID',
  },
  {
    value: 'firstName',
    label: 'First Name',
  },
  {
    value: 'lastName',
    label: 'Last Name',
  },
];

export default function BookingList({ params }: any) {
  const router = useRouter();
  const [form] = Form.useForm();
  const [passengersData, setPassengersData] = useState([] as IPassenger[]);
  // const [buttonClicked, setButtonClicked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passengerName, setPassengerName] = useState('');

  const onFinish = (values: any) => {
    //TO DO: search for the passenger given the values
    console.log('Received values of form: ', values);
  };

  const prefixSelector = (
    <Form.Item name='prefix' noStyle>
      <Select style={{ width: 70 }}>
        <Option value='id'>ID</Option>
        <Option value='firstName'>First Name</Option>
        <Option value='lastName'>Last Name</Option>
      </Select>
    </Form.Item>
  );

  const onClickConfirm = (id: number, firstName: string, lastName: string) => {
    //id should be unique, thinking of adding referenceNum property? para yun lang gamitin, pwede syang UUID. For now ID muna
    setPassengerName(`${lastName}, ${firstName}`);
    setIsModalOpen(true);
  };

  const onClickYes = () => {
    //TO DO: Confirm passenger by adding today's date in "checkInDate"
    setIsModalOpen(false);
  };

  const onClickCancel = () => {
    setIsModalOpen(false);
  };

  const columns = [
    {
      title: 'Reference #',
      key: 'referenceNum',
      dataIndex: 'id',
    },
    {
      title: 'Full Name',
      key: 'firstName',
      render: (text: any, record: any) => (
        <span>
          {record.lastName}, {record.firstName}
        </span>
      ),
    },
    {
      title: 'Occupation',
      key: 'occupation',
      dataIndex: 'occupation',
    },
    {
      title: 'Birthdate',
      key: 'birthdayIso',
      dataIndex: 'birthdayIso',
    },
    {
      key: 'action',
      render: (text: any, record: any) => (
        <Space size='middle'>
          <Button
            type='primary'
            size='large'
            onClick={() =>
              onClickConfirm(record.id, record.firstName, record.lastName)
            }
          >
            Confirm
          </Button>
        </Space>
      ),
    },
  ];

  // {/* shipId=${record.ship.id}&cabinType=${record.ship.cabins[0].type}&floor=${record.ship.cabins[0].name} */}
  //           {/* router.push(
  //               `/admin/details?shipId=${record.ship.id}&cabinType=${record.ship.cabins[0].type}`
  //             ) */}
  useEffect(() => {
    // const bookingPassengers = getBookingPassengersByTripId(tripId); // still waiting for Carlos to update
    // console.log(bookingPassengers);

    const bookingsTemp = filter(mockBookings, { tripId: Number(params.id) }); //pretending this doesn't exists
    const bookingPassengers = map(bookingsTemp, (booking) => {
      return find(mockBookingPassengers, { bookingId: booking.id });
    });

    const passengers = map(
      bookingPassengers,
      (bookingPassenger) => bookingPassenger?.passenger!
    );
    setPassengersData(passengers);
  }, []);

  return (
    <div>
      <div>
        <Form
          name='dynamic_form_item'
          // {...formItemLayoutWithOutLabel}
          onFinish={onFinish}
          style={{ maxWidth: 600 }}
        >
          <Form.List name='queries'>
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map((field, index) => (
                  <Form.Item required={false} key={field.key}>
                    <Space.Compact style={{ width: '100%' }}>
                      <Form.Item
                        name={[field.name, 'value']}
                        // label='ID'
                        // rules={[
                        //   { required: true, message: 'Please input your phone number!' },
                        // ]}
                      >
                        <Input
                          addonBefore={
                            <Form.Item name={[field.name, 'type']} noStyle>
                              <Select options={OPTIONS} />
                            </Form.Item>
                          }
                          // style={{ width: '60%' }}
                        />
                      </Form.Item>
                      {fields.length > 1 ? (
                        <Button
                          type='primary'
                          onClick={() => remove(field.name)}
                          danger
                        >
                          Remove
                        </Button>
                      ) : null}
                    </Space.Compact>
                  </Form.Item>
                ))}
                <Form.Item>
                  <Button
                    type='dashed'
                    onClick={() => add()}
                    style={{ width: '60%' }}
                    icon={<PlusOutlined />}
                  >
                    Add field
                  </Button>
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              </>
            )}
          </Form.List>
          <Form.Item>
            <Button type='primary' htmlType='submit'>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
      <div>
        <Table
          columns={columns}
          dataSource={passengersData}
          // className={styles.searchResult}
          pagination={false}
        ></Table>
      </div>
      <div>
        <Modal
          title='Basic Modal'
          open={isModalOpen}
          onOk={onClickYes}
          onCancel={onClickCancel}
        >
          <p>Confirm attendance of {passengerName}?</p>
        </Modal>
      </div>
      {/* {buttonClicked && <Seats rowData={rowData} />} */}
    </div>
  );
}
