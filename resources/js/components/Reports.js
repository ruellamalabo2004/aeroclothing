import React, { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const componentRef = useRef(); // Ref for printing

  // Fetch reports from API (using dummy data for now)
  useEffect(() => {
    const dummyReports = [
      {
        id: 1,
        name: "Sales Summary",
        date: "2025-03-01",
        details: "Monthly sales data",
      },
      {
        id: 2,
        name: "Customer Feedback",
        date: "2025-03-02",
        details: "Customer satisfaction survey",
      },
    ];
    setReports(dummyReports);

    // Uncomment to fetch from API
    /*
    fetch("http://127.0.0.1:8000/api/reports")
      .then((res) => res.json())
      .then((data) => setReports(data))
      .catch((error) => console.error("Error fetching reports:", error));
    */
  }, []);

  // Print functionality
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  // Save as PDF functionality
  const handleSavePDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [["ID", "Report Name", "Date", "Details"]],
      body: reports.map((report) => [
        report.id,
        report.name,
        report.date,
        report.details,
      ]),
      startY: 20,
    });
    doc.save("report.pdf");
  };

  return (
    <main>
      <h1>Reports</h1>
      <div className="reports-actions">
        <button className="reports-print-btn" onClick={handlePrint}>
          Print
        </button>
        <button className="reports-save-btn" onClick={handleSavePDF}>
          Save as PDF
        </button>
      </div>
      <div className="reports-table-container" ref={componentRef}>
        <table className="reports-table">
          <thead>
            <tr>
              <th>Actions</th>
              <th>Report Name</th>
              <th>Date</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>
                  <img
                    src="/imgs/view.svg"
                    alt="View"
                    className="action-img"
                    onClick={() => alert("View functionality TBD")} // Placeholder for view action
                  />
                </td>
                <td>{report.name}</td>
                <td>{report.date}</td>
                <td>{report.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}