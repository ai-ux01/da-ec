"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Section, SectionHeading } from "@/components/ui/Section";
import { fetchBatchesPublic, type BatchPublicApi, type LabReportApi } from "@/lib/api";
import { labReports as mockLabReports } from "@/lib/mockData";

type TableRow = {
  batchId: string;
  date: string;
  summary: string;
  reportUrl: string;
};

function batchToRows(batches: BatchPublicApi[]): TableRow[] {
  const rows: TableRow[] = [];
  for (const batch of batches) {
    const dateStr = batch.date.slice(0, 10);
    if (batch.labReports && batch.labReports.length > 0) {
      for (const report of batch.labReports as LabReportApi[]) {
        const summary = [
          report.fatPercent != null ? `Fat ${report.fatPercent}%` : null,
          report.antibioticPass ? "Antibiotic pass" : null,
        ]
          .filter(Boolean)
          .join(", ") || "—";
        rows.push({
          batchId: batch.batchId,
          date: dateStr,
          summary,
          reportUrl: report.reportUrl,
        });
      }
    } else {
      rows.push({
        batchId: batch.batchId,
        date: dateStr,
        summary: "—",
        reportUrl: "#",
      });
    }
  }
  return rows;
}

export default function LabReportsPage() {
  const reduceMotion = useReducedMotion();
  const [rows, setRows] = useState<TableRow[]>(() =>
    mockLabReports.map((r) => ({
      batchId: r.batchId,
      date: r.date,
      summary: r.summary,
      reportUrl: r.pdfUrl,
    }))
  );
  const [loading, setLoading] = useState(!!process.env.NEXT_PUBLIC_API_URL);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setError(null);
    fetchBatchesPublic()
      .then((batches) => {
        if (!cancelled) setRows(batchToRows(batches));
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load lab reports");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="pt-16 sm:pt-20">
      <Section className="py-16 sm:py-24">
        <SectionHeading
          title="Lab Reports"
          subtitle="Every batch is tested. Download the full report for any batch below."
        />
        {error && (
          <p className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
            {error} — showing sample data.
          </p>
        )}
        {loading ? (
          <p className="text-earth-400 text-sm">Loading lab reports…</p>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="overflow-x-auto border border-earth-200/60 rounded-lg"
          >
            <table className="w-full min-w-[400px] text-left" aria-describedby="lab-reports-desc">
              <caption id="lab-reports-desc" className="sr-only">
                Lab reports for each batch: Batch ID, Date, Summary, and link to Report PDF.
              </caption>
              <thead>
                <tr className="border-b border-earth-200/60 bg-cream-100/50">
                  <th scope="col" className="px-5 py-4 font-serif text-sm font-medium text-earth-600">
                    Batch ID
                  </th>
                  <th scope="col" className="px-5 py-4 font-serif text-sm font-medium text-earth-600">
                    Date
                  </th>
                  <th scope="col" className="px-5 py-4 font-serif text-sm font-medium text-earth-600">
                    Summary
                  </th>
                  <th scope="col" className="px-5 py-4 font-serif text-sm font-medium text-earth-600">
                    Report
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <motion.tr
                    key={`${row.batchId}-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: reduceMotion ? 0 : i * 0.03 }}
                    className="border-b border-earth-200/40 last:border-0 hover:bg-cream-100/30 transition-colors"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-earth-600">
                      {row.batchId}
                    </td>
                    <td className="px-5 py-4 text-sm text-earth-400">{row.date}</td>
                    <td className="px-5 py-4 text-sm text-earth-400">{row.summary}</td>
                    <td className="px-5 py-4">
                      <a
                        href={row.reportUrl}
                        className="text-sm text-earth-600 underline underline-offset-2 hover:text-earth-500 transition-colors"
                        target={row.reportUrl.startsWith("http") ? "_blank" : undefined}
                        rel={row.reportUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                      >
                        View PDF
                      </a>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
        <p className="mt-6 text-sm text-earth-300">
          Reports are uploaded within 48 hours of batch completion. For
          questions, contact us.
        </p>
      </Section>
    </div>
  );
}
