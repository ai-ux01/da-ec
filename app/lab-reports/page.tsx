"use client";

import { motion } from "framer-motion";
import { Section, SectionHeading } from "@/components/ui/Section";
import { labReports } from "@/lib/mockData";

export default function LabReportsPage() {
  return (
    <div className="pt-16 sm:pt-20">
      <Section className="py-16 sm:py-24">
        <SectionHeading
          title="Lab Reports"
          subtitle="Every batch is tested. Download the full report for any batch below."
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-x-auto border border-earth-200/60 rounded-lg"
        >
          <table className="w-full min-w-[400px] text-left">
            <thead>
              <tr className="border-b border-earth-200/60 bg-cream-100/50">
                <th className="px-5 py-4 font-serif text-sm font-medium text-earth-600">
                  Batch ID
                </th>
                <th className="px-5 py-4 font-serif text-sm font-medium text-earth-600">
                  Date
                </th>
                <th className="px-5 py-4 font-serif text-sm font-medium text-earth-600">
                  Summary
                </th>
                <th className="px-5 py-4 font-serif text-sm font-medium text-earth-600">
                  Report
                </th>
              </tr>
            </thead>
            <tbody>
              {labReports.map((report, i) => (
                <motion.tr
                  key={report.batchId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.08 }}
                  className="border-b border-earth-200/40 last:border-0 hover:bg-cream-100/30 transition-colors"
                >
                  <td className="px-5 py-4 text-sm font-medium text-earth-600">
                    {report.batchId}
                  </td>
                  <td className="px-5 py-4 text-sm text-earth-400">
                    {report.date}
                  </td>
                  <td className="px-5 py-4 text-sm text-earth-400">
                    {report.summary}
                  </td>
                  <td className="px-5 py-4">
                    <a
                      href={report.pdfUrl}
                      className="text-sm text-earth-600 underline underline-offset-2 hover:text-earth-500 transition-colors"
                    >
                      View PDF
                    </a>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
        <p className="mt-6 text-sm text-earth-300">
          Reports are uploaded within 48 hours of batch completion. For
          questions, contact us.
        </p>
      </Section>
    </div>
  );
}
