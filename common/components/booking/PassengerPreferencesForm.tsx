import {
  Button,
  Divider,
  Form,
  Radio,
  Select,
  Skeleton,
  Typography,
} from 'antd';
import React from 'react';

import Trip from '@/common/models/trip.model';
import {
  CABIN_TYPE,
  getEnumKeyFromValue,
  SEAT_TYPE,
  SEX,
} from '@/common/constants/enum';
import EnumRadio from '@/common/components/form/EnumRadio';

const { Title } = Typography;

interface PassengerPreferencesFormProps {
  trip?: Trip;
  onNextStep?: () => void;
  onPreviousStep?: () => void;
}

export default function PassengerPreferencesForm({
  trip,
  onNextStep,
  onPreviousStep,
}: PassengerPreferencesFormProps) {
  const form = Form.useFormInstance();
  const passengers = Form.useWatch('passengers', form);

  const copyToCompanionPreferences = () => {
    for (let i = 1; i < passengers.length; i++) {
      copyPreferences(0, i);
    }
  };

  const copyPreferences = (srcIndex: number, destIndex: number) => {
    const srcNamePath = ['passengers', srcIndex, 'preferences'];
    const destNamePath = ['passengers', destIndex, 'preferences'];
    form.setFieldValue(destNamePath, form.getFieldValue(srcNamePath));
  };

  return (
    passengers &&
    trip && (
      <>
        <Title level={2}>Passenger Preferences</Title>
        <Form.List name='passengers'>
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
                    >
                      {passengers[index].firstName} has the same preferences as
                      me
                    </Button>
                  )}
                  <Form.Item
                    {...restField}
                    name={[name, 'preferences', 'seat']}
                    label='Seat Preference'
                    colon={false}
                  >
                    <Radio.Group>
                      <Radio value='Any'>Any</Radio>
                      {trip.availableSeatTypes.map((seatType, index) => (
                        <Radio value={seatType} key={index}>
                          {SEAT_TYPE[seatType]}
                        </Radio>
                      ))}
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'preferences', 'cabin']}
                    label='Cabin Preference'
                    colon={false}
                  >
                    <Radio.Group>
                      <Radio value='Any'>Any</Radio>
                      {trip.availableCabins.map((cabin, index) => (
                        <Radio value={cabin} key={index}>
                          {CABIN_TYPE[cabin]}
                        </Radio>
                      ))}
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'preferences', 'meal']}
                    label='Meal Preference'
                    colon={false}
                  >
                    <Select
                      options={[
                        { value: 'Any', label: 'Any' },
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
