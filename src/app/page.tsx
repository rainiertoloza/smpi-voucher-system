import Link from "next/link";
import styles from "./page.module.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SMPI Voucher System - Claim Your Exclusive Offer",
  description: "Get your exclusive SMPI voucher now. Fast, secure, and easy voucher claiming system.",
};

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>Get Your Exclusive Voucher</h1>
        <p className={styles.subtitle}>Claim your special SMPI offer now and enjoy amazing benefits!</p>
        <Link href="/claim" className={styles.cta} prefetch={true}>Claim Now</Link>
      </main>
    </div>
  );
}
