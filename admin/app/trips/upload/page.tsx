'use client';
import styles from './page.module.scss'
import { InboxOutlined, DownloadOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { message, Button, Upload, Typography } from 'antd';
import { processTripCsv } from '@/services/csv.service';

const { Title } = Typography;
const { Dragger } = Upload;

export default function UploadTrips() {
  const onUpload = ({file}) => {
    processTripCsv(file);
  };

  return (
    <div className={styles['main-container']}>
      <Title level={1}>Upload Schedule</Title>
      
      <Dragger 
        name='file'
        multiple={true}
        action='https://www.mocky.io/v2/5cc8019d300000980a055e76'
        showUploadList={{showPreviewIcon: false, showDownloadIcon: false, showRemoveIcon: false}}
        customRequest={onUpload}
      >
        <p className="ant-upload-drag-icon">
        <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag schedule .csv file to this area to upload</p>
        <Button onClick={(e) => {e.stopPropagation();}}type="primary" shape="round" icon={<DownloadOutlined />}>
        Download Template
      </Button>
        <p className="ant-upload-hint">
            
        </p>
    </Dragger>

    </div>
    
  );
}
