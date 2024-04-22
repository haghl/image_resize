import React, { useState } from "react";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

function ImageCropper() {
  const [src, setSrc] = useState<string | null>(null);
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [crop, setCrop] = useState<Crop>({
    unit: "%", // 백분율 단위로 크롭 설정
    width: 50,
    height: 50,
    x: 25,
    y: 25,
  });
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const reader = new FileReader();
      reader.onloadend = () => setSrc(reader.result as string);
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  const onWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (imageRef) {
      const scaleX = imageRef.naturalWidth / imageRef.width;
      const newWidth = parseInt(e.target.value, 10);
      setWidth(newWidth.toString());
      setCrop((prevCrop) => ({ ...prevCrop, width: newWidth / scaleX }));
    }
  };

  const onHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (imageRef) {
      const scaleY = imageRef.naturalHeight / imageRef.height;
      const newHeight = parseInt(e.target.value, 10);
      setHeight(newHeight.toString());
      setCrop((prevCrop) => ({ ...prevCrop, height: newHeight / scaleY }));
    }
  };

  const onCropComplete = (crop: Crop) => {
    if (src && crop.width && crop.height) {
      const croppedImageUrl = getCroppedImg(imageRef!, crop);
      setCroppedImageUrl(croppedImageUrl); // 저장된 크롭 이미지 URL을 상태로 설정
    }
  };

  const onCropChange = (crop: Crop) => {
    if (imageRef) {
      const scaleX = imageRef.naturalWidth / imageRef.width;
      const scaleY = imageRef.naturalHeight / imageRef.height;
      setWidth((crop.width * scaleX).toString());
      setHeight((crop.height * scaleY).toString());
      console.log(crop);

      setCrop(crop);
    }
  };

  const getCroppedImg = (image: HTMLImageElement, crop: Crop): string => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width! * scaleX;
    canvas.height = crop.height! * scaleY;
    const ctx = canvas.getContext("2d")!;

    ctx.drawImage(image, crop.x! * scaleX, crop.y! * scaleY, crop.width! * scaleX, crop.height! * scaleY, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/jpeg");
  };

  const handleDownload = () => {
    if (imageRef && crop.width && crop.height) {
      const canvasUrl = getCroppedImg(imageRef, crop);
      const link = document.createElement("a");
      link.href = canvasUrl;
      link.download = "cropped-image.jpeg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", columnGap: "20px", justifyContent: "center" }}>
        <label htmlFor="imageCrop" style={{ flex: 1, padding: "10px", display: "block", border: "3px solid green", borderRadius: "20px", fontSize: "20px" }}>
          이미지 선택하기
        </label>
        <input id="imageCrop" type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />

        {croppedImageUrl && (
          <button style={{ borderRadius: "20px", border: "3px solid red" }} onClick={handleDownload}>
            다운로드
          </button>
        )}
      </div>
      {src && (
        <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", rowGap: "10px" }}>
          <div>
            <label>가로:</label>
            <input type="number" value={width} onChange={onWidthChange} />
          </div>
          <div>
            <label>세로:</label>
            <input type="number" value={height} onChange={onHeightChange} />
          </div>
          <ReactCrop crop={crop} onComplete={onCropComplete} onChange={onCropChange}>
            <img src={src} onLoad={(e) => setImageRef(e.currentTarget)} />
          </ReactCrop>
        </div>
      )}
    </div>
  );
}

export default ImageCropper;
