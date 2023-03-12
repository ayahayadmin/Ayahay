'use client';
import React from 'react';
import styles from './Footer.module.scss';
import {
  FacebookFilled,
  InstagramFilled,
  TwitterSquareFilled,
} from '@ant-design/icons';
import { Col, Input, Row, Space } from 'antd';

export default function Footer() {
  return (
    <footer className={styles['footer']}>
      <div className={styles['cont']}>
        <div className={styles['sub-cont']}>
          <div className={styles['h1']}>Toll Free Customer Care</div>
          <div className={styles['h1']}>
            <a href='#'>+63 999 999 999</a>
          </div>
        </div>
        <div className={styles['sub-cont']}>
          <div className={styles['h1']}>Need live support?</div>
          <div className={styles['h1']}>
            <a href='#'>support@ayahay.com</a>
          </div>
        </div>
        <div className={styles['break']}></div>
        <div className={styles['sub-cont']}>
          <div className={styles['h2']}>Your all-in one travel app</div>
          <div className={styles['button']}>APPLE</div>
          <div className={styles['button']}>GOOGLE</div>
        </div>
        <div className={styles['break']}></div>
        <div className={styles['sub-cont']}>
          <div className={styles['h2']}>Follow us on social media</div>
          <Space>
            <FacebookFilled
              className={styles.icon}
              style={{ fontSize: '28px' }}
            />
            <InstagramFilled
              className={styles.icon}
              style={{ fontSize: '28px' }}
            />
            <TwitterSquareFilled
              className={styles.icon}
              style={{ fontSize: '28px' }}
            />
          </Space>
        </div>
      </div>

      <div className={styles['cont']}>
        <div className={styles['input-field']}>
          <div className={styles['h2']}>Get Updates & More</div>
          <input type='email' title='email' placeholder='Your Email'></input>
          <button type='button'>Subscribe</button>
        </div>
        <div className={styles['break']}></div>
        <div className={styles['sub-cont']}>
          <div className={styles['h2']}>Company</div>
          <ul>
            <li>
              <a href='#'>About Us</a>
            </li>
            <li>
              <a href='#'>Careers</a>
            </li>
            <li>
              <a href='#'>Press</a>
            </li>
          </ul>
        </div>
        <div className={styles['sub-cont']}>
          <div className={styles['h2']}>Support</div>
          <ul>
            <li>
              <a href='#'>Customer Care</a>
            </li>
            <li>
              <a href='#'>Contact</a>
            </li>
            <li>
              <a href='#'>Site Map</a>
            </li>
          </ul>
        </div>
        <div className={styles['sub-cont']}>
          <div className={styles['h2']}>Legal Docs</div>
          <ul>
            <li>
              <a href='#'>Legal Notice</a>
            </li>
            <li>
              <a href='#'>Privacy Policy</a>
            </li>
            <li>
              <a href='#'>Terms and Conditions</a>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles['cont-bottom']}>
        <span>© 2023 Ayahay All rights reserved.</span>
        <ul>
          <li>Privacy</li>
          <li>Terms</li>
          <li>Site Map</li>
        </ul>
      </div>
    </footer>
  );
}
