'use client';
import React from 'react';
import Image from 'next/image';
import styles from './Header.module.scss';
import AyahayLogo from '/public/assets/ayahay_logo.png';

export default function Header() {
  return (
    <nav className={styles['nav']}>
      <div className={styles['nav-main']}>
        <Image src={AyahayLogo} alt="Ayahay Logo" height={80}/>
        <span className={styles['nav-links']}>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">Destinations</a></li>
            <li><a href="#">About Us</a></li>
            <li><a href="#">My Account</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </span>
      </div>

      <div className={styles['nav-buttons']}>
        <a className="button" href="#">Book Now</a>
        <a className="button" href="#">Sign In</a>
        <a className="button" href="#">Register</a>
      </div>
    </nav>
  );
}
