import { useState, useEffect } from "react";
import {
  Box,
  Select,
  MenuItem,
  CircularProgress,
  Typography,
} from "@mui/material";
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

const fetchData = async (numResults) => {
  try {
    const response = await fetch(
      `https://randomuser.me/api/?results=${numResults}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch data");
    }

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
  } catch (error) {
    throw new Error(`Error fetching data: ${error.message}`);
  }
};

const App = () => {
  const [rows, setRows] = useState([]);
  const [numResults, setNumResults] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchData(numResults);
        setRows(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [numResults]);

  const downloadAsPDF = () => {
    const grid = document.getElementById("data-grid");

    html2canvas(grid).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");
      pdf.addImage(imgData, "PNG", 10, 10, 280, 150);
      pdf.save("table.pdf");
    });
  };

  return (
    <div className="container">
      <Box sx={{ marginBottom: 2 }}></Box>
      <div className="flex">
        <button className="button" onClick={downloadAsPDF} disabled={loading}>
          Download as PDF
        </button>
        <Select
          value={numResults}
          onChange={(e) => setNumResults(Number(e.target.value))}
          disabled={loading}
        >
          <MenuItem value={20}>20 Users</MenuItem>
          <MenuItem value={50}>50 Users</MenuItem>
        </Select>
      </div>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      ) : (
        <Box id="data-grid">
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            className="data-rows"
          />
        </Box>
      )}
    </div>
  );
};

export default App;
