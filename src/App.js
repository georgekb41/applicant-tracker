import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function App() {
  const [file, setFile] = useState(null);
  const [applicants, setApplicants] = useState([]);

  const requiredFields = [
    'Passport',
    'Unofficial Transcripts',
    'Proof of Funding',
    'Financial Affidavit',
    'Official Transcipt Evaluation (ECE)',
    'Intent To Enroll'
  ];

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const processedApplicants = jsonData.map(row => {
        const name = row['Preferred Name'] || \`\${row['First Name']} \${row['Last Name']}\`;
        const email = row['Email'] || '';
        const missing = requiredFields.filter(field => {
          const value = String(row[field] || '').trim().toLowerCase();
          return value !== 'yes';
        });

        return { name, email, missing };
      }).filter(applicant => applicant.missing.length > 0);

      setApplicants(processedApplicants);
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const generateEmail = (name, email, missing) => {
    return \`To: \${email}\nSubject: Your Application to SBU – Missing Documents\n\nDear \${name},\n\nThank you for your application to Southwest Baptist University. To complete your file, we still need the following:\n\n\${missing.map(item => \`- \${item}\`).join('\n')}\n\nYou can upload these via your application portal.\n\nPlease complete these items as soon as possible so we can move forward with your I-20.\n\nIn Christ,\nKenny George\`;
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>📋 STEM Graduate Applicant Tracker</h1>
      <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
      <hr />
      <h2>Applicants Missing Documents</h2>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Missing Items</th>
            <th>Email Preview</th>
          </tr>
        </thead>
        <tbody>
          {applicants.map((app, idx) => (
            <tr key={idx}>
              <td>{app.name}</td>
              <td>{app.email}</td>
              <td>{app.missing.join(', ')}</td>
              <td><pre>{generateEmail(app.name, app.email, app.missing)}</pre></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
