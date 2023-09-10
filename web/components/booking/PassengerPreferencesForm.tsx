import { Button, Divider, Form, Radio, Select, Typography } from 'antd';
import React from 'react';
import { useTripFromSearchParams } from '@/hooks/trip';

const { Title } = Typography;

interface PassengerPreferencesFormProps {
  onNextStep?: () => void;
  onPreviousStep?: () => void;
}

export default function PassengerPreferencesForm({
  onNextStep,
  onPreviousStep,
}: PassengerPreferencesFormProps) {
  const { trip } = useTripFromSearchParams();
  const form = Form.useFormInstance();
  const passengers = Form.useWatch('passengers', form);

  const copyToCompanionPreferences = () => {
    for (let i = 1; i < passengers.length; i++) {
      copyPreferences(0, i);
    }
  };

  const copyPreferences = (srcIndex: number, destIndex: number) => {
    const srcNamePath = ['preferences', srcIndex];
    const destNamePath = ['preferences', destIndex];
    form.setFieldValue(destNamePath, form.getFieldValue(srcNamePath));
  };

  return (
    passengers &&
    trip && (
      <>
        <Title level={2}>Passenger Preferences</Title>
        <Form.List name='preferences'>
          {(fields, _) => (
            <>
              {fields.map(({ key, name, ...restField }, index) => (
                <div key={key}>
                  <Divider>
                    {`Preferences for ${passengers[index].firstName} ${passengers[index].lastName}`}
                  </Divider>
                  {index > 0 && (
                    <Button
                      type='link'
                      onClick={() => copyPreferences(0, index)}
                      style={{ whiteSpace: 'normal' }}
                    >
                      {passengers[index].firstName} has the same preferences as
                      me
                    </Button>
                  )}
                  {trip.availableSeatTypes.length > 0 && (
                    <Form.Item
                      {...restField}
                      name={[name, 'seatTypeId']}
                      label='Seat Preference'
                      colon={false}
                    >
                      <Radio.Group>
                        <Radio value={undefined}>Any</Radio>
                        {trip.availableSeatTypes.map((seatType, index) => (
                          <Radio value={seatType} key={index}>
                            {seatType}
                          </Radio>
                        ))}
                      </Radio.Group>
                    </Form.Item>
                  )}
                  {trip.availableCabins.filter(
                    (tripCabin) => tripCabin.availablePassengerCapacity > 0
                  ).length > 0 && (
                    <Form.Item
                      {...restField}
                      name={[name, 'cabinTypeId']}
                      label='Cabin Preference'
                      colon={false}
                    >
                      <Radio.Group>
                        <Radio value={undefined}>Any</Radio>
                        {trip.availableCabins
                          .filter(
                            (tripCabin) =>
                              tripCabin.availablePassengerCapacity > 0
                          )
                          .map((tripCabin, index) => (
                            <Radio
                              value={tripCabin.cabin?.cabinTypeId}
                              key={index}
                            >
                              {tripCabin.cabin?.cabinType?.name}
                            </Radio>
                          ))}
                      </Radio.Group>
                    </Form.Item>
                  )}
                  <Form.Item
                    {...restField}
                    name={[name, 'meal']}
                    label='Meal Preference'
                    colon={false}
                  >
                    <Select
                      placeholder={'None'}
                      options={[
                        ...trip.meals.map((meal) => ({
                          value: meal,
                          label: meal,
                        })),
                      ]}
                    />
                  </Form.Item>
                  {index === 0 && passengers.length > 1 && (
                    <Button
                      type='link'
                      onClick={() => copyToCompanionPreferences()}
                      style={{ whiteSpace: 'normal' }}
                    >
                      My companions all have the same seat preferences
                    </Button>
                  )}
                </div>
              ))}
            </>
          )}
        </Form.List>

        <div>
          <Button type='primary' onClick={() => onNextStep && onNextStep()}>
            Next
          </Button>
          <Button
            style={{ margin: '0 8px' }}
            onClick={() => onPreviousStep && onPreviousStep()}
          >
            Previous
          </Button>
        </div>
      </>
    )
  );
}
