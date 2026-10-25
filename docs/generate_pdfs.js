const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const reports = [
  {
    title: 'Full Stack Web Development',
    subject: 'Full Stack Web Development (Modules 1, 2 & 3)',
    mdFile: 'FullStackWebDevelopment_Report.md',
    pdfFile: 'FullStackWebDevelopment_Report.pdf',
    accentColor: '#10B981'
  },
  {
    title: 'Back-End Web Development',
    subject: 'Back-End Web Development (Modules 1, 2 & 3)',
    mdFile: 'BackEndWebDevelopment_Report.md',
    pdfFile: 'BackEndWebDevelopment_Report.pdf',
    accentColor: '#3B82F6'
  },
  {
    title: 'Advanced Database Systems',
    subject: 'Advanced Database Systems (Modules 1, 2 & 3)',
    mdFile: 'AdvancedDatabaseSystems_Report.md',
    pdfFile: 'AdvancedDatabaseSystems_Report.pdf',
    accentColor: '#8B5CF6'
  }
];

function markdownToHtml(md, accentColor) {
  // Convert images
  let html = md
    .replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, src) => {
      const resolvedSrc = src.startsWith('..') ? path.resolve(__dirname, src) : src;
      const fileUrl = 'file:///' + resolvedSrc.replace(/\\/g, '/');
      return `<div class="img-container"><img src="${fileUrl}" alt="${alt}" /><p class="caption">${alt}</p></div>`;
    })
    // Convert code blocks
    .replace(/```([a-z]*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // Convert inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Convert bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Convert italic
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Convert headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Convert tables
  html = html.replace(/((?:\|[^\n]+\|\r?\n)+)/g, (tableText) => {
    const lines = tableText.trim().split(/\r?\n/).filter(l => l.includes('|'));
    if (lines.length < 2) return tableText;
    const headerCols = lines[0].split('|').map(s => s.trim()).filter(Boolean);
    const bodyRows = lines.slice(2);

    let tableHtml = '<table><thead><tr>';
    headerCols.forEach(h => { tableHtml += `<th>${h}</th>`; });
    tableHtml += '</tr></thead><tbody>';

    bodyRows.forEach(row => {
      const cols = row.split('|').map(s => s.trim()).filter(Boolean);
      tableHtml += '<tr>';
      cols.forEach(c => { tableHtml += `<td>${c}</td>`; });
      tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table>';
    return tableHtml;
  });

  // Convert paragraphs
  const paragraphs = html.split(/\n\s*\n/).map(block => {
    block = block.trim();
    if (!block) return '';
    if (block.startsWith('<h') || block.startsWith('<pre') || block.startsWith('<table') || block.startsWith('<div')) {
      return block;
    }
    return `<p>${block}</p>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>PlayArena Micro Project Report</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      font-size: 11pt;
    }
    h1 {
      font-size: 22pt;
      color: #0f172a;
      border-bottom: 3px solid ${accentColor};
      padding-bottom: 8px;
      margin-top: 0;
      margin-bottom: 12px;
    }
    h2 {
      font-size: 15pt;
      color: #0f172a;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 6px;
      margin-top: 24px;
      margin-bottom: 10px;
    }
    h3 {
      font-size: 12pt;
      color: ${accentColor};
      margin-top: 16px;
      margin-bottom: 6px;
    }
    p {
      margin-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 9.5pt;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 10px;
      text-align: left;
    }
    th {
      background: #f1f5f9;
      font-weight: 700;
      color: #0f172a;
    }
    tr:nth-child(even) {
      background: #f8fafc;
    }
    pre {
      background: #0f172a;
      color: #f8fafc;
      padding: 12px;
      border-radius: 6px;
      overflow-x: auto;
      font-size: 9pt;
      font-family: Consolas, 'Courier New', monospace;
      margin: 14px 0;
    }
    code {
      font-family: Consolas, 'Courier New', monospace;
      background: #f1f5f9;
      color: #0f172a;
      padding: 2px 4px;
      border-radius: 4px;
      font-size: 9pt;
    }
    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
    }
    .img-container {
      margin: 20px 0;
      text-align: center;
      page-break-inside: avoid;
    }
    .img-container img {
      max-width: 90%;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      border: 1px solid #cbd5e1;
    }
    .caption {
      font-size: 9pt;
      font-style: italic;
      color: #64748b;
      margin-top: 6px;
    }
  </style>
</head>
<body>
  ${paragraphs}
</body>
</html>`;
}

console.log('🚀 Starting PDF Report Generation using Microsoft Edge Headless...');

reports.forEach(r => {
  const mdPath = path.join(__dirname, 'reports', r.mdFile);
  const pdfPath = path.join(__dirname, 'reports', r.pdfFile);
  const tempHtmlPath = path.join(__dirname, 'reports', r.mdFile.replace('.md', '.temp.html'));

  if (!fs.existsSync(mdPath)) {
    console.error(`❌ File not found: ${mdPath}`);
    return;
  }

  const mdContent = fs.readFileSync(mdPath, 'utf8');
  const htmlContent = markdownToHtml(mdContent, r.accentColor);
  fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');

  try {
    const cmd = `"${edgePath}" --headless --disable-gpu --print-to-pdf="${pdfPath}" "${tempHtmlPath}"`;
    execSync(cmd, { stdio: 'pipe' });

    if (fs.existsSync(tempHtmlPath)) {
      fs.unlinkSync(tempHtmlPath);
    }

    const stats = fs.statSync(pdfPath);
    console.log(`✅ Generated: ${r.pdfFile} (${(stats.size / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.error(`❌ Failed to compile ${r.pdfFile}:`, err.message);
  }
});

console.log('✨ All PDF Reports Compiled Successfully!');
