import React from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

export const Footer = () => (
  <footer className={styles.footerContainer}>
    <div className={styles.linksGroup}>
      <Link to="/terms" className={styles.footerLink}>Terms</Link>
      <span>·</span>
      <Link to="/privacy" className={styles.footerLink}>Privacy</Link>
      <span>·</span>
      <Link to="/faq" className={styles.footerLink}>FAQ</Link>
    </div>
    <div className={styles.copyright}>
      © WatchParty — Watch videos together with friends anywhere.
    </div>
  </footer>
);
