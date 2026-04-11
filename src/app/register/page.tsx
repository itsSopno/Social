"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import styles from "./register.module.scss";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("https://t-mark-4.vercel.app/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error("Server communication error. Please try again.");
      }

      if (!res.ok) throw new Error(data.message || "Registration failed");

      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authWrapper}>
      {/* Cinematic Background Elements */}
      <div className={styles.bgGlow} />

      <div className={styles.container}>
        {/* Left Side: Branding/Philosophy */}
        <div className={styles.infoSide}>
          <div className={styles.brand}>
            <h2 className={styles.logo}>SINNERS<span className={styles.dot}>.</span></h2>
          </div>
          <div className={styles.heroText}>
            <h1>Join the <br /><span>High-Performance</span> <br />Circle<span className={styles.italic}>.</span></h1>
            <p>Access exclusive peripherals, driver-grade tech, and a community built for speed.</p>
          </div>

          {/* Demo Credential Box */}
          <div className={styles.demoBox}>
            <span className={styles.demoLabel}>Quick Start Demo</span>
            <div className={styles.demoItem}><span>Name :</span>Studio Sinners</div>
            <div className={styles.demoItem}><span>Email:</span>admin@user</div>
            <div className={styles.demoItem}><span>Pass:</span>zxc5566ed</div>
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className={styles.formSide}>
          <div className={styles.formCard}>
            <div className={styles.header}>
              <h2>Create Account</h2>
              <p>Start your journey into the ecosystem.</p>
            </div>

            {error && <div className={styles.errorBanner}>{error}</div>}

            <form onSubmit={handleRegister} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Lando Norris"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="lando@mclaren.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? "Initializing..." : "Register Now"}
              </button>
            </form>

            <div className={styles.divider}><span>OR JOIN WITH</span></div>

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
              Part of the setup? <Link href="/login">Log in here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}