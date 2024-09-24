const express = require("express");
const puppeteer = require("puppeteer");
const path = require("path");
const router = express.Router();
const fs = require("fs");
const axios = require("axios");

async function captureHTMLToImage(htmlContent, outputPath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // HTML 콘텐츠 설정
  await page.setContent(htmlContent);

  // 페이지의 실제 콘텐츠 크기 가져오기
  const contentDimensions = await page.evaluate(() => {
    const element = document.querySelector("div"); // 스크린샷을 찍을 HTML 요소 선택
    const { width, height } = element.getBoundingClientRect();
    console.log("가로:: ", width);
    console.log("세로:: ", height);
    return { width, height };
  });

  // 콘텐츠 크기에 맞게 뷰포트 설정
  await page.setViewport({
    width: Math.ceil(contentDimensions.width),
    height: Math.ceil(contentDimensions.height)
  });

  // 스크린샷 캡처 및 이미지 저장
  await page.screenshot({ path: outputPath });

  // 브라우저 닫기
  await browser.close();
}

router.post("/", async (req, res) => {
  const { htmlContent, outputFileName } = req.body;
  console.log("받아온내용:: ", htmlContent); //base64로 받아옴
  console.log("outputFileName:: ", outputFileName);

  if (!htmlContent || !outputFileName) {
    return res
      .status(400)
      .send("HTML content and output file name are required");
  }

  const base64Data = htmlContent.replace(/^data:image\/png;base64,/, "");

  // 이미지 파일 경로 설정
  // const filePath = path.join(__dirname, outputFileName); //__dirname이게 현재실행되는파일의 경로를 지정해주시는 시발 기본변수같은거
  const saveDirectory = "C:/Users/Rainbow Brain/Downloads/";
  const filePath = path.join(saveDirectory, outputFileName);

  // base64 데이터를 파일로 저장
  fs.writeFile(filePath, base64Data, { encoding: "base64" }, (err) => {
    if (err) {
      console.error("Error saving the file:", err);
      return res.status(500).send("Error saving the file");
    }
    // res.send("File saved successfully");
    res.status(200).json({ message: "이미지 저장 성공" });
  });

  // const outputPath = path.join(__dirname, "../public", outputFileName);

  // try {
  //   await captureHTMLToImage(htmlContent, outputPath);
  //   res.sendFile(outputPath);
  // } catch (error) {
  //   console.error("오류 발생:", error);
  //   res.status(500).send("이미지 캡처 실패");
  // }
});

router.post("/saveselecte", async (req, res) => {
  console.log("선택이미지저장시작");
  // const selectedUrl =
  //   "https://oaidalleapiprodscus.blob.core.windows.net/private/org-AbwPMQz0pBtsD9LWmYjKBKF6/user-CjxSX5jA40rjmcrMhEue4lji/img-S293imzSZvGSiPoCkFTG73YX.png?st=2024-09-06T00%3A05%3A19Z&se=2024-09-06T02%3A05%3A19Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=d505667d-d6c1-4a0a-bac7-5c84a87759f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-09-05T22%3A08%3A57Z&ske=2024-09-06T22%3A08%3A57Z&sks=b&skv=2024-08-04&sig=AbNO%2BFrmzYvukGVP81v3RGsGT6qxg4ZyTazrinHAar4%3D";
  const { imageUrl } = req.body;

  const saveDirectory = "C:/aaa/images";
  const outputFileName = "selectedimage.png"; // 저장할 파일 이름
  const filePath = path.join(saveDirectory, outputFileName); // 경로 결합

  try {
    const response = await axios({
      url: imageUrl,
      method: "GET",
      responseType: "stream"
    });

    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    writer.on("finish", () => {
      console.log("이미지 저장 완료");

      // 저장 경로와 파일명을 합쳐서 location 키로 리턴
      //// const location = path.join(saveDirectory, outputFileName);
      // const location = path.join(outputFileName);
      // console.log("저장완료 위치반환 :: ", location);
      // res.status(200).json({ message: "이미지 저장 성공", location });

      // base64로 리턴
      const imageBuffer = fs.readFileSync(filePath);
      const base64Image = imageBuffer.toString("base64");
      res.status(200).json({ message: "이미지 저장 성공", base64Image });
    });

    writer.on("error", (err) => {
      console.error("파일 쓰기 중 오류 발생:", err);
      res.status(500).send("이미지 저장 실패");
    });
  } catch (error) {
    console.error("이미지 다운로드 중 오류 발생:", error);
    res.status(500).send("이미지 다운로드 실패");
  }
});

module.exports = router;
