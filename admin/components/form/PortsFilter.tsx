import { Button, Form } from 'antd';
import PortAutoComplete from '@ayahay/components/form/PortAutoComplete';
import { DebouncedFunc } from 'lodash';
import styles from './PortsFilter.module.scss';

interface PortsFilterProps {
  debounceSearch: DebouncedFunc<() => void>;
}

export default function PortsFilter({ debounceSearch }: PortsFilterProps) {
  const form = Form.useFormInstance();
  const srcPortId = Form.useWatch('srcPortId', form);
  const destPortId = Form.useWatch('destPortId', form);

  return (
    <>
      <PortAutoComplete
        excludePortId={destPortId}
        size='medium'
        labelCol={{ span: 25 }}
        colon={true}
        name='srcPortId'
        label='Origin Port'
        className={styles['input']}
      />
      <PortAutoComplete
        excludePortId={srcPortId}
        size='medium'
        labelCol={{ span: 25 }}
        colon={true}
        name='destPortId'
        label='Destination Port'
        className={styles['input']}
      />
      <Button
        onClick={() => {
          form.resetFields(['srcPortId', 'destPortId']);
          debounceSearch();
        }}
        className={styles['clear-btn']}
      >
        Clear Ports
      </Button>
    </>
  );
}
