import imageCompression from "browser-image-compression";
import { ChangeEvent, useState } from "react";
import "./App.css";
import JSZip from "jszip";
import { saveAs } from "file-saver";

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [userWidth, setUserWidth] = useState<number>(682);
  const [userHeight, setUserHeight] = useState<number>(763);
  const [outputType, setOutputType] = useState<string>("image/png");
  const [loading, setLoading] = useState<boolean>(false);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files ? Array.from(event.target.files) : [];
    setFiles(uploadedFiles);
  };

  const handleDownload = async () => {
    const zip = new JSZip();
    const promises = files.map(async (file) => {
      const options = {
        maxWidthOrHeight: Math.max(userWidth, userHeight),
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      zip.file(file.name.replace(/\.\w+$/, "") + outputType.replace("image/", "."), compressedFile);
    });

    // 모든 파일이 압축되고 ZIP에 추가된 후 ZIP 파일을 생성하고 저장합니다.
    setLoading(true);
    Promise.all(promises)
      .then(async () => {
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "images.zip");
      })
      .catch((error) => {
        console.error("Error compressing and downloading images:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <h1>이미지 변환</h1>
      <div className="card">
        <div>
          <input type="file" multiple style={{ marginBottom: "20px" }} accept="image/*" onChange={handleImageUpload} />
          <select value={outputType} onChange={(e) => setOutputType(e.target.value)}>
            <option value="image/png">PNG</option>
            <option value="image/jpeg">JPEG</option>
          </select>
          <div style={{ display: "flex" }}>
            <label style={{ width: "90px", textAlign: "left" }}>가로 사이즈</label>
            <input type="number" style={{ flex: 1 }} value={userWidth} onChange={(e) => setUserWidth(parseInt(e.target.value, 10))} />
          </div>
          <div style={{ display: "flex" }}>
            <label style={{ width: "90px", textAlign: "left" }}>세로 사이즈</label>
            <input type="number" style={{ flex: 1 }} value={userHeight} onChange={(e) => setUserHeight(parseInt(e.target.value, 10))} />
          </div>

          {loading && <p>잠시만 기다려주세요</p>}

          {files.length > 0 && (
            <button style={{ marginTop: "10px" }} onClick={handleDownload} disabled={loading}>
              다운로드
            </button>
          )}
        </div>
        <p>이미지를 선택해주세요.</p>
      </div>
    </>
  );
}

export default App;
