"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { requestOtp, verifyOtp } from "@/lib/api";
import { isValidIndianPhone } from "@/lib/validation";

const inputClass =
  "w-full px-4 py-2.5 rounded-lg border border-earth-300 text-earth-600 placeholder-earth-400 text-sm focus:outline-none focus:ring-2 focus:ring-earth-400/50 focus:border-earth-500";

export type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const { setToken } = useAuth();
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasApi = !!process.env.NEXT_PUBLIC_API_URL;

  const handleRequestOtp = async () => {
    setError("");
    if (!phone.trim()) {
      setError("Enter your phone number");
      return;
    }
    if (!isValidIndianPhone(phone.trim())) {
      setError("Enter a valid 10-digit Indian mobile number");
      return;
    }
    setLoading(true);
    try {
      await requestOtp(phone.trim());
      setOtpSent(true);
      setOtpCode("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    if (!otpCode.trim() || otpCode.length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtp(phone.trim(), otpCode.trim());
      setToken(res.token);
      onSuccess?.();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setOtpSent(false);
    setOtpCode("");
    setPhone("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-earth-600/30 backdrop-blur-sm" aria-hidden />
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
          className="relative w-full max-w-sm rounded-xl border border-earth-200 bg-cream-50 shadow-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-modal-title"
        >
          <div className="flex items-center justify-between p-4 border-b border-earth-200/50">
            <h2 id="login-modal-title" className="font-serif text-lg font-medium text-earth-600">
              Log in
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 text-earth-400 hover:text-earth-600 rounded focus:outline-none focus:ring-2 focus:ring-earth-400"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4 space-y-4">
            {!hasApi ? (
              <p className="text-sm text-earth-500">
                Login is available at checkout when the API is configured.
              </p>
            ) : !otpSent ? (
              <>
                <p className="text-sm text-earth-600">Enter your 10-digit mobile number to receive an OTP.</p>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className={inputClass}
                  aria-describedby={error ? "login-modal-error" : undefined}
                  autoFocus
                />
                <Button variant="primary" size="md" className="w-full" onClick={handleRequestOtp} disabled={loading}>
                  {loading ? "Sending…" : "Send OTP"}
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-earth-500">OTP sent to {phone}.</p>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  className={inputClass}
                  aria-describedby={error ? "login-modal-error" : undefined}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="md"
                    className="flex-1"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode("");
                      setError("");
                    }}
                  >
                    Change number
                  </Button>
                  <Button variant="primary" size="md" className="flex-1" onClick={handleVerifyOtp} disabled={loading}>
                    {loading ? "Verifying…" : "Verify"}
                  </Button>
                </div>
              </>
            )}
            {error && (
              <p id="login-modal-error" className="text-sm text-red-600" role="alert" aria-live="polite">
                {error}
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
