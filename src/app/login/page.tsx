"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./login.module.scss";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Invalid credentials. Please verify and try again.");
      } else {
        router.push("/Community");
      }
    } catch (err) {
      setError("A connection error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authWrapper}>
      <div className={styles.bgGlow} />

      <div className={styles.container}>
        {/* Left Side: Brand & Entry Text */}
        <div className={styles.infoSide}>
          <div className={styles.brand}>
            <h2 className={styles.logo}>SINNERS<span className={styles.dot}>.</span></h2>
          </div>
          <div className={styles.heroText}>
            <h1>Back in <br /><span>The Lead</span> <br />Position<span className={styles.italic}>.</span></h1>
            <p>Your workspace is ready. Log in to manage your high-fidelity gear and custom setups.</p>
          </div>

          {/* Demo Credential Box */}
          <div className={styles.demoBox}>
            <span className={styles.demoLabel}>Demo Access</span>
            <div className={styles.demoItem}><span>User:</span>admin@user</div>
            <div className={styles.demoItem}><span>Key:</span>zxc5566ed</div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className={styles.formSide}>
          <div className={styles.formCard}>
            <div className={styles.header}>
              <h2>Authenticate</h2>
              <p>Secure access to your digital ecosystem.</p>
            </div>

            {error && <div className={styles.errorBanner}>{error}</div>}

            <form onSubmit={handleCredentialsLogin} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="driver@performance.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Security Key</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? "Verifying..." : "Access Community"}
              </button>
            </form>

            <p className={styles.footerLink}>
              New to the team? <Link href="/register">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}