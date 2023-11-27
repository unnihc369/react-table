import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const columns = [
  { field: "city", headerName: "City", width: 150 },
  { field: "state", headerName: "State", width: 150 },
  { field: "country", headerName: "Country", width: 150 },
  { field: "postcode", headerName: "Postcode", width: 150 },
  { field: "streetNumber", headerName: "Street Number", width: 150 },
  { field: "name", headerName: "Name", width: 150 },
  { field: "latitude", headerName: "Latitude", width: 150 },
  { field: "longitude", headerName: "Longitude", width: 150 },
];

const fetchData = async () => {
  const response = await fetch("https://randomuser.me/api/?results=20");
  const data = await response.json();
  return data.results.map((result, index) => ({
    id: index + 1,
    city: result.location.city,
    state: result.location.state,
    country: result.location.country,
    postcode: result.location.postcode,
    streetNumber: result.location.street.number,
    name: `${result.name.title} ${result.name.first} ${result.name.last}`,
    latitude: result.location.coordinates.latitude,
    longitude: result.location.coordinates.longitude,
  }));
};

const TableWithSearchAndPDF = () => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchData();
      setRows(data);
    };

    getData();
  }, []);

  const downloadAsPDF = () => {
    const grid = document.getElementById("data-grid");

    html2canvas(grid).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");
      pdf.addImage(imgData, "PNG", 10, 10, 280, 150);
      pdf.save("table.pdf");
    });
  };

  const downloadAsCSV = () => {
    const csv = Papa.unparse(rows, {
      header: true,
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "table.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="container">
      <button className="button" onClick={downloadAsPDF}>
        Download as PDF
      </button>
      <button className="button" onClick={downloadAsCSV}>
        Download as CSV
      </button>
      <div id="data-grid">
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </div>
    </div>
  );
};

export default TableWithSearchAndPDF;
