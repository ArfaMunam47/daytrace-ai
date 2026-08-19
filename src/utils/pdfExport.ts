import { jsPDF } from 'jspdf';
import { WeeklyReviewData, MonthlyReviewData, UserProfile } from '../types';

export const generateWeeklyReportPDF = exportWeeklyReportPDF;
export const generateMonthlyReportPDF = exportMonthlyReportPDF;

export function exportWeeklyReportPDF(
  report: WeeklyReviewData,
  profile: UserProfile
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header background bar
  doc.setFillColor(24, 24, 27); // zinc-900
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('DAYTRACE — WEEKLY ACCOUNTABILITY & MENTOR REPORT', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(212, 212, 216);
  doc.text(`Week: ${report.weekStart} to ${report.weekEnd}  |  User: ${profile.name} (${profile.occupation})`, 14, 18);

  y = 32;

  // Key Metrics Banner (Box)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 26, 2, 2, 'FD');

  const focusHrs = (report.totalFocusMinutes / 60).toFixed(1);
  const plannedHrs = (report.plannedFocusMinutes / 60).toFixed(1);
  const distractHrs = (report.distractionMinutes / 60).toFixed(1);
  const respHrs = (report.responsibilityMinutes / 60).toFixed(1);

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);

  const colWidth = (pageWidth - 28) / 4;
  
  // Col 1
  doc.text('FOCUS TIME', 18, y + 8);
  doc.setFontSize(13);
  doc.setTextColor(16, 185, 129); // emerald
  doc.text(`${focusHrs}h`, 18, y + 16);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Planned: ${plannedHrs}h`, 18, y + 21);

  // Col 2
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('EXECUTION RATE', 18 + colWidth, y + 8);
  doc.setFontSize(13);
  doc.setTextColor(59, 130, 246);
  doc.text(`${report.executionPercentage}%`, 18 + colWidth, y + 16);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`${report.completedTasksCount} done, ${report.unfinishedTasksCount} moved`, 18 + colWidth, y + 21);

  // Col 3
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('DISTRACTION TIME', 18 + colWidth * 2, y + 8);
  doc.setFontSize(13);
  doc.setTextColor(239, 68, 68);
  doc.text(`${distractHrs}h`, 18 + colWidth * 2, y + 16);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Tracked sessions`, 18 + colWidth * 2, y + 21);

  // Col 4
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('RESPONSIBILITIES', 18 + colWidth * 3, y + 8);
  doc.setFontSize(13);
  doc.setTextColor(139, 92, 246);
  doc.text(`${respHrs}h`, 18 + colWidth * 3, y + 16);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Family & Chores`, 18 + colWidth * 3, y + 21);

  y += 34;

  // AI Mentor Review Section
  if (report.aiMentorReport) {
    const ai = report.aiMentorReport;
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, y, pageWidth - 28, 12, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`HONEST AI MENTOR EVALUATION  —  SCORE: ${ai.score}/100 (${ai.scoreGrade})`, 18, y + 8);
    y += 18;

    // Summary
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const summaryLines = doc.splitTextToSize(`"${ai.summary}"`, pageWidth - 28);
    doc.text(summaryLines, 14, y);
    y += summaryLines.length * 4.5 + 4;

    // Reality Check
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('Reality Check:', 14, y);
    y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const realityLines = doc.splitTextToSize(ai.realityCheck, pageWidth - 28);
    doc.text(realityLines, 14, y);
    y += realityLines.length * 4 + 4;

    // Wins & Problems side by side or stacked
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(16, 185, 129);
    doc.text('Key Wins (Evidence-Based):', 14, y);
    y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    (ai.wins || []).forEach((w) => {
      const line = doc.splitTextToSize(`• ${w}`, pageWidth - 28);
      doc.text(line, 16, y);
      y += line.length * 3.8;
    });
    y += 3;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(225, 29, 72);
    doc.text('Identified Friction Points & Blindspots:', 14, y);
    y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    (ai.problems || []).forEach((p) => {
      const line = doc.splitTextToSize(`• ${p}`, pageWidth - 28);
      doc.text(line, 16, y);
      y += line.length * 3.8;
    });
    y += 3;

    // Recommendations
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(79, 70, 229);
    doc.text('Actionable Recommendations for Next Week:', 14, y);
    y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    (ai.recommendations || []).forEach((rec, idx) => {
      const line = doc.splitTextToSize(`${idx + 1}. ${rec}`, pageWidth - 28);
      doc.text(line, 16, y);
      y += line.length * 3.8;
    });
    y += 3;

    if (ai.nextWeekFocus) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`Strategic Focus: ${ai.nextWeekFocus}`, 14, y);
      y += 6;
    }
  }

  // Footer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated by DayTrace — "Plan less. Do more. Know where your time went." | ${new Date().toLocaleDateString()}`, 14, 287);

  doc.save(`DayTrace-Weekly-Report-${report.weekStart}.pdf`);
}

export function exportMonthlyReportPDF(
  report: MonthlyReviewData,
  profile: UserProfile
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header background bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('DAYTRACE — MONTHLY PERFORMANCE & GROWTH RECORD', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(`Month: ${report.monthStr}  |  User: ${profile.name} (${profile.occupation})`, 14, 18);

  y = 32;

  // Metrics Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 26, 2, 2, 'FD');

  const colWidth = (pageWidth - 28) / 4;

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);

  // Col 1
  doc.text('TOTAL FOCUS', 18, y + 8);
  doc.setFontSize(13);
  doc.setTextColor(16, 185, 129);
  doc.text(`${report.totalFocusHours.toFixed(1)}h`, 18, y + 16);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Deep productive output`, 18, y + 21);

  // Col 2
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('HABIT CONSISTENCY', 18 + colWidth, y + 8);
  doc.setFontSize(13);
  doc.setTextColor(59, 130, 246);
  doc.text(`${report.habitConsistencyAvg}%`, 18 + colWidth, y + 16);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Monthly average`, 18 + colWidth, y + 21);

  // Col 3
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('RESPONSIBILITIES', 18 + colWidth * 2, y + 8);
  doc.setFontSize(13);
  doc.setTextColor(139, 92, 246);
  doc.text(`${report.responsibilityHours.toFixed(1)}h`, 18 + colWidth * 2, y + 16);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Chores & Family`, 18 + colWidth * 2, y + 21);

  // Col 4
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('DISTRACTION', 18 + colWidth * 3, y + 8);
  doc.setFontSize(13);
  doc.setTextColor(239, 68, 68);
  doc.text(`${report.distractionHours.toFixed(1)}h`, 18 + colWidth * 3, y + 16);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Logged overages`, 18 + colWidth * 3, y + 21);

  y += 34;

  if (report.aiMentorReport) {
    const ai = report.aiMentorReport;
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, y, pageWidth - 28, 12, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`MONTHLY AI MENTOR SYNTHESIS  —  SCORE: ${ai.score}/100 (${ai.scoreGrade})`, 18, y + 8);
    y += 18;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const summaryLines = doc.splitTextToSize(`"${ai.summary}"`, pageWidth - 28);
    doc.text(summaryLines, 14, y);
    y += summaryLines.length * 4.5 + 4;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('Long-Term Growth Reality Check:', 14, y);
    y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const realityLines = doc.splitTextToSize(ai.realityCheck, pageWidth - 28);
    doc.text(realityLines, 14, y);
    y += realityLines.length * 4 + 4;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(16, 185, 129);
    doc.text('Key Monthly Milestones & Wins:', 14, y);
    y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    (ai.wins || []).forEach((w) => {
      const line = doc.splitTextToSize(`• ${w}`, pageWidth - 28);
      doc.text(line, 16, y);
      y += line.length * 3.8;
    });
    y += 3;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(79, 70, 229);
    doc.text('Strategic Focus for Coming Month:', 14, y);
    y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    (ai.recommendations || []).forEach((rec, idx) => {
      const line = doc.splitTextToSize(`${idx + 1}. ${rec}`, pageWidth - 28);
      doc.text(line, 16, y);
      y += line.length * 3.8;
    });
  }

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated by DayTrace — "Plan less. Do more. Know where your time went." | ${new Date().toLocaleDateString()}`, 14, 287);

  doc.save(`DayTrace-Monthly-Report-${report.monthStr}.pdf`);
}
