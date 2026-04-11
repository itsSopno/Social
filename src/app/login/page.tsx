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
        router.push("/Store");
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
                {loading ? "Verifying..." : "Access Dashboard"}
              </button>
            </form>

            <div className={styles.divider}><span>SOCIAL AUTH</span></div>

            <button
              className={styles.googleBtn}
              onClick={() => signIn("google", { callbackUrl: "/Store" })}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.14-4.53z" />
              </svg>
              Google Account
            </button>

            <p className={styles.footerLink}>
              New to the team? <Link href="/register">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}