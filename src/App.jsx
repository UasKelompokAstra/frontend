import { useState } from "react";
import "./App.css";

const API_URL = "https://web-production-6dc474.up.railway.app";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setResult(null);
    setError(null);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Pilih gambar terlebih dahulu!");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // 🔥 Tangkap error dari backend
        throw new Error(data.error || "Gagal melakukan prediksi");
      }

      setResult(data);
    } catch (err) {
      console.error("Prediction error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getResultClass = (cls) => {
    switch (cls) {
      case "biological": return "result-card result-biological";
      case "glass": return "result-card result-glass";
      case "paper": return "result-card result-paper";
      case "plastic": return "result-card result-plastic";
      default: return "result-card";
    }
  };

  return (
    <div className="container">
      <h1>Deteksi Jenis Sampah</h1>

      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit" disabled={loading}>
          {loading ? "Memproses..." : "Prediksi"}
        </button>
      </form>

      {preview && <img src={preview} alt="Preview" className="preview" />}

      {loading && <div className="loader"></div>}

      {error && (
        <div className="error-box">
          ❌ {error}
        </div>
      )}

      {result && !loading && (
        <div className={getResultClass(result.predicted_class)}>
          <h2>Hasil Prediksi</h2>
          <p><strong>Jenis Sampah:</strong> {result.predicted_class}</p>
          <p>
            <strong>Tingkat Kepastian:</strong>{" "}
            {(result.confidence * 100).toFixed(2)}%
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
