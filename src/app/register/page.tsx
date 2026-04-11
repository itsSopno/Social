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

            <p className="footerLink" style={{ marginTop: '2rem' }}>
              Part of the setup? <Link href="/login">Log in here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}