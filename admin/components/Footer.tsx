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
    <footer className={styles['foot-base']}>
        <div className={styles['main-container']}>
            <div className={styles['left-sub-container']}>
                <div className={styles['left-col-card']}>
                    <div className={styles['contact-card']}>
                        <div className={styles['contact-call']}>
                            <h1>Toll Free Customer Care</h1>
                            <h2><a href="#">+(999) 999 999</a></h2>
                        </div>
                        <div className={styles['contact-email']}>
                            <h1>Need live support?</h1>
                            <h2><a href="#">support@ayahay.com</a></h2>
                        </div>
                    </div>
                </div>
                <h3>Your all-in-one travel app</h3>
                <div className={styles['left-col-card']}>
                    <div className={styles['download-card']}>
                        <div className={styles['download-button']}>Download
                            <div className={styles['app-store']}>Apple</div>
                        </div>
                        <div className={styles['download-button']}>Download
                            <div className={styles['app-store']}>Google</div>
                        </div>
                    </div>
                </div>
                <h3>Follow us on social media</h3>
                <div className={styles['left-col-card']}>
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
            <div className={styles['right-sub-container']}>
                <h1>Get Updates & More</h1>
                <div className={styles['right-col-card']}>
                    <div className={styles['email-input']}>
                        <input type="email" title="email" placeholder="Your Email"></input>
                        <button type="button">Subscribe</button>
                    </div>
                </div>
                <div className={styles['right-col-card']}>
                    <div className={styles['nav-container']}>
                        <div className={styles['nav-card']}>
                            <h2>Company</h2>
                            <ul>
                                <li><a href="#">About Us</a></li>
                                <li><a href="#">Careers</a></li>
                                <li><a href="#">Press</a></li>
                            </ul>
                        </div>
                        <div className={styles['nav-card']}>
                            <h2>Support</h2>
                            <ul>
                                <li><a href="#">Customer Care</a></li>
                                <li><a href="#">Contact</a></li>
                                <li><a href="#">Site Map</a></li>
                            </ul>
                        </div>
                        <div className={styles['nav-card']}>
                            <h2>Legal Docs</h2>
                            <ul>
                                <li><a href="#">Legal Notice</a></li>
                                <li><a href="#">Privacy Policy</a></li>
                                <li><a href="#">Terms and Conditions</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles['bot-sub-container']}>
                <span>© 2023 Ayahay All rights reserved.</span>
                <ul>
                    <li>Privacy</li>
                    <li>Terms</li>
                    <li>Site Map</li>
                </ul>
            </div>
        </div>
    </footer>
  );
}
