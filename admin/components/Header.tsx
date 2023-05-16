'use client';
import React from 'react';
import Image from 'next/image';
import styles from './Header.module.scss';
import AyahayLogo from '/public/assets/ayahay-logo.png';
import Link from 'next/link';

export default function Header() {
  return (
    <nav className={styles['nav-container']}>
      <div className={styles['nav-main']}>
        <Image src={AyahayLogo} alt='Ayahay Logo' height={80} />
        <span className={styles['nav-links']}>
          <ul>
            <li>
              <Link href='/'>Home</Link>
            </li>
            <li>
              <Link href='/trips'>Destinations</Link>
            </li>
            <li>
              <a href='#'>About Us</a>
            </li>
            <li>
              <a href='#'>My Account</a>
            </li>
            <li>
              <a href='#'>Contact</a>
            </li>
          </ul>
        </span>
      </div>

      <div className={styles['nav-buttons']}>
        <Link href='/trips' className='button'>
          Book Now
        </Link>
        <a className='button' href='/auth/signIn'>
          Sign In
        </a>
        <a className='button' href='/auth/register'>
          Register
        </a>
      </div>
    </nav>
  );
}
