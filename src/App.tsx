import { ChangeEvent, useState } from "react";
import imageCompression from "browser-image-compression";
import "./App.css";

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [userWidth, setUserWidth] = useState<number>(682);
  const [userHeight, setUserHeight] = useState<number>(763);
  const [outputType, setOutputType] = useState<string>("image/png");

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files ? Array.from(event.target.files) : [];
    setFiles(uploadedFiles);
  };

  const handleDownload = async () => {
    for (const file of files) {
      const img = new Image();
      img.onload = async () => {
        const aspectRatio = img.width / img.height;
        let maxWidthOrHeight = userWidth;

        if (aspectRatio >= 1 && img.width > userWidth) {
          maxWidthOrHeight = userWidth;
        } else if (img.height > userHeight) {
          maxWidthOrHeight = userHeight;
        }

        const options = {
          maxWidthOrHeight: maxWidthOrHeight,
          useWebWorker: true,
        };

        try {
          const compressedFile = await imageCompression(file, options);
          downloadFile(compressedFile, file.name);
        } catch (error) {
          console.error("Error compressing the image:", error);
        }
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const downloadFile = (compressedFile: Blob, fileName: string) => {
    const url = URL.createObjectURL(compressedFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.replace(/\.\w+$/, "") + outputType.replace("image/", "."); // 파일 확장자 변경
    document.body.appendChild(a);
    a.click();
    a.remove();
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
            <option value="image/webp">WEBP</option>
          </select>
          <div style={{ display: "flex" }}>
            <label style={{ width: "90px", textAlign: "left" }}>가로 사이즈</label>
            <input type="number" style={{ flex: 1 }} value={userWidth} onChange={(e) => setUserWidth(parseInt(e.target.value, 10))} />
          </div>
          <div style={{ display: "flex" }}>
            <label style={{ width: "90px", textAlign: "left" }}>세로 사이즈</label>
            <input type="number" style={{ flex: 1 }} value={userHeight} onChange={(e) => setUserHeight(parseInt(e.target.value, 10))} />
          </div>

          {files.length > 0 && (
            <button style={{ marginTop: "10px" }} onClick={handleDownload}>
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
